use crate::*;

#[cfg(test)]
#[path = "texture_crop_tests.rs"]
mod tests;

/// Integer texels in the selected mip, measured from its lower-left corner.
/// Mip selection never implicitly scales or rounds a Sprite's fractional rect.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TextureRect {
    pub x: u32,
    pub y: u32,
    pub width: u32,
    pub height: u32,
}

#[derive(Clone, Debug)]
pub struct CropLimits {
    pub max_dimension: u32,
    pub output_bytes: u64,
    pub decoded_blocks: u64,
    /// Encoded row buffer only; the fixed decoded-block scratch is 64 bytes.
    pub temporary_bytes: u64,
}
impl Default for CropLimits {
    fn default() -> Self {
        Self {
            max_dimension: 8192,
            output_bytes: 16 * 1024 * 1024,
            decoded_blocks: 262_144,
            temporary_bytes: 32 * 1024,
        }
    }
}

/// Identity of these immutable bytes, not a persistent content digest or a new
/// authority token. ObjectKey is index-scoped. SourceStamp has A1's observable
/// mutation guarantees; persistent caches still need a reviewed hash manifest.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TextureCropIdentity {
    pub texture: ObjectKey,
    pub assets: SourceStamp,
    pub pixels: SourceStamp,
    pub mip: u32,
    pub source_rect: TextureRect,
    pub format: i32,
    pub mip_width: u64,
    pub mip_height: u64,
    /// Bump if the pinned decode, orientation or reserved-prefix policy changes.
    pub decode_revision: u32,
}

/// Straight RGBA8, tightly packed, top-left output rows. No gamma conversion,
/// premultiplication, polygon clipping, mask/shader or scene interpretation.
/// No partial output is returned on failure. Owns its bytes after inputs close.
#[derive(Debug)]
pub struct TextureCrop {
    identity: TextureCropIdentity,
    rgba: Vec<u8>,
}
impl TextureCrop {
    pub fn identity(&self) -> &TextureCropIdentity {
        &self.identity
    }
    pub fn rgba(&self) -> &[u8] {
        &self.rgba
    }
}

pub(crate) struct Plan {
    first_x: u64,
    first_y: u64,
    columns: u64,
    rows: u64,
    stride: u64,
    pub(crate) row_bytes: usize,
    pub(crate) output_bytes: usize,
    end_x: u64,
    end_y: u64,
}
impl Plan {
    fn new(mip: &MipRange, rect: TextureRect, block_bytes: u64, l: &CropLimits) -> Result<Self> {
        let (x, y, width, height) = (
            u64::from(rect.x),
            u64::from(rect.y),
            u64::from(rect.width),
            u64::from(rect.height),
        );
        let end_x = add(x, width)?;
        let end_y = add(y, height)?;
        if width == 0 || height == 0 || end_x > mip.width || end_y > mip.height {
            return Err(Error::Corrupt("texture crop bounds"));
        }
        let first_x = x / 4;
        let first_y = y / 4;
        let columns = add(end_x, 3)? / 4 - first_x;
        let rows = add(end_y, 3)? / 4 - first_y;
        let output = mul(mul(width, height)?, 4)?;
        let blocks = mul(columns, rows)?;
        let row_bytes = mul(columns, block_bytes)?;
        let stride = mul(add(mip.width, 3)? / 4, block_bytes)?;
        // Validate the last touched row against the selected mip before any
        // pixel allocation or I/O, including partial edge blocks.
        let last = add(
            mul(add(first_y, rows - 1)?, stride)?,
            mul(first_x, block_bytes)?,
        )?;
        span(last, row_bytes, mip.range.end - mip.range.start)?;
        if output > l.output_bytes {
            return Err(Error::Limit("crop output bytes"));
        }
        if blocks > l.decoded_blocks {
            return Err(Error::Limit("crop decoded blocks"));
        }
        if row_bytes > l.temporary_bytes {
            return Err(Error::Limit("crop temporary bytes"));
        }
        Ok(Self {
            first_x,
            first_y,
            columns,
            rows,
            stride,
            row_bytes: usize_of(row_bytes)?,
            output_bytes: usize_of(output)?,
            end_x,
            end_y,
        })
    }
}

pub(crate) fn zeroed(n: usize, mut work: Option<&mut Work>) -> Result<Vec<u8>> {
    if let Some(w) = work.as_deref_mut() {
        w.check()?;
    }
    let mut bytes = Vec::new();
    bytes
        .try_reserve_exact(n)
        .map_err(|_| Error::Limit("crop allocation"))?;
    if work.is_none() {
        // Preserve PXL2's single bulk zero for ordinary texture crops. Sprite
        // work alone opts into byte accounting and bounded cancellation chunks.
        bytes.resize(n, 0);
        return Ok(bytes);
    }
    while bytes.len() < n {
        let end = bytes.len().saturating_add(4096).min(n);
        if let Some(w) = work.as_deref_mut() {
            w.charge((end - bytes.len()) as u64)?;
        }
        bytes.resize(end, 0);
    }
    if let Some(w) = work {
        w.check()?;
    }
    Ok(bytes)
}

// Exact array sizes are the dependency's unchecked slice preconditions. Never
// expose raw or whole-image decode functions as the product validation boundary.
fn bc1(block: &[u8; 8], pixels: &mut [u32; 16]) {
    texture2ddecoder::decode_bc1a_block(block, pixels);
}
fn bc7(block: &[u8; 16], pixels: &mut [u32; 16]) -> Result<()> {
    if block[0] == 0 {
        // Microsoft specifies zero output for this reserved prefix. Pillow's
        // alpha differs; PXL1 records it. Product policy refuses corrupt art.
        return Err(Error::Corrupt("reserved BC7 prefix"));
    }
    texture2ddecoder::decode_bc7_block(block, pixels);
    Ok(())
}

impl StreamResolver {
    /// Synchronous bounded background work, never a draw/input-path operation.
    /// Reuses the operation's existing Work for metadata, I/O and every block.
    /// Source handles/ownership checks remain live until successful completion;
    /// cancellation/error discards all partial pixels and spends no reset budget.
    pub fn crop_texture(
        &self,
        index: &SerializedIndex,
        texture: ObjectKey,
        mip: u32,
        rect: TextureRect,
        limits: &CropLimits,
        work: &mut Work,
    ) -> Result<TextureCrop> {
        self.prepare_crop(index, texture, mip, rect, limits, work)?
            .decode(index, work)
    }
    pub(crate) fn prepare_crop(
        &self,
        index: &SerializedIndex,
        texture: ObjectKey,
        mip: u32,
        rect: TextureRect,
        limits: &CropLimits,
        work: &mut Work,
    ) -> Result<PreparedCrop> {
        work.check()?;
        let t = self.read_owned_texture(index, texture, work)?;
        let block_bytes = match t.format {
            10 => 8,
            25 => 16,
            n => return Err(Error::UnsupportedFormat(n)),
        };
        // A1 checks the entire encoded layout, not just the crop's touched span.
        let mips = t.mip_ranges()?;
        if t.image_count == 0 {
            return Err(Error::UnsupportedLayout("texture has no pixel image"));
        }
        if t.width as u64 > u64::from(limits.max_dimension)
            || t.height as u64 > u64::from(limits.max_dimension)
        {
            return Err(Error::Limit("crop texture dimension"));
        }
        let mip_range = mips
            .get(usize_of(u64::from(mip))?)
            .ok_or(Error::Corrupt("texture crop mip"))?;
        let plan = Plan::new(mip_range, rect, block_bytes, limits)?;
        if plan.row_bytes > index.limits.read_bytes {
            return Err(Error::Limit("range request"));
        }
        let range = self.resolve_texture(index, &t)?;
        let identity = TextureCropIdentity {
            texture,
            assets: index.stamp.clone(),
            pixels: range.range().source_stamp().clone(),
            mip,
            source_rect: rect,
            format: t.format,
            mip_width: mip_range.width,
            mip_height: mip_range.height,
            decode_revision: 1,
        };
        work.check()?;
        Ok(PreparedCrop {
            plan,
            range,
            identity,
            block_bytes,
        })
    }
}

/// Retain the source range through any later Sprite raster/copy work, so its
/// completion check observes both inputs after the final output visit.
pub(crate) struct PreparedCrop {
    pub(crate) plan: Plan,
    range: TextureRange,
    identity: TextureCropIdentity,
    block_bytes: u64,
}
impl PreparedCrop {
    pub(crate) fn finish(&self, index: &SerializedIndex, work: &mut Work) -> Result<()> {
        self.range.range().read_relative(0, &mut [], work)?;
        if index.source.stamp()? != index.stamp {
            return Err(Error::ChangedSource);
        }
        work.check()
    }
    pub(crate) fn decode(&self, index: &SerializedIndex, work: &mut Work) -> Result<TextureCrop> {
        self.decode_inner(index, work, false)
    }
    pub(crate) fn decode_sprite(
        &self,
        index: &SerializedIndex,
        work: &mut Work,
    ) -> Result<TextureCrop> {
        self.decode_inner(index, work, true)
    }
    fn decode_inner(
        &self,
        index: &SerializedIndex,
        work: &mut Work,
        charge_zero: bool,
    ) -> Result<TextureCrop> {
        let plan = &self.plan;
        let range = &self.range;
        let rect = self.identity.source_rect;
        let block_bytes = self.block_bytes;
        work.check()?;
        let mut rgba = zeroed(
            plan.output_bytes,
            if charge_zero { Some(&mut *work) } else { None },
        )?;
        let mut row = zeroed(
            plan.row_bytes,
            if charge_zero { Some(&mut *work) } else { None },
        )?;
        let mut pixels = [0u32; 16];
        for row_index in 0..plan.rows {
            let block_y = add(plan.first_y, row_index)?;
            let offset = add(
                range.range().mips()[self.identity.mip as usize].range.start,
                add(mul(block_y, plan.stride)?, mul(plan.first_x, block_bytes)?)?,
            )?;
            // One checked I/O per contiguous block row; the source is opened and
            // range-validated once per crop, never once per 8/16-byte block.
            range.range().read_relative(offset, &mut row, work)?;
            for column in 0..plan.columns {
                work.charge(1)?;
                let b = usize_of(mul(column, block_bytes)?)?;
                if self.identity.format == 10 {
                    bc1(
                        row[b..b + 8].try_into().expect("planned BC1 block"),
                        &mut pixels,
                    );
                } else {
                    bc7(
                        row[b..b + 16].try_into().expect("planned BC7 block"),
                        &mut pixels,
                    )?;
                }
                let block_x = add(plan.first_x, column)?;
                for py in 0..4 {
                    let sy = add(mul(block_y, 4)?, py)?;
                    if sy < u64::from(rect.y) || sy >= plan.end_y {
                        continue;
                    }
                    // Flip once at the output copy; source coordinates stay
                    // lower-left, including at non-multiple-of-four mip edges.
                    let dy = plan.end_y - 1 - sy;
                    for px in 0..4 {
                        let sx = add(mul(block_x, 4)?, px)?;
                        if sx < u64::from(rect.x) || sx >= plan.end_x {
                            continue;
                        }
                        let d = usize_of(mul(
                            add(mul(dy, u64::from(rect.width))?, sx - u64::from(rect.x))?,
                            4,
                        )?)?;
                        let [b, g, r, a] = pixels[usize_of(add(mul(py, 4)?, px)?)?].to_le_bytes();
                        rgba[d..d + 4].copy_from_slice(&[r, g, b, a]);
                    }
                }
            }
        }
        self.finish(index, work)?;
        Ok(TextureCrop {
            identity: self.identity.clone(),
            rgba,
        })
    }
}

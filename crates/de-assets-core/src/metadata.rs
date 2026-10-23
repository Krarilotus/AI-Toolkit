use crate::{cursor::Cursor, *};
/// Raw IEEE-754 bits, including negative zero and unsupported nonfinite values.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct F32(pub u32);
impl F32 {
    pub fn value(self) -> f32 {
        f32::from_bits(self.0)
    }
    pub fn from_value(v: f32) -> Self {
        Self(v.to_bits())
    }
}
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PPtr {
    pub file_id: i32,
    pub path_id: i64,
}
impl PPtr {
    pub const NULL: Self = Self {
        file_id: 0,
        path_id: 0,
    };
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SecondaryTexture {
    pub texture: PPtr,
    pub name: String,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SubMesh {
    pub first_byte: u32,
    pub index_count: u32,
    pub topology: i32,
    pub base_vertex: u32,
    pub first_vertex: u32,
    pub vertex_count: u32,
    pub center: [F32; 3],
    pub extent: [F32; 3],
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Channel {
    pub stream: u8,
    pub offset: u8,
    pub format: u8,
    pub dimension: u8,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct VertexData {
    pub vertex_count: u32,
    pub channels: Vec<Channel>,
    pub data: Vec<u8>,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SpriteBone {
    pub name: String,
    pub guid: String,
    pub position: [F32; 3],
    pub rotation: [F32; 4],
    pub length: F32,
    pub parent_id: i32,
    pub color: u32,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SpriteRenderData {
    pub texture: PPtr,
    pub alpha_texture: PPtr,
    pub secondary_textures: Vec<SecondaryTexture>,
    pub submeshes: Vec<SubMesh>,
    pub index_buffer: Vec<u8>,
    pub vertices: VertexData,
    pub bind_poses: Vec<[F32; 16]>,
    pub texture_rect: [F32; 4],
    pub texture_rect_offset: [F32; 2],
    pub atlas_rect_offset: [F32; 2],
    pub settings_raw: u32,
    pub uv_transform: [F32; 4],
    pub downscale_multiplier: F32,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SpriteMetadata {
    pub name: String,
    pub rect: [F32; 4],
    pub offset: [F32; 2],
    pub border: [F32; 4],
    pub pixels_to_units: F32,
    pub pivot: [F32; 2],
    pub extrude: u32,
    pub is_polygon: u8,
    pub render_key_guid: [u32; 4],
    pub render_key_id: i64,
    pub atlas_tags: Vec<String>,
    pub sprite_atlas: PPtr,
    pub render: SpriteRenderData,
    pub physics_shapes: Vec<Vec<[F32; 2]>>,
    pub bones: Vec<SpriteBone>,
}
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Packing {
    pub raw: u32,
    pub packed: bool,
    pub mode: u8,
    pub rotation: u8,
    pub mesh: bool,
    pub reserved: u32,
}
impl Packing {
    /// Only observed unpacked, rotation-zero rectangle/mesh cases are audited.
    /// Packed flips/rotations are retained by parsing, never silently rendered.
    pub fn audited(self) -> Result<()> {
        if self.packed || self.mode != 0 || self.rotation != 0 || self.reserved != 0 {
            Err(Error::UnsupportedPacking(self.raw))
        } else {
            Ok(())
        }
    }
}
impl SpriteMetadata {
    pub(crate) fn parse(b: &[u8], base: u64, l: &Limits, w: &mut Work) -> Result<Self> {
        if l.nesting < 7 {
            return Err(Error::Limit("sprite nesting"));
        }
        let mut r = Cursor::new(b, base, l);
        let name = r.string()?;
        let rect = r.floats()?;
        let offset = r.floats()?;
        let border = r.floats()?;
        let pixels_to_units = r.f()?;
        let pivot = r.floats()?;
        let extrude = r.u32()?;
        let is_polygon = r.u8()?;
        r.align()?;
        let render_key_guid = [r.u32()?, r.u32()?, r.u32()?, r.u32()?];
        let render_key_id = r.i64()?;
        let n = r.array_count(4)?;
        let mut atlas_tags = Vec::with_capacity(n);
        for _ in 0..n {
            w.check()?;
            atlas_tags.push(r.string()?);
        }
        r.align()?;
        let sprite_atlas = r.ptr()?;
        r.align()?;
        let texture = r.ptr()?;
        let alpha_texture = r.ptr()?;
        let n = r.array_count(16)?;
        let mut secondary_textures = Vec::with_capacity(n);
        for _ in 0..n {
            w.check()?;
            secondary_textures.push(SecondaryTexture {
                texture: r.ptr()?,
                name: r.string()?,
            });
        }
        r.align()?;
        let n = r.array_count(48)?;
        let mut submeshes = Vec::with_capacity(n);
        for _ in 0..n {
            w.check()?;
            submeshes.push(SubMesh {
                first_byte: r.u32()?,
                index_count: r.u32()?,
                topology: r.i32()?,
                base_vertex: r.u32()?,
                first_vertex: r.u32()?,
                vertex_count: r.u32()?,
                center: r.floats()?,
                extent: r.floats()?,
            });
        }
        r.align()?;
        let index_buffer = r.blob(true)?;
        let vertex_count = r.u32()?;
        if u64::from(vertex_count) > l.array_elements as u64 {
            return Err(Error::Limit("vertex count"));
        }
        let n = r.array_count(4)?;
        let mut channels = Vec::with_capacity(n);
        for _ in 0..n {
            w.check()?;
            channels.push(Channel {
                stream: r.u8()?,
                offset: r.u8()?,
                format: r.u8()?,
                dimension: r.u8()?,
            });
        }
        r.align()?;
        let data = r.blob(false)?;
        let n = r.array_count(64)?;
        let mut bind_poses = Vec::with_capacity(n);
        for _ in 0..n {
            w.check()?;
            bind_poses.push(r.floats()?);
        }
        r.align()?;
        let texture_rect = r.floats()?;
        let texture_rect_offset = r.floats()?;
        let atlas_rect_offset = r.floats()?;
        let settings_raw = r.u32()?;
        let uv_transform = r.floats()?;
        let downscale_multiplier = r.f()?;
        r.align()?;
        let n = r.array_count(4)?;
        let mut physics_shapes = Vec::with_capacity(n);
        for _ in 0..n {
            w.check()?;
            let n = r.array_count(8)?;
            let mut shape = Vec::with_capacity(n);
            for _ in 0..n {
                w.check()?;
                shape.push(r.floats()?);
            }
            r.align()?;
            physics_shapes.push(shape);
        }
        r.align()?;
        let n = r.array_count(48)?;
        let mut bones = Vec::with_capacity(n);
        for _ in 0..n {
            w.check()?;
            bones.push(SpriteBone {
                name: r.string()?,
                guid: r.string()?,
                position: r.floats()?,
                rotation: r.floats()?,
                length: r.f()?,
                parent_id: r.i32()?,
                color: r.u32()?,
            });
        }
        r.align()?;
        r.finish()?;
        Ok(Self {
            name,
            rect,
            offset,
            border,
            pixels_to_units,
            pivot,
            extrude,
            is_polygon,
            render_key_guid,
            render_key_id,
            atlas_tags,
            sprite_atlas,
            render: SpriteRenderData {
                texture,
                alpha_texture,
                secondary_textures,
                submeshes,
                index_buffer,
                vertices: VertexData {
                    vertex_count,
                    channels,
                    data,
                },
                bind_poses,
                texture_rect,
                texture_rect_offset,
                atlas_rect_offset,
                settings_raw,
                uv_transform,
                downscale_multiplier,
            },
            physics_shapes,
            bones,
        })
    }
    pub fn packing(&self) -> Packing {
        let raw = self.render.settings_raw;
        Packing {
            raw,
            packed: raw & 1 != 0,
            mode: ((raw >> 1) & 1) as u8,
            rotation: ((raw >> 2) & 15) as u8,
            mesh: raw & 64 != 0,
            reserved: raw & !127,
        }
    }
    /// Checks usable geometry with the operation's shared allowance. Raw
    /// metadata remains available even when this returns Limit or Cancelled.
    pub fn validate_geometry(&self, work: &mut Work) -> Result<()> {
        self.validated_geometry(work).map(|_| ())
    }
    pub(crate) fn validated_geometry(
        &self,
        work: &mut Work,
    ) -> Result<crate::geometry::FloatStreams> {
        work.check()?;
        fn finite(v: &[F32], work: &mut Work) -> Result<()> {
            for f in v {
                work.charge(1)?;
                if !f.value().is_finite() {
                    return Err(Error::Corrupt("nonfinite sprite geometry"));
                }
            }
            Ok(())
        }
        for a in [
            &self.rect[..],
            &self.offset[..],
            &self.border[..],
            &self.pivot[..],
            &self.render.texture_rect[..],
            &self.render.texture_rect_offset[..],
            &self.render.atlas_rect_offset[..],
            &self.render.uv_transform[..],
            &[self.pixels_to_units, self.render.downscale_multiplier][..],
        ] {
            finite(a, work)?;
        }
        if self.pixels_to_units.value() <= 0.0 || self.render.downscale_multiplier.value() <= 0.0 {
            return Err(Error::Corrupt("nonpositive sprite scale"));
        }
        for r in [self.rect, self.render.texture_rect] {
            if r[2].value() < 0.0 || r[3].value() < 0.0 {
                return Err(Error::Corrupt("negative sprite extent"));
            }
        }
        if self.render.texture_rect[0].value() < 0.0 || self.render.texture_rect[1].value() < 0.0 {
            return Err(Error::Corrupt("negative texture coordinate"));
        }
        for m in &self.render.bind_poses {
            finite(m, work)?;
        }
        for s in &self.physics_shapes {
            work.charge(1)?;
            for p in s {
                finite(p, work)?;
            }
        }
        for b in &self.bones {
            work.charge(1)?;
            finite(&b.position, work)?;
            finite(&b.rotation, work)?;
            finite(&[b.length], work)?;
        }
        let v = &self.render.vertices;
        let streams = crate::geometry::FloatStreams::validate(v, work)?;
        if !self.render.index_buffer.len().is_multiple_of(2) {
            return Err(Error::Corrupt("odd 16-bit index bytes"));
        }
        for s in &self.render.submeshes {
            work.charge(1)?;
            finite(&s.center, work)?;
            finite(&s.extent, work)?;
            if s.extent.iter().any(|x| x.value() < 0.0) {
                return Err(Error::Corrupt("negative mesh extent"));
            }
            if s.topology != 0 {
                return Err(Error::UnsupportedLayout("non-triangle topology"));
            }
            if s.first_byte % 2 != 0 || s.index_count % 3 != 0 {
                return Err(Error::Corrupt("triangle index alignment/count"));
            }
            let end = add(u64::from(s.first_vertex), u64::from(s.vertex_count))?;
            if end > u64::from(v.vertex_count) {
                return Err(Error::Corrupt("submesh vertex range"));
            }
            span(
                u64::from(s.first_byte),
                mul(u64::from(s.index_count), 2)?,
                self.render.index_buffer.len() as u64,
            )?;
            let start = usize_of(u64::from(s.first_byte))?;
            let stop = usize_of(add(
                u64::from(s.first_byte),
                mul(u64::from(s.index_count), 2)?,
            )?)?;
            for b in self.render.index_buffer[start..stop].as_chunks::<2>().0 {
                // Repeated/overlapping spans are legal, but every visit costs
                // work. Subtract per visit rather than multiplying counts or
                // resetting an allowance for each descriptor.
                work.charge(1)?;
                let index = add(u64::from(u16::from_le_bytes(*b)), u64::from(s.base_vertex))?;
                if index < u64::from(s.first_vertex) || index >= end {
                    return Err(Error::Corrupt("submesh index vertex"));
                }
            }
        }
        work.check()?;
        Ok(streams)
    }
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TextureSettings {
    pub filter_mode: i32,
    pub aniso: i32,
    pub mip_bias: F32,
    pub wrap_u: i32,
    pub wrap_v: i32,
    pub wrap_w: i32,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct StreamingInfo {
    pub offset: u64,
    pub size: u32,
    pub path: String,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct TextureMetadata {
    pub name: String,
    pub forced_fallback_format: i32,
    pub downscale_fallback: u8,
    pub alpha_channel_optional: u8,
    pub width: i32,
    pub height: i32,
    pub complete_image_size: u32,
    pub mips_stripped: i32,
    pub format: i32,
    pub mip_count: i32,
    pub is_readable: u8,
    pub is_preprocessed: u8,
    pub ignore_master_texture_limit: u8,
    pub streaming_mipmaps: u8,
    pub streaming_mipmaps_priority: i32,
    pub image_count: i32,
    pub dimension: i32,
    pub settings: TextureSettings,
    pub lightmap_format: i32,
    pub color_space: i32,
    pub platform_blob: Vec<u8>,
    pub image_data: Vec<u8>,
    pub stream: StreamingInfo,
    pub(crate) inline_offset: u64,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct MipRange {
    pub level: u32,
    pub width: u64,
    pub height: u64,
    pub range: std::ops::Range<u64>,
}
impl TextureMetadata {
    pub(crate) fn parse(b: &[u8], base: u64, l: &Limits, w: &mut Work) -> Result<Self> {
        w.check()?;
        if l.nesting < 4 {
            return Err(Error::Limit("texture nesting"));
        }
        let mut r = Cursor::new(b, base, l);
        let name = r.string()?;
        let forced_fallback_format = r.i32()?;
        let downscale_fallback = r.u8()?;
        let alpha_channel_optional = r.u8()?;
        r.align()?;
        let width = r.i32()?;
        let height = r.i32()?;
        let complete_image_size = r.u32()?;
        let mips_stripped = r.i32()?;
        let format = r.i32()?;
        let mip_count = r.i32()?;
        let is_readable = r.u8()?;
        let is_preprocessed = r.u8()?;
        let ignore_master_texture_limit = r.u8()?;
        let streaming_mipmaps = r.u8()?;
        r.align()?;
        let streaming_mipmaps_priority = r.i32()?;
        r.align()?;
        let image_count = r.i32()?;
        let dimension = r.i32()?;
        let settings = TextureSettings {
            filter_mode: r.i32()?,
            aniso: r.i32()?,
            mip_bias: r.f()?,
            wrap_u: r.i32()?,
            wrap_v: r.i32()?,
            wrap_w: r.i32()?,
        };
        let lightmap_format = r.i32()?;
        let color_space = r.i32()?;
        let platform_blob = r.blob(true)?;
        let inline_offset = add(base, add(r.p as u64, 4)?)?;
        let image_data = r.blob(false)?;
        let stream = StreamingInfo {
            offset: r.u64()?,
            size: r.u32()?,
            path: r.string()?,
        };
        r.align()?;
        r.finish()?;
        Ok(Self {
            name,
            forced_fallback_format,
            downscale_fallback,
            alpha_channel_optional,
            width,
            height,
            complete_image_size,
            mips_stripped,
            format,
            mip_count,
            is_readable,
            is_preprocessed,
            ignore_master_texture_limit,
            streaming_mipmaps,
            streaming_mipmaps_priority,
            image_count,
            dimension,
            settings,
            lightmap_format,
            color_space,
            platform_blob,
            image_data,
            stream,
            inline_offset,
        })
    }
    /// Byte sizes only; no decoder is selected, even for known format codes.
    pub fn mip_ranges(&self) -> Result<Vec<MipRange>> {
        if self.width < 0
            || self.height < 0
            || self.image_count < 0
            || self.mip_count <= 0
            || self.mips_stripped < 0
        {
            return Err(Error::Corrupt("negative/zero texture fields"));
        }
        if self.dimension != 2 || self.image_count > 1 || self.mips_stripped != 0 {
            return Err(Error::UnsupportedLayout(
                "texture dimension/images/stripped mips",
            ));
        }
        if self.mip_count > 32 {
            return Err(Error::Limit("texture mips"));
        }
        if self.image_count == 0 {
            if self.width != 0
                || self.height != 0
                || self.complete_image_size != 0
                || !self.image_data.is_empty()
                || self.stream.size != 0
            {
                return Err(Error::Corrupt("nonempty zero-image texture"));
            }
            return Ok(Vec::new());
        }
        if self.width == 0 || self.height == 0 {
            return Err(Error::Corrupt("zero texture extent"));
        }
        let mut width = u64::try_from(self.width).map_err(|_| Error::Corrupt("width"))?;
        let mut height = u64::try_from(self.height).map_err(|_| Error::Corrupt("height"))?;
        let mut offset = 0;
        let mut ranges = Vec::new();
        for level in 0..self.mip_count {
            let size = match self.format {
                10 | 12 | 25 => mul(
                    mul(add(width, 3)? / 4, add(height, 3)? / 4)?,
                    if self.format == 10 { 8 } else { 16 },
                )?,
                3 | 4 => mul(
                    mul(width, height)?,
                    u64::try_from(self.format).map_err(|_| Error::Corrupt("format"))?,
                )?,
                n => return Err(Error::UnsupportedFormat(n)),
            };
            let end = add(offset, size)?;
            ranges.push(MipRange {
                level: u32::try_from(level).map_err(|_| Error::Corrupt("level"))?,
                width,
                height,
                range: offset..end,
            });
            offset = end;
            width = (width / 2).max(1);
            height = (height / 2).max(1);
        }
        if offset != u64::from(self.complete_image_size) {
            return Err(Error::Corrupt("complete mip byte size"));
        }
        let available = if self.stream.path.is_empty() {
            self.image_data.len() as u64
        } else {
            u64::from(self.stream.size)
        };
        if offset != available {
            return Err(Error::Corrupt("mip payload size"));
        }
        Ok(ranges)
    }
}

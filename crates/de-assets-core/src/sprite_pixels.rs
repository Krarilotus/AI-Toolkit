use crate::{
    geometry::FloatStreams,
    sprite_raster::{polygon, Pt, RasterWork},
    *,
};

/// CPU extraction convention; does not certify Unity/game raster or sampling.
pub const SPRITE_EXTRACTION_CONVENTION: &str = "unitypy-807f3888-pillow-293218ad-tight-local-v1";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SpritePlane {
    Base,
    PairedRawMask,
}

#[derive(Clone, Debug)]
pub struct SpriteLimits {
    pub crop: CropLimits,
    pub max_dimension: u32,
    pub output_bytes: u64,
    /// Combined requested pixel buffers, encoded row, points and raw geometry.
    /// Bounded parsed metadata/index/allocator overhead is not a process RSS cap.
    pub scratch_bytes: u64,
    pub raster_visits: u64,
}
impl Default for SpriteLimits {
    fn default() -> Self {
        Self {
            crop: CropLimits::default(),
            max_dimension: 8192,
            output_bytes: 16 * 1024 * 1024,
            scratch_bytes: 64 * 1024 * 1024,
            raster_visits: 64 * 1024 * 1024,
        }
    }
}

/// Continuous edge coordinates, separate from integer pixel-row reversal.
/// canvasX=(localX-minX)*PPU; canvasY=H-(localY-minY)*PPU.
#[derive(Clone, Debug, PartialEq)]
pub struct SpriteLocalMapping {
    pub minimum: [f64; 2],
    pub maximum: [f64; 2],
    pub pixels_per_unit: f64,
    pub origin_top_left: [f64; 2],
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SpritePlaneIdentity {
    pub sprite: ObjectKey,
    pub base_texture: ObjectKey,
    pub plane: SpritePlane,
    pub raw_mask: RawMaskState,
    /// Retains both SourceStamps, source crop/mip/format/decode identity.
    pub crop: TextureCropIdentity,
    pub extraction_convention: &'static str,
}
/// Immutable straight RGBA8 top-left rows. Original fractional/raw metadata is
/// retained independently from rounded pixels; no scene/shader/world anchor.
#[derive(Debug)]
pub struct SpritePixels {
    identity: SpritePlaneIdentity,
    width: u32,
    height: u32,
    mapping: SpriteLocalMapping,
    sprite: SpriteMetadata,
    base: TextureMetadata,
    mask: Option<TextureMetadata>,
    rgba: Vec<u8>,
}
impl SpritePixels {
    pub fn identity(&self) -> &SpritePlaneIdentity {
        &self.identity
    }
    pub fn width(&self) -> u32 {
        self.width
    }
    pub fn height(&self) -> u32 {
        self.height
    }
    pub fn mapping(&self) -> &SpriteLocalMapping {
        &self.mapping
    }
    pub fn sprite_metadata(&self) -> &SpriteMetadata {
        &self.sprite
    }
    pub fn base_texture_metadata(&self) -> &TextureMetadata {
        &self.base
    }
    pub fn mask_texture_metadata(&self) -> Option<&TextureMetadata> {
        self.mask.as_ref()
    }
    pub fn rgba(&self) -> &[u8] {
        &self.rgba
    }
}

fn rounded(x: f64) -> Result<i32> {
    if !x.is_finite() || x.abs() > 16384. {
        return Err(Error::Limit("sprite coordinates"));
    }
    Ok(x.round_ties_even() as i32)
}
struct Plan {
    rect: TextureRect,
    points: Vec<Pt>,
    translation: bool,
    mapping: SpriteLocalMapping,
    geometry_bytes: u64,
}
impl Plan {
    fn new(
        s: &SpriteMetadata,
        t: &TextureMetadata,
        streams: &FloatStreams,
        l: &SpriteLimits,
        work: &mut Work,
    ) -> Result<Self> {
        let r = &s.render;
        if r.downscale_multiplier.value() != 1. {
            return Err(Error::UnsupportedLayout("sprite downscale"));
        }
        if r.submeshes.len() != 1 {
            return Err(Error::UnsupportedLayout("sprite single submesh"));
        }
        let sub = &r.submeshes[0];
        if sub.base_vertex != 0 || sub.first_vertex != 0 {
            return Err(Error::UnsupportedLayout("sprite base/first vertex"));
        }
        if sub.index_count == 0 {
            return Err(Error::UnsupportedLayout("sprite has no triangles"));
        }
        let v = &r.vertices;
        if v.vertex_count == 0 || v.channels.first().is_none_or(|c| c.dimension != 3) {
            return Err(Error::UnsupportedLayout("sprite position channel"));
        }
        let uv_dimension = v.channels.get(4).map_or(0, |c| c.dimension);
        if !matches!(uv_dimension, 0 | 2) {
            return Err(Error::UnsupportedLayout("sprite UV channel"));
        }
        let point_bytes = mul(u64::from(v.vertex_count), std::mem::size_of::<Pt>() as u64)?;
        let geometry_bytes = add(
            point_bytes,
            add(
                v.data.len() as u64,
                add(
                    r.index_buffer.len() as u64,
                    add(
                        mul(
                            v.channels.len() as u64,
                            std::mem::size_of::<Channel>() as u64,
                        )?,
                        mul(
                            r.submeshes.len() as u64,
                            std::mem::size_of::<SubMesh>() as u64,
                        )?,
                    )?,
                )?,
            )?,
        )?;
        if add(geometry_bytes, 2048)? > l.scratch_bytes {
            return Err(Error::Limit("sprite scratch bytes"));
        }
        let mut minimum = [f64::INFINITY; 2];
        let mut maximum = [f64::NEG_INFINITY; 2];
        let mut z = None;
        let mut translation = false;
        for i in 0..v.vertex_count {
            work.charge(1)?;
            let p = streams.channel(v, 0, i, work)?;
            if z.is_some_and(|z| z != p[2]) {
                return Err(Error::UnsupportedLayout("sprite XY plane"));
            }
            z = Some(p[2]);
            for axis in 0..2 {
                minimum[axis] = minimum[axis].min(p[axis]);
                maximum[axis] = maximum[axis].max(p[axis]);
            }
            if uv_dimension != 0 {
                let uv = streams.channel(v, 4, i, work)?;
                translation |= uv[0] != 0. || uv[1] != 0.;
            }
        }
        let ppu = f64::from(s.pixels_to_units.value());
        let width = rounded((maximum[0] - minimum[0]) * ppu)?;
        let height = rounded((maximum[1] - minimum[1]) * ppu)?;
        if width <= 0
            || height <= 0
            || width as u32 > l.max_dimension.min(8192)
            || height as u32 > l.max_dimension.min(8192)
        {
            return Err(Error::Limit("sprite canvas dimensions"));
        }
        if mul(mul(width as u64, height as u64)?, 4)? > l.output_bytes {
            return Err(Error::Limit("sprite output bytes"));
        }
        let mut points = Vec::new();
        points
            .try_reserve_exact(usize_of(u64::from(v.vertex_count))?)
            .map_err(|_| Error::Limit("sprite geometry allocation"))?;
        let mut shift = None;
        for i in 0..v.vertex_count {
            work.charge(1)?;
            let p = streams.channel(v, 0, i, work)?;
            let xy = [(p[0] - minimum[0]) * ppu, (p[1] - minimum[1]) * ppu];
            // ImageDraw's C wrapper truncates zero-UV coordinates. UV copies
            // use Python ties-to-even before the source-local scan conversion.
            let point = Pt {
                x: if translation {
                    rounded(xy[0])?
                } else {
                    xy[0] as i32
                },
                y: if translation {
                    rounded(xy[1])?
                } else {
                    xy[1] as i32
                },
            };
            if translation {
                let uv = streams.channel(v, 4, i, work)?;
                let cur = (
                    rounded(uv[0] * f64::from(t.width))? - point.x,
                    rounded(uv[1] * f64::from(t.height))? - point.y,
                );
                if shift.is_some_and(|s| s != cur) {
                    return Err(Error::UnsupportedLayout("nontranslation sprite UV"));
                }
                shift = Some(cur);
            }
            points.push(point);
        }
        let (x, y) = if translation {
            shift.ok_or(Error::Corrupt("sprite UV count"))?
        } else {
            let q = r.texture_rect.map(|f| f64::from(f.value()));
            let x = rounded(q[0])?;
            let y = rounded(q[1])?;
            if rounded(q[0] + q[2])? - x != width || rounded(q[1] + q[3])? - y != height {
                return Err(Error::UnsupportedLayout("sprite crop/mesh canvas disagree"));
            }
            (x, y)
        };
        if x < 0
            || y < 0
            || i64::from(x) + i64::from(width) > i64::from(t.width)
            || i64::from(y) + i64::from(height) > i64::from(t.height)
        {
            return Err(Error::Corrupt("sprite sampling bounds"));
        }
        work.check()?;
        Ok(Self {
            rect: TextureRect {
                x: x as u32,
                y: y as u32,
                width: width as u32,
                height: height as u32,
            },
            points,
            translation,
            geometry_bytes,
            mapping: SpriteLocalMapping {
                minimum,
                maximum,
                pixels_per_unit: ppu,
                origin_top_left: [-minimum[0] * ppu, f64::from(height) + minimum[1] * ppu],
            },
        })
    }
    fn reconstruct(
        &self,
        s: &SpriteMetadata,
        raw: &[u8],
        limits: &SpriteLimits,
        work: &mut Work,
    ) -> Result<Vec<u8>> {
        let width = self.rect.width as usize;
        let height = self.rect.height as usize;
        let pixels = usize_of(mul(
            u64::from(self.rect.width),
            u64::from(self.rect.height),
        )?)?;
        let mut coverage = crate::texture_crop::zeroed(pixels, Some(&mut *work))?;
        let mut budget = RasterWork::new(work, limits.raster_visits);
        let sub = &s.render.submeshes[0];
        let start = usize_of(u64::from(sub.first_byte))?;
        let stop = usize_of(add(
            u64::from(sub.first_byte),
            mul(u64::from(sub.index_count), 2)?,
        )?)?;
        for bytes in s.render.index_buffer[start..stop].as_chunks::<6>().0 {
            budget.visit()?;
            let mut tri = [Pt { x: 0, y: 0 }; 3];
            for i in 0..3 {
                budget.visit()?;
                let index = usize::from(u16::from_le_bytes([bytes[2 * i], bytes[2 * i + 1]]));
                tri[i] = self.points[index]; // All visits already validated by A1.
            }
            let (origin, w, h) = if self.translation {
                let origin = Pt {
                    x: tri.iter().map(|p| p.x).min().unwrap(),
                    y: tri.iter().map(|p| p.y).min().unwrap(),
                };
                let w = tri.iter().map(|p| p.x).max().unwrap() - origin.x;
                let h = tri.iter().map(|p| p.y).max().unwrap() - origin.y;
                // P2 SPR1-R1-01: keep scan arithmetic triangle-local; exclusive
                // maxima match copy_triangle's cropped mask. Translate writes.
                for p in &mut tri {
                    p.x -= origin.x;
                    p.y -= origin.y;
                }
                (origin, w as usize, h as usize)
            } else {
                (Pt { x: 0, y: 0 }, width, height)
            };
            polygon(
                tri,
                [w, h],
                origin,
                width,
                height,
                &mut coverage,
                &mut budget,
            )?;
        }
        let mut rgba = crate::texture_crop::zeroed(raw.len(), Some(&mut *budget.work))?;
        for y in 0..height {
            budget.visit()?;
            for x in 0..width {
                budget.visit()?;
                let top = y * width + x;
                if coverage[(height - 1 - y) * width + x] != 0 {
                    rgba[4 * top..4 * top + 4].copy_from_slice(&raw[4 * top..4 * top + 4]);
                }
            }
        }
        budget.work.check()?;
        Ok(rgba)
    }
}

impl SpritePlaneProvider<'_> {
    /// Bounded synchronous background extraction. Accepts only source-scoped
    /// keys, never caller-mutated metadata, paths, ranges or scene selectors.
    pub fn reconstruct_sprite_plane(
        &self,
        key: ObjectKey,
        plane: SpritePlane,
        limits: &SpriteLimits,
        work: &mut Work,
    ) -> Result<SpritePixels> {
        work.check()?;
        self.resolver.check_index(self.index)?;
        let (s, streams) = self.index.validated_sprite_geometry(key, work)?;
        let base_key = self
            .index
            .resolve_pointer(s.render.texture, 28)?
            .expect("validated nonnull texture");
        let base = self
            .resolver
            .read_owned_texture(self.index, base_key, work)?;
        let mask_state = self.mask_state(base_key, &base.name, work)?;
        let (texture_key, mask) = match plane {
            SpritePlane::Base => (base_key, None),
            SpritePlane::PairedRawMask => match mask_state {
                RawMaskState::Paired(k) => {
                    let t = self.resolver.read_owned_texture(self.index, k, work)?;
                    if t.width != base.width || t.height != base.height {
                        return Err(Error::Corrupt("paired mask dimensions"));
                    }
                    (k, Some(t))
                }
                RawMaskState::ExplicitlyUnmasked => return Err(Error::UnmaskedFamily),
                RawMaskState::UnknownFamily => {
                    return Err(Error::UnsupportedReference("unknown raw-mask family"))
                }
            },
        };
        let plan = Plan::new(&s, &base, &streams, limits, work)?;
        drop(streams);
        let crop = self.resolver.prepare_crop(
            self.index,
            texture_key,
            0,
            plan.rect,
            &limits.crop,
            work,
        )?;
        // Conservative overlapping-lifetime upper bound: crop RGBA + coverage
        // + result = 9WH, plus row and geometry (even though the row is already
        // freed when coverage/result become live). Fixed raster scratch <=2KiB.
        let combined = add(
            add(
                mul((crop.plan.output_bytes / 4) as u64, 9)?,
                crop.plan.row_bytes as u64,
            )?,
            add(plan.geometry_bytes, 2048)?,
        )?;
        if combined > limits.scratch_bytes {
            return Err(Error::Limit("sprite scratch bytes"));
        }
        let raw = crop.decode_sprite(self.index, work)?;
        let rgba = plan.reconstruct(&s, raw.rgba(), limits, work)?;
        crop.finish(self.index, work)?;
        work.check()?;
        Ok(SpritePixels {
            identity: SpritePlaneIdentity {
                sprite: key,
                base_texture: base_key,
                plane,
                raw_mask: mask_state,
                crop: raw.identity().clone(),
                extraction_convention: SPRITE_EXTRACTION_CONVENTION,
            },
            width: plan.rect.width,
            height: plan.rect.height,
            mapping: plan.mapping,
            sprite: s,
            base,
            mask,
            rgba,
        })
    }
}

#[cfg(test)]
#[path = "sprite_pixels_tests.rs"]
mod tests;

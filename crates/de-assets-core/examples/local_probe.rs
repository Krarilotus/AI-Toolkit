//! Optional probe transport. Use probes/local_parity.ps1, which hash-gates and
//! read-locks the proprietary inputs. Output contains metadata: keep outside Git.
use de_assets_core::*;
use std::{
    fmt::Write as _,
    io::{self, BufRead},
};
#[derive(Default)]
struct Canonical(Vec<u8>);
impl Canonical {
    fn u8(&mut self, v: u8) {
        self.0.push(v);
    }
    fn u32(&mut self, v: u32) {
        self.0.extend(v.to_le_bytes());
    }
    fn i32(&mut self, v: i32) {
        self.0.extend(v.to_le_bytes());
    }
    fn i64(&mut self, v: i64) {
        self.0.extend(v.to_le_bytes());
    }
    fn u64(&mut self, v: u64) {
        self.0.extend(v.to_le_bytes());
    }
    fn len(&mut self, n: usize) {
        self.i32(i32::try_from(n).expect("bounded parser lengths"));
    }
    fn str(&mut self, s: &str) {
        self.blob(s.as_bytes());
    }
    fn blob(&mut self, b: &[u8]) {
        self.len(b.len());
        self.0.extend(b);
    }
    fn fs(&mut self, f: &[F32]) {
        for f in f {
            self.u32(f.0);
        }
    }
    fn ptr(&mut self, p: PPtr) {
        self.i32(p.file_id);
        self.i64(p.path_id);
    }
    fn sprite(&mut self, s: &SpriteMetadata) {
        self.str(&s.name);
        self.fs(&s.rect);
        self.fs(&s.offset);
        self.fs(&s.border);
        self.fs(&[s.pixels_to_units]);
        self.fs(&s.pivot);
        self.u32(s.extrude);
        self.u8(s.is_polygon);
        for v in s.render_key_guid {
            self.u32(v);
        }
        self.i64(s.render_key_id);
        self.len(s.atlas_tags.len());
        for t in &s.atlas_tags {
            self.str(t);
        }
        self.ptr(s.sprite_atlas);
        let r = &s.render;
        self.ptr(r.texture);
        self.ptr(r.alpha_texture);
        self.len(r.secondary_textures.len());
        for t in &r.secondary_textures {
            self.ptr(t.texture);
            self.str(&t.name);
        }
        self.len(r.submeshes.len());
        for m in &r.submeshes {
            self.u32(m.first_byte);
            self.u32(m.index_count);
            self.i32(m.topology);
            self.u32(m.base_vertex);
            self.u32(m.first_vertex);
            self.u32(m.vertex_count);
            self.fs(&m.center);
            self.fs(&m.extent);
        }
        self.blob(&r.index_buffer);
        self.u32(r.vertices.vertex_count);
        self.len(r.vertices.channels.len());
        for c in &r.vertices.channels {
            self.u8(c.stream);
            self.u8(c.offset);
            self.u8(c.format);
            self.u8(c.dimension);
        }
        self.blob(&r.vertices.data);
        self.len(r.bind_poses.len());
        for p in &r.bind_poses {
            self.fs(p);
        }
        self.fs(&r.texture_rect);
        self.fs(&r.texture_rect_offset);
        self.fs(&r.atlas_rect_offset);
        self.u32(r.settings_raw);
        self.fs(&r.uv_transform);
        self.fs(&[r.downscale_multiplier]);
        self.len(s.physics_shapes.len());
        for shape in &s.physics_shapes {
            self.len(shape.len());
            for p in shape {
                self.fs(p);
            }
        }
        self.len(s.bones.len());
        for b in &s.bones {
            self.str(&b.name);
            self.str(&b.guid);
            self.fs(&b.position);
            self.fs(&b.rotation);
            self.fs(&[b.length]);
            self.i32(b.parent_id);
            self.u32(b.color);
        }
    }
    fn texture(&mut self, t: &TextureMetadata) {
        self.str(&t.name);
        self.i32(t.forced_fallback_format);
        self.u8(t.downscale_fallback);
        self.u8(t.alpha_channel_optional);
        self.i32(t.width);
        self.i32(t.height);
        self.u32(t.complete_image_size);
        self.i32(t.mips_stripped);
        self.i32(t.format);
        self.i32(t.mip_count);
        self.u8(t.is_readable);
        self.u8(t.is_preprocessed);
        self.u8(t.ignore_master_texture_limit);
        self.u8(t.streaming_mipmaps);
        self.i32(t.streaming_mipmaps_priority);
        self.i32(t.image_count);
        self.i32(t.dimension);
        let s = &t.settings;
        self.i32(s.filter_mode);
        self.i32(s.aniso);
        self.fs(&[s.mip_bias]);
        self.i32(s.wrap_u);
        self.i32(s.wrap_v);
        self.i32(s.wrap_w);
        self.i32(t.lightmap_format);
        self.i32(t.color_space);
        self.blob(&t.platform_blob);
        self.blob(&t.image_data);
        self.u64(t.stream.offset);
        self.u32(t.stream.size);
        self.str(&t.stream.path);
    }
}
fn main() -> std::result::Result<(), Box<dyn std::error::Error>> {
    let root = std::env::args_os()
        .nth(1)
        .ok_or("data root required; use local_parity.ps1")?;
    let file = FileSource::open_data_root(root)?;
    let resolver = StreamResolver::for_file(file.clone())?;
    let mut w = Work::new(256 * 1024 * 1024);
    let index = SerializedIndex::read(file, Limits::default(), &mut w)?;
    eprintln!(
        "index objects={} scripts={} externals={}",
        index.objects().count(),
        index.scripts().len(),
        index.externals().len()
    );
    let names = index.find_names(
        213,
        &[
            "body_skirmisher-2136",
            "body_bedouin_healer-0x",
            "body16Sprites_m",
        ],
        &mut w,
    )?;
    assert_eq!(names["body_skirmisher-2136"], NameMatch::Zero);
    let mask_sprite = names["body16Sprites_m"].clone().unique()?;
    let mask_texture = index.find_name(28, "body16Sprites_m", &mut w)?.unique()?;
    assert_ne!(mask_sprite, mask_texture);
    names["body_bedouin_healer-0x"].clone().unique()?;
    eprintln!("exact-name checks: missing2136, alternate0x and class-scoped mask pass");
    for line in io::stdin().lock().lines() {
        let line = line?;
        let mut words = line.split_whitespace();
        let class: i32 = words.next().ok_or("class")?.parse()?;
        let id: i64 = words.next().ok_or("ID")?.parse()?;
        let key = index.key(id)?;
        let mut out = Canonical::default();
        match class {
            213 => {
                let s = index.validate_sprite(key, &mut w)?;
                out.sprite(&s);
            }
            28 => {
                let t = index.read_texture(key, &mut w)?;
                out.texture(&t);
                let r = resolver.validate(&index, key, &mut w)?;
                let mut first = [0; 16];
                let n = usize::try_from(r.range().length().min(16))?;
                r.range().read_relative(0, &mut first[..n], &mut w)?;
            }
            _ => return Err("only target classes".into()),
        }
        let mut hex = String::with_capacity(out.0.len() * 2);
        for b in out.0 {
            write!(hex, "{b:02x}")?;
        }
        println!("{id}\t{class}\t{hex}");
    }
    Ok(())
}

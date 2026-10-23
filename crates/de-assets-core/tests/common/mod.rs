#![allow(dead_code)]
use de_assets_core::*;
use std::sync::Arc;
#[derive(Default)]
pub struct W(pub Vec<u8>);
impl W {
    pub fn bytes(&mut self, b: &[u8]) {
        self.0.extend_from_slice(b);
    }
    pub fn u8(&mut self, v: u8) {
        self.0.push(v);
    }
    pub fn i16(&mut self, v: i16) {
        self.bytes(&v.to_le_bytes());
    }
    pub fn u32(&mut self, v: u32) {
        self.bytes(&v.to_le_bytes());
    }
    pub fn i32(&mut self, v: i32) {
        self.bytes(&v.to_le_bytes());
    }
    pub fn u64(&mut self, v: u64) {
        self.bytes(&v.to_le_bytes());
    }
    pub fn i64(&mut self, v: i64) {
        self.bytes(&v.to_le_bytes());
    }
    pub fn f(&mut self, v: f32) {
        self.u32(v.to_bits());
    }
    pub fn fs(&mut self, v: &[f32]) {
        for x in v {
            self.f(*x);
        }
    }
    pub fn align(&mut self) {
        while !self.0.len().is_multiple_of(4) {
            self.u8(0);
        }
    }
    pub fn str(&mut self, s: &str) {
        self.i32(s.len().try_into().unwrap());
        self.bytes(s.as_bytes());
        self.align();
    }
    pub fn cstr(&mut self, s: &str) {
        self.bytes(s.as_bytes());
        self.u8(0);
    }
    pub fn blob(&mut self, b: &[u8]) {
        self.i32(b.len().try_into().unwrap());
        self.bytes(b);
        self.align();
    }
    pub fn ptr(&mut self, f: i32, p: i64) {
        self.i32(f);
        self.i64(p);
    }
}
#[allow(clippy::too_many_arguments)] // Wire fixture fields remain explicit.
pub fn texture(
    name: &str,
    path: &str,
    offset: u64,
    size: u32,
    inline: &[u8],
    format: i32,
    width: i32,
    height: i32,
    mips: i32,
    images: i32,
) -> Vec<u8> {
    let mut w = W::default();
    w.str(name);
    w.i32(-7);
    w.u8(1);
    w.u8(0);
    w.align();
    w.i32(width);
    w.i32(height);
    w.u32(if path.is_empty() {
        inline.len().try_into().unwrap()
    } else {
        size
    });
    w.i32(0);
    w.i32(format);
    w.i32(mips);
    w.bytes(&[1, 0, 1, 0]);
    w.i32(-1);
    w.i32(images);
    w.i32(2);
    w.i32(1);
    w.i32(2);
    w.f(-0.0);
    w.i32(0);
    w.i32(1);
    w.i32(2);
    w.i32(0);
    w.i32(1);
    w.blob(&[3, 2, 1]);
    w.blob(inline);
    w.u64(offset);
    w.u32(size);
    w.str(path);
    w.0
}
pub fn sprite(name: &str, texture: i64) -> Vec<u8> {
    sprite_options(name, texture, &[], PPtr::NULL, PPtr::NULL, &[], 64)
}
pub fn sprite_options(
    name: &str,
    texture: i64,
    tags: &[&str],
    atlas: PPtr,
    alpha: PPtr,
    secondary: &[(PPtr, &str)],
    flags: u32,
) -> Vec<u8> {
    let mut w = W::default();
    w.str(name);
    w.fs(&[0., 0., 2., 2.]);
    w.fs(&[-1., 0.5]);
    w.fs(&[1., 2., 3., 4.]);
    w.f(64.);
    w.fs(&[0.5, 0.25]);
    w.u32(2);
    w.u8(1);
    w.align();
    for x in [1, 2, 3, 4] {
        w.u32(x);
    }
    w.i64(-9);
    w.i32(tags.len().try_into().unwrap());
    for tag in tags {
        w.str(tag);
    }
    w.ptr(atlas.file_id, atlas.path_id);
    w.ptr(0, texture);
    w.ptr(alpha.file_id, alpha.path_id);
    w.i32(secondary.len().try_into().unwrap());
    for (p, name) in secondary {
        w.ptr(p.file_id, p.path_id);
        w.str(name);
    }
    w.i32(1);
    w.u32(0);
    w.u32(3);
    w.i32(0);
    w.u32(0);
    w.u32(0);
    w.u32(3);
    w.fs(&[0., 0., 0., 1., 1., 1.]);
    w.blob(&[0, 0, 1, 0, 2, 0]);
    w.u32(3);
    w.i32(2);
    w.bytes(&[0, 0, 0, 3, 1, 0, 0, 2]);
    let mut vertices = W::default();
    vertices.fs(&[0., 0., 0., 1., 0., 0., 0., 1., 0.]);
    while !vertices.0.len().is_multiple_of(16) {
        vertices.u8(0);
    }
    vertices.fs(&[0., 0., 1., 0., 0., 1.]);
    w.blob(&vertices.0);
    w.i32(1);
    for i in 0..16 {
        w.f(if i % 5 == 0 { 1. } else { 0. });
    }
    w.fs(&[0.125, 0.25, 1.875, 1.75]);
    w.fs(&[-0.5, 0.5, -1., -1.]);
    w.u32(flags);
    w.fs(&[1., 0., 0., 1.]);
    w.f(1.);
    w.i32(1);
    w.i32(2);
    w.fs(&[0., 0., 1., 1.]);
    w.i32(1);
    w.str("bone");
    w.str("guid");
    w.fs(&[1., 2., 3., 0., 0., 0., 1.]);
    w.f(2.);
    w.i32(-1);
    w.u32(0xaabbccdd);
    w.0
}
pub fn types() -> Vec<(i32, [u8; 16])> {
    vec![
        (213, SPRITE_HASH),
        (28, TEXTURE_HASH),
        (114, [1; 16]),
        (1, [0; 16]),
    ]
}
pub struct Fixture {
    pub bytes: Vec<u8>,
    pub records: Vec<usize>,
    pub metadata_count: usize,
    pub types_start: usize,
    pub scripts_count: usize,
    pub externals_count: usize,
    pub refs_count: usize,
    pub data: usize,
}
pub fn fixture(objects: Vec<(i64, i32, Vec<u8>)>) -> Fixture {
    let mut m = W::default();
    m.cstr(UNITY_VERSION);
    m.i32(19);
    m.u8(0);
    let types_start = 48 + m.0.len();
    m.i32(4);
    for (id, hash) in types() {
        m.i32(id);
        m.u8(0);
        m.i16(-1);
        if id == 114 {
            m.bytes(&[8; 16]);
        }
        m.bytes(&hash);
    }
    let metadata_count = 48 + m.0.len();
    m.i32(objects.len().try_into().unwrap());
    let mut payload = W::default();
    let mut records = Vec::new();
    for (id, ti, b) in objects {
        m.align();
        records.push(48 + m.0.len());
        m.i64(id);
        m.u64(payload.0.len() as u64);
        m.u32(b.len().try_into().unwrap());
        m.i32(ti);
        payload.bytes(&b);
        payload.align();
    }
    let scripts_count = 48 + m.0.len();
    m.i32(1);
    m.i32(2);
    m.align();
    m.i64(-9007199254740995);
    let externals_count = 48 + m.0.len();
    m.i32(1);
    m.cstr("");
    m.bytes(&[9; 16]);
    m.i32(0);
    m.cstr("Library/unity default resources");
    let refs_count = 48 + m.0.len();
    m.i32(0);
    m.cstr("synthetic");
    let data = (48 + m.0.len() + 15) & !15;
    let length = data + payload.0.len();
    let mut h = vec![0u8; 48];
    h[8..12].copy_from_slice(&22u32.to_be_bytes());
    h[20..24].copy_from_slice(&(m.0.len() as u32).to_be_bytes());
    h[24..32].copy_from_slice(&(length as u64).to_be_bytes());
    h[32..40].copy_from_slice(&(data as u64).to_be_bytes());
    h.extend_from_slice(&m.0);
    h.resize(data, 0);
    h.extend_from_slice(&payload.0);
    Fixture {
        bytes: h,
        records,
        metadata_count,
        types_start,
        scripts_count,
        externals_count,
        refs_count,
        data,
    }
}
pub fn standard() -> Fixture {
    fixture(vec![
        (-9, 0, sprite("same", 9007199254740995)),
        (
            9007199254740995,
            1,
            texture("same", "resources.assets.resS", 8, 16, &[], 25, 4, 4, 1, 1),
        ),
    ])
}
pub fn index(bytes: Vec<u8>) -> Result<SerializedIndex> {
    SerializedIndex::read(
        Arc::new(BytesSource::new(bytes)),
        Limits::default(),
        &mut Work::new(64 * 1024 * 1024),
    )
}
pub fn patch32(b: &mut [u8], p: usize, v: i32) {
    b[p..p + 4].copy_from_slice(&v.to_le_bytes());
}
pub fn patch64(b: &mut [u8], p: usize, v: u64) {
    b[p..p + 8].copy_from_slice(&v.to_le_bytes());
}

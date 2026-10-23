mod common;
use common::*;
use de_assets_core::*;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
fn work() -> Work {
    Work::new(64 * 1024 * 1024)
}
#[test]
fn metadata_tail_identity_and_fields() {
    let i = index(standard().bytes).unwrap();
    assert_eq!(i.objects().count(), 2);
    assert_eq!(i.scripts()[0].path_id, -9007199254740995);
    assert_eq!(i.externals()[0].path, "Library/unity default resources");
    assert_eq!(i.user_information(), "synthetic");
    assert_eq!(i.types()[2].script_id, Some([8; 16]));
    let s = i.validate_sprite(i.key(-9).unwrap(), &mut work()).unwrap();
    assert_eq!(s.render_key_id, -9);
    assert_eq!(s.render_key_guid, [1, 2, 3, 4]);
    assert_eq!(s.render.vertices.vertex_count, 3);
    assert_eq!(s.render.bind_poses.len(), 1);
    assert_eq!(s.physics_shapes[0].len(), 2);
    assert_eq!(s.bones[0].color, 0xaabbccdd);
    assert_eq!(s.offset[0].value(), -1.);
    assert_eq!(s.render.texture_rect[0].value(), 0.125);
    assert_eq!(s.render.atlas_rect_offset[0].value(), -1.);
    let t = i
        .read_texture(i.key(9007199254740995).unwrap(), &mut work())
        .unwrap();
    assert_eq!(t.settings.mip_bias.0, 0x80000000);
    assert_eq!(t.platform_blob, [3, 2, 1]);
    assert_eq!(t.forced_fallback_format, -7);
    assert_eq!(t.mip_ranges().unwrap()[0].range, 0..16);
    let other = index(standard().bytes).unwrap();
    assert!(matches!(
        other.read_sprite(i.key(-9).unwrap(), &mut work()),
        Err(Error::UnsupportedReference(_))
    ));
}
#[test]
fn class_scoped_zero_one_many_sparse_exact() {
    let f = fixture(vec![
        (-1, 0, sprite("same", 42)),
        (-2, 0, sprite("same", 42)),
        (42, 1, texture("same", "", 0, 0, &[], 4, 0, 0, 1, 0)),
        (43, 0, sprite("body-2137x", 42)),
    ]);
    let i = index(f.bytes).unwrap();
    assert!(matches!(i.find_name(213,"same",&mut work()).unwrap(),NameMatch::Many(v)if v.len()==2));
    assert!(
        matches!(i.find_name(28,"same",&mut work()).unwrap(),NameMatch::One(k)if k.path_id()==42)
    );
    assert_eq!(
        i.find_name(213, "body-2136", &mut work()).unwrap(),
        NameMatch::Zero
    );
    assert!(i
        .find_name(213, "body-2137x", &mut work())
        .unwrap()
        .unique()
        .is_ok());
    assert!(matches!(
        i.find_name(213, "Same", &mut work()).unwrap().unique(),
        Err(Error::NotFound)
    ));
}
#[test]
fn every_file_prefix_truncation_fails_without_panic() {
    let b = standard().bytes;
    for n in 0..b.len() {
        assert!(index(b[..n].to_vec()).is_err(), "prefix {n}");
    }
}

#[test]
fn metadata_prefixes_with_self_consistent_headers_still_fail() {
    let f = standard();
    let size = u32::from_be_bytes(f.bytes[20..24].try_into().unwrap()) as usize;
    let payload = &f.bytes[f.data..];
    for n in 0..size {
        let data = (48 + n + 15) & !15;
        let length = data + payload.len();
        let mut b = f.bytes[..48].to_vec();
        b[20..24].copy_from_slice(&(n as u32).to_be_bytes());
        b[24..32].copy_from_slice(&(length as u64).to_be_bytes());
        b[32..40].copy_from_slice(&(data as u64).to_be_bytes());
        b.extend_from_slice(&f.bytes[48..48 + n]);
        b.resize(data, 0);
        b.extend_from_slice(payload);
        assert!(index(b).is_err(), "self-consistent metadata prefix {n}");
    }
}
#[test]
fn negative_huge_and_remaining_counts() {
    let f = standard();
    for p in [
        f.types_start,
        f.metadata_count,
        f.scripts_count,
        f.externals_count,
        f.refs_count,
    ] {
        for v in [-1, i32::MAX] {
            let mut b = f.bytes.clone();
            patch32(&mut b, p, v);
            assert!(index(b).is_err(), "count {p} {v}");
        }
    }
}
#[test]
fn header_and_metadata_boundaries() {
    let f = standard();
    for (p, v) in [(8, 21u32), (0, 1), (4, 1), (12, 1), (20, u32::MAX)] {
        let mut b = f.bytes.clone();
        b[p..p + 4].copy_from_slice(&v.to_be_bytes());
        assert!(index(b).is_err());
    }
    for p in [16, 17, 40] {
        let mut b = f.bytes.clone();
        b[p] = 1;
        assert!(index(b).is_err());
    }
    for (p, v) in [(24, 0u64), (32, 0), (32, u64::MAX)] {
        let mut b = f.bytes.clone();
        b[p..p + 8].copy_from_slice(&v.to_be_bytes());
        assert!(index(b).is_err());
    }
    let mut b = f.bytes.clone();
    b[48] = b'X';
    assert!(matches!(index(b), Err(Error::UnsupportedLayout(_))));
    for p in [f.types_start - 5, f.types_start - 1] {
        let mut b = f.bytes.clone();
        b[p] ^= 1;
        assert!(matches!(index(b), Err(Error::UnsupportedLayout(_))));
    }
    let mut b = f.bytes.clone();
    b[48..64].fill(255);
    assert!(index(b).is_err());
    let mut b = f.bytes.clone();
    b[f.refs_count..f.refs_count + 4].copy_from_slice(&1i32.to_le_bytes());
    assert!(matches!(index(b), Err(Error::UnsupportedLayout(_))));
}
#[test]
fn bad_indices_duplicate_spans_and_overflows() {
    let f = standard();
    let a = f.records[0];
    let z = f.records[1];
    for v in [-1, 4, i32::MAX] {
        let mut b = f.bytes.clone();
        patch32(&mut b, a + 20, v);
        assert!(index(b).is_err());
    }
    let mut b = f.bytes.clone();
    patch64(&mut b, z, (-9i64) as u64);
    assert!(matches!(index(b), Err(Error::Corrupt("duplicate path ID"))));
    let mut b = f.bytes.clone();
    patch64(&mut b, z + 8, 0);
    assert!(matches!(
        index(b),
        Err(Error::Corrupt("overlapping objects"))
    ));
    for off in [u64::MAX, 1u64 << 63] {
        let mut b = f.bytes.clone();
        patch64(&mut b, a + 8, off);
        assert!(index(b).is_err());
    }
    let mut b = f.bytes.clone();
    patch32(&mut b, a + 16, i32::MAX);
    assert!(index(b).is_err());
}
#[test]
fn layout_hash_and_stripped_tuple_gate_only_typed_reads() {
    let f = standard();
    for p in [
        f.types_start + 4 + 4,
        f.types_start + 4 + 5,
        f.types_start + 4 + 7,
    ] {
        let mut b = f.bytes.clone();
        b[p] ^= 1;
        let i = index(b).unwrap();
        assert!(matches!(
            i.read_sprite(i.key(-9).unwrap(), &mut work()),
            Err(Error::UnsupportedLayout(_))
        ));
    }
}
#[test]
fn object_string_utf8_alignment_and_trailing_bytes() {
    let f = standard();
    for n in [-1, 4097, i32::MAX] {
        let mut b = f.bytes.clone();
        patch32(&mut b, f.data, n);
        let i = index(b).unwrap();
        assert!(i.read_sprite(i.key(-9).unwrap(), &mut work()).is_err());
        assert!(i.find_name(213, "same", &mut work()).is_err());
    }
    let mut b = f.bytes.clone();
    b[f.data + 4] = 255;
    let i = index(b).unwrap();
    assert!(i.read_sprite(i.key(-9).unwrap(), &mut work()).is_err());
    let b = sprite("abc", 42);
    for n in 0..b.len() {
        let i = index(fixture(vec![(1, 0, b[..n].to_vec())]).bytes).unwrap();
        assert!(
            i.read_sprite(i.key(1).unwrap(), &mut work()).is_err(),
            "object prefix {n}"
        );
    }
    let mut b = sprite("same", 42);
    b.extend_from_slice(&[0; 4]);
    let i = index(fixture(vec![(1, 0, b)]).bytes).unwrap();
    assert!(matches!(
        i.read_sprite(i.key(1).unwrap(), &mut work()),
        Err(Error::Corrupt("trailing bytes"))
    ));
}
#[test]
fn all_texture_prefixes_and_array_counts() {
    let t = texture("text", "", 0, 0, &[1, 2, 3, 4], 4, 1, 1, 1, 1);
    for n in 0..t.len() {
        let i = index(fixture(vec![(1, 1, t[..n].to_vec())]).bytes).unwrap();
        assert!(
            i.read_texture(i.key(1).unwrap(), &mut work()).is_err(),
            "texture prefix {n}"
        );
    }
    let i = index(standard().bytes).unwrap();
    let key = i.key(-9).unwrap();
    let s = i.read_sprite(key, &mut work()).unwrap();
    let l = Limits {
        array_elements: 1,
        ..Limits::default()
    };
    let i = SerializedIndex::read(Arc::new(BytesSource::new(standard().bytes)), l, &mut work())
        .unwrap();
    assert!(matches!(
        i.read_sprite(i.key(-9).unwrap(), &mut work()),
        Err(Error::Limit(_))
    ));
    assert_eq!(s.name, "same");
}
#[test]
fn geometry_and_packing_status_preserve_raw_values() {
    let i = index(standard().bytes).unwrap();
    let s = i.read_sprite(i.key(-9).unwrap(), &mut work()).unwrap();
    s.validate_geometry(&mut work()).unwrap();
    for flags in [1, 1 | 4, 1 | 8, 1 | 12, 1 | 16, 2, 128, u32::MAX] {
        let mut m = s.clone();
        m.render.settings_raw = flags;
        assert_eq!(m.packing().raw, flags);
        assert!(matches!(m.packing().audited(),Err(Error::UnsupportedPacking(n))if n==flags));
    }
    for flags in [0, 64] {
        let mut m = s.clone();
        m.render.settings_raw = flags;
        m.packing().audited().unwrap();
    }
    for v in [0., -1., f32::NAN, f32::INFINITY] {
        let mut m = s.clone();
        m.pixels_to_units = F32::from_value(v);
        assert!(m.validate_geometry(&mut work()).is_err());
    }
    for field in 0..4 {
        let mut m = s.clone();
        m.render.texture_rect[field] = F32::from_value(f32::NAN);
        assert!(m.validate_geometry(&mut work()).is_err());
    }
    let mut m = s.clone();
    m.render.vertices.data.pop();
    assert!(m.validate_geometry(&mut work()).is_err());
    let mut m = s.clone();
    m.render.index_buffer.pop();
    assert!(m.validate_geometry(&mut work()).is_err());
    for mutate in 0..7 {
        let mut m = s.clone();
        match mutate {
            0 => m.render.submeshes[0].first_byte = u32::MAX,
            1 => m.render.submeshes[0].index_count = u32::MAX,
            2 => m.render.submeshes[0].base_vertex = u32::MAX,
            3 => m.render.submeshes[0].first_vertex = u32::MAX,
            4 => m.render.submeshes[0].vertex_count = u32::MAX,
            5 => m.render.vertices.channels[0].offset = 255,
            _ => m.render.index_buffer[0] = 99,
        };
        assert!(m.validate_geometry(&mut work()).is_err());
    }
    let mut m = s.clone();
    m.render.vertices.channels[0].format = 99;
    assert!(matches!(
        m.validate_geometry(&mut work()),
        Err(Error::UnsupportedLayout(_))
    ));
    let mut m = s.clone();
    m.render.submeshes[0].topology = 2;
    assert!(matches!(
        m.validate_geometry(&mut work()),
        Err(Error::UnsupportedLayout(_))
    ));
}
#[test]
fn reference_null_local_wrong_class_dangling_external() {
    let i = index(standard().bytes).unwrap();
    assert_eq!(i.resolve_pointer(PPtr::NULL, 28).unwrap(), None);
    for p in [
        PPtr {
            file_id: 0,
            path_id: -9,
        },
        PPtr {
            file_id: 0,
            path_id: 123,
        },
        PPtr {
            file_id: -1,
            path_id: 0,
        },
        PPtr {
            file_id: 2,
            path_id: 1,
        },
    ] {
        assert!(matches!(i.resolve_pointer(p, 28), Err(Error::Corrupt(_))));
    }
    assert!(matches!(
        i.resolve_pointer(
            PPtr {
                file_id: 1,
                path_id: 9007199254740995
            },
            28
        ),
        Err(Error::UnsupportedReference(_))
    ));
}
#[test]
fn limits_cancellation_and_selected_budget() {
    let b = standard().bytes;
    assert!(matches!(
        SerializedIndex::read(
            Arc::new(BytesSource::new(b.clone())),
            Limits::default(),
            &mut Work::new(47)
        ),
        Err(Error::Limit(_))
    ));
    let mut w = work();
    w.cancellation().store(true, Ordering::Relaxed);
    assert!(matches!(
        SerializedIndex::read(
            Arc::new(BytesSource::new(b.clone())),
            Limits::default(),
            &mut w
        ),
        Err(Error::Cancelled)
    ));
    for mode in 0..5 {
        let mut l = Limits::default();
        match mode {
            0 => l.metadata_bytes = 4,
            1 => l.objects = 1,
            2 => l.types = 1,
            3 => l.scripts = 0,
            _ => l.externals = 0,
        };
        assert!(matches!(
            SerializedIndex::read(Arc::new(BytesSource::new(b.clone())), l, &mut work()),
            Err(Error::Limit(_))
        ));
    }
    let l = Limits {
        selected_bytes: 1,
        ..Limits::default()
    };
    let i = SerializedIndex::read(Arc::new(BytesSource::new(b)), l, &mut work()).unwrap();
    assert!(matches!(
        i.read_sprite(i.key(-9).unwrap(), &mut work()),
        Err(Error::Limit(_))
    ));
}
struct Inject {
    b: Vec<u8>,
    mode: u8,
    calls: std::sync::atomic::AtomicU64,
    changed: AtomicBool,
}
impl ReadAt for Inject {
    fn stamp(&self) -> Result<SourceStamp> {
        Ok(SourceStamp {
            identity: [42, 1],
            length: self.b.len() as u64,
            revision: u128::from(self.changed.load(Ordering::Relaxed)),
        })
    }
    fn read_at(&self, o: u64, b: &mut [u8]) -> Result<usize> {
        let call = self.calls.fetch_add(1, Ordering::Relaxed);
        if self.mode == 1 {
            return Err(std::io::Error::other("injected").into());
        }
        if self.mode == 2 {
            return Ok(0);
        }
        if self.mode == 3 && call > 0 {
            self.changed.store(true, Ordering::Relaxed);
        }
        let o = usize::try_from(o).unwrap();
        let n = b.len().min(3).min(self.b.len() - o);
        b[..n].copy_from_slice(&self.b[o..o + n]);
        Ok(n)
    }
}
#[test]
fn short_reads_io_and_changed_source() {
    for mode in 0..4 {
        let src = Arc::new(Inject {
            b: standard().bytes,
            mode,
            calls: 0.into(),
            changed: false.into(),
        });
        let r = SerializedIndex::read(src, Limits::default(), &mut work());
        match mode {
            0 => assert!(r.is_ok()),
            1 => assert!(matches!(r, Err(Error::Io(_)))),
            2 => assert!(matches!(r, Err(Error::Corrupt(_)))),
            _ => assert!(matches!(r, Err(Error::ChangedSource))),
        }
    }
}
#[test]
fn texture_inventory_formats_mips_inline_zero_and_unsupported() {
    for (format, size) in [(25, 16), (10, 8), (12, 16), (4, 64), (3, 48)] {
        let i = index(
            fixture(vec![(
                1,
                1,
                texture(
                    "t",
                    "resources.assets.resS",
                    0,
                    size,
                    &[],
                    format,
                    4,
                    4,
                    1,
                    1,
                ),
            )])
            .bytes,
        )
        .unwrap();
        assert_eq!(
            i.read_texture(i.key(1).unwrap(), &mut work())
                .unwrap()
                .mip_ranges()
                .unwrap()[0]
                .range,
            0..u64::from(size)
        );
    }
    for mips in [6, 12] {
        let size = mips * 8;
        let i = index(
            fixture(vec![(
                1,
                1,
                texture(
                    "mips",
                    "resources.assets.resS",
                    0,
                    size as u32,
                    &[],
                    10,
                    1,
                    1,
                    mips,
                    1,
                ),
            )])
            .bytes,
        )
        .unwrap();
        assert_eq!(
            i.read_texture(i.key(1).unwrap(), &mut work())
                .unwrap()
                .mip_ranges()
                .unwrap()
                .len(),
            mips as usize
        );
    }
    let i = index(
        fixture(vec![
            (1, 1, texture("Font Texture", "", 0, 0, &[], 4, 0, 0, 1, 0)),
            (
                2,
                1,
                texture("text", "", 0, 0, &[1, 2, 3, 4], 4, 1, 1, 1, 1),
            ),
            (3, 1, texture("future", "", 0, 0, &[], 999, 1, 1, 1, 1)),
        ])
        .bytes,
    )
    .unwrap();
    assert!(i
        .read_texture(i.key(1).unwrap(), &mut work())
        .unwrap()
        .mip_ranges()
        .unwrap()
        .is_empty());
    assert_eq!(
        i.read_texture(i.key(2).unwrap(), &mut work())
            .unwrap()
            .image_data,
        [1, 2, 3, 4]
    );
    assert!(matches!(
        i.read_texture(i.key(3).unwrap(), &mut work())
            .unwrap()
            .mip_ranges(),
        Err(Error::UnsupportedFormat(999))
    ));
}

#[test]
fn serialized_reference_and_packed_variants_preserve_then_report_support() {
    let tex = texture("atlas", "", 0, 0, &[0; 16], 4, 2, 2, 1, 1);
    for (tags, atlas, alpha, secondary) in [
        (vec!["tag"], PPtr::NULL, PPtr::NULL, vec![]),
        (
            vec![],
            PPtr {
                file_id: 1,
                path_id: 9,
            },
            PPtr::NULL,
            vec![],
        ),
        (
            vec![],
            PPtr::NULL,
            PPtr {
                file_id: 0,
                path_id: 42,
            },
            vec![],
        ),
        (
            vec![],
            PPtr::NULL,
            PPtr::NULL,
            vec![(
                PPtr {
                    file_id: 0,
                    path_id: 42,
                },
                "mask",
            )],
        ),
    ] {
        let b = sprite_options("sprite", 42, &tags, atlas, alpha, &secondary, 64);
        let i = index(fixture(vec![(1, 0, b), (42, 1, tex.clone())]).bytes).unwrap();
        let s = i.read_sprite(i.key(1).unwrap(), &mut work()).unwrap();
        assert_eq!(s.atlas_tags, tags);
        assert_eq!(s.sprite_atlas, atlas);
        assert_eq!(s.render.alpha_texture, alpha);
        assert_eq!(s.render.secondary_textures.len(), secondary.len());
        assert!(matches!(
            i.validate_sprite(i.key(1).unwrap(), &mut work()),
            Err(Error::UnsupportedReference(_))
        ));
    }
    for flags in [1 | 4, 1 | 8, 1 | 12, 1 | 16, 0xffff_ffff] {
        let b = sprite_options("packing", 42, &[], PPtr::NULL, PPtr::NULL, &[], flags);
        let i = index(fixture(vec![(1, 0, b), (42, 1, tex.clone())]).bytes).unwrap();
        let s = i.read_sprite(i.key(1).unwrap(), &mut work()).unwrap();
        assert_eq!(s.render.settings_raw, flags);
        assert!(
            matches!(i.validate_sprite(i.key(1).unwrap(),&mut work()),Err(Error::UnsupportedPacking(n))if n==flags)
        );
    }
    for target in [0, 999, -9] {
        let b = sprite("broken", target);
        let i = index(
            fixture(vec![
                (1, 0, b),
                (-9, 0, sprite("wrongclass", 42)),
                (42, 1, tex.clone()),
            ])
            .bytes,
        )
        .unwrap();
        assert!(i.validate_sprite(i.key(1).unwrap(), &mut work()).is_err());
    }
}

#[test]
fn arrays_blobs_nesting_name_and_object_caps() {
    let bytes = standard().bytes;
    for mode in 0..7 {
        let mut l = Limits::default();
        match mode {
            0 => l.blob_bytes = 4,
            1 => l.nesting = 6,
            2 => l.object_bytes = 1,
            3 => l.name_bytes = 1,
            4 => l.string_bytes = 3,
            5 => l.read_bytes = 0,
            _ => l.array_elements = 0,
        };
        let result =
            SerializedIndex::read(Arc::new(BytesSource::new(bytes.clone())), l, &mut work());
        match result {
            Ok(i) => {
                let r = if mode == 3 {
                    i.find_name(213, "same", &mut work()).map(|_| ())
                } else {
                    i.read_sprite(i.key(-9).unwrap(), &mut work()).map(|_| ())
                };
                assert!(r.is_err(), "cap {mode}");
            }
            Err(Error::Limit(_) | Error::Corrupt(_)) => {}
            Err(e) => panic!("cap {mode}: {e}"),
        }
    }
    let i = index(bytes).unwrap();
    let mut w = Work::new(2 * sprite("same", 9007199254740995).len() as u64);
    let k = i.key(-9).unwrap();
    i.read_sprite(k, &mut w).unwrap();
    i.read_sprite(k, &mut w).unwrap();
    assert!(matches!(i.read_sprite(k, &mut w), Err(Error::Limit(_))));
}

#[test]
fn extended_offsets_above_two_to_fifty_three_use_sparse_readat() {
    struct Sparse {
        bytes: Vec<u8>,
        old: usize,
        data: u64,
        len: u64,
    }
    impl ReadAt for Sparse {
        fn stamp(&self) -> Result<SourceStamp> {
            Ok(SourceStamp {
                identity: [7, 8],
                length: self.len,
                revision: 0,
            })
        }
        fn read_at(&self, offset: u64, b: &mut [u8]) -> Result<usize> {
            let at = if offset >= self.data {
                self.old
                    .checked_add(usize::try_from(offset - self.data).unwrap())
                    .unwrap()
            } else {
                usize::try_from(offset).unwrap()
            };
            let n = b.len().min(self.bytes.len() - at);
            b[..n].copy_from_slice(&self.bytes[at..at + n]);
            Ok(n)
        }
    }
    let f = standard();
    let old = f.data;
    let data = (1u64 << 54) + 16;
    let len = data + (f.bytes.len() - old) as u64;
    let mut bytes = f.bytes;
    bytes[24..32].copy_from_slice(&len.to_be_bytes());
    bytes[32..40].copy_from_slice(&data.to_be_bytes());
    let i = SerializedIndex::read(
        Arc::new(Sparse {
            bytes,
            old,
            data,
            len,
        }),
        Limits::default(),
        &mut work(),
    )
    .unwrap();
    assert_eq!(i.entry(i.key(-9).unwrap()).unwrap().range.start, data);
    assert_eq!(
        i.read_sprite(i.key(-9).unwrap(), &mut work()).unwrap().name,
        "same"
    );
}

#[test]
fn metadata_cstrings_and_geometry_overflow_cases() {
    let f = standard();
    let mut b = f.bytes.clone();
    b[f.refs_count + 4..f.data].fill(b'A');
    assert!(index(b).is_err());
    let mut b = f.bytes.clone();
    b[48] = 255;
    assert!(index(b).is_err());
    let i = index(f.bytes).unwrap();
    let mut t = i
        .read_texture(i.key(9007199254740995).unwrap(), &mut work())
        .unwrap();
    t.width = i32::MAX;
    t.height = i32::MAX;
    t.format = 4;
    t.mip_count = 32;
    assert!(matches!(t.mip_ranges(), Err(Error::Corrupt(_))));
    for mode in 0..5 {
        let mut t = t.clone();
        match mode {
            0 => t.width = -1,
            1 => t.mip_count = 0,
            2 => t.mip_count = 33,
            3 => t.dimension = 3,
            _ => t.mips_stripped = 1,
        };
        assert!(t.mip_ranges().is_err());
    }
}

#[test]
fn signed_array_counts_fail_before_allocation_and_nonfinite_bits_survive_parse() {
    let original = sprite("same", 42);
    for (at, expected) in [
        (92, 0),
        (132, 0),
        (136, 1),
        (188, 6),
        (204, 2),
        (216, 72),
        (292, 1),
        (416, 1),
        (420, 2),
        (440, 1),
    ] {
        assert_eq!(
            i32::from_le_bytes(original[at..at + 4].try_into().unwrap()),
            expected,
            "fixture count {at}"
        );
        for value in [-1, i32::MAX] {
            let mut bytes = original.clone();
            patch32(&mut bytes, at, value);
            let i = index(fixture(vec![(1, 0, bytes)]).bytes).unwrap();
            assert!(
                i.read_sprite(i.key(1).unwrap(), &mut work()).is_err(),
                "array {at} {value}"
            );
        }
    }
    for bits in [0x7fc0_1234u32, 0x7f80_0000, 0xff80_0000, 0] {
        let mut bytes = original.clone();
        bytes[48..52].copy_from_slice(&bits.to_le_bytes());
        let i = index(fixture(vec![(1, 0, bytes)]).bytes).unwrap();
        let s = i.read_sprite(i.key(1).unwrap(), &mut work()).unwrap();
        assert_eq!(s.pixels_to_units.0, bits);
        assert!(s.validate_geometry(&mut work()).is_err());
    }
}

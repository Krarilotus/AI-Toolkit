mod common;
use common::*;
use de_assets_core::*;
use std::sync::{
    atomic::{AtomicU64, AtomicUsize, Ordering},
    Arc, Mutex,
};

struct Observed {
    inner: BytesSource,
    reads: Mutex<Vec<(u64, usize)>>,
    stamps: AtomicUsize,
    change_at: AtomicUsize,
    revision: AtomicU64,
    short: usize,
}
impl Observed {
    fn new(bytes: Vec<u8>) -> Self {
        Self {
            inner: BytesSource::new(bytes),
            reads: Mutex::new(Vec::new()),
            stamps: AtomicUsize::new(0),
            change_at: AtomicUsize::new(usize::MAX),
            revision: AtomicU64::new(0),
            short: usize::MAX,
        }
    }
}
impl ReadAt for Observed {
    fn stamp(&self) -> Result<SourceStamp> {
        let call = self.stamps.fetch_add(1, Ordering::Relaxed) + 1;
        if call == self.change_at.load(Ordering::Relaxed) {
            self.revision.fetch_add(1, Ordering::Relaxed);
        }
        let mut s = self.inner.stamp()?;
        s.revision = u128::from(self.revision.load(Ordering::Relaxed));
        Ok(s)
    }
    fn read_at(&self, offset: u64, out: &mut [u8]) -> Result<usize> {
        self.reads.lock().unwrap().push((offset, out.len()));
        let n = out.len().min(self.short);
        self.inner.read_at(offset, &mut out[..n])
    }
}
fn setup(t: Vec<u8>, stream: Arc<dyn ReadAt>, limits: Limits) -> (SerializedIndex, StreamResolver) {
    let a: Arc<dyn ReadAt> = Arc::new(BytesSource::new(fixture(vec![(42, 1, t)]).bytes));
    let i = SerializedIndex::read(a.clone(), limits, &mut Work::new(1_000_000)).unwrap();
    let r = StreamResolver::for_sources(a, stream).unwrap();
    (i, r)
}
fn rect(x: u32, y: u32, width: u32, height: u32) -> TextureRect {
    TextureRect {
        x,
        y,
        width,
        height,
    }
}
fn crop(
    i: &SerializedIndex,
    r: &StreamResolver,
    mip: u32,
    rect: TextureRect,
    l: &CropLimits,
    w: &mut Work,
) -> Result<TextureCrop> {
    r.crop_texture(i, i.key(42).unwrap(), mip, rect, l, w)
}
fn bc1(a: u16, b: u16, indices: impl Iterator<Item = u32>) -> Vec<u8> {
    let bits = indices.enumerate().fold(0u32, |q, (i, x)| q | x << (2 * i));
    [
        a.to_le_bytes().as_slice(),
        b.to_le_bytes().as_slice(),
        bits.to_le_bytes().as_slice(),
    ]
    .concat()
}
fn expand(q: u16) -> [u8; 4] {
    let (r, g, b) = ((q >> 11) & 31, (q >> 5) & 63, q & 31);
    [
        (r * 8 + r / 4) as u8,
        (g * 4 + g / 16) as u8,
        (b * 8 + b / 4) as u8,
        255,
    ]
}
fn expected_bc1(a: u16, b: u16, indices: &[u32]) -> Vec<u8> {
    let (p, q) = (expand(a), expand(b));
    let mut palette = [p, q, [0; 4], [0; 4]];
    for c in 0..3 {
        if a > b {
            palette[2][c] = ((2 * u16::from(p[c]) + u16::from(q[c])) / 3) as u8;
            palette[3][c] = ((u16::from(p[c]) + 2 * u16::from(q[c])) / 3) as u8;
        } else {
            palette[2][c] = ((u16::from(p[c]) + u16::from(q[c])) / 2) as u8;
        }
    }
    palette[2][3] = 255;
    if a > b {
        palette[3][3] = 255;
    }
    (0..4)
        .rev()
        .flat_map(|y| (0..4).flat_map(move |x| palette[indices[y * 4 + x] as usize]))
        .collect()
}

#[test]
fn bc1_alpha_equal_endpoints_channels_and_asymmetric_rows() {
    for (a, b) in [
        (0xf800, 0x001f),
        (0x001f, 0xf800),
        (0x7bef, 0x7bef),
        (0, 0),
        (0xffff, 0),
    ] {
        for indices in [
            (0..16).map(|i| i / 4).collect::<Vec<_>>(),
            (0..16).map(|i| i % 4).collect(),
            (0..16).map(|i| (i * 7 + i / 4) % 4).collect(),
            vec![3; 16],
        ] {
            let bytes = bc1(a, b, indices.iter().copied());
            let t = texture("authored", "", 0, 0, &bytes, 10, 4, 4, 1, 1);
            let (i, r) = setup(t, Arc::new(BytesSource::new(vec![])), Limits::default());
            let got = crop(
                &i,
                &r,
                0,
                rect(0, 0, 4, 4),
                &CropLimits::default(),
                &mut Work::new(10000),
            )
            .unwrap();
            assert_eq!(got.rgba(), expected_bc1(a, b, &indices));
        }
    }
}
fn unhex(s: &str) -> Vec<u8> {
    s.as_bytes()
        .as_chunks::<2>()
        .0
        .iter()
        .map(|b| u8::from_str_radix(std::str::from_utf8(b).unwrap(), 16).unwrap())
        .collect()
}

#[test]
fn bc7_all_modes_rotations_selectors_gradients_and_legal_partitions() {
    let mut counts = [0; 8];
    let mut total = 0;
    for line in include_str!("vectors/bc7-authored.txt")
        .lines()
        .filter(|x| !x.starts_with('#'))
    {
        let v: Vec<_> = line.split_whitespace().collect();
        let mode: usize = v[0].parse().unwrap();
        counts[mode] += 1;
        total += 1;
        let block = unhex(v[2]);
        let expected = unhex(v[3]);
        let t = texture("authored", "", 0, 0, &block, 25, 4, 4, 1, 1);
        let (i, r) = setup(t, Arc::new(BytesSource::new(vec![])), Limits::default());
        let got = crop(
            &i,
            &r,
            0,
            rect(0, 0, 4, 4),
            &CropLimits::default(),
            &mut Work::new(10000),
        )
        .unwrap();
        let top: Vec<_> = expected
            .as_chunks::<16>()
            .0
            .iter()
            .rev()
            .flatten()
            .copied()
            .collect();
        assert_eq!(got.rgba(), top, "{}", v[1]);
    }
    assert_eq!(total, 311);
    assert!(counts.iter().all(|n| *n > 0));
}

#[test]
fn bc7_reserved_prefix_is_corrupt_with_raw_metadata_retained() {
    for suffix in [0, 1, 127, 255] {
        let mut block = vec![suffix; 16];
        block[0] = 0;
        let (i, r) = setup(
            texture("reserved", "", 0, 0, &block, 25, 4, 4, 1, 1),
            Arc::new(BytesSource::new(vec![])),
            Limits::default(),
        );
        let raw = i
            .read_texture(i.key(42).unwrap(), &mut Work::new(10000))
            .unwrap();
        assert!(matches!(
            crop(
                &i,
                &r,
                0,
                rect(0, 0, 4, 4),
                &CropLimits::default(),
                &mut Work::new(10000)
            ),
            Err(Error::Corrupt("reserved BC7 prefix"))
        ));
        assert_eq!(
            raw,
            i.read_texture(i.key(42).unwrap(), &mut Work::new(10000))
                .unwrap()
        );
    }
}

#[test]
fn partial_blocks_unaligned_crop_mip_offsets_and_top_left_rows() {
    // 7x5: four BC1 blocks. Mip1 3x2 and mip2 1x1 use one each.
    let colors = [0xf800, 0x07e0, 0x001f, 0xffff, 0x7bef, 0xffe0];
    let bytes: Vec<_> = colors
        .iter()
        .flat_map(|c| bc1(*c, 0, (0..16).map(|_| 0)))
        .collect();
    let mut prefixed = vec![99; 13];
    prefixed.extend(&bytes);
    let s = Arc::new(Observed::new(prefixed));
    let (i, r) = setup(
        texture("mips", "resources.assets.resS", 13, 48, &[], 10, 7, 5, 3, 1),
        s.clone(),
        Limits::default(),
    );
    for (m, rc, color) in [(1, rect(1, 0, 2, 2), 0x7bef), (2, rect(0, 0, 1, 1), 0xffe0)] {
        let got = crop(&i, &r, m, rc, &CropLimits::default(), &mut Work::new(10000)).unwrap();
        assert_eq!(
            got.rgba(),
            expand(color).repeat((rc.width * rc.height) as usize)
        );
        assert_eq!(got.identity().mip, m);
        assert_eq!(got.identity().source_rect, rc);
    }
    s.reads.lock().unwrap().clear();
    let rc = rect(2, 1, 5, 4);
    let got = crop(&i, &r, 0, rc, &CropLimits::default(), &mut Work::new(10000)).unwrap();
    let expected: Vec<_> = (1..5)
        .rev()
        .flat_map(|y| (2..7).flat_map(move |x| expand(colors[(y / 4) * 2 + x / 4])))
        .collect();
    assert_eq!(got.rgba(), expected);
    assert_eq!(*s.reads.lock().unwrap(), vec![(13, 16), (29, 16)]);
    assert_eq!(got.identity().mip_width, 7);
    assert_eq!(got.identity().mip_height, 5);
}

#[test]
fn exact_shared_work_allowance_and_no_reset_between_crops() {
    let bytes = bc1(0xf800, 0, (0..16).map(|_| 0)).repeat(4);
    let t = texture("work", "resources.assets.resS", 0, 32, &[], 10, 8, 8, 1, 1);
    let n = t.len() as u64;
    let (i, r) = setup(t, Arc::new(BytesSource::new(bytes)), Limits::default());
    let cost = n + 32 + 4;
    let mut w = Work::new(cost);
    crop(&i, &r, 0, rect(0, 0, 8, 8), &CropLimits::default(), &mut w).unwrap();
    assert_eq!(w.remaining(), 0);
    assert!(matches!(
        crop(&i, &r, 0, rect(0, 0, 8, 8), &CropLimits::default(), &mut w),
        Err(Error::Limit("work units"))
    ));
    let mut w = Work::new(cost - 1);
    assert!(matches!(
        crop(&i, &r, 0, rect(0, 0, 8, 8), &CropLimits::default(), &mut w),
        Err(Error::Limit("work units"))
    ));
    assert_eq!(w.remaining(), 0);
}

#[test]
fn limits_bounds_and_mips_fail_before_stream_reads() {
    let s = Arc::new(Observed::new(vec![0; 64]));
    let (i, r) = setup(
        texture(
            "bounds",
            "resources.assets.resS",
            0,
            64,
            &[],
            25,
            8,
            8,
            1,
            1,
        ),
        s.clone(),
        Limits::default(),
    );
    for rc in [
        rect(0, 0, 0, 1),
        rect(0, 0, 1, 0),
        rect(8, 0, 1, 1),
        rect(0, 8, 1, 1),
        rect(u32::MAX, 0, u32::MAX, 1),
        rect(7, 7, 2, 2),
    ] {
        assert!(matches!(
            crop(&i, &r, 0, rc, &CropLimits::default(), &mut Work::new(10000)),
            Err(Error::Corrupt(_))
        ));
    }
    assert!(matches!(
        crop(
            &i,
            &r,
            u32::MAX,
            rect(0, 0, 1, 1),
            &CropLimits::default(),
            &mut Work::new(10000)
        ),
        Err(Error::Corrupt("texture crop mip"))
    ));
    for l in [
        CropLimits {
            max_dimension: 7,
            ..Default::default()
        },
        CropLimits {
            output_bytes: 255,
            ..Default::default()
        },
        CropLimits {
            decoded_blocks: 3,
            ..Default::default()
        },
        CropLimits {
            temporary_bytes: 31,
            ..Default::default()
        },
    ] {
        assert!(matches!(
            crop(&i, &r, 0, rect(0, 0, 8, 8), &l, &mut Work::new(10000)),
            Err(Error::Limit(_))
        ));
    }
    assert!(s.reads.lock().unwrap().is_empty());
}

#[test]
fn truncated_layout_and_stream_range_refused_before_payload_reads() {
    for available in 0..64 {
        let s = Arc::new(Observed::new(vec![0; available]));
        let (i, r) = setup(
            texture("short", "resources.assets.resS", 0, 64, &[], 25, 8, 8, 1, 1),
            s.clone(),
            Limits::default(),
        );
        assert!(matches!(
            crop(
                &i,
                &r,
                0,
                rect(0, 0, 1, 1),
                &CropLimits::default(),
                &mut Work::new(10000)
            ),
            Err(Error::Corrupt(_))
        ));
        assert!(s.reads.lock().unwrap().is_empty());
    }
    for (size, offset) in [(63, 0), (64, u64::MAX)] {
        let s = Arc::new(Observed::new(vec![0; 64]));
        let (i, r) = setup(
            texture(
                "short",
                "resources.assets.resS",
                offset,
                size,
                &[],
                25,
                8,
                8,
                1,
                1,
            ),
            s.clone(),
            Limits::default(),
        );
        assert!(matches!(
            crop(
                &i,
                &r,
                0,
                rect(0, 0, 1, 1),
                &CropLimits::default(),
                &mut Work::new(10000)
            ),
            Err(Error::Corrupt(_))
        ));
        assert!(s.reads.lock().unwrap().is_empty());
    }
}

#[test]
fn unsupported_formats_do_not_open_or_read_pixel_source() {
    for fmt in [3, 4, 12, 999] {
        let s = Arc::new(Observed::new(vec![]));
        let (i, r) = setup(
            texture(
                "unsupported",
                "resources.assets.resS",
                0,
                0,
                &[],
                fmt,
                4,
                4,
                1,
                1,
            ),
            s.clone(),
            Limits::default(),
        );
        let before = s.stamps.load(Ordering::Relaxed);
        assert!(
            matches!(crop(&i,&r,0,rect(0,0,4,4),&CropLimits::default(),&mut Work::new(10000)),Err(Error::UnsupportedFormat(n)) if n==fmt)
        );
        assert_eq!(s.stamps.load(Ordering::Relaxed), before);
        assert!(s.reads.lock().unwrap().is_empty());
    }
}

#[test]
fn pre_cancelled_foreign_keys_wrong_class_and_resolver_owner() {
    let b = bc1(0xf800, 0, (0..16).map(|_| 0));
    let t = texture("identity", "", 0, 0, &b, 10, 4, 4, 1, 1);
    let (i, r) = setup(
        t.clone(),
        Arc::new(BytesSource::new(vec![])),
        Limits::default(),
    );
    let mut w = Work::new(10000);
    w.cancellation().store(true, Ordering::Relaxed);
    assert!(matches!(
        crop(&i, &r, 0, rect(0, 0, 4, 4), &CropLimits::default(), &mut w),
        Err(Error::Cancelled)
    ));
    assert_eq!(w.remaining(), 10000);
    let (other, _) = setup(t, Arc::new(BytesSource::new(vec![])), Limits::default());
    assert!(matches!(
        r.crop_texture(
            &i,
            other.key(42).unwrap(),
            0,
            rect(0, 0, 4, 4),
            &CropLimits::default(),
            &mut Work::new(10000)
        ),
        Err(Error::UnsupportedReference(_))
    ));
    assert!(matches!(
        crop(
            &other,
            &r,
            0,
            rect(0, 0, 4, 4),
            &CropLimits::default(),
            &mut Work::new(10000)
        ),
        Err(Error::UnsupportedReference(_))
    ));
    let a: Arc<dyn ReadAt> = Arc::new(BytesSource::new(
        fixture(vec![(42, 0, sprite("sprite", 1))]).bytes,
    ));
    let j = SerializedIndex::read(a.clone(), Limits::default(), &mut Work::new(10000)).unwrap();
    let sr = StreamResolver::for_sources(a, Arc::new(BytesSource::new(vec![]))).unwrap();
    assert!(matches!(
        crop(
            &j,
            &sr,
            0,
            rect(0, 0, 1, 1),
            &CropLimits::default(),
            &mut Work::new(10000)
        ),
        Err(Error::Corrupt("wrong object class"))
    ));
}

#[test]
fn mutable_dto_cannot_change_crop_and_output_outlives_source() {
    let b = bc1(0xf800, 0, (0..16).map(|_| 0));
    let (i, r) = setup(
        texture("owned", "", 0, 0, &b, 10, 4, 4, 1, 1),
        Arc::new(BytesSource::new(vec![])),
        Limits::default(),
    );
    let mut dto = i
        .read_texture(i.key(42).unwrap(), &mut Work::new(10000))
        .unwrap();
    dto.width = i32::MAX;
    dto.format = 999;
    dto.stream.offset = u64::MAX;
    dto.image_data.fill(0);
    let out = crop(
        &i,
        &r,
        0,
        rect(0, 0, 4, 4),
        &CropLimits::default(),
        &mut Work::new(10000),
    )
    .unwrap();
    drop(i);
    drop(r);
    assert_eq!(out.rgba(), [255, 0, 0, 255].repeat(16));
    assert_eq!(out.identity().format, 10);
}

#[test]
fn changed_source_during_final_decode_and_short_reads_propagate() {
    let b = bc1(0xf800, 0, (0..16).map(|_| 0));
    for at in [2, 3, 4, 5] {
        let s = Arc::new(Observed::new(b.clone()));
        s.change_at.store(at, Ordering::Relaxed);
        let (i, r) = setup(
            texture("change", "resources.assets.resS", 0, 8, &[], 10, 4, 4, 1, 1),
            s,
            Limits::default(),
        );
        assert!(
            matches!(
                crop(
                    &i,
                    &r,
                    0,
                    rect(0, 0, 4, 4),
                    &CropLimits::default(),
                    &mut Work::new(10000)
                ),
                Err(Error::ChangedSource)
            ),
            "stamp {at}"
        );
    }
    for n in [0, 1, 3] {
        let mut s = Observed::new(b.clone());
        s.short = n;
        let s = Arc::new(s);
        let (i, r) = setup(
            texture(
                "short reads",
                "resources.assets.resS",
                0,
                8,
                &[],
                10,
                4,
                4,
                1,
                1,
            ),
            s,
            Limits::default(),
        );
        let got = crop(
            &i,
            &r,
            0,
            rect(0, 0, 4, 4),
            &CropLimits::default(),
            &mut Work::new(10000),
        );
        if n == 0 {
            assert!(matches!(got, Err(Error::Corrupt("short source read"))));
        } else {
            assert_eq!(got.unwrap().rgba(), [255, 0, 0, 255].repeat(16));
        }
    }
}

#[test]
fn custom_read_cap_cannot_be_bypassed_and_huge_wire_dimensions_fail() {
    let s = Arc::new(Observed::new(vec![0; 64]));
    let (i, r) = setup(
        texture(
            "read cap",
            "resources.assets.resS",
            0,
            64,
            &[],
            25,
            8,
            8,
            1,
            1,
        ),
        s.clone(),
        Limits {
            read_bytes: 16,
            ..Default::default()
        },
    );
    assert!(matches!(
        crop(
            &i,
            &r,
            0,
            rect(0, 0, 8, 8),
            &CropLimits::default(),
            &mut Work::new(10000)
        ),
        Err(Error::Limit("range request"))
    ));
    assert!(s.reads.lock().unwrap().is_empty());
    let (i, r) = setup(
        texture(
            "overflow",
            "resources.assets.resS",
            0,
            0,
            &[],
            25,
            i32::MAX,
            i32::MAX,
            32,
            1,
        ),
        s.clone(),
        Limits::default(),
    );
    assert!(matches!(
        crop(
            &i,
            &r,
            0,
            rect(0, 0, u32::MAX, u32::MAX),
            &CropLimits::default(),
            &mut Work::new(10000)
        ),
        Err(Error::Corrupt(_))
    ));
    assert!(s.reads.lock().unwrap().is_empty());
}

#[test]
fn empty_and_unreviewed_texture_layouts_remain_readable_but_unsupported() {
    let (i, r) = setup(
        texture("empty", "", 0, 0, &[], 10, 0, 0, 1, 0),
        Arc::new(BytesSource::new(vec![])),
        Limits::default(),
    );
    assert!(matches!(
        crop(
            &i,
            &r,
            0,
            rect(0, 0, 1, 1),
            &CropLimits::default(),
            &mut Work::new(10000)
        ),
        Err(Error::UnsupportedLayout("texture has no pixel image"))
    ));
    assert_eq!(
        i.read_texture(i.key(42).unwrap(), &mut Work::new(10000))
            .unwrap()
            .image_count,
        0
    );
    for field in ["dimension", "images", "stripped"] {
        let mut t = texture("layout", "resources.assets.resS", 0, 8, &[], 10, 4, 4, 1, 1);
        // Wire offsets relative to the name's serialized aligned length.
        let name_end = 4 + "layout".len().div_ceil(4) * 4;
        let offset = name_end
            + match field {
                "dimension" => 44,
                "images" => 40,
                _ => 20,
            };
        patch32(&mut t, offset, if field == "dimension" { 3 } else { 2 });
        let (i, r) = setup(t, Arc::new(BytesSource::new(vec![0; 8])), Limits::default());
        assert!(
            matches!(
                crop(
                    &i,
                    &r,
                    0,
                    rect(0, 0, 1, 1),
                    &CropLimits::default(),
                    &mut Work::new(10000)
                ),
                Err(Error::UnsupportedLayout(_))
            ),
            "{field}"
        );
        assert!(i
            .read_texture(i.key(42).unwrap(), &mut Work::new(10000))
            .is_ok());
    }
}

#[test]
fn asset_change_after_pixel_read_refuses_success() {
    struct Mutator {
        bytes: BytesSource,
        assets: Arc<Observed>,
    }
    impl ReadAt for Mutator {
        fn stamp(&self) -> Result<SourceStamp> {
            self.bytes.stamp()
        }
        fn read_at(&self, offset: u64, out: &mut [u8]) -> Result<usize> {
            let n = self.bytes.read_at(offset, out)?;
            self.assets.revision.fetch_add(1, Ordering::Relaxed);
            Ok(n)
        }
    }
    let b = bc1(0xf800, 0, (0..16).map(|_| 0));
    let t = texture(
        "asset change",
        "resources.assets.resS",
        0,
        8,
        &[],
        10,
        4,
        4,
        1,
        1,
    );
    let a = Arc::new(Observed::new(fixture(vec![(42, 1, t)]).bytes));
    let i = SerializedIndex::read(a.clone(), Limits::default(), &mut Work::new(10000)).unwrap();
    let raw = i
        .read_texture(i.key(42).unwrap(), &mut Work::new(10000))
        .unwrap();
    let s = Arc::new(Mutator {
        bytes: BytesSource::new(b),
        assets: a.clone(),
    });
    let r = StreamResolver::for_sources(a, s).unwrap();
    assert!(matches!(
        crop(
            &i,
            &r,
            0,
            rect(0, 0, 4, 4),
            &CropLimits::default(),
            &mut Work::new(10000)
        ),
        Err(Error::ChangedSource)
    ));
    assert_eq!(raw.name, "asset change");
}

use super::*;
use crate::test_common::*;
use std::sync::atomic::{AtomicUsize, Ordering};

// Authored serialized fixtures; these parameters create source bytes rather
// than mutating a DTO returned by the public reader.
struct Shape {
    positions: Vec<[f32; 3]>,
    uv: Vec<[f32; 2]>,
    indices: Vec<u16>,
    rect: [f32; 4],
    original_rect: [f32; 4],
    ppu: f32,
    flags: u32,
    base: u32,
    first: u32,
    downscale: f32,
    submeshes: usize,
}
impl Shape {
    fn quad(translation: bool) -> Self {
        Self {
            positions: vec![
                [-1., -0.5, 0.],
                [3., -0.5, 0.],
                [3., 3.5, 0.],
                [-1., 3.5, 0.],
            ],
            uv: if translation {
                vec![[0., 0.], [1., 0.], [1., 1.], [0., 1.]]
            } else {
                vec![[0.; 2]; 4]
            },
            indices: vec![0, 1, 2, 0, 2, 3],
            rect: [0.125, 0.25, 3.875, 3.75],
            original_rect: [0., 0., 4., 4.],
            ppu: 1.,
            flags: 64,
            base: 0,
            first: 0,
            downscale: 1.,
            submeshes: 1,
        }
    }
    fn wire(&self) -> Vec<u8> {
        let mut w = W::default();
        w.str("authored");
        w.fs(&self.original_rect);
        w.fs(&[-0.5, 0.5]);
        w.fs(&[0.; 4]);
        w.f(self.ppu);
        w.fs(&[0.25, 0.75]);
        w.u32(0);
        w.u8(1);
        w.align();
        for _ in 0..4 {
            w.u32(0);
        }
        w.i64(-9);
        w.i32(0);
        w.ptr(0, 0);
        w.ptr(0, 42);
        w.ptr(0, 0);
        w.i32(0);
        w.i32(self.submeshes as i32);
        for _ in 0..self.submeshes {
            w.u32(0);
            w.u32(self.indices.len() as u32);
            w.i32(0);
            w.u32(self.base);
            w.u32(self.first);
            w.u32(self.positions.len() as u32 - self.first);
            w.fs(&[0.; 6]);
        }
        w.blob(
            &self
                .indices
                .iter()
                .flat_map(|i| i.to_le_bytes())
                .collect::<Vec<_>>(),
        );
        w.u32(self.positions.len() as u32);
        w.i32(5);
        w.bytes(&[0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 2]);
        let mut v = W::default();
        for (p, uv) in self.positions.iter().zip(&self.uv) {
            v.fs(p);
            v.fs(uv);
        }
        w.blob(&v.0);
        w.i32(0);
        w.fs(&self.rect);
        w.fs(&[-0.5, 0.5, -1., -1.]);
        w.u32(self.flags);
        w.fs(&[1., 0., 0., 1.]);
        w.f(self.downscale);
        w.i32(0);
        w.i32(0);
        w.0
    }
}
struct Observed {
    inner: BytesSource,
    reads: AtomicUsize,
    stamps: AtomicUsize,
    change_at: AtomicUsize,
}
impl Observed {
    fn new(b: Vec<u8>) -> Self {
        Self {
            inner: BytesSource::new(b),
            reads: AtomicUsize::new(0),
            stamps: AtomicUsize::new(0),
            change_at: AtomicUsize::new(usize::MAX),
        }
    }
}
impl ReadAt for Observed {
    fn stamp(&self) -> Result<SourceStamp> {
        let n = self.stamps.fetch_add(1, Ordering::Relaxed) + 1;
        let mut stamp = self.inner.stamp()?;
        if n >= self.change_at.load(Ordering::Relaxed) {
            stamp.revision = 1;
        }
        Ok(stamp)
    }
    fn read_at(&self, offset: u64, out: &mut [u8]) -> Result<usize> {
        self.reads.fetch_add(1, Ordering::Relaxed);
        self.inner.read_at(offset, out)
    }
}
fn tex(name: &str, w: i32, h: i32) -> Vec<u8> {
    texture(
        name,
        "resources.assets.resS",
        0,
        (((w + 3) / 4) * ((h + 3) / 4) * 8) as u32,
        &[],
        10,
        w,
        h,
        1,
        1,
    )
}
fn setup(
    shape: &Shape,
    name: &str,
    extras: Vec<(i64, i32, Vec<u8>)>,
    w: i32,
    h: i32,
) -> (
    SerializedIndex,
    StreamResolver,
    Arc<Observed>,
    Arc<Observed>,
) {
    let mut objects = vec![
        (-9007199254740997, 0, shape.wire()),
        (42, 1, tex(name, w, h)),
    ];
    objects.extend(extras);
    let a = Arc::new(Observed::new(fixture(objects).bytes));
    let b = Arc::new(Observed::new(
        [0u8, 248, 0, 0, 0, 0, 0, 0].repeat((((w + 3) / 4) * ((h + 3) / 4)) as usize),
    ));
    let i =
        SerializedIndex::read(a.clone(), Limits::default(), &mut Work::new(10_000_000)).unwrap();
    let r = StreamResolver::for_sources(a.clone(), b.clone()).unwrap();
    (i, r, a, b)
}
fn render(p: &SpritePlaneProvider<'_>, plane: SpritePlane, w: &mut Work) -> Result<SpritePixels> {
    p.reconstruct_sprite_plane(
        p.index.key(-9007199254740997)?,
        plane,
        &SpriteLimits::default(),
        w,
    )
}

#[test]
fn source_bound_triangle_local_p2_witness() {
    let positions = vec![
        [70., 111., 0.],
        [76., 72., 0.],
        [13., 5., 0.],
        [0., 0., 0.],
        [128., 0., 0.],
        [128., 129., 0.],
    ];
    let uv = positions
        .iter()
        .map(|p| [(p[0] + 32.) / 256., (p[1] + 48.) / 256.])
        .collect();
    let mut s = Shape::quad(true);
    s.positions = positions;
    s.uv = uv;
    s.indices = vec![0, 1, 2, 2, 3, 4, 1, 4, 5];
    s.rect = [32., 48., 128., 129.];
    s.original_rect = s.rect;
    let (i, r, _, b) = setup(&s, "authored", vec![], 256, 256);
    let mut w = Work::new(1_000_000);
    let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
    let got = render(&p, SpritePlane::Base, &mut w).unwrap();
    assert_eq!((got.width(), got.height()), (128, 129));
    let at = 4 * (70 * 128 + 41);
    assert_eq!(&got.rgba()[at..at + 4], &[255, 0, 0, 255]);
    assert_eq!(
        got.identity().crop.source_rect,
        TextureRect {
            x: 32,
            y: 48,
            width: 128,
            height: 129
        }
    );
    assert_eq!(b.reads.load(Ordering::Relaxed), 33); // One enclosing block-row crop.
}

#[test]
fn both_branches_raw_metadata_continuous_origin_and_pixel_orientation() {
    for translation in [false, true] {
        let s = Shape::quad(translation);
        let (i, r, _, _) = setup(&s, "AllTileSprites", vec![], 4, 4);
        let mut w = Work::new(100000);
        let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
        let got = render(&p, SpritePlane::Base, &mut w).unwrap();
        assert_eq!(got.rgba(), [255, 0, 0, 255].repeat(16));
        assert_eq!(got.mapping().origin_top_left, [1., 3.5]);
        assert_eq!(got.mapping().minimum, [-1., -0.5]);
        assert_eq!(got.sprite_metadata().render.texture_rect[0].value(), 0.125);
        assert_eq!(
            got.sprite_metadata()
                .render
                .atlas_rect_offset
                .map(F32::value),
            [-1., -1.]
        );
        assert_eq!(got.identity().raw_mask, RawMaskState::ExplicitlyUnmasked);
        assert!(matches!(
            render(&p, SpritePlane::PairedRawMask, &mut w),
            Err(Error::UnmaskedFamily)
        ));
    }
    // A manually authored asymmetric compressed block: source rows are palette
    // red, blue, interpolated1, interpolated2. Both planes retain RGBA and flip once.
    let s = Shape::quad(true);
    let (i, _, a, _) = setup(
        &s,
        "body16Sprites",
        vec![
            (43, 1, tex("body16Sprites_m", 4, 4)),
            (44, 0, sprite("body16Sprites_m", 42)),
        ],
        4,
        4,
    );
    let bytes = [0x00, 0xf8, 0x1f, 0x00, 0x00, 0x55, 0xaa, 0xff];
    let b = Arc::new(BytesSource::new(bytes.to_vec()));
    let r = StreamResolver::for_sources(a, b).unwrap();
    let mut w = Work::new(100000);
    let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
    for plane in [SpritePlane::Base, SpritePlane::PairedRawMask] {
        let got = render(&p, plane, &mut w).unwrap();
        let rows = [
            [85, 0, 170, 255],
            [170, 0, 85, 255],
            [0, 0, 255, 255],
            [255, 0, 0, 255],
        ];
        assert_eq!(
            got.rgba(),
            rows.into_iter()
                .flat_map(|r| r.repeat(4))
                .collect::<Vec<_>>()
        );
        assert_eq!(
            got.identity().raw_mask,
            RawMaskState::Paired(i.key(43).unwrap())
        );
        assert_eq!(
            got.mask_texture_metadata().is_some(),
            plane == SpritePlane::PairedRawMask
        );
    }
}

#[test]
fn pairing_zero_one_many_unknown_and_class_collisions() {
    for extras in [
        vec![],
        vec![
            (43, 1, tex("body15Sprites_m", 4, 4)),
            (44, 1, tex("body15Sprites_m", 4, 4)),
        ],
        vec![
            (43, 1, tex("body15Sprites", 4, 4)),
            (44, 1, tex("body15Sprites_m", 4, 4)),
        ],
    ] {
        let (i, r, _, b) = setup(&Shape::quad(true), "body15Sprites", extras, 4, 4);
        let mut w = Work::new(100000);
        let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
        assert!(matches!(
            render(&p, SpritePlane::PairedRawMask, &mut w),
            Err(Error::NotFound | Error::Ambiguous)
        ));
        assert_eq!(b.reads.load(Ordering::Relaxed), 0);
    }
    let (i, r, _, _) = setup(
        &Shape::quad(true),
        "unknown",
        vec![(43, 1, tex("unknown_m", 4, 4))],
        4,
        4,
    );
    let mut w = Work::new(100000);
    let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
    assert_eq!(
        render(&p, SpritePlane::Base, &mut w)
            .unwrap()
            .identity()
            .raw_mask,
        RawMaskState::UnknownFamily
    );
    assert!(matches!(
        render(&p, SpritePlane::PairedRawMask, &mut w),
        Err(Error::UnsupportedReference(_))
    ));
    let (i, r, _, b) = setup(
        &Shape::quad(true),
        "body15Sprites",
        vec![(43, 1, tex("body15Sprites_m", 8, 4))],
        4,
        4,
    );
    let mut w = Work::new(100000);
    let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
    assert!(matches!(
        render(&p, SpritePlane::PairedRawMask, &mut w),
        Err(Error::Corrupt("paired mask dimensions"))
    ));
    assert_eq!(b.reads.load(Ordering::Relaxed), 0);
}

#[test]
fn unsupported_geometry_and_raw_rectangle_fallback_are_refused() {
    for case in 0..10 {
        let mut s = Shape::quad(true);
        match case {
            0 => s.flags = 65,
            1 => s.flags = 64 | 4,
            2 => {
                s.base = 1;
                s.indices = vec![0, 1, 2];
            }
            3 => {
                s.first = 1;
                s.indices = vec![1, 2, 3];
            }
            4 => s.submeshes = 2,
            5 => s.uv[2][0] = 0.5,
            6 => s.positions[2][2] = 1.,
            7 => s.downscale = 0.5,
            8 => {
                s.uv = vec![[0.; 2]; 4];
                s.rect[2] = 2.;
            }
            _ => s.indices.clear(),
        }
        let (i, r, _, b) = setup(&s, "authored", vec![], 4, 4);
        let mut w = Work::new(100000);
        let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
        assert!(
            matches!(
                render(&p, SpritePlane::Base, &mut w),
                Err(Error::UnsupportedLayout(_) | Error::UnsupportedPacking(_) | Error::Corrupt(_))
            ),
            "case {case}"
        );
        assert_eq!(b.reads.load(Ordering::Relaxed), 0);
    }
}

#[test]
fn combined_nine_byte_pixel_plan_and_all_limits_precede_pixel_io() {
    let (i, r, _, b) = setup(&Shape::quad(true), "authored", vec![], 4, 4);
    let mut w = Work::new(100000);
    let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
    for case in 0..6 {
        let mut l = SpriteLimits::default();
        match case {
            0 => l.output_bytes = 63,
            1 => l.max_dimension = 3,
            2 => l.scratch_bytes = 2300,
            3 => l.crop.temporary_bytes = 7,
            4 => l.crop.decoded_blocks = 0,
            _ => l.crop.output_bytes = 63,
        }
        assert!(matches!(
            p.reconstruct_sprite_plane(
                i.key(-9007199254740997).unwrap(),
                SpritePlane::Base,
                &l,
                &mut w
            ),
            Err(Error::Limit(_))
        ));
        assert_eq!(b.reads.load(Ordering::Relaxed), 0);
    }
    let l = SpriteLimits {
        raster_visits: 0,
        ..SpriteLimits::default()
    };
    assert!(matches!(
        p.reconstruct_sprite_plane(
            i.key(-9007199254740997).unwrap(),
            SpritePlane::Base,
            &l,
            &mut w
        ),
        Err(Error::Limit("sprite raster visits"))
    ));
}

#[test]
fn cumulative_allowance_and_partial_last_visit_cancellation() {
    let (i, r, _, _) = setup(&Shape::quad(true), "authored", vec![], 4, 4);
    let mut prep = Work::new(10000);
    let p = r.prepare_sprite_planes(&i, &mut prep).unwrap();
    let mut measure = Work::new(1_000_000);
    measure.cancel_after_charges = Some(u64::MAX);
    render(&p, SpritePlane::Base, &mut measure).unwrap();
    let cost = 1_000_000 - measure.remaining();
    let charges = u64::MAX - measure.cancel_after_charges.unwrap();
    let mut exact = Work::new(cost);
    render(&p, SpritePlane::Base, &mut exact).unwrap();
    assert_eq!(exact.remaining(), 0);
    assert!(matches!(
        render(&p, SpritePlane::Base, &mut exact),
        Err(Error::Limit("work units"))
    ));
    for at in [1, 30, charges / 2, charges - 2, charges - 1, charges] {
        let mut w = Work::new(1_000_000);
        w.cancel_after_charges = Some(at);
        assert!(
            matches!(render(&p, SpritePlane::Base, &mut w), Err(Error::Cancelled)),
            "charge {at}"
        );
    }
    let mut cancelled = Work::new(0);
    cancelled.cancellation().store(true, Ordering::Relaxed);
    assert!(matches!(
        render(&p, SpritePlane::Base, &mut cancelled),
        Err(Error::Cancelled)
    ));
}

#[test]
fn final_completion_rechecks_both_sources_after_raster() {
    for change_assets in [false, true] {
        let (i, r, a, b) = setup(&Shape::quad(true), "authored", vec![], 4, 4);
        let mut w = Work::new(100000);
        let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
        a.stamps.store(0, Ordering::Relaxed);
        b.stamps.store(0, Ordering::Relaxed);
        render(&p, SpritePlane::Base, &mut w).unwrap();
        let target = if change_assets { &a } else { &b };
        let last = target.stamps.load(Ordering::Relaxed);
        target.stamps.store(0, Ordering::Relaxed);
        target.change_at.store(last, Ordering::Relaxed);
        assert!(matches!(
            render(&p, SpritePlane::Base, &mut w),
            Err(Error::ChangedSource)
        ));
    }
}

#[test]
fn source_scoped_keys_resolver_and_dto_authority() {
    let (i, r, _, _) = setup(&Shape::quad(true), "authored", vec![], 4, 4);
    let (other, other_r, _, _) = setup(&Shape::quad(true), "authored", vec![], 4, 4);
    let mut w = Work::new(100000);
    assert!(matches!(
        other_r.prepare_sprite_planes(&i, &mut w),
        Err(Error::UnsupportedReference(_))
    ));
    let p = r.prepare_sprite_planes(&i, &mut w).unwrap();
    assert!(matches!(
        p.reconstruct_sprite_plane(
            other.key(-9007199254740997).unwrap(),
            SpritePlane::Base,
            &SpriteLimits::default(),
            &mut w
        ),
        Err(Error::UnsupportedReference(_))
    ));
    assert!(matches!(
        p.reconstruct_sprite_plane(
            i.key(42).unwrap(),
            SpritePlane::Base,
            &SpriteLimits::default(),
            &mut w
        ),
        Err(Error::Corrupt(_))
    ));
    let mut forged = i
        .read_sprite(i.key(-9007199254740997).unwrap(), &mut w)
        .unwrap();
    forged.render.texture_rect[2] = F32::from_value(0.);
    assert_eq!(render(&p, SpritePlane::Base, &mut w).unwrap().width(), 4);
}

#[test]
fn name_walk_charges_nonmatching_objects_and_checks_last_visit() {
    let i = index(fixture(vec![(1, 3, vec![]), (2, 3, vec![]), (3, 3, vec![])]).bytes).unwrap();
    let mut low = Work::new(3);
    assert!(matches!(
        i.find_names(28, &["absent"], &mut low),
        Err(Error::Limit("work units"))
    ));
    let mut exact = Work::new(5);
    assert!(matches!(
        i.find_names(28, &["absent"], &mut exact).unwrap()["absent"],
        NameMatch::Zero
    ));
    assert_eq!(exact.remaining(), 0);
    let mut cancel = Work::new(3);
    cancel.cancel_after_charges = Some(3);
    assert!(matches!(
        i.find_names(28, &[], &mut cancel),
        Err(Error::Cancelled)
    ));
}

#[test]
fn rounding_degeneracy_and_local_vs_global_scan_witness() {
    assert_eq!(
        [0.5, 1.5, 2.5, -0.5, -1.5].map(|x| rounded(x).unwrap()),
        [0, 2, 2, 0, -2]
    );
    assert!(rounded(f64::INFINITY).is_err());
    assert!(rounded(16385.).is_err());
    let mut w = Work::new(1_000_000);
    let mut b = RasterWork::new(&mut w, 1_000_000);
    let tri = [
        Pt { x: 70, y: 111 },
        Pt { x: 76, y: 72 },
        Pt { x: 13, y: 5 },
    ];
    let mut global = vec![0; 128 * 129];
    polygon(
        tri,
        [128, 129],
        Pt { x: 0, y: 0 },
        128,
        129,
        &mut global,
        &mut b,
    )
    .unwrap();
    let mut local = vec![0; 128 * 129];
    polygon(
        tri.map(|p| Pt {
            x: p.x - 13,
            y: p.y - 5,
        }),
        [63, 106],
        Pt { x: 13, y: 5 },
        128,
        129,
        &mut local,
        &mut b,
    )
    .unwrap();
    assert_eq!((local[58 * 128 + 41], global[58 * 128 + 41]), (255, 0));
    for (tri, expected) in [
        (
            [Pt { x: 0, y: 0 }, Pt { x: 3, y: 0 }, Pt { x: 0, y: 3 }],
            ["####", "###.", "##..", "#..."],
        ),
        (
            [Pt { x: -2, y: 1 }, Pt { x: 5, y: 1 }, Pt { x: 2, y: 1 }],
            ["....", "####", "....", "...."],
        ),
        (
            [Pt { x: 1, y: -2 }, Pt { x: 1, y: 5 }, Pt { x: 1, y: 2 }],
            [".#..", ".#..", ".#..", ".#.."],
        ),
        ([Pt { x: 2, y: 2 }; 3], ["....", "....", "..#.", "...."]),
    ] {
        let mut mask = vec![0; 16];
        polygon(tri, [4, 4], Pt { x: 0, y: 0 }, 4, 4, &mut mask, &mut b).unwrap();
        let expected: Vec<u8> = expected
            .iter()
            .flat_map(|r| r.bytes().map(|c| if c == b'#' { 255 } else { 0 }))
            .collect();
        assert_eq!(mask, expected);
    }
}

#[test]
fn shared_float32_helper_keeps_aligned_streams_and_fractional_values() {
    let i = index(standard().bytes).unwrap();
    let s = i
        .read_sprite(i.key(-9).unwrap(), &mut Work::new(10000))
        .unwrap();
    let mut w = Work::new(10000);
    let streams = s.validated_geometry(&mut w).unwrap();
    assert_eq!(
        streams.channel(&s.render.vertices, 0, 1, &mut w).unwrap(),
        [1., 0., 0., 0.]
    );
    assert_eq!(
        streams.channel(&s.render.vertices, 1, 2, &mut w).unwrap(),
        [0., 1., 0., 0.]
    );
    // A fractional, negative source value is read as its original float32,
    // never quantized to the output grid by the shared stream owner.
    let mut v = s.render.vertices.clone();
    v.data[0..4].copy_from_slice(&(-0.234375f32).to_le_bytes());
    let streams = FloatStreams::validate(&v, &mut w).unwrap();
    assert_eq!(streams.channel(&v, 0, 0, &mut w).unwrap()[0], -0.234375);
}

#[test]
fn fallible_allocation_and_zero_loop_cancellation() {
    let mut w = Work::new(u64::MAX);
    assert!(matches!(
        crate::texture_crop::zeroed(usize::MAX, Some(&mut w)),
        Err(Error::Limit("crop allocation"))
    ));
    let mut w = Work::new(20000);
    w.cancel_after_charges = Some(2);
    assert!(matches!(
        crate::texture_crop::zeroed(12000, Some(&mut w)),
        Err(Error::Cancelled)
    ));
    assert_eq!(w.remaining(), 20000 - 8192);
    let mut w = Work::new(12);
    let out = crate::texture_crop::zeroed(12, Some(&mut w)).unwrap();
    assert_eq!(out, [0; 12]);
    assert_eq!(w.remaining(), 0);
}

#[test]
fn coverage_clears_hidden_rgb_without_replacing_covered_alpha() {
    let mut shape = Shape::quad(true);
    shape.indices = vec![0, 1, 3];
    let (i, _, _, _) = setup(&shape, "authored", vec![], 4, 4);
    let mut w = Work::new(100000);
    let (s, streams) = i
        .validated_sprite_geometry(i.key(-9007199254740997).unwrap(), &mut w)
        .unwrap();
    let t = i.read_texture(i.key(42).unwrap(), &mut w).unwrap();
    let plan = Plan::new(&s, &t, &streams, &SpriteLimits::default(), &mut w).unwrap();
    // Component test below the public source boundary: a transparent covered
    // texel retains its RGB/alpha; an uncovered texel clears all four channels.
    let raw = [12, 34, 56, 0].repeat(16);
    let got = plan
        .reconstruct(&s, &raw, &SpriteLimits::default(), &mut w)
        .unwrap();
    assert_eq!(&got[0..4], &[12, 34, 56, 0]);
    assert_eq!(&got[12..16], &[0; 4]);
    let raw = [12, 34, 56, 73].repeat(16);
    let got = plan
        .reconstruct(&s, &raw, &SpriteLimits::default(), &mut w)
        .unwrap();
    assert_eq!(&got[0..4], &[12, 34, 56, 73]);
    assert_eq!(&got[12..16], &[0; 4]);
}

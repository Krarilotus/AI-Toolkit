use crate::{test_common::*, *};

// Review24's serialized counterexample. Keep the original builder and all
// other wire fields intact; repeat legal overlapping descriptors, not DTOs.
fn repeated_spans(count: usize, indices: u32) -> Vec<u8> {
    let b = sprite("same", 42);
    assert_eq!(i32::from_le_bytes(b[136..140].try_into().unwrap()), 1);
    assert_eq!(i32::from_le_bytes(b[188..192].try_into().unwrap()), 6);
    let mut out = b[..136].to_vec();
    out.extend_from_slice(&i32::try_from(count).unwrap().to_le_bytes());
    let mut mesh = b[140..188].to_vec();
    mesh[4..8].copy_from_slice(&indices.to_le_bytes());
    for _ in 0..count {
        out.extend_from_slice(&mesh);
    }
    let bytes = indices.checked_mul(2).unwrap();
    out.extend_from_slice(&i32::try_from(bytes).unwrap().to_le_bytes());
    out.resize(out.len() + usize::try_from(bytes).unwrap(), 0);
    out.extend_from_slice(&b[200..]);
    out
}

fn with_texture(b: Vec<u8>) -> SerializedIndex {
    index(
        fixture(vec![
            (1, 0, b),
            (42, 1, texture("t", "", 0, 0, &[0; 16], 4, 2, 2, 1, 1)),
        ])
        .bytes,
    )
    .unwrap()
}

fn raw(i: &SerializedIndex) -> SpriteMetadata {
    i.read_sprite(i.key(1).unwrap(), &mut Work::new(OBJECT_CAP))
        .unwrap()
}

// The unchanged synthetic geometry visits 56 scalar/container entries, seven
// channel/layout entries and 23 vertex/channel/component entries. Each mesh
// then costs one descriptor + six bound scalars + its actual index visits.
const BEFORE_MESH: u64 = 86;
const MESH: u64 = 7;

#[test]
fn serialized_repeated_spans_exhaust_work_but_metadata_remains_available() {
    let b = repeated_spans(19_000, 32_766);
    assert_eq!(b.len(), 977_976);
    let len = b.len() as u64;
    assert!(len < Limits::default().object_bytes);
    assert_eq!(19_000u64.checked_mul(32_766).unwrap(), 622_554_000);
    let i = with_texture(b);
    let key = i.key(1).unwrap();
    let mut w = Work::new(len + 128);
    let s = i.read_sprite(key, &mut w).unwrap();
    assert_eq!(w.remaining(), 128);
    assert_eq!(s.render.submeshes.len(), 19_000);
    assert_eq!(s.render.index_buffer.len(), 65_532);
    assert!(s.render.submeshes.len() < ARRAY_CAP);
    assert!(s.render.index_buffer.len() < ARRAY_CAP);
    assert!(matches!(
        s.validate_geometry(&mut w),
        Err(Error::Limit("work units"))
    ));
    assert_eq!(w.remaining(), 0);
    assert_eq!(s, i.read_sprite(key, &mut Work::new(len)).unwrap());

    let mut w = Work::new(len + 128);
    assert!(matches!(
        i.validate_sprite(key, &mut w),
        Err(Error::Limit("work units"))
    ));
    assert_eq!(w.remaining(), 0);
    assert_eq!(w.selected, len); // No later texture read hid the missing gate.
}

#[test]
fn overlapping_spans_remain_valid_and_share_the_callers_allowance() {
    let i = with_texture(repeated_spans(2, 6));
    let s = raw(&i);
    let cost = BEFORE_MESH + 2 * (MESH + 6);
    let mut exact = Work::new(cost);
    s.validate_geometry(&mut exact).unwrap();
    assert_eq!(exact.remaining(), 0);
    let mut shared = Work::new(2 * cost - 1);
    s.validate_geometry(&mut shared).unwrap();
    assert_eq!(shared.remaining(), cost - 1);
    assert!(matches!(
        s.validate_geometry(&mut shared),
        Err(Error::Limit("work units"))
    ));
    assert_eq!(shared.remaining(), 0);

    let key = i.key(1).unwrap();
    let sprite_range = &i.entry(key).unwrap().range;
    let texture_range = &i.entry(i.key(42).unwrap()).unwrap().range;
    let sprite_bytes = sprite_range.end - sprite_range.start;
    let texture_bytes = texture_range.end - texture_range.start;
    let mut w = Work::new(sprite_bytes + cost + texture_bytes);
    assert_eq!(i.validate_sprite(key, &mut w).unwrap(), s);
    assert_eq!(w.remaining(), 0);
}

#[test]
fn serialized_cancellation_occurs_inside_repeated_index_validation() {
    const VISITS: u64 = 1024;
    let mut b = repeated_spans(19_000, 32_766);
    // An invalid index immediately after the cancellation witness. A control
    // pass must reach/reject it; a cancelled pass must stop before it.
    let index_start = 140 + 19_000 * 48 + 4;
    let witness = index_start + VISITS as usize * 2;
    b[witness..witness + 2].copy_from_slice(&3u16.to_le_bytes());
    let len = b.len() as u64;
    let i = with_texture(b);
    let s = raw(&i);
    let progress = BEFORE_MESH + MESH + VISITS;
    let mut control = Work::new(progress + 1);
    assert!(matches!(
        s.validate_geometry(&mut control),
        Err(Error::Corrupt("submesh index vertex"))
    ));
    assert_eq!(control.remaining(), 0);

    for through_index in [false, true] {
        let read = if through_index { len } else { 0 };
        let allowance = read + progress + 10_000;
        let mut w = Work::new(allowance);
        // The optional field exists only in the library unit-test build. It
        // sets the real atomic flag after an exact successful charge, without
        // sleeping, adding a public callback or changing validation control flow.
        w.cancel_after_charges = Some(progress + u64::from(through_index));
        let result = if through_index {
            i.validate_sprite(i.key(1).unwrap(), &mut w).map(|_| ())
        } else {
            s.validate_geometry(&mut w)
        };
        assert!(matches!(result, Err(Error::Cancelled)));
        assert!(w.cancellation().load(Ordering::Relaxed));
        assert!(w.cancel_after_charges.is_none());
        assert_eq!(w.remaining(), 10_000);
        assert_eq!(w.selected, read);
    }
    println!("serialized cancellation witness: 1024 completed index visits, stopped before invalid visit 1025; direct and index validation");
}

#[test]
fn cancellation_checks_cover_other_geometry_loops_and_the_last_visit() {
    let i = with_texture(sprite("same", 42));
    let s = raw(&i);
    let cost = BEFORE_MESH + MESH + 3;
    for charge in [27, 44, 49, 58, 65, 90, 95, 96] {
        // Bind poses, physics points, bones, channel comparisons, vertices,
        // submesh bounds and indices, including cancellation on the last visit.
        let mut w = Work::new(cost);
        w.cancel_after_charges = Some(charge);
        assert!(matches!(s.validate_geometry(&mut w), Err(Error::Cancelled)));
        assert_eq!(w.remaining(), cost - charge);
        assert!(w.cancel_after_charges.is_none());
    }
}

#[test]
fn empty_shapes_and_inactive_channels_still_cost_work() {
    let i = with_texture(sprite("same", 42));
    for mode in 0..2 {
        let mut s = raw(&i);
        if mode == 0 {
            s.physics_shapes = vec![vec![]; 1000];
        } else {
            s.render.vertices.channels = vec![
                Channel {
                    stream: 0,
                    offset: 0,
                    format: 0,
                    dimension: 0,
                };
                1000
            ];
        }
        let mut w = Work::new(64);
        assert!(matches!(
            s.validate_geometry(&mut w),
            Err(Error::Limit("work units"))
        ));
        assert_eq!(w.remaining(), 0);
    }
}

#[test]
fn work_arithmetic_does_not_wrap_and_pre_cancelled_geometry_spends_nothing() {
    let mut w = Work::new(u64::MAX);
    w.charge(u64::MAX).unwrap();
    assert_eq!(w.remaining(), 0);
    w.charge(0).unwrap();
    assert!(matches!(w.charge(1), Err(Error::Limit("work units"))));
    assert_eq!(w.remaining(), 0);
    let i = with_texture(sprite("same", 42));
    let mut s = raw(&i);
    let cost = BEFORE_MESH + MESH + 3;
    let mut w = Work::new(u64::MAX);
    s.validate_geometry(&mut w).unwrap();
    assert_eq!(w.remaining(), u64::MAX - cost);
    assert!(matches!(
        w.charge(u64::MAX),
        Err(Error::Limit("work units"))
    ));
    assert_eq!(w.remaining(), u64::MAX - cost);
    // Checked u64 span arithmetic must reject huge wire-sized index values.
    s.render.submeshes[0].first_byte = u32::MAX - 1;
    s.render.submeshes[0].index_count = u32::MAX;
    assert!(matches!(
        s.validate_geometry(&mut Work::new(u64::MAX)),
        Err(Error::Corrupt("range outside source"))
    ));
    let mut w = Work::new(17);
    w.cancellation().store(true, Ordering::Relaxed);
    assert!(matches!(s.validate_geometry(&mut w), Err(Error::Cancelled)));
    assert!(matches!(
        i.validate_sprite(i.key(1).unwrap(), &mut w),
        Err(Error::Cancelled)
    ));
    assert!(matches!(w.charge(u64::MAX), Err(Error::Cancelled)));
    assert_eq!(w.remaining(), 17);
    assert_eq!(w.selected, 0);
}

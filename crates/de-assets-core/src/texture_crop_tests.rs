use crate::{test_common::*, *};
use std::sync::atomic::{AtomicU64, Ordering};

struct Count {
    source: BytesSource,
    reads: AtomicU64,
}
impl ReadAt for Count {
    fn stamp(&self) -> Result<SourceStamp> {
        self.source.stamp()
    }
    fn read_at(&self, offset: u64, out: &mut [u8]) -> Result<usize> {
        self.reads.fetch_add(1, Ordering::Relaxed);
        self.source.read_at(offset, out)
    }
}

#[test]
fn cancellation_between_blocks_and_after_last_block_discards_crop() {
    let t = texture(
        "cancel",
        "resources.assets.resS",
        0,
        64,
        &[],
        25,
        8,
        8,
        1,
        1,
    );
    let n = t.len() as u64;
    let a: Arc<dyn ReadAt> = Arc::new(BytesSource::new(fixture(vec![(1, 1, t)]).bytes));
    let s = Arc::new(Count {
        source: BytesSource::new([0x40u8; 16].repeat(4)),
        reads: AtomicU64::new(0),
    });
    let i = SerializedIndex::read(a.clone(), Limits::default(), &mut Work::new(10000)).unwrap();
    let r = StreamResolver::for_sources(a, s.clone()).unwrap();
    let raw = i
        .read_texture(i.key(1).unwrap(), &mut Work::new(10000))
        .unwrap();
    // Successful charges: metadata, row1, block1, block2, row2, block3,
    // block4. The test injection uses the real atomic, absent in product builds.
    for (charges, spent, reads) in [(3, n + 32 + 1, 1), (7, n + 64 + 4, 2)] {
        s.reads.store(0, Ordering::Relaxed);
        let mut w = Work::new(10000);
        w.cancel_after_charges = Some(charges);
        assert!(matches!(
            r.crop_texture(
                &i,
                i.key(1).unwrap(),
                0,
                TextureRect {
                    x: 0,
                    y: 0,
                    width: 8,
                    height: 8
                },
                &CropLimits::default(),
                &mut w
            ),
            Err(Error::Cancelled)
        ));
        assert_eq!(w.remaining(), 10000 - spent);
        assert_eq!(s.reads.load(Ordering::Relaxed), reads);
        assert!(w.cancellation().load(Ordering::Relaxed));
        assert_eq!(
            raw,
            i.read_texture(i.key(1).unwrap(), &mut Work::new(10000))
                .unwrap()
        );
    }
}

#[test]
fn crop_plan_checked_overflow_refuses_before_allocation() {
    // Private arithmetic is tested beyond wire-sized dimensions as well.
    let m = MipRange {
        level: 0,
        width: u64::MAX,
        height: u64::MAX,
        range: 0..u64::MAX,
    };
    let rc = TextureRect {
        x: 0,
        y: 0,
        width: u32::MAX,
        height: u32::MAX,
    };
    let l = CropLimits {
        max_dimension: u32::MAX,
        output_bytes: u64::MAX,
        decoded_blocks: u64::MAX,
        temporary_bytes: u64::MAX,
    };
    assert!(matches!(
        super::Plan::new(&m, rc, 16, &l),
        Err(Error::Corrupt(_))
    ));
}

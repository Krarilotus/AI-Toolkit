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
fn fixture_for(path: &str, offset: u64, size: u32, inline: &[u8]) -> Vec<u8> {
    fixture(vec![(
        1,
        1,
        texture("t", path, offset, size, inline, 25, 4, 4, 1, 1),
    )])
    .bytes
}
#[test]
fn rejects_all_path_aliases() {
    for p in [
        "",
        "wrong.resS",
        "Resources.assets.resS",
        "resources.assets.ress",
        "./resources.assets.resS",
        ".\\resources.assets.resS",
        "../resources.assets.resS",
        "..\\resources.assets.resS",
        "resources.assets.resS/../x",
        "/resources.assets.resS",
        "C:\\resources.assets.resS",
        "C:resources.assets.resS",
        "\\\\host\\share\\resources.assets.resS",
        "\\\\?\\C:\\resources.assets.resS",
        "\\\\.\\resources.assets.resS",
        "resources.assets.resS:evil",
        "resources.assets.resS\0",
        "resources.assets.resS/",
        "resources.assets.resS.",
        "resources.assets.resS ",
        "resources.assets.resS-other/file",
    ] {
        assert!(validate_stream_path(p).is_err(), "{p:?}");
    }
    validate_stream_path("resources.assets.resS").unwrap();
}
#[test]
fn validated_ranges_inline_stream_and_limits() {
    let a: Arc<dyn ReadAt> = Arc::new(BytesSource::new(fixture_for(
        "resources.assets.resS",
        8,
        16,
        &[],
    )));
    let s: Arc<dyn ReadAt> = Arc::new(BytesSource::new((0..24).collect()));
    let r = StreamResolver::for_sources(a.clone(), s).unwrap();
    let i = SerializedIndex::read(a, Limits::default(), &mut work()).unwrap();
    let range = r.validate(&i, i.key(1).unwrap(), &mut work()).unwrap();
    let range = range.range();
    assert_eq!(range.length(), 16);
    let mut b = [0u8; 4];
    range.read_relative(12, &mut b, &mut work()).unwrap();
    assert_eq!(b, [20, 21, 22, 23]);
    range.read_relative(16, &mut [], &mut work()).unwrap();
    for o in [13, u64::MAX] {
        assert!(range.read_relative(o, &mut b, &mut work()).is_err());
    }
    assert!(matches!(
        range.read_relative(0, &mut vec![0; READ_CAP + 1], &mut work()),
        Err(Error::Limit(_))
    ));
    assert!(matches!(
        range.read_relative(0, &mut b, &mut Work::new(0)),
        Err(Error::Limit(_))
    ));
    let mut w = work();
    w.cancellation().store(true, Ordering::Relaxed);
    assert!(matches!(
        range.read_relative(0, &mut b, &mut w),
        Err(Error::Cancelled)
    ));
    let a: Arc<dyn ReadAt> = Arc::new(BytesSource::new(fixture_for("", 0, 0, &[4; 16])));
    let r = StreamResolver::for_sources(a.clone(), Arc::new(BytesSource::new(vec![]))).unwrap();
    let i = SerializedIndex::read(a, Limits::default(), &mut work()).unwrap();
    let range = r.validate(&i, i.key(1).unwrap(), &mut work()).unwrap();
    assert!(matches!(range, TextureRange::Inline(_)));
    range.range().read_relative(0, &mut b, &mut work()).unwrap();
    assert_eq!(b, [4; 4]);
}
#[test]
fn resolver_wrong_source_overflow_short_and_payload_mismatch() {
    for (p, o, size, inline, len) in [
        ("resources.assets.resS", u64::MAX, 16, vec![], 24),
        ("resources.assets.resS", 9, 16, vec![], 24),
        ("resources.assets.resS", 0, 16, vec![1], 24),
        ("wrong.resS", 0, 16, vec![], 24),
        ("", 1, 0, vec![0; 16], 0),
        ("", 0, 1, vec![0; 16], 0),
        ("resources.assets.resS", 0, 15, vec![], 24),
    ] {
        let a: Arc<dyn ReadAt> = Arc::new(BytesSource::new(fixture_for(p, o, size, &inline)));
        let r = StreamResolver::for_sources(a.clone(), Arc::new(BytesSource::new(vec![0; len])))
            .unwrap();
        let i = SerializedIndex::read(a, Limits::default(), &mut work()).unwrap();
        assert!(
            r.validate(&i, i.key(1).unwrap(), &mut work()).is_err(),
            "{p} {o} {size}"
        );
    }
    let a: Arc<dyn ReadAt> = Arc::new(BytesSource::new(fixture_for(
        "resources.assets.resS",
        0,
        16,
        &[],
    )));
    let r = StreamResolver::for_sources(a, Arc::new(BytesSource::new(vec![0; 16]))).unwrap();
    let i = index(fixture_for("resources.assets.resS", 0, 16, &[])).unwrap();
    assert!(matches!(
        r.validate(&i, i.key(1).unwrap(), &mut work()),
        Err(Error::UnsupportedReference(_))
    ));
}
struct MutableSource {
    changed: AtomicBool,
    short: AtomicBool,
    io: AtomicBool,
}
impl ReadAt for MutableSource {
    fn stamp(&self) -> Result<SourceStamp> {
        Ok(SourceStamp {
            identity: [3, 4],
            length: 16,
            revision: u128::from(self.changed.load(Ordering::Relaxed)),
        })
    }
    fn read_at(&self, _: u64, b: &mut [u8]) -> Result<usize> {
        if self.io.load(Ordering::Relaxed) {
            return Err(std::io::Error::other("range I/O").into());
        }
        if self.short.load(Ordering::Relaxed) {
            return Ok(0);
        }
        b.fill(7);
        Ok(b.len())
    }
}
#[test]
fn source_change_before_validation_and_after_token_short_io() {
    let a: Arc<dyn ReadAt> = Arc::new(BytesSource::new(fixture_for(
        "resources.assets.resS",
        0,
        16,
        &[],
    )));
    let s = Arc::new(MutableSource {
        changed: false.into(),
        short: false.into(),
        io: false.into(),
    });
    let r = StreamResolver::for_sources(a.clone(), s.clone()).unwrap();
    let i = SerializedIndex::read(a, Limits::default(), &mut work()).unwrap();
    let t = r.validate(&i, i.key(1).unwrap(), &mut work()).unwrap();
    s.changed.store(true, Ordering::Relaxed);
    assert!(matches!(
        r.validate(&i, i.key(1).unwrap(), &mut work()),
        Err(Error::ChangedSource)
    ));
    assert!(matches!(
        t.range().read_relative(0, &mut [0; 4], &mut work()),
        Err(Error::ChangedSource)
    ));
    s.changed.store(false, Ordering::Relaxed);
    s.short.store(true, Ordering::Relaxed);
    assert!(matches!(
        t.range().read_relative(0, &mut [0; 4], &mut work()),
        Err(Error::Corrupt(_))
    ));
    s.short.store(false, Ordering::Relaxed);
    s.io.store(true, Ordering::Relaxed);
    assert!(matches!(
        t.range().read_relative(0, &mut [0; 4], &mut work()),
        Err(Error::Io(_))
    ));
}
#[cfg(windows)]
mod windows {
    use super::*;
    use std::{
        fs::{self, OpenOptions},
        path::PathBuf,
        time::{SystemTime, UNIX_EPOCH},
    };
    struct Owned {
        root: PathBuf,
    }
    impl Owned {
        fn new() -> Self {
            let base = std::env::var_os("DE_ASSETS_TEST_SCRATCH")
                .map(PathBuf::from)
                .unwrap_or_else(|| PathBuf::from("S:/Projects/UCP/de-research/assets-core-a1"));
            let root = base.join(format!(
                "resolver-{}-{}",
                std::process::id(),
                SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_nanos()
            ));
            fs::create_dir_all(&root).unwrap();
            Self { root }
        }
    }
    impl Drop for Owned {
        fn drop(&mut self) {
            for name in ["resources.assets", "resources.assets.resS", "wrong.resS"] {
                let _ = fs::remove_file(self.root.join(name));
            }
            let _ = fs::remove_dir(&self.root);
        }
    }
    #[test]
    fn read_only_handle_containment_and_write_delete_denial() {
        let d = Owned::new();
        fs::write(
            d.root.join("resources.assets"),
            fixture_for("resources.assets.resS", 8, 16, &[]),
        )
        .unwrap();
        fs::write(d.root.join("resources.assets.resS"), [7u8; 24]).unwrap();
        let a = FileSource::open_data_root(&d.root).unwrap();
        let r = StreamResolver::for_file(a.clone()).unwrap();
        let i = SerializedIndex::read(a.clone(), Limits::default(), &mut work()).unwrap();
        let token = r.validate(&i, i.key(1).unwrap(), &mut work()).unwrap();
        for name in ["resources.assets", "resources.assets.resS"] {
            assert!(OpenOptions::new()
                .write(true)
                .open(d.root.join(name))
                .is_err());
            assert!(fs::remove_file(d.root.join(name)).is_err());
        }
        let mut bytes = [0; 8];
        token
            .range()
            .read_relative(4, &mut bytes, &mut work())
            .unwrap();
        assert_eq!(bytes, [7; 8]);
        assert_eq!(fs::read_dir(&d.root).unwrap().count(), 2);
        drop(token);
        drop(i);
        drop(r);
        drop(a);
        fs::write(d.root.join("resources.assets.resS"), [0u8; 4]).unwrap();
        let a = FileSource::open_data_root(&d.root).unwrap();
        let r = StreamResolver::for_file(a.clone()).unwrap();
        let i = SerializedIndex::read(a, Limits::default(), &mut work()).unwrap();
        assert!(r.validate(&i, i.key(1).unwrap(), &mut work()).is_err());
    }
    #[test]
    fn no_fallback_to_wrong_sibling_or_parent() {
        let d = Owned::new();
        fs::write(
            d.root.join("resources.assets"),
            fixture_for("resources.assets.resS", 0, 16, &[]),
        )
        .unwrap();
        fs::write(d.root.join("wrong.resS"), [0u8; 16]).unwrap();
        let a = FileSource::open_data_root(&d.root).unwrap();
        let r = StreamResolver::for_file(a.clone()).unwrap();
        let i = SerializedIndex::read(a, Limits::default(), &mut work()).unwrap();
        assert!(matches!(
            r.validate(&i, i.key(1).unwrap(), &mut work()),
            Err(Error::Io(_))
        ));
        assert_eq!(fs::read_dir(&d.root).unwrap().count(), 2);
    }
    #[test]
    fn final_component_symlink_escape_is_rejected_when_available() {
        let d = Owned::new();
        let outside = Owned::new();
        fs::write(
            d.root.join("resources.assets"),
            fixture_for("resources.assets.resS", 0, 16, &[]),
        )
        .unwrap();
        fs::write(outside.root.join("resources.assets.resS"), [0u8; 16]).unwrap();
        match std::os::windows::fs::symlink_file(outside.root.join("resources.assets.resS"),d.root.join("resources.assets.resS")){
            Ok(())=>{let a=FileSource::open_data_root(&d.root).unwrap();let r=StreamResolver::for_file(a.clone()).unwrap();let i=SerializedIndex::read(a,Limits::default(),&mut work()).unwrap();assert!(matches!(r.validate(&i,i.key(1).unwrap(),&mut work()),Err(Error::UnsupportedReference(_))));},
            Err(e) if e.raw_os_error()==Some(1314)=>eprintln!("explicit environment limitation: symlink privilege unavailable; junction test covers reparse"),
            Err(e)=>panic!("symlink fixture: {e}"),
        }
    }
    #[test]
    fn junction_directory_in_stream_position_is_rejected() {
        let d = Owned::new();
        let outside = Owned::new();
        fs::write(
            d.root.join("resources.assets"),
            fixture_for("resources.assets.resS", 0, 16, &[]),
        )
        .unwrap();
        let link = d.root.join("resources.assets.resS");
        let quote = |p: &std::path::Path| p.to_str().unwrap().replace('\'', "''");
        let script = format!(
            "New-Item -ItemType Junction -Path '{}' -Target '{}' -ErrorAction Stop | Out-Null",
            quote(&link),
            quote(&outside.root)
        );
        let result = std::process::Command::new("powershell.exe")
            .args(["-NoProfile", "-NonInteractive", "-Command", &script])
            .output()
            .unwrap();
        assert!(
            result.status.success(),
            "{}",
            String::from_utf8_lossy(&result.stderr)
        );
        let a = FileSource::open_data_root(&d.root).unwrap();
        let r = StreamResolver::for_file(a.clone()).unwrap();
        let i = SerializedIndex::read(a, Limits::default(), &mut work()).unwrap();
        assert!(r.validate(&i, i.key(1).unwrap(), &mut work()).is_err());
        // Nonrecursive removal of the exact owned junction, never its target.
        assert!(link.starts_with(&d.root));
        fs::remove_dir(&link).unwrap();
        assert!(outside.root.is_dir());
    }
    #[test]
    fn rejects_network_device_and_relative_initial_roots_before_open() {
        for root in [
            "C:relative",
            "relative",
            "\\\\server\\share",
            "\\\\?\\C:\\device",
            "C:\\safe\\..\\other",
        ] {
            assert!(matches!(
                FileSource::open_data_root(root),
                Err(Error::UnsupportedReference(_))
            ));
        }
    }
}

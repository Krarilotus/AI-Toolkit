use crate::*;
use std::{
    fs::File,
    io::{Read, Seek, SeekFrom},
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicU64, Ordering},
        Mutex,
    },
};

/// An opened input's identity and change indicator. Not a content digest.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SourceStamp {
    pub identity: [u64; 2],
    pub length: u64,
    pub revision: u128,
}
/// Implementors must identify the same opened input on every call and report
/// observable mutations. read_at may return short reads; zero means EOF.
pub trait ReadAt: Send + Sync {
    fn stamp(&self) -> Result<SourceStamp>;
    fn read_at(&self, offset: u64, output: &mut [u8]) -> Result<usize>;
}
static NEXT_ID: AtomicU64 = AtomicU64::new(1);
pub(crate) fn next_id() -> u64 {
    NEXT_ID.fetch_add(1, Ordering::Relaxed)
}
pub struct BytesSource {
    bytes: Vec<u8>,
    id: u64,
}
impl BytesSource {
    pub fn new(bytes: Vec<u8>) -> Self {
        Self {
            bytes,
            id: next_id(),
        }
    }
}
impl ReadAt for BytesSource {
    fn stamp(&self) -> Result<SourceStamp> {
        Ok(SourceStamp {
            identity: [0, self.id],
            length: self.bytes.len() as u64,
            revision: 0,
        })
    }
    fn read_at(&self, offset: u64, output: &mut [u8]) -> Result<usize> {
        let offset = usize_of(offset)?;
        let bytes = self
            .bytes
            .get(offset..)
            .ok_or(Error::Corrupt("read offset"))?;
        let n = output.len().min(bytes.len());
        output[..n].copy_from_slice(&bytes[..n]);
        Ok(n)
    }
}
pub(crate) fn checked_read(
    source: &dyn ReadAt,
    stamp: &SourceStamp,
    offset: u64,
    output: &mut [u8],
    limits: &Limits,
    work: &mut Work,
) -> Result<()> {
    if limits.read_bytes == 0 {
        return Err(Error::Limit("zero read cap"));
    }
    work.charge(output.len() as u64)?;
    span(offset, output.len() as u64, stamp.length)?;
    if source.stamp()? != *stamp {
        return Err(Error::ChangedSource);
    }
    let mut done = 0;
    while done < output.len() {
        work.check()?;
        let end = done
            .checked_add(limits.read_bytes.max(1))
            .unwrap_or(output.len())
            .min(output.len());
        let n = match source.read_at(add(offset, done as u64)?, &mut output[done..end]) {
            Ok(n) => n,
            Err(e) => {
                if source.stamp()? != *stamp {
                    return Err(Error::ChangedSource);
                }
                return Err(e);
            }
        };
        if n == 0 {
            if source.stamp()? != *stamp {
                return Err(Error::ChangedSource);
            }
            return Err(Error::Corrupt("short source read"));
        }
        if n > end - done {
            return Err(Error::Corrupt("ReadAt returned invalid length"));
        }
        done += n;
    }
    if source.stamp()? != *stamp {
        return Err(Error::ChangedSource);
    }
    Ok(())
}

/// Windows input opened with FILE_SHARE_READ (no write/delete sharing).
/// Only the initial caller-selected directory and literal sibling names open.
pub struct FileSource {
    file: Mutex<File>,
    root: Arc<Root>,
    name: &'static str,
    stamp: SourceStamp,
}
struct Root {
    path: PathBuf,
    handle: File,
}
impl FileSource {
    pub fn open_data_root(root: impl AsRef<Path>) -> Result<Arc<Self>> {
        platform::validate_root(root.as_ref())?;
        let path = std::fs::canonicalize(root)?;
        platform::validate_canonical_root(&path)?;
        let handle = platform::open_root(&path)?;
        if platform::final_path(&handle)? != path {
            return Err(Error::ChangedSource);
        }
        Self::open_sibling(Arc::new(Root { path, handle }), "resources.assets")
    }
    fn open_sibling(root: Arc<Root>, name: &'static str) -> Result<Arc<Self>> {
        if platform::final_path(&root.handle)? != root.path {
            return Err(Error::ChangedSource);
        }
        let expected = root.path.join(name);
        let file = platform::open_file(&expected)?;
        if platform::final_path(&file)? != expected {
            return Err(Error::UnsupportedReference("reparse or non-sibling file"));
        }
        let stamp = platform::stamp(&file)?;
        Ok(Arc::new(Self {
            file: Mutex::new(file),
            root,
            name,
            stamp,
        }))
    }
    pub(crate) fn sibling(&self) -> Result<Arc<Self>> {
        Self::open_sibling(self.root.clone(), "resources.assets.resS")
    }
    pub(crate) fn is_assets(&self) -> bool {
        self.name == "resources.assets"
    }
    pub fn original_stamp(&self) -> &SourceStamp {
        &self.stamp
    }
}
impl ReadAt for FileSource {
    fn stamp(&self) -> Result<SourceStamp> {
        let file = self
            .file
            .lock()
            .map_err(|_| Error::Io(std::io::Error::other("poisoned source lock")))?;
        if platform::final_path(&self.root.handle)? != self.root.path
            || platform::final_path(&file)? != self.root.path.join(self.name)
        {
            return Err(Error::ChangedSource);
        }
        platform::stamp(&file)
    }
    fn read_at(&self, offset: u64, output: &mut [u8]) -> Result<usize> {
        let mut file = self
            .file
            .lock()
            .map_err(|_| Error::Io(std::io::Error::other("poisoned source lock")))?;
        file.seek(SeekFrom::Start(offset))?;
        Ok(file.read(output)?)
    }
}
#[cfg(windows)]
mod platform {
    use super::*;
    use std::fs::OpenOptions;
    use std::os::windows::{ffi::OsStringExt, fs::OpenOptionsExt, io::AsRawHandle};
    use std::{
        ffi::{c_void, OsString},
        mem::MaybeUninit,
    };
    #[repr(C)]
    struct Time {
        low: u32,
        high: u32,
    }
    #[repr(C)]
    struct Info {
        attrs: u32,
        created: Time,
        accessed: Time,
        written: Time,
        volume: u32,
        size_high: u32,
        size_low: u32,
        links: u32,
        id_high: u32,
        id_low: u32,
    }
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetFileInformationByHandle(handle: *mut c_void, info: *mut Info) -> i32;
        fn GetFinalPathNameByHandleW(
            handle: *mut c_void,
            path: *mut u16,
            size: u32,
            flags: u32,
        ) -> u32;
        fn GetVolumeInformationByHandleW(
            handle: *mut c_void,
            volume: *mut u16,
            volume_size: u32,
            serial: *mut u32,
            max_component: *mut u32,
            flags: *mut u32,
            filesystem: *mut u16,
            filesystem_size: u32,
        ) -> i32;
        fn GetDriveTypeW(root: *const u16) -> u32;
    }
    pub fn validate_root(path: &Path) -> Result<()> {
        use std::path::{Component, Prefix};
        if !path.is_absolute()
            || !matches!(path.components().next(),Some(Component::Prefix(p)) if matches!(p.kind(),Prefix::Disk(_)))
            || path.components().any(|c| matches!(c, Component::ParentDir))
        {
            return Err(Error::UnsupportedReference(
                "initial data root must be a local absolute disk directory",
            ));
        }
        Ok(())
    }
    pub fn open_root(path: &Path) -> Result<File> {
        let handle = OpenOptions::new()
            .access_mode(0x80)
            .share_mode(3)
            .custom_flags(0x02000000)
            .open(path)?;
        let mut filesystem = [0u16; 32];
        // SAFETY: live directory handle, optional outputs null, bounded buffer.
        if unsafe {
            GetVolumeInformationByHandleW(
                handle.as_raw_handle(),
                std::ptr::null_mut(),
                0,
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                filesystem.as_mut_ptr(),
                32,
            )
        } == 0
        {
            return Err(std::io::Error::last_os_error().into());
        }
        let end = filesystem
            .iter()
            .position(|c| *c == 0)
            .ok_or(Error::Limit("filesystem name"))?;
        if OsString::from_wide(&filesystem[..end]) != "NTFS" {
            return Err(Error::UnsupportedLayout(
                "filesystem inputs require audited NTFS handle identity",
            ));
        }
        Ok(handle)
    }
    pub fn validate_canonical_root(path: &Path) -> Result<()> {
        use std::path::{Component, Prefix};
        let disk = match path.components().next() {
            Some(Component::Prefix(p)) => match p.kind() {
                Prefix::VerbatimDisk(d) | Prefix::Disk(d) => d,
                _ => return Err(Error::UnsupportedReference("nonlocal canonical root")),
            },
            _ => return Err(Error::UnsupportedReference("canonical disk root")),
        };
        let root = [u16::from(disk), u16::from(b':'), u16::from(b'\\'), 0];
        // SAFETY: NUL-terminated drive-root buffer.
        if unsafe { GetDriveTypeW(root.as_ptr()) } != 3 {
            return Err(Error::UnsupportedLayout(
                "filesystem inputs require a fixed local disk",
            ));
        }
        Ok(())
    }
    pub fn open_file(path: &Path) -> Result<File> {
        // OPEN_REPARSE_POINT prevents following a final-component link. Reject
        // that handle's reparse attribute as well as checking its final path.
        let f = OpenOptions::new()
            .read(true)
            .share_mode(1)
            .custom_flags(0x00200000)
            .open(path)?;
        if info(&f)?.attrs & 0x400 != 0 {
            return Err(Error::UnsupportedReference("reparse file"));
        }
        Ok(f)
    }
    fn info(file: &File) -> Result<Info> {
        let mut info = MaybeUninit::<Info>::uninit();
        // SAFETY: correct Windows ABI, live handle and writable Info buffer.
        if unsafe { GetFileInformationByHandle(file.as_raw_handle(), info.as_mut_ptr()) } == 0 {
            return Err(std::io::Error::last_os_error().into());
        }
        Ok(unsafe { info.assume_init() })
    }
    pub fn stamp(file: &File) -> Result<SourceStamp> {
        let i = info(file)?;
        if i.attrs & 0x10 != 0 {
            return Err(Error::UnsupportedReference("expected regular file"));
        }
        Ok(SourceStamp {
            identity: [
                u64::from(i.volume),
                (u64::from(i.id_high) << 32) | u64::from(i.id_low),
            ],
            length: (u64::from(i.size_high) << 32) | u64::from(i.size_low),
            revision: ((u128::from(i.written.high) << 32) | u128::from(i.written.low))
                | ((u128::from(i.created.high) << 96) | (u128::from(i.created.low) << 64)),
        })
    }
    pub fn final_path(file: &File) -> Result<PathBuf> {
        let mut short = [0u16; 512];
        // SAFETY: live handle, buffer length supplied in UTF-16 units.
        let n =
            unsafe { GetFinalPathNameByHandleW(file.as_raw_handle(), short.as_mut_ptr(), 512, 0) };
        if n == 0 {
            return Err(std::io::Error::last_os_error().into());
        }
        if n < 512 {
            return Ok(PathBuf::from(OsString::from_wide(
                &short[..usize::try_from(n).map_err(|_| Error::Limit("path"))?],
            )));
        }
        if n >= 32768 {
            return Err(Error::Limit("final path"));
        }
        let capacity = n.checked_add(1).ok_or(Error::Limit("path"))?;
        let mut v = vec![0u16; usize::try_from(capacity).map_err(|_| Error::Limit("path"))?];
        // SAFETY: same live handle, exactly capacity writable UTF-16 units.
        let actual =
            unsafe { GetFinalPathNameByHandleW(file.as_raw_handle(), v.as_mut_ptr(), capacity, 0) };
        if actual == 0 {
            return Err(std::io::Error::last_os_error().into());
        }
        if actual >= capacity {
            return Err(Error::ChangedSource);
        }
        v.truncate(usize::try_from(actual).map_err(|_| Error::Limit("path"))?);
        Ok(PathBuf::from(OsString::from_wide(&v)))
    }
}
#[cfg(not(windows))]
mod platform {
    use super::*;
    pub fn validate_canonical_root(_: &Path) -> Result<()> {
        Err(Error::UnsupportedLayout(
            "handle-contained resolver currently Windows only",
        ))
    }
    pub fn validate_root(_: &Path) -> Result<()> {
        Err(Error::UnsupportedLayout(
            "handle-contained resolver currently Windows only",
        ))
    }
    pub fn open_root(_: &Path) -> Result<File> {
        Err(Error::UnsupportedLayout(
            "handle-contained resolver currently Windows only",
        ))
    }
    pub fn open_file(_: &Path) -> Result<File> {
        Err(Error::UnsupportedLayout(
            "handle-contained resolver currently Windows only",
        ))
    }
    pub fn stamp(_: &File) -> Result<SourceStamp> {
        Err(Error::UnsupportedLayout("Windows input required"))
    }
    pub fn final_path(_: &File) -> Result<PathBuf> {
        Err(Error::UnsupportedLayout("Windows input required"))
    }
}

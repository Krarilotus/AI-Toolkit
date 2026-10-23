//! Read-only metadata, bounded crops and unpacked Sprite planes; no scene renderer.
//! See README.md for the audited profile and mutation/OS guarantees.
mod cursor;
mod geometry;
mod metadata;
mod reader;
mod serialized;
mod sprite_catalogue;
mod sprite_pixels;
mod sprite_raster;
mod streams;
mod texture_crop;

pub use metadata::*;
pub use reader::{BytesSource, FileSource, ReadAt, SourceStamp};
pub use serialized::*;
pub use sprite_catalogue::*;
pub use sprite_pixels::*;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
pub use streams::*;
pub use texture_crop::*;

#[derive(Debug)]
pub enum Error {
    Corrupt(&'static str),
    UnsupportedLayout(&'static str),
    UnsupportedReference(&'static str),
    UnsupportedPacking(u32),
    UnsupportedFormat(i32),
    Limit(&'static str),
    NotFound,
    Ambiguous,
    /// A source-proven resource family deliberately has no raw team mask.
    UnmaskedFamily,
    ChangedSource,
    Cancelled,
    Io(std::io::Error),
}
impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{self:?}")
    }
}
impl std::error::Error for Error {}
impl From<std::io::Error> for Error {
    fn from(e: std::io::Error) -> Self {
        Self::Io(e)
    }
}
pub type Result<T> = std::result::Result<T, Error>;

pub const METADATA_CAP: u64 = 16 * 1024 * 1024;
pub const OBJECT_CAP: u64 = 1024 * 1024;
pub const ARRAY_CAP: usize = 65_536;
pub const SELECTED_CAP: u64 = 16 * 1024 * 1024;
pub const READ_CAP: usize = 1024 * 1024;
#[derive(Clone, Debug)]
pub struct Limits {
    pub metadata_bytes: u64,
    pub types: usize,
    pub objects: usize,
    pub scripts: usize,
    pub externals: usize,
    pub reference_types: usize,
    pub string_bytes: usize,
    pub object_bytes: u64,
    pub array_elements: usize,
    pub blob_bytes: usize,
    pub nesting: usize,
    pub selected_bytes: u64,
    pub name_bytes: u64,
    pub read_bytes: usize,
}
impl Default for Limits {
    fn default() -> Self {
        Self {
            metadata_bytes: METADATA_CAP,
            types: 256,
            objects: 250_000,
            scripts: 4096,
            externals: 64,
            reference_types: 64,
            string_bytes: 4096,
            object_bytes: OBJECT_CAP,
            array_elements: ARRAY_CAP,
            blob_bytes: READ_CAP,
            nesting: 16,
            selected_bytes: SELECTED_CAP,
            name_bytes: 32 * 1024 * 1024,
            read_bytes: READ_CAP,
        }
    }
}
/// Caller-owned cumulative allowance: one unit per byte read and per geometry
/// scalar/loop visit, decoded block and Sprite buffer byte zeroed. Reuse across a
/// whole operation, including preparation/validation. Reads, loops, zero chunks
/// and decode charges check cancellation; completion checks the last visit.
pub struct Work {
    remaining: u64,
    selected: u64,
    cancel: Arc<AtomicBool>,
    // Deterministic mid-operation cancellation injection; absent from builds
    // consumed by applications and integration tests.
    #[cfg(test)]
    cancel_after_charges: Option<u64>,
}
impl Work {
    pub fn new(units: u64) -> Self {
        Self {
            remaining: units,
            selected: 0,
            cancel: Arc::new(AtomicBool::new(false)),
            #[cfg(test)]
            cancel_after_charges: None,
        }
    }
    pub fn cancellation(&self) -> Arc<AtomicBool> {
        self.cancel.clone()
    }
    pub fn remaining(&self) -> u64 {
        self.remaining
    }
    pub fn check(&self) -> Result<()> {
        if self.cancel.load(Ordering::Relaxed) {
            Err(Error::Cancelled)
        } else {
            Ok(())
        }
    }
    pub(crate) fn charge(&mut self, n: u64) -> Result<()> {
        self.check()?;
        self.remaining = self
            .remaining
            .checked_sub(n)
            .ok_or(Error::Limit("work units"))?;
        #[cfg(test)]
        if let Some(left) = &mut self.cancel_after_charges {
            *left = left.checked_sub(1).expect("positive test charge countdown");
            if *left == 0 {
                self.cancel.store(true, Ordering::Relaxed);
                self.cancel_after_charges = None;
            }
        }
        Ok(())
    }
    pub(crate) fn select(&mut self, n: u64, cap: u64) -> Result<()> {
        self.check()?;
        self.selected = add(self.selected, n)?;
        if self.selected > cap {
            return Err(Error::Limit("selected objects"));
        }
        Ok(())
    }
}

#[cfg(test)]
extern crate self as de_assets_core;
#[cfg(test)]
mod geometry_tests;
#[cfg(test)]
#[path = "../tests/common/mod.rs"]
mod test_common;
pub(crate) fn add(a: u64, b: u64) -> Result<u64> {
    a.checked_add(b).ok_or(Error::Corrupt("addition overflow"))
}
pub(crate) fn mul(a: u64, b: u64) -> Result<u64> {
    a.checked_mul(b)
        .ok_or(Error::Corrupt("multiplication overflow"))
}
pub(crate) fn usize_of(n: u64) -> Result<usize> {
    usize::try_from(n).map_err(|_| Error::Limit("address space"))
}
pub(crate) fn span(offset: u64, size: u64, len: u64) -> Result<()> {
    if offset > len || size > len - offset {
        Err(Error::Corrupt("range outside source"))
    } else {
        Ok(())
    }
}

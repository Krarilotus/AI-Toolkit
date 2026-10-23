use crate::{reader::checked_read, *};
/// Resolves one initially selected input pair. It has no pathname/range setter.
pub struct StreamResolver {
    assets: Arc<dyn ReadAt>,
    assets_stamp: SourceStamp,
    stream: StreamInput,
}
enum StreamInput {
    File(Arc<FileSource>),
    Supplied(Arc<dyn ReadAt>, SourceStamp),
}
pub enum TextureRange {
    Inline(VerifiedRange),
    Stream(VerifiedRange),
}
impl TextureRange {
    pub fn range(&self) -> &VerifiedRange {
        match self {
            Self::Inline(r) | Self::Stream(r) => r,
        }
    }
}
pub struct VerifiedRange {
    source: Arc<dyn ReadAt>,
    stamp: SourceStamp,
    start: u64,
    length: u64,
    limits: Limits,
    mips: Vec<MipRange>,
}
impl VerifiedRange {
    pub fn source_stamp(&self) -> &SourceStamp {
        &self.stamp
    }
    pub fn length(&self) -> u64 {
        self.length
    }
    pub fn mips(&self) -> &[MipRange] {
        &self.mips
    }
    pub fn read_relative(&self, offset: u64, output: &mut [u8], work: &mut Work) -> Result<()> {
        work.check()?;
        if output.len() > self.limits.read_bytes {
            return Err(Error::Limit("range request"));
        }
        span(offset, output.len() as u64, self.length)?;
        checked_read(
            &*self.source,
            &self.stamp,
            add(self.start, offset)?,
            output,
            &self.limits,
            work,
        )
    }
}
/// Literal match deliberately rejects case, separators, traversal, ADS, drive,
/// UNC/device and normalized aliases. Unsupported paths remain metadata.
pub fn validate_stream_path(path: &str) -> Result<()> {
    if path == "resources.assets.resS" {
        Ok(())
    } else {
        Err(Error::UnsupportedReference(
            "stream path is not literal resources.assets.resS",
        ))
    }
}
impl StreamResolver {
    pub fn for_file(assets: Arc<FileSource>) -> Result<Self> {
        if !assets.is_assets() {
            return Err(Error::UnsupportedReference("assets input required"));
        }
        let assets_stamp = assets.stamp()?;
        Ok(Self {
            assets: assets.clone(),
            assets_stamp,
            stream: StreamInput::File(assets),
        })
    }
    /// For owned in-memory/testing/virtual inputs. ReadAt's identity/change
    /// contract is the implementor's responsibility; this opens no filesystem.
    pub fn for_sources(assets: Arc<dyn ReadAt>, stream: Arc<dyn ReadAt>) -> Result<Self> {
        let assets_stamp = assets.stamp()?;
        let stamp = stream.stamp()?;
        Ok(Self {
            assets,
            assets_stamp,
            stream: StreamInput::Supplied(stream, stamp),
        })
    }
    /// Re-reads the indexed object. Publicly mutable metadata cannot forge a
    /// validated span. Returned token retains the actual opened input.
    pub fn validate(
        &self,
        index: &SerializedIndex,
        key: ObjectKey,
        work: &mut Work,
    ) -> Result<TextureRange> {
        let t = self.read_owned_texture(index, key, work)?;
        self.resolve_texture(index, &t)
    }
    // Shared by validation and crops. Metadata comes only from the owning index;
    // these internal methods are never a public mutable-DTO authority boundary.
    pub(crate) fn read_owned_texture(
        &self,
        index: &SerializedIndex,
        key: ObjectKey,
        work: &mut Work,
    ) -> Result<TextureMetadata> {
        self.check_index(index)?;
        index.read_texture(key, work)
    }
    pub(crate) fn check_index(&self, index: &SerializedIndex) -> Result<()> {
        if !Arc::ptr_eq(&self.assets, &index.source) || self.assets_stamp != index.stamp {
            return Err(Error::UnsupportedReference(
                "resolver belongs to another opened input",
            ));
        }
        Ok(())
    }
    pub(crate) fn resolve_texture(
        &self,
        index: &SerializedIndex,
        t: &TextureMetadata,
    ) -> Result<TextureRange> {
        let mips = t.mip_ranges()?;
        let (source, stamp, start, length, inline): (Arc<dyn ReadAt>, SourceStamp, u64, u64, bool) =
            if t.stream.path.is_empty() {
                if t.stream.offset != 0 || t.stream.size != 0 {
                    return Err(Error::Corrupt("empty stream path with nonzero range"));
                }
                (
                    index.source.clone(),
                    index.stamp.clone(),
                    t.inline_offset,
                    t.image_data.len() as u64,
                    true,
                )
            } else {
                validate_stream_path(&t.stream.path)?;
                if !t.image_data.is_empty() {
                    return Err(Error::Corrupt("simultaneous inline and stream payload"));
                }
                let (source, stamp): (Arc<dyn ReadAt>, SourceStamp) = match &self.stream {
                    StreamInput::File(assets) => {
                        let f = assets.sibling()?;
                        let s = f.stamp()?;
                        (f, s)
                    }
                    StreamInput::Supplied(s, stamp) => (s.clone(), stamp.clone()),
                };
                (
                    source,
                    stamp,
                    t.stream.offset,
                    u64::from(t.stream.size),
                    false,
                )
            };
        if source.stamp()? != stamp {
            return Err(Error::ChangedSource);
        }
        span(start, length, stamp.length)?;
        let r = VerifiedRange {
            source,
            stamp,
            start,
            length,
            limits: index.limits.clone(),
            mips,
        };
        Ok(if inline {
            TextureRange::Inline(r)
        } else {
            TextureRange::Stream(r)
        })
    }
}

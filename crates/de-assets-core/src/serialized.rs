use crate::{
    cursor::Cursor,
    reader::{checked_read, next_id},
    *,
};
use std::{collections::BTreeMap, ops::Range};
pub const UNITY_VERSION: &str = "2021.3.45f2";
pub const SPRITE_HASH: [u8; 16] = [
    0x70, 0x12, 0xa9, 0xda, 0x77, 0x6e, 0xd5, 0x37, 0x74, 0xe2, 0x20, 0x13, 0x56, 0x5d, 0xbb, 0xd2,
];
pub const TEXTURE_HASH: [u8; 16] = [
    0x0d, 0x08, 0x41, 0x4c, 0xfd, 0x5b, 0xdb, 0x0d, 0x22, 0x79, 0x20, 0x11, 0xbd, 0xa9, 0xab, 0x26,
];
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct FileIdentity(u64);
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct ObjectKey {
    file: FileIdentity,
    path_id: i64,
}
impl ObjectKey {
    pub fn file(&self) -> FileIdentity {
        self.file
    }
    pub fn path_id(&self) -> i64 {
        self.path_id
    }
}
#[derive(Clone, Debug)]
pub struct SerializedType {
    pub class_id: i32,
    pub stripped: u8,
    pub script_index: i16,
    pub script_id: Option<[u8; 16]>,
    pub hash: [u8; 16],
}
#[derive(Clone, Debug)]
pub struct ObjectEntry {
    pub key: ObjectKey,
    pub type_index: usize,
    pub class_id: i32,
    pub range: Range<u64>,
}
#[derive(Clone, Debug)]
pub struct ScriptReference {
    pub file_index: i32,
    pub path_id: i64,
}
#[derive(Clone, Debug)]
pub struct External {
    pub asset_path: String,
    pub guid: [u8; 16],
    pub kind: i32,
    pub path: String,
}
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum NameMatch {
    Zero,
    One(ObjectKey),
    Many(Vec<ObjectKey>),
}
impl NameMatch {
    pub fn unique(self) -> Result<ObjectKey> {
        match self {
            Self::Zero => Err(Error::NotFound),
            Self::One(k) => Ok(k),
            Self::Many(_) => Err(Error::Ambiguous),
        }
    }
}
pub struct SerializedIndex {
    pub(crate) source: Arc<dyn ReadAt>,
    pub(crate) stamp: SourceStamp,
    pub(crate) limits: Limits,
    file: FileIdentity,
    types: Vec<SerializedType>,
    objects: BTreeMap<i64, ObjectEntry>,
    scripts: Vec<ScriptReference>,
    externals: Vec<External>,
    user_information: String,
}
impl SerializedIndex {
    pub fn read(source: Arc<dyn ReadAt>, limits: Limits, work: &mut Work) -> Result<Self> {
        work.check()?;
        let stamp = source.stamp()?;
        let mut header = [0u8; 48];
        checked_read(&*source, &stamp, 0, &mut header, &limits, work)?;
        let be32 = |i: usize| u32::from_be_bytes(header[i..i + 4].try_into().unwrap());
        let be64 = |i: usize| u64::from_be_bytes(header[i..i + 8].try_into().unwrap());
        if be32(8) != 22 || header[16] != 0 {
            return Err(Error::UnsupportedLayout("v22 little endian required"));
        }
        if be32(0) != 0
            || be32(4) != 0
            || be32(12) != 0
            || header[17..20] != [0; 3]
            || be64(40) != 0
        {
            return Err(Error::UnsupportedLayout("reserved header profile"));
        }
        let metadata_len = u64::from(be32(20));
        let file_len = be64(24);
        let data = be64(32);
        if file_len != stamp.length {
            return Err(Error::Corrupt("declared file length"));
        }
        let end = add(48, metadata_len)?;
        if end > data || data > file_len {
            return Err(Error::Corrupt("metadata/data bounds"));
        }
        if metadata_len > limits.metadata_bytes {
            return Err(Error::Limit("metadata"));
        }
        let mut bytes = vec![0; usize_of(metadata_len)?];
        checked_read(&*source, &stamp, 48, &mut bytes, &limits, work)?;
        let mut r = Cursor::new(&bytes, 48, &limits);
        if r.cstr()? != UNITY_VERSION || r.i32()? != 19 || r.u8()? != 0 {
            return Err(Error::UnsupportedLayout("Unity/platform/tree profile"));
        }
        let count = r.count(limits.types, 23)?;
        let mut types = Vec::with_capacity(count);
        for _ in 0..count {
            work.check()?;
            let class_id = r.i32()?;
            let stripped = r.u8()?;
            let script_index = r.i16()?;
            let script_id = if class_id == 114 {
                Some(r.take(16)?.try_into().unwrap())
            } else {
                None
            };
            let hash = r.take(16)?.try_into().unwrap();
            types.push(SerializedType {
                class_id,
                stripped,
                script_index,
                script_id,
                hash,
            });
        }
        let file = FileIdentity(next_id());
        let count = r.count(limits.objects, 24)?;
        let mut objects = BTreeMap::new();
        for _ in 0..count {
            work.check()?;
            r.align()?;
            let id = r.i64()?;
            let offset = add(data, r.u64()?)?;
            let size = u64::from(r.u32()?);
            let ti = r.i32()?;
            let ti = usize::try_from(ti).map_err(|_| Error::Corrupt("negative type index"))?;
            let typ = types.get(ti).ok_or(Error::Corrupt("type index"))?;
            span(offset, size, file_len)?;
            if objects
                .insert(
                    id,
                    ObjectEntry {
                        key: ObjectKey { file, path_id: id },
                        type_index: ti,
                        class_id: typ.class_id,
                        range: offset..add(offset, size)?,
                    },
                )
                .is_some()
            {
                return Err(Error::Corrupt("duplicate path ID"));
            }
        }
        let mut spans: Vec<_> = objects.values().map(|o| o.range.clone()).collect();
        spans.sort_unstable_by_key(|r| r.start);
        let mut last = data;
        for s in spans {
            if s.start < last {
                return Err(Error::Corrupt("overlapping objects"));
            }
            last = s.end;
        }
        let count = r.count(limits.scripts, 12)?;
        let mut scripts = Vec::with_capacity(count);
        for _ in 0..count {
            work.check()?;
            let file_index = r.i32()?;
            r.align()?;
            scripts.push(ScriptReference {
                file_index,
                path_id: r.i64()?,
            });
        }
        let count = r.count(limits.externals, 22)?;
        let mut externals = Vec::with_capacity(count);
        for _ in 0..count {
            work.check()?;
            externals.push(External {
                asset_path: r.cstr()?,
                guid: r.take(16)?.try_into().unwrap(),
                kind: r.i32()?,
                path: r.cstr()?,
            });
        }
        let count = r.count(limits.reference_types, 0)?;
        if count != 0 {
            return Err(Error::UnsupportedLayout("reference type metadata"));
        }
        let user_information = r.cstr()?;
        r.finish()?;
        if source.stamp()? != stamp {
            return Err(Error::ChangedSource);
        }
        Ok(Self {
            source,
            stamp,
            limits,
            file,
            types,
            objects,
            scripts,
            externals,
            user_information,
        })
    }
    pub fn identity(&self) -> FileIdentity {
        self.file
    }
    pub fn source_stamp(&self) -> &SourceStamp {
        &self.stamp
    }
    pub fn types(&self) -> &[SerializedType] {
        &self.types
    }
    pub fn objects(&self) -> impl Iterator<Item = &ObjectEntry> {
        self.objects.values()
    }
    pub fn scripts(&self) -> &[ScriptReference] {
        &self.scripts
    }
    pub fn externals(&self) -> &[External] {
        &self.externals
    }
    pub fn user_information(&self) -> &str {
        &self.user_information
    }
    pub fn key(&self, id: i64) -> Result<ObjectKey> {
        self.objects.get(&id).map(|o| o.key).ok_or(Error::NotFound)
    }
    pub fn entry(&self, key: ObjectKey) -> Result<&ObjectEntry> {
        if key.file != self.file {
            return Err(Error::UnsupportedReference("different serialized input"));
        }
        self.objects.get(&key.path_id).ok_or(Error::NotFound)
    }
    fn typed(&self, key: ObjectKey, class: i32) -> Result<&ObjectEntry> {
        let o = self.entry(key)?;
        let t = &self.types[o.type_index];
        let hash = match class {
            213 => SPRITE_HASH,
            28 => TEXTURE_HASH,
            _ => return Err(Error::UnsupportedLayout("no typed layout")),
        };
        if t.class_id != class {
            return Err(Error::Corrupt("wrong object class"));
        }
        if t.stripped != 0 || t.script_index != -1 || t.hash != hash {
            return Err(Error::UnsupportedLayout("target type tuple/hash"));
        }
        Ok(o)
    }
    pub fn find_name(&self, class: i32, name: &str, work: &mut Work) -> Result<NameMatch> {
        Ok(self
            .find_names(class, &[name], work)?
            .remove(name)
            .unwrap_or(NameMatch::Zero))
    }
    /// Batch exact-name lookup uses one bounded pass, with no persistent cache.
    pub fn find_names(
        &self,
        class: i32,
        names: &[&str],
        work: &mut Work,
    ) -> Result<BTreeMap<String, NameMatch>> {
        if !matches!(class, 213 | 28) {
            return Err(Error::UnsupportedLayout("opaque class names"));
        }
        work.check()?;
        if names.len() > self.limits.array_elements {
            return Err(Error::Limit("name queries"));
        }
        let mut keys: BTreeMap<String, Vec<ObjectKey>> = BTreeMap::new();
        let mut query_bytes = 0;
        for name in names {
            work.charge(1)?;
            if name.len() > self.limits.string_bytes {
                return Err(Error::Limit("query name"));
            }
            query_bytes = add(query_bytes, name.len() as u64)?;
            if query_bytes > self.limits.name_bytes {
                return Err(Error::Limit("query name bytes"));
            }
            keys.entry((*name).to_owned()).or_default();
        }
        let mut total = 0;
        for o in self.objects.values() {
            work.charge(1)?;
            if o.class_id != class {
                continue;
            }
            self.typed(o.key, class)?;
            let length = o.range.end - o.range.start;
            if length < 4 {
                return Err(Error::Corrupt("truncated object name"));
            }
            let mut len = [0u8; 4];
            checked_read(
                &*self.source,
                &self.stamp,
                o.range.start,
                &mut len,
                &self.limits,
                work,
            )?;
            let n = usize::try_from(i32::from_le_bytes(len))
                .map_err(|_| Error::Corrupt("negative name"))?;
            if n > self.limits.string_bytes {
                return Err(Error::Limit("object name"));
            }
            let unaligned = add(4, n as u64)?;
            let absolute = add(o.range.start, unaligned)?;
            let needed = add(unaligned, (4 - absolute % 4) % 4)?;
            if needed > length {
                return Err(Error::Corrupt("name exceeds object"));
            }
            total = add(total, needed)?;
            if total > self.limits.name_bytes {
                return Err(Error::Limit("name inventory bytes"));
            }
            let mut bytes = vec![0; n];
            checked_read(
                &*self.source,
                &self.stamp,
                add(o.range.start, 4)?,
                &mut bytes,
                &self.limits,
                work,
            )?;
            let s =
                std::str::from_utf8(&bytes).map_err(|_| Error::Corrupt("invalid UTF-8 name"))?;
            if let Some(v) = keys.get_mut(s) {
                v.try_reserve(1)
                    .map_err(|_| Error::Limit("name allocation"))?;
                v.push(o.key);
            }
        }
        let matches = keys
            .into_iter()
            .map(|(name, keys)| {
                work.charge(1)?;
                Ok((
                    name,
                    match keys.len() {
                        0 => NameMatch::Zero,
                        1 => NameMatch::One(keys[0]),
                        _ => NameMatch::Many(keys),
                    },
                ))
            })
            .collect::<Result<BTreeMap<_, _>>>()?;
        work.check()?;
        Ok(matches)
    }
    pub(crate) fn object_bytes(
        &self,
        key: ObjectKey,
        class: i32,
        work: &mut Work,
    ) -> Result<(Vec<u8>, u64)> {
        let o = self.typed(key, class)?;
        let n = o.range.end - o.range.start;
        if n > self.limits.object_bytes {
            return Err(Error::Limit("object bytes"));
        }
        work.select(n, self.limits.selected_bytes)?;
        let mut bytes = vec![0; usize_of(n)?];
        checked_read(
            &*self.source,
            &self.stamp,
            o.range.start,
            &mut bytes,
            &self.limits,
            work,
        )?;
        Ok((bytes, o.range.start))
    }
    pub fn read_sprite(&self, key: ObjectKey, work: &mut Work) -> Result<SpriteMetadata> {
        let (b, base) = self.object_bytes(key, 213, work)?;
        SpriteMetadata::parse(&b, base, &self.limits, work)
    }
    pub fn read_texture(&self, key: ObjectKey, work: &mut Work) -> Result<TextureMetadata> {
        let (b, base) = self.object_bytes(key, 28, work)?;
        TextureMetadata::parse(&b, base, &self.limits, work)
    }
    pub fn resolve_pointer(&self, p: PPtr, class: i32) -> Result<Option<ObjectKey>> {
        if p.file_id < 0 {
            return Err(Error::Corrupt("negative PPtr file ID"));
        }
        if p.file_id != 0 {
            if usize::try_from(p.file_id).map_err(|_| Error::Corrupt("file ID"))?
                > self.externals.len()
            {
                return Err(Error::Corrupt("PPtr external descriptor index"));
            }
            return Err(Error::UnsupportedReference("external PPtr"));
        }
        if p.path_id == 0 {
            return Ok(None);
        }
        let key = self
            .key(p.path_id)
            .map_err(|_| Error::Corrupt("dangling local PPtr"))?;
        if self.entry(key)?.class_id != class {
            return Err(Error::Corrupt("wrong PPtr class"));
        }
        Ok(Some(key))
    }
    /// Checks references, geometry and atlas bounds; does not certify rendering.
    /// Parse separately first if unsupported geometry/reference must be retained.
    pub fn validate_sprite(&self, key: ObjectKey, work: &mut Work) -> Result<SpriteMetadata> {
        self.validated_sprite_geometry(key, work).map(|(s, _)| s)
    }
    pub(crate) fn validated_sprite_geometry(
        &self,
        key: ObjectKey,
        work: &mut Work,
    ) -> Result<(SpriteMetadata, crate::geometry::FloatStreams)> {
        let s = self.read_sprite(key, work)?;
        let atlas = self.resolve_pointer(s.sprite_atlas, 687)?;
        if atlas.is_some() || !s.atlas_tags.is_empty() {
            return Err(Error::UnsupportedReference("atlas-dependent sprite"));
        }
        let texture = self
            .resolve_pointer(s.render.texture, 28)?
            .ok_or(Error::UnsupportedReference("null sprite texture"))?;
        self.resolve_pointer(s.render.alpha_texture, 28)?;
        for secondary in &s.render.secondary_textures {
            work.charge(1)?;
            self.resolve_pointer(secondary.texture, 28)?;
        }
        if s.render.alpha_texture != PPtr::NULL || !s.render.secondary_textures.is_empty() {
            return Err(Error::UnsupportedReference(
                "alpha/secondary sprite textures",
            ));
        }
        let geometry = s.validated_geometry(work)?;
        s.packing().audited()?;
        let t = self.read_texture(texture, work)?;
        let r = s.render.texture_rect.map(F32::value);
        if t.width < 0
            || t.height < 0
            || f64::from(r[0]) + f64::from(r[2]) > f64::from(t.width)
            || f64::from(r[1]) + f64::from(r[3]) > f64::from(t.height)
        {
            return Err(Error::Corrupt("sprite rectangle outside texture"));
        }
        work.check()?;
        Ok((s, geometry))
    }
}

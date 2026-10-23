//! Unexposed edition/profile foundation. No commands, app-data discovery, game
//! execution, settings updates, cache writes or window activation.
//! Canonical F1 implementation, extracted byte-for-byte before adapter changes.

use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::HashSet,
    fs,
    io::Write,
    path::{Path, PathBuf},
};

pub const STORE_NAME: &str = "game-profiles.v1.json";
pub const DE_DATA: &str = "Stronghold Crusader Definitive Edition_Data";
pub const CLASSIC_EXES: [&str; 2] = ["Stronghold Crusader.exe", "Stronghold_Crusader_Extreme.exe"];
pub const DE_FILES: [&str; 3] = [
    "Stronghold Crusader Definitive Edition.exe",
    "Stronghold Crusader Definitive Edition_Data/Managed/Assembly-CSharp.dll",
    "Stronghold Crusader Definitive Edition_Data/Plugins/x86_64/CrusaderDE.dll",
];
// Counts every object/array from the root, including profile-store wrappers.
// serde_json retains its default recursion safety limit.
pub const MAX_JSON_DEPTH: usize = 64;
const MAX_SAFE: u64 = 9_007_199_254_740_991;
fn sha256(bytes: impl AsRef<[u8]>) -> String {
    format!("{:x}", Sha256::digest(bytes.as_ref()))
}
pub fn portable_path(path: &Path) -> String {
    let mut value = path.to_string_lossy().replace('\\', "/");
    if value.starts_with("//?/UNC/") {
        value = format!("//{}", &value[8..]);
    } else if value.starts_with("//?/") {
        value = value[4..].to_owned();
    }
    if value.as_bytes().get(1) == Some(&b':') && value.as_bytes()[0].is_ascii_alphabetic() {
        value.replace_range(..1, &value[..1].to_ascii_uppercase());
    }
    value
}
pub fn profile_id(edition: &str, canonical_root: &str) -> String {
    format!("gp1-{}", sha256(format!("{edition}\0{canonical_root}")))
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct PeEvidence {
    pub machine: u16,
    pub magic: u16,
    pub managed: bool,
    pub il_only: bool,
    pub requires32_bit: bool,
}
#[allow(clippy::manual_is_multiple_of)] // Retain the reviewed F1 range predicate.
pub fn inspect_pe(bytes: &[u8]) -> Option<PeEvidence> {
    fn u16_at(bytes: &[u8], offset: usize) -> Option<u16> {
        Some(u16::from_le_bytes(
            bytes.get(offset..offset.checked_add(2)?)?.try_into().ok()?,
        ))
    }
    fn u32_at(bytes: &[u8], offset: usize) -> Option<u32> {
        Some(u32::from_le_bytes(
            bytes.get(offset..offset.checked_add(4)?)?.try_into().ok()?,
        ))
    }
    if bytes.len() < 64 || u16_at(bytes, 0)? != 0x5a4d {
        return None;
    }
    let pe = u32_at(bytes, 0x3c)? as usize;
    if pe < 64 || pe.checked_add(24)? > bytes.len() || u32_at(bytes, pe)? != 0x4550 {
        return None;
    }
    let machine = u16_at(bytes, pe + 4)?;
    let sections = u16_at(bytes, pe + 6)? as usize;
    let size = u16_at(bytes, pe + 20)? as usize;
    let opt = pe + 24;
    let magic = u16_at(bytes, opt)?;
    let prefix = match magic {
        0x10b => 96,
        0x20b => 112,
        _ => return None,
    };
    if sections == 0 || sections > 96 || size < prefix || opt + size + sections * 40 > bytes.len() {
        return None;
    }
    let count = u32_at(bytes, opt + prefix - 4)? as usize;
    if count > 16 || prefix + count * 8 > size {
        return None;
    }
    if u16_at(bytes, pe + 22)? & 2 == 0 {
        return None;
    }
    for i in 0..sections {
        let section = opt + size + i * 40;
        let size = u32_at(bytes, section + 16)? as u64;
        if size > 0 && u32_at(bytes, section + 20)? as u64 + size > bytes.len() as u64 {
            return None;
        }
    }
    let (mut managed, mut il_only, mut requires32_bit) = (false, false, false);
    if count > 14 {
        let rva = u32_at(bytes, opt + prefix + 14 * 8)? as u64;
        let length = u32_at(bytes, opt + prefix + 14 * 8 + 4)?;
        if rva != 0 || length != 0 {
            if rva == 0 || length < 72 {
                return None;
            }
            // ECMA-335 II.25.3.3: bound the entire declared directory and cb
            // in a single, unambiguous file-backed virtual section.
            let mapped = |address: u64, length: u64| -> Option<usize> {
                if address == 0 || length == 0 || address + length > 0x1_0000_0000 {
                    return None;
                }
                let mut found = None;
                for i in 0..sections {
                    let section = opt + size + i * 40;
                    let start = u32_at(bytes, section + 12)? as u64;
                    let raw_size = u32_at(bytes, section + 16)? as u64;
                    let virtual_size = match u32_at(bytes, section + 8)? as u64 {
                        0 => raw_size,
                        size => size,
                    };
                    let raw = u32_at(bytes, section + 20)? as u64;
                    if let Some(delta) = address.checked_sub(start) {
                        if delta + length <= raw_size
                            && delta + length <= virtual_size
                            && raw + delta + length <= bytes.len() as u64
                        {
                            if found.is_some() {
                                return None;
                            }
                            found = Some((raw + delta) as usize);
                        }
                    }
                }
                found
            };
            let clr = mapped(rva, length as u64)?;
            let cb = u32_at(bytes, clr)?;
            if cb < 72 || cb > length || mapped(rva, cb as u64)? != clr {
                return None;
            }
            let metadata_size = u32_at(bytes, clr + 12)? as usize;
            let metadata = mapped(u32_at(bytes, clr + 8)? as u64, metadata_size as u64)?;
            // II.24.2.1: basic fixed root, BSJB, padded UTF-8 version and count.
            // This does not verify stream contents, IL or runtime loading.
            if metadata_size < 24 || u32_at(bytes, metadata)? != 0x424a5342 {
                return None;
            }
            let version_size = u32_at(bytes, metadata + 12)? as usize;
            if version_size == 0
                || version_size > 256
                || version_size % 4 != 0
                || 20 + version_size > metadata_size
            {
                return None;
            }
            let version = &bytes[metadata + 16..metadata + 16 + version_size];
            let terminator = version.iter().position(|b| *b == 0)?;
            if terminator >= 255 || (terminator + 1).div_ceil(4) * 4 != version_size {
                return None;
            }
            std::str::from_utf8(&version[..terminator]).ok()?;
            if u16_at(bytes, metadata + 18 + version_size)? as usize * 12
                > metadata_size - 20 - version_size
            {
                return None;
            }
            managed = true;
            il_only = u32_at(bytes, clr + 16)? & 1 != 0;
            requires32_bit = u32_at(bytes, clr + 16)? & 2 != 0;
        }
    }
    Some(PeEvidence {
        machine,
        magic,
        managed,
        il_only,
        requires32_bit,
    })
}
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    pub id: String,
    pub edition: String,
    pub canonical_root: String,
    pub display_root: String,
    #[serde(flatten)]
    pub extra: Map<String, Value>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct ProbeEvidence {
    pub relative_path: String,
    pub sha256: String,
    pub pe: PeEvidence,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "status", rename_all = "kebab-case")]
#[allow(clippy::large_enum_variant)] // Bounded DTO; boxing would change the extracted API for a style lint.
pub enum ProbeResult {
    #[serde(rename_all = "camelCase")]
    Recognized {
        profile: Profile,
        source_revision: String,
        evidence: Vec<ProbeEvidence>,
        ucp_library_available: bool,
        version_status: String,
    },
    Ambiguous {
        diagnostics: Vec<String>,
    },
    Incomplete {
        diagnostics: Vec<String>,
    },
    Unknown {
        diagnostics: Vec<String>,
    },
    Unreadable {
        diagnostics: Vec<String>,
    },
}
fn unknown(code: &str) -> ProbeResult {
    ProbeResult::Unknown {
        diagnostics: vec![code.into()],
    }
}
fn incomplete(code: &str) -> ProbeResult {
    ProbeResult::Incomplete {
        diagnostics: vec![code.into()],
    }
}
fn name_is(path: &Path, name: &str) -> bool {
    path.file_name().and_then(|n| n.to_str()).is_some_and(|n| {
        if cfg!(windows) {
            n.eq_ignore_ascii_case(name)
        } else {
            n == name
        }
    })
}
fn kind(path: &Path) -> std::io::Result<&'static str> {
    match fs::metadata(path) {
        Ok(meta) => Ok(if meta.is_dir() {
            "directory"
        } else if meta.is_file() {
            "file"
        } else {
            "other"
        }),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok("missing"),
        Err(e) => Err(e),
    }
}
fn plain_kind(path: &Path) -> std::io::Result<&'static str> {
    match fs::symlink_metadata(path) {
        Ok(meta) if meta.file_type().is_symlink() => {
            Err(std::io::Error::other("Symlink metadata artifact"))
        }
        Ok(meta) => Ok(if meta.is_dir() {
            "directory"
        } else if meta.is_file() {
            "file"
        } else {
            "other"
        }),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok("missing"),
        Err(e) => Err(e),
    }
}
pub fn probe_installation(selected: Option<&Path>) -> ProbeResult {
    let Some(selected) = selected.filter(|p| !p.as_os_str().is_empty()) else {
        return unknown("no-selection");
    };
    if !selected.is_absolute() {
        return unknown("absolute-path-required");
    }
    match probe_inner(selected) {
        Ok(result) => result,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => unknown("ENOENT"),
        Err(e) => ProbeResult::Unreadable {
            diagnostics: vec![e.to_string()],
        },
    }
}
fn probe_inner(selected: &Path) -> std::io::Result<ProbeResult> {
    if !fs::metadata(selected)?.is_dir() {
        return Ok(unknown("not-directory"));
    }
    // Match Node path.resolve's lexical normalization before suffix selection.
    let mut root = PathBuf::new();
    for component in std::path::absolute(selected)?.components() {
        if component == std::path::Component::ParentDir {
            if matches!(
                root.components().next_back(),
                Some(std::path::Component::Normal(_))
            ) {
                root.pop();
            }
        } else {
            root.push(component);
        }
    }
    let mut direct_signature = false;
    for relative in CLASSIC_EXES
        .iter()
        .chain(DE_FILES.iter())
        .copied()
        .chain([DE_DATA])
    {
        if kind(&root.join(relative))? != "missing" {
            direct_signature = true;
            break;
        }
    }
    if !direct_signature {
        if name_is(&root, "plugins") && root.parent().is_some_and(|p| name_is(p, "ucp")) {
            root.pop();
            root.pop();
        } else if name_is(&root, "ucp") {
            root.pop();
        }
    }
    let display_root = portable_path(&std::path::absolute(&root)?);
    let root = dunce::canonicalize(&root)?;
    let classic = CLASSIC_EXES
        .iter()
        .map(|f| kind(&root.join(f)))
        .collect::<std::io::Result<Vec<_>>>()?;
    let de = DE_FILES
        .iter()
        .map(|f| kind(&root.join(f)))
        .collect::<std::io::Result<Vec<_>>>()?;
    let has_classic = classic.iter().any(|v| *v != "missing");
    let has_de = de.iter().any(|v| *v != "missing") || kind(&root.join(DE_DATA))? != "missing";
    if has_classic && has_de {
        return Ok(ProbeResult::Ambiguous {
            diagnostics: vec!["mixed-edition-signatures".into()],
        });
    }
    let mut evidence = vec![];
    let mut read_binary = |relative: &str| -> std::io::Result<Option<PeEvidence>> {
        let bytes = fs::read(root.join(relative))?;
        let pe = inspect_pe(&bytes);
        if let Some(pe) = &pe {
            evidence.push(ProbeEvidence {
                relative_path: relative.into(),
                sha256: sha256(&bytes),
                pe: pe.clone(),
            });
        }
        Ok(pe)
    };
    let native = |pe: Option<PeEvidence>, machine, magic| {
        pe.is_some_and(|p| p.machine == machine && p.magic == magic && !p.managed)
    };
    let edition = if has_classic {
        if classic.iter().any(|v| !["file", "missing"].contains(v))
            || kind(&root.join("gm"))? != "directory"
            || kind(&root.join("aiv"))? != "directory"
        {
            return Ok(incomplete("classic-layout-incomplete"));
        }
        let mut gm1 = false;
        for entry in fs::read_dir(root.join("gm"))? {
            let entry = entry?;
            if entry.file_type()?.is_file()
                && entry
                    .file_name()
                    .to_string_lossy()
                    .to_lowercase()
                    .ends_with(".gm1")
            {
                gm1 = true;
            }
        }
        if !gm1 {
            return Ok(incomplete("classic-assets-missing"));
        }
        for (index, value) in classic.iter().enumerate() {
            if *value == "file" && !native(read_binary(CLASSIC_EXES[index])?, 0x14c, 0x10b) {
                return Ok(incomplete("classic-pe-invalid"));
            }
        }
        "classic"
    } else if has_de {
        if de.iter().any(|v| *v != "file") {
            return Ok(incomplete("de-layout-incomplete"));
        }
        let launcher = read_binary(DE_FILES[0])?;
        let managed = read_binary(DE_FILES[1])?;
        let engine = read_binary(DE_FILES[2])?;
        if !native(launcher, 0x8664, 0x20b)
            || !native(engine, 0x8664, 0x20b)
            || !managed.is_some_and(|p| {
                p.managed
                    && p.il_only
                    && !p.requires32_bit
                    && ((p.machine == 0x14c && p.magic == 0x10b)
                        || (p.machine == 0x8664 && p.magic == 0x20b))
            })
        {
            return Ok(incomplete("de-pe-invalid"));
        }
        "de"
    } else {
        return Ok(unknown("no-edition-signature"));
    };
    let canonical_root = portable_path(&root);
    let profile = Profile {
        id: profile_id(edition, &canonical_root),
        edition: edition.into(),
        canonical_root,
        display_root,
        extra: Map::new(),
    };
    let ucp_library_available =
        edition == "classic" && kind(&root.join("ucp/plugins"))? == "directory";
    let mut fingerprint = evidence
        .iter()
        .map(|e| format!("{}\0{}\n", e.relative_path, e.sha256))
        .collect::<String>();
    fingerprint.push_str(&format!("ucp:{ucp_library_available}"));
    Ok(ProbeResult::Recognized {
        profile,
        source_revision: sha256(fingerprint),
        evidence,
        ucp_library_available,
        version_status: "unknown".into(),
    })
}

pub fn empty_store() -> Value {
    json!({"schemaVersion":1,"revision":0,"defaultProfileId":null,"selectedByEdition":{},"profiles":{}})
}
fn valid_root(value: &str) -> bool {
    let bytes = value.as_bytes();
    let drive = bytes.len() >= 3 && bytes[0].is_ascii_uppercase() && &bytes[1..3] == b":/";
    !value.contains(['\\', '\0'])
        && (value.starts_with('/') || drive)
        && !value.split('/').any(|s| s == "." || s == "..")
        && (!value.ends_with('/') || value == "/" || (drive && value.len() == 3))
}
fn safe_json(value: &Value, depth: usize) -> bool {
    safe_json_bounded(value, depth, MAX_JSON_DEPTH)
}
fn safe_json_bounded(value: &Value, depth: usize, limit: usize) -> bool {
    match value {
        Value::Number(v) => v
            .as_i64()
            .is_some_and(|v| v >= -(MAX_SAFE as i64) && v <= MAX_SAFE as i64),
        Value::Array(v) => {
            depth < limit && v.iter().all(|v| safe_json_bounded(v, depth + 1, limit))
        }
        Value::Object(v) => {
            depth < limit && v.values().all(|v| safe_json_bounded(v, depth + 1, limit))
        }
        // Rust strings/keys already contain only Unicode scalar values.
        _ => true,
    }
}
pub fn validate_store(value: &Value) -> Result<(), &'static str> {
    if !safe_json(value, 0) {
        return Err("corrupt");
    }
    let Some(store) = value.as_object() else {
        return Err("corrupt");
    };
    if store
        .get("schemaVersion")
        .and_then(Value::as_u64)
        .is_some_and(|v| v > 1 && v <= MAX_SAFE)
    {
        return Err("future-schema");
    }
    if store.get("schemaVersion").and_then(Value::as_u64) != Some(1)
        || store
            .get("revision")
            .and_then(Value::as_u64)
            .is_none_or(|v| v > MAX_SAFE)
    {
        return Err("corrupt");
    }
    let profiles = store
        .get("profiles")
        .and_then(Value::as_object)
        .ok_or("corrupt")?;
    for (id, value) in profiles {
        let profile: Profile = serde_json::from_value(value.clone()).map_err(|_| "corrupt")?;
        if !["classic", "de"].contains(&profile.edition.as_str())
            || !valid_root(&profile.canonical_root)
            || profile.display_root.is_empty()
            || profile.display_root.contains('\0')
            || profile.id != *id
            || *id != profile_id(&profile.edition, &profile.canonical_root)
        {
            return Err("corrupt");
        }
    }
    match store.get("defaultProfileId") {
        Some(Value::Null) => (),
        Some(Value::String(id)) if profiles.contains_key(id) => (),
        _ => return Err("corrupt"),
    }
    let selected = store
        .get("selectedByEdition")
        .and_then(Value::as_object)
        .ok_or("corrupt")?;
    for (edition, id) in selected {
        let id = id.as_str().ok_or("corrupt")?;
        if !["classic", "de"].contains(&edition.as_str())
            || profiles
                .get(id)
                .and_then(|p| p.get("edition"))
                .and_then(Value::as_str)
                != Some(edition)
        {
            return Err("corrupt");
        }
    }
    Ok(())
}
pub fn parse_metadata(bytes: &[u8]) -> Result<Value, &'static str> {
    parse_json_bounded(bytes, MAX_JSON_DEPTH)
}
// Transport wrappers are outside the metadata store depth budget.
pub fn parse_wire(bytes: &[u8]) -> Result<Value, &'static str> {
    parse_json_bounded(bytes, MAX_JSON_DEPTH + 4)
}
fn parse_json_bounded(bytes: &[u8], limit: usize) -> Result<Value, &'static str> {
    let source = std::str::from_utf8(bytes).map_err(|_| "corrupt")?;
    // Preflight raw tokens before serde can collapse duplicate object members.
    // Decoded names must be unique in each object, including unknown extensions.
    // This is metadata policy, separate from the lossless game document codec.
    let tokens = source.as_bytes();
    let mut index = 0;
    let mut containers: Vec<Option<HashSet<String>>> = vec![];
    while index < tokens.len() {
        if tokens[index] == b'"' {
            let start = index;
            index += 1;
            while index < tokens.len() {
                if tokens[index] == b'\\' {
                    index += 2;
                } else if tokens[index] == b'"' {
                    index += 1;
                    break;
                } else {
                    index += 1;
                }
            }
            let token = source.get(start..index).ok_or("corrupt")?;
            // Validate even strings in branches a duplicate would otherwise hide.
            let decoded: String = serde_json::from_str(token).map_err(|_| "corrupt")?;
            let mut following = index;
            while following < tokens.len() && b" \t\r\n".contains(&tokens[following]) {
                following += 1;
            }
            if tokens.get(following) == Some(&b':') {
                let names = containers
                    .last_mut()
                    .and_then(Option::as_mut)
                    .ok_or("corrupt")?;
                if !names.insert(decoded) {
                    return Err("corrupt");
                }
            }
        } else if tokens[index] == b'{' || tokens[index] == b'[' {
            if containers.len() >= limit {
                return Err("corrupt");
            }
            containers.push((tokens[index] == b'{').then(HashSet::new));
            index += 1;
        } else if tokens[index] == b'}' || tokens[index] == b']' {
            containers.pop().ok_or("corrupt")?;
            index += 1;
        } else if tokens[index] == b'-' || tokens[index].is_ascii_digit() {
            let start = index;
            while index < tokens.len() && !b" \t\r\n[]{},:".contains(&tokens[index]) {
                index += 1;
            }
            let token = &source[start..index];
            let digits = token.strip_prefix('-').unwrap_or(token);
            if token == "-0"
                || digits.is_empty()
                || !digits.bytes().all(|b| b.is_ascii_digit())
                || (digits.len() > 1 && digits.starts_with('0'))
                || token
                    .parse::<i64>()
                    .ok()
                    .is_none_or(|v| v < -(MAX_SAFE as i64) || v > MAX_SAFE as i64)
            {
                return Err("corrupt");
            }
        } else {
            index += 1;
        }
    }
    // A leading UTF-8 BOM is rejected for new metadata (legacy stays separate).
    let value: Value = serde_json::from_str(source).map_err(|_| "corrupt")?;
    if !safe_json_bounded(&value, 0, limit) {
        return Err("corrupt");
    }
    Ok(value)
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct MetadataSizeLimit {
    pub representation: MetadataRepresentation,
    pub max_bytes: u64,
    pub actual_bytes: u64,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub enum MetadataRepresentation {
    Persisted,
    Result,
}
impl std::fmt::Display for MetadataSizeLimit {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "metadata-too-large: {:?} {} > {} bytes",
            self.representation, self.actual_bytes, self.max_bytes
        )
    }
}
impl std::error::Error for MetadataSizeLimit {}

// Repository metadata, not a limit on game documents or the generic JSON parser.
// Result serialization is counted too (including escaping). The private transport
// wrapper has a separate 1 KiB allowance, well inside its 12 MiB frame cap.
pub const MAX_METADATA_BYTES: usize = 8 * 1024 * 1024;
pub const MAX_METADATA_RESULT_BYTES: usize = MAX_METADATA_BYTES + 1024;
struct SerializedSize(usize);
impl Write for SerializedSize {
    fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
        self.0 += bytes.len();
        Ok(bytes.len())
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}
fn size_limit(
    representation: MetadataRepresentation,
    actual: usize,
    max: usize,
) -> Result<(), MetadataSizeLimit> {
    if actual > max {
        Err(MetadataSizeLimit {
            representation,
            max_bytes: max as u64,
            actual_bytes: actual as u64,
        })
    } else {
        Ok(())
    }
}
pub fn validate_metadata_size(value: &Value) -> Result<(), MetadataSizeLimit> {
    let mut size = SerializedSize(0);
    // Value serialization is infallible; this sink performs no allocation or I/O.
    serde_json::to_writer_pretty(&mut size, value).expect("JSON Value serialization");
    size_limit(
        MetadataRepresentation::Persisted,
        size.0 + 1,
        MAX_METADATA_BYTES,
    )
}
fn check_result_size(value: &StoreResult) -> Result<(), MetadataSizeLimit> {
    let mut size = SerializedSize(0);
    serde_json::to_writer(&mut size, value).expect("StoreResult serialization");
    size_limit(
        MetadataRepresentation::Result,
        size.0,
        MAX_METADATA_RESULT_BYTES,
    )
}
fn check_metadata_file_size(path: &Path) -> std::io::Result<()> {
    let actual = fs::metadata(path)?.len();
    if actual > MAX_METADATA_BYTES as u64 {
        return Err(std::io::Error::other(MetadataSizeLimit {
            representation: MetadataRepresentation::Persisted,
            max_bytes: MAX_METADATA_BYTES as u64,
            actual_bytes: actual,
        }));
    }
    Ok(())
}
fn read_metadata_file(path: &Path) -> std::io::Result<Vec<u8>> {
    check_metadata_file_size(path)?;
    let bytes = fs::read(path)?;
    size_limit(
        MetadataRepresentation::Persisted,
        bytes.len(),
        MAX_METADATA_BYTES,
    )
    .map_err(std::io::Error::other)?;
    Ok(bytes)
}
fn metadata_size_result(error: MetadataSizeLimit) -> StoreResult {
    let mut r = result("metadata-too-large");
    r.size_limit = Some(error);
    r
}
fn repository_error(status: &str, error: std::io::Error) -> StoreResult {
    if let Some(size) = error
        .get_ref()
        .and_then(|e| e.downcast_ref::<MetadataSizeLimit>())
    {
        metadata_size_result(size.clone())
    } else {
        diagnostic(status, error)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase")]
pub struct StoreResult {
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[cfg_attr(feature = "export-types", ts(optional))]
    pub store: Option<Value>,
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    pub diagnostics: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[cfg_attr(feature = "export-types", ts(optional))]
    pub candidate: Option<ProbeResult>,
    #[serde(skip_serializing_if = "Option::is_none", default)]
    #[cfg_attr(feature = "export-types", ts(optional))]
    pub size_limit: Option<MetadataSizeLimit>,
}
fn result(status: &str) -> StoreResult {
    StoreResult {
        status: status.into(),
        store: None,
        diagnostics: vec![],
        candidate: None,
        size_limit: None,
    }
}
fn diagnostic(status: &str, message: impl ToString) -> StoreResult {
    let mut r = result(status);
    r.diagnostics.push(message.to_string());
    r
}
fn with_store(status: &str, store: Value) -> StoreResult {
    let mut r = result(status);
    r.store = Some(store);
    r
}
fn sync_directory(path: &Path) -> std::io::Result<()> {
    // Node cannot sync Windows directories; use the same conservative file-sync
    // protocol here. This is process-crash recovery, not a hardware durability claim.
    #[cfg(not(windows))]
    {
        fs::File::open(path)?.sync_all()?;
    }
    #[cfg(windows)]
    {
        let _ = path;
    }
    Ok(())
}
fn durable_create(path: &Path, bytes: &[u8]) -> std::io::Result<()> {
    let mut file = fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(path)?;
    file.write_all(bytes)?;
    file.sync_all()
}
struct DiskLock(Option<PathBuf>);
impl DiskLock {
    fn finish(mut self, mut result: StoreResult) -> StoreResult {
        if let Some(path) = self.0.take() {
            if let Err(error) = fs::remove_dir(path) {
                result
                    .diagnostics
                    .push(format!("lock-release-failed: {error}"));
            }
        }
        result
    }
}
impl Drop for DiskLock {
    fn drop(&mut self) {
        if let Some(path) = self.0.take() {
            let _ = fs::remove_dir(path);
        }
    }
}
pub struct ProfileRepository {
    pub directory: PathBuf,
    pub file: PathBuf,
    pub lock: PathBuf,
    pub transaction: PathBuf,
    pub backup: PathBuf,
}
impl ProfileRepository {
    pub fn new(directory: &Path) -> std::io::Result<Self> {
        let directory = dunce::canonicalize(directory)?;
        if !fs::metadata(&directory)?.is_dir() {
            return Err(std::io::Error::other("Repository directory required"));
        }
        Ok(Self {
            file: directory.join(STORE_NAME),
            lock: directory.join(format!("{STORE_NAME}.lock")),
            transaction: directory.join(format!("{STORE_NAME}.transaction")),
            backup: directory.join(format!("{STORE_NAME}.backup")),
            directory,
        })
    }
    fn acquire(&self) -> std::io::Result<DiskLock> {
        fs::create_dir(&self.lock)?;
        Ok(DiskLock(Some(self.lock.clone())))
    }
    fn read_unlocked(&self) -> StoreResult {
        let read = || -> std::io::Result<StoreResult> {
            if plain_kind(&self.transaction)? != "missing" {
                return Ok(diagnostic("recovery-required", "interrupted-transaction"));
            }
            match plain_kind(&self.file)? {
                "missing" => {
                    return Ok(result(if plain_kind(&self.backup)? == "missing" {
                        "missing"
                    } else {
                        "recovery-required"
                    }))
                }
                "file" => (),
                _ => return Ok(diagnostic("io-error", "store-not-file")),
            }
            let bytes = read_metadata_file(&self.file)?;
            let value = match parse_metadata(&bytes) {
                Ok(v) => v,
                Err(code) => return Ok(result(code)),
            };
            if let Err(code) = validate_store(&value) {
                return Ok(result(code));
            }
            let ready = with_store("ready", value);
            check_result_size(&ready).map_err(std::io::Error::other)?;
            Ok(ready)
        };
        read().unwrap_or_else(|e| repository_error("io-error", e))
    }
    pub fn read(&self) -> StoreResult {
        match self.acquire() {
            Ok(guard) => guard.finish(self.read_unlocked()),
            Err(e) => diagnostic(
                if e.kind() == std::io::ErrorKind::AlreadyExists {
                    "busy"
                } else {
                    "io-error"
                },
                e,
            ),
        }
    }
    pub fn compare_and_swap(
        &self,
        expected_revision: Option<u64>,
        proposed: &Value,
    ) -> StoreResult {
        self.compare_and_swap_with_checkpoint(expected_revision, proposed, |_| Ok(()))
    }
    fn compare_and_swap_with_checkpoint(
        &self,
        expected_revision: Option<u64>,
        proposed: &Value,
        checkpoint: impl Fn(&str) -> std::io::Result<()>,
    ) -> StoreResult {
        let guard = match self.acquire() {
            Ok(lock) => lock,
            Err(e) => {
                return diagnostic(
                    if e.kind() == std::io::ErrorKind::AlreadyExists {
                        "busy"
                    } else {
                        "io-error"
                    },
                    e,
                )
            }
        };
        let current = self.read_unlocked();
        if !["ready", "missing"].contains(&current.status.as_str()) {
            return guard.finish(current);
        }
        let actual = current.store.as_ref().and_then(|s| s["revision"].as_u64());
        if actual != expected_revision {
            return guard.finish(result("stale-revision"));
        }
        if let Err(code) = validate_store(proposed) {
            return guard.finish(result(code));
        }
        let mut next = proposed.clone();
        if next["revision"].as_u64() != expected_revision.map_or(Some(0), |v| v.checked_add(1)) {
            return guard.finish(result("invalid-revision"));
        }
        if let Some(before) = current.store {
            if let Err(code) = preserve_extensions(&before, &mut next) {
                return guard.finish(result(code));
            }
        }
        if let Err(code) = validate_store(&next) {
            return guard.finish(result(code));
        }
        if let Err(error) = validate_metadata_size(&next) {
            return guard.finish(metadata_size_result(error));
        }
        // Confirm the final preserved representation before journal/backup writes.
        let after = match serde_json::to_vec_pretty(&next) {
            Ok(mut bytes) => {
                bytes.push(b'\n');
                bytes
            }
            Err(error) => return guard.finish(diagnostic("corrupt", error)),
        };
        if parse_metadata(&after).ok().as_ref() != Some(&next) {
            return guard.finish(result("corrupt"));
        }
        let committed = with_store("committed", next);
        if let Err(error) = check_result_size(&committed) {
            return guard.finish(metadata_size_result(error));
        }
        guard.finish(self.persist(committed, &after, checkpoint))
    }
    fn persist(
        &self,
        committed: StoreResult,
        after: &[u8],
        checkpoint: impl Fn(&str) -> std::io::Result<()>,
    ) -> StoreResult {
        let mut prepared = false;
        let mut write = || -> std::io::Result<()> {
            match plain_kind(&self.backup)? {
                "directory" => fs::remove_dir_all(&self.backup)?,
                "missing" => (),
                _ => return Err(std::io::Error::other("invalid-backup")),
            }
            fs::create_dir(&self.transaction)?;
            let before = if plain_kind(&self.file)? == "file" {
                Some(fs::read(&self.file)?)
            } else {
                None
            };
            if let Some(bytes) = &before {
                durable_create(&self.transaction.join("before.json"), bytes)?;
            }
            durable_create(&self.transaction.join("after.json"), after)?;
            let manifest = json!({"protocol":1,"beforeSha256":before.as_ref().map(sha256),"afterSha256":sha256(after)});
            durable_create(
                &self.transaction.join("manifest.json"),
                &serde_json::to_vec(&manifest)?,
            )?;
            sync_directory(&self.transaction)?;
            sync_directory(&self.directory)?;
            prepared = true;
            checkpoint("prepared")?;
            if before.is_some() {
                fs::rename(&self.file, self.transaction.join("displaced.json"))?;
            }
            checkpoint("displaced")?;
            durable_create(&self.transaction.join("install.json"), after)?;
            fs::rename(self.transaction.join("install.json"), &self.file)?;
            sync_directory(&self.directory)?;
            checkpoint("installed")?;
            fs::rename(&self.transaction, &self.backup)?; // commit point; retain recovery bytes
            Ok(())
        };
        match write() {
            Ok(()) => committed,
            Err(e) => {
                if prepared && self.recover_unlocked().status != "recovered" {
                    return diagnostic("recovery-required", e);
                }
                diagnostic(
                    if plain_kind(&self.transaction).ok() == Some("missing") {
                        "persistence-failed"
                    } else {
                        "recovery-required"
                    },
                    e,
                )
            }
        }
    }
    pub fn recover(&self) -> StoreResult {
        match self.acquire() {
            Ok(guard) => guard.finish(self.recover_unlocked()),
            Err(e) => diagnostic(
                if e.kind() == std::io::ErrorKind::AlreadyExists {
                    "busy"
                } else {
                    "recovery-required"
                },
                e,
            ),
        }
    }
    fn recover_unlocked(&self) -> StoreResult {
        let recover = || -> std::io::Result<()> {
            // An existing oversized canonical file is never deleted/replaced by
            // recovery, even when a smaller journal snapshot could be restored.
            if plain_kind(&self.file)? == "file" {
                check_metadata_file_size(&self.file)?;
            }
            let pending = plain_kind(&self.transaction)? != "missing";
            let artifact = if pending {
                &self.transaction
            } else {
                &self.backup
            };
            if plain_kind(artifact)? != "directory" {
                return Err(std::io::Error::other("no-recovery-artifact"));
            }
            // Recovery can remove unused snapshots and an old restore file too.
            // Preserve an oversized legacy journal in its entirety for explicit
            // maintenance, regardless of which direction supplies authority.
            for name in [
                "manifest.json",
                "before.json",
                "after.json",
                "displaced.json",
                "install.json",
                "restore.json",
            ] {
                let path = artifact.join(name);
                if plain_kind(&path)? == "file" {
                    check_metadata_file_size(&path)?;
                }
            }
            let manifest_path = artifact.join("manifest.json");
            if plain_kind(&manifest_path)? != "file" {
                return Err(std::io::Error::other("invalid-recovery"));
            }
            let manifest =
                parse_metadata(&fs::read(manifest_path)?).map_err(std::io::Error::other)?;
            let valid_hash = |v: &Value| {
                v.as_str().is_some_and(|s| {
                    s.len() == 64
                        && s.bytes()
                            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
                })
            };
            if !manifest.is_object()
                || manifest["protocol"] != 1
                || !valid_hash(&manifest["afterSha256"])
                || (manifest["beforeSha256"] != Value::Null
                    && !valid_hash(&manifest["beforeSha256"]))
                || manifest.get("beforeSha256").is_none()
            {
                return Err(std::io::Error::other("invalid-recovery"));
            }
            if !pending && plain_kind(&self.file)? != "missing" {
                return Err(std::io::Error::other("canonical-store-present"));
            }
            if pending && plain_kind(&self.file)? == "file" {
                let hash = sha256(fs::read(&self.file)?);
                if Some(hash.as_str()) != manifest["beforeSha256"].as_str()
                    && Some(hash.as_str()) != manifest["afterSha256"].as_str()
                {
                    return Err(std::io::Error::other("canonical-source-changed"));
                }
            }
            let hash = &manifest[if pending {
                "beforeSha256"
            } else {
                "afterSha256"
            }];
            let bytes = if hash.is_null() {
                None
            } else {
                let source = artifact.join(if pending { "before.json" } else { "after.json" });
                if plain_kind(&source)? != "file" {
                    return Err(std::io::Error::other("invalid-recovery"));
                }
                let bytes = read_metadata_file(&source)?;
                if Some(sha256(&bytes).as_str()) != hash.as_str() {
                    return Err(std::io::Error::other("invalid-recovery-hash"));
                }
                let value = parse_metadata(&bytes).map_err(std::io::Error::other)?;
                validate_store(&value).map_err(std::io::Error::other)?;
                check_result_size(&with_store("ready", value)).map_err(std::io::Error::other)?;
                Some(bytes)
            };
            let restore = artifact.join("restore.json");
            match plain_kind(&restore)? {
                "file" => fs::remove_file(&restore)?,
                "missing" => (),
                _ => return Err(std::io::Error::other("invalid-recovery")),
            }
            if let Some(bytes) = &bytes {
                durable_create(&restore, bytes)?;
            }
            match plain_kind(&self.file)? {
                "file" => fs::remove_file(&self.file)?,
                "missing" => (),
                _ => return Err(std::io::Error::other("invalid-recovery")),
            }
            if bytes.is_some() {
                fs::rename(restore, &self.file)?;
            }
            sync_directory(&self.directory)?;
            if pending {
                fs::remove_dir_all(&self.transaction)?;
            }
            Ok(())
        };
        match recover() {
            Ok(()) => result("recovered"),
            Err(e) => repository_error("recovery-required", e),
        }
    }
    pub fn migrate_legacy(&self, legacy_file: &Path) -> StoreResult {
        self.migrate_legacy_with_checkpoint(legacy_file, |_| Ok(()))
    }
    fn migrate_legacy_with_checkpoint(
        &self,
        legacy_file: &Path,
        checkpoint: impl Fn(&str) -> std::io::Result<()>,
    ) -> StoreResult {
        let initial = self.read();
        if initial.status != "missing" {
            return initial;
        }
        let read_legacy = || -> std::io::Result<(Vec<u8>, Value)> {
            if plain_kind(legacy_file)? != "file" {
                return Err(std::io::Error::other("legacy-not-file"));
            }
            let bytes = fs::read(legacy_file)?;
            let source = std::str::from_utf8(&bytes)
                .map_err(std::io::Error::other)?
                .trim_start_matches('\u{feff}');
            let value = serde_json::from_str(source)?;
            Ok((bytes, value))
        };
        let (bytes, legacy) = match read_legacy() {
            Ok(v) => v,
            Err(e) => return diagnostic("legacy-unavailable", e),
        };
        let Some(root) = legacy.get("ucpInstallation").and_then(Value::as_str) else {
            return result("legacy-unavailable");
        };
        let candidate = probe_installation(Some(Path::new(root)));
        let ProbeResult::Recognized { profile, .. } = &candidate else {
            let mut r = result("legacy-unavailable");
            r.candidate = Some(candidate);
            return r;
        };
        if profile.edition != "classic" {
            let mut r = result("legacy-unavailable");
            r.candidate = Some(candidate);
            return r;
        }
        let mut next = empty_store();
        next["profiles"][&profile.id] = serde_json::to_value(profile).unwrap();
        next["migration"] =
            json!({"version":1,"sourceSha256":sha256(bytes),"status":"candidate-imported"});
        let write = self.compare_and_swap_with_checkpoint(None, &next, checkpoint);
        if write.status == "stale-revision" {
            self.read()
        } else {
            write
        }
    }
}
fn preserve_extensions(before: &Value, next: &mut Value) -> Result<(), &'static str> {
    for (key, value) in before.as_object().ok_or("corrupt")? {
        if ![
            "schemaVersion",
            "revision",
            "defaultProfileId",
            "selectedByEdition",
            "profiles",
        ]
        .contains(&key.as_str())
        {
            next[key] = value.clone();
        }
    }
    for (id, profile) in before["profiles"].as_object().ok_or("corrupt")? {
        let target = next["profiles"].get_mut(id).ok_or("corrupt")?;
        if target["edition"] != profile["edition"]
            || target["canonicalRoot"] != profile["canonicalRoot"]
        {
            return Err("corrupt");
        }
        for (key, value) in profile.as_object().ok_or("corrupt")? {
            if !["id", "edition", "canonicalRoot", "displayRoot"].contains(&key.as_str()) {
                target[key] = value.clone();
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::{engine::general_purpose::STANDARD, Engine};
    use std::{
        process::{Command, Stdio},
        sync::atomic::{AtomicU64, Ordering},
        time::Duration,
    };
    static SERIAL: AtomicU64 = AtomicU64::new(0);
    fn fixture() -> Value {
        serde_json::from_str(include_str!(
            "../../../tests/fixtures/de-mode/foundation.json"
        ))
        .unwrap()
    }
    struct Temp(PathBuf);
    impl Temp {
        fn new() -> Self {
            let base = std::env::var_os("AI_TOOLKIT_PROFILE_TEST_ROOT")
                .map(PathBuf::from)
                .unwrap_or_else(|| {
                    std::env::temp_dir()
                        .join("toolkit-core-tests")
                        .join(sha256(env!("CARGO_MANIFEST_DIR")))
                });
            fs::create_dir_all(&base).unwrap();
            let path = base.join(format!(
                "rust-{}-{}",
                std::process::id(),
                SERIAL.fetch_add(1, Ordering::Relaxed)
            ));
            fs::create_dir(&path).unwrap();
            Self(path)
        }
    }
    impl Drop for Temp {
        fn drop(&mut self) {
            let _ = fs::remove_dir_all(&self.0);
        }
    }
    fn tree(root: &Path, entries: &Value) {
        for (relative, kind) in entries.as_object().unwrap() {
            let file = root.join(relative);
            if kind == "directory" {
                fs::create_dir_all(&file).unwrap();
            } else {
                fs::create_dir_all(file.parent().unwrap()).unwrap();
                let bytes = if kind == "text" {
                    b"synthetic asset marker".to_vec()
                } else {
                    STANDARD
                        .decode(
                            fixture()["binaries"][kind.as_str().unwrap()]["base64"]
                                .as_str()
                                .unwrap(),
                        )
                        .unwrap()
                };
                fs::write(file, bytes).unwrap();
            }
        }
    }
    fn case(name: &str) -> Value {
        fixture()["cases"]
            .as_array()
            .unwrap()
            .iter()
            .find(|c| c["name"] == name)
            .unwrap()
            .clone()
    }
    fn snapshot(root: &Path) -> Vec<(String, String)> {
        fn walk(root: &Path, dir: &Path, out: &mut Vec<(String, String)>) {
            let mut entries = fs::read_dir(dir)
                .unwrap()
                .map(|e| e.unwrap())
                .collect::<Vec<_>>();
            entries.sort_by_key(|e| e.file_name());
            for entry in entries {
                let file = entry.path();
                let directory = entry.file_type().unwrap().is_dir();
                out.push((
                    portable_path(file.strip_prefix(root).unwrap()),
                    if directory {
                        "dir".into()
                    } else {
                        sha256(fs::read(&file).unwrap())
                    },
                ));
                if directory {
                    walk(root, &file, out);
                }
            }
        }
        let mut out = vec![];
        walk(root, root, &mut out);
        out
    }
    fn seeded(store: &Value) -> (Temp, ProfileRepository) {
        let temp = Temp::new();
        let repository = ProfileRepository::new(&temp.0).unwrap();
        fs::write(&repository.file, serde_json::to_vec_pretty(store).unwrap()).unwrap();
        (temp, repository)
    }
    fn next(store: &Value) -> Value {
        let mut next = store.clone();
        next["revision"] = json!(store["revision"].as_u64().unwrap() + 1);
        next
    }
    fn node(script: &str, directory: &Path) -> Command {
        let mut command = Command::new("node");
        command
            .arg("-e")
            .arg(format!("(async()=>{{{script}}})().catch(e=>{{console.error(e);process.exitCode=1}}).finally(()=>require(process.argv[1]).close())"))
            .arg(Path::new(env!("CARGO_MANIFEST_DIR")).join("../../src/node/game-profiles.js"))
            .arg(directory);
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            command.creation_flags(0x08000000);
        }
        command
    }
    fn worker(action: &str, directory: &Path, phase: &str) -> Command {
        let mut command = Command::new(std::env::current_exe().unwrap());
        command
            .args([
                "--exact",
                "profiles::tests::subprocess_worker",
                "--nocapture",
            ])
            .env("PROFILE_TEST_ACTION", action)
            .env("PROFILE_TEST_DIRECTORY", directory)
            .env("PROFILE_TEST_PHASE", phase);
        #[cfg(windows)]
        {
            use std::os::windows::process::CommandExt;
            command.creation_flags(0x08000000);
        }
        command
    }
    #[test]
    fn shared_pe_fixtures() {
        for (name, binary) in fixture()["binaries"].as_object().unwrap() {
            let bytes = STANDARD.decode(binary["base64"].as_str().unwrap()).unwrap();
            assert_eq!(
                serde_json::to_value(inspect_pe(&bytes)).unwrap(),
                binary["expected"],
                "{name}"
            );
        }
        assert!(inspect_pe(&[0; 4096]).is_none());
        let mut bytes = STANDARD
            .decode(
                fixture()["binaries"]["native64"]["base64"]
                    .as_str()
                    .unwrap(),
            )
            .unwrap();
        bytes[0x3c..0x40].copy_from_slice(&0xfffffff0u32.to_le_bytes());
        assert!(inspect_pe(&bytes).is_none());
    }
    #[test]
    fn independent_clr_declarations_and_metadata_roots_fail_closed_with_helper_parity() {
        let fixtures = fixture();
        for mutation in fixtures["managedMutations"].as_array().unwrap() {
            let temp = Temp::new();
            tree(&temp.0, &case("de-only")["entries"]);
            let mut bytes = STANDARD
                .decode(fixtures["binaries"]["managed"]["base64"].as_str().unwrap())
                .unwrap();
            let offset = mutation["offset"].as_u64().unwrap() as usize;
            let width = mutation["width"].as_u64().unwrap() as usize;
            let value = mutation["value"].as_u64().unwrap() as u32;
            bytes[offset..offset + width].copy_from_slice(&value.to_le_bytes()[..width]);
            assert!(inspect_pe(&bytes).is_none(), "{}", mutation["name"]);
            fs::write(temp.0.join(DE_FILES[1]), bytes).unwrap();
            let before = snapshot(&temp.0);
            let native = serde_json::to_value(probe_installation(Some(&temp.0))).unwrap();
            assert_eq!(
                native,
                json!({"status":"incomplete","diagnostics":["de-pe-invalid"]}),
                "{}",
                mutation["name"]
            );
            let output = node("console.log(JSON.stringify((await require(process.argv[1]).probeInstallation(process.argv[2]))))", &temp.0).output().unwrap();
            assert!(
                output.status.success(),
                "{}",
                String::from_utf8_lossy(&output.stderr)
            );
            let other: Value = serde_json::from_slice(&output.stdout).unwrap();
            assert_eq!(native, other, "{}", mutation["name"]);
            assert_eq!(snapshot(&temp.0), before);
        }
    }
    #[test]
    fn shared_layout_matrix_and_in_process_helper_probe_parity_are_read_only() {
        for sample in fixture()["cases"].as_array().unwrap() {
            let temp = Temp::new();
            tree(&temp.0, &sample["entries"]);
            let before = snapshot(&temp.0);
            let probe = serde_json::to_value(probe_installation(Some(&temp.0))).unwrap();
            assert_eq!(probe["status"], sample["status"], "{}", sample["name"]);
            if sample["status"] == "recognized" {
                assert_eq!(probe["profile"]["edition"], sample["edition"]);
                assert_eq!(probe["ucpLibraryAvailable"], sample["ucp"]);
                assert_eq!(probe["versionStatus"], "unknown");
            }
            let output = node("console.log(JSON.stringify((await require(process.argv[1]).probeInstallation(process.argv[2]))))", &temp.0).output().unwrap();
            assert!(
                output.status.success(),
                "{}",
                String::from_utf8_lossy(&output.stderr)
            );
            let other: Value = serde_json::from_slice(&output.stdout).unwrap();
            assert_eq!(probe, other, "In-process/helper parity: {}", sample["name"]);
            assert_eq!(before, snapshot(&temp.0));
        }
    }
    #[test]
    fn aliases_suffixes_case_and_root_revision_identity() {
        let temp = Temp::new();
        let root = temp.0.join("CaseRoot");
        fs::create_dir(&root).unwrap();
        tree(&root, &case("classic-ucp")["entries"]);
        let ProbeResult::Recognized {
            profile,
            source_revision,
            ..
        } = probe_installation(Some(&root))
        else {
            panic!("probe");
        };
        for suffix in ["ucp", "ucp/plugins"] {
            let ProbeResult::Recognized { profile: other, .. } =
                probe_installation(Some(&root.join(suffix)))
            else {
                panic!("suffix");
            };
            assert_eq!(other.id, profile.id);
        }
        let ProbeResult::Recognized {
            profile: lexical, ..
        } = probe_installation(Some(&root.join("ucp/..")))
        else {
            panic!("lexical");
        };
        assert_eq!(profile.id, lexical.id);
        let named_ucp = temp.0.join("ucp");
        fs::create_dir(&named_ucp).unwrap();
        tree(&named_ucp, &case("classic-ucp")["entries"]);
        let ProbeResult::Recognized { profile: named, .. } = probe_installation(Some(&named_ucp))
        else {
            panic!("named ucp");
        };
        assert_eq!(
            named.canonical_root,
            portable_path(&dunce::canonicalize(named_ucp).unwrap())
        );
        let alias = temp.0.join("alias");
        #[cfg(windows)]
        {
            // Junctions do not need Developer Mode/elevated symlink privileges.
            let output = node("require('node:fs').symlinkSync(require('node:path').join(process.argv[2],'CaseRoot'),require('node:path').join(process.argv[2],'alias'),'junction')", &temp.0).output().unwrap();
            assert!(
                output.status.success(),
                "{}",
                String::from_utf8_lossy(&output.stderr)
            );
        }
        #[cfg(unix)]
        std::os::unix::fs::symlink(&root, &alias).unwrap();
        let ProbeResult::Recognized { profile: other, .. } = probe_installation(Some(&alias))
        else {
            panic!("alias");
        };
        assert_eq!(profile.id, other.id);
        assert_ne!(profile.display_root, other.display_root);
        let lower = temp.0.join("caseroot");
        #[cfg(not(windows))]
        {
            fs::create_dir(&lower).unwrap();
            tree(&lower, &case("classic-plain")["entries"]);
        }
        let ProbeResult::Recognized { profile: other, .. } = probe_installation(Some(&lower))
        else {
            panic!("case");
        };
        assert_eq!(profile.id == other.id, cfg!(windows));
        let second = Temp::new();
        tree(&second.0, &case("classic-plain")["entries"]);
        let ProbeResult::Recognized { profile: other, .. } = probe_installation(Some(&second.0))
        else {
            panic!("other root");
        };
        assert_ne!(profile.id, other.id);
        let file = root.join(CLASSIC_EXES[0]);
        let mut bytes = fs::read(&file).unwrap();
        bytes.extend(b"synthetic patch");
        fs::write(file, bytes).unwrap();
        let ProbeResult::Recognized {
            profile: other,
            source_revision: revision,
            ..
        } = probe_installation(Some(&root))
        else {
            panic!("patch");
        };
        assert_eq!(profile.id, other.id);
        assert_ne!(source_revision, revision);
    }
    #[test]
    fn cancel_missing_unreadable_unknown_are_not_profiles() {
        assert!(matches!(
            probe_installation(None),
            ProbeResult::Unknown { .. }
        ));
        assert!(matches!(
            probe_installation(Some(Path::new(""))),
            ProbeResult::Unknown { .. }
        ));
        assert!(matches!(
            probe_installation(Some(Path::new("."))),
            ProbeResult::Unknown { .. }
        ));
        let temp = Temp::new();
        assert!(matches!(
            probe_installation(Some(&temp.0.join("missing"))),
            ProbeResult::Unknown { .. }
        ));
        tree(&temp.0, &case("classic-plain")["entries"]);
        #[cfg(windows)]
        {
            use std::os::windows::fs::OpenOptionsExt;
            let _deny_read = fs::OpenOptions::new()
                .read(true)
                .share_mode(0)
                .open(temp.0.join(CLASSIC_EXES[0]))
                .unwrap();
            assert!(matches!(
                probe_installation(Some(&temp.0)),
                ProbeResult::Unreadable { .. }
            ));
        }
        #[cfg(unix)]
        {
            let file = temp.0.join(CLASSIC_EXES[0]);
            fs::remove_file(&file).unwrap();
            std::os::unix::fs::symlink(CLASSIC_EXES[0], file).unwrap();
            assert!(matches!(
                probe_installation(Some(&temp.0)),
                ProbeResult::Unreadable { .. }
            ));
        }
    }
    #[test]
    fn schema_validation_and_safe_unknown_numbers() {
        let store = fixture()["store"].clone();
        assert_eq!(validate_store(&store), Ok(()));
        for (key, value) in [
            ("schemaVersion", json!(0)),
            ("revision", json!(-1)),
            ("revision", json!(1.5)),
            ("revision", json!(MAX_SAFE + 1)),
            ("defaultProfileId", json!("missing")),
            ("profiles", json!([])),
            ("selectedByEdition", json!({"de":store["defaultProfileId"]})),
        ] {
            let mut invalid = store.clone();
            invalid[key] = value;
            assert!(validate_store(&invalid).is_err(), "{key}");
        }
        let mut invalid = store.clone();
        invalid.as_object_mut().unwrap().remove("defaultProfileId");
        assert!(validate_store(&invalid).is_err());
        let mut invalid = store.clone();
        let id = store["defaultProfileId"].as_str().unwrap();
        invalid["profiles"][id]["canonicalRoot"] = json!("/different");
        assert!(validate_store(&invalid).is_err());
        for source in [
            "{\"n\":9007199254740993}",
            "{\"n\":1.5}",
            "{\"n\":1e3}",
            "{\"n\":1e999}",
        ] {
            assert!(parse_metadata(source.as_bytes()).is_err());
        }
        assert!(parse_metadata(&[0xff]).is_err());
        assert_eq!(
            parse_metadata(br#"{"n":"9007199254740993"}"#).unwrap(),
            json!({"n":"9007199254740993"})
        );
    }
    fn nested(containers: usize, kind: &str) -> Value {
        let mut value = Value::Null;
        for i in 0..containers {
            value = if kind == "array" || (kind == "mixed" && i % 2 == 1) {
                json!([value])
            } else {
                json!({"child":value})
            };
        }
        value
    }
    fn boundary_store(place: &str, kind: &str, extra: usize) -> Value {
        let mut store = fixture()["store"].clone();
        store["revision"] = json!(0);
        let wrappers = if place == "store" { 1 } else { 3 };
        let extension = nested(MAX_JSON_DEPTH - wrappers + extra, kind);
        if place == "store" {
            store["extension"] = extension;
        } else {
            let id = store["defaultProfileId"].as_str().unwrap().to_owned();
            store["profiles"][id]["extension"] = extension;
        }
        store
    }
    #[test]
    fn metadata_depth_bounds_wrappers_self_roundtrips_and_preserved_fields() {
        assert_eq!(
            fixture()["metadataDomain"]["maxContainerDepth"],
            MAX_JSON_DEPTH
        );
        for place in ["store", "profile"] {
            for kind in ["object", "array", "mixed"] {
                let temp = Temp::new();
                let repository = ProfileRepository::new(&temp.0).unwrap();
                let store = boundary_store(place, kind, 0);
                let committed = repository.compare_and_swap(None, &store);
                assert_eq!(committed.status, "committed", "{place}/{kind}");
                assert_eq!(committed.store, repository.read().store);
                let before = snapshot(&temp.0);
                for extra in [1, 130] {
                    let mut invalid = boundary_store(place, kind, extra);
                    invalid["revision"] = json!(1);
                    assert_eq!(
                        repository.compare_and_swap(Some(0), &invalid).status,
                        "corrupt"
                    );
                    assert_eq!(snapshot(&temp.0), before);
                }
                let mut proposed = next(&store);
                let target = if place == "store" {
                    &mut proposed
                } else {
                    let id = proposed["defaultProfileId"].as_str().unwrap().to_owned();
                    &mut proposed["profiles"][id]
                };
                target.as_object_mut().unwrap().remove("extension");
                let committed = repository.compare_and_swap(Some(0), &proposed);
                assert_eq!(committed.status, "committed");
                assert_eq!(committed.store, repository.read().store);
                assert_eq!(committed.store, Some(next(&store)));
            }
        }
        for kind in ["object", "array", "mixed"] {
            let value = nested(64, kind);
            assert_eq!(
                parse_metadata(&serde_json::to_vec(&value).unwrap()).unwrap(),
                value
            );
            assert!(parse_metadata(&serde_json::to_vec(&nested(65, kind)).unwrap()).is_err());
        }
    }
    #[test]
    fn metadata_boundary_roundtrips_in_in_process_helper_directions() {
        for place in ["store", "profile"] {
            for kind in ["object", "array", "mixed"] {
                let temp = Temp::new();
                let repository = ProfileRepository::new(&temp.0).unwrap();
                let store = boundary_store(place, kind, 0);
                // The real helper commits; the in-process core reads the same bytes.
                let script = "const a=require(process.argv[1]),r=new a.ProfileRepository(process.argv[2]),s=JSON.parse(process.argv[3]);const w=(await r.compareAndSwap(null,s));require('node:assert/strict').deepEqual(w.store,(await r.read()).store);console.log(JSON.stringify(w))";
                let output = node(script, &temp.0)
                    .arg(serde_json::to_string(&store).unwrap())
                    .output()
                    .unwrap();
                assert!(
                    output.status.success(),
                    "{}",
                    String::from_utf8_lossy(&output.stderr)
                );
                let written: Value = serde_json::from_slice(&output.stdout).unwrap();
                assert_eq!(written["status"], "committed");
                assert_eq!(repository.read().store, Some(store.clone()));
                // In-process preservation update; helper reads the same snapshot.
                let mut proposed = next(&store);
                let target = if place == "store" {
                    &mut proposed
                } else {
                    let id = proposed["defaultProfileId"].as_str().unwrap().to_owned();
                    &mut proposed["profiles"][id]
                };
                target.as_object_mut().unwrap().remove("extension");
                let written = repository.compare_and_swap(Some(0), &proposed);
                assert_eq!(written.status, "committed");
                let output = node("console.log(JSON.stringify((await new(require(process.argv[1]).ProfileRepository)(process.argv[2]).read())))", &temp.0).output().unwrap();
                assert!(
                    output.status.success(),
                    "{}",
                    String::from_utf8_lossy(&output.stderr)
                );
                let read: Value = serde_json::from_slice(&output.stdout).unwrap();
                assert_eq!(read["status"], "ready");
                assert_eq!(read["store"], written.store.unwrap());
            }
        }
    }
    #[test]
    fn shared_unicode_bom_and_external_depth_policy_matches_helper() {
        for sample in fixture()["metadataDomain"]["jsonCases"].as_array().unwrap() {
            let source = sample["source"].as_str().unwrap();
            assert_eq!(
                parse_metadata(source.as_bytes()).is_ok(),
                sample["valid"].as_bool().unwrap(),
                "{}",
                sample["name"]
            );
        }
        let temp = Temp::new();
        let repository = ProfileRepository::new(&temp.0).unwrap();
        let mut sources: Vec<Vec<u8>> = fixture()["metadataDomain"]["jsonCases"].as_array().unwrap().iter()
            .filter(|sample| sample["valid"] == false)
            .map(|sample| format!("{{\"schemaVersion\":1,\"revision\":0,\"defaultProfileId\":null,\"selectedByEdition\":{{}},\"profiles\":{{}},\"extension\":{}}}", sample["source"].as_str().unwrap()).into_bytes()).collect();
        sources.push(format!("\u{feff}{}", empty_store()).into_bytes());
        sources.push(serde_json::to_vec(&boundary_store("profile", "array", 1)).unwrap());
        sources.push(vec![0xff]);
        for bytes in sources {
            fs::write(&repository.file, &bytes).unwrap();
            assert_eq!(repository.read().status, "corrupt");
            assert_eq!(
                repository.migrate_legacy(&temp.0.join("absent")).status,
                "corrupt"
            );
            let output = node("const r=new(require(process.argv[1]).ProfileRepository)(process.argv[2]);console.log((await r.read()).status,(await r.migrateLegacy(require('node:path').join(process.argv[2],'absent'))).status)", &temp.0).output().unwrap();
            assert!(output.status.success());
            assert_eq!(
                String::from_utf8_lossy(&output.stdout).trim(),
                "corrupt corrupt"
            );
            assert_eq!(fs::read(&repository.file).unwrap(), bytes);
        }
    }
    #[test]
    fn shared_raw_duplicate_policy_rejects_reads_cas_and_migration_without_mutation() {
        assert_eq!(
            fixture()["metadataDomain"]["duplicateMemberPolicy"],
            "reject-decoded-object-member-names-at-every-level"
        );
        let root = Temp::new();
        tree(&root.0, &case("classic-plain")["entries"]);
        for sample in fixture()["metadataDomain"]["rawStoreCases"]
            .as_array()
            .unwrap()
        {
            let bytes = sample["source"].as_str().unwrap().as_bytes();
            let valid = sample["valid"].as_bool().unwrap();
            let parsed = parse_metadata(bytes);
            assert_eq!(parsed.is_ok(), valid, "{}", sample["name"]);
            if valid {
                validate_store(parsed.as_ref().unwrap()).unwrap();
            }
            for retained_backup in [false, true] {
                let temp = Temp::new();
                let repository = ProfileRepository::new(&temp.0).unwrap();
                if retained_backup {
                    assert_eq!(
                        repository.compare_and_swap(None, &empty_store()).status,
                        "committed"
                    );
                }
                fs::write(&repository.file, bytes).unwrap();
                let legacy = temp.0.join("settings.json");
                fs::write(
                    &legacy,
                    json!({"ucpInstallation": root.0, "extension": "preserve"}).to_string(),
                )
                .unwrap();
                let before = snapshot(&temp.0);
                let status = if valid { "ready" } else { "corrupt" };
                assert_eq!(repository.read().status, status, "{}", sample["name"]);
                assert_eq!(snapshot(&temp.0), before);
                assert_eq!(repository.migrate_legacy(&legacy).status, status);
                assert_eq!(snapshot(&temp.0), before);
                if !valid {
                    assert_eq!(
                        repository
                            .compare_and_swap(Some(0), &next(&empty_store()))
                            .status,
                        "corrupt"
                    );
                    assert_eq!(snapshot(&temp.0), before);
                }
                let output = node(r#"
                    const fs=require('node:fs'),path=require('node:path'),api=require(process.argv[1]);
                    const r=new api.ProfileRepository(process.argv[2]);let valid=true;
                    try{(await api.validateStore((await api.parseMetadata(fs.readFileSync(r.file)))))}catch{valid=false}
                    const statuses=[(await r.read()).status,(await r.migrateLegacy(path.join(r.directory,'settings.json'))).status];
                    if(!valid)statuses.push((await r.compareAndSwap(0,{...api.emptyStore(),revision:1})).status);
                    console.log(JSON.stringify({valid,statuses}));
                "#, &temp.0).output().unwrap();
                assert!(
                    output.status.success(),
                    "{}",
                    String::from_utf8_lossy(&output.stderr)
                );
                let observed: Value = serde_json::from_slice(&output.stdout).unwrap();
                assert_eq!(observed["valid"], valid, "{}", sample["name"]);
                assert_eq!(
                    observed["statuses"],
                    if valid {
                        json!(["ready", "ready"])
                    } else {
                        json!(["corrupt", "corrupt", "corrupt"])
                    }
                );
                assert_eq!(snapshot(&temp.0), before);
                assert_eq!(fs::read(&repository.file).unwrap(), bytes);
                if valid {
                    let committed =
                        repository.compare_and_swap(Some(0), &next(parsed.as_ref().unwrap()));
                    assert_eq!(committed.status, "committed");
                    assert_eq!(committed.store, repository.read().store);
                    let output = node("console.log(JSON.stringify((await new(require(process.argv[1]).ProfileRepository)(process.argv[2]).read())))", &temp.0).output().unwrap();
                    assert!(output.status.success());
                    let read: Value = serde_json::from_slice(&output.stdout).unwrap();
                    assert_eq!(read["status"], "ready");
                    assert_eq!(read["store"], committed.store.unwrap());
                }
            }
        }
    }
    fn legacy_recovery_fixture(
        repository: &ProfileRepository,
        before: &[u8],
        after: &[u8],
        pending: bool,
    ) {
        // Construct a pre-existing/external journal, not output of today's writer.
        // Pending means interruption after displacement with no canonical file.
        let artifact = if pending {
            &repository.transaction
        } else {
            &repository.backup
        };
        fs::create_dir(artifact).unwrap();
        for (name, bytes) in [
            ("before.json", before),
            ("after.json", after),
            ("displaced.json", before),
        ] {
            fs::write(artifact.join(name), bytes).unwrap();
        }
        fs::write(
            artifact.join("manifest.json"),
            json!({"protocol":1,"beforeSha256":sha256(before),"afterSha256":sha256(after)})
                .to_string(),
        )
        .unwrap();
        fs::write(artifact.join("restore.json"), b"retained recovery evidence").unwrap();
    }
    fn assert_in_process_helper_recovery_refusal(repository: &ProfileRepository) {
        let before = snapshot(&repository.directory);
        assert_eq!(repository.read().status, "recovery-required");
        assert_eq!(snapshot(&repository.directory), before);
        assert_eq!(repository.recover().status, "recovery-required");
        assert_eq!(snapshot(&repository.directory), before);
        assert_eq!(
            repository.compare_and_swap(None, &empty_store()).status,
            "recovery-required"
        );
        assert_eq!(snapshot(&repository.directory), before);
        assert_eq!(
            repository
                .migrate_legacy(&repository.directory.join("absent"))
                .status,
            "recovery-required"
        );
        assert_eq!(snapshot(&repository.directory), before);
        let output = node(r#"
            const api=require(process.argv[1]),path=require('node:path'),r=new api.ProfileRepository(process.argv[2]);
            console.log(JSON.stringify([(await r.read()).status,(await r.recover()).status,(await r.compareAndSwap(null,api.emptyStore())).status,(await r.migrateLegacy(path.join(r.directory,'absent'))).status]));
        "#, &repository.directory).output().unwrap();
        assert!(
            output.status.success(),
            "{}",
            String::from_utf8_lossy(&output.stderr)
        );
        let statuses: Value = serde_json::from_slice(&output.stdout).unwrap();
        assert_eq!(
            statuses,
            json!([
                "recovery-required",
                "recovery-required",
                "recovery-required",
                "recovery-required"
            ])
        );
        assert_eq!(snapshot(&repository.directory), before);
        assert_eq!(repository.recover().status, "recovery-required");
        assert_eq!(snapshot(&repository.directory), before);
        assert!(!repository.file.exists());
    }
    #[test]
    fn legacy_malformed_before_and_after_snapshots_fail_closed_in_both_backends() {
        let good_before = serde_json::to_vec(&empty_store()).unwrap();
        let good_after = serde_json::to_vec(&next(&empty_store())).unwrap();
        for sample in fixture()["metadataDomain"]["rawStoreCases"]
            .as_array()
            .unwrap()
            .iter()
            .filter(|s| s["valid"] == false)
        {
            let bytes = sample["source"].as_str().unwrap().as_bytes();
            for pending in [true, false] {
                let temp = Temp::new();
                let repository = ProfileRepository::new(&temp.0).unwrap();
                // Includes Review17's interrupted-original surrogate/depth cases:
                // both recoverers reject the legacy before.json without deletion.
                legacy_recovery_fixture(
                    &repository,
                    if pending { bytes } else { &good_before },
                    if pending { &good_after } else { bytes },
                    pending,
                );
                assert_in_process_helper_recovery_refusal(&repository);
            }
        }
    }
    #[test]
    fn duplicate_decoded_manifest_names_cannot_authorize_either_backend() {
        let before = serde_json::to_vec(&empty_store()).unwrap();
        let after = serde_json::to_vec(&next(&empty_store())).unwrap();
        for pending in [true, false] {
            let temp = Temp::new();
            let repository = ProfileRepository::new(&temp.0).unwrap();
            legacy_recovery_fixture(&repository, &before, &after, pending);
            let artifact = if pending {
                &repository.transaction
            } else {
                &repository.backup
            };
            let file = artifact.join("manifest.json");
            let mut source = fs::read_to_string(&file).unwrap();
            assert_eq!(source.pop(), Some('}'));
            source.push_str(r#", "protoc\u006fl":1}"#);
            fs::write(file, source).unwrap();
            assert_in_process_helper_recovery_refusal(&repository);
        }
    }
    #[test]
    fn corrupt_future_io_and_artifacts_are_not_missing() {
        let (_temp, repository) = seeded(&fixture()["store"]);
        for (bytes, status) in [
            (b"broken".as_slice(), "corrupt"),
            (&[0xff], "corrupt"),
            (br#"{"schemaVersion":2}"#, "future-schema"),
            (
                br#"{"schemaVersion":1,"revision":9007199254740993}"#,
                "corrupt",
            ),
        ] {
            fs::write(&repository.file, bytes).unwrap();
            assert_eq!(repository.read().status, status);
            assert_eq!(
                repository
                    .migrate_legacy(&repository.directory.join("nonexistent-legacy"))
                    .status,
                status
            );
            assert_eq!(fs::read(&repository.file).unwrap(), bytes);
        }
        fs::remove_file(&repository.file).unwrap();
        fs::create_dir(&repository.file).unwrap();
        assert_eq!(repository.read().status, "io-error");
        fs::remove_dir(&repository.file).unwrap();
        fs::create_dir(&repository.transaction).unwrap();
        assert_eq!(repository.read().status, "recovery-required");
        assert_eq!(repository.recover().status, "recovery-required");
    }
    #[test]
    fn exact_legacy_bytes_and_unrelated_files_survive_idempotent_inactive_migration() {
        let root = Temp::new();
        tree(&root.0, &case("classic-plain")["entries"]);
        let temp = Temp::new();
        let repository = ProfileRepository::new(&temp.0).unwrap();
        let legacy = temp.0.join("settings.json");
        let bytes = format!(
            "\u{feff}{{ \"unknown\":9007199254740993,\r\n\"ucpInstallation\":{} }}\r\n",
            serde_json::to_string(&root.0.to_string_lossy()).unwrap()
        )
        .into_bytes();
        fs::write(&legacy, &bytes).unwrap();
        fs::create_dir(temp.0.join("aiv-skins")).unwrap();
        fs::write(temp.0.join("aiv-skins/5.png"), b"old skin").unwrap();
        fs::write(temp.0.join("history.json"), b"old history").unwrap();
        let before = snapshot(&temp.0);
        let migrated = repository.migrate_legacy(&legacy);
        assert_eq!(migrated.status, "committed");
        let store = migrated.store.unwrap();
        assert_eq!(store["defaultProfileId"], Value::Null);
        assert_eq!(store["selectedByEdition"], json!({}));
        assert_eq!(store["profiles"].as_object().unwrap().len(), 1);
        let stored = fs::read(&repository.file).unwrap();
        assert_eq!(repository.migrate_legacy(&legacy).status, "ready");
        assert_eq!(fs::read(&repository.file).unwrap(), stored);
        assert_eq!(fs::read(&legacy).unwrap(), bytes);
        let after = snapshot(&temp.0);
        for entry in before {
            assert!(after.contains(&entry));
        }
    }
    #[test]
    fn unavailable_legacy_and_failed_migration_cannot_default_a_profile() {
        let temp = Temp::new();
        let repository = ProfileRepository::new(&temp.0).unwrap();
        let legacy = temp.0.join("settings.json");
        for name in ["de-only", "mixed", "empty"] {
            let root = Temp::new();
            tree(&root.0, &case(name)["entries"]);
            fs::write(
                &legacy,
                serde_json::to_vec(&json!({"ucpInstallation":root.0})).unwrap(),
            )
            .unwrap();
            assert_eq!(
                repository.migrate_legacy(&legacy).status,
                "legacy-unavailable"
            );
            assert_eq!(repository.read().status, "missing");
        }
        let root = Temp::new();
        tree(&root.0, &case("classic-ucp")["entries"]);
        let bytes =
            serde_json::to_vec(&json!({"ucpInstallation":root.0,"unknown":"preserve"})).unwrap();
        fs::write(&legacy, &bytes).unwrap();
        let failed = repository.migrate_legacy_with_checkpoint(&legacy, |phase| {
            if phase == "installed" {
                Err(std::io::Error::other("synthetic failure"))
            } else {
                Ok(())
            }
        });
        assert_eq!(failed.status, "persistence-failed");
        assert_eq!(repository.read().status, "missing");
        assert_eq!(fs::read(legacy).unwrap(), bytes);
    }
    #[test]
    fn cas_preserves_unknowns_and_rejects_stale_revisions() {
        let store = fixture()["store"].clone();
        let (_temp, repository) = seeded(&store);
        let mut proposed = next(&store);
        proposed.as_object_mut().unwrap().remove("futureStore");
        let id = store["defaultProfileId"].as_str().unwrap();
        proposed["profiles"][id]
            .as_object_mut()
            .unwrap()
            .remove("futureProfile");
        assert_eq!(
            repository.compare_and_swap(Some(6), &proposed).status,
            "stale-revision"
        );
        assert_eq!(
            repository.compare_and_swap(Some(7), &store).status,
            "invalid-revision"
        );
        let committed = repository.compare_and_swap(Some(7), &proposed);
        assert_eq!(committed.status, "committed");
        let current = committed.store.unwrap();
        assert_eq!(current["futureStore"], store["futureStore"]);
        assert_eq!(
            current["profiles"][id]["futureProfile"],
            store["profiles"][id]["futureProfile"]
        );
        let mut deleted = next(&current);
        deleted["profiles"] = json!({});
        deleted["defaultProfileId"] = Value::Null;
        deleted["selectedByEdition"] = json!({});
        assert_eq!(
            repository.compare_and_swap(Some(8), &deleted).status,
            "corrupt"
        );
        assert_eq!(
            repository.compare_and_swap(None, &empty_store()).status,
            "stale-revision"
        );
    }
    #[test]
    fn metadata_byte_boundary_escaping_and_full_response_fit_both_hosts() {
        use crate::contracts::{OperationResult, Output, MAX_FRAME_BYTES, MAX_REQUEST_ID};
        assert!(MAX_METADATA_RESULT_BYTES + 1024 < MAX_FRAME_BYTES);
        for prefix in ["", "\0\n\\\"ä😀"] {
            let temp = Temp::new();
            let repository = ProfileRepository::new(&temp.0).unwrap();
            let mut store = empty_store();
            store["extension"] = json!(prefix.repeat(1024));
            let remaining =
                MAX_METADATA_BYTES - serde_json::to_vec_pretty(&store).unwrap().len() - 1;
            let text = format!(
                "{}{}",
                store["extension"].as_str().unwrap(),
                "x".repeat(remaining)
            );
            store["extension"] = json!(text);
            let mut too_large = store.clone();
            too_large["extension"] = json!(format!("{}x", store["extension"].as_str().unwrap()));
            let rejected = repository.compare_and_swap_with_checkpoint(None, &too_large, |_| {
                panic!("boundary overflow reached persistence")
            });
            assert_eq!(rejected.status, "metadata-too-large");
            assert_eq!(
                rejected.size_limit.unwrap().actual_bytes,
                MAX_METADATA_BYTES as u64 + 1
            );
            assert!(snapshot(&temp.0).is_empty());
            let committed = repository.compare_and_swap(None, &store);
            assert_eq!(committed.status, "committed");
            assert_eq!(
                fs::metadata(&repository.file).unwrap().len(),
                MAX_METADATA_BYTES as u64
            );
            let reply = Output::Reply {
                id: MAX_REQUEST_ID,
                result: OperationResult::Store { value: committed },
            };
            assert!(serde_json::to_vec(&reply).unwrap().len() < MAX_FRAME_BYTES);
            assert_eq!(repository.read().store.as_ref(), Some(&store));
            // The actual helper reads the direct boundary write, then commits an
            // omitted-extension update whose receipt the direct core can read.
            let output = node("const api=require(process.argv[1]),r=new api.ProfileRepository(process.argv[2]);const read=await r.read();if(read.status!=='ready')throw Error(JSON.stringify(read));const written=await r.compareAndSwap(0,{...api.emptyStore(),revision:1});if(written.status!=='committed'||written.store.extension!==read.store.extension)throw Error('boundary cross-read/write');console.log('ok');", &temp.0).output().unwrap();
            assert!(
                output.status.success(),
                "{}",
                String::from_utf8_lossy(&output.stderr)
            );
            store["revision"] = json!(1);
            assert_eq!(repository.read().store.as_ref(), Some(&store));
            let before = snapshot(&temp.0);
            let mut oversized = empty_store();
            oversized["revision"] = json!(2);
            oversized["added"] = json!("x");
            let rejected = repository.compare_and_swap_with_checkpoint(Some(1), &oversized, |_| {
                panic!("oversized proposal reached persistence")
            });
            assert_eq!(rejected.status, "metadata-too-large");
            assert!(rejected.size_limit.unwrap().actual_bytes > MAX_METADATA_BYTES as u64);
            assert_eq!(snapshot(&temp.0), before);
        }
    }
    #[test]
    fn omitted_extensions_cannot_commit_an_unsendable_result() {
        let temp = Temp::new();
        let repository = ProfileRepository::new(&temp.0).unwrap();
        let mut initial = empty_store();
        initial["retained"] = json!("a".repeat(6 * 1024 * 1024 + 128));
        assert_eq!(
            repository.compare_and_swap(None, &initial).status,
            "committed"
        );
        let before = snapshot(&temp.0);
        let mut next = empty_store();
        next["revision"] = json!(1);
        next["added"] = json!("b".repeat(6 * 1024 * 1024 + 128));
        let rejected = repository.compare_and_swap_with_checkpoint(Some(0), &next, |_| {
            panic!("oversized proposal reached persistence")
        });
        assert_eq!(rejected.status, "metadata-too-large");
        assert_eq!(rejected.size_limit.unwrap().actual_bytes, 12_583_316);
        assert_eq!(snapshot(&temp.0), before);
        assert_eq!(repository.read().store.as_ref(), Some(&initial));
    }
    #[test]
    fn oversized_existing_and_recovery_metadata_are_never_mutated() {
        let mut store = empty_store();
        store["extension"] = json!("x".repeat(MAX_METADATA_BYTES));
        let bytes = serde_json::to_vec(&store).unwrap();
        for direction in [
            "canonical",
            "pending-before",
            "committed-after",
            "pending-unused-after",
            "committed-unused-before",
        ] {
            let temp = Temp::new();
            let repository = ProfileRepository::new(&temp.0).unwrap();
            if direction == "canonical" {
                fs::write(&repository.file, &bytes).unwrap();
            } else {
                let artifact = if direction.starts_with("pending") {
                    &repository.transaction
                } else {
                    &repository.backup
                };
                fs::create_dir(artifact).unwrap();
                for name in ["before.json", "after.json", "displaced.json"] {
                    fs::write(artifact.join(name), &bytes).unwrap();
                }
                fs::write(artifact.join("restore.json"), b"retained sentinel").unwrap();
                fs::write(artifact.join("manifest.json"), serde_json::to_vec(&json!({"protocol":1,"beforeSha256":sha256(&bytes),"afterSha256":sha256(&bytes)})).unwrap()).unwrap();
                if direction.contains("unused") {
                    let small = serde_json::to_vec(&empty_store()).unwrap();
                    let pending = direction.starts_with("pending");
                    let source = if pending { "before.json" } else { "after.json" };
                    fs::write(artifact.join(source), &small).unwrap();
                    fs::write(artifact.join("displaced.json"), &small).unwrap();
                    fs::write(
                        artifact.join("manifest.json"),
                        serde_json::to_vec(&json!({"protocol":1,
                        "beforeSha256":if pending {sha256(&small)} else {sha256(&bytes)},
                        "afterSha256":if pending {sha256(&bytes)} else {sha256(&small)}}))
                        .unwrap(),
                    )
                    .unwrap();
                }
            }
            let before = snapshot(&temp.0);
            if direction == "canonical" {
                assert_eq!(repository.read().status, "metadata-too-large");
                assert_eq!(
                    repository.compare_and_swap(Some(0), &next(&store)).status,
                    "metadata-too-large"
                );
                assert_eq!(
                    repository
                        .migrate_legacy(&temp.0.join("unread-legacy"))
                        .status,
                    "metadata-too-large"
                );
            }
            let result = repository.recover();
            assert_eq!(result.status, "metadata-too-large");
            assert_eq!(result.size_limit.unwrap().actual_bytes, bytes.len() as u64);
            assert_eq!(snapshot(&temp.0), before);
        }
    }
    #[test]
    fn write_and_rename_failures_restore_exact_old_bytes_and_defaults() {
        let store = fixture()["store"].clone();
        for phase in ["prepared", "displaced", "installed"] {
            let (_temp, repository) = seeded(&store);
            let bytes = fs::read(&repository.file).unwrap();
            let mut proposed = next(&store);
            proposed["defaultProfileId"] = Value::Null;
            proposed["selectedByEdition"] = json!({});
            let result = repository.compare_and_swap_with_checkpoint(Some(7), &proposed, |stage| {
                if stage == phase {
                    Err(std::io::Error::other("synthetic write failure"))
                } else {
                    Ok(())
                }
            });
            assert_eq!(result.status, "persistence-failed", "{phase}");
            assert_eq!(fs::read(&repository.file).unwrap(), bytes);
            assert_eq!(
                repository.read().store.unwrap()["defaultProfileId"],
                store["defaultProfileId"]
            );
        }
        let (_temp, repository) = seeded(&store);
        let bytes = fs::read(&repository.file).unwrap();
        fs::write(&repository.backup, b"unexpected file").unwrap();
        assert_eq!(
            repository.compare_and_swap(Some(7), &next(&store)).status,
            "persistence-failed"
        );
        assert_eq!(fs::read(repository.file).unwrap(), bytes);
    }
    #[test]
    fn retained_backup_restores_only_a_missing_store_and_damaged_recovery_fails_closed() {
        let store = fixture()["store"].clone();
        let (_temp, repository) = seeded(&store);
        assert_eq!(
            repository.compare_and_swap(Some(7), &next(&store)).status,
            "committed"
        );
        let bytes = fs::read(&repository.file).unwrap();
        fs::remove_file(&repository.file).unwrap();
        assert_eq!(repository.read().status, "recovery-required");
        assert_eq!(repository.recover().status, "recovered");
        assert_eq!(fs::read(&repository.file).unwrap(), bytes);
        fs::write(&repository.file, b"corrupt").unwrap();
        assert_eq!(repository.recover().status, "recovery-required");
        assert_eq!(fs::read(&repository.file).unwrap(), b"corrupt");
        fs::write(&repository.file, &bytes).unwrap();
        fs::rename(&repository.backup, &repository.transaction).unwrap();
        fs::write(repository.transaction.join("before.json"), b"damaged").unwrap();
        assert_eq!(repository.recover().status, "recovery-required");
        assert_eq!(fs::read(&repository.file).unwrap(), bytes);
    }
    #[test]
    fn actual_create_and_rename_failures_and_obstructed_rollback_remain_safe() {
        let store = fixture()["store"].clone();
        for obstruction in ["install.json", "displaced.json"] {
            let (_temp, repository) = seeded(&store);
            let bytes = fs::read(&repository.file).unwrap();
            let written =
                repository.compare_and_swap_with_checkpoint(Some(7), &next(&store), |stage| {
                    if stage == "prepared" {
                        fs::create_dir(repository.transaction.join(obstruction))?;
                    }
                    Ok(())
                });
            assert_eq!(written.status, "persistence-failed", "{obstruction}");
            assert_eq!(fs::read(&repository.file).unwrap(), bytes);
        }
        let (_temp, repository) = seeded(&store);
        let bytes = fs::read(&repository.file).unwrap();
        let written =
            repository.compare_and_swap_with_checkpoint(Some(7), &next(&store), |stage| {
                if stage == "displaced" {
                    fs::create_dir(&repository.file)?;
                }
                Ok(())
            });
        assert_eq!(written.status, "recovery-required");
        assert_eq!(repository.read().status, "recovery-required");
        fs::remove_dir(&repository.file).unwrap();
        assert_eq!(repository.recover().status, "recovered");
        assert_eq!(fs::read(&repository.file).unwrap(), bytes);
    }
    #[test]
    fn future_external_canonical_edits_are_never_overwritten_by_recovery() {
        let store = fixture()["store"].clone();
        let (_temp, repository) = seeded(&store);
        assert_eq!(
            repository.compare_and_swap(Some(7), &next(&store)).status,
            "committed"
        );
        fs::rename(&repository.backup, &repository.transaction).unwrap();
        let bytes = br#"{"schemaVersion":99}"#;
        fs::write(&repository.file, bytes).unwrap();
        assert_eq!(repository.recover().status, "recovery-required");
        assert_eq!(fs::read(&repository.file).unwrap(), bytes);
    }
    #[cfg(windows)]
    #[test]
    fn store_sharing_denial_is_an_io_error_and_never_migration() {
        use std::os::windows::fs::OpenOptionsExt;
        let (_temp, repository) = seeded(&fixture()["store"]);
        let bytes = fs::read(&repository.file).unwrap();
        let lock = fs::OpenOptions::new()
            .read(true)
            .share_mode(0)
            .open(&repository.file)
            .unwrap();
        assert_eq!(repository.read().status, "io-error");
        assert_eq!(
            repository
                .migrate_legacy(&repository.directory.join("unread-legacy"))
                .status,
            "io-error"
        );
        assert_eq!(
            repository
                .compare_and_swap(Some(7), &next(&fixture()["store"]))
                .status,
            "io-error"
        );
        drop(lock);
        assert_eq!(fs::read(repository.file).unwrap(), bytes);
    }
    #[test]
    fn subprocess_worker() {
        // Re-executed only by focused process tests. A normal test run does nothing.
        let Ok(action) = std::env::var("PROFILE_TEST_ACTION") else {
            return;
        };
        let repository = ProfileRepository::new(Path::new(
            &std::env::var_os("PROFILE_TEST_DIRECTORY").unwrap(),
        ))
        .unwrap();
        if action == "crash" {
            let store = repository.read().store.unwrap();
            let mut proposed = next(&store);
            proposed["defaultProfileId"] = Value::Null;
            proposed["selectedByEdition"] = json!({});
            let phase = std::env::var("PROFILE_TEST_PHASE").unwrap();
            repository.compare_and_swap_with_checkpoint(Some(7), &proposed, |stage| {
                if stage == phase {
                    std::process::exit(91);
                }
                Ok(())
            });
            panic!("crash checkpoint missed");
        }
        assert_eq!(action, "cas");
        let mut commits = 0;
        for _ in 0..1000 {
            let current = repository.read();
            if current.status == "busy" {
                std::thread::sleep(Duration::from_millis(3));
                continue;
            }
            assert_eq!(current.status, "ready");
            let store = current.store.unwrap();
            let revision = store["revision"].as_u64().unwrap();
            let written = repository.compare_and_swap(Some(revision), &next(&store));
            if written.status == "committed" {
                commits += 1;
                if commits == 8 {
                    break;
                }
            } else {
                assert!(
                    ["busy", "stale-revision"].contains(&written.status.as_str()),
                    "{}",
                    written.status
                );
            }
        }
        assert_eq!(commits, 8);
    }
    #[test]
    fn actual_native_process_interruptions_and_in_process_helper_recovery() {
        for phase in ["prepared", "displaced", "installed"] {
            let (_temp, repository) = seeded(&fixture()["store"]);
            let bytes = fs::read(&repository.file).unwrap();
            let output = worker("crash", &repository.directory, phase)
                .output()
                .unwrap();
            assert_eq!(
                output.status.code(),
                Some(91),
                "{}",
                String::from_utf8_lossy(&output.stderr)
            );
            assert_eq!(repository.read().status, "busy");
            assert_eq!(repository.recover().status, "busy");
            // Only this reaped child could hold the synthetic repository. Production
            // never steals locks; offline recovery requires all writers stopped.
            fs::remove_dir(&repository.lock).unwrap();
            assert_eq!(repository.read().status, "recovery-required");
            let output = node("const r=new(require(process.argv[1]).ProfileRepository)(process.argv[2]);console.log(JSON.stringify((await r.recover())))", &repository.directory).output().unwrap();
            assert!(output.status.success());
            let recovered: Value = serde_json::from_slice(&output.stdout).unwrap();
            assert_eq!(recovered["status"], "recovered");
            assert_eq!(fs::read(&repository.file).unwrap(), bytes);
        }
        let (_temp, repository) = seeded(&fixture()["store"]);
        let bytes = fs::read(&repository.file).unwrap();
        let output = worker("crash", &repository.directory, "installed")
            .output()
            .unwrap();
        assert_eq!(output.status.code(), Some(91));
        fs::remove_dir(&repository.lock).unwrap();
        assert_eq!(repository.recover().status, "recovered");
        assert_eq!(fs::read(&repository.file).unwrap(), bytes);
    }
    #[test]
    fn helper_and_in_process_concurrent_writers_have_no_lost_updates() {
        let (_temp, repository) = seeded(&empty_store());
        let script = "const r=new(require(process.argv[1]).ProfileRepository)(process.argv[2]);let commits=0;for(let i=0;i<1000&&commits<8;i++){const v=(await r.read());if(v.status==='busy'){Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,3);continue}if(v.status!=='ready')throw Error(JSON.stringify(v));const rev=v.store.revision;v.store.revision++;const w=(await r.compareAndSwap(rev,v.store));if(w.status==='committed')commits++;else if(!['busy','stale-revision'].includes(w.status))throw Error(JSON.stringify(w));}if(commits!==8)throw Error('retry budget exhausted')";
        let mut children = vec![];
        for _ in 0..2 {
            children.push(
                worker("cas", &repository.directory, "")
                    .stdout(Stdio::piped())
                    .stderr(Stdio::piped())
                    .spawn()
                    .unwrap(),
            );
        }
        for _ in 0..2 {
            children.push(
                node(script, &repository.directory)
                    .stdout(Stdio::piped())
                    .stderr(Stdio::piped())
                    .spawn()
                    .unwrap(),
            );
        }
        for child in children {
            let output = child.wait_with_output().unwrap();
            if !output.status.success() {
                // Bounded evidence if Review17 C2 naturally recurs. Preserve the
                // actual error; permission failures are never retried as busy.
                eprintln!(
                    "contention failure: directory={:?}; lock metadata={:?}; lock entries={:?}; store metadata={:?}",
                    repository.directory,
                    fs::symlink_metadata(&repository.lock),
                    fs::read_dir(&repository.lock).map(|entries| entries.take(8).map(|entry| entry.map(|e| e.file_name())).collect::<Vec<_>>()),
                    fs::symlink_metadata(&repository.file)
                );
            }
            assert!(
                output.status.success(),
                "{}\n{}",
                String::from_utf8_lossy(&output.stdout),
                String::from_utf8_lossy(&output.stderr)
            );
        }
        assert_eq!(repository.read().store.unwrap()["revision"], 32);
    }
    #[test]
    fn locks_are_cross_process_and_never_stolen() {
        let (_temp, repository) = seeded(&fixture()["store"]);
        let bytes = fs::read(&repository.file).unwrap();
        let guard = repository.acquire().unwrap();
        let output = node("const r=new(require(process.argv[1]).ProfileRepository)(process.argv[2]);console.log((await r.read()).status,(await r.recover()).status,(await r.compareAndSwap(7,require(process.argv[1]).emptyStore())).status)", &repository.directory).output().unwrap();
        assert!(output.status.success());
        assert_eq!(
            String::from_utf8_lossy(&output.stdout).trim(),
            "busy busy busy"
        );
        drop(guard);
        let output = node("const fs=require('node:fs');const r=new(require(process.argv[1]).ProfileRepository)(process.argv[2]);fs.mkdirSync(r.lock)", &repository.directory).output().unwrap();
        assert!(output.status.success());
        assert_eq!(repository.read().status, "busy");
        assert_eq!(repository.recover().status, "busy");
        assert_eq!(
            repository
                .compare_and_swap(Some(7), &next(&fixture()["store"]))
                .status,
            "busy"
        );
        assert_eq!(fs::read(&repository.file).unwrap(), bytes);
        fs::remove_dir(&repository.lock).unwrap();
    }
    #[test]
    fn unlock_failure_does_not_misreport_an_already_committed_write() {
        let (_temp, repository) = seeded(&fixture()["store"]);
        let written = repository.compare_and_swap_with_checkpoint(
            Some(7),
            &next(&fixture()["store"]),
            |phase| {
                if phase == "installed" {
                    fs::write(
                        repository.lock.join("obstruction"),
                        b"owned test obstruction",
                    )?;
                }
                Ok(())
            },
        );
        assert_eq!(written.status, "committed");
        assert!(written.diagnostics[0].starts_with("lock-release-failed"));
        assert_eq!(repository.read().status, "busy");
        fs::remove_file(repository.lock.join("obstruction")).unwrap();
        fs::remove_dir(&repository.lock).unwrap();
        assert_eq!(repository.read().store.unwrap()["revision"], 8);
    }
}

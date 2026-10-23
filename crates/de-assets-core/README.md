# DE assets core (A1 + PXL2, unexposed)

Unpublished Rust 1.88 library, with one pinned texture decoder dependency. This
crate is not in the application dependency graph. It reads metadata and checked
raw texture crops. It does not reconstruct sprites, cache images, change settings,
follow external files, select animation frames, or integrate with Classic GM1,
Node, IPC or UI. Independent review gates any integration.

The profile is Unity serialized v22, little endian, platform 19, version
`2021.3.45f2`, no embedded trees, zero audited header reserved fields. All
metadata (including scripts, externals and user information) is consumed.
Reference-type metadata is explicitly unsupported. Other classes remain opaque.
Typed Sprite/213 and Texture2D/28 reads require unstripped/script-index -1 and
hashes `7012a9da776ed53774e22013565dbbd2` /
`0d08414cfd5bdb0d22792011bda9ab26`. These hashes select a layout; they do not
authenticate bytes. See `PROVENANCE.md` and Review 14 for source evidence.

## API

- `ReadAt` supplies an opened source's `SourceStamp` and bounded possibly short
  reads. `BytesSource` is immutable owned memory; `FileSource::open_data_root`
  opens only `resources.assets` under an initially selected directory.
- `SerializedIndex::read(Arc<dyn ReadAt>, Limits, &mut Work)` validates the
  complete index, exact file length, counts, type indices, IDs and spans before
  a typed read. `ObjectKey` carries a private index identity and signed i64 ID.
- `find_name(class, exact_name, work)` returns `Zero`, `One`, or `Many`.
  `find_names` batches queries into one pass, without a persistent cache.
  Names are strict UTF-8, byte/case exact; sparse suffixes are never compacted.
  Opaque classes have no guessed name layout. `unique()` keeps not-found and
  ambiguity separate.
- `read_sprite` / `read_texture` retain every field of the tiny audited layouts.
  `F32(u32)` preserves IEEE-754 bits, including negative zero and NaN payloads;
  serialized boolean bytes, unsupported integer/packing/format codes, signed
  offsets, PPtrs, blobs and complete arrays survive. `TextureMetadata.image_data`
  contains the original bounded serialized inline bytes, not decoded pixels.
- `validate_sprite` separately checks usable finite geometry, scales, float32
  vertex streams (16-byte stream alignment), channel/index/submesh bounds,
  texture rectangle bounds and scoped references. Null, dangling, wrong-class
  and external references differ. Atlas tags/atlas, alpha and secondary textures
  remain readable but unsupported by this validator. No world-anchor claim is
  made. `packing().audited()` supports observed unpacked rotation-zero values
  with either mesh flag; packed flips/rotations/reserved bits remain explicit.
- `SpriteMetadata::validate_geometry(&mut Work)` uses the same operation
  allowance without re-reading metadata. This replaces the unexposed A1
  no-argument method. `validate_sprite(key, work)` passes its Work through;
  `read_sprite` stays available when validation exceeds the allowance.
- `TextureMetadata::mip_ranges` calculates byte spans for BC7/25, DXT1/10,
  DXT5/12, RGBA32/4 and RGB24/3 with checked rounded-up block arithmetic.
  Inline textures, six/twelve mips and the empty dynamic Font Texture are valid.
  Unknown formats retain metadata and report `UnsupportedFormat` for byte-size
  validation. The separate crop operation decodes only DXT1/10 and BC7/25.
- `StreamResolver::for_file` binds the original opened assets input.
  `validate(index, key, work)` re-reads the indexed Texture2D instead of trusting
  publicly mutable metadata. It returns an inline/stream `VerifiedRange` that
  retains its opened source, identity, private span and mip ranges.
  `read_relative` accepts only a relative offset and bounded output slice.
  `for_sources` is a no-filesystem virtual/test-input adapter; its caller must
  fulfill the `ReadAt` identity/mutation contract.
- `StreamResolver::crop_texture(index, texture_key, mip, TextureRect,
  &CropLimits, &mut Work)` rereads the owning indexed Texture2D and validates its
  complete mip layout and actual source-bound range internally. It accepts no
  metadata DTO, arbitrary range or path. Integer rectangle coordinates are in
  the **selected mip**, measured from its lower-left corner; callers choose an
  explicit rectangle for each mip. No implicit fractional Sprite rounding occurs.
  `TextureCrop::rgba()` is immutable, tightly packed straight RGBA8 with top-left
  output rows, width/height from `identity().source_rect`. No gamma conversion,
  premultiplication, polygon clipping, masks, filtering or scene inference occurs.
  `identity()` retains the scoped texture key, both source stamps, format, mip,
  mip dimensions, original lower-left rectangle and decode-policy revision.

DXT1 uses the dependency's BC1a entry (including transparent index 3 and equal
endpoints). BC7 uses its block entry after rejecting reserved first-byte-zero
prefixes as `Corrupt`. Microsoft's raw rule yields transparent zero texels;
Pillow's reserved alpha differs. This deliberate product rejection is preserved
instead of treating either oracle output as valid art. Every other format is
`UnsupportedFormat`; no fallback art or whole-image entry is exposed.

Errors distinguish unsupported layout/reference/packing/format, corruption,
limit, cancellation, not-found, ambiguity, changed source and I/O. Metadata
parsing success is independent of geometry/reference/format support.

## Limits and cancellation

`Limits::default()` names Review 14's starting caps: metadata 16 MiB, types 256,
objects 250,000, script refs 4,096, externals/reference types 64, strings 4,096
bytes, objects 1 MiB, arrays 65,536 elements, aggregate blobs 1 MiB, nesting 16,
selected objects 16 MiB and each range read 1 MiB. Name-inventory/query bytes
have a separate 32 MiB cap. Fixed layouts require depth 7 (Sprite) or 4
(Texture2D); there is no recursive attacker-defined layout.

`Work::new(units)` is a caller-owned cumulative allowance, with cumulative
selected-object accounting and an atomic cancellation handle. Reuse it across
the entire operation. One unit pays for one byte read or one geometry scalar /
loop visit or decoded 4x4 block. Geometry charges each finite scalar, shape/bone/submesh descriptor,
channel visit/comparison, stream/span visit, vertex and index visit. Each range
is charged on every traversal, including overlapping/repeated submesh spans;
empty shapes and inactive channels also cost work. Secondary-reference visits
in `validate_sprite` cost one unit each. Checked subtraction returns
`Limit("work units")` without wrapping; failed charges leave the balance intact.
Prior successful work stays consumed, including across repeated validations.

File reads, parse loops and range operations check cancellation. Geometry checks
at entry, every charge and completion; the gap between checks is constant work,
not an entire index range or vertex stream. This is an operation bound, not a
wall-clock scheduling guarantee. No separate host/renderer allowance is needed.
Raw metadata is unaffected by `Limit`/`Cancelled` from this separate usable gate.
The reader never allocates the entire serialized file or 1.4 GB stream. Index
metadata is one capped allocation; target objects are individually capped.
On an error, callers must discard partially filled output buffers.

`CropLimits::default()` caps the original texture at 8192 per axis, one output
at 16 MiB, decoded blocks at 262,144, and the temporary encoded row at 32 KiB.
Output and row sizes use checked products/address-space conversions, with
`try_reserve_exact` before zeroing. In addition to the final output, the pixel
loop retains only one encoded block row and 64 bytes of stack block scratch.
Normal A1 bounded metadata/object/mip allocations still apply; an inline payload
is already part of that bounded object. These are not total-process RSS limits.
An encoded row exceeding the index's `Limits.read_bytes` fails before pixel
allocation rather than quietly raising the I/O cap. No full-atlas fallback runs.

Each contiguous intersecting block row is read once on the retained checked
range; no source is opened/validated per block. Every block charges/checks the
same cumulative Work. Completion checks cancellation and both opened source
stamps again, including mutations during the final block. A failed crop returns
no partial pixels and leaves raw metadata available. Allocation/zeroing and one
bounded OS read are not promised real-time cancellation points.

Run crops as explicit background asset work, outside draw/input paths. Immutable
output owns its pixels and survives source/operation disposal. It can be retained
for repeated requests under the same index, source stamps, rectangle/mip and
decode revision; no persistent cache or cross-process identity is implemented.
SourceStamp is an observable-change identity, not a digest: closing the handles
does not certify future disk contents. A future persistent cache must include a
separately reviewed source hash/manifest and invalidation protocol. Cancellation
belongs to the caller's operation; discarding a result never revokes other owners.

## Resolver and mutation contract

Filesystem resolution is currently Windows/fixed-local-NTFS only. Other OSes reject
`FileSource`; in-memory/custom `ReadAt` parsing remains usable. The initial root
must be a local absolute disk path, without parent components; UNC/device and
drive-relative root syntax is rejected before opening. The root is canonicalized
and retained as an open directory handle. The only stream pathname accepted is
the exact literal `resources.assets.resS`. No separator/case normalization,
search, fallback, external resolution or network request is performed for it.

Both input files open read-only with `FILE_SHARE_READ`, denying ordinary Windows
write/delete sharing (and failing if an existing conflicting writer is open).
The final file component is opened with `OPEN_REPARSE_POINT`; reparse handles
are rejected. Final paths from the opened root/file handles must match the
selected canonical sibling exactly, both on opening and on each source stamp.
The root denies delete sharing. Ranges keep these handles open and never reopen
a caller pathname. IDs use `GetFileInformationByHandle` volume serial and 64-bit
file index, length and creation/last-write times. The canonical root's drive type
and opened volume's NTFS name are checked; other filesystems are unsupported.
This is an opened-handle/change contract, not a path+mtime cache key. No claim
is made for other filesystems' identity/share semantics.

Each checked read compares the stamp before/after, loops over short reads,
checks the original bounds, and charges bytes. Observable ID/length/revision or
handle-path changes report `ChangedSource`. No OS API promises an immutable
snapshot against pre-existing writable mappings, a kernel/administrator writer,
filesystem-specific behavior or a hostile `ReadAt` implementor; an equal-length
covert edit that preserves the reported stamp can escape detection. A custom
mutable source must supply meaningful revision/locking. No repeated per-object
full-file hashing is used. Future content-addressed caches must use a reviewed
source manifest/digest protocol; none is implemented here.

## Reproduce

From `S:\Projects\UCP\AI-Toolkit-DE`, with every Toolkit command explicitly
using that working directory:

```powershell
cargo test --manifest-path crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-core-target --offline --locked
cargo clippy --manifest-path crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-core-target --all-targets --offline --locked -- -D warnings
cargo fmt --manifest-path crates/de-assets-core/Cargo.toml --check
```

Synthetic tests need no game, Python or frontend. Windows filesystem fixtures
use unique owned directories under `DE_ASSETS_TEST_SCRATCH` (default
`S:/Projects/UCP/de-research/assets-core-a1`). The file-symlink fixture reports
missing Windows privilege explicitly; a separate directory-junction fixture
does run. Test cleanup removes only exact owned files/links, never recursively.

The optional local probe requires the already pinned UnityPy oracle and exported
layout evidence **outside Git**. It is not a shipping helper or dependency.
It streams SHA-256 once per opened art input, holds read/share locks throughout,
pins oracle files/TPK/layout hashes, compares all typed fields in layout order
(float32 bits, arrays, PPtrs, inline bytes), validates actual ranges/geometry,
and checks sparse/alternate/class-scoped names. Output contains proprietary
metadata and is restricted to explicit scratch outside this repository.

```powershell
& ([ScriptBlock]::Create((Get-Content -Raw crates/de-assets-core/probes/local_parity.ps1))) -DataRoot 'D:/SteamLibrary/steamapps/common/Stronghold Crusader Definitive Edition/Stronghold Crusader Definitive Edition_Data' -OracleDependencies S:/Projects/UCP/de-research/assets/pydeps -LayoutEvidence S:/Projects/UCP/de-research/rendering-contracts -Scratch S:/Projects/UCP/de-research/assets-core-a1/parity
```

The ScriptBlock invocation accommodates this machine's script policy without
changing it. The example executable alone is a transport, not the hash gate;
use the wrapper for a parity claim. The oracle is allowed to load the 115 MB
serialized file; the shipping core never does. No streamed atlas is decoded or
read wholesale except once by the wrapper's streaming hash. Name lookup is an
uncached scan; startup/performance/provider decisions remain later work.

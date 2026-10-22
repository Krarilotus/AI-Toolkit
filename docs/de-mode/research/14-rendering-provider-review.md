# Independent rendering/provider design review — round 1

2026-10-22. Bounded research review of reports 02/08 and the coordinator's
`03-synthesis-and-sequencing.md`. Read the preserved goal, working contract and
plan first. Assigned baseline: `818503dc40971defef3769ca883f82290405ab94`, branch
`de/separate-game-mode`; shared checkout HEAD observed during review:
`e6733cabc81731f4c8f0b71013456caa201657fd`. Other agents' changes were left alone.

**Decision: conditional GO for a new, unexposed A1 indexing/metadata core only.**
The native stationary selectors and outpost base permutations withstand this
review. Full-field serialized metadata parity is now independently reproduced
for 41 selected Sprites and all 41 Texture2Ds. This does **not** approve a pixel
dependency, provider integration, DE capability toggle, generic idle catalogue,
flat/lowered renderer, whole Stockade renderer or game-view acceptance.

Only this report was written inside Toolkit. All probe code, fetched source and
evidence are under `S:\Projects\UCP\de-research\rendering-provider-review` (**R**).
No implementation edit, dependency installation/change, child delegation, goal,
commit, push, CI, PR, release, game/DLL execution, game/profile write or classic
checkout modification occurred. Existing research sources were read without
checkout, pull or ref changes. All Toolkit commands used the explicit Toolkit
working directory. Proprietary bytes/images remain outside Git.

## Severity-ranked corrections and gates

1. **P1 — Do not promote the scratch Node indexer into a trusted reader.** Its
   actual comparison is 41 **names/path IDs**, not Sprite/Texture2D field parity;
   it stops before script/external/reference-type metadata, converts int64 IDs
   and offsets to JS Number, and lacks complete metadata/object/array/path
   budgets. It proves that a small reader is feasible. A1 must implement the
   explicit checked boundaries below and adversarial fixtures before any caller
   can supply installation paths. This is a design gate, not an allegation that
   the research probe was intended as production code.
2. **P1 — Keep structural and semantic support separate.** The first 41-sprite
   slice uses five 8192² BC7/BC1 texture records, but the file's **41 Texture2Ds
   are not 41 BC7/BC1 atlases**. Observed formats/counts: BC7/25 = 15, DXT1/10 =
   14, DXT5/12 = 3, RGBA32/4 = 8, RGB24/3 = 1. `body6Sprites_m` is DXT5;
   `UIMask` has six mips, `TrialExpiredTexture` twelve; `text`/`pointer` carry
   inline image bytes; `Font Texture` has zero width/height/image count. A1
   preserves these metadata cases without implying decode support. Later
   codecs may reject a texture for rendering without invalidating the index.
3. **P1 — “2021.3.45f2 layout” means a reviewed database-selected layout.** The
   file has no embedded type trees. UnityPy chooses a release tree by
   class/version, not by the file's type hash. Its effective Sprite tree begins
   at `2021.1a2` (next change `2023.1a14`), Texture2D at `2020.2a16` (next
   `2022.2b3`). Do not describe these as freshly dumped engine trees or as
   automatically authenticated by Unity's old type hash. The exact installed
   version/hash pair plus checked byte parity is the proposed supported profile;
   unknown hashes, trees or engine revisions need another audit.
4. **P1 — Numeric facing/base-tile contracts do not certify an editor scene.**
   Preserve native image versus Unity suffix and world-facing versus
   camera-corrected facing. Outpost 106's same 25 suffixes in four permutations
   are a base-tile contract; identical diagnostic PNGs are not four observed
   game views. Flat/lowered and Stockade compound selection remain blocked on
   their source tasks and later isolated captures.
5. **P2 — Decoder choice needs an alpha case, not only a BGRA swizzle.** At the
   candidate pin, `decode_bc1_block` hardcodes opaque mode; `decode_bc1a_block`
   enables transparent index 3. The existing UnityPy RGBA/Pillow DXT1 oracle
   returns transparent black for block `00000000ffffffff`. Treat “BC1 decoder”
   as an incomplete specification until this is measured. The block APIs also
   rely on caller slice lengths; the owning core must check them.
6. **P2 — Names are scoped to file and class.** For example Texture2D 12 and
   Sprite 69712 are both named `body16Sprites_m`; 22 cross-class name collisions
   occur in the Sprite/Texture2D inventory. Resolve the shader mask by the
   Texture2D domain, never by one global string map. Preserve sparse frame
   suffixes and distinguish missing/duplicate names from missing path IDs.

No P0 contradiction in the proposed A1-only scope was found. Items 1–3 are
required implementation constraints, not reasons to wait for game captures
before writing a read-only metadata core.

## Independently reproduced inputs and probes

Labels: **observed** = read/computed here from local bytes; **source-confirmed** =
explicit pinned source/data flow; **inferred** = reviewed derived rule/design;
**unverified** = no corresponding runtime acceptance.

Game data root: `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\Stronghold Crusader Definitive Edition_Data`.
Streaming SHA-256 checks were repeated here:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `Plugins/x86_64/CrusaderDE.dll` | 3,451,392 | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |
| `Managed/Assembly-CSharp.dll` | 3,693,056 | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `resources.assets` | 114,825,928 | `9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a` |
| `resources.assets.resS` | 1,396,428,560 | `be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e` |

Read-only source clone remains
`S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods`.
`origin/develop` = **D** `7e199e6f0818173794bdeeb0c4c32d74500b0eec`;
`origin/main` = **M** `a23aa1b32276d670ffbb2a7b641d23b500d8e298`.
D's native C was fetched with `git show`, SHA-256
`04c3f601ad9579c8137ac718e664031238e451271cf65bc8c8afa6173223ee32`.
No native addresses below are live addresses: preferred PE base is
`0x180000000`, and reads map RVAs through file-backed sections.

Reproduce from Toolkit with explicit `exec_command.workdir`:

```powershell
python -B 'S:\Projects\UCP\de-research\rendering-provider-review\review_probe.py'
python -B 'S:\Projects\UCP\de-research\rendering-provider-review\schema_probe.py'
python -B 'S:\Projects\UCP\de-research\rendering-provider-review\decoder_spec_probe.py'
python -B 'S:\Projects\UCP\de-research\rendering-provider-review\provenance_probe.py'
```

The first three are offline. The last reads primary GitHub source/API and writes
only R; its hashes/pins are recorded in `provenance.json`, not installations.
The offline probes reuse prior UnityPy 1.24.2/Pillow 13.0.0 and existing Capstone
as research oracles; they do not install or select shipping dependencies.

**Observed:** independent bounded byte parsing consumed all 3,309,703 metadata
bytes exactly, following the 48-byte v22 header; data begins at 3,309,760.
Version `2021.3.45f2`, platform 19, little-endian object data, type trees disabled,
67 types, 137,773 object records, 135,354 Sprites, 41 Texture2Ds. No duplicate
path IDs or overlapping object spans. There are 51 script references, three
external-file descriptors and zero reference types; user information is empty.
External descriptors name `globalgamemanagers.assets`,
`Library/unity default resources`, `sharedassets0.assets`. They were parsed,
**not followed**.

**Observed:** R's reader then parsed **every serialized field** of the 16 unit
Sprites (`512…519`, `640…647`), 25 outpost Sprites (`1290…1314`) and all 41
Texture2Ds, comparing dictionaries, arrays, byte blobs, PPtrs and float values
against independent UnityPy object reads. All **82** objects matched and their
object spans were consumed exactly; sizes ranged 120…4,212 bytes. All texture
stream/inline lengths matched the corresponding block/uncompressed mip-size
calculation, including the exceptions above. This establishes byte-layout
parity for these fixtures, not an independent validation of the class database's
historical origin or Unity's actual mesh rasterization.

Evidence files: `metadata-review.json`, `native-review.json`,
`source-excerpts.txt`, `schema-review.json`, `decoder-spec.json`,
`provenance.json`, `probe-output.txt`. The scratch reader is not a production
implementation and its generous fixture-driven checks are not substitutes for
the following A1 contract. No pixel extraction or new image redistribution was
needed in this review.

## Native contracts accepted, with their actual limits

**Observed/source-confirmed:** dispatch table RVA `0x321CB0`, 8-byte preferred-VA
entries, gives chimp type 78 at `0x321F20` → updater `0x1731F0`, type 79 at
`0x321F28` → `0x174100`. Separate int32 GM table `0x321F80 + type*4` gives
208/209. The caller indexes chimp type, not AIV marker or GM. Native
[dispatch C:219229–219232][dispatch] and [GM initializer C:233484–233492][gm-init]
support the connection.

Four signed-byte tables, each including its first zero terminator, reproduced
08's complete values/hashes: `0x320AB0`→48 positive values, `0x320B00`→57,
`0x320B88`→25, `0x320BC0`→50; corresponding file offsets are RVA minus `0x1A00`.
Offline machine-code reads corroborate signed byte loads and `value*8+0x1F9`
at Camel `0x173C6D`, and `value*8+0x279` at Healer `0x174ACA`.
[Camel state 1 C:210457–210483][camel] and
[Healer states 1/2 C:210937–210977][healer] provide the source arithmetic.
They are stationary-loop samples; state 0 dispatches to other states and is not
itself a universal idle-frame assignment.

For positive table value 1: Camel native images `513+d`, Healer `641+d`.
[SpriteMapping.cs:440–481][body-map] subtracts one for GM208/209, yielding
Unity suffixes **512+d / 640+d**. The [facing source C:219147–219160][facing]
subtracts camera view and adds eight if negative. For valid ordinary world
facings 0…7 and views 0/2/4/6, this is `(worldFacing-view) mod 8`; the source
does not perform a general modulo for arbitrary invalid integers. Special
turning modes choose a different facing source. Managed UI directions 1/3/5/7
subtract one before the native call ([EngineInterface.cs:6914–6919][rotation]).
Do not give these numeric artwork facings compass labels without calibration.

For world facing 0, four views select Camel `512,518,516,514` and Healer
`640,646,644,642`. [GameMap.cs:1683–1710][pivot] adds chimp-type 78/79 Y
corrections of `3/32` and `5/64` Unity units (6/5 pixels at PPU64), beyond common
cell/micro-coordinate placement. A1 should retain pivots; a later semantic
caller should own this correction and its source identity.

**Observed/source-confirmed:** mapper178 byte-table indices at
`0xC7B98+(178-0x1C)` and `0x899D4+(178-0x2C)` give switch cases 65 and 3.
[Mapper conversion C:114540–114677][mapper] maps case65 to structure106;
[size C:76489–76515][size] maps case3 to width5. Structure106 int32 rows
`0x2E7AF0+106*4` and `0x2E7CB0+106*4` give GM7/base1290.
[Initializer C:103882–103903][building-init] consumes these rows.

Reviewed [initializer C:56095–56324][order] constructs BSS permutations at
`0x8DDCC0`, size stride `0xFD8=169*0x18`, cell stride `0x18`, cell `y*n+x`,
fields `(x,y,k0,k2,k4,k6)`. There are no supposed on-disk BSS sprite tables to
read. R's independently expressed diagonal-count formula matches 08's reviewed
literal loop transcription for **all 48 permutations, sizes 2…13**, each a
bijection. For view0, enumerate decreasing `x+y`, increasing x within a diagonal.
Other views look up `(y,n-1-x)`, `(n-1-x,n-1-y)`, `(n-1-y,x)`.

For outpost106, [selector C:64644–64660][select] uses packed image
`1290+k-1`, [writer C:238042–238045][wire] adds one, and managed
[GM7 mapping SpriteMapping.cs:215–226][tile-map] uses that image directly.
Therefore all four 5×5 matrices contain exactly Unity suffixes **1290…1314**;
the corner suffixes `(top-left,top-right,bottom-left,bottom-right)` are:

| Native view | Corners |
| --- | --- |
| 0 | 1314,1304,1300,1290 |
| 2 | 1300,1314,1290,1304 |
| 4 | 1290,1300,1304,1314 |
| 6 | 1304,1290,1314,1300 |

This is world-cell assignment, not pixel rotation. The native branch does not
add four blocks of 25. All 25 metadata records exist. World-to-camera mapping
remains a separate [GameMap.cs:3773–3813][coords] operation.

**Composition limitation:** a canonical 64×32 diagnostic grid plus pivots
cannot settle cell elevation, half-pixel treatment, camera origin, occlusion,
sort depth, ownership/construction/damage overlays or animated parts. Unit
rectangles are not uniform anchors: Healer640 has fractional texture rect
`(5944.1181640625,6740,34.881675720214844,85)`, five vertices/nine indices;
Camel512 eleven vertices/27 indices. All 16 selected unit settings are 64; all
25 tile settings are 0: packing rotation is zero here, so this corpus **does not
exercise packed flips/rotations**. Keep raw geometry and settings.

Flat outpost behavior remains **unverified**. The generic flat-selection lead
uses width-indexed data ([C:64987–64991][generic-flat]), while later rendering
has category/scene-dependent substitutions ([C:38705–38816][final-flat]).
The observed structure106 flat category is1. Width5 and category1 are distinct
facts; the `32…56` versus installed `tile_flatties` maximum46 discrepancy must
be traced through the final writer. Likewise the main stockade body is not its
compound: [C:67335–67435][stockade] constructs companion structures56/57/58.

## Minimal A1 API and file ownership

**Recommendation/inferred design:** create an independent, unpublished Rust
library at `crates/de-assets-core/`, initially using only `std`, with its own
manifest and synthetic tests, compatible with the app's Rust 1.88 minimum.
Keep the initial production app dependency graph
unchanged. A module inside the Tauri application's crate can also share source,
but a separate core avoids bringing Tauri/build/frontend requirements into an
optional CLI and gives the future native/Electron consumers one metadata and
pixel implementation. Do not duplicate parsing or BC/mesh/shader logic in JS.
This is code reuse, not two copies of the decoder implementation.

Suggested owned files: `Cargo.toml`, `src/lib.rs`, `src/reader.rs`,
`src/serialized.rs`, `src/layout_2021.rs`, `src/sprite.rs`, `src/texture.rs`,
`src/streams.rs`, `tests/` with synthetic builders. Names may change; the
boundary matters. Parent serializes additions to app manifests/locks/module
declarations/shared DTOs when integration is approved. Do not edit `game/mod.rs`,
`lib.rs`, Node services, current Classic decoders, F1/F2 files or UI in A1.

Small API, with no provider, renderer or public application command:

```text
SerializedIndex::read(source: ReadAt, limits) -> index
index.objects() / find_name(class_id, exact_name) -> zero/one/many ObjectKey
index.read_sprite(ObjectKey) -> SpriteMetadata
index.read_texture(ObjectKey) -> TextureMetadata
StreamResolver::validate(TextureMetadata) -> InlineRange | VerifiedStreamRange
VerifiedStreamRange::read_relative(offset, bounded_output_slice)
```

`ObjectKey` includes serialized-file identity and signed i64 path ID; class/type
index, absolute u64 byte range and type hash belong to the index. Name lookup
returns ambiguity explicitly. A range token includes the opened source identity
and original span; never accept a fresh arbitrary pathname/range from a caller
after validation. Retain raw field integers/float32 values, unsupported format
codes and packing bits; do not silently quantize or derive a GM/chimp/marker.
Separate typed unsupported-layout/reference/packing results from corruption,
limit, not-found, ambiguity, changed-source and I/O errors.

`SpriteMetadata` retains rect, offset, pivot, border, PPU, polygon/extrude,
render key/tags/atlas pointer, all render data including texture/alpha/secondary
PPtrs, submeshes, index bytes, vertex count/channels/blob, bind poses, texture
rect/offsets, settings, UV transform/downscale, physics shapes and bones. Raw
geometry suffices in A1; no rasterizer. `TextureMetadata` retains format,
dimensions/mips/image count, complete size, inline bytes/range, stream path/
offset/size, texture settings, colour-space and other serialized flags/blob.
Preserving raw unsupported metadata must not turn into render availability.

### Enforceable bounds and profile

- **Profile:** v22, object endian0, platform19, Unity string exactly
  `2021.3.45f2`, no embedded type trees. Initial legacy size/offset fields and
  extended reserved field are zero in this fixture. Target types have
  stripped 0/script index −1, class 213/hash `7012a9da776ed53774e22013565dbbd2` and
  class 28/hash `0d08414cfd5bdb0d22792011bda9ab26`. Require the audited tuple
  before typed parsing; use opaque index entries for other classes. A hash is
  a layout selector, not authentication of attacker-supplied bytes.
- **Header/index:** exact extended file length; checked `48+metadata_size <=
  data_offset <= file_length`; every cursor/alignment remains within its own
  span. Parse metadata tail, not just object records. Proposed starting limits:
  metadata16MiB, types256, objects250,000, script refs4,096, externals64,
  reference types64, strings4,096 bytes; reject reference-type layouts not
  implemented. Counts are signed and must be nonnegative before allocation;
  also bound them by remaining bytes/minimum record size. Never narrow int64/
  u64 to usize without checked conversion. Reject duplicate path IDs, invalid
  type indices, object spans entering metadata/EOF and overlaps. These are
  explicit narrow-support limits, not claims about all Unity files.
- **Object reads:** validate the full index first, then bounded reads of target
  objects, not full-file/full-stream allocation. Proposed target-object cap1MiB,
  per-array elements65,536, per-object aggregate blob bytes1MiB, nesting16,
  aggregate selected-object budget16MiB. Actual selected objects max4,212B.
  Check multiplication/addition/alignment before allocating or seeking; consume
  each target object exactly, including alignment. A count that fits a cap can
  still exceed the remaining object bytes. Preserve f32 precision; reject
  nonfinite rect/pivot/PPU/UV values for usable geometry, and PPU<=0. Do not
  reject an empty dynamic texture merely because it cannot supply pixels.
- **References:** selected sprites have null SpriteAtlas, empty atlas tags,
  no secondary textures, null alphaTexture and local `m_FileID=0` Texture2D
  PPtrs. Validate the pointed-to object's existence/class. Preserve a null
  pointer distinctly. Parse external descriptors but do not open them in A1;
  nonlocal/atlas-dependent sprites return explicit unsupported metadata/render
  status. Never fall back to another file's numerically equal path ID.
- **Geometry/packing:** retain `settingsRaw`; decoded fields are packed bit0,
  mode bit1, rotation bits2…5, mesh bit6. Do not test only settings==64. A1
  records unfamiliar bits/modes without manufacturing an image; later rendering
  supports only audited cases. Validate selected triangle submesh index spans,
  topology, base/first vertex and channel/vertex-byte ranges using checked
  arithmetic; defer unknown vertex encodings to explicit unsupported status.
  Preserve negative atlas offsets and fractional texture rects; they are real
  here. Validate texture rectangle finite/nonnegative extents and bounded atlas
  reference without rounding first. Do not treat its fractional width as the
  final raster output width or its pivot as the entire world anchor.
- **Streams/paths:** initial resolver accepts only the literal relative sibling
  `resources.assets.resS` from the audited input set. Empty path is legal only
  for bounded inline/no-data records. Other paths are preserved metadata and
  unsupported for opening. Reject drive/UNC/device/absolute paths, `..`, ADS,
  embedded NUL and any normalized escape, including separators/case/reparse
  tricks. Resolve and open read-only against the selected canonical data root;
  check the opened handle's final identity/containment, not only lexical prefix.
  Never use generic dependency discovery, parent-directory searching or network
  fetch. Descriptors such as `Library/unity default resources` are not a reason
  to relax this rule.
- **Ranges/resources:** checked `offset <= stream_len` and `size <=
  stream_len-offset`; revalidate opened file length/identity before reads. For
  audited nonempty BC textures, compute every mip's `ceil(w/4)*ceil(h/4)*blockB`
  with overflow checks, not `w*h/2`; one BC1 block is8B, BC7 block16B. Future
  renderer gates include image count/dimension/mip stripping. A1 may calculate
  lengths for known formats while retaining others as unsupported. Cap a read
  request, e.g.1MiB, and cumulative work/cancellation; do not decode or map
  1.4GB wholesale. Hashes of opened art inputs and layout revision identify
  later cache sources. Neither matching DLLs alone nor path+mtime alone proves
  identical art; reject or retry if source changes during the operation.

These limits should be named constants/options with tests. A1 does not need
profile/cache writes, image encoding, shader application, an extraction process,
game initialization or a selected BC crate.

## Required A1 checks before independent code review

1. **Synthetic v22 builder:** header endian transition/extended u64 offsets,
   alignment, class114 script-ID presence, target hashes and metadata tail with
   script refs/externals. Zero/one/many names; IDs above2^53 and negative signed
   IDs remain exact. Synthetic fixtures contain no extracted game payload.
2. **Boundaries:** truncation at each structural boundary; negative/huge counts,
   arithmetic overflow, end-of-span alignment, bad type index/hash/version,
   duplicate IDs, overlapping/metadata-reaching spans, false file length,
   unterminated/invalid/oversized strings, trailing object bytes. Each fails
   before excessive allocation/read, without panic or writes.
3. **Metadata parity:** explicit optional local probe for all41 selected Sprite
   names/path IDs **and all serialized fields**, and all41 Texture2Ds, against
   the exact oracle/layout/art identities recorded here. Compare raw float32
   bits where practical, not formatted decimal strings. Keep fixture hashes/
   field summaries in Git only when suitable; proprietary fixture bytes stay
   outside Git. CI-independent synthetic tests run without game/Python.
4. **Important real cases:** Healer640 fractional texture rect/5 vertices,
   Camel512/11 vertices, outpost1290 quad, alternate `x` name, missing Skirmisher
   suffix2136 (not compacted), same-name Sprite/Texture2D mask, inline `text`,
   zero-data Font Texture, six/twelve mip texture and DXT5 mask. Extend the
   selected metadata probe for the named extra cases; current full Sprite
   parity covers only the 41 stated entries.
5. **References/packing:** broken/wrong-class/nonlocal PPtrs, nonnull atlas/tag
   and secondary texture metadata, truncated index/vertex arrays, malformed
   channel/submesh spans, nonfinite geometry/zeroPPU, reserved packing flags.
   Synthetic packed horizontal/vertical/180/90 fixtures check retained metadata
   and unsupported status. Actual rotated-packing pixel parity remains later.
6. **Resolver:** wrong `.resS`, short/changed source, offset/size overflow,
   absolute/drive-relative/UNC/device/traversal/ADS paths and sibling-prefix or
   reparse escapes; no fallback to other installations. Use disposable scratch
   files. Assert read-only opens/no created cache/settings files. Inject short
   reads and I/O failures through ReadAt; cancellation/budgets are deterministic.

## Schema provenance and dependency boundary

The oracle's exact class database is UnityPy's `uncompressed.tpk`, SHA-256
`3777edf16f1a57908640ef6d1e49fa51533e545424188b239c1b8e2ead3988da`,
1,326,072B, byte-identical to [UnityPy commit3135aa9's artifact][tpk-bytes].
The exported Sprite/Texture2D layouts are167/44 nodes, SHA-256 respectively
`f661930315e8fb7f46ba8d07216206b3f691b9e26a817c7607de16862964cc5f` /
`ec92966a3d251274e6e4ad89d66f0a277f7fb8d6806b0211d65f222fcf99f26e`.
These are exported metadata/schema evidence, not game-extracted pixel payloads.

Source provenance is pinned **per file**, not falsely assigned to one package
release commit. After CRLF normalization, the installed SerializedFile parser,
Tpk helper and SpriteHelper match UnityPy
`807f3888b8a2ddaa6504fca0737481baab4d6a99`; ObjectReader matches
`578a1b2f13f341db079fd969706d36d915b0dc8d`. Relevant contracts:
[SerializedFile.py:253–314][serialized], [ObjectReader.py:65–105][object-reader],
[fallback ObjectReader.py:269–290][fallback], [Tpk.py:19–76][tpk-helper] and
[version lookup Tpk.py:321–339][tpk-version].

**Observed declarations:** [UnityPy LICENSE][unity-license] is MIT; preserve its
notice for copied/adapted code. [UnityPy README:492][credits] credits AssetRipper
TypeTreeDumps/Tpk. [Tpk License.md][tpk-license] declares MIT. At inspected
TypeTreeDumps commit `20ba06e00e0625de0e49a502c6868d6cc86d0f0b`, root inventory
and [README][dumps] did not provide an explicit repository license. The precise
historical dump-to-TPK build mapping remains unverified. Do not assume Tpk's
tool license independently licenses every upstream dump or copy the entire
database into Toolkit. Prefer a tiny documented, hand-audited layout for the
supported profile; record any adapted implementation/notice provenance.
Redistribution of the database/exported upstream dataset is a separate unresolved
packaging decision, not required to begin A1 code/synthetic tests.

Candidate `texture2ddecoder` remains **unselected/uninstalled** at
`551fcbfbe86c05424ccc2ff942525c0ec7171d65`. [Manifest:1–38][decoder-cargo]
declares0.1.2, Rust2021, MIT OR Apache-2.0, ordinary dependency `paste`, default
`alloc` feature. [README:133–146][decoder-license] separately attributes BCn to
AssetStudio under MIT; [COPYRIGHT][decoder-copyright] contains additional notice
text that needs an actual shipped-source/feature audit. [BC1:1–61][bc1] and
[BC7:132ff][bc7] expose caller-bounded block functions; [colour:26–28][colour]
constructs BGRA bytes. Availability and declared license alone do not establish
correctness, package size, performance or notice completeness. No Cargo change
is part of this review.

## Smallest next pixel evaluation and remaining world tasks

After A1 metadata code review, assign a separate scratch-only **PXL1** task:
pin the candidate's complete source and transitive build inputs; compile a tiny
release block harness outside Git, without wiring the app. Compare BGRA→RGBA
output to current UnityPy/Pillow BC1/BC7 output for the actual intersecting blocks
of Healer640, Camel512, outpost1290/one tall outpost tile and the two masks.
Select deterministic opaque/transparent/partial-alpha blocks, image boundaries
and deliberately unaligned 4×4 crop boundaries. Add synthetic BC1 endpoint
order/index3 transparency and BC7 modes0…7, invalid/truncated block/slice tests.
Count exact differing RGBA bytes and max error; investigate differences instead
of hiding them behind an initial tolerance. Raw block output must be tested
before mesh rasterization, shader colour or final sprite Y-flip can obscure it.

Measure bounded crop bytes/read calls, cold/warm wall time, peak resident memory
and release executable/dependency byte delta, with and without default `alloc`
where supported. Include one full atlas as an explicit measured fallback
baseline, not default startup work: RGBA8192² is256MiB before duplicates.
Document BC1 versus BC1a choice, channel/row orientation, masks, panic-free
wrapper checks, upstream/third-party notices and reproducible build identity.
Only then recommend a selected/locked dependency. Sprite reconstruction of all
41 with mesh/pivot/dimensions/pixel parity is the following task, still distinct
from game-view acceptance. Reuse the single Rust core through native library
and a later optional CLI; do not add a second Electron decoder.

Two bounded source tasks can proceed with separate report ownership:

1. **World modes:** locate writers/input domains for world-manager fields
   `+0x204E690`, transition mode `+0x204E680`, and related
   `+0x204E68C/+0x204E694/+0x204E69C`; enumerate structure-category table
   RVA`0x2CF0F0`; symbolically trace one outpost106, wall/stair, tree, farm and pit
   through final RVA`0x41D60`/writer`0x1A2D90` for actual flag combinations.
   Resolve the flat suffix discrepancy. Do not substitute footprint width for
   category or a global flat bool for all lowering states.
2. **Stockade compound:** trace structure108 plus56/57/58 placement/orientation
   offsets at `0x2D2E90`, footprint union, tile groups/overlays and anchors in
   all four views. Separate main-body art from complete world composition.

Later isolated game captures must calibrate world-facing labels, cell/mesh
anchors, team/foliage colours, alpha/gamma/filtering, occlusion and mode changes
for a fixed scene. Profile-isolation acceptance remains the coordinator's gate.
Static source agreement, complete metadata and coherent diagnostic images do
not close those observations or Classic regression requirements.

**Precise next implementation handoff:** one Sol6.1 agent owns only the new core
crate and synthetic tests, implementing the A1 API/profile/budgets above, no
production integration/dependency/decoder/UI. Return touched files, all local
checks, optional local 82-object parity result, unsupported cases and source
notice treatment for independent review. Shared app boundaries remain serialized
with the coordinator; pixels and world-mode acceptance remain separate tasks.

[dispatch]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L219229-L219232
[gm-init]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L233484-L233492
[camel]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L210457-L210483
[healer]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L210937-L210977
[body-map]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SpriteMapping.cs#L440-L481
[facing]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L219147-L219160
[rotation]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L6914-L6919
[pivot]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L1683-L1710
[mapper]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L114540-L114677
[size]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L76489-L76515
[building-init]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L103882-L103903
[order]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L56095-L56324
[select]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L64644-L64660
[wire]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L238042-L238045
[tile-map]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SpriteMapping.cs#L215-L226
[coords]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/GameMap.cs#L3773-L3813
[generic-flat]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L64987-L64991
[final-flat]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L38705-L38816
[stockade]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L67335-L67435
[serialized]: https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/files/SerializedFile.py#L253-L314
[object-reader]: https://github.com/K0lb3/UnityPy/blob/578a1b2f13f341db079fd969706d36d915b0dc8d/UnityPy/files/ObjectReader.py#L65-L105
[fallback]: https://github.com/K0lb3/UnityPy/blob/578a1b2f13f341db079fd969706d36d915b0dc8d/UnityPy/files/ObjectReader.py#L269-L290
[tpk-helper]: https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/helpers/Tpk.py#L19-L76
[tpk-version]: https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/helpers/Tpk.py#L321-L339
[tpk-bytes]: https://github.com/K0lb3/UnityPy/blob/3135aa937e46ec8a7e2c60e84fb2fbb51a9c95c8/UnityPy/resources/uncompressed.tpk
[unity-license]: https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/LICENSE#L1-L21
[credits]: https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/README.md#L492
[tpk-license]: https://github.com/AssetRipper/Tpk/blob/94549d10ee0fbb90392e45e555861031ff560359/License.md#L1-L21
[dumps]: https://github.com/AssetRipper/TypeTreeDumps/blob/20ba06e00e0625de0e49a502c6868d6cc86d0f0b/README.md#L1-L13
[decoder-cargo]: https://github.com/K0lb3/texture2ddecoder-rs/blob/551fcbfbe86c05424ccc2ff942525c0ec7171d65/Cargo.toml#L1-L38
[decoder-license]: https://github.com/K0lb3/texture2ddecoder-rs/blob/551fcbfbe86c05424ccc2ff942525c0ec7171d65/README.md#L133-L146
[decoder-copyright]: https://github.com/K0lb3/texture2ddecoder-rs/blob/551fcbfbe86c05424ccc2ff942525c0ec7171d65/COPYRIGHT#L1-L30
[bc1]: https://github.com/K0lb3/texture2ddecoder-rs/blob/551fcbfbe86c05424ccc2ff942525c0ec7171d65/src/bcn/bc1.rs#L1-L61
[bc7]: https://github.com/K0lb3/texture2ddecoder-rs/blob/551fcbfbe86c05424ccc2ff942525c0ec7171d65/src/bcn/bc7.rs#L132-L150
[colour]: https://github.com/K0lb3/texture2ddecoder-rs/blob/551fcbfbe86c05424ccc2ff942525c0ec7171d65/src/color.rs#L26-L28

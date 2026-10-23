# SPR2: bounded source-owned Sprite plane handoff

2026-10-23. **Implemented and locally verified; ready for independent implementation
review.** Review40's P2 SPR1-R1-01 is corrected: the complete source-bound witness
returns top-left `(41,70)=[255,0,0,255]`. All57 real planes (41bases/16raw masks)
match unchanged pinned expectations exactly on current/MSRV builds. This is CPU
extraction-convention evidence, not Unity/game/scene/UI acceptance. Root owns
review, integration, staging and commits.

## Scope and evidence ownership

Read the exact goal00, contract01, plan02 and engineering05 first, then full
reports14/16/27/31/34/37/40, their primary source/oracle receipts, the actual crate,
`docs/iso-scrub-performance.md` and native-parity/cache contracts. The explicit
resume governs; the historical pause does not block this assignment. Sol6.1;
no children. Every Toolkit shell/subprocess used explicit cwd
`S:/Projects/UCP/AI-Toolkit-DE`. This is shared mode, not worktree isolation.
Start HEAD was `d2b2c2a22c6153afa52d08735158293b38919a8f`; final observed HEAD was
`a55ea99542763e9103b1db5d6b494bd6390870a6` on `de/separate-game-mode`, as coordinator
commits advanced. Accepted asset input remains commit
`61c2fa16524c7b06d1638eed9c1593afd689e469` (A1 `30215f2b567ca38b1b36d2e2907c0965a8503765`).

Owned writes are only `crates/de-assets-core/**` and this new report42. No
application/host/core/renderer/central edit, restore of teammate changes,
commit/push, CI/dispatch/PR/merge/release, app/game/Steam/DLL launch, live/original
profile/settings or Classic change occurred. Synthetic tests/helper execution
use existing toolchains and dependencies. All baseline copies, source/oracle
leads, scripts, logs, binaries, proprietary metadata and pixels remain outside
Git at **R=`S:/Projects/UCP/de-research/sprite-planes-spr2`**. Earlier SPR1 and
Review40 evidence is never overwritten.

**Fresh observed** means executed/read here. **Source-confirmed** means the pinned
explicit algorithm/resource route. **Inherited** means prior artifacts whose
bytes were checked, not a fresh oracle/render execution. **Unverified** means
acceptance remains open. Those labels are not interchangeable.

## Exact API and abstraction

```rust
StreamResolver::prepare_sprite_planes<'a>(
    &'a self, index: &'a SerializedIndex, work: &mut Work,
) -> Result<SpritePlaneProvider<'a>>

SpritePlaneProvider::reconstruct_sprite_plane(
    &self, key: ObjectKey, plane: SpritePlane,
    limits: &SpriteLimits, work: &mut Work,
) -> Result<SpritePixels>

SpritePlane::{Base, PairedRawMask}
RawMaskState::{Paired(ObjectKey), ExplicitlyUnmasked, UnknownFamily}
```

The small prepared provider is the justified variation from the proposed direct
resolver method: a direct method without preparation would rescan137773 objects
per request. Preparation owns one batch of five exact class28 names, scoped to
the opened index and immutable provider. Plane extraction never scans names.
It stores no image, scene, animation or general cache framework. No cross-owner
change is necessary for this unexposed slice.

`SpritePixels` has immutable accessors for RGBA8, width/height, identity, continuous
mapping, original Sprite metadata, original base Texture2D metadata and selected
raw-mask metadata. Identity retains signed/index-scoped Sprite/base/plane keys,
mask state, both assets/pixel SourceStamps, source crop, mip0, format, mip axes,
decode revision1 and named extraction convention
`unitypy-807f3888-pillow-293218ad-tight-local-v1`. Raw fractional rectangles,
pivots, negative offsets, packing bits, vertex/index blobs and all original
metadata stay separate from rounded output indices.

The mapping is continuous:
`canvasX=(localX-minX)*PPU`, `canvasY=H-(localY-minY)*PPU`;
local origin is `(-minX*PPU,H+minY*PPU)`. Pixel flipping is separately `H-1-y`.
It is a local mesh mapping, not a certified world anchor.

The public method internally rereads/validates the owning Sprite and textures.
No caller-mutated DTO, source pathname, byte range, unscoped ID or sample ObjectKey
has authority. `geometry.rs` is the one private float32 stream/alignment/scalar
owner shared by A1 validation and Sprite reconstruction. A private validated
Sprite result retains that helper so reconstruction does not repeat its stream
policy. All original submesh/index visits still occur. Parsing and unsupported
raw metadata remain available independently.

`texture_crop.rs` factors its existing plan and single row-batched decoder into
private `PreparedCrop`, reused by ordinary crops and Sprite planes. The checked
range stays alive through reconstruction; completion then checks assets and
chosen pixel sources again. There is no second parser/decoder/range policy or
new raster dependency. Ordinary PXL2 crops retain their bulk zero, existing
Work debit and public semantics; Sprite extraction alone opts into byte-accounted
bounded zero chunks. The original35 A1 plus16 PXL2 tests are unchanged.

## P2 correction and supported source convention

**Source-confirmed and fresh reproduced:** UV-translation triangles must scan in
their own local crop coordinates. Global-coordinate intersection arithmetic can
round a float32 half-pixel differently. `sprite_raster.rs` retains each triangle's
local exclusive width/height and local points; only coverage writes are translated
into the common canvas. The zero-UV branch continues drawing in the crop canvas.
One enclosing PXL2 crop is decoded. No per-triangle texture decode, temporary
image framework, antialiasing, affine sampler or raw-rectangle fallback exists.
Pillow's rounding, clipping, degenerate/horizontal-edge and corner rules remain.

The authored serialized witness uses positions
`[(70,111,0),(76,72,0),(13,5,0),(0,0,0),(128,0,0),(128,129,0)]`,
indices `[(0,1,2),(2,3,4),(1,4,5)]`, PPU1, UV
`((x+32)/256,(y+48)/256)`, a256x256 BC1a texture, original/render rect
`(32,48,128,129)`, one triangle submesh, base/firstVertex0 and settings64.
The actual public serialized-index/provider/crop path produces the expected red
pixel at top-left `(41,70)`. Its counting source makes exactly33 enclosing
compressed-row reads. A direct regression also preserves the lower-left
`(41,58)` distinction: local255/global0. Review40's original leads remain intact.

**Fresh observed:** R/`source_local.py` reproduces Review40's fixed512 triangles
(seed20261023, original case24 unchanged), embeds each in a complete source-bound
serialized fixture with the three canvas-defining triangles above, and invokes
the actual pinned `SpriteHelper.copy_triangle` to create expectations. Ordinary
production-dependency release consumers on Rust1.98.1 and1.88.0 each compare all
512 complete RGBA planes: **0 differing bytes, maximum error0**. Each uses one
cumulative Work and spends95805464 units, without test-only hooks. Expected
33816576-byte payload SHA-256 is
`87999fdfe76fbe8a3e2b46a536c4f5774d33c7a556749e18339f370c5a99864b`.
These are newly authored complete fixtures, not edits to Review40's oracle.

Supported scope is audited mip0, downscale1, one XY triangle submesh,
baseVertex=firstVertex0, unrotated/unpacked, and either zero-UV masking or rounded
integer UV translation. Float32 input is promoted to f64 for Python geometry
arithmetic; Python ties-to-even and C-wrapper truncation retain their separate
roles. Affine UVs, packing/rotation/reserved settings, non-XY, atlas/external/
alpha/secondary references and unreviewed layouts fail explicitly. Unsupported
pixel formats still follow PXL2. Animation/GM selectors, player colour/shader,
world-facing/anchors, flat/lowered and composition remain outside this owner.

## Pairing, bounds, Work and source lifetime

`sprite_catalogue.rs` owns only the proven resource families from immutable
managed `spriteLoader.cs` lines246-285/465-509: body15/body16 use makeMask and load
the corresponding `_m` Texture; AllTileSprites is explicitly unmasked. Exact
class28 zero/one/many resolution excludes the same-named Sprite domain. Missing
known masks and duplicate base/mask names fail as NotFound/Ambiguous. Unknown
families are not suffix-guessed or silently called unmasked. Paired requests on
the explicitly unmasked family return the distinct `UnmaskedFamily` error;
unknown pairings return `UnsupportedReference`. Selected mask dimensions must
match the base. Neither Sprite alphaTexture nor base alpha substitutes for raw
mask red/green/alpha.

`find_names` now charges/checks each visited object **before** class filtering,
and each query/result visit, with fallible match-vector growth and final
cancellation check. Preparation batches once; there is no scratch reservation
bridge, second allowance, index prepayment scan or per-frame catalogue work.

`SpriteLimits` defaults: canvas axes<=8192, output<=16MiB, combined scratch<=64MiB,
raster visits<=64Mi per plane; original CropLimits remain8192 texture axes,
16MiB output,262144 blocks and32KiB encoded row. All products, endpoints and
address-space conversions are checked. Before pixel allocation/I/O the combined
plan counts crop RGBA + coverage + returned RGBA (**9WH**), encoded row, points,
raw vertex/index/channel/submesh geometry and2KiB fixed raster allowance.
Counting the row alongside9WH is conservative: that row is freed when decode
returns, before coverage/result coexist. Other bounded parsed metadata, index,
allocator overhead and OS/runtime stack are not claimed as process RSS bounds.
A1's bounded inline payload necessarily arrives during its metadata read.

New pixel/point/match buffers reserve fallibly. Only active geometry channels
grow the small overlap scratch; inactive-channel arrays do not provoke a new
upfront scratch allocation. Sprite zeroing charges every byte in4096-byte chunks;
geometry, scanlines/edges, coverage and output-copy visits use the same private
Work::charge, including completion/last-visit cancellation. PXL2's fixed16-texel
block work stays charged per block. The per-plane raster cap supplements the
caller's cumulative Work and selected-object cap; no submesh/plane/request reset
or partial-success image is introduced. Allocation/one bounded OS read is not a
hard real-time cancellation guarantee.

The final range check occurs after reconstruction, not just after crop decode.
Tests change assets and pixel stamps at their last completion observations and
require ChangedSource. Scoped keys, both stamps, literal stream resolution,
read/share locks and ordinary fixed-local NTFS/cooperating ReadAt limitations
remain. SourceStamp is noncryptographic; writable mappings, privileged/kernel
or covert stamp-preserving mutations and dishonest ReadAt retain their declared
exclusions. No new OS containment or immutable-content promise is made.

## Fresh verification and inherited limits

All final command exits are0; exact argv/cwd/environment/exits are in R receipts.

- **Rust1.98.1 and isolated MSRV1.88.0:**64 synthetic tests each pass
  (21library/20core/9resolver/14crop), zero ignored; optimized MSRV library21/21.
  Scoped rustfmt check and all-target Clippy with `-D warnings` pass.
- The13 new Sprite tests cover both branches, fractional/raw preservation,
  continuous origins versus row indices, signed/foreign/class identities,
  base/mask name collisions and missing/many/unknown/unmasked states, dimension
  mismatch, affine/packing/base/submesh/XY/downscale/empty-geometry rejection,
  limits before pixel reads, exact cumulative allowance, partial/last-visit
  cancellation, fallible allocation and chunk-zero cancellation, final source
  changes, aligned streams, clipping/rounding/degeneracy and hidden-RGB clearing
  while preserving covered alpha. Existing A1/PXL2 negative suites are unchanged.
- A fresh ordinary release copy of Review27's unchanged authored consumer runs
  against this actual crate on both Rust versions. The977976-byte Sprite still
  accepts **622554000 legal repeated index visits** with exactly **622687086
  geometry units**, leaving zero. Small shared-cost125, all original exhaustion
  witnesses, raw preservation, checked bounds and production threaded mid-index
  cancellation pass. Work is24bytes in those non-test dependency builds.
- The57 real planes match both sets of unchanged, hash-pinned prior full-Sprite
  and source-algorithm expectations, and the owned accepted-SPR1 baseline,
  **byte-for-byte**. Current builds execute12 rounds; the fresh MSRV consumer
  executes one57-plane round. Maximum channel error and alpha differences are0.
- All209 float32 vertex/UV tuples,127 ordered triangles and41 canvas sizes match
  the separately parsed pinned metadata. This audit uses source-owned current
  SpriteMetadata with an evidence-only independent SPR1 accessor outside pixel
  timers; the actual provider's crop and continuous mapping are separately
  asserted equal. The production geometry owner is not replaced by that accessor.
- The privileged file-symlink branch again reports Windows1314 and is
  **unexercised despite green test counts**. Directory-junction rejection runs.
  No privilege, profile or OS-setting change was made.

The57 oracle expectations and their earlier parser/texture/Pillow reads are
**inherited**, freshly hash-verified and compared, not labelled a new full-atlas
oracle run. The512 synthetic source calls above are fresh. Both oracle routes
use UnityPy's extraction/Pillow family; neither is an independent Unity/GPU
rasterizer. Wheel-to-source binary reproducibility remains unverified.

R/`inherited-verified.json` verifies500 of501 historical SPR1 file receipts.
The sole exception is coordinator-maintained `docs/de-mode/02-plan.md`, which
advanced after its historical working-byte receipt. Its old/current hashes and
explicit status are recorded; its old working bytes are not claimed reproduced
from Git. No pixel/source/tool/oracle input is excepted. SPR1's exact final
receipt remains116797B/SHA-256
`d4fcd7b8d57cfe0de005a5fd6179f25d177238746cdf6c74c4280d2e6d3e3c0e`.

## Source and binary pins

Read/share-locked art handles are hashed before/after the final real workload;
lengths and hashes match. The two DLLs are freshly read/share-locked hashed only,
never executed. Data is the installed DE `_Data` directory; inputs stay read-only.

| Data-relative input | Bytes | SHA-256 |
| --- | ---: | --- |
| resources.assets |114825928|`9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a`|
| resources.assets.resS |1396428560|`be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e`|
| Managed/Assembly-CSharp.dll |3693056|`bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789`|
| Plugins/x86_64/CrusaderDE.dll |3451392|`fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`|

Primary pins remain:

- Managed source Serpens develop`7e199e6f0818173794bdeeb0c4c32d74500b0eec`,
  `spriteLoader.cs` Git blob SHA-256
  `24e57447e342a45fdf0eee0da844bc466e4132619f94508784c19e33ed3bb59a`,
  freshly read by immutable Git object. No checkout/fetch/ref change.
- UnityPy SpriteHelper/MeshHelper/Texture2DConverter at
  `807f3888b8a2ddaa6504fca0737481baab4d6a99`; ObjectReader keeps its separate
  accepted`578a1b2f13f341db079fd969706d36d915b0dc8d` pin. Exact installed raw and
  normalized hashes remain in source receipts/PROVENANCE and are rechecked.
- Pillow Draw.c/_imaging.c at`293218ad059d994baf1777d882911bed6a49704a`;
  Draw.c SHA-256`5aefa0c335e8e6c3a30c9e61a4e5aa790d72544aa9be0f41704b184e503b2e0d`.
  Executing Pillow13.0.0 extension SHA-256
  `9ca27b1a45178437d9b57e0d3024ed535226f5150ff16fd2363d90171856f0d8`.
  Python3.14.7 executable SHA-256
  `4942b86a6597e5aee0128daa00050ed79bc21f6e709a78eb19cbfeb0c2f39ac9`.
- Decoder Git`551fcbfbe86c05424ccc2ff942525c0ec7171d65`, default alloc;
  paste1.0.15 archive SHA-256
  `57c0d7b74b563b49d38dae00a0c37d4d6de9b432382b2892f0574ddcae73fd0a`.
  Cargo manifest/lock are unchanged. TPK remains1326072B/SHA-256
  `3777edf16f1a57908640ef6d1e49fa51533e545424188b239c1b8e2ead3988da`,
  outside Git; database historical licensing/mapping is not reclassified.
- Rust1.98.1 commit`48a229ceaefd4985c50990b14116b6d856af0985` and isolated1.88.0
  `6b00bc3880198600130e1cf62b8f8a93494488cc`, x86_64-pc-windows-msvc. Exact compiler
  executable hashes/version output and every fresh consumer binary are in the
  final receipt; no default-toolchain/global package install occurred.

The full1457B Pillow notice is preserved verbatim at
`notices/Pillow-LICENSE`, SHA-256
`15181e7363dca9aed78b79bebebc7fde7f1814b8bd311ea3b87ae8ccadfc185b`.
Its actual name is **MIT-CMU**. Relevant Draw.c attribution, exact source links,
scan adaptation treatment and existing UnityPy/decoder notices are preserved.
A crate-local `.gitattributes` sets this notice `-text` to protect its exact bytes.
All original60409-byte PXL1 notice-bundle members remain identical; SOURCES only
adds a separate Sprite notice receipt. No proprietary pixels/schema dataset or
oracle package enters Git.

## Finite provider workload and performance scope

**Fresh observed:** an owned immutable38-file accepted-crate snapshot plus unchanged
SPR1 geometry/raster algorithm forms the baseline. The comparison harness moves
preparation of each requested plane into the timed request in both modes. This
corrects the misleading scope of comparing a freshly validated public request
against a preplanned raster-only baseline. Names prepare once per process; both
processes use the same retained-source locks,57 keys/planes, checked crop/profile,
release settings, orientation and sequential lifetimes. Returned allocation,
metadata/geometry/plan, crop/raster and completion are timed; output files and
separate geometry audit are excluded. The baseline retains its disclosed old
scratch Work bridge/global-coordinate scan and lacks the new final pixel-range
recheck. Those differences are part of this implementation comparison, not
removed checks or an identical-instrumentation experiment.

One57-plane workload returns2065456 RGBA bytes. `io-plan.json` records34246 block
visits,1761 contiguous encoded rows and448688 encoded bytes for both modes.
These are checked-plan calculations from actual returned crop identities, whose
equality with the accepted SPR1 plan is asserted, **not an OS I/O trace**.
The unchanged single PXL2 decode loop and synthetic counting-source witnesses
corroborate batching. No full atlas or per-triangle source decode occurs.

Final-source warm observations (ten per mode, rounds1-5 of two processes):

| Metric | Owned SPR1 full request | SPR2 full public request |
| --- | ---: | ---: |
| Warm57-plane median, ms |206.089|208.073|
| Warm p95=max, ms |242.954|215.721|
| First process/OS-warm round0, ms |219.644|227.482|
| Maximum extra requested live allocation per plane, B |251846|250419|
| Whole-round logical Work units |4117903|6193639|

Observed median difference is1.984ms/about1% for this complete workload; these
small local samples do not isolate a cause or prove a speedup/portable bound.
The Work definitions differ intentionally: SPR2 additionally charges crop/encoded-
row zeroing; both account coverage/result zeroing. New inner visits also differ;
neither mode resets allowance. Requested
live allocation is not process RSS or allocator overhead. Current index/catalogue
setup was23.478/23.223ms outside request timers, and remains part of process wall
time. Hashing warms OS cache: first means process-cold/OS-warm, not disk-cold.
No cache flush or isolated integrated UI workload exists in this additive crate.

Repository search still finds no application dependency/consumer. No retained
worker scene/latest-only queue, batching, texture/geometry cache, dirty
invalidation or deferred analysis path changes. No profile probe/hash/decode or
per-frame IPC is introduced into draw/input. These finite CPU extraction costs
are **not native FPS/input latency/UI smoothness evidence**. Later integration
must cache at its owner and compare an owned equal-scene/camera/cache interactive
baseline, preserving the existing performance contracts.

## Reproduction, exact files and review handoff

Run from explicit cwd `S:/Projects/UCP/AI-Toolkit-DE`. All outputs stay in R.
Existing offline Cargo cache is`S:/Projects/UCP/de-research/pixels-pxl2/cargo-home`;
isolated MSRV home is`S:/Projects/UCP/de-research/assets-core-a1/rustup`.
The scripts bind exact argv/cwd/env/exits in checks/build/source-local/repeated/
real receipts. Only initial scratch-probe lock generation omits `--locked`.

```powershell
python -B S:/Projects/UCP/de-research/sprite-planes-spr2/run_checks.py
python -B S:/Projects/UCP/de-research/sprite-planes-spr2/prepare_evidence.py
python -B S:/Projects/UCP/de-research/sprite-planes-spr2/build_evidence.py
python -B S:/Projects/UCP/de-research/sprite-planes-spr2/source_local.py
python -B S:/Projects/UCP/de-research/sprite-planes-spr2/repeated.py
python -B S:/Projects/UCP/de-research/sprite-planes-spr2/run_evidence.py
python -B S:/Projects/UCP/de-research/sprite-planes-spr2/finalize.py
```

`bootstrap.py` is preserved as initial38-file snapshot evidence, not a command to
rerun over the changed45-file crate. Reproduction scripts overwrite only their
own R outputs. An independent reviewer should copy them into a fresh named
research directory/update its explicit R/target paths and preserve both this
baseline and Review40's leads. Initial signed-i32 div_ceil compile rejection was
corrected to authored bounded fixture arithmetic; Clippy's constant-chunk and
argument-count suggestions were corrected. Logs retain those setup/lint failures.
The first receipt audit correctly found the advanced central plan; the explicit
500/501 treatment above replaces a false blanket preservation assertion.

Final crate has45 files: **29 unchanged,9 changed,7 new**. Source parser prefix,
complete Texture parser/types suffix, serialized header/index prefix, fixed
BC1a/BC7 wrappers, original tests/wire builder and original UnityPy notice prefix
are preserved. `preservation.json` and `owned-source.diff` record the boundaries.
No manifest/lock/dependency change or cross-owner correction is required.

The complete45-file actual working-byte receipt is R/`final-source-sha256.json`,
10648B, SHA-256
`649eec311444df14e98e817ce14cdec889feff900780b35a0538a4cef0d1bc57`.
It includes all29 unchanged inputs as well as the16 touched files below; paths
are relative to`crates/de-assets-core/`.

| Touched file | Final SHA-256 |
| --- | --- |
| `.gitattributes` | `d1d27e6e456a1d53399a3ac93d3577fa63222504efc284066a1fe7295817689b` |
| `PROVENANCE.md` | `93035d18492b0ae87c2e97a9ae4814ae05b6a1ecb03b46ce60b4c9e30f27fc00` |
| `README.md` | `fd40bea3ddb60448dfc8f7048b5960933e5c26a7d033025ca63422361bc0d643` |
| `THIRD-PARTY-NOTICES.txt` | `49d59e285e38654e59ec6bc358375ee5b231127625a935ea243a0f67cd7619c8` |
| `notices/Pillow-LICENSE` | `15181e7363dca9aed78b79bebebc7fde7f1814b8bd311ea3b87ae8ccadfc185b` |
| `notices/SOURCES.json` | `538677dd1e3783ae0573891aa3a57cdccfda43087c72b9ab9f9f1e0d32c8bae3` |
| `src/geometry.rs` | `32ffa10df0314d88b2ea27d2c5d178d329a5d99d1be7d7731fe755bb29b6db41` |
| `src/lib.rs` | `145dd100ff3ae3bc774ddda1cd06b0213d6a707bc5b3bada6b40befe9491f148` |
| `src/metadata.rs` | `8fe6ab37f5868ca75d9e9c77dfc57d1577d7e5faf017508d5a8ac3f9ab12ef26` |
| `src/serialized.rs` | `b92c10a476baffa4d672a86a1f814c7cdc8500dbb3d95f2044d3c679e5ee550a` |
| `src/sprite_catalogue.rs` | `ad222fd0416fb8f7f09efc16f0daac4697a1110647b653c2004172e53549b7fc` |
| `src/sprite_pixels.rs` | `8b017278874b3de41c70c699e2a83b7c3471a0103054d08720f58214469a9b70` |
| `src/sprite_pixels_tests.rs` | `33777efdf66894b27c93d609488770b72afb96ae156bb917821ed7f10854b3c9` |
| `src/sprite_raster.rs` | `a478ed5554ce9fbe5eafa54aa9b79f4066d3f1999578b545f2786fd9fa624668` |
| `src/streams.rs` | `26cd457679196b2b77abf7e70a5391a8a549449189cd7510cb3bae89220fc16f` |
| `src/texture_crop.rs` | `c370295a31f3412e04a7989f88fbc3592c95c68e85a58dcf75408839466be165` |

Key fresh consumer binary pins:

| R-relative binary | Bytes | SHA-256 |
| --- | ---: | --- |
| target-evidence/release/spr2-baseline.exe |337920|`a9f2b2a204cef7fc5022cda68fe18672d112845e4910edfc8a5182d4ba54c5ef`|
| target-evidence/release/spr2-current.exe |398336|`6be1872a84c73f589325a5014e086bc832287a1b269f40abdf804811f7d06aa1`|
| target-evidence-msrv/release/spr2-current.exe |416768|`6c342d3adbc2f88c059eae2eb678b71f7ccbd2ee07a3349c827a65fd1abee9bb`|

R/`final-receipt.json` additionally binds all source/primary/tool/binary pins,
command receipts, baseline, raw synthetic/real output hashes and the final
report hash. The report hash is outside this file to avoid self-reference.

Independent review should prioritize P2 local arithmetic/corners, complete
source-bound public requests, shared geometry/Work accounting, combined memory
admission, name walk/pairing, final two-source completion and exact notices.
No further broad design research is requested. Root accepts/integrates/commits
only after that review. Remaining acceptance stays explicit: Unity/game raster,
sampling/shader/gamma/blend and appearance, world facing/placement/flat/lowered,
whole Stockade/composition, persistent source/cache/profile/window lifetime,
both-host transport/package integration, Classic regression, owned interactive
performance and isolated in-game observations. This implementation closes no
full DE-mode or game acceptance criterion by itself.

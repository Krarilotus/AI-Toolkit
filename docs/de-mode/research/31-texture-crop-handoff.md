# PXL2: checked texture crop handoff

2026-10-23. **Implemented and locally verified; ready for independent review.
No integration, commit or rendering-feature acceptance is claimed.** This is
one narrow operation beside A1 in the one Rust DE asset owner, using the exact
root-selected decoder. The next asset work is Sprite mesh/fractional geometry/
mask reconstruction and thin provider integration, not renderer semantic guesses.

## Ownership, inputs and preservation

Read the full goal00, contract01, plan02 and engineering05 first; then the full
reports14/16/27/29, PXL1's runnable external README, iso-scrub performance rationale
and native-parity/cache boundary. The user's explicit resume governs this task;
the historical paused flag does not revoke implementation authority. No children
were used. Every Toolkit command/subprocess used explicit cwd
`S:/Projects/UCP/AI-Toolkit-DE`; this is shared mode, not worktree isolation.

Owned writes are only `crates/de-assets-core/**` and this new report31. Root's
C1/DS1/app changes were left alone. No commits/staging/pushes, CI/dispatch/PR/
merge/release, app/game/Steam/DLL launch, live/original profile/settings or Classic
changes occurred. All builds, probes, proprietary blocks/pixels, logs and baseline
copies stay outside Git at `S:/Projects/UCP/de-research/pixels-pxl2` (**R**).
The brief's historical HEAD773f80b is distinct from the accepted A1 commit:
current observed branch is `de/separate-game-mode`, HEAD
`30215f2b567ca38b1b36d2e2907c0965a8503765`. The owned baseline matches all18
A1 files reviewed in16/27. Eleven remain byte-identical; seven existing files
change and20 files are added (38 final crate files). No unowned file was restored.

Original reports stay intact: handoff16 SHA-256
`5af335efee14419d10ecda89689fd207d41c257d7e51fdca47711899e21ad057`,
review27 `4c6d3f80c12e15998dc67da5534df037644efca7d5f7346e0b410506ce75fc6d`,
PXL1report29 `d06c589cfe407df01af5735211e613750f8f1f701023f3030ed11e93d73c4495`.
R/`baseline-sha256.json`, `baseline-crate/`, `preservation.json` and
`final-receipt.json` retain exact input/output identities.

Labels: **observed** means executed/measured locally; **source-confirmed** means
read at a pinned source; **unverified** means the corresponding runtime or
integration gate is still open. Synthetic/CPU-oracle matches are not scene,
shader, host, game or UI-performance acceptance.

## API and boundary

```rust
StreamResolver::crop_texture(
    &self, index: &SerializedIndex, texture: ObjectKey, mip: u32,
    rect: TextureRect, limits: &CropLimits, work: &mut Work,
) -> Result<TextureCrop>
```

`TextureRect { x, y, width, height: u32 }` is an integer source rectangle in the
**selected mip**, with lower-left coordinates. Mips are not implicitly mapped
from a fractional Sprite rectangle. The API rereads the owning indexed texture,
checks the complete mip layout and obtains the actual source-bound checked range.
It accepts no caller-mutated DTO dimensions/format/range and no path. Ordinary
A1 `validate` and crops reuse private metadata/range helpers; there is no second
parser, resolver policy, work budget, host decoder or generic provider framework.
The source's A1 share/containment/identity/change rules remain authoritative.

`TextureCrop::rgba()` returns immutable tightly packed **straight RGBA8 with
explicit top-left output rows**. `identity()` retains scoped ObjectKey, assets
and pixel SourceStamp, format, mip, mip dimensions, original lower-left source
rectangle and decode-policy revision1. Partial edge blocks and unaligned crops
copy only requested texels; a single output-copy row reversal handles orientation.
Packed BGRA u32 values use `to_le_bytes()` and explicit `[r,g,b,a]` copy.
No premultiplication, gamma/filtering, mask/team colour, mesh clipping, shader,
world anchor, animation or scene rule is inferred.

Only format10/DXT1 calls private fixed `[u8;8]` -> `[u32;16]` BC1a; format25
uses fixed `[u8;16]` BC7. No unchecked whole-image or raw public decode API is
exposed. Reserved BC7 first-byte-zero prefixes return `Corrupt` **before** calling
the dependency. PXL1's raw candidate result is spec-defined transparent zero;
Pillow instead produces alpha255. That discrepancy remains explicit and is
never reclassified as a valid match or used as fallback art.

Defaults are original texture axes<=8192, output<=16MiB, decoded blocks<=262,144,
encoded row<=32KiB. Checked arithmetic covers every mip/block/row/crop/output
span and address-space conversion. Invalid sizes, overflow, mip mismatch and
source truncation fail before allocating/reading pixels. Metadata still uses
A1's bounded object read; inline bytes necessarily arrive in that bounded object
before range validation. Pixel buffers use `try_reserve_exact` then resize;
allocation failure is `Limit("crop allocation")`. The decode loop holds only the
final output, one encoded row and64B stack scratch. A1's bounded metadata/mip
allocations also apply; these are not a total-process RSS promise.

Each necessary contiguous block row is read once; the stream is opened/range-
validated once per crop, never once per8/16-byte block. A row exceeding the
index read cap is refused, not allowed to bypass it. There is no full-atlas
allocation/decode or1.3GB hash in the crop path. Each decoded block consumes one
unit from the **existing cumulative Work**, alongside metadata/I/O bytes and
A1 geometry visits. Every block and operation completion checks cancellation;
no allowance is reset to pass a workload. A completion check of both sources
also refuses mutations during the final decode. Errors publish no partial image
and leave previously read raw metadata untouched. Bounded allocation/zeroing
and one bounded OS read are not hard real-time cancellation guarantees.

Output owns its pixels after the operation/source handles close. A consumer may
retain it under the same process/index/source/rect/mip/decode identity. SourceStamp
is an observable mutation identity, not a content hash; it retains A1's documented
exclusions for privileged/stamp-preserving edits, writable mappings or dishonest
custom ReadAt. No persistent cache or automatic invalidation is implemented.
Future persistent caches need a reviewed source hash manifest and lifetime policy.
Do not run extraction/decode/hash work in draw/input paths or per-frame IPC.
No optimized renderer, retained scene, worker/latest-only queue, cache/dirty
invalidation, deferred analysis or batching path was edited.

## Selected source, dependencies and actual notices

Root's selection is implemented exactly:
[texture2ddecoder-rs](https://github.com/K0lb3/texture2ddecoder-rs/tree/551fcbfbe86c05424ccc2ff942525c0ec7171d65)
Git `551fcbfbe86c05424ccc2ff942525c0ec7171d65`, version0.1.2, default `alloc`.
The standalone lock has exactly three packages: this core, that decoder and
[paste1.0.15](https://static.crates.io/crates/paste/paste-1.0.15.crate), archive
18,374B/SHA-256 `57c0d7b74b563b49d38dae00a0c37d4d6de9b432382b2892f0574ddcae73fd0a`.
Paste is build-time only. No app manifest/lock/graph changes are made. Disabling
default features is broken at this exact pin and is not selected.

The existing clean PXL1 clone/archive/private cache were inventoried and reused
first. A private Cargo cache copy under R was seeded from that local clone via
Cargo Git CLI and an environment-only URL rewrite; the lock preserves the real
canonical Git URL/revision. Initial lock generation refreshed private registry
metadata, with no new archive/global install. All final builds/checks are offline
and locked. No maintained decoder fork was introduced: PXL1 found no material
shipping-cost reason to accept that extra source ownership.

The **entire60,409B reviewed notice bundle** is copied verbatim to `notices/`:
full candidate MIT/Apache/COPYRIGHT/README codec credits, paste's two licenses,
AssetStudio's Radu/Perfare MIT notice, mikunyan/FP16 MIT, Binomial crunch public-
domain and Unity crunch zlib texts, original A1 UnityPy notice and bundle treatment.
`notices/SOURCES.json` records every byte count, hash and source pin; PROVENANCE
explains conservative inclusion of other upstream codec notices. Extra current
source snapshots do not invent historical derivation commits. Candidate's
COPYRIGHT mentions absent Rust/LLVM paths; it is preserved without asserting a
new LLVM dependency. No license for Toolkit itself is inferred. No research
oracle, game payload, specification table dataset or TPK is redistributed.

Primary specification and oracle pins remain those accepted in29 and are recorded
in `tests/vectors/README.md`, R/`input-receipts.json` and `final-receipt.json`:
MicrosoftDocs/win32 `d6ef0356f11875ce355c025170e3e218fc8a5193`, Khronos registry
`6af574a14089ccfee87efe230ebcdd8742859813`, Pillow source
`293218ad059d994baf1777d882911bed6a49704a`. Fresh Pillow extension SHA-256 is
`9ca27b1a45178437d9b57e0d3024ed535226f5150ff16fd2363d90171856f0d8`;
BcnDecode.c `cbdf2bae1d8022a75545591d099e367e92e21c253646014920fb5e68d898aa73`.
This does not claim wheel-source binary reproducibility.

## Verification

**Observed:51 synthetic tests pass on Rust1.88.0 and1.98.1:**35 retained A1
regressions plus16 new crop tests (2 private unit/14 public integration).
Optimized library tests8/8 pass on both. Scopedfmt and all-target Clippy with
`-D warnings` pass. Existing metadata parser/geometry/builder tests remain intact.
The privileged file-symlink branch again reports Windows1314 and remains
unexercised; the independent junction rejection test executes. No privilege change.

The tests cover BC1 transparent/equal endpoint/opaque palettes, all indices and
asymmetric rows/channels;311 promoted authored BC7 cases across all8 modes,
endpoint/P-bit rules, rotations/selectors/interpolation and all legal partitions;
reserved policy; partial7x5 edges, explicit3x2/1x1 mips and offsets; zero/outside/
huge crops, overflow, bad mip/layout/empty image, output/block/temp/read limits;
every shorter64B stream, complete-size/range/offset failures, short/zero reads;
pre-cancellation and deterministic cancellation after block1 and last block using
the real Work atomic; exact work exhaustion/shared allowance without reset;
source changes before/during reads and final decode, including assets changed
by the pixel read; foreign keys/wrong class/wrong resolver; forged DTO isolation
and output lifetime. Raw metadata survives decode rejection/cancellation.

Authored vectors come only from reviewed PXL1 expected-data JSON, not dependency
output or proprietary fixtures. The checked promotion tool validates those exact
JSON hashes and reproduces311 cases (newline-normalized transcript SHA-256
`565a335804146c78344d9d2e1f909f952eb39d4432195baa318598f86abfe598`).
Their generator/spec/JSON pins are explicit in the fixture README. The external
corpus consumer additionally exercises the **actual public API**, freshly comparing
16 BC1,39 authored BC7,272 partitions and16,384 deterministic valid random BC7
blocks to pinned Pillow: **zero differing bytes, max error0**. All64 reserved
blocks produce `Corrupt` with no pixels; the known raw/Pillow discrepancy is not
hidden. These are independent authored/spec and separately written Pillow CPU
oracle checks; agreement with AssetStudio-derived decoders is not relabelled as
an independent oracle.

Fresh source hashing on retained read/share-locked handles matches the accepted
art inputs exactly (hash once per evidence run, not per crop):

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| resources.assets | 114,825,928 | `9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a` |
| resources.assets.resS | 1,396,428,560 | `be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e` |

The14 exact PXL1 raw crop workloads all match fresh pinned Pillow **byte-for-byte**
(max error0) in two current and two owned-baseline processes. Independent compressed
row reads recomputed from pinned prior oracle metadata equal PXL1's saved blocks.
They cover Camel/Healer plus masks, wall7750, two outposts including64x197,
unaligned insets and all four atlas corners. These are raw integer atlas crops:
Healer's fractional mesh and Camel's neighbouring atlas pixels still require
reconstruction. No new whole-Sprite, shader or world/scene acceptance is claimed.

## Crop I/O, allocation and timing

An owned pre-edit18-file A1 snapshot plus PXL1's checked scratch crop forms the
comparison baseline. Both release probes use identical source locks,14 rectangles,
full metadata/range checks, top-left outputs, allocator/RSS meter and timer scope.
Timers include metadata/range validation, output allocation, row reads, decoding
and copying; exclude file writes. Baseline retains PXL1's compressed evidence
buffer and duplicate metadata read, lacks internal per-block Work debit and final
source completion checks, and flips its output inside the measured scope.
Those structural differences limit causal speed attribution. This compares an
algorithm baseline, not an existing integrated DE renderer or an app workload.
No validation, cancellation, limit or work reset was removed to improve results.

Across one14-crop round: **6,788 block visits,392 row reads,97,088 encoded payload
bytes and410,144 output bytes**. Successful Work cost is105,948 units =2,072
indexed metadata bytes +97,088 encoded bytes +6,788 decode visits. Independent
fresh range reads corroborate the encoded bytes; counting-ReadAt synthetic tests
witness exact offsets/read lengths/batching. No full-atlas read/hash/decode occurs
inside any crop. Maximum observed encoded row is368B; max one output73,428B.

| Case | Crop | Blocks / rows | Encoded / output B | Baseline / PXL2 warm median ms |
| --- | --- | ---: | ---: | ---: |
| sprite-28503 | 87x211 | 1242 / 54 | 19872 / 73428 | 5.5275 / 5.6680 |
| mask-28503 | 87x211 | 1242 / 54 | 9936 / 73428 | 4.9095 / 5.0085 |
| sprite-103049 | 35x85 | 198 / 22 | 3168 / 11900 | 2.2470 / 2.3225 |
| mask-103049 | 35x85 | 198 / 22 | 1584 / 11900 | 2.1780 / 2.2260 |
| outpost-1290 | 64x32 | 153 / 9 | 2448 / 8192 | 1.1665 / 1.2660 |
| outpost-1314 | 64x197 | 800 / 50 | 12800 / 50432 | 4.8755 / 5.0360 |

Final-source run:14-crop process-cold/OS-warm totals **42.770ms baseline /43.788ms
PXL2**. Repeated14-crop workload totals over10 observations (5 per process) are
**40.0245ms median /41.365ms p95=max baseline**, **41.645ms median /45.382ms
p95=max PXL2**. PXL2's observed median is1.6205ms/about4.0% higher; it adds decode
accounting/completion validation and changes allocation/copy shape. These samples
do not isolate each contribution or establish portable latency guarantees.

Maximum requested additional live allocation during one crop, including bounded
metadata, is**75,122B PXL2 /94,834B baseline**. Peak process RSS is**24,973,312B /
24,969,216B**, including index/runtime/allocator overhead. First-process total
(startup/index/specification/6crop-rounds/output writes/exit) is315.811ms PXL2 /
312.486ms baseline; repeated fresh processes290.859ms /278.165ms. These are small
local observations, not universal memory/speed or app-package-size claims.
Current/baseline probe executables are320,000B /326,144B; shells differ, so that
is **not** an isolated decoder linked-cost comparison (PXL1's12.5KiB result remains
historical consumer-specific evidence).

First/process-cold means a fresh process with a cold allocator/index, **not disk-
cold**. Source hashing warms OS cache. No global cache flush was attempted;
actual cold-disk behavior remains unverified. Crop measurements cannot establish
app FPS, input latency, retained renderer/cache behavior or game acceptance.
Interactive workloads did not change: no app path consumes this unexposed crate.
A later runtime integration must run the owned before/after interactive workload
and preserve retained scenes/latest-only queues/batching/cache invalidation.

## Reproduction and review receipts

R/`README.md` is the executable evidence handoff. Exact argv/cwd/environment/exits
are in `checks.json`, `probe-build-checks.json` and `evidence-results.json`.
`run_checks.py` uses separate external current/MSRV/probe targets, existing isolated
Rust1.88, private Cargo cache, `--offline --locked`, scopedfmt/Clippy and normal/build
tree. An initial scratch-only Range<u64>::len compile failure and lint/test setup
corrections are retained in original logs/`checks-initial/`; final gates all pass.
An initial vector-byte check exposed Windows newline policy; its checker now
normalizes transcript newlines while retaining exact authored JSON hash gates.
Earlier measurements are archived in `evidence-initial/`, not silently replaced.

```powershell
# Explicit cwd: S:/Projects/UCP/AI-Toolkit-DE
python -B S:/Projects/UCP/de-research/pixels-pxl2/run_checks.py
python -B S:/Projects/UCP/de-research/pixels-pxl2/run_evidence.py
python -B S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/probes/promote_authored_vectors.py --evidence-root S:/Projects/UCP/de-research/pixels-pxl1
python -B S:/Projects/UCP/de-research/pixels-pxl2/finalize_evidence.py
```

Direct crate checks are equivalently:

```powershell
$env:CARGO_HOME='S:/Projects/UCP/de-research/pixels-pxl2/cargo-home'
$env:CARGO_NET_OFFLINE='true'
$env:DE_ASSETS_TEST_SCRATCH='S:/Projects/UCP/de-research/pixels-pxl2'
cargo test --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/pixels-pxl2/target-current --offline --locked -- --nocapture
cargo clippy --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/pixels-pxl2/target-current --all-targets --offline --locked -- -D warnings
cargo fmt --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --check
# Separate MSRV invocation, not a default-toolchain change:
$env:RUSTUP_HOME='S:/Projects/UCP/de-research/assets-core-a1/rustup'
cargo +1.88.0 test --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/pixels-pxl2/target-msrv --offline --locked -- --nocapture
```

Selected external artifacts (all SHA-256):

| R-relative path | Bytes | SHA-256 |
| --- | ---: | --- |
| `current.exe` | 320,000 | `3ae9968a21d299ddf71b04a392ee788d1df9023602b0ce74a4ed221b76d77382` |
| `baseline.exe` | 326,144 | `998101effa858cbc4e604ae929fc1f7eef46a900fe707143befbad5465cd1090` |
| `target-current-probe/release/corpus.exe` | 239,104 | `512cb2a4fe2625773c7262b048ce7a81e33dfca1108e16dc98c123b5c73fc85f` |
| `checks.json` | 7,469 | `171b599a53bb544fa82c59087a911bbe1ddc825411e82de1f24182c461a8fc38` |
| `probe-build-checks.json` | 2,038 | `e37d7664e0d2256ee85e04f512ddddb62a86dc7723b3ec4be18cad07e760778b` |
| `evidence-results.json` | 22,216 | `3561b86b554fd8e2a31abc74170e8b2e3bdaba94d33f3da2ff5b552d4120c6eb` |
| `final-core-sha256.json` | 9,017 | `07c47766a7ff84f0d766a995a56a07a37d8a6c6da399bafaa501a25d657c0183` |
| `preservation.json` | 1,308 | `f60892323496b3de4dbf49359e155c4dc1d0f28f7fdd32569fa2d0349e9140be` |

The external final receipt additionally records every source/dependency file,
compiler/build-tool binary, all raw-output hashes and this report's final hash.
That receipt's own hash is deliberately outside the report; the report hash is
outside this report to avoid self-reference. No proprietary output is required
for synthetic tests.

Final exact crate files (paths relative to `crates/de-assets-core/`):

| File | SHA-256 |
| --- | --- |
| `Cargo.lock` | `f727acd05fc03192d7d1fcfd27fe5a7cd605a91b37ca06fe577574e9ffa8c97f` |
| `Cargo.toml` | `3014592b5f0bb335936843a11a130df1e369b753f8e9aa1a28f11eb9c9b9a71b` |
| `examples/local_probe.rs` | `616e0b9537573c7fc06ec5a76cc0b58c7f4f9934637547d07102d888d5659517` |
| `notices/A1-THIRD-PARTY-NOTICES.txt` | `22d10f6ab80bf7bc78efd51a2744a6e9bcbe9870a65c126dd9da35581550c220` |
| `notices/assetstudio-LICENSE` | `f0822cd8a4200ba360f8e623e1fb5ad3496ca579f44d94665ac2d3cf344e6b76` |
| `notices/crunch-license.txt` | `f46d74fe8d0c981a76a6eb837e52569adf8598faa9b8e761a763c642a43be66a` |
| `notices/FP16-LICENSE` | `17e4f539024be2749ee729d1e2f01d24cef12ece8c9bf18e91a4349be29c80bf` |
| `notices/mikunyan-LICENSE.txt` | `9d4cfee9f1331c8413631b84b46248c4770daf4cb137f3b4df330087ebf3e3a3` |
| `notices/paste-LICENSE-APACHE` | `62c7a1e35f56406896d7aa7ca52d0cc0d272ac022b5d2796e7d6905db8a3636a` |
| `notices/paste-LICENSE-MIT` | `23f18e03dc49df91622fe2a76176497404e46ced8a715d9d2b67a7446571cca3` |
| `notices/README.txt` | `fece0dfd9c3982273d877a55e9c3e673031ae5660ef5a2c272d11c47226c4990` |
| `notices/SOURCES.json` | `5952664946324dc6db74d75ac046463be629f8be49d22adc7ca0ee8f54f9c46f` |
| `notices/texture2ddecoder-COPYRIGHT` | `4a554dab7409db75d053ed551c3c6b3eb79e58e7f7c7376ae57dc4576f9541e5` |
| `notices/texture2ddecoder-LICENSE-APACHE` | `7cde763ba32b3ec2a84eddd8beb0dcb895fd6436aeb18491ab9572a7eb8de996` |
| `notices/texture2ddecoder-LICENSE-MIT` | `cdbd06e25b8c9c5d6019949d2de8123f56d29cee4166396423d2ba8c81700845` |
| `notices/texture2ddecoder-README.md` | `c1065ba5128b95c0faf261113a0bd333e7e73db8d1fb1ff8e989cb7d58733986` |
| `notices/unity-crunch-license.txt` | `bbc49afbe103d3e4f792ce6609cfa18016073ade1416f87617661452d7c8b470` |
| `probes/local_oracle.py` | `44814f8a3957338ef921fdb076635f5f461f5819c2efd2dfec6d463681c81561` |
| `probes/local_parity.ps1` | `2e5569f2d4bd149f0a9eee87b011bd04ef522755c249ea30c0873947c8ea8b47` |
| `probes/promote_authored_vectors.py` | `20fd6afc13f6c6f8f72369b3bcad3bd21a60faef2521f973c6a7b62a81945154` |
| `PROVENANCE.md` | `23a5cbe6605bf211a3ae50c125e8de0bc4e7b253898df8e8f0cb50c20088b867` |
| `README.md` | `df7f657279e10cacf033ba0f693c60bc4e3e314304cb384aeaf0470414ed15a3` |
| `src/cursor.rs` | `d1d8cf8a4ec0395ffed8e75aae26c249c489f9302e81f18652bcb1a24d9a8527` |
| `src/geometry_tests.rs` | `5b7b2cd6a8a941bd13a39d65cce4c37dac1bd0358bdcc30e05a1ac5bcb00f3fb` |
| `src/lib.rs` | `d71b92e3ec55a41724ae7d58e758d3d8d7769ea14bcd228cf20d31f7661d8c91` |
| `src/metadata.rs` | `aad585c8f985bf2ec189ff741c742e4815bef3e29e5583c0bc2b54777ef3953d` |
| `src/reader.rs` | `ac95e532269d613918bf173b5ac42c37668e4b1008b2c96c420cdd54e91c5601` |
| `src/serialized.rs` | `4fc14005a75f35f026f9acf0869f10b16389f10547dcbebab10bf9fefbf6a8c2` |
| `src/streams.rs` | `d19e748ae71afa6c79315664d11530f4a8b6ce410aae45aa611a79e283f2fd2a` |
| `src/texture_crop.rs` | `e56840c1501b9455a7829969ef32410d9929e2d6b8db94a084e11f16f550e17f` |
| `src/texture_crop_tests.rs` | `a22be3f6769ea74d6ec8b431b240093b69478711afe94b2c1bc8f51d0a4511f5` |
| `tests/common/mod.rs` | `75afab63045cdeef168756fc9c6b36ca71a5a5a03157d24fbc6a25bf48d58fb4` |
| `tests/core.rs` | `61e1003e399d40234982db0a282356a7cf25064ecf7ca187b9b34981bd26bbc8` |
| `tests/resolver.rs` | `c4b4fafe2b5fd191e26a2c01159f2c056811ee244c36b1450048c26f99f3dc5d` |
| `tests/texture_crop.rs` | `113336d6df98a0563085f4b5647665273040e3e40f1f12d92df9623b75b4567d` |
| `tests/vectors/bc7-authored.txt` | `f0206f083e1849d221ed99a7856736f875be9a53dff1b82f7fd389f2fadb7b16` |
| `tests/vectors/README.md` | `3b107c8524c2cffb06f777ccaebb6131db4f6d03e3e938c2d5f81dfc2c156a77` |
| `THIRD-PARTY-NOTICES.txt` | `4edd78fd3016e738bffd4a0c78ab8eff95ee05239d2cc3ff270625f49cb28791` |

## Open gates and next owner

Independent review must close correctness, source/work/lifetime limits, notices
and the exact snapshot before root accepts any commit/integration. Root owns
acceptance/staging/commits and app dependency/transport integration. No cross-owner
edit was necessary here. A1's non-cryptographic mutation and unexercised privileged
symlink limits remain explicit. Formats3/4/12/unknown, non-2D/multi-image/stripped
layouts, empty images, unsupported source paths/references and all invalid/capped
requests remain explicit errors; metadata support is not decode support.

Next: reconstruct the audited unpacked Sprite meshes/fractional geometry and pair
raw masks, compare41 selected Sprites to the pinned oracle, then integrate a thin
provider through the one Rust owner. Packed/rotated cases, mask/shader/colour
policy, scene anchors/facing, flat/lowered substitutions, complete Stockade,
cache/profile/window lifetime, both hosts, app packaging, Classic regression and
isolated game acceptance are still separate gates. This API supplies bounded
raw pixels; it does not guess those semantics or authorize a fallback image.

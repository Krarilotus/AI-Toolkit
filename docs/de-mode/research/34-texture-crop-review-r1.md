# Independent PXL2 texture-crop review, round 1

2026-10-23. **GO for the exact additive, unexposed PXL2 crop commit. No
actionable P0/P1/P2 finding remains in this review.** This covers the standalone
asset crate and handoff31 only. Root retains acceptance, staging, integration
and commits. It approves no Sprite reconstruction, host/UI integration, cache,
package, scene or game feature.

## Scope and reviewed identity

Read the original goal00, contract01, plan02 and engineering05 first, followed
by the full reports14/16/24/27/29/31, their relevant source/evidence receipts,
`docs/iso-scrub-performance.md`, `docs/native-parity.md`, crate provenance,
notices, implementation, tests and external reproduction scripts. The explicit
resume governs this assignment; the historical paused flag is not a restriction
on the authorized review. Review is by Sol6.1, with no children.

Every Toolkit `exec_command.workdir` and reviewer subprocess cwd was explicitly
`S:/Projects/UCP/AI-Toolkit-DE`. This is shared mode, not worktree isolation.
Branch is `de/separate-game-mode`. Start HEAD was
`30215f2b567ca38b1b36d2e2907c0965a8503765`, rather than the brief's historical
`773f80b8a31d9337cd83342957bd8b76d969515c`. At the end snapshot, HEAD was
`ebff3b1e2c5bce415277394e3322099a20919f19` as other work progressed. All38
reviewed crate files, handoff31, earlier reports and nine selected implementation
artifacts retained their exact start hashes. Other owners' changes were left
alone; this is not acceptance of their concurrent work.

Only this report was written inside Toolkit. All reviewer source, immutable
snapshot copies, synthetic fixtures, builds, logs and proprietary outputs are at
`S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1` (**R**). Existing
toolchains, oracle packages and source caches were reused; the Cargo cache was
copied to R before building. No implementation/source-test fix, dependency or
toolchain installation, shared-file restoration, staging, commit/push,
CI/dispatch/PR/merge/release, app/game/Steam/DLL launch, live/original
profile/settings, OS privilege or Classic change occurred.

Labels below distinguish **fresh observed** executions, **source-confirmed**
inspection, **inherited** evidence whose bytes were verified, and **unverified**
acceptance gates. A passing synthetic test or CPU oracle is not UI/game evidence.

## Correctness, ownership and preservation judgment

The boundary follows the selected PXL1 contract. One Rust asset owner exports
`StreamResolver::crop_texture(index, ObjectKey, mip, TextureRect, CropLimits,
Work)` at `src/texture_crop.rs:161`. Public output owns immutable straight RGBA8
bytes and explicitly top-left rows; identity retains the index-scoped signed
texture key, both SourceStamps, selected mip dimensions, original lower-left
integer rectangle, format and decode revision. The API accepts no caller-supplied
path, byte range or mutable metadata DTO as authority. Wrong class, foreign key,
wrong resolver/source, absent or invalid mip, unsupported layout/format, limits,
source change and cancellation remain explicit errors.

`streams.rs:102-128` extracts the existing metadata-owner/range logic for both
ordinary A1 validation and crops. The full indexed Texture2D is reread, and the
complete mip layout and source-bound span are checked. There is one resolver
policy and one mip calculation, with no host parser/decoder or generic provider
framework. The repeated call to the same mip calculator is bounded to32 levels;
it is not an independently maintained policy. The narrow private extraction is
an appropriate DRY change. No optional naming/style preference blocks this work.

The checked plan at `texture_crop.rs:83-137` bounds rectangle arithmetic, rounded
block counts, selected-mip offsets, last touched row, output bytes, temporary
row bytes and address-space conversion. Original dimensions default to8192 per
axis, output16MiB, decoded blocks262,144 and encoded row32KiB. The index read cap
is preserved. Unsupported metadata/layout, known payload truncation/range errors
and capped requests are rejected before pixel allocation/I/O. Inline bytes still
arrive through the bounded A1 metadata read. Reserved encoded prefixes can only
be classified after reading the touched block; failure returns no partial image.
Output and row buffers use fallible reservation before bounded zeroing.

Only private fixed `[u8;8]`/`[u8;16]` to `[u32;16]` calls reach the dependency.
Unity format10 uses BC1a, format25 BC7. First-byte-zero BC7 is explicitly refused
before dependency decoding. Packed words are converted with `to_le_bytes()` and
explicit BGRA-to-RGBA assignment. Partial blocks copy only requested texels, and
one output-row reversal preserves the lower-left source / top-left output
contract, including odd mip extents. There is no whole-image decode API, silent
codec fallback, premultiplication, gamma, mesh, mask, team-colour or scene policy.

Each necessary contiguous encoded row is read once, not once per block. Every
block consumes the caller's existing cumulative Work and checks its actual
cancellation atomic. No allowance is reset for mips, rows, objects or later
requests. Final cancellation, pixel-source and assets-source checks precede
success. Bounded allocation/zeroing and one bounded OS read are not hard real-time
cancellation guarantees. Source-bound range ownership, ordinary Windows NTFS
share/final-path/identity/range checks and A1's error classifications survive.

The original18-file A1 baseline was independently compared byte-for-byte with
Git commit30215f2. Eleven files remain identical, including `metadata.rs`,
`serialized.rs`, `reader.rs`, the corrected geometry tests, all35 original
regressions, fixture builder and original parity transports. Seven existing
files changed;20 were added. Review24's geometry-work P2 remains closed by
Review27 and was not reintroduced. Readable metadata remains separate from usable
geometry/ranges and supported pixel formats.

## Fresh independent probes and focused checks

All final commands below pass. Exact argv, cwd, environment, exit status and logs
are saved in R, not inferred from green summaries.

- **Rust1.88.0 and1.98.1:** actual crate debug suites each pass51 tests:
  8 library,20 core,9 resolver,14 public crop. This reexecutes the original35
  A1 regressions and all16 new tests. Rust1.88 optimized library regressions
  pass8/8. Current all-target Clippy with `-D warnings`, scoped rustfmt and
  locked/offline normal/build/feature tree checks pass. The tree contains only
  this core, default/alloc `texture2ddecoder` and build-time proc-macro `paste`.
- **Ordinary production consumer on1.88, debug and release:** six independently
  authored probes pass without `cfg(test)` in the dependency. They import only
  the unchanged synthetic wire builder; expectations do not call the decoder.
  The signed key `-9007199254740997` remains exact.
- **14,480 BC1 crop/mip cases:** dimensions1..17 by1..11, complete mip chains,
  every texel, full and inset crops, varied RGB565 endpoints, transparency,
  indices, asymmetric channels/rows and nonzero stream prefix. Independent
  scalar palette/texel lookup matches every output. Exact observed read offsets
  and lengths match independently calculated contiguous block rows. A single
  cumulative Work spends2,285,798 units across this workload.
- **1,002 BC7 mixed-block/mip cases:** independently stitch the pinned authored
  expected RGBA blocks into odd13x10 textures and mip chains, then compare
  partial-edge/unaligned multi-block suffix crops. All bytes match. The supplied
  suite separately reexecutes all311 authored vectors across all8 modes,
  rotations, selectors, gradients/P bits and legal partitions.
- **Adversarial budget/corruption witness:** an8x4 source contains one valid and
  one reserved BC7 block. Cropping only the valid block reads exactly16B and
  succeeds. The full crop with metadata+32B+1 decode unit returns `Limit` before
  block2; adding exactly one unit reaches `Corrupt("reserved BC7 prefix")`.
  Both leave zero allowance. This corroborates per-block accounting and refusal
  without a production test hook or decoding unrequested atlas regions.
- **Bounds and recovery:** output195B,3 blocks or15B temporary allowance each
  refuse a7x7 BC1 crop with zero pixel reads. Exact196B/4 blocks/16B succeeds on
  the same sources. Supplied tests also reexecute all shorter64B stream cases,
  huge/overflow/outside rectangles, metadata/layout/mip/class/source failures,
  custom read caps, short/zero reads, forged DTOs and output lifetime.
- **Deterministic cancellation after prior work:** the real atomic is set by
  row2's read, after two blocks in row1 have decoded. The operation returns
  `Cancelled` before a reserved block in row2, spending exactly metadata+64B+2
  units. Previously read raw metadata compares equal afterward. Independent
  short-read cases changing revision on read2 all return `ChangedSource`.
- **Production-build threaded cancellation:** after the first row read, a
  separate thread requests the real atomic. Observed progress before refusal
  is1,152 decoded blocks/3 row reads in debug and13,260 blocks/26 rows in release,
  below262,144 complete blocks. The5ms sleep only schedules the request; it is
  not a latency assertion. Supplied private unit tests separately verify exact
  cancellation after block1 and after the final block using the same atomic.

Fresh local full-field parity reuses hash-gated, scratch-only copies of the
original transport/oracle with the selection narrowed to Camel512/Sprite28503,
fractional Healer640/103049 and outpost1290/45812 plus their three Texture2Ds.
Every field, float32 bit pattern, blob, PPtr and array matches fresh pinned
UnityPy **and Review24's independently reviewed canonical hashes**. Usable
geometry/ranges also pass; index totals remain137,773 objects/51 scripts/3
externals. The0.219s pass is a diagnostic, not startup/performance acceptance.
Full86-object/full-name parity remains inherited evidence, not a fresh rerun.

The reviewer rebuilt a scratch real-crop consumer against the actual crate.
**All14 real raw integer crops match fresh pinned Pillow exactly: zero differing
bytes/max error0**, and also match the verified owned-baseline output. Independent
row addresses from pinned prior oracle metadata reproduce PXL1's saved compressed
blocks. This covers units/masks, wall7750, both outposts including64x197, insets
and four atlas corners. All14 requested Texture2D DTOs (five distinct textures:
12/23/31/42/50) compare equal before/after the six crop rounds. Metadata reads
added for that preservation witness sit outside the crop timers; this supplemental
consumer is not presented as a replacement performance comparison.

Both game inputs were hashed on retained read/share-locked handles before and
after those runs, with identical lengths/hashes:

```text
resources.assets       114825928  9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a
resources.assets.resS  1396428560  be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e
```

PXL1's16,384 valid random BC7 blocks and PXL2's full public-API corpus rerun are
**inherited**, not gratuitously rerun here. Their source, binary, corpus, result
and output receipts were verified. Reserved-mode raw candidate zero versus
Pillow opaque-alpha discrepancy remains explicit; product `Corrupt` policy is
not counted as a valid oracle match. Neither old metadata nor these raw crops
prove Sprite mesh clipping/fractional sampling: Camel's neighbouring atlas pixels
and Healer's fractional rect remain later reconstruction work.

## Dependency, notice and performance audit

The exact selected dependency is
[texture2ddecoder-rs551fcbf](https://github.com/K0lb3/texture2ddecoder-rs/tree/551fcbfbe86c05424ccc2ff942525c0ec7171d65),
version0.1.2 with default `alloc`. Cargo metadata confirms the actual compiled
Git source, and all113 tracked checkout files match the Git objects after line
ending normalization. The source clone is clean, and candidate Rust source has
zero `unsafe` occurrences. All47 actual paste checkout members match the exact
1.0.15 archive, SHA-256
`57c0d7b74b563b49d38dae00a0c37d4d6de9b432382b2892f0574ddcae73fd0a`.
There is no maintained decoder fork, Python shipping dependency or assertion
that this pin supports `default-features=false`. The observed MSRV evidence is
compilation/tests on1.88, not an invented upstream minimum.

All13 reviewed notice files match PXL1 verbatim, totaling60,409B; the new
SOURCES manifest additionally records their pins. Candidate MIT/Apache,
COPYRIGHT/README credits, paste, AssetStudio/Radu/Perfare, mikunyan/FP16,
Binomial crunch, Unity crunch and prior UnityPy notice are retained. Absent
Rust/LLVM paths mentioned by upstream are not asserted as new dependencies.
No Toolkit license, historical derivation commit or TPK/dataset permission is
invented. The current crate adds authored vectors only, without proprietary
pixels/blocks, a specification-table dataset or research oracle package.

`verify_evidence.py` verifies546 recorded file receipts over476 unique paths,
including source/dependency/tool/artifact/output receipts, with zero failures.
Seven historical A1 live-path receipts are explicitly checked against the
byte-identical accepted baseline rather than falsely against the new PXL2 bytes.
The311-vector promotion check reproduces normalized transcript hash
`565a335804146c78344d9d2e1f909f952eb39d4432195baa318598f86abfe598`.
Primary pins survive: MicrosoftDocs/win32
`d6ef0356f11875ce355c025170e3e218fc8a5193`, Khronos registry
`6af574a14089ccfee87efe230ebcdd8742859813`, Pillow source
`293218ad059d994baf1777d882911bed6a49704a`; Pillow extension
`9ca27b1a45178437d9b57e0d3024ed535226f5150ff16fd2363d90171856f0d8`
and BcnDecode.c
`cbdf2bae1d8022a75545591d099e367e92e21c253646014920fb5e68d898aa73`.
The extension pin is not wheel-source binary reproducibility.

**Inherited measurements independently recomputed from raw TSV:**14 crops visit
6,788 blocks in392 row reads,97,088 encoded bytes and410,144 output bytes.
PXL2 spends105,948 Work units, including2,072 metadata bytes. Ten warm workload
observations give median41.645ms versus40.0245ms baseline; p95=max45.382ms versus
41.365ms. The reported1.6205ms/about4.0% median overhead is accurate. Peak requested
additional crop allocation is75,122B versus94,834B; peak process RSS24,973,312B
versus24,969,216B. Requested allocation and process RSS are different metrics.

The comparison has equal source locks, rectangles, selected metadata/range
validation, output orientation, release settings and timer boundary. It uses an
owned accepted-A1/PXL1 algorithm baseline, which rereads metadata twice, retains
encoded evidence bytes and lacks PXL2's private decode debit/final completion
checks. These disclosed structural differences prevent attributing the timing
delta to one check or calling it pure wrapper overhead. Source hashing warms OS
cache; these are process-cold/OS-warm samples, not cold-disk observations.
PXL1's12.5KiB linked-cost comparison remains historical consumer-specific evidence.

Repository search finds no product consumer of this crate or crop API. PXL2
changes no host/helper/JS/renderer draw/input path, retained worker scene,
latest-only queue, batching, cache/dirty invalidation or deferred analysis.
There is no integrated interactive workload to compare in this additive slice.
The small crop timing difference is not a UI regression finding and supplies no
FPS/input-latency/UI acceptance. When root integrates a runtime consumer, it must
preserve those optimizations, keep source probing/hashing/decoding and per-frame
IPC out of draw/input, and run owned before/after interactive workloads with equal
scene/camera/cache conditions. No arbitrary FPS threshold was invented here.

## Reproduction and exact snapshot

Run with explicit cwd `S:/Projects/UCP/AI-Toolkit-DE`. All Cargo checks use
R's private cache, external targets and `--offline --locked`; only initial
scratch-consumer lock generation uses `--offline` without `--locked`.

```powershell
python -B S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/verify_snapshot.py start
python -B S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/run_checks.py
python -B S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/run_consumer.py
python -B S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/prepare_parity.py
python -B S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/run_real_review.py
python -B S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/verify_evidence.py
python -B S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/probes/promote_authored_vectors.py --evidence-root S:/Projects/UCP/de-research/pixels-pxl1
$env:CARGO_HOME='S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/cargo-home'
$env:CARGO_NET_OFFLINE='true'
cargo metadata --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --format-version 1 --offline --locked | Set-Content -LiteralPath S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/cargo-metadata.json -Encoding UTF8
python -B S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/audit_methodology.py
python -B S:/Projects/UCP/de-research/review-texture-crop-pxl2-r1/verify_snapshot.py end
```

Snapshot/setup scripts deliberately refuse existing copy/output directories;
for a new evidence run select fresh owned paths. The already prepared focused
parity wrapper can instead be rerun directly as recorded in `parity-checks.json`.
One reviewer setup attempt hit a UTF-8-BOM/default-Windows-codepage error while
copying the old parity driver. Reading that scratch driver as UTF-8-sig fixed
the setup; no product change followed. A read-only inspection also requested a
nonexistent baseline `src/crop.rs`; the actual functions are in `src/main.rs` and
were inspected there. Neither is a failing product check or hidden test failure.

R/`checks.json`, `consumer-checks.json`, `parity-checks.json`, `real-checks.json`,
`evidence-verification.json` and `methodology-audit.json` bind commands and results.
R/`hash-start.json` and `hash-end.json` bind all38 actual crate files,18 baseline
files, six reports and selected artifacts. All38 equal handoff31's complete file
table and `pixels-pxl2/final-core-sha256.json`, whose SHA-256 is
`07c47766a7ff84f0d766a995a56a07a37d8a6c6da399bafaa501a25d657c0183`.
The reviewed handoff31 itself is24,743B, SHA-256
`2c7803809329d1b3b61c4d948c7a8d2c729acf405b15e15bf7b3f01a6ee69a80`.

Critical production/source hashes, relative to `crates/de-assets-core/`:

```text
Cargo.toml          3014592b5f0bb335936843a11a130df1e369b753f8e9aa1a28f11eb9c9b9a71b
Cargo.lock          f727acd05fc03192d7d1fcfd27fe5a7cd605a91b37ca06fe577574e9ffa8c97f
src/lib.rs          d71b92e3ec55a41724ae7d58e758d3d8d7769ea14bcd228cf20d31f7661d8c91
src/streams.rs      d19e748ae71afa6c79315664d11530f4a8b6ce410aae45aa611a79e283f2fd2a
src/texture_crop.rs e56840c1501b9455a7829969ef32410d9929e2d6b8db94a084e11f16f550e17f
src/metadata.rs     aad585c8f985bf2ec189ff741c742e4815bef3e29e5583c0bc2b54777ef3953d
src/serialized.rs   4fc14005a75f35f026f9acf0869f10b16389f10547dcbebab10bf9fefbf6a8c2
src/reader.rs       ac95e532269d613918bf173b5ac42c37668e4b1008b2c96c420cdd54e91c5601
```

Source preservation is explicit before/after, not an assumption from old
metadata evidence. Original handoff16 remains
`5af335efee14419d10ecda89689fd207d41c257d7e51fdca47711899e21ad057`, review27
`4c6d3f80c12e15998dc67da5534df037644efca7d5f7346e0b410506ce75fc6d` and PXL1report29
`d06c589cfe407df01af5735211e613750f8f1f701023f3030ed11e93d73c4495`.
Verified inherited current/baseline executables remain respectively
`3ae9968a21d299ddf71b04a392ee788d1df9023602b0ce74a4ed221b76d77382` /
`998101effa858cbc4e604ae929fc1f7eef46a900fe707143befbad5465cd1090`;
public corpus binary
`512cb2a4fe2625773c7262b048ce7a81e33dfca1108e16dc98c123b5c73fc85f`.
The final reviewer receipt in R also hashes this report and reviewer evidence;
its report hash is kept outside this file to avoid self-reference.

## Open gates and next owner

The privileged file-symlink case again reports Windows1314 and remains
**unexercised despite the green test count**; directory-junction rejection runs
and passes. Ordinary fixed-local Windows NTFS and cooperating ReadAt/stamp
guarantees are not universal OS containment or an immutable content snapshot.
Pre-existing writable mappings, privileged/kernel/stamp-preserving mutation,
dishonest custom ReadAt and other OS/filesystem behavior retain their declared
limits. SourceStamp is not a persistent content digest or automatic cache
invalidation policy. These accepted limits are preserved, not reopened without
new evidence.

Next asset work is audited unpacked Sprite meshes/fractional geometry and paired
raw masks, with41-Sprite oracle comparison. Packed/rotated cases, shader/mask/
colour policy, facing/anchors/camera composition, flat/lowered substitutions,
complete Stockade composition, persistent cache/source-manifest/profile/window
lifetime, thin adapters for both hosts, application dependency/package integration,
Classic regressions, owned interactive performance and isolated game observations
remain open. Formats3/4/12/unknown and unreviewed/empty/multi-image/stripped
layouts do not gain pixel support through metadata acceptance. Root owns the
smallest next implementation brief, dependency/application integration and
commit decision. No cross-owner source correction is requested by this review.

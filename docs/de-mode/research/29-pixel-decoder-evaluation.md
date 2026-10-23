# PXL1: bounded BC1/BC7 decoder evaluation

2026-10-23. **Recommend the exact `texture2ddecoder-rs` candidate at
`551fcbfbe86c05424ccc2ff942525c0ec7171d65`, with its default `alloc` feature,
behind checked BC1a/BC7 block calls in the existing Rust asset owner.** All
tested valid blocks/crops match exactly. Do not use its opaque BC1 entry for
Unity DXT1, its unchecked whole-image API, or `default-features = false` at this
pin. This is a selection recommendation for the next reviewed implementation;
no Toolkit dependency or product implementation was changed here.

Read the full goal/contract/plan/engineering standard and reports 02, 08, 14,
16, 24, 27 plus `sources.json` before work. Review27's A1 acceptance remains
metadata-only. The explicit resume authorizes this assignment; the historical
paused goal flag is not a new implementation restriction.

## Ownership and evidence

Only this report was written inside Toolkit. All new source, dependencies,
probes, binaries, notices, logs, blocks and pixels are under
`S:/Projects/UCP/de-research/pixels-pxl1` (**R**). No children, product/A1 edits,
staging/commits/pushes, CI/PR/release, app/game/Steam or game-DLL execution, live/original
profile/settings or Classic changes occurred. Every Toolkit shell command and
probe subprocess used explicit cwd `S:/Projects/UCP/AI-Toolkit-DE`. This is a
shared checkout, not worktree isolation. Start HEAD was
`773f80b8a31d9337cd83342957bd8b76d969515c`; the coordinator advanced it to
`30215f2b567ca38b1b36d2e2907c0965a8503765` during this assignment. Other owners'
changes were left alone. The 18 A1 files still match Review27/handoff16's exact
hashes, independently checked against the correction receipt.

Labels: **observed** means executed/measured here; **source-confirmed** means
inspected pinned source; **recommended** means a proposed production contract;
**unverified** means no corresponding acceptance evidence. Pixel agreement is
not scene, shader, camera, package, host or game acceptance.

The initial inventory found only prior candidate source excerpts, not a full
checkout. Existing research directories, oracle packages and tools were
inventoried before cloning. A new scratch clone was detached at the accepted
candidate pin; it remains clean. No prior checkout was pulled, overwritten or
repinned. Existing Python3.14/UnityPy1.24.2/Pillow13.0.0, the installed Rust1.98.1
and the prior isolated Rust1.88.0 toolchain were reused. The first Cargo probe
downloaded `paste` into the ordinary Cargo cache; subsequent reproducible builds
use R/`cargo-home`, which contains the exact archive/source. No global tool,
Python package or production dependency was installed.

## Exact sources and graph

- Candidate: [pinned source][candidate], package version0.1.2, edition2021,
  MIT OR Apache-2.0. Its manifest declares no `rust-version`. Compilation and
  all three scratch wrapper tests pass on **Rust1.88.0 and1.98.1**; this proves
  compatibility with Toolkit's floor, not the candidate's earliest possible
  MSRV. Source has no `unsafe` occurrences. The research allocator/Windows
  memory-counter instrumentation has its own explicit unsafe code; that is
  outside the decoder and product.
- Actual normal/build graph: `pxl1-probe -> de-assets-core(std only)` and
  `texture2ddecoder -> paste1.0.15(proc macro)`. The probe also pins paste
  directly to force the exact version. Paste has no normal/build transitive
  dependencies, declares Rust1.31 and MIT OR Apache-2.0. Its 18,374-byte
  [crate archive][paste] SHA-256 is
  `57c0d7b74b563b49d38dae00a0c37d4d6de9b432382b2892f0574ddcae73fd0a`.
  The 33-package scratch lock also records the path candidate's unused
  development graph; those image/dds/ktx dependencies were not compiled or
  selected for shipping. R/`tree-normal.log` records the actual build graph.
- Existing UnityPy's DXT1 and BC7 dispatches both use **Pillow's `bcn` decoder**,
  not Python `texture2ddecoder` for these formats. Pinned Pillow13 source is
  [`293218ad059d994baf1777d882911bed6a49704a`][pillow]. Its `BcnDecode.c`
  SHA-256 is `cbdf2bae1d8022a75545591d099e367e92e21c253646014920fb5e68d898aa73`.
  The installed `_imaging.cp314-win_amd64.pyd` is2,654,208B, SHA-256
  `9ca27b1a45178437d9b57e0d3024ed535226f5150ff16fd2363d90171856f0d8`.
  Installed extension identity is pinned separately; a source tag is not
  claimed to establish binary reproducibility of that wheel.
- The supplemental Python `texture2ddecoder1.0.6` wrapper and Rust candidate
  both credit AssetStudio. Their agreement is **shared-ancestry evidence**,
  not an independent oracle. Pillow's separately written C bit extraction/
  decode source declares CC0 and cites the Khronos specification, with no
  AssetStudio attribution found in that file. Independence is not inferred
  merely from a language change: authored vectors below also have expectations
  derived directly from primary specifications.
- [Microsoft's BC7 algorithm][ms-bc7] and [mode reference][ms-modes] were captured
  as official pages and as source at MicrosoftDocs/win32 commit
  `d6ef0356f11875ce355c025170e3e218fc8a5193`. Source SHA-256, respectively:
  `76a8b47fb12ed66a5ccc039e116c9258a60172ad81ab808f6fce25abf484a517` and
  `9eef9698e7420ec28e6da0530b10b754cecf7e7f8d514061531da9677a1f80ab`.
  [Khronos BPTC][bptc] and [S3TC][s3tc] were captured at OpenGL-Registry commit
  `6af574a14089ccfee87efe230ebcdd8742859813`; SHA-256 respectively
  `ab85a0e9b885a0fa1d23e18606b4bad1ab1eacc2bc18011806ea43d9c51bf666` and
  `4b8064e3032ebef0f2afdef6c38f2d758d1911f759eeeceac904b0d81f301c4c`.

R/`source-receipts.json`, `additional-sources.json` and `final-receipt.json`
retain every source URL, source-file/archive/extension/tool/executable hash,
size, exact compiler identity and A1 snapshot. No TPK/schema dataset was copied
into Toolkit. The earlier A1 layout/notice provenance remains unchanged.

## Block correctness, alpha and orientation

**Observed:** the checked scratch adapter calls the actual pinned dependency,
then converts each packed u32 with `to_le_bytes()` from BGRA to RGBA. It does
not reinterpret native memory or premultiply/gamma-convert pixels. The block
functions return `()`, despite the generic README example suggesting Result;
caller slice lengths are a precondition. Direct and whole-image functions are
not a trusted validation boundary. In particular, the whole-image macro uses
unchecked `usize` products and performs no operation cancellation.

`evaluate_synthetic.py` records blocks, expected RGBA and provenance outside
Git. It does not obtain expected results from the candidate.

| Probe | Observed result |
| --- | --- |
| 16 authored BC1 blocks: endpoint0 greater, less and equal; every index; row/column/asymmetric raster patterns; zero/equal/mixed endpoints | BC1a matches both the independent RGB565/palette expectations and Pillow exactly. Opaque BC1 matches the explicitly opaque expectations. |
| `00000000ffffffff` | Opaque entry yields `(0,0,0,255)` at all16 texels; BC1a and Pillow yield `(0,0,0,0)`. Across the16-block corpus opaque versus RGBA oracle differs in52 alpha bytes, max255. |
| 39 authored BC7 vectors across modes0..7 | Zero differing bytes/max error0 for candidate and Pillow against specification expectations. Includes endpoint expansion/P bits, implicit opaque alpha, explicit partial alpha, mode4 both index selectors, mode4/5 all four channel rotations, and mode4/5/6 nonuniform interpolation indices. |
| 272 authored BC7 partition vectors | Every legal partition in modes0/1/2/3/7, distinct subset colours, matches Khronos Table.P2/P3 expectations exactly in both decoders. Tables are read from the pinned specification, not decoder constants. |
| 16,384 deterministic random valid BC7 blocks | 2,048 per mode, seed`0x50584c31`; candidate versus Pillow:0 differing RGBA bytes/max error0 in every mode. Supplemental shared-ancestry wrapper also matches. |
| 64 reserved BC7 blocks, first byte0 with varied remaining bytes | Candidate returns all-zero RGBA, as Microsoft's reserved-mode rule specifies. Pillow instead differs in1,024 alpha bytes, max255, returning alpha255. This oracle discrepancy is retained, not tolerated away. |

BC1 endpoint expansion and integer-floor interpolation expectations explicitly
match the pinned CPU oracle; this does not claim universal GPU rounding/filter
parity for BC1. The authored BC7 expectations are exact byte expectations.
Constant vectors alone do not validate interpolation or partition ownership;
the separate gradient, partition and random probes supply those checks.

**Recommendation:** use `decode_bc1a_block` for Unity format10/DXT1 and
`decode_bc7_block` for format25. Treat a reserved BC7 prefix as an explicit
`Corrupt` result in the product boundary before calling the dependency; the
raw decoder's spec-defined zero result is documented and tested, not a valid
sprite fallback. Other observed Unity formats remain explicit unsupported
decode cases. Invalid format/layout metadata should be classified before
output allocation/work exhaustion; do not mask it by increasing the budget.

The scratch tests exercise152 input/output-length combinations across both
BC1 entries and BC7, including every shorter input, one longer input and
output sizes0/15/16/17. Only exact8/16-byte input plus16 output words reaches
the block function. Additional tests reject zero/out-of-atlas crops, huge
extents/overflow, output cap excess and unsupported formats, including format12
under a zero allowance. These are three focused scratch tests on both Rust
versions, not new A1 tests or exhaustive fuzzing.

## Real art and independently checked crop mapping

Both art files were freshly streamed through SHA-256 on read/share-locked
handles retained across all probe processes. The actual Rust reader then opened
its ordinary A1 handles and used `SerializedIndex`, `validate_sprite`,
`StreamResolver::validate`, `VerifiedRange::read_relative` and **one shared
Work per operation**. No arbitrary game paths/ranges or full-atlas decoder calls
were substituted for those APIs.

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| `resources.assets` | 114,825,928 | `9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a` |
| `resources.assets.resS` | 1,396,428,560 | `be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e` |

Fourteen cases cover Camel512/Sprite28503 and Healer640/103049, both masks
(Texture2D12/50), wall piece7750, outpost1290/45812 and1314/61882, deliberately
unaligned unit/building insets and7x5 rectangles touching each atlas corner.
Every selected output matches fresh Pillow decoding **exactly**, max error0,
and fresh-process repeat outputs are byte-identical. The BC7 art blocks use
modes1/4/5/6/7; modes0/2/3 are covered by the independent synthetic corpus.

`verify_mapping.py` independently recomputes the opened `.resS` byte addresses
from prior pinned oracle metadata, reading only intersecting block rows. Every
saved compressed block stream matches those independent reads. The input
metadata receipts are `asset-format.json` SHA-256
`cd89bbc05573ee788de39403a850cce28f627ddebe0825d7e43764c99f6adcd3`
and `oracle-extraction.json`
`fdced729dd6a281807bd33741796ed497234a4ad669c2cb7c982f9badc4834ce`.

Raw block row0 corresponds to increasing serialized texture-row coordinates.
Texture rectangles use the lower-left atlas convention. Flipping the completed
crop vertically once produces display/top-left rows. Both outpost crops then
match the earlier full UnityPy sprite pixels exactly, including the tall
64x197 piece. RGB channels remain distinct in authored row patterns, so a
channel swap or row reversal cannot accidentally pass.

Healer's real fractional texture rectangle is
`(5944.1181640625,6740,34.881675720214844,85)`; the diagnostic integer enclosure
is `(5944,6740,35,85)`. That is a **raw atlas crop**, not an assertion that
rounding reconstructs the Sprite. Camel's raw rectangle includes visibly
unrelated neighbouring atlas pixels outside its mesh. Compared with the prior
mesh-clipped sprite/mask exports, differing byte counts are Camel11,333/25,213
and Healer481/792. This is observed nonidentity; polygon clipping/fractional
sampling are the expected reason, not implemented or accepted here. The two
outpost quad outputs have0 differences. New proprietary crops were visually
inspected only outside Git; no generated DE stand-in art was used.

Alpha is preserved rather than inferred from image appearance: Camel has225
distinct alpha values (9,948 zero/4,182 fully opaque texels); Healer119
(1,271/1,015); tall outpost53 (1,281/8,487). Both selected BC1 mask crops are
fully alpha255, with RGB samples identical to Pillow. Thus those actual masks
alone cannot distinguish BC1 versus BC1a; the synthetic transparent-index test
is necessary. Mask red/green channels remain raw data. No team colour,
feet cutoff, foliage shader, sRGB, blending or premultiplication was applied.

## Bounded resources and measurements

**Observed:** each crop reads only its intersecting block rows. The scratch
planner checks format, positive/canvas-contained crop, overflow, address-space
conversion, output bytes and block count before allocating. It permits a
deliberate maximum256MiB output/4,194,304 blocks solely for the bounded full-atlas
baseline. Ordinary reads still obey A1's1MiB request cap. Scratch retains encoded
blocks for oracle evidence; production should retain only one encoded row,
16-word stack block and final crop.

| Crop | Blocks / row reads | Encoded / output B | First / repeat crop ms |
| --- | ---: | ---: | ---: |
| Camel87x211 | 1,242 /54 | 19,872 /73,428 | 5.918 /5.840 |
| Camel mask87x211 | 1,242 /54 | 9,936 /73,428 | 4.940 /4.989 |
| Healer35x85 | 198 /22 | 3,168 /11,900 | 2.304 /2.327 |
| Healer mask35x85 | 198 /22 | 1,584 /11,900 | 2.164 /2.066 |
| Outpost1290,64x32 | 153 /9 | 2,448 /8,192 | .954 /.883 |
| Outpost1314,64x197 | 800 /50 | 12,800 /50,432 | 5.175 /4.784 |

All14 cases total6,788 decoded block visits,392 bounded row reads,97,088
encoded bytes and410,144 output bytes, with39.927ms summed crop time in the
first process. Cases overlap; these are operation totals, not unique source
coverage. Timed crops include allocation, A1 checked I/O, block decoding,
RGBA conversion/copy and evidence-buffer retention; they exclude writing the
saved `.rgba/.blocks` files. Fresh helper process totals including complete
index/selected metadata, saved output writes and startup/exit were82.935ms and
78.077ms; the Rust-internal totals were71.315ms and67.392ms.

The initial full-name-scan diagnostic took50.882s/53.749s because two uncached
Sprite scans dominated. It is retained as historical evidence. The final probe
uses the exact reviewed IDs, verifies their names, and does not repeat those
unchanged scans. No index/name-cache policy change is part of this assignment.

First/repeat are **fresh-process, OS-cache-warm observations**, not disk-cold
benchmarks: the initial source hashes themselves warm the cache. No global
cache flush was attempted. Hashing took approximately.85s in the original run
and is reported separately. Portable latency guarantees and cold disk behavior
remain unverified.

Whole-process peak resident memory for both crop processes was24,985,600B
(23.83MiB), including the A1 index/runtime. The global allocation meter's peak
was20,342,798B; it measures requested live allocation bytes, not RSS or allocator
overhead. Maximum one-crop output here is73,428B; base+mask are emitted
sequentially. An explicit **bounded** full8192-square BC7 baseline, with no full
page written or retained as an artifact, reads67,108,864B in2,048 row requests,
decodes4,194,304 blocks and allocates268,435,456B RGBA. Its crop time is1.995s,
peak requested allocation350,410,302B and peak RSS355,188,736B (338.73MiB),
including the intentionally retained64MiB encoded evidence buffer. This is
evidence against eager atlas decoding, not the production default.

The separate block+BGRA-to-RGBA microbenchmark uses preloaded real blocks,
1024 repetitions, a128-byte stack scratch pair and black-boxed output. Three
runs give median BC7 costs approximately396.60ns/block Camel,388.05ns Healer,
369.93ns outpost; BC1a masks13.23/13.19ns. These exclude I/O, index work,
allocation and game/host contention guarantees. Exact timings/commands are in
`bench-0..2.tsv`, `bench-checks.json` and `examples/decode_bench.rs`.

The range/crop test succeeds with an exact64-byte shared allowance, rejects63
without resetting it, and deterministically requests the **real Work atomic**
after one block: cancellation stops before block2, after the first32-byte row
read and before the second row. Pre-cancelled work stops before allocation.
The external probe cannot debit private `Work::charge`; it shares A1's byte/
geometry allowance and checks cancellation per block. **Production integration
inside that same crate must debit decode visits using existing Work**, rather
than add a second host budget. All errors discard partial pixels; no partial
success image is published. Allocation/zeroing and OS reads have bounded sizes,
not a promised real-time cancellation latency.

**Recommended production starting limits:** retain the observed canvas gate
at maximum8192 per axis; cap one output at16MiB and262,144 decoded blocks,
with cumulative Work and checked `ceil(w/4)*ceil(h/4)*blockB`, mip offsets,
row/output strides and usize conversions. This caps the encoded BC7 row at
32KiB plus64B block scratch. Use `try_reserve_exact` before resize; allocation
failure is explicit. Validate against the token's selected mip and indexed
texture, not caller-mutated dimensions/format. Unsupported dimensions/format,
truncation, cancellation, source change and limits stay distinct. No automatic
fallback to whole-atlas decode or another codec/installation.

## Packaging, size and complete notices

**Observed:** optimized Rust1.98.1/MSVC x64 with LTO, one codegen unit and symbol
stripping produces a332,800B probe versus320,000B with the same A1/I/O/output
shell and decoder calls compiled out: **12,800B (12.5KiB) incremental linked
cost**. Candidate helper SHA-256:
`5c48093d49ff6148a5fc509762b812ff4702baf1253df4f282a97d2e7d19937a`;
baseline `4a7a94e90d6448a06be90e6cbfaa9f9c348e770f220e913c2cf90f9bfd2ddbe2`.
Rust1.88's default-feature helper is350,208B. Final app/Tauri/helper package
delta is not measured by these standalone binaries.

The decoder build rlib is1,037,950B, source files332,464B; those are build/source
sizes, not extra runtime downloads. Paste's318,464B proc-macro DLL is a
**compiler input**, not a required runtime DLL. No Python/Pillow/UnityPy worker
is selected for the shipped path. Disabling default `alloc` at the exact pin
fails with unresolved gated crunch/unitycrunch imports and further missing
identifier/type errors (exit101, `noalloc-check.log`). Do not advertise a
working no-alloc package based on the README. The called BC1a/BC7 block source
itself uses fixed arrays and no heap allocation; default features do not require
calling or exposing the other codecs.

R/`notices` contains full, verbatim candidate LICENSE-MIT, LICENSE-APACHE,
COPYRIGHT and README credits; paste's two licenses; AssetStudio's MIT notice
(Radu2016, Perfare2016-2020), and the existing A1 UnityPy notice. Conservative
additional license texts cover every other codec source named by the candidate:
mikunyan/FP16 MIT, Binomial crunch's public-domain license text, and Unity
crunch's zlib text. Exact license-source commits/hashes are in
`full-notice-source-receipts.json`; these current source snapshots do not invent
historical derivation commits omitted by upstream. The candidate COPYRIGHT
mentions Rust/LLVM paths absent from the checkout; it is preserved verbatim,
not treated as an LLVM package dependency or a substitute for the actual BCn
notice. The final full bundle is60,409B. No license for the current Toolkit is
inferred or assigned. No game art or research oracle needs redistribution for
the selected Rust path.

## Reproduction and next owned task

R/`README.md` gives offline reproduction. Exact argv/cwd/environment/exits are
in `build-checks.json`, `real-results.json`, `bench-checks.json`; source/data/
output/tool hashes are in `final-receipt.json`. Re-run sequentially, never build
over an active Windows executable. An initial attempt did hit Windows error5
when rebuilding the running diagnostic; its log is retained. Separate targets
and a copied immutable probe executable resolved this scratch scheduling error.

```powershell
# cwd: S:/Projects/UCP/AI-Toolkit-DE
$env:CARGO_HOME='S:/Projects/UCP/de-research/pixels-pxl1/cargo-home'
$env:CARGO_NET_OFFLINE='true'
python -B S:/Projects/UCP/de-research/pixels-pxl1/build_checks.py
python -B S:/Projects/UCP/de-research/pixels-pxl1/evaluate_synthetic.py
python -B S:/Projects/UCP/de-research/pixels-pxl1/run_real.py
python -B S:/Projects/UCP/de-research/pixels-pxl1/verify_mapping.py
python -B S:/Projects/UCP/de-research/pixels-pxl1/run_bench.py
```

**Next implementation: PXL2, one Rust asset owner, no host duplication.** Add a
narrow texture-crop operation beside A1 using the exact candidate Git revision,
default features and locked paste1.0.15. It should accept index-scoped texture
key/mip/integer crop plus existing Work/limits, internally obtain the checked
metadata/range, and emit straight RGBA8 with explicitly top-left output rows
and a retained lower-left atlas source rectangle. Keep raw block functions
private behind fixed-size slices, apply the explicit reserved-prefix policy,
charge/cancel each block, bound allocations and preserve all existing A1 source
guarantees. Carry the complete notices and promote reviewed synthetic vectors
only; never promote proprietary fixtures. Independent review should reproduce
the block/crop negatives, alpha/row cases, changed-source propagation and both
Rust versions. Root owns dependency/application-lock edits and acceptance.

The whole candidate adds only12.5KiB in this measured consumer; a hand-maintained
BC1/BC7 fork would save no demonstrated material shipping cost while adding
upstream-tracking ownership. Prefer the pinned dependency over that fork or a
packaged Python stack. The no-default-feature defect does not block this
default-feature selection and is not a reason for another broad research round.

After bounded texture pixels, a separate provider slice must reconstruct the
audited unpacked meshes/fractional geometry and pair masks, comparing the41
selected sprites to the oracle. Renderer-owned semantic selection, scene
composition/anchors, shader/colour policy and view calibration remain separate.
Neither A1 nor this decoder evaluation authorizes packed/rotated meshes,
complete Stockade composition, guessed flat/lowered states, world acceptance,
cache/profile/window integration or an Electron decoder. Both hosts must consume
this single Rust provider through their thin adapters.

[candidate]: https://github.com/K0lb3/texture2ddecoder-rs/tree/551fcbfbe86c05424ccc2ff942525c0ec7171d65
[paste]: https://static.crates.io/crates/paste/paste-1.0.15.crate
[pillow]: https://github.com/python-pillow/Pillow/blob/293218ad059d994baf1777d882911bed6a49704a/src/libImaging/BcnDecode.c
[ms-bc7]: https://learn.microsoft.com/en-us/windows/win32/direct3d11/bc7-format
[ms-modes]: https://learn.microsoft.com/en-us/windows/win32/direct3d11/bc7-format-mode-reference
[bptc]: https://github.com/KhronosGroup/OpenGL-Registry/blob/6af574a14089ccfee87efe230ebcdd8742859813/extensions/ARB/ARB_texture_compression_bptc.txt
[s3tc]: https://github.com/KhronosGroup/OpenGL-Registry/blob/6af574a14089ccfee87efe230ebcdd8742859813/extensions/EXT/EXT_texture_compression_s3tc.txt

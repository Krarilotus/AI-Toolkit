# Independent SPR2 implementation review, round 1

2026-10-23. **GO for the exact additive, unexposed SPR2 asset-crate milestone.
SPR1-R1-01/P2 is closed. No actionable P0/P1/P2 finding remains in this review.**
Root owns acceptance, integration, staging and commits. This approves the bounded
CPU extraction API; it supplies no Unity/GPU/game, scene, host or UI acceptance.

## Scope and frozen input

Read goal00, contract01, plan02 and engineering05 first, then handoff42 in full,
SPR1 report37, independent Review40, relevant reports14/16/27/31/34, performance
rationale and native-parity/cache contracts. Inspected the actual source, tests,
before/after boundary, source algorithms, notices and external receipts. Sol6.1;
no children. Every Toolkit shell command and reviewer subprocess explicitly used
`S:/Projects/UCP/AI-Toolkit-DE`. This is shared mode, not worktree isolation.

Start observed HEAD was `a55ea99542763e9103b1db5d6b494bd6390870a6` on
`de/separate-game-mode`. End HEAD is
`9f0c66e43f1be8f1dd7f9c138f4ce7b470260168`; root identified this advance as the
coordinator's process-fix/docs milestone. All captured asset inputs remain
unchanged. Concurrent F2/C1/coordinator edits were left alone. Only this report
was written inside Git. No production/test/generated edits, commits, pushes,
CI/dispatch/PR/merge/release, mounted analysis tools, browser/app/game/Steam/DLL
launch, live/original profile/settings, Classic or OS changes occurred.

All reviewer code, fixtures, logs, binaries and proprietary outputs are outside
Git at **R=`S:/Projects/UCP/de-research/review-sprite-planes-spr2-r1`**.
**S=`S:/Projects/UCP/de-research/sprite-planes-spr2`** is the unchanged implementer
evidence. Original SPR1/Review40 inputs and failed reproductions were not altered.

**Fresh observed** below denotes this review's execution; **source-confirmed**
denotes inspected source behavior; **inherited** denotes existing, hash-verified
evidence; **unverified** denotes outstanding acceptance.

Fresh start/end audit verifies **480 unique path/size/SHA-256 records**, zero
mismatches, in the supplied final receipt. The brief's 475 count is superseded
by this actual file inventory, not silently asserted. The receipt itself is
111373B/SHA-256
`80f0cbb5bbd1fcdac60feb459702f23bff43709fade140d1dea84566bb0ee564`.
Handoff42 is25776B/SHA-256
`042b7115907cb33ff1150db071a5b3f440b26fd35ae5f45bae355cad99927d4e`.
All45 crate files match S's complete working-byte receipt at both ends:
`final-source-sha256.json`,10648B/SHA-256
`649eec311444df14e98e817ce14cdec889feff900780b35a0538a4cef0d1bc57`.
R/`audit-start.json` and `audit-end.json` retain every reviewed crate/report pin.

## Correctness, ownership and preservation judgment

The shipping-free public trace is:
`StreamResolver::prepare_sprite_planes(index, work)` -> immutable borrowed
`SpritePlaneProvider` -> `reconstruct_sprite_plane(key, plane, limits, work)`.
It accepts scoped signed ObjectKeys and internally rereads source-owned metadata;
no mutable DTO, pathname, byte-range or sample ID supplies authority. Preparation
uses one class28 pass for five exact names. Reconstruction never rescans the
137773-object inventory. This small provider earns its abstraction through that
batching requirement; it is not a scene, image cache or semantic frame framework.

`sprite_catalogue.rs` owns the proven material families; geometric code owns
none of them. Fresh real identities confirm body16 Texture23 -> mask12,
body15 Texture42 -> mask50 and AllTileSprites Texture31 explicitly unmasked.
Pinned managed `spriteLoader.cs` at
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`, SHA-256
`24e57447e342a45fdf0eee0da844bc466e4132619f94508784c19e33ed3bb59a`,
supplies the explicit makeMask/resource-loading contract. Zero/one/many names
stay class-scoped; absent/ambiguous known masks also fail Base requests. Unknown
families stay UnknownFamily, even if a same-name `_m` texture exists. Explicitly
unmasked and unknown paired requests have distinct errors. No suffix fallback,
alpha substitution, shader/player-colour, animation/GM, facing or world policy
was added.

`geometry.rs` is one private stream/stride/alignment/scalar policy shared by A1
usable validation and reconstruction. The validated result carries that layout;
there is no independent production geometry accessor. `PreparedCrop` factors
the original PXL2 planner/row-batched decoder rather than introducing another
parser, decoder, range policy or raster dependency. Its checked range remains
alive through the Sprite raster/copy and then checks both assets and selected
pixel sources. Caller Work and selected-object accounting are cumulative.

Fresh preservation checks confirm29 original files unchanged against the
owned38-file accepted baseline, including every original A1/PXL2 test, fixture
builder, reader and geometry regression. Sprite parser prefix, complete Texture
types/parser suffix and serialized header/index prefix remain equal. Geometry
index traversal retains every legal repeated visit, without an overlap ban.
The source-confirmed private helper preserves charge counts. The supplied
622554000-index/622687086-unit release regression on both compilers is inherited
and hash-verified, not gratuitously rerun. A fresh smaller production-consumer
overlapping-range check and the original regression tests also pass.

Support remains explicit: mip0/downscale1, one XY triangle submesh,
baseVertex/firstVertex0, unrotated/unpacked tight geometry, zero-UV masking or
rounded integer UV translation. Affine, other packing/reserved bits, non-XY,
external/atlas/alpha/secondary references and unreviewed layouts refuse output.
There is no raw-rectangle fallback. Original fractions, pivots, negative offsets,
raw indices/vertices and unsupported metadata remain separate from rounded output
and continuous local mapping. Identity retains scoped keys, mask state, both
SourceStamps, mip/format/dimensions/crop, decode revision1 and the named extraction
convention. Local canvas origin is not presented as a world anchor.

## Prior P2 closure and independent pixel evidence

**SPR1-R1-01/P2 — CLOSED.** In the translation branch each triangle retains its
own exclusive width/height and local scan coordinates; only coverage writes are
translated. There is one enclosing texture crop, no per-triangle decode or
temporary-image framework. The source's float32 intersections, C-wrapper
truncation, Python ties-to-even, edge/corner and clipping rules remain distinct.

Fresh current/MSRV unit and ordinary release-consumer paths exercise the complete
serialized witness with positions
`[(70,111),(76,72),(13,5),(0,0),(128,0),(128,129)]`, triangles
`[(0,1,2),(2,3,4),(1,4,5)]`, PPU1, UV translation `(32,48)`,256² BC1a,
128x129 canvas. Top-left `(41,70)` is exactly `[255,0,0,255]`.
The supplied counting-source regression observes33 contiguous enclosing row
reads. The direct regression preserves lower-left `(41,58)` local255/global0.
This is a correction to coordinate arithmetic, not a changed oracle/tolerance.

The reviewer authored **721 complete source-bound plane cases**: that exact
witness plus360 zero-UV and360 UV-translation cases. Expectations freshly invoke
the actual pinned `SpriteHelper.render_sprite_mesh`/`mask_sprite`, without a
reviewer rasterizer. Cases cover three canvas sizes, three PPU scales, negative
fractional local origins, promoted float32 input, rounded coordinates, clipped
maxima, both windings and repeated/horizontal/vertical degenerate triangles.
Both Rust1.98.1 and1.88.0 ordinary release consumers match all16968768 RGBA bytes:
**zero differing bytes, maximum error0**. Expected/actual SHA-256:
`b22a9c52895887dfb6502a9e8c484817887b7ac837f94e5d2e635ab41a38217d`.
The serialized Shape/wire construction is reused as a builder only; expectations
and negative assertions are reviewer-authored and the dependency has no cfg(test).

**Fresh focused real extraction:** nine planes, one prepared provider and one
cumulative Work, compiled against the actual crate. Camel512/28503,
Healer640/103049, fractional Camel517/117735 and Healer644/82120 each have Base
and PairedRawMask; outpost1314/61882 has Base. All bytes match both unchanged
prior full-Sprite/source-algorithm expectations and SPR2's outputs. Returned
dimensions/origins include87x211/(35,175),35x85/(15,68),138x198/(81,176),
37x89/(16,73),64x197/(32,180.5). Crop origins for the fractional examples are
`(704,1799)` and `(5734,6925)`, retaining the distinction from raw render rectangles.

The real run keeps read/share-locked handles throughout, hashes each art source
once before and once after, and closes both handles. Exact lengths/hashes match:

```text
resources.assets       114825928  9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a
resources.assets.resS  1396428560  be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e
```

Full57-plane/209-vertex/127-triangle and512 prior synthetic results remain
inherited, verified receipt evidence; this review does not relabel them as fresh
runs. Both old and fresh pixel oracles belong to the UnityPy/Pillow extraction
family. They do not establish independent Unity rasterization or game appearance.

## Resource, cancellation and recovery probes

Source-confirmed admission precedes pixel allocation/I/O: checked combined
crop RGBA + coverage + output is **9WH**, plus encoded row, points/raw geometry
and2KiB fixed scratch. Row coexistence is conservative. Bounded metadata/index,
allocator overhead and runtime stack are explicitly outside this scratch cap;
it is not an RSS claim. New points/match/pixel buffers reserve fallibly. Original
bounded inline bytes necessarily arrive in the A1 metadata read.

Fresh independent ordinary release-consumer probes pass on both compilers:

- A4x4 fixture requires exactly2392 combined planned bytes.2391 refuses with
  **zero pixel reads**;2392 succeeds on the same prepared provider. Output,
  row/block and raster caps also retain the supplied negative tests.
- One complete public request costs exactly1201 Work units.1201 succeeds leaving
  zero;1200 refuses. Reusing the exhausted allowance refuses another request.
  Raw Sprite metadata compares equal afterward. Separate raster caps0/1/2/4/8/
  16/32 refuse; a later normal request still succeeds.
- Both known families use distinct authored red Base/green mask streams and
  ignore same-name Sprite collisions. Missing masks, duplicate masks and duplicate
  bases fail before pixels. Unknown `_m` presence remains unknown.
- Cancellation raised by the pixel source after an actual row read returns
  Cancelled; raw metadata remains available and a fresh operation succeeds.
  Observable assets/pixel revision changes at each last completion observation
  return ChangedSource. Restoring the cooperating test source's normal stamp
  allows recovery; no partial image is returned.
- Empty-name queries on nine opaque-class entries consume exactly nine units,
  proving charges precede class filtering; a second pass at zero allowance fails.
  Supplied deterministic tests additionally cover last nonmatching-object and
  last raster/zero/copy visits using the real cancellation atomic.
- Packing mode/reserved bits, downscale, affine UV and non-XY fixtures refuse
  pixels while raw parsing stays usable. Shared A1 repeated-range validation
  consumes its exact measured107 units and refuses reuse at exhaustion.

Zeroing checks/accounting occur in4096-byte chunks; scanline/edge/coverage/copy
and geometry visits consume the same Work. PXL2 keeps its original fixed16-texel
per-block work and ordinary crop bulk-zero/debit semantics. Bounded allocation
or one OS read remains outside a hard real-time cancellation promise. Declared
ordinary fixed-local NTFS/cooperating ReadAt/noncryptographic SourceStamp
limitations remain; covert stamp-preserving edits, writable mappings, privileged
mutation and dishonest ReadAt are not newly claimed contained.

## Verification, notices and performance scope

Fresh checks all exit0: **64 tests each on Rust1.98.1 and1.88.0**
(21 library/20 core/9 resolver/14 crop), all-target Clippy `-D warnings`, scoped
`cargo fmt --check`, and both independent production-consumer workloads above.
The file-symlink test reports Windows1314 and remains **unexercised despite the
green count**; the directory-junction rejection executes. No privilege change.
No failed reviewer repro was discarded; these probe runs had no failed assertion.
The repository search for a product consumer returns no matches (rg exit1).

Cargo manifest/lock are unchanged. Decoder pin remains
`551fcbfbe86c05424ccc2ff942525c0ec7171d65`, with paste1.0.15 and no new parser or
raster dependency. The original60409B notice members retain their exact bytes.
The full1457B Pillow **MIT-CMU** notice is exact SHA-256
`15181e7363dca9aed78b79bebebc7fde7f1814b8bd311ea3b87ae8ccadfc185b`, with
`-text` protection, Draw.c copyright, source pins and adaptation attribution.
Draw.c at`293218ad059d994baf1777d882911bed6a49704a` retains SHA-256
`5aefa0c335e8e6c3a30c9e61a4e5aa790d72544aa9be0f41704b184e503b2e0d`.
Executing Pillow extension pin is
`9ca27b1a45178437d9b57e0d3024ed535226f5150ff16fd2363d90171856f0d8`;
source-to-wheel reproducibility remains unverified. No proprietary corpus,
TPK/schema dataset or oracle package is added to Git.

Inherited performance methodology was inspected and raw TSV recomputed. Equal
full57-plane requests include validation/planning/allocation/crop/raster/final
checks in both modes; name preparation is once outside timers. The owned baseline
retains disclosed old Work/global-coordinate/completion differences. Warm medians
are206.089ms baseline versus208.073ms SPR2; p95=max242.954/215.721ms; maximum
extra requested live allocations251846/250419B. The reported1.984ms/about1%
median delta is accurate.34246 blocks/1761 encoded rows/448688 encoded bytes
are checked-plan counts, not an OS I/O trace. Small OS-warm samples and requested
allocation are not portable latency or RSS claims.

No renderer/draw/input path, retained worker scene, latest-only queue, batching,
cache/dirty invalidation or deferred analysis was changed. No interactive
workload is integrated here. Later runtime integration must preserve those
optimizations, put source probing/hashing/extraction outside draw/input/per-frame
IPC, cache at its owner and compare owned equal-condition interactive workloads.
Provider timings do not certify smoothness or native FPS.

## Reproduction, lifecycle and handoff

From explicit cwd`S:/Projects/UCP/AI-Toolkit-DE`, using existing offline cache and
isolated MSRV home, all targets and fixtures under R:

```powershell
python -B S:/Projects/UCP/de-research/review-sprite-planes-spr2-r1/audit.py start
python -B S:/Projects/UCP/de-research/review-sprite-planes-spr2-r1/checks.py
python -B S:/Projects/UCP/de-research/review-sprite-planes-spr2-r1/prepare_probe.py
python -B S:/Projects/UCP/de-research/review-sprite-planes-spr2-r1/corpus.py
python -B S:/Projects/UCP/de-research/review-sprite-planes-spr2-r1/probes.py
python -B S:/Projects/UCP/de-research/review-sprite-planes-spr2-r1/real.py
python -B S:/Projects/UCP/de-research/review-sprite-planes-spr2-r1/finish_checks.py
python -B S:/Projects/UCP/de-research/review-sprite-planes-spr2-r1/audit.py end
```

Each `*-command.json` records exact argv/cwd/environment, timeout, PID and creation
FILETIME, exit and descendant count. `owned.py` starts commands suspended, assigns
an owned Windows kill-on-close Job before resuming, waits at most60/120s and
terminates/reaps any remaining exact job descendants in finally. Every command
records **active_after_cleanup=0**. No detached server or unrelated process sweep
was used. Tool wrapper sessions89159 and8572 were polled to exit0. Other wrappers
completed synchronously; source-handle closure is recorded in`real-result.json`.
R/`review-receipt.json` binds reviewer artifacts/binaries and this report; final
report hash is kept there to avoid self-reference. Real command input files are
opened read-only and no game executable is run.

Root can accept this exact45-file crate plus handoff42 after checking its intended
staged bytes. No cross-owner correction is requested. Remaining gates are
Unity/GPU/game raster/sampling/shader/gamma/blend and appearance, world placement/
facing/flat/lowered/Stockade composition, source-manifest/cache/profile/window
lifetime, both-host integration/package/Classic regression, owned interactive
performance and isolated real-game observations. This GO does not close the full
DE-mode goal or authorize any runtime integration by itself.

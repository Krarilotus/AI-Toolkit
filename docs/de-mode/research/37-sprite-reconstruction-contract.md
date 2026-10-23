# SPR1: bounded unpacked Sprite reconstruction contract

2026-10-23. **The scratch reconstruction passes for all 41 requested base
Sprites and 16 paired unit-mask planes: zero differing RGBA bytes, zero differing
alpha bytes, maximum channel error 0.** This is extraction-convention parity
against independently pinned prior exports and fresh source-algorithm/Pillow
reads. It is not Unity/game rasterization, shader, scene, UI or feature acceptance.
Recommend a small SPR2 implementation inside the existing asset crate after the
coordinator independently reviews the pixel and geometry findings below.

## Scope, authority and preserved inputs

Read the exact goal00, contract01, plan02 and engineering05 first; then reports
02/08/14/16/27/29/31/34, existing assets/rendering/parity evidence, the performance
rationale and native-parity/cache contract. The explicit resume supersedes the
historical pause. No children were used. Every Toolkit shell/subprocess cwd was
`S:/Projects/UCP/AI-Toolkit-DE`, on `de/separate-game-mode`. Start and evidence-run
HEAD was **`61c2fa16524c7b06d1638eed9c1593afd689e469`**, the accepted PXL2 commit;
A1 remains `30215f2b567ca38b1b36d2e2907c0965a8503765`. Coordinator commits advanced
finish HEAD to `e3d891cb815a9758542b897065141e71da4a7ca2`; the asset files stayed
at their exact accepted hashes. This is shared mode, not
worktree isolation. Root owns acceptance, integration and commits.

Only this new report is written inside Git. All prototypes, fixtures, metadata,
pixels, source copies, binaries and logs are under
**R = `S:/Projects/UCP/de-research/sprite-reconstruction-spr1`**. No production
crate/core/renderer, Classic, original/live profile or settings change; no
staging/commit/push, CI/dispatch/PR/merge/release or app/game/Steam/DLL launch.
Concurrent coordinator/teammate edits were left alone. `core-preservation.json`
verifies all **38 actual asset-crate files** against PXL2's accepted exact receipt,
including the unchanged A1 parser/geometry correction. No parser/decoder was
copied or patched: Cargo's path dependency compiles the actual Toolkit crate.

**Fresh observed** means executed/read here; **source-confirmed** means pinned
explicit code/data flow; **inherited** means prior evidence whose bytes were
verified; **recommended** means the SPR2 handoff; **unverified** marks acceptance
that has not happened. Those labels are not interchangeable.

Existing oracles and dependencies were inventoried first and reused. In
particular, the 41 full-Sprite exports, 16 mask exports, metadata and installed
UnityPy/Pillow come from `rendering-contracts`, `rendering-provider-review`,
`assets/pydeps` and the accepted A1/PXL1/PXL2 evidence. No clone, fetch/pull or
ref change was performed. Four previously missing primary source files were
downloaded at already pinned commits into R only: Pillow Draw.c and _imaging.c,
UnityPy MeshHelper.py and Texture2DConverter.py. Their exact hashes and URLs are
in `source-receipts.json` / `additional-sources.json`; the latter two normalize
to the installed code exactly. This is missing-source retrieval, not repinning.

## Binary and source identities

The driver hashes opened `GENERIC_READ / FILE_SHARE_READ` handles, keeps both
resource handles locked throughout preparation, oracle reads and consumer runs,
then rehashes those same handles. Before/after lengths and hashes match:

| Data-relative input | Bytes | Fresh SHA-256 |
| --- | ---: | --- |
| `resources.assets` | 114825928 | `9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a` |
| `resources.assets.resS` | 1396428560 | `be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e` |
| `Managed/Assembly-CSharp.dll` | 3693056 | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `Plugins/x86_64/CrusaderDE.dll` | 3451392 | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |

The last two were freshly hashed on read/share-locked handles by `finalize.py`,
never executed. Data means the installed
`D:/SteamLibrary/steamapps/common/Stronghold Crusader Definitive Edition/Stronghold Crusader Definitive Edition_Data`.
No game executable is needed by this experiment.

Primary sources and exact execution pins:

- Managed game source: Serpens develop **D**
  `7e199e6f0818173794bdeeb0c4c32d74500b0eec`, decompilation directory
  `_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled`.
  Fresh `git show D:.../spriteLoader.cs` matches the existing research source
  after newline normalization; installed binary identity matches above. The
  clone's checked-out main HEAD remains `a23aa1b32276d670ffbb2a7b641d23b500d8e298`;
  D was read by immutable Git object, not by assuming that checkout is develop.
- [UnityPy SpriteHelper.py](https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/export/SpriteHelper.py),
  [MeshHelper.py](https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/helpers/MeshHelper.py),
  [Texture2DConverter.py](https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/export/Texture2DConverter.py):
  commit `807f3888b8a2ddaa6504fca0737481baab4d6a99`. Installed package 1.24.2,
  exact installed raw SHA-256 respectively
  `c15b125896457db8a5df52dbd521601ec47d6c266166c5d0eb3cf6906292b15d`,
  `75a2433e08ea169d10eeadc7b64f3bddcd4b680d81493feb1b63cf1cab2b51d0`,
  `5f09aeeb509e2111ead1917abc1abc366c98972e8a1cedb57d233014970878b2`.
  LF-normalized source hashes are respectively
  `e077830c860e04c75bcbe38c1df0c23a1a0c919613c8b5d30ca115e8666f4017`,
  `c957123af5a1e6a28586c7227c3b4b470a2f39dd22fcb6c19bfd6da1566ee76d`,
  `bec65bd76ae2574642ab092d949e6822618a14ec1fed8ce9f0ca108de49bf086`.
  ObjectReader retains its different accepted commit
  `578a1b2f13f341db079fd969706d36d915b0dc8d`; no single package-release commit
  is invented. Finalization rechecks accepted parser/Tpk hashes.
- Pillow 13.0.0; source commit
  `293218ad059d994baf1777d882911bed6a49704a`.
  [Draw.c](https://github.com/python-pillow/Pillow/blob/293218ad059d994baf1777d882911bed6a49704a/src/libImaging/Draw.c)
  SHA-256 `5aefa0c335e8e6c3a30c9e61a4e5aa790d72544aa9be0f41704b184e503b2e0d`;
  [_imaging.c](https://github.com/python-pillow/Pillow/blob/293218ad059d994baf1777d882911bed6a49704a/src/_imaging.c)
  `3145c84174cf30d0eedf2ef946f821f230b07ecf258d30c58dd301e0ade07053`.
  `_imaging.cp314-win_amd64.pyd` is 2654208 B,
  `9ca27b1a45178437d9b57e0d3024ed535226f5150ff16fd2363d90171856f0d8`.
  This verifies the executing extension, not binary reproducibility from source.
- TPK remains 1326072 B,
  `3777edf16f1a57908640ef6d1e49fa51533e545424188b239c1b8e2ead3988da`,
  artifact commit `3135aa937e46ec8a7e2c60e84fb2fbb51a9c95c8`.
  UnityPyBoost is `b57ba7de45fedf1c4f430d8e8684a73d511cc09ca6cf8f72d43b8067e000943c`.
  Existing schema pins/provenance and their redistribution exclusions remain.
- Actual decoder dependency stays Git
  `551fcbfbe86c05424ccc2ff942525c0ec7171d65`, default alloc; paste 1.0.15 archive
  `57c0d7b74b563b49d38dae00a0c37d4d6de9b432382b2892f0574ddcae73fd0a`.
  Scratch lock/tree contain only the probe, actual asset core, decoder and paste.
  Prior Microsoft/Khronos/BCn pins and complete notices remain those in29/31/34.

Python is 3.14.7 (`823f032`), executable SHA-256
`4942b86a6597e5aee0128daa00050ed79bc21f6e709a78eb19cbfeb0c2f39ac9`.
Both scratch builds/tests use existing Rust versions: 1.98.1
`48a229ceaefd4985c50990b14116b6d856af0985` and isolated 1.88.0
`6b00bc3880198600130e1cf62b8f8a93494488cc`, MSVC x64. Exact compiler executable
hashes, command arrays/environments and logs are in the external receipt.

## What the actual source algorithm does

**Source-confirmed, freshly reproduced:** `get_image_from_sprite` selects direct
render data for this atlas-free corpus, obtains the texture without its usual
display flip, makes a fractional Pillow crop, decodes settings, then takes the
tight-mesh branch because packingMode is 0. Packed bit 0 is clear for every
sample; mesh bit 6 is 1 for units, 0 for outpost tiles. The tight branch tests
UV values, not the mesh bit alone. The final image flips vertically once.

`MeshHandler.get_streams` sums active float32 channel widths per stream and
aligns each next stream start to 16 bytes. Position is channel0, UV0 channel4
for this Unity version. `get_triangles` reads 16-bit little-endian indices,
starts at firstByte/2 and follows each submesh's declared indexCount/topology.
The source does not add baseVertex in that routine. Its UV renderer returns
after the first submesh. Every real selected sample has one triangle submesh,
baseVertex=firstVertex=0, so neither limitation is silently generalized away.
SPR1 refuses nonzero base/firstVertex, multiple submeshes, non-XY planes,
nontriangle topology, nontranslation UVs, unknown encodings, packing/rotation
and unreviewed references. A1 raw metadata still preserves them.

**Units:** all16 have nonzero UVs. `render_sprite_mesh` finds XY extrema,
normalizes positions by their minimum, scales by PPU, and applies Python
ties-to-even round to coordinates and canvas extents. It similarly rounds
UV×atlas dimensions. On all16, every rounded UV minus rounded output position
is the **same integer translation**. Each `copy_triangle` therefore takes its
no-affine-transform branch: source min/max rectangle (upper bound exclusive),
binary Pillow polygon mask, paste at destination minima. Unioning those clipped
triangle masks and sampling one bounded translated source rectangle is equivalent
for these cases. General affine sampling is explicitly unsupported here.

**Outpost tiles:** all25 have zero-valued UV0s. `mask_sprite` takes normalized
float positions, uses ImageDraw polygons as a binary coverage mask on the cropped
image, preserves existing alpha through composite with transparent zero, then
flips the result. For these quad samples all pixels of the cropped rectangle are
covered. This is an observed special case, not permission to treat troops as
rectangles. Pillow Image._crop rounds each rectangle endpoint independently;
it does not simply floor origin/ceil extent. The C polygon wrapper truncates
floating coordinates toward zero; Draw.c supplies its specific scanline/edge
rounding and endpoint conventions. The scratch port follows that pinned CPU
convention, including degenerate/horizontal edges, with fixed triangle scratch.

There is no antialiasing, GPU top-left fill rule, texture filtering, gamma,
premultiplication, shader or framebuffer blend in this algorithm. A CPU export
matching this convention is not evidence of the game's rasterization.

## Fractional geometry, local origin and named sample coverage

The consumer reads `validate_sprite`, typed texture references and metadata from
the **actual** A1/PXL2 crate. Its small channel accessor is a scratch geometry
consumer, not a second serialized parser. Fresh UnityPy geometry independently
matches **209 position vertices, all corresponding UV tuples, all127 ordered
triangles and all41 canvas sizes**. Exact fields/float32 values, submesh arrays,
index/vertex blobs, original rect/pivot/PPU, offsets/negative atlas offsets,
uvTransform and downscaleMultiplier are retained in `expected.json` and the
unchanged raw metadata types. All41 downscale multipliers are1; all PPU are64.
No atlasRectOffset `(-1,-1)` is reinterpreted as a requested crop or scene anchor.

Healer640 is Sprite103049: original rect `(5944,6740,35,85)`, render rect
**`(5944.1181640625,6740,34.881675720214844,85)`**, textureRectOffset
`(0.1181640625,0)`, atlasRectOffset `(-1,-1)`. Its five vertices are
`(0.3125,-0.265625,0)`, `(-0.21875,-0.265625,0)`,
`(-0.234375,0.5625,0)`, `(-0.0625,1.0625,0)`, `(0.3125,1.0625,0)`;
three triangles/nine indices. Bounds×PPU are `[-15,-17,20,68]`; output35×85,
local origin `(15,68)` in top-left continuous canvas coordinates. The algorithm
uses the UV/mesh branch rather than assigning the fractional render width to
the output raster. Base output differs from the unmasked raw35×85 crop in481
bytes (4 alpha); its mask differs in792 bytes (198 alpha).

Camel512/Sprite28503 has eleven vertices/nine triangles; bounds×PPU
`[-35,-36,52,175]`, canvas87×211 and local origin `(35,175)`. Its raw atlas
rectangle contains neighbouring art outside the mesh. Reconstruction differs
from that rectangle in **11333 base bytes /1126 alpha**, and **25213 mask bytes
/6818 alpha**; every reconstructed byte nevertheless equals both pinned oracles.
The algorithm clears all RGBA channels outside coverage, including hidden RGB.

Camel517 is a useful second fractional witness: render y
`1802.0267333984375`, height `194.97325134277344`, offset y
`3.0267333984375`, but original rect/rounded mesh output is **138×198** with
UV source origin `(704,1799)`. Healer644 similarly has render origin
`(5735.076171875,6926.076171875)` and extent
`(35.8809700012207,87.92388153076172)`, while mesh output is **37×89**, UV origin
`(5734,6925)`. No screenshot-tuned shift or fraction-dropping special case was
added. Deriving canvas size solely from render textureRect would fail them.

For output edge coordinates the mesh-local mapping is
`canvasX = (localX-minX)*PPU`,
`canvasY = H-(localY-minY)*PPU`.
The local `(0,0)` therefore maps to `(-minX*PPU,H+minY*PPU)` below. Pixel-row
index flipping uses `H-1-y`. Keep continuous edges and pixel indices distinct.
Original normalized pivot/rect remain separate raw fields; world placement,
type-specific offsets, facing, camera, flat/lowered and building composition
are not added by this provider. These are local geometry origins, not certified
world anchors.

| Sample | Sprite path ID | Canvas W×H | Local origin in top-left canvas px | Vertices / triangles |
| --- | ---: | --- | --- | --- |
| Camel512 | 28503 | 87×211 | (35, 175) | 11 / 9 |
| Camel513 | 94552 | 141×192 | (56, 169) | 10 / 8 |
| Camel514 | 131328 | 118×188 | (49, 157) | 9 / 7 |
| Camel515 | 5945 | 53×199 | (26, 157) | 7 / 5 |
| Camel516 | 115790 | 90×215 | (53, 173) | 8 / 6 |
| Camel517 | 117735 | 138×198 | (81, 176) | 10 / 8 |
| Camel518 | 11628 | 136×203 | (81, 178) | 10 / 8 |
| Camel519 | 126030 | 64×214 | (34, 178) | 8 / 6 |
| Healer640 | 103049 | 35×85 | (15, 68) | 5 / 3 |
| Healer641 | 89408 | 27×86 | (11, 69) | 4 / 2 |
| Healer642 | 31548 | 30×99 | (14, 77) | 5 / 3 |
| Healer643 | 29188 | 29×86 | (14, 72) | 4 / 2 |
| Healer644 | 82120 | 37×89 | (16, 73) | 5 / 3 |
| Healer645 | 128467 | 28×95 | (9, 79) | 5 / 3 |
| Healer646 | 101048 | 31×86 | (10, 70) | 4 / 2 |
| Healer647 | 134777 | 30×84 | (10, 69) | 4 / 2 |
| Outpost1290 | 45812 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1291 | 60524 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1292 | 125549 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1293 | 16430 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1294 | 110530 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1295 | 9807 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1296 | 12324 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1297 | 110369 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1298 | 64361 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1299 | 88298 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1300 | 15777 | 64×149 | (32, 132.5) | 4 / 2 |
| Outpost1301 | 31660 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1302 | 92912 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1303 | 18741 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1304 | 65623 | 64×240 | (32, 223.5) | 4 / 2 |
| Outpost1305 | 106803 | 64×156 | (32, 139.5) | 4 / 2 |
| Outpost1306 | 17912 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1307 | 85029 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1308 | 16583 | 64×118 | (32, 101.5) | 4 / 2 |
| Outpost1309 | 73310 | 64×205 | (32, 188.5) | 4 / 2 |
| Outpost1310 | 73887 | 64×32 | (32, 15.5) | 4 / 2 |
| Outpost1311 | 104678 | 64×216 | (32, 199.5) | 4 / 2 |
| Outpost1312 | 90133 | 64×186 | (32, 169.5) | 4 / 2 |
| Outpost1313 | 20493 | 64×213 | (32, 196.5) | 4 / 2 |
| Outpost1314 | 61882 | 64×197 | (32, 180.5) | 4 / 2 |


Every base output above has0 differing bytes/max error0. All16 unit-mask planes
also have0 differences; outpost tiles have no paired mask under the proven route.
`results.json` records every output hash and separate base/alpha differences,
while `geometry.tsv` preserves the ordered geometry transcript.

## Source-proven paired masks and shader boundary

[spriteLoader.cs](https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs)
SpriteLoad/loadSprites explicitly load body15/body16 with makeMask=true, then
`Resources.LoadAsync<Texture>(path+"_m")`, bind `_TeamMask` and construct
Unlit/TeamColour materials/cutoffs. The AllTileSprites route calls loadSprites
without makeMask; its outpost GM entries use the plain shader route. This is
evidence for these resource pairs, not a generic suffix rule for every texture.

The consumer validates the source-bound expected references and performs **one
batched class28 exact-name lookup** with zero/one/many handling, checking all
selected pair expectations. Base Texture2D23 `body16Sprites` pairs with
Texture2D12 `body16Sprites_m`; Texture2D42 `body15Sprites` pairs with
Texture2D50 `body15Sprites_m`. Base and mask dimensions agree at8192². The
same-named Sprite69712 is never a Texture2D candidate. AllTileSprites31 has no
paired raw mask. Missing expected/ambiguous/wrong-class/wrong-index references
must fail explicitly, not choose a name-first match. Repeated per-sprite name
scans were removed from the final scratch consumer.

Masks are separate raw sampled/clipped RGBA planes; neither Sprite.alphaTexture
nor image alpha is substituted for team-mask red/green. The source-proven shader
binding is not permission to blend a chosen player colour into the extraction.
Report02's serialized shader58 Unlit/TeamColour/program3 disassembly is retained
and rehashed (`0373bd054a0f2b5c8da0d06195b6ac145fb42d4fb010a88af0ff329dbc09128e`).
Bindings are base t0/s0, mask t1/s1, cutoff CB0 byte32. Its arithmetic, before
framebuffer blending, is:

```text
q = clamp(10*(cutoff + mask.g - 1), 0, 1)
RGB = base.rgb * ((1-mask.r) + mask.r*rendererColour.rgb)
A = clamp(base.a - q*q*(3-2*q), 0, 1) * rendererColour.a
```

This is compiled shader evidence plus managed material setup, not the original
authored .shader source or a fresh GPU execution. Gamma/sRGB, sampler filtering,
edge coverage, blending, feet clipping/player colours and game screenshots remain
unverified. Foliage has its separately established shader and is outside SPR1.
No invented colour, anchor, compass-facing, flat or building policy is needed.

## Bounds, Work and cancellation

PXL2 remains the sole texture crop API, with its original16MiB output,
8192-axis,262144-block and32KiB encoded-row defaults, full layout/range checks,
per-block Work, final source checks and typed errors. Mip0 only is exercised.
One cumulative operation Work starts at256Mi units; no sprite/submesh/plane/
round resets it. Source handles stay read-only and no whole atlas is decoded.

**Scratch limitation handled explicitly:** `Work::charge` is crate-private. No
production visibility or source was changed. The external prototype keeps one
logical cumulative ledger over that same Work: remaining=`core.remaining-raster`
with checked subtraction, using the actual Work cancellation atomic. Typed
Sprite/Texture preparation finishes first. A single class-name pass and its
accounting traversal prepay two visits per indexed object, with checked
cancellation; its bounded name-I/O upper bound is reserved before the actual
class-scoped lookup. Thereafter each crop reserves its exact metadata
bytes+encoded bytes+blocks before entering PXL2, and asserts the observed debit.
Raster debits cannot be spent again by a later crop. There is no new Work per
call, forged range, private-field access or shadow decoder.

Geometry extraction/triangle/index traversal, scanline/edge/coverage visits,
pixel copies and zeroed output bytes all consume that logical allowance.
Separate cumulative raster-visit cap is64Mi visits; canvas axes<=8192, per-array
output<=16MiB, checked source/canvas bounds and finite-coordinate magnitude<=16384
are explicit. Fixed triangle edges/intersections use stack arrays. Output and
coverage use fallible reservation; at most one crop+coverage+result is live per
plane, planes emitted sequentially. The maximum possible pixel-buffer shape is
`9*W*H` bytes (two RGBA arrays plus one coverage byte), not merely returned4WH.
The bounded corpus is41 sprites, at most57 planes, at most6 rounds. Scratch
selection/oracle/log files are controlled finite evidence inputs/outputs; those
files are not a production untrusted-file API or a Work-accounted encoder.

The scratch ledger is **not proposed shipping policy**. SPR2 belongs in this
same asset crate, where private `Work::charge` is directly available. Move all
debits there and remove the ledger/reservation bridge; no public Work visibility
change or second host budget is necessary. For strict index-visit accounting,
charge/check at each entry in the existing name-lookup owner before filtering
classes, rather than shipping the scratch accounting traversal. This is a small
asset-owner correction to request alongside SPR2, not an edit made here.

Eight independently authored Pillow raster cases match byte-for-byte: fractional
coordinates, negative/outside clipping, both windings/diagonals, horizontal and
vertical degeneracy and repeated point. Additional scratch assertions exercise
exact exhaustion/shared reuse, over-limit output, cancellation before allocation,
real-atomic cancellation at raster charge12 after partial internal progress,
visit limits and ties-to-even rounding. No partial image is returned as success.
Four scratch Rust tests pass on1.88/1.98: fractional UV translation/local origin
and raw preservation; unsupported packing/base/submesh/UV contracts; signed and
foreign-index/class-scoped identity; asymmetric raw RGBA rows/alpha preservation.
No source-change, malformed parser or codec tests were duplicated: those remain
the accepted A1/PXL2 test boundary and inherited evidence from27/34.

Bounded allocation/zeroing and one OS read are not real-time cancellation
guarantees. The accepted ordinary NTFS/cooperating ReadAt/noncryptographic-stamp
limits and unexercised privileged symlink case remain. Persistent source hash
manifests/cache invalidation are not supplied by SourceStamp.

## Finite provider cost and allocation/I/O shape

**Fresh observed:** release scratch consumer, exact same inputs/rectangles,
crop validation/decode/orientation and source checks in both modes. An owned
raw-crop baseline skips only reconstruction; it runs from the same final binary
and retained-source setup. Plans/catalog preparation and output-file writes are
outside crop timers; returned-pixel allocation, read/decode, coverage/copy and
completion checks are inside. Geometry setup/catalog costs are separately part
of process wall time, not silently claimed as free.

One57-plane workload: **34246 decoded blocks,1761 contiguous encoded block-row
reads,448688 encoded bytes,2065456 returned RGBA bytes**. Core debit is491370
units =8436 metadata bytes+448688 payload bytes+34246 blocks. Reconstruction
adds3549264 units =2581820 zeroed buffer bytes+967444 loop/pixel visits.
These I/O counts are checked-plan calculations corroborated by exact successful
PXL2 Work deltas, not a new instrumented FileSource trace. Fresh independent
Pillow/source oracle reads3449 rows/607904 bytes because its literal per-triangle
copy reads overlapping rectangles; `oracle-reads.json` records every absolute
offset/length. The production-oriented consumer reads each enclosing row once.

| Measured provider scope | Raw-crop baseline | Reconstructed |
| --- | ---: | ---: |
| First timed57-plane round, ms | 193.503 | 203.287 |
| Warm full-workload median, ms | 185.255 (5 observations) | 191.1915 (10 observations) |
| Warm p95=max, ms | 185.891 | 201.603 |
| Maximum extra requested live allocation per plane, B | 112318 | 249327 |

The observed median difference is5.9365ms/about3.2% for the complete57-plane
workload; the small noninterleaved sample is not causal attribution or a portable
latency bound. Earlier exploratory samples varied in sign, so no speedup is
claimed. Allocation counters measure requested live bytes, not RSS/allocator
overhead. Sequential planes avoid retaining all57 decoded outputs. Source hashing
warms the OS cache: first means fresh-process/OS-warm, not disk-cold. No cache
flush or live app/game observation occurred. Final command/process timings and
raw per-plane/round tables are retained, not replaced by a microbenchmark.

No product runtime/draw/input path changed; the crate still has no integrated
renderer consumer. These are provider costs, **not app FPS/input latency**.
SPR2 can stay additive/background; a later host/renderer integration must retain
worker-owned scenes/latest-only queues, batching, caches/dirty invalidation and
deferred work, keep probing/hashing/decoding/per-frame IPC out of draw/input,
and compare affected interactive workloads on an owned equal-condition baseline.
Nothing here authorizes replacing those optimizations or repeating decoder work
per frame.

## Reproduction, receipts and exploration corrections

Run with explicit cwd `S:/Projects/UCP/AI-Toolkit-DE`:

```powershell
python -B S:/Projects/UCP/de-research/sprite-reconstruction-spr1/prepare.py
python -B S:/Projects/UCP/de-research/sprite-reconstruction-spr1/check.py
python -B S:/Projects/UCP/de-research/sprite-reconstruction-spr1/run.py
python -B S:/Projects/UCP/de-research/sprite-reconstruction-spr1/finalize.py
```

`check.py` formats only scratch source (skip_children), runs4 scratch tests on
current/MSRV, builds the MSRV release consumer and executes its synthetic cases,
records tool versions/tree and verifies38 actual crate hashes. `run.py` holds
resource locks/hashes, rebuilds the ordinary actual-crate consumer offline/locked,
runs current synthetic cases and three finite6-round processes, checks every
prior/fresh-source pixel, geometry/UV/index order and repeat output, then rehashes
the retained handles. It reuses R outputs on rerun; use a copied script with a
fresh named R if preserving each run separately. `checks.json` and
`supplementary-checks.json` record exact commands/cwd/environments/exits. No
ordinary Rust default or global package/tool install changes.

The fresh oracle invokes the **actual pinned** `copy_triangle`/`mask_sprite`
functions with independently read geometry and a bounded Pillow compressed-row
crop proxy. The proxy replaces whole-atlas reads only in the no-affine branch;
the fresh output independently equals each earlier full UnityPy export.
Prior metadata manifest hash is
`fdced729dd6a281807bd33741796ed497234a4ad669c2cb7c982f9badc4834ce`;
texture format/stream manifest hash is
`cd89bbc05573ee788de39403a850cce28f627ddebe0825d7e43764c99f6adcd3`.
Every reused PNG hash is checked individually before comparison. The fresh
oracle is not relabelled as an independent Unity rasterizer.

Initial source inspection requested the wrong installed helper directory
(`helpers/SpriteHelper.py`; actual `export/SpriteHelper.py`). Early preparation
assertions incorrectly assumed all UVs zero and a mask for AllTileSprites; they
failed visibly, leading to the exact source branches/pairs above before comparison
or acceptance. A supplementary cargo-tree invocation incorrectly supplied
--target-dir; final script uses tree's supported arguments and preserves
`tree-initial.log`. These were scratch setup/assumption corrections, not tuned
pixel tolerances. No source algorithm discrepancy in the selected41 remains
hidden. The source's nonzero-base/multiple-submesh/general-affine cases remain
unreviewed and refused rather than silently “fixed” against an adjusted oracle.

| R-relative artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `src/main.rs` | 32124 | `4c8ad9cb7105a9dccc65026971204b242152c38f128c56294c729219ce547918` |
| `Cargo.toml` | 268 | `272fa7189260bc3713cb3c71966f7d52162e5de1ef83abb4db27be911eb0dc9e` |
| `Cargo.lock` | 709 | `c006cda0d6fefcf0b52532cd0bd1576c0c797615c8324ab46409f2d445f4019a` |
| `selection.tsv` | 1289 | `f62faff523dc26ab8c75c37a91545a3a319c059d01e76b0491489f1d69da5f19` |
| `expected.json` | 448288 | `f0d1d0c05d9019d4af3e3dd310d208a255510ab09b474f33db28780e8a1fc90d` |
| `results.json` | 76319 | `48b6d8eae9ae0c4355628453703a7599b9db64893b10cbf9a76a8896ffad0b12` |
| `source-receipts.json` | 2898 | `b4a8ded029ddd90b5cb9c5f277f5f011fa882cb078b98f3b7688ce17a7951979` |
| `additional-sources.json` | 1260 | `116f0a0365f6199a5800cb3cb63f799202e6f758f80a59c11317fb76d6dfae6b` |
| `checks.json` | 3333 | `dc0d6643f3e0f58f67fc717f38b1cd168c4ff4749cf7bfced0fa381bcadb2c5f` |
| `supplementary-checks.json` | 5914 | `4eed213e63cbb2effa8c9ea721b7c7b4f33c2ce984e44978c047db3fd9469d26` |
| `core-preservation.json` | 5293 | `801b14712977bfa2e850ad840fd350490f5c28b6ff64c7c6afbea6d885cffc86` |
| `target/release/spr1-probe.exe` | 419840 | `2c97e7319a831cbc8f49d68516aafaece6dc65658168623693cd3cef55995ce9` |
| `target-msrv/release/spr1-probe.exe` | 437760 | `059ecf49718282ec93cbfb45c58e53670a5396b3a354c7c900462d6408868498` |


R/`final-receipt.json` additionally hashes source/tool/dependency/report inputs
and all finite evidence artifacts (excluding build intermediates), including the
final report hash. It is generated after this report to avoid self-reference.
The full Pillow HPND license is retained beside the adapted scratch rasterizer;
SPR2 must add that notice/provenance if retaining its source-derived scan
convention. Existing UnityPy/decoder notices remain intact. No game pixel,
TPK/schema dataset or oracle package is proposed for distribution.

## Smallest SPR2 handoff and explicit remaining gates

**Recommended owner:** one bounded asset-core agent owns new
`crates/de-assets-core/src/sprite_pixels.rs`, its synthetic tests, and only the
necessary module/exports/docs/notices plus shared private geometry/name-walk
corrections in that crate. Root serializes/approves those changes. No new
renderer/host/Node parser, raster library dependency, cache framework or generic
scene/provider service is needed.

A small concrete API is:

```text
StreamResolver::reconstruct_sprite_plane(
    index, sprite: ObjectKey, plane: Base | PairedRawMask,
    sprite_limits, existing_work
) -> SpritePixels
```

It internally rereads/validates the indexed Sprite and local Texture2D, retains
the actual raw metadata and source/crop identities, resolves only the proven
paired-mask resource profiles through class28 zero/one/many lookup, reuses PXL2
crop, and returns one straight RGBA8 plane plus dimensions, continuous
mesh-to-canvas mapping and reconstruction/extraction-convention revision.
Base/mask requests reuse the same private plan/raster algorithm. Missing expected
mask is an error; a source-proven unmasked family is an explicit state. Keep the
plane request separate from player-colour/cutoff/scene interpretation. Accept no
caller-mutated Sprite/Texture DTO as source authority, arbitrary file/range or
global path ID. Signed/index-scoped keys and source-stamp/decode revision survive.

Factor the existing float32 stream calculation into a **private shared geometry
helper** used by current validation and reconstruction; do not maintain the
scratch accessor as an independent production stream policy. Preserve every
validated index visit and the622M repeated-range regression while doing so.
Keep supported initial geometry to audited single-submesh XY tight masks or
integer-translation UV copies; preserve original fractional/negative metadata.
Unknown packed/rotated/affine/nonzero-base/multiple-submesh/reference/format/layout
cases remain explicit unsupported. Add checked combined crop+coverage+result
allocation planning, output/scratch/visit caps and in-crate Work/cancellation
debits before allocation/I/O; remove the scratch ledger. Batch class-name
resolution during background catalog preparation, not per plane/frame.

Promote **authored synthetic** expectations only: asymmetric RGBA/rows/alpha,
fractional rect versus mesh canvas, translation/zero-UV branches, pivots/local
origin, negative atlas offsets, exact scan edges/degeneracy/clipping, class-name
collisions/ambiguity/foreign keys, unsupported branches, shared budget and
mid/last-loop cancellation, overflow/allocation refusal and source identity.
Keep the41 real artifacts/oracle parity optional and outside Git, with this
exact identity gate. Fresh independent SPR2 review should check central pixels,
fractional examples, source-bound pairing and preserved A1/PXL2 negatives on both
Rust versions before root commits. It need not grow into a general renderer.

Remaining acceptance is explicit: Unity/game raster/sampling/shader/gamma/blend,
world-facing and placement calibration, flat/lowered substitutions, whole
Stockade/overlays, persistent source/cache/profile/window lifetime, thin host
integration and packaging, Classic regression, owned interactive performance
and isolated game observations. The41 export matches close this bounded research
question; they do not close the full authentic-rendering or DE-mode goal.

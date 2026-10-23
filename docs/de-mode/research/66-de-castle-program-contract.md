# D2: lossless DE castle program contract and bounded implementation handoff

23 October 2026. Research only. **Ready for a bounded document-domain implementation;
not game, renderer, desktop or package acceptance.** The next useful result is a real
castle open → existing program edit → Save As → reopen workflow, retaining every
unmodified byte and every operation. A final raster cannot be its document model.

Read first: [goal00](../00-goal-verbatim.md), [contract01](../01-working-contract.md),
[plan02](../02-plan.md), [standard05](../05-engineering-standard.md). Also read the
full [contract investigation01](01-contracts.md), [independent review07](07-domain-contract-review.md),
[candidate inventory19](19-acceptance-seed-inventory.md), sources.json, differences.csv,
and the performance/native-parity contracts. This report does not amend those records.
Only this report and `S:/Projects/UCP/de-research/de-castle-program-contract-d2`
were written. No children, fetch/pull/checkout, commits, product/generated changes,
installed writes, game/app/Steam/native game DLL execution, or Ghidra access.

Evidence labels: **fresh** = this assignment executed/read the named bytes;
**source-confirmed** = behavior in an exact pinned source; **inferred** = proposed
Toolkit policy/design; **unverified** = runtime or provenance still unresolved.
Fresh execution of decompiled managed source is an offline source-method probe,
not execution of the installed assembly or native importer.

## 1. Pins, source boundaries and reproducible evidence

Actual Toolkit HEAD at start and final source inspection was
`dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`, branch `de/separate-game-mode`.
The brief's `f02d828` is an ancestor, not the inspected HEAD. Concurrent core,
consumer and artifact work was present and untouched. Toolkit commands explicitly
used workdir `S:/Projects/UCP/AI-Toolkit-DE`; UCP itself is not a Git repository.

**Fresh clone inventory before source extraction; no network was needed:**

| Source | Exact inspected pin | Local checkout observation |
| --- | --- | --- |
| Serpens game/editor/parser/placement sources | develop `7e199e6f0818173794bdeeb0c4c32d74500b0eec`; main `a23aa1b32276d670ffbb2a7b641d23b500d8e298` retained | `de-research/Serpens66-Stronghold-Crusader-DE-Mods`, HEAD main pin; 15,389 absent-worktree status records in the existing no-checkout clone; read Git objects only |
| Sushi converter | `25ec0c430029fda0ef268fe7420ccb4048c9f181` | `S:/Projects/Harness/ai-toolkit-setup/reference-aive-converter`, clean |
| Script Extender | `4014ca67c96974a5e6d697665baf5351cbfebde6` | `S:/Projects/Harness/ai-toolkit-setup/research-shcde-script-extender`, clean |
| Fixes | `a90f96c176e9c8981af83534f5a8bb444838ae0a` | `de-research/runtime-loaders/shcde-fixes`, HEAD `29c9a5dd6b05b4bf62e24916c20e9bfc49ac5c6e`; 59 existing status records; no repair/checkout |

`source-receipt.json` outside Git records all 39 inputs, exact Git blobs, SHA-256,
byte lengths, paths, checkout status counts/hashes and Toolkit working-file hashes.
`collect.cjs` reads exact objects through bounded, shell-free `git show` calls and
writes byte buffers. It never uses PowerShell text redirection to copy a fixture.
Catalogue annotations are leads; no unrelated mod code is merged into Toolkit.

Important source keys (D = full develop pin above):

| Key | Pinned primary source / lines |
| --- | --- |
| G | [Game AIVLoader.cs, 4–85][game] — all declarations and `GetRawData()` |
| N | [Native importer, 48911–49387][native] — specifically 49184–49223 and 49376–49384; [offset transform, 47940–47946][mirror] |
| E | [Official-editor Frame.cs, 17–24][editor-frame]; [FrameManager.cs, 77–84][editor-manager]; [JsonReadWrite.cs, 275–377][editor-io] |
| R | [Serpens AivRawDataDecoder.cs, 31–151][reader], not the game reader; its extra validation is its own policy |
| T | [AivGridTransform.cs, 8–76][grid]; [AivWorldTransform.cs, 17–53][world]; [AivCastleProjector.cs, 27–151][projector] |
| F | [Fixes ExpandedGuardingSpotsDetours.cs, 26–124 and 575 onward][fixes]; [per-lord preference][preference] |
| S | [SE AIVEncoder.cs, 23–73][se-encoder]; [SE AIVDecoder.cs, 47–129][se-decoder] |
| C | [Sushi aivconverter.py, 462–569 and 637–788][converter] |

G blob `9b3dd0a64af8a3d0e276c375a462270958fceb06`, SHA-256
`91d10a6f34f6b70b27bdcad08ee3fe786b6e5f9309894469bbbd63bd1ff08027`.
N blob `2aee03bdea5e6728865d263f80e02bf991af9d7a`, SHA-256
`04c3f601ad9579c8137ac718e664031238e451271cf65bc8c8afa6173223ee32`.
R blob `7524e8eb262d808527fb680512a10a77235f2e9b`, SHA-256
`cdc469f634b2fcd7fb9b8655c21cc25eadb8a59f9d8374b30be04ff11d8ad276`.
Review07 already checked relevant G/N blobs equal on D/main. Their differing SE
identity records do not prove every note/runtime capture uses this SE pin.

**Fresh local read-only hashes:** managed `Assembly-CSharp.dll`, 3,693,056 bytes,
`bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789`;
native `CrusaderDE.dll`, 3,451,392 bytes,
`fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`.
Steam appmanifest still declares build `24816905`. The editor assembly's recorded
hash `3735ef057cac15c7173b3cecb12801e2b76a9a913f87dc4131419b7ad5bf1b64`
remains inherited, locally unverified provenance; it is not AIVE's executable hash.
Native C plus these pins confirms the static source association, not gameplay.

The existing lossless/session/LORD files inspected here are respectively:

```text
src/shared/lossless-json.js       20999 bytes 9c3aefc9f7bd093373746f26cacb418f7fe46814514c0f475ead6b88872a13d1
src/shared/de-document-session.js  8203 bytes 88a336504b301f7f0dc7d1ea7729df9bc122818756db338d24d5cdf6d50a450a
src/js/de-lord-format.js         12614 bytes fc9b6d33a8239fbcfde0e346a211ed20ec44d1d7471da017b9dbe08c2c88bf25
```

## 2. Exact ordered JSON and native wire contract

**Source-confirmed G:** root object has three declared members. Spelling is exact;
there is no declared schema/version field. These are C# types, not evidence for
Unity's behavior on missing, null, duplicate, fractional or exponent-spelled input.

| Scope / member | Declared type / cardinality | Required interpretation |
| --- | --- | --- |
| root `pauseDelayAmount` | signed Int32 scalar | one global pause amount; no automatic LORD timing conversion |
| root `frames` | `List<Frame>` | ordered, variable length; each entry is a build step, including empty entries retained as input |
| root `miscItems` | `List<MiscItemDefinition>` | ordered, variable length; not indexed/densified by UI order |
| frame `itemType` | signed Int32 | mapper ID, not Classic ID, enum row, troop class or draw sprite |
| frame `tilePositionOfsets` | `List<Int32>` | ordered, variable length; preserve all offsets and repeated offsets |
| frame `shouldPause` | Boolean | belongs to this frame; no coercion/default insertion |
| misc `positionOfset` | signed Int32 | local encoded position |
| misc `itemType` | signed Int32 | marker class spelling, including high forms |
| misc `number` | signed Int32 | original zero-based slot identity, independent of entry position |

Unlike LORD's fixed-prefix arrays, these AIV lists have **no declared ignored
array tail**: every frame, offset and misc entry is emitted. A policy may bound
counts, but must never trim them. Extra members/arrays at every scope remain
unknown extension data. Unknown IDs remain original numeric tokens with unknown
semantics; do not substitute 0, drop an operation, infer a footprint or use a
Classic mapping. Missing/null lists, `{}`, pause-only objects and a positive type
with `[]` are distinct preserved inputs with different diagnostics.

File coordinates are `p=100*y+x`, valid local anchors `0≤p≤9999`, `x=p%100`,
`y=floor(p/100)`. N maps a valid offset to `(x,99-y)` with
`p - 200*trunc(p/100) + 9900`. Outside that domain, the algebra is not permission
to wrap a coordinate into the grid. Generic preservation can retain any number;
an offset edit must check the proposed local coordinate exactly.

**Source-confirmed G/N:** the raw DE program is a variable-length little-endian
signed Int16 stream, with no schema/version, magic or total-length prefix added
by `GetRawData()`:

```text
pauseDelay, pauseCount, pauseWords..., frameCount,
  (single: itemType, offset | counted: -itemType, count, offsets...)...,
miscCount, (storedClass, offset, number)...
```

The first pause word is sentinel 0. JSON frame index `k` gets pause word `k+2`;
native raster cells receive build index `k+1`. These are different index domains.
The managed writer stops collecting after 50 pause words including sentinel:
49 `true` flags survive, even though every frame is still emitted. Short counters
can also wrap: a pause on JSON index 32766 produces `32768` before narrowing,
so a count limit alone is insufficient. Require every emitted pause index to fit
positive Int16 as well as the 49-frame limit for a non-lossy executable target.

Exactly one offset emits the single branch, every other offset count emits the
counted branch. N recognizes **negative**, not nonpositive, types as counted.
Consequences that the implementation must diagnose before export:

- Type 0 + one offset is a single-cell clear, updating that cell's build index.
- Type 0 + `[]` emits `[0,0]`: it becomes a clear of **file offset 0**, mapped to
  native index 9900; it is not a harmless empty frame. Some Serpens comments say
  “cell zero”; retain this coordinate-domain distinction.
- Type 0 + two or more offsets cannot be counted by `-0`; the stream is
  misinterpreted. Never split it silently, since new frame/step/pause indices result.
- Positive type + `[]` emits `[-type,0]`. The offline reader retains that empty
  step and its pause. Game construction/timing for it is unverified.
- Negative JSON frame IDs and Int16-overflowing IDs/counts can change the wire
  branch or corrupt following records. Preserve the JSON; block certified export.
- Null offsets throw in the source writer. Missing Unity fields are not tested
  by constructing typed objects in this offline probe.

The conservative executable shape requires present/unambiguous known fields,
exact decimal Int32 tokens, Boolean pause flags, nonnegative representable frame
IDs, representable counts/words and valid grid/known footprint bounds. Fractions,
exponent spelling, missing defaults and unknown semantics stay preserved but
uncertified. `-0` remains its original JSON lexeme. This is Toolkit policy, not a
claim that Unity rejects every other spelling. No universal “valid for game” bit.

Misc types **strictly greater than 9000 subtract 9000 once**, then narrow.
Examples: 9000→9000, 9001→1, 9022→22, 18022→9022. It is not modulo 9000.
BAIV cannot recover whether class 22 originally appeared as 22 or 9022. Reject
unverified class/capacity combinations for installation while keeping the input.

## 3. Ordering, timing, placement and marker compatibility

**Source-confirmed N:** frames and offsets apply in source order. Repeated writes
and later clears overwrite cell mapper and build index in the prepared grid.
N expands mapper footprints in positive imported X/Y. A size-s square covers file
columns `x..x+s-1`, rows `y-s+1..y`. Keep-related blocked areas and special building
regions extend beyond the core footprint (N 49224–49363); an anchor-only bounds
check does not certify fit. Rendering must derive views from the immutable
ordered program and an explicitly selected prefix. Saving must never reconstruct
frames from the prepared/final grid. Actual construction may use the prepared
grid and defer attempts for resources; do not promise that every overwritten
source operation becomes a visible built building.

**Inherited official documentation, report01:** a pause amount is in 50 game ticks;
100 means 5000 ticks, documented as 125 seconds. Resource waits can absorb a due
pause, and build order is an attempt order. No fresh wall-clock experiment or
Unity/game timing acceptance occurred here. Keep duration-unit/status separate
from the exact integer token, and do not apply it to LORD fields by name.

**Source-confirmed, narrower than runtime proof:** T exposes both a keep-relative
transform and `ProjectNativeFit`. The latter rotates the full 100×100 grid and
uses fixed reference file column 43 / row 56:

```text
rotation in file (x,y): 0:(x,y), 90:(99-y,x),
                       180:(99-x,99-y), 270:(y,99-x)
native-fit world:      (keepWorldX + rotatedX - 43,
                        keepWorldY - rotatedY + 56)
```

**Critical challenge:** do not recenter an imported castle on its stored keep
merely because a generalized placement helper supports that pivot. A keep at
file `(39,57)` remains displaced under the fixed-reference model. T's alternate
keep-relative API computes a different answer. This handoff records that source
distinction, not a newly verified complete native-fit or construction simulator.
Compare displacement, all four rotations and associated blocked cells to the
pinned native fit/rotation code and later isolated observations before rendering
or fit acceptance. Unknown footprints remain anchor-only/unresolved.

Gate orientation is encoded by mapper ID: pinned SE enums and T's catalogue name
144/145 `MAPPER_GATE_STONE1A/B`, 146/147 `MAPPER_GATE_STONE2A/B` (catalogue lines
87–90). The proposed fixture uses 144 and 145 at asymmetric positions. Preserve
the exact A/B IDs and offset order. A separate rotation/facing choice must not
silently swap them or invent compass labels. Game routing/orientation and final
sprite appearance remain unverified; the finite next gate probe is below.

**Source-confirmed N/F, not runtime acceptance:**

| Marker case | Vanilla | Pinned Fixes capability |
| --- | --- | --- |
| `number=9` | tenth slot at `class*10+9` | tenth slot if the class is supported |
| `number=10` | aliases next class slot 0; not an independent eleventh spot | eleventh slot only with correct hooks and per-lord capacity ≥11 |
| `number=29` | aliases `class+2`, slot 9 | thirtieth slot only with capacity 30 and supported assignment class |
| `number=30` | aliases `class+3`, slot 0; potentially outside vanilla buffer | rejected/skipped by pinned `<30` extended-store check; never a 31st supported spot |
| duplicate effective class/number | ordered last writer wins | same effective address collision must be reported; preserve every entry |

Vanilla clears 0x500 bytes = 320 Int32 positions, then writes
`buffer[class*10+number]` without the bounds policy Toolkit must impose. Being
inside that buffer does not prove the expected troop uses the address. Check
effective addresses after once-only high-form subtraction; 22 and 9022 can alias.
Negative types/numbers or unknown class IDs are not safe merely because JSON
parses or the arithmetic is finite.

Fixes allocates 30 slots per class, defaults player capacity to 10 and clamps the
per-lord `GuardingSpotsPerUnitType` to 10..30. Its reviewed assignment groups cover
6..19 and 22..28; a role-table entry for 29 is not proof that class29 follows the
same extended assignment path. Do not advertise every DE class as 30-spot capable.
The package dependency is a separate file:
`<lord>/Override/Fixes/preferences.json` containing that preference, plus verified
SE/Fixes/game versions. Never synthesize a LORD field or enable a loader from
castle parsing. Both supported and unsupported marker records stay editable raw
data; target diagnostics distinguish representation, configured capability and
observed troop assignment.

## 4. Fresh candidates, source probes and fixture proposal

**Fresh exact-Git-object candidates outside Git:**

| Candidate | Version identity and provenance limit | Inventory / exact no-op SHA-256 |
| --- | --- | --- |
| `sources/serpens-rat1.aivjson` | D; source path `Helpers/ActiveAIVDetector/BepInEx/plugins/ActiveAIVDetector_Serp/VanillaAIV/rat1.aivjson`; blob `5a1d4d35978c363d71236c048a35eba38d7f2c35` | 7857 bytes; 108 frames, 0 pauses, 7 misc; `764e2af45fd0c5a30d8889103f31e344ddaa8f96e86b1246b08beb79a6250dca` |
| `sources/serpens-nomad1.aivjson` | D; same source prefix; blob `c736e2bd92938b9fe6e58c011f6e8d3cb05b3bef` | 7875 bytes; 105 frames, 0 pauses, 10 misc; `630c946da4d5cbde3a372930c71699afb4b2d0e932fa34f986155fb948be022b` |
| `sources/fixes-SK_WOLF_1.aivjson` | Fixes exact pin; [actual public override][wolf], blob `9c84dcbf0759af9a98e13c3eb065ff91e0e482af`; adjacent [pinned metadata][fixes-info] explicitly declares supported game `2.8.0.2`, minimum SE `2.14.3`, metadata Version `1.0.0` | 43536 bytes; 441 frames, 2 pauses, 50 misc; `f986930b40f3cf5550a5037273da6c25450e93b9084450805259b82da7f68163` |

The catalogue's Fixes source annotation “1.28.1” and the source-tree metadata's
`1.0.0` are different evidence, not interchangeable verified package versions.
The Wolf candidate is commit/version-declaration identified; no claim is made
that this exact file was played on build24816905. Rat/Nomad are commit-identified;
the nearby AIC manifest's build24651686/native33aa3345 does **not** establish their
AIV export runtime version. All three parse and serialize through the actual
`lossless-json.js` byte-identically. Their parse success and public origin make
them useful candidates; proven playable requires the target/runtime observations
in section7. No third-party castle bytes were copied into Git.

The existing session also performed Rat pause 100→101, owned Save As, committed
snapshot receipt, and reopen, with exact untouched prefix/suffix equality. Result
SHA-256 `ae7528a2905c7e3f41db3d04bd84c272385ac4939fb506d0b3d0328e8621927b`.
This proves reuse of the existing byte/history/save mechanism; its current kind
is still `generic-json` with LORD diagnostics, demonstrating the interpretation
coupling rather than a finished castle workflow. No host/dialog/UI was involved.

`probe.cjs` produced **16 fresh document assertions**, plus that save/reopen
witness: three candidate no-ops, synthetic no-op, four exact scalar patches,
numeric-lexeme no-op, stale handle/revision, duplicate decoded key, overlapping
batch, byte cap, explicit unsupported structural edit, and current session/history
behavior. These supplement accepted D1/DS1 checks; they do not replace them.
An initial save witness assertion compared Buffer and Uint8Array constructors;
the probe was corrected to compare like byte views, then passed unchanged product
code. It was a probe assertion error, not a product preservation failure.

`writer-probe.ps1` compiled **exact G lines1..86 plus the outer closing brace**,
excluding all embedded game castles, and invoked the writer in memory. For the
reader it compiled R plus the exact `IsKeep` predicate and source JSON models.
Only interpolated *diagnostic string literals* were replaced by constant messages
for the available C#5 compiler; reader branches/values are unchanged. Generated
`writer-source.cs` and `reader-source.cs` remain outside Git for audit. Thus this
is a real source-method writer plus source-derived reader probe, with an explicit
compiler adaptation; it is not installed-game execution. Ordinary JSON parsing
is used only to marshal authored known fields into this probe, never to serialize
the lossless document.

| Fresh source-method case | Result |
| --- | --- |
| asymmetric ordered input | 45 Int16 words; reader retains 7 frames, 3 pauses, repeated offsets; high misc9022 becomes22 |
| 49 / 50 / 51 true flags, plus unpaused keep | 49 / 49 / 49 survive; frame counts remain50 / 51 / 52 |
| zero + multiple offsets | writer emits ambiguous stream; R rejects it |
| positive empty offsets | R retains an empty frame and its pause; no gameplay claim |
| zero + empty offsets | R returns `[0]`, proving it became a file-offset0 clear |
| negative frame type | malformed counted interpretation; R rejects this fixture |
| null offsets | writer `System.NullReferenceException` |
| misc9000/9001/9022/18022 | reader returns9000/1/22/9022; once-only rule confirmed |
| pause65535, item/offset32768 | writer emits -1/-32768; R rejects this fixture |

R additionally requires exactly one keep, nonempty frame list, valid positions,
unique pause words and no binary tail. These are **that reader's policy**, not
proof of every game requirement. It accepts marker30 structurally in the ordered
fixture: reader success therefore cannot certify Fixes assignment/capacity.
SE's different reader only warns about remaining words and collapses pause words
into a set. Neither typed reader is a lossless BAIV editor.

**Authored boundary fixture available for implementation tests:**
`asymmetric-boundary.aivjson`, 970 bytes, SHA-256
`c3ff4117a9351e5073c3973af0f83a781224c86ffd581c3f9bdd30969c0f12be`.
Its bytes are wholly authored here: BOM/CRLF, displaced keep5739, wall offsets
`[2113,2114,2113]`, gates144@3427 and145@6831, clear0@2113 then46@2113,
unknown32767 with boundary offsets9999/0, pause flags, marker9/10/29/30, effective
address collisions, duplicate unknown keys, multibyte text, `9007199254740993`,
`1e400`, `-0`, `1.2300E+02`, and extensions at root/frame/misc scope.
Expected one-cell prefix at file2113 is wall25 after frame2, clear0 after frame5,
46 after frame6; the final value alone cannot recover that history. This trace
is an authored semantic expectation limited to these single-cell operations.

Separate small negative variants are required; do not call this intentionally
incompatible boundary fixture playable. `wire-inputs.json` already supplies
49/50/51 pauses, positive-empty/zero-empty/zero-many, negative/null and narrowing
cases. Add missing/ambiguous members, late paused index32766, count32767/32768,
footprint edges and binary-tail variants in the implementer's owned tests.

Historical converter losses are deliberately not re-executed: report01's pinned
AIVE0.9.6 executable/converter hashes, input/output hashes and exact argv remain
in `de-research/contracts/converter-probe.json` and `source-converter-probe.json`.
Those observations include 5→2 markers, renumber4→1, overlap/order/extension loss,
49/51 pauses, injected keep, and `KeyError` with exit0/no output. Fresh source
inspection C/E explains why neither converter nor official editor is an oracle:
E exports only the first offset for non-path types and writes newly typed JSON;
C reconstructs Classic raster state. No new correctness gate requires replaying
their entire old survey. Any future converter test must inspect stderr, output
existence and exact payload, not exit status alone.

## 5. Authoritative model and minimum editing mechanisms

**Inferred D2 contract:** one immutable lossless CST/byte document is authoritative.
The castle overlay references revision-bound CST nodes, never an object used to
serialize the file. A useful derived view is:

```text
CastleAssessment {
  syntax, interpretation, diagnostics,
  target: {profileId, representability, capabilityStatus, runtimeAcceptance},
  program: {
    pauseDelayToken,
    frames: [{nodeId, jsonIndex, buildIndex, pauseWireIndex,
              itemTypeToken, offsetTokensInOrder, shouldPauseNode}],
    misc: [{nodeId, jsonIndex, classToken, positionToken, numberToken}]
  }
}
```

Every semantic number is backed by its original token. Known bounded values may
have a derived exact integer; unknown numbers never pass through Number just to
exist in the view. Missing/invalid/ambiguous members retain status and occurrence
spans rather than fake defaults. Empty or uninterpretable programs can still be
preserved/saved through the generic engine. Target assessment is an independent,
explicit request with a pinned policy identity; “playable” stays unverified until
observed. Ordinary preservation Save As is not blocked by install compatibility.

**D2A requires no new structural primitive.** First expose existing operations:
set present pause delay, toggle a present frame pause, change one existing offset,
change one marker's present coordinate or slot, and an explicitly selected known
mapper A/B ID change. Select by session revision + frame/offset/misc index or
revision-bound handle. Never sort/deduplicate/reindex to implement any of these.
Moving the keep changes that operation only; moving an entire program is a
different explicit batch. Moving all offsets/markers requires one atomic batch
after all bounds checks; it must preserve repeated occurrences and frame order.
Mark uncertain footprint or capability consequences without destroying data.

Add one common **scalar batch** entry point to the session if needed:
`replaceScalars(expectedRevision, edits)`; the old `replaceScalar` delegates to it.
Use `losslessJson.patch` once and publish one history entry. Independent sequential
session calls are not an atomic multi-coordinate operation. Validate complete
domain commands before publishing; wrong-type/ambiguous/stale/overflow failure
retains the prior bytes, revision, dirty state, saved snapshot and history.

**D2B, when adding/removing/reordering operations is actually assigned, earns one
new structural primitive:** revision-bound **array splice** in the existing
`lossless-json.js`, not an AIV-specific serializer or a second patch engine.
An adequate narrow API is `spliceArray(document, arrayHandle, start, deleteCount,
insertions)`, where each insertion is a retained element handle from that same
revision or bounded UTF-8 bytes containing exactly one JSON value. It returns a
new parsed revision. Clone/move a frame with its raw subtree bytes; the pause and
all extension members travel with it. A reorder is one splice over the affected
range using retained raw elements; it must not reconstruct frame objects.

Specify punctuation/trivia before implementing: retain bytes outside the minimal
edited array interval; retain each surviving/moved element's entire value slice
exactly; separators and whitespace inside the replaced interval follow one
documented deterministic rule. No-op splice/move must return original identity
and bytes. Handle insertion into `[]`, first/middle/last deletion, deletion to
`[]`, adjacent elements, multibyte trivia and moved extension subtrees. Do not
promise original separator bytes inside an explicitly restructured interval.
Reject overlapping output patches (explicit duplication may reuse input handles), stale/foreign handles, negative
or out-of-range indices and invalid insertion bytes. Check result size/depth/
node/token limits and parse/assess before publication. No object-member insertion,
whole-subtree rewrite API, JSON Patch framework or general format registry is
needed for these real consumers. A missing Boolean field stays unsupported in
D2A rather than triggering a hidden whole-program rewrite.

Reorder semantics are explicit: moving a frame moves its pause; subsequent
derived build/pause indices are recomputed from the new order. Removing a frame
removes that step and its own pause. Duplicating copies those flags/extensions.
Deleting an offset may leave a positive empty step; do not delete the whole frame
silently. Clear0 must retain exactly its explicitly authored single offset for
certified export. Changing a marker number does not renumber any neighbor.

JSON, raw BAIV, Classic `.aiv` containers, BAIC and LORDJSON remain separate formats.
This task recommends JSON editing first. Binary BAIV needs original-byte ownership,
verified offsets, noncanonical pause/sentinel/tail preservation and high/low
spelling ambiguity; decoding/re-encoding is a separate transformation. Classic
compressed sections/version200 are not this Int16 stream. `.aijson` is a Toolkit
alias only; vanilla discovery is `.aivjson`. Never feed DE through
`castleFormat.stringify/validate`, the Classic editor compactor or LORD normalization.
The existing `castle-format.js` preserves object extensions semantically but uses
JSON.stringify; it is not the accepted byte/token engine.

## 6. Earned session refactor, identity and ownership

**Fresh source finding:** `de-document-session.js` lines1–8 import LORD,
line39 calls `lord.classify`, line67 calls `lord.inspect`, line76 calls `lord.patch`.
The rest owns bytes/revisions/history/dirty/save receipts and belongs to one
format-independent engine. Current `createSession` already edits a castle as
generic JSON but reports missing LORD fields. Suppressing diagnostics in a new
castle wrapper would leave the wrong owner and two independent interpretations.

**Minimal earned move for two real consumers:**

1. Extract the existing session implementation once to
   `src/shared/document-session.js`, depending on `lossless-json.js` and one
   explicit internal interpretation function accepting an already parsed document.
   That function returns `{kind, assessment}`; it owns no bytes/history/save state.
   Parse once at the engine. Reassess before publication, including structural
   changes; remove the scalar-only assumption that recognition can never change.
2. Keep `src/shared/de-document-session.js` as the small backwards-compatible LORD
   factory/re-export. Preserve `createSession(raw, ownerId, options)`, SessionError
   identity, default history limits and every current read/result property.
   Expose a document-taking LORD classifier from `de-lord-format.js`; its existing
   byte-taking classifier delegates through the same implementation. Do not copy
   schema, interpretation or JSON parsing into the session.
3. Add `src/js/de-castle-program.js` for the ordered overlay, source-pinned
   diagnostics and commands; its castle session factory calls that same engine.
   Use explicit owned factories, not arbitrary format plugins, registry discovery
   or a second session implementation. Keep one pinned castle schema/contract
   data source if both Node/browser consumers need it; derive the browser copy
   using the existing LORD generation pattern, never handwritten parallel lists.

Preserve DS1's read/replaceScalar/undo/redo/snapshotForSave/acknowledgeSave APIs;
originalDocument/document/savedDocument, sourcePath/path/formatHint/kind/assessment;
monotonic revisions, byte equality dirty state, redo eviction, finite history
retention (32 entries/16MiB defaults), and same-value no-op identity. Preserve
call-time snapshots, reserved pending digest, edits during save, exact submitted
snapshot receipt validation, older-save acknowledgment behavior, pending `unknown`
save retention and mismatch/foreign receipt refusal. A save failure never rewrites
history or claims clean bytes. Keep LORD panel draft/refresh/undo/clean-revision
behavior and accepted DS1/Review32/panel38/43 tests unchanged. Do not make a generic
session import the panel, renderer, installation root or host IPC.

The canonical Rust backend stays opaque byte/filesystem authority. No second
Rust JSON parser, AIV validation, binary normalization or timing policy belongs
there. Current `context.rs` RawBytes carries ownerId/documentId/path/formatHint;
its extension hint currently recognizes only `lordjson` (1057–1066). The new
castle path can work with null hints: JS chooses/diagnoses content. A later host
owner may add picker/hint metadata, not parser authority.

Current real caller is `src/js/de-lord-controller.js:118`, reached through
`src/desktop/de-editor.js`; it verifies raw.ownerId against its bound context,
parses before adoption, and uses the existing prepare/adopt/finish/recovery
lifecycle. A later castle controller/route must reuse that lifecycle, including
Close commit-phase admission and unresolved adoption recovery, rather than copy
the save/close authority state machine. Root must serialize any shared-controller
extraction with53/54/60 owners after their accepted freeze. That is a cross-owner
requirement, not authorization for this report to modify those files.

Content classification/target policy stays JS domain-owned. File suffix, UI panel,
ownerId and generic resource namespace are not proof of a DE runtime version.
Track separately: authenticated owner/document pair; document revision/source
hash; requested interpretation; pinned format-policy ID; selected profile.id/
edition/detectionFingerprint; and verified managed/native/build/loader identities
needed for a compatibility claim. Current `resourceIdentity = <profile>:provider-v1`
is a namespace, not a binary probe result. Do not hash/probe per edit or frame;
obtain a bounded activation/explicit-validation witness and invalidate by owner
revision. A document containing both `lord` and `frames` must not be selected by
first-match order: show competing interpretations or require an explicit domain
choice while retaining generic preservation. `.aivjson` containing LORD is a
mismatch diagnostic, not proof to parse it as a castle. Classic windows retain
their existing providers/codecs; a DE extension must not redirect their roots.

## 7. Sequenced file ownership and acceptance gates

Proposed groups below are **future assignments for root**, not files edited here.
Avoid concurrent ownership of the lossless/session files. Prefer the first
complete JSON workflow before building unused structural or rendering machinery.

| Sequence / owner | Exact bounded file group / interface | Required review |
| --- | --- | --- |
| A: shared-document owner | extract `src/shared/document-session.js`; compatibility facade `src/shared/de-document-session.js`; small `src/js/de-lord-format.js` document-classifier addition; `tests/de-document-session.test.js` plus new generic engine tests | Independent preservation/lifecycle review against accepted DS1 APIs; LORD panel/controller regressions; no behavior-changing format work mixed into extraction |
| B: castle-domain owner, after A interface freeze | new `src/js/de-castle-program.js`, one `config/de-castle-schema.json` with source pins, focused `tests/de-castle-program.test.js`, authored `tests/fixtures/de-castle-*`; only a needed generated browser pin/generator under root-assigned ownership | Inventory/ordering/marker/capability review against G/N/F; negative and byte-slice assertions; no runtime support overclaim |
| C: structural owner, only when frame/offset/marker insertion/reorder is selected | `src/shared/lossless-json.js`, `tests/lossless-json.test.js`, focused authored structural fixtures; common session batch/transaction entry point owned by A | Failure atomicity, limits, trivia, revision/handle and exact raw-element movement review; no second codec |
| D: desktop integration owner, later root assignment | current `src/js/de-lord-controller.js` lifecycle extraction/adaptation, a castle panel/controller and `src/desktop/de-editor.js` route; `src/desktop/de-api.ts`/picker hints only if actually needed | After53/54/60 freeze: both-host real raw/adoption/save/reopen and negative authority tests; every existing LORD draft/Close behavior retained |
| E: renderer / acceptance owners | explicit later scope; no host/core/artifact61/protocol1.3 or57/64 harness changes from this report | Ordered prefix rendering, authentic DE assets, performance comparison, then isolated game construction/package observations |

Mandatory negative/roundtrip gates:

- Raw encoding/grammar/limits retain D1 coverage. All candidates and authored
  fixtures save unchanged byte-identically. Existing token edits change exactly
  selected slices; unknown numbers/duplicates/array entries/extension subtrees
  remain byte-identical. Known decoded-name ambiguity blocks semantic access,
  including escaped spellings, while unrelated unique edits remain available.
- Missing/null/wrong-type root/arrays/frame/misc/Boolean, empty/pause-only objects,
  negative and overflowing IDs/counts/positions, count32767/32768, late pause
  overflow, 49/50/51 flags, coordinates0/99/100/9999/10000 and negative values.
  Separate syntax, interpretation, representability, target capability and runtime
  statuses. No padding, sorting, scalar coercion, dense marker numbering or ID
  substitution. Extra list entries are retained; unknown extension arrays have
  no manufactured schema.
- Simultaneous scalar patches validate before publication; revision/handle/owner
  mismatch, overlapping spans, malformed insertion bytes, resource-limit and
  assessment failures leave every public state unchanged. Undo/redo restores
  exact bytes across differing lengths and structural edits; new edits evict
  redo using the existing bounded history mechanism. No-op commands do not dirty.
- Save while edits continue; failed/cancelled/unknown/mismatched/foreign receipts;
  exact unknown-save reconciliation; interrupted host adoption; old-save ack;
  owner release/Close admission/draft recovery. Both hosts must exercise the
  actual facade/controller, not only the shared primitive. Save/reopen from an
  owned destination preserves source identity separately from current path.
- BAIV versus JSON versus Classic container negative fixtures; binary sentinel,
  duplicate/out-of-order pause words and extra words must not become a claimed
  lossless reconstructed program. The JSON feature must not install/export these
  by extension/size, or normalize them through SE/Classic tools.

Ordered render/game gates stay open after parser/session acceptance:

1. Renderer tests compare the authored prefix trace before/after a clear and
   repaint, repeated offsets, identical positions in different frames, reversed
   scrub directions, pauses, empty frames and markers. A global last-clear scan
   applied to every earlier prefix is wrong: T's whole-blueprint projector uses
   such lookahead for a final projection, so do not transplant it as a timeline
   implementation. Unknown IDs show explicit gaps without dropped source nodes.
2. Verify four rotations with displaced keep, both gate mapper IDs, nontrivial
   footprints, special blocked regions and bounds. Use source-pinned native
   importer/fit/rotation expectations and independent analytic fixtures; distinguish
   raw preparation, final image and actual construction. No inferred gate facing
   or asset appearance becomes acceptance by passing a coordinate test.
3. Preserve retained worker scenes, latest-only queues, batching, caches/dirty
   invalidation, spatial indexing and deferred analysis. Parse/derive on open or
   revision change; publish small cached scene/visible-ID changes, never whole
   program/history serialization, large hashing, profile probing, decode or IPC
   in draw/input handlers. Before runtime changes, pin an owned baseline and
   compare equal scenes/camera/cache conditions for scrubs, large jumps, camera,
   marker edits and reverse sweeps: frame/input interval percentiles/peaks,
   CPU/allocation/memory and pixel/order equivalence. Microbenchmarks and the
   present offline probes provide no UI smoothness evidence.
4. Root's isolated game acceptance must pin source castle + explicit modifications,
   full package/LORD variants, game/managed/native/loader/config hashes and variant
   selection; observe actual castle attempts/construction, keep displacement,
   gates, pauses/resource waits, markers9/10/29/30 under vanilla then selected
   Fixes capacity, and save/reload. An unsupported marker30 is a negative test,
   not a request to make it playable. Retain screenshot/log/time evidence and
   unaffected Classic workflow checks. Report partial/blocked construction honestly.

Finite unresolved probes, in dependency order:

| Material unknown | Small next probe / owning boundary |
| --- | --- |
| Unity missing/null/duplicate and numeric spelling behavior | after source-domain work, a bounded isolated managed-deserializer fixture probe with exact assembly identity; no original profile writes; not a gate on generic preservation |
| Complete keep/fit and A/B gate world behavior | pin the specific native fit/rotation spans, compare the one displaced asymmetric fixture at four rotations; then one isolated construction observation per orientation under root acceptance |
| Empty/pause-only step timing and overwritten-operation construction | a minimal owned variant with one pause and wall→clear→repaint sequence, normal-resource versus resource-wait case; observe actual steps, never infer from final raster |
| Class29 expanded guarding assignment and selected capacity | inspect its exact downstream hook path once; if still unresolved, one owned loader-profile test, retaining class/slot identities; do not generalize from the role table |
| Real candidate compatibility with current installed build | use the pinned Wolf/Rat candidates as candidates and observe variant loading/construction under the accepted isolated harness; declaration2.8.0.2/neighbor AIC manifest is not proof |

No unresolved fact requires a user question before D2A. The wrong-owner risks are
the source/session coupling, using final-projection lookahead for timeline state,
and treating host/profile identity or an extension hint as game compatibility.
Root owns their implementation assignments, integration and acceptance decisions.

## 8. Reproduction, deadlines and cleanup

All artifacts below are outside Git in the assigned research directory. Run with
explicit Toolkit working directory; no command launches an application or game:

```powershell
Set-Location -LiteralPath 'S:\Projects\UCP\AI-Toolkit-DE'
node 'S:\Projects\UCP\de-research\de-castle-program-contract-d2\collect.cjs'
node 'S:\Projects\UCP\de-research\de-castle-program-contract-d2\probe.cjs'
node 'S:\Projects\UCP\de-research\de-castle-program-contract-d2\run-writer.cjs'
node 'S:\Projects\UCP\de-research\de-castle-program-contract-d2\verify.cjs'
```

`collect.cjs` has a 15s deadline per synchronous Git read and no shell/hooks/filter
execution; all returned with status0 and were reaped. The Node document probe
spawns no children. The managed probe logs exact PowerShell PID, creation time,
executable and argv in `writer-process.json`; Add-Type compiles the small source
in process/its finite compiler lifetime. Successful final run recorded no remaining
descendants after the parent exits. The probe's pre-exit child inventory can
include its transient conhost; the final receipt rechecks its PID/creation identity
after shutdown rather than treating that pre-exit inventory as a leak. The final
repeat used `run-writer.cjs`: hidden exact-PID child, 20s
deadline, signal/finally tree cleanup and an observed exit event (exit0). Its
receipt is `writer-launch-receipt.json`. No timeout or cancellation was induced.
No persistent helper/server/port was created, and no user processes
were killed. `final-verification.json` records parent PID rechecks, output/source
hashes, assertions and process shutdown. PID-only matches reused by later,
unrelated work are classified using creation time; they are never terminated.
The legacy blocked directory sweep was
not retried. These are finite completed commands; no stronger claim about forced
termination of an untested runaway helper is made.

Important outputs: `source-receipt.json`, `process-receipt.json`,
`document-probe.json`, `save-reopen-probe.json`, `writer-output.json`,
`writer-process.json`, `final-verification.json`, authored fixture/input files,
and source/compiled-source copies. Commands/results remain source-bound; no tests
of the unimplemented D2 overlay/structural primitive or UI/game are claimed.

[game]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/AIVLoader.cs#L4-L85
[native]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L48911-L49387
[mirror]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L47940-L47946
[editor-frame]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/AI-Toolkit-DE/EditorFrame.cs#L17-L24
[editor-manager]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/AI-Toolkit-DE/EditorFrameManager.cs#L77-L84
[editor-io]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/AI-Toolkit-DE/EditorJsonReadWrite.cs#L275-L377
[reader]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Helpers/AIVParser/AIVParser.Core/AivRawDataDecoder.cs#L31-L151
[grid]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Helpers/AIVParser/AIVParser.Core/AivGridTransform.cs#L8-L76
[world]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Helpers/AIVParser/AIVParser.Core/AivWorldTransform.cs#L17-L53
[projector]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/AIVPlacement/AIVPlacement.Core/AivCastleProjector.cs#L27-L151
[fixes]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Detours/ExpandedGuardingSpotsDetours.cs#L26-124
[preference]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Config/CustomLordPreferencesEntry.cs#L8
[se-encoder]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.AIVDecoder/src/SHCDESE.AIVDecoder/AIVEncoder.cs#L23-L73
[se-decoder]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.AIVDecoder/src/SHCDESE.AIVDecoder/AIVDecoder.cs#L47-L129
[converter]: https://codeberg.org/SuschisWorld/AIVConverter/src/commit/25ec0c430029fda0ef268fe7420ccb4048c9f181/aivconverter.py
[wolf]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/deps/Override/AIV/SK_WOLF_1.aivjson
[fixes-info]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/deps/info.json

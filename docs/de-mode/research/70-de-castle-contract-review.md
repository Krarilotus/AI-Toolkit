# Independent review of D2 castle contract66

23 October 2026. **GO for the next bounded D2A document-domain implementation:**
extract one shared byte/revision/history/save engine, preserve the existing LORD
factory/API, then add the ordered AIVJSON interpretation and existing-scalar
commands. No blocking wire-contract or preservation-design defect was found in
the reviewed handoff. This approves an implementation assignment, not the
unimplemented result, desktop exposure, binary export, rendering, installation
or game compatibility. The one nonblocking source-question correction below
should accompany the assignment.

Read goal00, working-contract01, plan02 and standard05 in full first, followed by
full reports66/01/07/19/10/26 and architecture23. Source inspection began at
`dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`, branch `de/separate-game-mode`.
Root subsequently made the docs-only checkpoint
`9f9ef7b5fcc1731ab43a4f70fa81f61a1a8bd90a`; fresh final inspection confirms it.
Exact working bytes, rather than either commit name alone, bind this review.
Report66 is 46,256 bytes, SHA-256
`f98098986e9178e4cefbfab60865bef700e2d19d4175f7f4679ef4311d759896`.
Concurrent F2/69 source and external64 startup work belong to their existing
owners. This review does not assess or change them. Shared disjoint reporting
is not worktree isolation.

**Evidence labels.** Fresh means this review read the exact bytes or executed
the named finite witness. Inherited means a prior source-method/runtime result
was inspected without executing it again. Unverified means actual Unity/native
execution, target compatibility or product acceptance remains open. The fresh
wire oracle is an independent JavaScript transcription checked against primary
snippets and retained source-method output. It is not execution of C#, the game
assembly, SE or the native importer. No compiler, build/generation command,
converter, GUI, native app, game, Steam, cached Ghidra/OpenSHC MCP, network,
child agents, installed write, commit, CI, PR or publication was used.

**One numbered finding and its owner.**

1. **D2-R70-01, P3, nonblocking: narrow the class29 source question.** Report66
   lines228–230 correctly avoid advertising expanded class29 support, but line569
   proposes inspecting its downstream hook path again as an unresolved source
   question. At Fixes commit
   `a90f96c176e9c8981af83534f5a8bb444838ae0a`, the class lists at lines37–49
   exclude29, `IsSupportedClass` at575 tests exactly those lists, and the actual
   get/create and movement hooks at295–296 and372–373 return to their originals
   when that predicate is false. The role-table value270 at56 does not change
   either gate. Fresh witness `once-high-marker-address-collisions-and-slots`
   extracts exactly classes6–19/22–28; fresh source reads trace both call sites.
   Source blob `58622333e9563395ce0aae0a25f920f623b67b8c`, 28,085 bytes,
   SHA-256 `8dc3afd859505008736034292ad616a4076403d53707aa358426a6c51a56292f`.
   **Action/owner:** root/contract owner should replace the repeated source-survey
   step with “this pin takes vanilla fallback for class29; expanded assignment
   is not supported by these hooks.” Castle-domain diagnostics should reflect
   that pin. Runtime behavior of vanilla class29 and future loader versions
   remains unverified. This is a tightening of the handoff, not a request to
   extend Fixes or delay D2A. [Exact hook source][fixes]

**Fresh input and provenance checks.** Local catalogue and objects were used
before any consideration of remote sources. The four existing clones were
inventoried and left unchanged through the final audit:

| Source | Exact object pin | Checkout observation |
| --- | --- | --- |
| Serpens develop | `7e199e6f0818173794bdeeb0c4c32d74500b0eec` | Existing no-checkout tree; HEAD main `a23aa1b32276d670ffbb2a7b641d23b500d8e298`; 15,389 status records |
| Sushi | `25ec0c430029fda0ef268fe7420ccb4048c9f181` | Clean at that pin |
| SE | `4014ca67c96974a5e6d697665baf5351cbfebde6` | Clean at that pin |
| Fixes | `a90f96c176e9c8981af83534f5a8bb444838ae0a` | Existing HEAD `29c9a5dd6b05b4bf62e24916c20e9bfc49ac5c6e`; 59 status records |

Twenty-three selected primary objects were freshly read with shell-free bounded
`git show`, including declarations/writer, native C, both auxiliary readers,
editor export, transforms/projector, Fixes gates, metadata and three candidates.
Their blob IDs, full hashes and lengths are retained in `fresh-inputs.json` and
`final-source-audit.json` outside Git. No dirty clone was pulled or repaired.
Status hashes use newline porcelain here; report66 used NUL porcelain, so those
two encodings' hashes are not compared. Fresh before/after comparisons use the
same options and match for all four clones.

Fresh read-only installed hashes independently match the association in66:

| Installed input | Bytes | SHA-256 |
| --- | ---: | --- |
| `Assembly-CSharp.dll` | 3,693,056 | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `CrusaderDE.dll` | 3,451,392 | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |

This review did not freshly read the Steam manifest or official-editor binary;
build24816905 and editor assembly
`3735ef057cac15c7173b3cecb12801e2b76a9a913f87dc4131419b7ad5bf1b64`
are inherited evidence, with editor provenance still locally unverified.
Hash-associated decompilation is static evidence, not gameplay proof.

The full AIVLoader source is **2,872,163 bytes**; the exact first86 lines plus
outer closing brace are **1,693 bytes** and equal the retained `writer-source.cs`
byte-for-byte. The full native C is **10,524,612 bytes**. Their fresh hashes are
respectively `91d10a6f34f6b70b27bdcad08ee3fe786b6e5f9309894469bbbd63bd1ff08027`
and `04c3f601ad9579c8137ac718e664031238e451271cf65bc8c8afa6173223ee32`.
The source-derived reader is **6,806 bytes**: fresh reconstruction confirms the
documented diagnostic-string-only compiler adaptation, exact keep predicate
and JSON models. It was audited, not compiled or run here.

**Central contract checks and independent counterexamples.**

- AIVLoader lines9–33 declare exactly `tilePositionOfsets` and `positionOfset`,
  signed Int32 fields/lists, Boolean flags and variable ordered lists. These
  declarations do not establish missing/null/duplicate/numeric-lexeme behavior
  of Unity's deserializer. There is no declared version field or ignored list
  tail. All occurrences and unknown data must remain preserved. [Declarations][game]
- Writer35–84 emits sentinel0, signed-short delay/counts/IDs/positions, pause
  words `k+2`, then every frame and misc entry. Native49184 takes the counted
  branch only for **negative** values; native49221 assigns build index `k+1`.
  Fresh four-frame asymmetric witness has exactly **27 words / 54 bytes**:
  `[137,3,0,3,4,4,61,5739,-25,3,2113,2114,2113,0,2113,46,2113,3,22,927,29,6,713,10,7,1137,0]`.
  Repeated offsets survive. Its selected cell's derived prefix trace is
  absent → mapper25/build2 → clear0/build3 → mapper46/build4. This limited
  analytic trace does not assert visible game construction. [Writer][game],
  [native branch and writes][native]
- Fresh zero/empty witnesses distinguish positive25+`[]` as `[-25,0]`,
  retaining a paused empty step, from zero+`[]` as `[0,0]`, read as one clear
  at file0. Zero+`[713,927]` produces `[0,2,713,927]`: a negative-branch reader
  reads clear@2 then type713@927 and fails on subsequent records. Splitting,
  deduplication or a `<=0` reader would change this contract. Negative JSON
  IDs, null offsets and short overflow are separate preserved/error cases.
- Fresh49/50/51 true flags retain49 pause flags in each case. Separately, a
  lone pause at JSON index32766 emits `-32768` while frame count32767 still
  fits. Counts32767/32768 narrow to32767/−32768; frame count32768 also wraps.
  Int32 typed shape and Int16 wire representability are different checks.
  For an unwrapped positive pause word, the last eligible JSON index is32765.
  These finite numeric witnesses are not executable-support maxima.
- The exact native offset expression at47945 was freshly extracted, with only
  C integer division adapted to `Math.trunc` for execution. Inputs
  `0,99,100,2113,5739,9999` give native linear indices
  `9900,9999,9800,7813,4239,99`. Thus zero-empty clears **file0/native9900**,
  not native cell0. Valid local `p=100*y+x` stays distinct from this y-flip;
  out-of-range values do not earn a wraparound edit. [Offset source][mirror]
- Misc types9000/9001/9022/18022 independently yield9000/1/22/9022. The rule is
  subtraction **once when strictly greater than9000**. Native `class*10+number`
  collides for `(6,10)/(7,0)`, `(22,29)/(24,9)`, and `(22,30)/(25,0)`;
  array position does not supply slot identity. Fixes' `<30` store and selected
  assignment classes are separate from JSON preservation and vanilla addressing.
  Unknown IDs must not acquire target support from representable arithmetic.
- The helper's fixed-reference and keep-relative transforms demonstrably differ.
  Keep file(39,57), world anchor(500,600), gives fixed-reference results
  `(496,599),(499,617),(517,614),(514,596)` across its four rotations;
  keep-relative projection places the stored keep at(500,600). These are fresh
  helper-source analytic expectations, not verified native-fit behavior.
  The source's full-blueprint last-clear lookahead must not become a prefix
  renderer. Full footprints, blocked areas and A/B gate world behavior remain
  later renderer/acceptance work. [Grid][grid], [world][world], [projector][projector]

**Evidence accounting, candidates and actual lengths.** The “12” source checks
are valid: `verify.cjs` contains **12 assertion groups across11 writer cases**,
producing10 BAIV payloads plus one null-offset writer exception. There is no
missing twelfth case. The earlier commentary's suggestion of a count correction
is withdrawn. The39 source inputs and16 document assertions belong to66's
inherited run; this review does not relabel all of them fresh.

Fresh byte reads confirm each of the10 payloads equals the retained signed-word
array and the independent writer oracle. Word counts, in retained case order,
are45/154/156/158/13/12/11/11, then a writer exception, then21/9.
In particular, `wire-ordered.baiv` is90 bytes, SHA-256
`52e8c87b8dab53cd85949941b3a55aadc2fc37c915e19fd54e0b6cde152f6ec3`.
`writer-output.json` is94,446 bytes, SHA-256
`b9345e27c97c6f426ee21466bacfd1f71c756e3f8ebd6022c02a7efac5d14105`;
`verify.cjs` is2,472 bytes, SHA-256
`0f8883f571259bcfb387e18c097f3e749d6d2087928b1f23f9f8752d0d75d349`.
Reader exceptions/acceptance remain inherited execution observations. Its exact
one-keep, position, pause and tail checks are that reader's additional policies.

All three candidates were freshly retrieved from the pinned objects and passed
actual lossless-parser no-op byte equality. Their inventory is independently
recounted below. Wire sizes are fresh **oracle calculations**, not new primary
writer execution, exported files or executable-target validation.

| Candidate | Source bytes; frames/pauses/misc; total offsets | Calculated Int16 words / bytes | Exact source SHA-256 |
| --- | --- | --- | --- |
| Serpens Rat | 7,857; 108/0/7; 219 | 395 / 790 | `764e2af45fd0c5a30d8889103f31e344ddaa8f96e86b1246b08beb79a6250dca` |
| Serpens Nomad | 7,875; 105/0/10; 224 | 379 / 758 | `630c946da4d5cbde3a372930c71699afb4b2d0e932fa34f986155fb948be022b` |
| Fixes `SK_WOLF_1` | 43,536; 441/2/50; 3,075 | 3,851 / 7,702 | `f986930b40f3cf5550a5037273da6c25450e93b9084450805259b82da7f68163` |

Candidate Git blobs match66 exactly. Rat/Nomad are genuine pinned public inputs,
with no proven AIV runtime version from the adjacent AIC manifest. The latter
declares older build24651686/native33aa3345, not the installed native hash.
Wolf's pinned `deps/info.json` declares Version1.0.0, game2.8.0.2 and minimum
SE2.14.3; this is metadata, distinct from the catalogue's1.28.1 annotation and
from observed compatibility. No candidate is called playable. Converter/editor
sources support66's rejection of either as a hidden normalizer; historical
converter execution/loss evidence was not repeated. [Wolf metadata][metadata]

The fresh authored302-byte BOM/CRLF fixture contains repeated offsets, root/
frame extensions, duplicate unknown names, multibyte text, `9007199254740993`,
`1e400`, `1e-9999`, `-0` and `1.2300E+02`. SHA-256 is
`c299c00b1bc0365265879d1647c230443c4fb7545dc2e9131b90081caede2374`.
One actual parser batch changes an offset and marker number, and only those
two token slices change. Escaped-equivalent `itemType` duplicates block lookup
with `ambiguous-path`; an unrelated unique edit preserves both. Stale handles
fail. A fresh actual DS1 Rat pause100→137 Save As/reopen writes7,857 bytes,
SHA-256 `02d25ed674cfdc493b8ffbc498130731e57e34aeaa9a9936dc6f3379b4ef3090`.
It retains sourcePath and clean saved bytes, but still reports `generic-json`
with LORD `not-lord`: this demonstrates the earned interpretation extraction,
not a finished castle route. Its receipt is synthetic filesystem evidence.

An independent400,001-byte valid JSON array fails the existing parser's
200,000-node default despite being below the8MiB raw host cap. Consequently
neither transport admission nor this small corpus establishes arbitrary-document
support, practical memory bounds, executable support or UI smoothness.

**Task-ready minimum and acceptance boundaries.** Adopt66 sections5–7 with this
specific first assignment; these are implementation conditions, not additional
defect findings:

1. Shared-document owner extracts the existing state machine once to
   `src/shared/document-session.js`, importing the existing parser and accepting
   an explicit document interpreter at the owned factory boundary. It owns
   bytes, parsing, revisions, history and save state. The interpreter owns
   `{kind,assessment}`, consumes the already parsed document and never serializes
   it. Keep `de-document-session.js` as the LORD-default compatibility facade,
   with the same `SessionError` identity, defaults, arguments and result fields.
   Add one document-taking LORD classification path; retain byte-taking public
   behavior. No format registry, plugin system, Rust parser or second DS1.
2. After that interface freezes, castle-domain owner adds the ordered overlay,
   source-pinned data and present-member scalar commands. Decimal Int32 lexical
   interpretation, unknown/ambiguous status and Int16 representability remain
   separate. Preserve partial/wrong-shape inputs and unrelated unique edits.
   Pause, one offset, marker coordinate/number, and an explicitly selected known
   mapper A/B edit suffice. Do not require complete fit simulation or install
   validation to perform preservation Save As. Do not synthesize missing fields.
3. If an assigned command changes multiple scalars, add one session batch that
   calls the existing parser patch once and publishes one history entry. Validate
   all command inputs before publication. A late stale/ambiguous/type/bounds/
   overflow/assessment failure changes no bytes, revision, saved content, dirty
   state or history. Keep original no-op identity, finite32-entry/16MiB history,
   redo eviction, edits during save, call-time snapshots, old-save acknowledgment
   and unknown-outcome receipt reconciliation. Run focused existing LORD/session/
   panel/controller regressions after extraction; this review did not rerun them.
4. Defer D2B splices until insertion/removal/reordering is actually assigned.
   Then extend the existing parser with one revision-bound array splice, exact
   surviving/moved value slices, a documented separator/trivia interval, bounded
   single-value insertion bytes, explicit duplicate reuse, stale/foreign and
   overlap rejection, final parse/limits and atomic session publication. Cover
   empty/first/middle/last/deletion-to-empty/no-op cases. Unknown duplicate members
   inside moved values remain byte-exact; semantic ambiguity still blocks the
   affected command. No object reserialization or broad JSON Patch framework.
5. Root assigns later controller/route work separately, reusing the accepted
   adoption/save/Close lifecycle and serializing against current69 work. Actual
   both-host facade tests and desktop observation belong to that integration.
   Binary BAIV, Classic conversion, renderer work, full footprint/rotation support,
   target package/install validation and game observation are later gates. They
   must not turn the next unexposed domain slice into an unrelated source survey.

Safely preserved means the supported UTF-8 grammar/resource limits retained the
original bytes and unedited tokens. Typed-interpretable means the selected,
unambiguous known members have the pinned types and exact bounded integers;
unknown semantic IDs remain unknown. Executable-target validated additionally
needs a named pinned policy, no narrowing/pause loss, verified mapper/footprint/
marker capabilities and target identities. Actual runtime acceptance still
requires isolated observation. None of those statuses may be inferred from the
filename, final raster, host resource namespace, helper reader success or source
array length.

**Remaining questions and stop boundary.** Unity missing/null/duplicate and
fraction/exponent behavior remains unverified; it is not a gate on generic
preservation. Native keep/fit/rotation and A/B gate behavior need the specific
native spans and later isolated observations. Empty/pause-only and overwritten
operation timing need a minimal resource-normal/resource-wait runtime variant.
Guard assignment/capacity and save/reload, candidate loading on the actual build,
official-editor binary provenance and media/package behavior remain with their
existing runtime/acceptance owners. Class29's source fallback at this Fixes pin
is resolved as above. No open question requires more surveying before D2A.

**Receipts and cleanup.** All Toolkit exec calls used explicit workdir
`S:/Projects/UCP/AI-Toolkit-DE`. Only this repository report was edited. Scratch
and exact source copies are under
`S:/Projects/UCP/de-research/review-de-castle-contract-d2`:

```text
fresh-inputs.json          exact objects, initial clone state and protected hashes
witness.cjs                independent finite oracle and actual parser/session calls
witness-results.json       15 fresh witness groups; no agent/helper children
final-audit.cjs            source adaptation and unchanged-input audit
final-source-audit.json    final HEAD, source lengths, evidence hashes, clone parity
cleanup-receipt.json       finite command/PID recheck; no termination actions
```

Reproduce the finite witness with
`node S:/Projects/UCP/de-research/review-de-castle-contract-d2/witness.cjs` from
the explicit Toolkit workdir. It writes only the owned scratch outputs. The
fresh audit verifies12 protected input hashes unchanged, including parser,
DS1, LORD overlay/schema/pin/tests, the5,079-byte protected fixture, Classic
castle format and performance/native-parity documents. Their final bytes match
the initial snapshot; no source staging, restoration or product mutation occurred.

The65 logged synchronous Git reads exited0 with15-second per-call deadlines;
the three successful Node processes were30588/56004/47400. A fresh process
recheck of those and all logged Git PIDs found none present. No persistent
helper/server/port was created or unrelated process stopped. The initial
collector had eight completed synchronous Git reads before a receipt-filter
error; that Node command exited1. One PowerShell quoting attempt and two scratch
witness expectation errors also exited1 and were corrected, without product
changes. The first collector was accidentally written alongside the assigned
scratch directory, then moved using verified literal paths; the old path is
absent. Details are retained in the final audit. These receipts establish finite
completed review work, not a forced-shutdown or global process-cleanup test.

[game]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/AIVLoader.cs#L9-L84
[native]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L49156-L49384
[mirror]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L47940-L47946
[fixes]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Detours/ExpandedGuardingSpotsDetours.cs#L289-373
[metadata]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/deps/info.json
[grid]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Helpers/AIVParser/AIVParser.Core/AivGridTransform.cs#L8-L76
[world]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Helpers/AIVParser/AIVParser.Core/AivWorldTransform.cs#L17-L53
[projector]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/AIVPlacement/AIVPlacement.Core/AivCastleProjector.cs#L27-L151

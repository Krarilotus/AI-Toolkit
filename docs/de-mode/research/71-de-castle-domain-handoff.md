# D2A ordered castle document domain: implementation handoff

23 October 2026. **Implemented, uncommitted and ready for root's independent
review. Domain acceptance evidence only.** The result is raw candidate castle
open -> existing ordered-program scalar edit -> owned scratch Save As -> reopen,
preserving all other bytes and operations. It is not desktop, renderer, binary
export, installation or game acceptance. Root owns architecture, integration,
review resolution and commits. This staging branch is not a new deliverable.

## Workspace, inputs and scope

All implementation/test exec calls used the genuine manually prepared Git worktree
`S:/Projects/UCP/AI-Toolkit-DE-D2A`, branch `de/castle-domain-d2a`, unchanged HEAD
`9f9ef7b5fcc1731ab43a4f70fa81f61a1a8bd90a`. Its actual Git directory is
`S:/Projects/Harness/ai-toolkit-setup/source/.git/worktrees/AI-Toolkit-DE-D2A`.
T3 remains bound to the non-Git UCP root; shell cwd does not rebind it. The
node_modules junction to main was used for tool imports only, without writes,
removal, moving or installation. Nothing was staged or committed.

Read the original main goal00/contract01/plan02/standard05 first, their staging
copies, full66 and main70, reports07/18/26/28/32/23, and relevant parser/session/
LORD sources and tests. Main plan02 contains root's newer D2A/69/64 progress;
its inspected differences were read, not overwritten with the older staging copy.
The other three canonical copies match after newline normalization. Baseline
evidence is `S:/Projects/UCP/de-research/de-castle-domain-d2a/baseline.json` and
root's `root-desktop-observation-r3/domain-worktree-baseline.json`.

Report66's main LF bytes are pinned to SHA-256
`f98098986e9178e4cefbfab60865bef700e2d19d4175f7f4679ef4311d759896`.
This worktree's expected CRLF checkout bytes differ; its normalized content
matches that pin. Raw hashes below describe this worktree, not the old main LF
hashes. They are not reported as source drift. The 5,079-byte LORD fixture and
schema remain byte-identical to the baseline.

Review70's P3 correction is adopted: Fixes at
`a90f96c176e9c8981af83534f5a8bb444838ae0a` explicitly excludes class29 from
IsSupportedClass and takes original get/create and movement hooks. The overlay
reports vanilla fallback, blocks expanded assignment claims, and keeps vanilla
runtime behavior unverified. No repeated downstream source survey was performed.

The API/owned-file freeze was reported before large edits. Only the ten files
listed in the final identity section are owned outputs. No lossless-json.js
change, structural primitive, dependency, schema/pin/generator change, format
registry, backend/IPC, desktop, renderer, Classic codec, UI, persistence or
installer change was made. Concurrent main F2/69 work was never edited. No
children/subagents, browser/Computer Use, app/game/Steam, server, generator,
package/native build, CI, PR/release, installation or commit was used. The finite
esbuild source bundle check below is tool-only output outside Git.

## One session owner and preserved LORD contract

`src/shared/document-session.js` is the only byte/revision/history/dirty/save
engine. Its factory is
`createSession(raw, ownerId, assessDocument, {historyLimits} = {})`.
The explicit internal assessment callback consumes the already parsed D1
document and returns `{kind, assessment}` with diagnostics. This is an owned
factory boundary, not plugin discovery. The engine calls losslessJson.parse
once on open and losslessJson.patch once on a real scalar batch; the patch
primitive itself performs its existing single candidate reparse.

`src/shared/de-document-session.js` is now the thin LORD factory, retaining
`createSession(raw, ownerId, options)`, its read/result shape, SessionError
identity and DEFAULT_HISTORY_LIMITS. Both domain factories re-export those same
engine objects. LORD's only internal addition is classifyDocument(document);
the existing byte-taking classify delegates to it. Pinned schema/interpretation/
target policy and existing parse/patch/create APIs are unchanged.

The engine preserves read/replaceScalar/undo/redo/snapshotForSave/acknowledgeSave
and adds `replaceScalars(expectedRevision, edits)`. replaceScalar delegates to
that batch. D1 path or revision-bound handle selections are accepted unchanged.
One successful batch is one history entry and one session revision. Reassessment
happens before publication, including undo/redo. Unsupported/thrown assessment
and any late patch failure leave bytes, revision, dirty, history, saved and
pending state intact. No-op identity and redo survive unchanged. The former
scalar-stability comment is removed: assessment owns classification and may
depend on values. This does not add container replacement; a null LORD cannot
be changed into an object by D1's existing scalar primitive.

Final self-review tightened that boundary further: kind, assessment and its
diagnostics are consumed once into the engine's interpretation record before
publication. A throwing diagnostics accessor cannot publish bytes and then fail
while constructing read(). Focused tests retain the prior complete state in
that case; ordinary immutable LORD/castle assessments use the same path.

History remains 32 entries/16 MiB of source bytes, tighten-only, including current
and redo. Original/saved/active-save documents remain separately pinned when
evicted. Dirty remains byte equality. There is no whole-history serialization,
per-read parse, per-input hash, or new heap ceiling claim. Session revisions are
monotonic and distinct from D1 branch-local revisions. Save reserves its slot
before WebCrypto, retains call-time bytes and exact snapshot identity, permits
later edits, and consumes all seven original receipt identities:
saveId/documentId/ownerId/revision/destination/sha256/byteLength. Failed and
cancelled do not mark saved; unknown retains the exact pending snapshot until
matching reconciliation. Backend ownership and write truth remain external.

## Castle API and interpretation

`src/js/de-castle-format.js` exports frozen CONTRACT, CastleError, inspect,
classify, classifyDocument and planCommand. The one shared UMD contract constant
contains exact member spellings and source pins for both browser and CommonJS;
there is no second browser inventory or generated schema in this slice.

`inspect(document, target?)` returns independent syntax, interpretation,
program, target and diagnostics. Every view references immutable CST nodes/raw
lexemes and occurrence spans, never a serialization object. Frames, offsets and
misc entries retain source order, repeated positions, empties and extensions.
jsonIndex, buildIndex (k+1) and pauseWireIndex (k+2) stay distinct. All variable
array entries transfer; there is no LORD-style ignored tail, sort, default fill,
deduplication, marker renumbering or final-raster reconstruction.

Present/unique/ambiguous/missing fields and Int32 type/spelling/overflow status
are explicit. Decimal magnitudes are checked before converting only bounded
known values to Number. Unknown numbers never become Number to exist in the
view. The original source token remains authoritative, including negative zero.

Target selection is optional and explicit:
`{policy:'vanilla', profileId?}` or
`{policy:'fixes-a90f96c', profileId?, guardingSpotsPerUnitType?:10..30}`.
Unspecified means not-assessed, not an assumed vanilla installation. Supplied
profile/config values are caller evidence, not authenticated runtime identities.
Fixes preference lives in Override/Fixes/preferences.json; no LORD field,
loader activation, guessed default or file-size limit is manufactured.

Typed shape, Int16 representability, target capability and runtime acceptance
remain separate. Diagnostics cover narrowing counts/IDs/delay/slots, exactly
0..9999 coordinates, 49 emitted pause flags plus sentinel, late index32766,
positive-empty steps, zero-empty becoming clear@file0/native9900, and invalid
zero-counted clears. Misc high forms subtract 9000 once only when >9000.
Effective-slot and vanilla class*10+number collisions are reported without
dropping entries. A pre-narrowing overflow is not presented as a native address.
Fixes assignment classes are exactly 6..19/22..28, slot<30 and explicit capacity;
class29 fallback is separately reported. Full footprints/blocked areas/mapper
semantics remain unverified, including for known A/B IDs. No target result
claims executable or playable certification. Raw Save As is always available
for parsed documents regardless of interpretation/target diagnostics.

Content kinds are de-aivjson, ambiguous-aivjson, ambiguous-document,
lordjson-candidate and generic-json; parse errors retain D1's opaque recovery.
Mixed LORD/castle signatures are explicit ambiguity in the castle factory.
Castle commands refuse that competing interpretation; generic preservation
edits/save remain possible. The retained LORD factory is an explicit domain
choice, not a newly introduced first-match format router. Extension/hint/length
never detects or converts Classic AIV, BAIV, BAIC or LORD into a castle.

`planCommand(document, command)` produces frozen existing-scalar edit plans
with document-owned handles. `de-castle-session.createSession(raw, ownerId,
{historyLimits?, target?})` uses the one engine and adds
`applyCommand(expectedRevision, command)`. Commands are:

- set-pause-delay: value.
- set-frame-pause: frameIndex, Boolean value.
- set-offset: frameIndex, offsetIndex, coordinate value.
- set-offsets: edits [{frameIndex,offsetIndex,value}, ...], one atomic batch.
- set-marker-position / set-marker-slot: miscIndex, value.
- set-item-id: explicit scope 'frame' or 'misc', index, value.

Present source members must already have their pinned scalar type. New values
are exact signed Int32 (or Boolean); coordinates additionally require 0..9999.
Int16 loss/capability consequences remain target diagnostics, not hidden clamps
on preservation editing. Missing fields are not inserted; malformed known
lexemes can still be preserved or repaired explicitly through the generic scalar
API. A marker slot change changes no neighbor. Offset batches retain repeats and
order. Structural operations are explicitly unsupported until D2B.

## Consumer integration and remaining acceptance

CommonJS/bundled consumers require the domain factory, which imports the single
engine. For browser globals, exact dependency order is:

- LORD: lossless-json -> document-session -> generated/de-lord-pin ->
  de-lord-format -> de-document-session.
- Castle: lossless-json -> document-session -> de-castle-format ->
  de-castle-session.

Both may share their first two scripts. The focused DS1 VM loader is updated;
there is no hidden embedded fallback engine. Root's later main controller/panel
VM loaders must include document-session explicitly if they manually load scripts.
The actual current F2 controller/desktop source/tests are intentionally absent
from this base and were not transplanted or run from main.

After review, root integrates into de/separate-game-mode and reuses its existing
owner/adoption/save/Close lifecycle after69 freezes. Feed authenticated raw bytes
and opaque owner/open identities to the castle factory; render ordered views,
submit explicit revision-bound commands, pass snapshot bytes unchanged to the
canonical writer and reconcile actual receipts. Adapt the shared lifecycle once;
do not copy it into a castle controller or introduce a second session. Existing
LORD controller/panel regressions at the current main bytes are an integration
gate, not claimed by this isolated domain run.

Full castle editing still includes later insertion/removal/reorder via a reviewed
D2B lossless array splice, plus actual castle UI, authentic assets, ordered prefix
rendering, complete fit/rotation/A-B gates, packages/media/game and the mode toggle.
Those full-goal requirements are not redefined away by this acceptance slice.
Unity duplicate/missing/numeric-spelling behavior, overwritten operation/empty
step timing and real candidate construction remain runtime-unverified.

## Fresh verification, limitations and failed probes

Final focused command, run with the explicit D2A workdir:

```powershell
node --test --test-reporter=tap tests/lossless-json.test.js tests/de-lord-format.test.js tests/de-document-session.test.js tests/document-session.test.js tests/de-castle-format.test.js
```

**232 passed, zero failed/skipped/cancelled**: original D1 180 + existing DS1 23
+ new generic-engine 8 + castle 21. Eight owned JS/test syntax checks and
git diff --check pass. No generator/default-helper/whole-app/full998 suite was
run. Tests exercise CJS and browser-global VM, exact LF/CRLF/BOM/multibyte bytes,
large unknown lexemes, all nine duplicate decoded known members, partial/null/
wrong shape, no-ops, wrong paths/types/owners/revisions/handles, atomic batches,
assessment refusal with pending unknown and redo, dirty/history retention, exact
save correlation, 49/50/51 pauses, late pause and count32767/32768 boundaries.
Those counts are finite cases, not executable-support maxima or UI evidence.

The authored asymmetric in-Git fixture contains displaced keep, A/B gates,
repeated walls, positive empty paused operation, clear/repaint, unknown ID,
markers9/10/29/30, class29, extensions, duplicate unknown members and large
lexemes. Its source uses BOM/LF; tests construct actual CRLF bytes independently
of checkout autocrlf and verify both variants. All scalar-command tests compare
exact selected slices. Its one-cell ordered trace is analytic test evidence,
not a new renderer or game reconstruction.

Three source-pinned candidates outside Git pass raw open, unchanged save, exact
pause-delay edit, owned filesystem Save As, synthetic unknown/committed receipt
reconciliation and reopen. Byte hashes and Git blobs are freshly recomputed and
matched to66/70. Rat/Nomad lack proven AIV runtime version; Wolf's adjacent
metadata declares game2.8.0.2/minimum SE2.14.3/Version1.0.0, which is provenance,
not observed playability on build24816905. No third-party fixture enters Git.

The combined esbuild browser bundle has one document-session input and zero
external/Node imports. Executing its actual output in a VM checks both domains,
an atomic castle batch, exact bytes/hash, unknown reconciliation and later-edit
dirty state. This does not establish host packaging or secure-context WebCrypto.

Equal-workload cost probes alternate baseline/final LORD sessions over three
runs each: a 1 MiB authored file, 64 real edits, 100 no-ops and 200 reads. Both
parse once on open; each batch invokes one patch; reads/no-ops do not assess or
hash. Both retain the same 15-entry source history plateau. A separate Wolf
441-frame/64-edit sample measures the new overlay. Finite timing/GC samples
below are not UI/FPS, worst-case work/heap bounds or game evidence.

Failed probes retained candidly: the first inline node -e baseline capture lost
quotes under PowerShell and was rerun as a literal stdin script before editing;
the initial rg glob was unsupported on Windows and the current F2 controller
files are absent from this base; one apply_patch delete/add of the same file was
rejected atomically, then applied by a direct owned-file write; the first new
test run had 24/27 passes due to PowerShell damaging authored Unicode and a test
using unknown LORD 'keep' instead of opponent_type. The fixture writer and test
expectation were corrected. No parser/session defect or failed probe is hidden
as a successful result. Earlier logs remain alongside final logs outside Git.

All evidence/heavy outputs are outside Git at
`S:/Projects/UCP/de-research/de-castle-domain-d2a`: baseline.json/before-images,
verification-results.json, focused-final.log, syntax logs, candidate-and-bundle.cjs
and results/bundle/metafile, exact scratch saves, cost-comparison.cjs and results,
cleanup-receipt.json and final-audit.json. The finite final cleanup receipt
rechecks 13 recorded Node/bundler identities: none present and no associated TCP
connections. esbuild.stop was called and its owned stdio tool exited0. Every
exec returned; no persistent server/helper, Python/Ghidra or unrelated process
was started/stopped. Final audit includes this report hash outside the report
to avoid a self-hash cycle. Root must independently review exact bytes before
integration and commit.

## Exact identities and measured receipts

The following section is generated from the retained verification receipts.
Prospective clean Git blob IDs were computed without staging/writing objects;
raw blob IDs separately identify the actual worktree bytes.

Changed/new production, test and fixture bytes (the report self-hash is in final-audit.json):

```text
src/shared/document-session.js (8765 bytes)
  raw SHA-256 5743b8218f1152b635f90630ec80888dea3b5442bd871843c22a0852fc748eae
  raw blob    2595f21d8e2edad73d462058b6a468836145e8e6
  clean blob  2595f21d8e2edad73d462058b6a468836145e8e6
src/shared/de-document-session.js (875 bytes)
  raw SHA-256 323ac265917f676c4a09d3842bccbfd3864390dea017de97744323794654dc9a
  raw blob    f46001d4d6a530822d7c62e408bb5a960e68b0e0
  clean blob  f46001d4d6a530822d7c62e408bb5a960e68b0e0
src/shared/de-castle-session.js (1499 bytes)
  raw SHA-256 a9826b9b66259e93084682aebf33344cba6d952f89002d64e703867a2b7120c2
  raw blob    3dc46cfc1139d8b6466a15b5c76ec0392407632c
  clean blob  3dc46cfc1139d8b6466a15b5c76ec0392407632c
src/js/de-castle-format.js (19707 bytes)
  raw SHA-256 e17caac3baddcda969c07ad9e22efd7b7158520d3d4f7004f8a19dea3701e9bc
  raw blob    3043ca84deed7dab9282b28e6671a5b2cd99d74f
  clean blob  3043ca84deed7dab9282b28e6671a5b2cd99d74f
src/js/de-lord-format.js (12941 bytes)
  raw SHA-256 a4755c2821a804f18a2eb1bf48f21a48ca979fc1fac7d02881759c7172c70dff
  raw blob    b9df6bf7e9067f470e3169641a6dcca28910f84b
  clean blob  4f85730301c66845ff52b620e30d4ad4c48c630e
tests/document-session.test.js (7767 bytes)
  raw SHA-256 9fea9a906df0a568d29f7c064c5236b7b42a998271fbba904a58047b199483d8
  raw blob    efb4de7b47513743d70d9f2d8567435826a53883
  clean blob  efb4de7b47513743d70d9f2d8567435826a53883
tests/de-document-session.test.js (24502 bytes)
  raw SHA-256 548239ac2687a51190312320bb760d70119bc31bd8bb3f1509dcd4af25d06757
  raw blob    ec22340dcdaaca039532c4c6f1c0234d5ecf8606
  clean blob  3b74c0edbe545acd743a305dba935b2ba942b166
tests/de-castle-format.test.js (22173 bytes)
  raw SHA-256 091dec4b3313d9bfb5c1880e6ce5dae103067d5e9cdf8ea62530560ada11401f
  raw blob    9ba9ba18feedf6234c354d489b1f35e39661496e
  clean blob  9ba9ba18feedf6234c354d489b1f35e39661496e
tests/fixtures/de-documents/asymmetric-ordered.aivjson (1186 bytes)
  raw SHA-256 8a02ef437dd176a636674b57a17100dbf332d1a41afa23318daf98e82c2909b7
  raw blob    927bceb6d4274afff0b1e685376097f574bc8d65
  clean blob  927bceb6d4274afff0b1e685376097f574bc8d65
```

Modified-file baselines, with HEAD blob IDs (CRLF worktree hashes are expected):

```text
src/shared/de-document-session.js (8347 bytes)
  raw SHA-256 94dd63eabd0737f5b3651175c73e124d267a23036be3466a3a94a48b69eebff3
  HEAD blob   c1094be469f44e496cdcbbbbe0dc175132ec5915
src/js/de-lord-format.js (12831 bytes)
  raw SHA-256 7e65ad516a164e68ffc6e15bfdc123e62c88404e5cd07e61e03bafc32b3d5f42
  HEAD blob   74648bac2d3c24e4df2d35d2dd1ebbcf9356acf1
tests/de-document-session.test.js (24468 bytes)
  raw SHA-256 3be80f62b29784b8d0bc74a89f922d0e12014efcad087df188a7042cda2f6d50
  HEAD blob   d3e555dd77088a4dce56e2693f5a627d195e1d11
```

Protected worktree inputs, unchanged raw bytes and unchanged HEAD identities:

```text
src/shared/lossless-json.js (21421 bytes)
  raw SHA-256 83298aaa79215fc0ff88d9f154eff5ca322afba34b168c7e6ca2cec0a9771568
  HEAD blob   e00150f7c4ade5efd17069a221e60e779e4142ea
config/de-lord-schema.json (33352 bytes)
  raw SHA-256 aa641b70661a67a9cd06744718a6c89267d92c595c8790f8970b2a4099dff9f4
  HEAD blob   c16dec2030568c78bbddd3f980d7ed66552eabf0
src/shared/generated/de-lord-pin.js (25481 bytes)
  raw SHA-256 bd5ad3da661d3efa003cb5c5112fa28165bfec8ee761c5a052bb1f8162345546
  HEAD blob   9a07e226d1873cfeac174b1f4562b1558efbb801
scripts/generate-de-lord-schema.mjs (3810 bytes)
  raw SHA-256 766e15fb479ee7d149d466e41fa2f75741e09788eded00974d0aa3bfd9daf3cb
  HEAD blob   9f4e59e085f4095e845db5b64c487eae2d8286ff
tests/fixtures/de-documents/complete-synthetic.lordjson (5079 bytes)
  raw SHA-256 a521106b900dea0c3aca4ed072a46ce70070716b6bc5d0f53469ce090a442c15
  HEAD blob   bfc7fce82f433704bf32b3217d54aea191127ff3
tests/lossless-json.test.js (17953 bytes)
  raw SHA-256 3b4a805156c5623cc68bcfb3f9db436e341d67ba226735c43c702222ffdae6e1
  HEAD blob   74ac33bd4c31d3fda3d8b963032e64486a293fd6
tests/de-lord-format.test.js (27687 bytes)
  raw SHA-256 1c48f6325b9aa50f2864de3afc4ddb960ea917d6e4391f5ac7a06775f5b5074d
  HEAD blob   8b401dc2713e0a7793e7272965dcd054fecde4f0
src/js/castle-format.js (3453 bytes)
  raw SHA-256 fa90d7f3319c6ec5dc43ee25cd56c4c909992bd5ef1d948ee733c12a367a85f5
  HEAD blob   4218a45c1b0d8c4f7ede600b7bec573f7fdb15fc
src/js/de-lord-panel.js (18628 bytes)
  raw SHA-256 0f6b2403fd791920a82bde57df1647c06e2808138ce79cc8cc4c87cc304f458d
  HEAD blob   c9ab322285d613698fada3c931587921ce2531dc
docs/iso-scrub-performance.md (12676 bytes)
  raw SHA-256 79cdb63a64ff68de5b36863472e2b4514ecd8b5f3af60f24953459ad66290ec7
  HEAD blob   978a4d3dc4b0f7cb469bf5ca494eace303e87bf6
docs/native-parity.md (9575 bytes)
  raw SHA-256 9705170f6d8bda74b9cbded12fedb1d81d633bb6a57324d7e9fe8aaeba249763
  HEAD blob   00559b092c43cfa83ee953b28504e9e7f515de93
docs/de-mode/research/66-de-castle-program-contract.md (46887 bytes)
  raw SHA-256 a604238621a25a672f39db0cf6cd115fc47a0162a94d509737ea96b3e72af988
  HEAD blob   b16e2b27d377ff61ca1423609db21afeb254db02
```

Candidate source receipts (copies remain outside Git under de-castle-program-contract-d2/sources):

Rat/Nomad source commit: 7e199e6f0818173794bdeeb0c4c32d74500b0eec,
Helpers/ActiveAIVDetector/BepInEx/plugins/ActiveAIVDetector_Serp/VanillaAIV/{rat1,nomad1}.aivjson.
Wolf source commit: a90f96c176e9c8981af83534f5a8bb444838ae0a, deps/Override/AIV/SK_WOLF_1.aivjson.

```text
serpens-rat1.aivjson (7857 bytes; 108 frames/7 misc/219 offsets)
  source SHA-256 764e2af45fd0c5a30d8889103f31e344ddaa8f96e86b1246b08beb79a6250dca
  source blob    5a1d4d35978c363d71236c048a35eba38d7f2c35
  pause 100 -> 101; edited 7857 bytes
  edited SHA-256 ae7528a2905c7e3f41db3d04bd84c272385ac4939fb506d0b3d0328e8621927b
serpens-nomad1.aivjson (7875 bytes; 105 frames/10 misc/224 offsets)
  source SHA-256 630c946da4d5cbde3a372930c71699afb4b2d0e932fa34f986155fb948be022b
  source blob    c736e2bd92938b9fe6e58c011f6e8d3cb05b3bef
  pause 30 -> 31; edited 7875 bytes
  edited SHA-256 ac491604c6eef24bdd94f752e3e8a482c2e5b3e01b23b28d96b1a90a48b45579
fixes-SK_WOLF_1.aivjson (43536 bytes; 441 frames/50 misc/3075 offsets)
  source SHA-256 f986930b40f3cf5550a5037273da6c25450e93b9084450805259b82da7f68163
  source blob    9c84dcbf0759af9a98e13c3eb065ff91e0e482af
  pause 30 -> 31; edited 43536 bytes
  edited SHA-256 57c687f91c76e009ad518084137f8c2d8bf7e4bd45ad2cb9c394887c4047e969
```

Final bundle: 134341 bytes, SHA-256 e4bd4a7091d135723c0df4308b65fc0e705545e4eedc27f7227a7351409b276a. One engine; zero external imports.

Final equal-workload cost input: 1048618 bytes; all LORD samples retain 15 entries/15,729,285 source bytes.

| Variant/round | Open ms | Edit median/p95/max ms | 100 no-ops ms | GC heap/ArrayBuffer/RSS deltas (bytes) |
| --- | ---: | --- | ---: | --- |
| before/0 | 10.967 | 5.622/7.591/9.292 | 0.488 | 17537696/17826521/55767040 |
| after/0 | 7.910 | 5.983/7.326/8.061 | 3.163 | 16359000/17826521/45027328 |
| after/1 | 8.220 | 5.966/7.099/8.278 | 2.520 | 16952376/17826521/38924288 |
| before/1 | 8.651 | 5.882/7.363/7.860 | 2.635 | 17316992/17826521/34725888 |
| before/2 | 8.124 | 5.935/7.531/7.935 | 2.739 | 17267656/17826521/34496512 |
| after/2 | 8.571 | 6.041/7.522/8.756 | 2.827 | 17318856/17826521/35250176 |

Final Wolf sample: open 13.908 ms; edit median/p95/max 8.449/13.746/15.335 ms; 32 entries/1393184 source bytes.
RSS/allocator samples vary with run order and garbage collection. These numbers bound only the finite recorded workloads; no broad performance or memory guarantee is inferred.

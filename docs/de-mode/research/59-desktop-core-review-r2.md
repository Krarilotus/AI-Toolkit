# Independent F2W1 core/native correction review — round 2

23 October 2026. **GO for the exact additive core/native correction in report53.
All four Review49 findings are CLOSED. No new actionable defect was found in
this bounded review.** Root owns acceptance, integration, staging and commits.
This verdict does not accept consumer60, final packages, desktop smoothness,
playable LORDJSON export or the full Classic/DE goal. Consumer review62 and
artifact refresh61 remain explicit integration requirements.

## Authority, scope and source books

Read goal00, contract01, plan02 and standard05 first, then the full frozen49 and
terminal53, initial44/45, relevant50/54/58 caller obligations, adopted23, the
C1/DS1/panel contracts and Reviews39/32/38/43, performance rationale and native
parity contracts. The user's resume supersedes the historical pause. No goal
state was changed and no child was delegated.

Every Toolkit shell command explicitly used `S:/Projects/UCP/AI-Toolkit-DE`,
branch `de/separate-game-mode`. HEAD at entry and final capture is
`dd67398ccaa7c70c9e0cbbd982cd3169dd2cceda`. Shared checkout is not worktree
isolation. Only this report was written inside Git. All probes, source copies,
fixtures, compiled research programs and receipts are under
`S:/Projects/UCP/de-research/review-first-desktop-core-f2w1-r2` (**review/**).
No production/test/generated edit, restore, Cargo/shared build, contract
regeneration, commit/push, CI/dispatch/PR/merge/release, app/game/Steam/native UI
launch, original/live profile/settings/Classic write or OpenSHC/Ghidra access
occurred. Direct rustc compiled only the small research probe outside Git.
Retained Rust test binaries were run as filtered tests, not as applications.

Independently verified report53 SHA-256:
`ca57ad8bd49acee30aa09667212b16476335b50336f46b8e81ed0c2b5325f808`.
Its `handoff-source-pins.json` is
`8ab4bc656799398b50e3d162e5ba814bc3e0e751e94a911b9f77de0d3cba4627`;
`final-verification.json` is
`3c01ad13ed43c6a40e7a6409d65d05cb63f3f83ad2b9f444edd787de032fbeca`.
Review49 remains `702b6cfdb96a07551cba99e3874e8a2363fb3f4a3718b91a0cf269e9f6d7fb64`.

`source-start.json` (18:49:52.189 UTC) and `source-final.json` (18:57:43.732 UTC)
capture all75 handoff inputs. All20 core/native input records, including the13
correction files below, match53 and remain unchanged. Protected profile, D1,
DS1, schema and optimized Classic inputs retain their pins. The three mismatches
against53 are authorized consumerR3 changes to controller, panel and controller
tests, already present at this review's first capture and stable at its final
capture. They are neither reviewed nor accepted here. No broad current75-input
or final integrated artifact match is claimed.

The old helper/ASAR/native release contain superseded consumer54. For these
core-only probes, the real630,784-byte helper, matching resource manifest/notices
and unchanged actual archived client/facade were copied or extracted into owned
scratch. All45 manifest inputs were checked against53's retained core sources,
archived consumer54 bytes or independently pinned unchanged sources; the receipt
records the exact source path used for each. Manifest sourceId was independently
recomputed. This is provenance for a frozen core witness, not acceptance of the
superseded consumer or either final host package.

Evidence labels: **observed** means executed/read here; **source-confirmed**
means established by inspected shipping source; **inherited** means earlier
pinned evidence without claiming a rerun; **unverified** remains an acceptance
gate. No Git HEAD or remote permalink substitutes for dirty physical bytes.

## Four prior findings

**F2-R1-01 / P1 — CLOSED.** Source-confirmed at `files.rs:22–70`: cleanup ownership
is acquired only after exclusive stage creation. Its guard drops the file handle
before removing an owned stage; successful rename consumes that ownership.
Stage/destination filename equality is refused before acquisition, with Windows
ASCII case insensitivity and absent-target coverage. There remains one atomic
`fs::rename`; no move-target-away interval or second DE writer was introduced.
Classic `storage.rs:79` delegates to this same writer.

Fresh actual-helper negative witness: preexisting stage sentinel, existing
stage-equals-destination using uppercase filename, absent equal destination and
rename-to-directory failure all return failed receipts while preserving unowned
bytes, previous targets and absence as appropriate. Only the two deliberately
preexisting stage names remain; failed owned stages are removed. An ordinary
replacement then preserves exact BOM/CRLF, duplicate members, large numeric
lexeme and exponent trivia. This goes beyond the inherited green writer test.
No generic hostile-filesystem confinement claim is made.

**F2-R1-02 / P2 — CLOSED.** Source-confirmed at `context.rs:257–336,990–1249`:
raw acquisition has one transient candidate per logical owner, superseded by the
next read even on failure, with no durable candidate file or lifetime document
count. One bounded owner record carries the adopted ID and one exact transition/
last receipt. Ready preserves old authority; only finish grants the installed
candidate save authority and retires the old ID. Release of a ready candidate
records terminal released status without retiring the old document. Replayed,
foreign, lost, superseded and closed document IDs do not create authority.

Fresh actual-helper observations in `helper-probes.json`:

- 160 invalid or deliberately ignored/released read replies create no durable
 candidate registration and hit no lifetime cap. Releasing an absent candidate
 is idempotent; replayed adoption is refused.
- 132 successful replacements retain exactly one owner record, maximum483 bytes.
 Retired IDs cannot save. This measures registration storage, not ledger pruning
 or total process memory.
- Owned persistence obstructions before ready and finish leave the prior durable
 bytes intact. A failed ready persistence gives the precise not-found proof;
 conflicting pairs do not. Failed finish remains ready across an actual helper
 restart. Candidate saves before finish fail.
- Orderly helper restarts before ready, after ready/release and after committed
 finish restore only the explicit original logical owner. Lost transient IDs
 do not revive; released transitions stay terminal; committed status is
 idempotent. These restart traces are not crash-during-filesystem-write tests.
- Unknown ledger states block adoption, retirement/release and Close as applicable,
 including restart and a real old-document save admitted after ready. The ledger
 fault was injected into the record of an actual successful save, then restored
 only in the owned fixture to continue the trace. This tests the recovery state,
 not an invented observation of a crash at that exact persistence instruction.
- After settled writes, Close deletes authority but retains receipts. Explicit
 restoration of its old context cannot revive the closed document. Exact8MiB
 raw Open/save succeeds;8MiB+1 Open is rejected.

Admission and retirement share the state lock through synced unknown-ledger
creation (`context.rs:1289–1339`). Finish rechecks old-document pending writes;
Close checks its captured context again under that lock (`:751–777`) before
removal, so it cannot delete a replacement owner's context. The fresh linked-core
probe queues an old Save, closes/rebinds its host owner, then executes that Save:
it returns cancelled and leaves the replacement context current. The MSRV
lifecycle selection independently passes all13 context tests, including stale
A→B→A, unknown-write protection and exact adoption recovery. Native `de_close`
returns a canonical refusal before approving OS destruction; physical OS Close
and the consumer's final edit freeze remain outside this verdict.

The four narrow lifecycle commands are Rust DTOs, with generated TS and metadata.
The inspected Rust `WRITE_OPERATIONS` equals generated `writeOperations` exactly:
adopt/finish/release are mutating; adoptionStatus is read-only. CoreClient consumes
that generated inventory. There is one Rust lifecycle owner, no JS retirement
ledger, second JSON/session model, widened128 limit or generic lease framework.

**F2-R1-03 / P2 — CLOSED.** Source-confirmed at `context.rs:424–514`, `lib.rs:106–121`,
`de_context.rs:89–99` and helper `main.rs:141–156`: owning Result consumption drops
the rejected command before scheduling. Native returns Err immediately; helper
removes the queued bookkeeping and replies immediately. Only Ok owns a command
and its reservation across spawn_blocking/the helper work queue. Queue-full
owned work is dropped, rather than retained in a refused preparation. Counting
and release remain at the one canonical reservation owner.

The fresh allocator witness links the **final** rlib
`2426e7996a78f82dd3f1adf6c9a6d6f1f31665ed5990991d7c116a22d15c46d5`,
whose hello sourceId is independently recomputed as
`7c2583f95afc56182ceb3750125621909dc5dbcbef1c2525d34235f6a90c2349`.
It exercises `prepare_operation`, not merely a counter:12 commands with5MiB
path strings yield **4 queueable Ok /8 immediate Err,20,985,996 retained allocator
bytes**, below25,165,824, then exactly0 incremental bytes after drop. This total
includes the probe's two result-vector allocations; it therefore differs slightly
from53's20,972,680. An extra refused Save drops its5MiB encoded body and preserves
all seven metadata fields with failed/preparation-budget status. The predecessor
r2 rlib was not used. This is held-preparation allocation evidence, not RSS, peak
app memory, executed Tauri UI flooding, UI latency or FPS.

A second fresh probe loads the actual archived private facade/client and kills
only its own helper at Save Started. It returns **unknown**, matching all seven
metadata fields, with exactly one submission. Explicit original restore changes
transportEpoch while retaining logical owner; reconciliation lacks a durable
record and remains unresolved. No target-byte inspection, retry or fabricated
commit supplies success. This distinguishes known preacceptance failed refusal
from lost submitted-write unknown at the actual host adapter boundary.

**F2-R1-04 / P2 — CLOSED.** Source-confirmed at native `desktop/contracts.rs:283–323`
and `desktop.rs:162–173`: `capture_classic` authenticates the supplied root once
and replaces the typed root field with captured canonical profile authority
before queuing. One root visitor covers all14 affected legacy variants and does
not serialize/copy their opaque media/document payloads. Library/map/cache
algorithms are retained.

Fresh execution of the retained compiled native test passes the exact typed
capture → owned junction A→B retarget → real native normalizer sequence for all14
variants. The original alias resolvesB afterward; every carried request still
normalizes to authenticatedA. This executes actual canonical authentication,
typed adaptation and normalization, not a Tauri handler/WebView, native UI or
real game tree. No per-operation profile hash or broader OS-attacker guarantee
is required to close this reported mutable caller-alias defect.

The nonblocking ledger-correlation observation in49 is also hardened at its
owner: queried operation ID, snapshot owner and derived operation identity are
checked before publication (`context.rs:1368–1406`). Fresh actual-helper corruption
of an owned receipt returns corrupt-operation-record; retirement fails closed
without replay. Restoring that deliberately altered fixture is a research step,
not a new shipping restoration/replay policy.

## Preservation and remaining acceptance

The correction fits the original ownership/DRY intent: one canonical byte writer,
one core document authority and durable save ledger, one admission owner and one
typed native root adaptation. The small owner-specific stage guard and two-phase
adoption earn their complexity by closing demonstrated preservation/lifetime
failures. No further abstraction or optional style cleanup is a correctness gate.

Core/native profiles retain their accepted hashes below. D1/DS1/schema and the
optimized Classic paths match their protected captures. Retained worker scenes,
latest-only queues, batching, terrain indexes, texture/geometry caches, dirty
invalidation and deferred work were not altered. Explicit lifecycle/file work
adds no draw/typing profile probe, large hash/decode or per-frame IPC. This review
supplies no interactive baseline comparison or new smoothness claim. Report53's
finite I/O samples,45's earlier DOM samples and54's synthetic comparison remain
inherited at their own source pins; actual equal-workload desktop input/paint
comparison remains root-owned.

Inherited, not rerun:53's43 current/43 MSRV tests, native6/storage4/windows3/
desktop1 and transport19; its real-Rat no-op/edit/Save As/reopen and lost-ack traces.
This review instead runs the fresh independent helper/core witnesses above,
13 retained MSRV context tests and one typed native test. Prior totals are not
added to these observations. Primary Rat pins remain commit
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`, blob
`a2018a0166ff60a5d4b9330c8ab06be795157e20`,5115-byte no-op digest
`0374107736fd1c3cf68cbe91b4fb119aea6068af69ae7e971ffe28a5e0b92642`.
Its117 fields/missing speech remain preservation evidence, not playable
certification or permission to fill absent values.

Consumer58's prior three closures and its new final-Close P2 belong to60/62;
this report neither duplicates that finding nor accepts its correction. Default
and override Electron directory packages, native portable ZIP/payload, notices,
123 permitted images and final protocol/source matching remain refresh61 work
after consumer freeze. Actual both-host window/dialog/close/recovery behavior,
Classic regressions and equal-workload interaction, plus broader DE/game
acceptance, remain open. Core-only GO does not wait for future packages or
silently waive them.

## Reproduction, failed drivers and process cleanup

All commands below use explicit cwd `S:/Projects/UCP/AI-Toolkit-DE`.
`review/run.cjs` retains exact args, program, UTC bounds, child PID/creation/
executable identities,60s deadline, exit, tracked descendants and final inventory.
No receipt is overwritten to hide a failure. Replay into a fresh scratch directory
with adapted base constants; preserve this run's fixtures and receipts.

```powershell
$r = 'S:/Projects/UCP/de-research/review-first-desktop-core-f2w1-r2'
node "$r/capture.cjs" start
node "$r/run.cjs" helper-probes node "$r/helper-probes.cjs"
node "$r/run.cjs" core-compile-r2 rustc --edition=2021 "$r/core-probes.rs" --extern 'toolkit_core=S:/Projects/UCP/de-research/fix-first-desktop-core-f2w1-r2/native-target/debug/deps/libtoolkit_core-33e4a87db9f31cd3.rlib' -L 'dependency=S:/Projects/UCP/de-research/fix-first-desktop-core-f2w1-r2/native-target/debug/deps' -o "$r/core-probes-r2.exe"
node "$r/run.cjs" core-probes-r2 "$r/core-probes-r2.exe" "$r/core-fixture-r2"
node "$r/run.cjs" native-typed 'S:/Projects/UCP/de-research/fix-first-desktop-core-f2w1-r2/native-target/debug/deps/ai_toolkit-2a75e8e2618f266c.exe' 'desktop::contracts::tests::typed_ingress_captures_all_legacy_roots_before_owned_junction_retarget' --exact --nocapture
node "$r/run.cjs" msrv-lifecycle 'S:/Projects/UCP/de-research/fix-first-desktop-core-f2w1-r2/target-msrv/debug/deps/toolkit_core-be78009dc853e0e3.exe' 'context::tests::' --test-threads=1
node "$r/run.cjs" helper-loss node "$r/helper-loss.cjs"
node "$r/capture.cjs" final
node "$r/verify.cjs"
```

One initial allocator driver asserted equality to a baseline that included its
preallocated result-vector capacities, then freed those vectors. Its meaningful
retention check passed, but that incorrect final equality failed(exit101).
The scratch correction captures baseline before allocating the vectors; the
fresh linked rerun passes, including exactly0 after-drop delta. Both compiled
executables, commands and failed/passing logs remain. Initial provenance verifier
attempts wrongly assumed all75 source copies existed, then selected current
consumerR3 against old consumer54 manifest entries. The final source book uses
retained archived bytes for superseded consumer entries and records every path;
no product source or expected hash was changed to satisfy either failure.

Ten owned helpers were reaped. The eight orderly-restart probe helpers
36744/33764/22516/37296/44192/46752/52648/52960 exit0. The intentional loss helper
44744 exits by SIGTERM; recovery helper41232 exits0. Helper receipts include their
conhost descendants, close-handle outcomes and empty post-close PID/child queries.
All compiler/test/probe wrapper receipts have empty remaining arrays, including
the failed allocator run. Final `verification.json` rechecks exact PID/creation/
executable identities and reports zero live owned processes. The native junction
test reaps both finite mklink children and removes its owned alias. No timeout,
server, watcher, browser tab, Python helper, unrelated-process termination or
blocked legacy-directory deletion occurred. No service is left running.

## Exact reviewed core/native fingerprints

These13 correction hashes match53 and both fresh source captures. The complete
20 core/native and75-input records, source copies, artifact/test-binary hashes,
all45 frozen manifest-input resolutions and evidence hashes are outside Git in
`review/source-{start,final}.json`, `artifact-pins.json` and `verification.json`.

```text
cce8550df94992d4b6d7d9d8079d5ce3fc051fd8fe0ba3a35c16d75595f531fe crates/toolkit-core/src/lib.rs
879ffa815319a165254a0d81286c32c12a479952ff6f51e735719c5f9ecbb392 crates/toolkit-core/src/contracts.rs
fb7a1ef962c0674eadc498b730d9ceae46865bfdd4cc3ae0e8f2ea88f53c6739 crates/toolkit-core/src/context.rs (52769)
f483be25cf6f44523c6c08965ea875240f4e1396a2c6efcd6a1eb15dab8a2a20 crates/toolkit-core/src/context_tests.rs
e54a26f8ed16259ff2070df09f8e8d07a6b38f4a21666da47697dc4f9b27de0c crates/toolkit-core/src/files.rs
e988a44e0460a448ee1b91b430193361615e3c221201e01477714abb68ce5249 crates/toolkit-core/examples/export-contracts.rs
b9b4a4473a4933e7466a61b074db874bf3ad957f3bf9ea769b72106f7882dbc8 crates/toolkit-host-helper/src/main.rs
37fe3badcd9b9ca96dccde255af417adbd466ddd73a7edf336cf7903504cdc52 src-tauri/src/de_context.rs
8e2a0384ade9f37a793fbb12ff8749ae8bbf20ebf636246830c7056665a9747d src-tauri/src/desktop.rs
fa4f246157f4e6faea999eb79133b491675e92501f47c33853a33665d84d1e3e src-tauri/src/desktop/contracts.rs
66fc551c82731aae4f162aa8c55d5621c404b76d82cee3ef400472a2f4b65914 src-tauri/src/windows.rs
5c2083d822bc85f9723820a4daf84de0067d615db09c8ca446c281c69885ce96 src/desktop/generated/core/types.ts
509f802b095fdca979c22e96cec3174e0c88bc248a0df70868157c54ced93ace src/desktop/generated/core/contract.json

cbdec53137e73ad4e1cd2186f7b7b1bcb199f5d93acec843f8765d1b74219c crates/toolkit-core/src/profiles.rs (protected)
cc0c0729d20d1c90044b400a0c64fef833f6878a8600857e6c54e5f36e5b50bb src-tauri/src/profiles.rs (protected)
d27303cbcb6efe4b0e9c3431bf8a0012b13a756d38bccaedfbe6d69886cbb191 interface-r2.txt
ee8d4f79e03878d26468eb12322e4f70fb4cf958f482ef0584f1c3443fee9685 combined generated contract; protocol1.3
4d22f5d669eb8ea076c5779f432f46a67b648bfe09e60d00b0c581d7717f09a1 exercised frozen helper
1f7d1584924857e23e92de69095c1101d8775c7da6ae9f8e611c9c0d79849f72 matching helper manifest
```

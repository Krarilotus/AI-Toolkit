# F1 profile/detection foundation implementation handoff

Date: 2026-10-22. **F1 correction round 3: Review17 R4 implementation;
fresh independent review is required before any F1 commit.** Original assignment
baseline was `818503dc40971defef3769ca883f82290405ab94`. This round starts at
`7f227286c6bd90f60a3ba3fd709484538efd66af` on `de/separate-game-mode`, with F1
and shared research already uncommitted. The coordinator owns planning,
synthesis, central documents, review and commits. No children were spawned.
Shared concurrent changes were left alone; no T3 worktree isolation is claimed.

Read the full goal, contract, plan, sequencing, Review05, prior handoff09,
Review11 and Review17 before editing. The concurrently added engineering
standard and working-contract amendment were also read. Shared HEAD advanced
concurrently to `b4b319fabed2d3464445b5fa567d3655f2fdf239` during handoff;
this implementer made no commits. The four source/test/fixture hashes stayed
unchanged. Hashes below identify the uncommitted correction.

## Exact owned changes

- `src/node/game-profiles.js`.
- `src-tauri/src/profiles.rs`, including its focused native tests.
- `tests/game-profiles.test.js`.
- `tests/fixtures/de-mode/foundation.json`: synthetic PE/CLR bytes,
  nineteen base installation-layout cases, 22 independent CLR/metadata mutation
  declarations, version-one metadata parity data, Unicode/BOM cases, and 27 raw
  metadata stores (23 rejected cases and four valid controls).
- This report, `docs/de-mode/research/09-profile-foundation-handoff.md`.

These are the **only five files edited in correction round 3**. The prior
`src-tauri/src/lib.rs` module declaration was already present and is untouched
this round. No dependency or ownership expansion was necessary. No service,
renderer, settings, generated TypeScript, dependency manifest or test outside
the owned files was edited.
Nothing calls the new foundation from a running application. No commit, push,
CI dispatch, PR, release, game/editor launch or installed app/game/profile write
was performed. All write tests use owned scratch directories beneath
`S:\Projects\UCP\de-research\fix-f1-r3\node-tests` and
`S:\Projects\UCP\de-research\fix-f1-r3\native-tests`; logs are in their parent
`fix-f1-r3` directory. The native target is
`S:\Projects\UCP\de-research\toolkit-native-target`.

## API and serialized contract

The Node functions are synchronous backend-only primitives. Rust provides the
equivalent snake_case API. Later host adapters must put blocking work off the UI
thread and supply owned metadata directories explicitly.

- `inspectPe(bytes)` / `inspect_pe(bytes)`: bounded DOS/COFF/optional/section/CLR
  and basic metadata-root parsing; returns machine, optional-header magic,
  managed, IL-only and 32-bit-required evidence, or no valid evidence. Managed PE32 IL-only is not
  classified as a 32-bit-only game process.
- `probeInstallation(absolutePath | null)` / `probe_installation(Option<&Path>)`:
  read-only `recognized`, `ambiguous`, `incomplete`, `unknown` or `unreadable`.
  Recognized results contain `profile`, `sourceRevision`, binary `evidence`,
  `ucpLibraryAvailable` and `versionStatus: "unknown"`. Cancellation/empty input
  returns `unknown` with `no-selection`, without any invented root.
- `profileId(edition, canonicalRoot)` / `profile_id(...)`: `gp1-` plus SHA-256 of
  edition, NUL and canonical portable root. Real filesystem canonicalization
  resolves junctions/symlinks; actual case is preserved, with normalized Windows
  drive-letter spelling. There is no unconditional path lowercasing. Display
  roots retain the alias chosen by the user, after UCP suffix normalization.
- `emptyStore()` / `empty_store()`, `validateStore(...)` / `validate_store(...)`,
  and `parseMetadata(...)` / `parse_metadata(...)`: strict bounded metadata JSON
  and version-one schema validation. `MAX_JSON_DEPTH` is 64 in both modules.
- `new ProfileRepository(existingDirectory)` / `ProfileRepository::new(...)`:
  no global application-data discovery or directory creation. `read()`,
  `compareAndSwap(expectedRevision, proposed)` / `compare_and_swap(...)`,
  `migrateLegacy(legacyFile)` / `migrate_legacy(...)`, and `recover()` share the
  on-disk protocol. Node's optional checkpoint callback and Rust's private
  checkpoint helpers exist for focused fault/process tests.

Version one stores `schemaVersion`, `revision`, `defaultProfileId`,
`selectedByEdition` and `profiles`. Each profile stores `id`, `edition`,
`canonicalRoot` and `displayRoot`. All IDs/references/editions/revisions are
validated. Existing profile root/edition identities cannot be changed or
deleted through this F1 CAS primitive. A profile's display path can change.
Unknown store/profile fields and their existing values survive subsequent CAS
writes, even when a caller omits them. This does not promise byte-preserving
rewrites of the new metadata file.

Metadata extensions intentionally allow only scalar-Unicode JSON strings/keys,
booleans, null, dense arrays, records and safe integer number literals. The
common limit is **64 simultaneously nested objects/arrays**, counted from the
JSON root (the store object counts as one). Thus a store extension may contain
63 nested containers, and an extension inside `profiles[id]` may contain 61.
Empty containers count too. Both parsers/validators enforce this domain; Rust's
parser recursion safety limit remains enabled and unchanged. Invalid UTF-8,
unpaired escaped surrogates in keys/values, unsafe integers, fractions/exponents,
negative zero and a leading UTF-8 BOM are rejected as corrupt. U+FEFF inside a
JSON string and valid surrogate pairs remain valid. Writers emit UTF-8 without
a BOM.

**Chosen duplicate policy:** reject duplicate **decoded member names at every
metadata object level**, before either parser collapses members. This includes
the root, `profiles`, individual profile/selection records, nested objects,
unknown extensions, objects within arrays and recovery manifests. Identical
values and otherwise valid duplicate values are rejected too. Literal and
escaped-equivalent names collide, including surrogate-pair spellings; names are
not case-folded or Unicode-normalized. Repeated array **values** and identical
names in distinct object scopes remain valid. Both raw preflights also inspect
every string and bound raw container nesting before the full JSON parse. Numeric,
Unicode, BOM and post-preservation/serialized-return rules remain in force.
Serde's ordinary syntax and recursion safety checks remain enabled.
This policy applies to **new metadata**, independently of the existing
read-only legacy BOM handling.

Node accepts only records with `Object.prototype` or null prototype and ordinary
`Array.prototype` dense arrays. Every record/index property must be an enumerable
own string-keyed data property. Maps, Dates, Sets, typed/boxed objects, class
instances, array subclasses, sparse/extended arrays, symbols, accessors,
nonenumerable extensions, functions, BigInts, proxies and cycles are rejected
before cloning; getters/toJSON are not invoked. Null-prototype records carry
ordinary JSON-record semantics, not prototype/alias identity.

CAS validates the original proposal, then the full snapshot **after extension
preservation**. Before changing backup/journal artifacts, it serializes and
parses that snapshot under the same domain. Node returns the parsed persisted
representation; Rust verifies its parsed serialized snapshot equals the value
it will return. Accepted JSON data is neither truncated nor discarded; a
successful result equals a subsequent successful read, including preserved
extensions. This is not a byte-preserving new-metadata writer.

This conservative metadata rule is **not** a game document codec. Legacy bytes
are never re-emitted, including unknown legacy numbers beyond JavaScript's safe
integer range. Future LORDJSON/raw-token support belongs to its separate owner.

`read` distinguishes `ready`, `missing`, `corrupt`, `future-schema`, `io-error`,
`busy` and `recovery-required`. CAS additionally returns `committed`,
`stale-revision`, `invalid-revision` or `persistence-failed` as applicable.
Malformed proposals can return `corrupt`/`future-schema`. A missing store uses
`expectedRevision: null` / `None` and initial revision zero; later commits must
increase the previous revision by exactly one. There is no blind overwrite or
implicit stale-state retry. Callers must reread and reapply their narrow change.
An unlock failure after the commit point remains `committed` with a diagnostic;
it must not falsely report that the already-written metadata failed to commit.

## Recognition boundaries

Classic requires a native PE32 x86 `Stronghold Crusader.exe` and/or
`Stronghold_Crusader_Extreme.exe`, a `gm` directory containing a `.gm1` file, and
an `aiv` directory. An unmodded Classic layout is valid. `ucp/plugins` is an
independent optional layout flag; arbitrary UCP folders cannot identify a game.
Root and lexical `ucp`/`ucp/plugins` selections converge on the same identity.
Root aliases/junctions canonicalize; a junction with an unrelated basename that
points specifically to a `ucp` suffix directory remains a conservative unknown
result (Review11 C1). No suffix-junction-alias support is claimed. A root itself
named `ucp` is recognized from its own evidence before suffix stripping.

DE requires the observed launcher, `_Data/Managed/Assembly-CSharp.dll`, and
`_Data/Plugins/x86_64/CrusaderDE.dll` paths. Launcher/engine must be native PE32+
x64; the managed assembly must contain a fully file-backed declared CLI
header directory and `cb` (minimum 72, `cb` within directory length), plus a
fully file-backed metadata RVA/size in one unambiguous section. Mapping checks
both raw and virtual section bounds and 32-bit RVA range overflow. The basic
metadata root must include BSJB, a bounded/aligned null-terminated UTF-8 version
string, flags/count fields, and room for the declared minimum stream-header
bytes. It must have IL-only and no 32-bit-required flag. These checks follow
[ECMA-335 sixth edition II.25.3.3 and II.24.2.1](https://www.ecma-international.org/wp-content/uploads/ECMA-335_6th_edition_june_2012.pdf).
No version-string whitelist, complete stream/table validation or CLR loader is
implemented. The valid synthetic managed fixture now has an actual basic root
instead of BSJB followed only by zeroes; it is still not a runnable assembly. Mixed Classic and DE markers are ambiguous even
when one side is incomplete. Neither directory name, UCP presence nor x64 PE
alone identifies the edition.

All binary versions remain unverified. `sourceRevision` hashes the ordered
binary path/content evidence plus UCP-layout presence. It is explicitly **not**
a full asset, loader, configuration or resource manifest. Replacing binary
content changes this fingerprint without changing the profile ID. Layout
recognition, including Extreme-only recognition, does not approve an existing
hardcoded Classic reader for every variant or grant DE domain capabilities.

## Cross-process protocol and recovery policy

Only `game-profiles.v1.json` and its adjacent owned artifacts are written:

1. Acquire `game-profiles.v1.json.lock` with exclusive atomic directory creation.
   Both readers and writers use it; Rust's mutexes are not involved. A competing
   Node or Rust process receives `busy`. Readers cannot cross a replacement gap.
2. Validate the current state, CAS revision and proposed metadata while holding
   the lock. Corrupt/future/I/O-failed stores cannot become empty/missing state.
3. Remove an older retained backup while the valid canonical store still
   exists. Create `.transaction`; create-new/write/fsync exact `before.json`
   (when one exists), `after.json` and a versioned SHA-256 `manifest.json`.
   Sync directories on platforms that support it.
4. Move the canonical file to `.transaction/displaced.json`. Create and fsync
   `.transaction/install.json`, then rename it to the canonical path. Retain
   both original recovery snapshots. Accepted read/write operations still hold
   the same cross-process lock throughout this gap.
5. Rename `.transaction` to `.backup`: this is the process-level commit point.
   Keep the backup files after success. Only then return `committed`. Release
   the lock once; failed release leaves a diagnostic and a fail-closed lock.

Before commitment, failures attempt restoration from the validated original
snapshot, preserving its exact bytes and default/selection. If restoration is
obstructed or artifacts are incomplete, return `recovery-required` without a
usable proposed store. No in-memory activation occurs anywhere in this module.

An explicit `recover()` under the lock rolls an interrupted `.transaction`
**back** to `before.json`, including removing a first-write candidate when no
previous file existed. A committed `.backup` may restore `after.json` only when
the canonical file is missing. Recovery validates schema, protocol and hashes
before touching canonical bytes. An unexpected external canonical edit, corrupt
recovery bytes, partial manifest or existing corrupt/future canonical store is
never silently replaced. Interrupted recovery can be retried while intact
artifacts remain; a partially deleted recovery directory fails closed for
manual inspection instead of guessing.

**Abandoned locks are never stolen automatically.** A process exit leaves its
lock and recovery files in place. An offline maintenance operator/host must
first stop and verify **all** potential writers, inspect the owned artifact
paths, remove only that abandoned empty lock directory, and then call
`recover()`. The library deliberately exposes no age-based/PID-based unsafe
unlock API. Tests reap the only synthetic writer before removing its test lock
and exercising recovery. F2 must supply an explicit maintenance/recovery user
path; automatic online crash-lock reclamation is not implemented.

Recovery bytes are fsynced. Windows Node cannot fsync directory entries; no
Windows hardware power-loss durability or hostile external-writer guarantee is
claimed. The executed tests cover process termination and local filesystem
failures. Stronger power-loss guarantees need a reviewed platform persistence
mechanism rather than calling this protocol proof against power failure.

## Legacy migration

Only a genuinely missing new store permits a legacy read. `ucpInstallation` is
read as a candidate and probed; only a recognized Classic candidate is imported.
Missing, malformed, ambiguous, DE or unavailable candidates return
`legacy-unavailable` without writing a new store. Settings, skins, configs,
browser history and caches are never rewritten/renamed/deleted.

A successful import records version-one migration provenance and the exact
legacy-byte SHA-256, while leaving `defaultProfileId: null` and
`selectedByEdition: {}`. Migration is not explicit user activation. Failed
persistence cannot activate/default anything; a successful repeat reads the
already-created new store unchanged. Concurrent initial migrations use
missing-state CAS, then reread the winner rather than overwriting it.

## Prior findings and round-three response

| Finding | Disposition at this handoff |
| --- | --- |
| Review11 R1 high: ordinary deep/Unicode/BOM proposals | Review17 independently verified ordinary proposals, wrapper accounting, accepted round-trips and BOM/scalar policy, but left R1 **partially closed** because R4 remained. Round three implements the raw-member correction below; independent verification must decide final closure. |
| Review11 R2 medium: non-JSON Node inputs change on disk | **Independently closed by Review17.** Strict pre-clone inputs and persisted-return/read equality remain unchanged and retain focused coverage. |
| Review11 R3 medium: malformed declared CLR/metadata evidence | **Independently closed by Review17.** No detection code changed this round. The 22 shared CLR mutations and prior recognition tests remain. Full CLR loading/version support remain outside F1. |
| Review17 R4 medium: duplicate collapse hides forbidden metadata | **Implemented; awaiting a fresh independent review.** Both parsers reject duplicate decoded names before a store or restoration source can authorize mutation. No self-approval or commit recommendation is made. |
| Review11 C1 low: unrelated-name suffix junction alias | **Accepted nonblocking conservative gap**, unchanged. Root aliases and ordinary lexical suffix selection retain tests; unrelated-name junctions directly to a suffix remain unknown. |
| Review17 C2 low: one contention mkdir EPERM | **Nonblocking; root cause unverified.** Preserve the original failing log and diagnose before integration if it recurs. Error mapping and contention assertions are unchanged. |

The R4 correction extends each module's existing raw-token preflight rather
than importing the game lossless document codec or adding dependencies. Each
object has a separate set of decoded names. Full JSON syntax validation still
uses JSON.parse/serde_json. The strict 64-container raw limit is checked before
collapse, and every raw string is scalar-Unicode validated. Writers still
validate proposals before artifact changes and after extension preservation,
then validate the serialized return representation.

The shared fixture contains the exact Review17 overshadowed-high-surrogate
source (UTF-8 SHA-256
`e41df2e6e9fe12437931d74d424c604a3966ad930af9d03ca7d02bc32bfdfb45`),
overshadowed low-surrogate/key values, 65- and 130-container object/array
branches, ordinary/identical duplicate controls with expected rejection,
escaped-equivalent root/profile/selection/extension names, duplicate profile-map
identities, nested profile extensions and array-contained objects. Empty,
prototype-shaped, emoji, quote/backslash names are covered. Four positive
controls retain repeated array values, separate object scopes, punctuation in
string values, case distinctions and distinct Unicode normalization forms.

For each raw store, both backends check parsing and read/migration status with
and without a pre-existing retained backup. Every rejected read, CAS and
migration leaves exact source bytes and the complete artifact inventory
unchanged. Migration is exercised with a genuinely valid synthetic Classic
legacy candidate, not merely an unavailable path. Valid controls also commit
in native, cross-read in Node and retain committed-return/read equality. The
prior genuinely-missing-only inactive migration tests remain intact.

The recovery regression explicitly constructs **pre-existing/external legacy
journals** with valid SHA-256 manifests. These are not output of the corrected
writer, which now refuses such originals. For all 23 rejected raw stores,
pending displaced-state transactions use malformed `before.json` as rollback
authority; missing-canonical committed backups use malformed `after.json` as
restoration authority. Node/native read, recover, CAS and migration fail closed,
retain every snapshot, displaced byte, manifest and pre-existing restore
sentinel, and leave canonical missing. Repeated cross-backend recovery attempts
agree. This includes the exact interrupted-original-surrogate R4 regression.
Escaped-equivalent duplicate names in otherwise valid recovery manifests also
fail closed in both backends. Current-writer actual process-exit recovery tests
on **valid** metadata still run at prepared/displaced/installed checkpoints;
they were not replaced by the constructed legacy fixtures.

C2's original first native review run had **22 passed, 1 failed** (Node mkdir
EPERM); its full rerun passed **23/23**, then five exact contention runs each
passed **1/1**. The preserved original file is
`S:\Projects\UCP\de-research\review-f1-r2\native-focused.log`, SHA-256
`cd7d076d8318a5437ebdf6b5b16becbf4060534850eabd10d063146a975033f6`.
This round's single native focused run passes **26/26**, including the
32-revision competing-writer case; the anomaly did not recur. A test-only
failure branch now prints bounded lock/store metadata and at most eight lock
entries if a child naturally fails. It never converts permission failures to
busy, changes retries or relaxes assertions. That diagnostic branch was not
triggered here; no Windows deletion-pending or other cause is established.
No stress project or extra contention reruns were performed.

## Focused checks actually executed

Every Toolkit command used explicit workdir
`S:\Projects\UCP\AI-Toolkit-DE`. Only owned synthetic test directories and
the external native target were written. No dependency installation, full-suite
check, CI/workflow, desktop bundle rebuild or GUI/game launch ran; the prepared
desktop bundle/dependencies were used.

```powershell
node --check src/node/game-profiles.js
node --check tests/game-profiles.test.js
rustfmt --edition 2021 src-tauri/src/profiles.rs
rustfmt --edition 2021 --check src-tauri/src/profiles.rs
git diff --check -- src/node/game-profiles.js src-tauri/src/profiles.rs tests/game-profiles.test.js tests/fixtures/de-mode/foundation.json docs/de-mode/research/09-profile-foundation-handoff.md
$env:AI_TOOLKIT_PROFILE_TEST_ROOT = 'S:\Projects\UCP\de-research\fix-f1-r3\node-tests'
node --test --test-reporter=spec tests/game-profiles.test.js
$env:AI_TOOLKIT_PROFILE_TEST_ROOT = 'S:\Projects\UCP\de-research\fix-f1-r3\native-tests'
$env:CARGO_TARGET_DIR = 'S:\Projects\UCP\de-research\toolkit-native-target'
cargo test --manifest-path src-tauri/Cargo.toml --lib --locked profiles:: --no-fail-fast
```

Final focused results, each suite run once: **97/97 Node tests passed**, zero
failed/cancelled/skipped; **26/26 native tests passed**, zero failed/ignored,
78 unrelated tests filtered. Node's count includes 19 nested base-layout, 22
nested CLR-mutation and 27 nested raw-metadata cases. Native includes the
conditional/no-op subprocess harness. These counts are not feature acceptance.
Syntax and own-file Rust formatting pass. `git diff --check` checks tracked
owned paths; an additional explicit five-file scan covers these new untracked
files for trailing whitespace and conflict markers and parses the fixture JSON.
No broad formatter was run. The focused suites ran concurrently with separate
owned Node/native test bases.

Logs outside Git:

- `S:\Projects\UCP\de-research\fix-f1-r3\node-focused.log`
- `S:\Projects\UCP\de-research\fix-f1-r3\native-focused.log`
- `S:\Projects\UCP\de-research\fix-f1-r3\validation.log`

All prior positive transaction/crash/unknown-field/legacy tests remain:
stale CAS, 32-update competing writers, sharing denial, failed create/rename,
rollback obstruction, external canonical edits, retained-backup restoration,
failed unlock and actual valid-metadata process exits. Exact legacy bytes and
inactive migration/defaults remain unchanged. Offline abandoned-lock maintenance
is still required; hardware power-loss durability is unclaimed.

## Correction snapshot hashes

SHA-256 values identify this uncommitted round-three source, not a remote commit.

| Owned source/test/fixture | SHA-256 |
| --- | --- |
| `src/node/game-profiles.js` | `6a6c7bebf4971d5e4279abfdbcc622b08fb5c6f0959826948927cef6af3c7711` |
| `src-tauri/src/profiles.rs` | `d5e82966ce93d819bb5a96cb8d9d5e404fcf707f7c6f6807792df4a583f7363f` |
| `tests/game-profiles.test.js` | `7f8825b45a5ac24ac15cb48c8deeea4bb7ef433f57095af1b102bb7761187de0` |
| `tests/fixtures/de-mode/foundation.json` | `464a6e35affc056eefc68c50e7e1dfbd1b7649f57d1c6d71c335e86c40cc61f1` |

Focused native executable
`S:\Projects\UCP\de-research\toolkit-native-target\debug\deps\ai_toolkit-a11e2abf0855483c.exe`
SHA-256: `77cb3afef729871c344cc1975c6b34d57388ff92acca8130405f7a2d5802efb8`.
The unchanged prior `src-tauri/src/lib.rs` declaration was not edited. The final
five-file manifest (including this report's hash), executable and log hashes
are outside Git at `S:\Projects\UCP\de-research\fix-f1-r3\final-hashes.json`.
Pre-round owned-file copies and the preserved C2 log hash are in the same
scratch directory; no prior-review log was overwritten.

## F2 review handoff and limits

A fresh independent round must verify Review17 R4 and decide the remaining
Review11 R1 closure before F1 commit. Review raw decoded-name uniqueness,
Unicode/depth boundaries, valid repeated arrays, exact-source/artifact retention
on rejected reads/CAS/migration, both restoration-source directions and the
explicit legacy interrupted-original regression. Check that the game lossless
codec, strict input/serialized-return guarantees, detection and actual
valid-metadata crash/recovery behavior are unchanged. Prior R2/R3 closure and
C1 acceptance come from Review17; this implementation grants no self-approval.
Keep C2's original failure record and unverified cause visible for pre-integration
diagnosis without an unbounded stress loop. Passing these tests is not feature
or game acceptance.

F2 still owns host-authenticated immutable window contexts, epochs/generations,
window-owned probe/prepared-token registries, source revalidation, operation
leases and queued-work capture. A serialized profile is metadata, not authority
to invoke game services. CAS alone must not be exposed as a renderer-initiated
activation API. Only explicit activation may transactionally update both saved
preferences; startup, inheritance, focus and close must not do so. The host must
bind/adopt only a committed result and handle an uncertain/lost IPC response
with its own request-id contract.

Migration still records a source-byte hash/status, not an authoritative startup
candidate profile ID. F2 must define reliable candidate provenance and revalidate
it before startup binding; it must not guess from an arbitrary sole profile or
turn startup into explicit activation. This correction does not change that
migration schema or extend into startup/default policy.

F2/F3 also own typed IPC and generated bindings, resource/config revision
manifests, cache namespaces, actual legacy adapters, copy-on-missing browser
domain migration (including partial localStorage failure), startup readiness,
freeze/drain/unsaved/adoption rollback, and stale-response guards. No browser
storage migration or window switching is implemented here. Detection has no
edition-version support registry; every DE operation remains unavailable until
its independent domain/asset/package gates pass. No full regression suite,
native/Electron GUI picker test, game-backed plain-Classic detection, real-game
launch, isolated package loading or power-failure test was performed by this
implementation subtask.

# Independent F1 profile foundation code review — round 2

Date: 2026-10-22. Owned output: `docs/de-mode/research/17-profile-foundation-review-r2.md`.

**NO-GO for COMMIT of this unexposed F1 snapshot.** The ordinary writer failures from Review11 are corrected: supported in-memory proposals round-trip at the depth boundary, Node rejects the tested non-JSON inputs before coercion, and malformed declared CLI/metadata ranges are rejected. One medium blocker remains in the common metadata read domain: duplicate members can hide forbidden Unicode or excessive nesting from Node validation, while native parsing rejects the same bytes. A focused process-exit probe also demonstrates backend-dependent rollback of such a Node-accepted original store. Resolve R4 below, then obtain a fresh independent review. The parent retains final approval and commit authority.

This verdict covers additive detection and the metadata repository only. It does not require F2 window/context/activation work, online abandoned-lock reclamation, hardware power-loss guarantees, DE version approval or game acceptance. The full user goal remains open.

## Scope, source identity and authority

Read in full: goal `00-goal-verbatim.md`, contract `01-working-contract.md`, plan `02-plan.md`, Review05 `05-edition-boundary-review.md`, corrected handoff09, prior NO-GO Review11, current `03-synthesis-and-sequencing.md`, and `04-acceptance-protocol.md`. The current synthesis was reread after concurrent coordinator edits; its startup hash-plus-fresh-probe policy remains F2 work.

Reviewed HEAD **`7f227286c6bd90f60a3ba3fd709484538efd66af`**, branch `de/separate-game-mode`. All F1 implementation/test/fixture files are still uncommitted. The initial brief's `818503d...` is an earlier baseline. The single production diff in `src-tauri/src/lib.rs` is `mod profiles;` at line 7. A source search found no live caller of either new module. No other implementation was reviewed or changed.

Evidence labels: **observed** = executed independently in this review; **source-confirmed** = directly inspected code at the pinned file hash and stated lines; **inferred** = stated consequence; **unverified** = not established. New modules have no truthful remote commit permalink yet. These local primary sources and SHA-256 values identify the actual snapshot; do not substitute a URL at HEAD, where the new files do not exist. Add fork permalinks only after a later authorized commit.

| Reviewed primary source, relative to Toolkit | SHA-256 |
| --- | --- |
| `src/node/game-profiles.js` | `5e121d2d63b2e08545f7d584142b87c87653b4fe36e48605d62fdfa6e0e9a1cf` |
| `src-tauri/src/profiles.rs` | `343fb674426803ecff1ae781130b0d2f1915da6a524c0207bc7a6a6c63a2e342` |
| `src-tauri/src/lib.rs` | `ed081350c4b18552115275ad28e9983c9a719d974a7547d1b414719ee78387d5` |
| `tests/game-profiles.test.js` | `67143ba88bdddc284babf84240e7c972cff58f682cfe3439e55d0da774a5c1d7` |
| `tests/fixtures/de-mode/foundation.json` | `434dda401daac98402f3e8db7f10e122ca2ef09de01c7ca3e11087294c3d258c` |
| `docs/de-mode/research/09-profile-foundation-handoff.md` | `a354846086fd7fffda470c357a42ddefb5bcafe77c8e558ef9d8682ce781fff9` |

These match the implementer's `S:\Projects\UCP\de-research\fix-f1-r2\final-hashes.json`. Every shell invocation used explicit Toolkit workdir `S:\Projects\UCP\AI-Toolkit-DE`. Only this owned report was written inside the checkout. Scratch code, synthetic metadata, logs and the standalone probe are under `S:\Projects\UCP\de-research\review-f1-r2`; Cargo uses the required external native target. No children, goal creation, implementation/test/fixture/prior-report/root-document edits, commits, pushes, dependency/ref changes, broad suite/build, CI, PR, release, app/game launch or installed game/app/profile/Steam write occurred. Installed binaries were read only.

## Severity-ranked findings

### R4 — Medium / commit blocker: duplicate members bypass the common raw metadata domain

**Source-confirmed locations:** Node `src/node/game-profiles.js:237–250` token-checks raw numeric lexemes, then calls `JSON.parse` at line 247 and validates Unicode/depth only on the surviving value at line 248. JavaScript has already collapsed duplicate members. The scalar-string and container checks at lines 184–216 cannot inspect the discarded values. Rust `src-tauri/src/profiles.rs:514–559` parses every value with serde_json at line 555, so a discarded unpaired surrogate still fails and a sufficiently deep discarded branch still hits its unchanged parser recursion limit. Both backends apply their 64-container predicate after duplicate collapse.

**Observed minimal original-store bytes:**

```json
{"schemaVersion":1,"revision":0,"defaultProfileId":null,"selectedByEdition":{},"profiles":{},"extension":"\ud800","extension":null}
```

On the exact same file, Node `read()` returns **ready**, extension `null`; native `read()` returns **corrupt**. The raw source contains an unpaired escaped surrogate that handoff09 explicitly says is rejected. The bytes are not a proposal generated by the corrected writer; this defect requires pre-existing/external metadata containing duplicate members. It is therefore narrower than Review11's high-severity accepted-proposal/self-round-trip failure.

Additional independently generated inputs:

| Raw duplicate-member input | Node read | Native read | Result |
| --- | --- | --- | --- |
| Earlier `extension` is `"\ud800"`, later one is null | ready | corrupt | Unicode-domain disagreement |
| Earlier extension contains 130 nested objects, later one is null | ready | corrupt | Depth-domain disagreement |
| Earlier extension contains 65 nested arrays, later one is null | ready | ready | Both discard a raw branch exceeding the advertised 64-container bound |
| Two ordinary valid extension values | ready | ready | Control; last member wins in both current implementations |

The three invalid-source files have SHA-256 `e41df2e6e9fe12437931d74d424c604a3966ad930af9d03ca7d02bc32bfdfb45`, `17aee0fba117f15d8418f03dec8bc973518ea46b86bd3ecdab6bfdc2cad89b06`, and `489dab0f24f56df2ca70d86906e7aadba6cabd28ab3b18636ef81e1c294028c0`, respectively. Exact files and complete results are retained in `boundary-probes.log` and its `probe-run-OpIivE` directory. Reads left the source trees unchanged.

**Observed recovery consequence:** seed the surrogate example in a fresh owned repository, let Node read it and attempt revision 1, and terminate that sole writer at the `displaced` checkpoint. After reaping the child (exit 91), verify its owned lock is empty and remove it under the accepted offline-maintenance policy. Native `recover()` returns **recovery-required**, diagnostic `corrupt`, with the canonical file still missing; its valid manifest points to a before-snapshot native cannot parse. Node `recover()` then returns **recovered** and restores the exact original bytes, which Node again calls ready. Locations: Node initial-read/CAS `283–325`, recovery snapshot validation `385–392`; Rust snapshot validation `881–893`. No retained recovery bytes were lost or overwritten by native recovery; it correctly failed closed. Log: `duplicate-recovery.log`, directory `duplicate-recovery-6lk5sK`.

**Impact:** F1 still lacks one equivalent strict read/recovery domain. A Node-accepted original store can become a transaction's rollback authority that the native backend refuses. The changed code no longer creates unreadable stores from the tested ordinary supported proposals, and this finding does not imply wrong-root activation or data destruction. It does prevent closing the requested parser/Unicode/depth agreement and cross-backend recovery contract.

**Required bounded correction:** enforce the raw Unicode-scalar and container-depth policy before duplicate-member collapse, or consistently reject duplicate decoded member names in both metadata parsers. Include escaped-equivalent duplicate names and nested/profile/unknown-extension objects in the selected policy. Do not silently drop forbidden earlier values to claim domain compliance; do not disable serde_json's recursion safeguard. A full game-document/lossless codec is unnecessary. Add raw overshadowed-surrogate and 65/130-container cases, an ordinary valid-duplicate control under the chosen policy, and a cross-backend interrupted-original-snapshot regression. Rejected source bytes must remain unchanged and must not permit migration or new transaction/backup artifacts. Keep all accepted valid extensions and the current post-preservation/serialized-return guarantees.

### C2 — Low / nonblocking verification anomaly: one native contention run returned lock mkdir EPERM

**Observed:** the first focused native run had **22 passed, 1 failed**. `profiles::tests::node_and_native_concurrent_writers_have_no_lost_updates` failed at `profiles.rs:1924`: one Node child received `io-error` with `EPERM: operation not permitted, mkdir '...\game-profiles.v1.json.lock'`. Node maps only `EEXIST` to busy (`game-profiles.js:292–306,324–325`); the test treats any other read status as fatal (`profiles.rs:1902`). This occurred with separate owned Node/native test directories; no shared repository path collision was found.

A full native rerun passed **23/23**, and **five additional exact contention-test runs each passed 1/1**, reaching revision 32. I did not reproduce or establish the cause of the initial EPERM and make no claim that Windows deletion-pending behavior caused it. The observed result is fail-closed I/O failure, not evidence of a lost committed revision or unsafe lock takeover. Preserve `native-focused.log` and investigate the lock's actual OS error/ownership conditions before active integration; do not turn arbitrary permission errors into busy or simply relax the test. This observation does not independently block the unexposed commit, and it must not be omitted from the test record.

## Independent closure of prior findings

| Review11 item | Round-two independent result | Closure |
| --- | --- | --- |
| R1 high: accepted 130-container and surrogate proposals unreadable by native; BOM mismatch | Both writers reject tested over-depth proposals; ordinary accepted boundary stores self-round-trip and cross-read. BOM, scalar Unicode, paired surrogates, wrapper accounting and post-preservation checks agree for tested nonduplicate sources. Serialization precedes artifact mutation. R4 demonstrates a remaining raw duplicate-member Unicode/depth gap. | **Partially closed; commit remains blocked by R4.** Original ordinary-proposal failure is fixed. |
| R2 medium: Node Map/Date/sparse inputs change on disk | Validation precedes structuredClone, rejects exotic/proxy/accessor/hidden/symbol/sparse/cyclic input in the supplied suite and added fresh/ready-repository probes. Getters, proxy traps and toJSON remained uncalled. Supported null-prototype/own-`__proto__` data and committed-return/read equality pass. | **Closed for this snapshot.** |
| R3 medium: declared CLR/cb/metadata ranges and root unchecked | Source inspection, all 22 supplied adversarial declarations in both hosts, four added range/overlap/cb cases, and actual installed recognition support the scoped structural fix. Version remains unknown. | **Closed for this snapshot.** Full CLR loading and version-aware DE features remain separate. |
| C1 low: unrelated-name junction to UCP suffix is unknown | Handoff09 explicitly narrows support; lexical suffix and ordinary root aliases retain tests. No suffix-alias expansion is claimed. | **Accepted nonblocking conservative gap.** |

Source anchors for the corrected paths: Node `184–250,309–353,429–440`; Rust `442–559,697–757,977–1004`. Supplied focused boundary tests: Node `tests/game-profiles.test.js:167–245`; native `profiles.rs:1425–1549`. Native's external-source tests omit duplicate overwrites; its current Unicode cases do not exercise R4.

## Original repository/detection gates and retained behavior

**Review05 F1 detection — met within the documented recognition scope.** All 19 shared base layouts pass in both backends; native tests compare complete Node/native results and tree snapshots. Classic with/without optional UCP, Extreme-only/both executables, independent roots, suffixes, ordinary root aliases/case, unknown and incomplete roots, mixed markers and cancelled selection are explicit. Edition+canonical-root identity stays separate from the binary/UCP source fingerprint. Every binary version remains unknown. Source: Node `105–178`; Rust `269–428`. Installed read-only probes below independently confirm the stronger CLI checks still recognize the actual DE root. Plain Classic without UCP remains synthetic acceptance; it is not an observed pristine installed game.

**Review05 F2 metadata/recovery — not fully met because of R4.** For the tested supported nonduplicate domain, missing/corrupt/future/I/O/busy/recovery states remain distinct; only missing permits inactive Classic migration. Existing profile identities are immutable, CAS revision checks execute under the cross-process directory lock, and valid extension fields survive omitted-field updates. Legacy bytes, history/skin/config files and inactive defaults remain unchanged. The full passing rerun retains actual process exits, sharing denial, write/rename obstructions, stale CAS, external canonical edits and retained-backup tests. The changed validation/serialization ordering rejects tested bad proposals before backup deletion or journal creation; I found no regression in that ordering.

The transaction/backup commit point, retained rollback bytes and offline abandoned-lock policy remain acceptable for this unexposed library. All writers must be stopped and verified before removing an abandoned empty lock. No online age/PID takeover or hardware power-loss guarantee is required here. Supported maintenance for partial artifacts remains a pre-integration F2 task. R4 adds no demand for unsafe automatic repair: native correctly retains the problematic transaction for maintenance.

**The queue's F2/F3 integration and Review05 F3–F7 remain open and out of scope.** Host-authenticated window contexts/epochs; source leases and fresh source validation; activation request IDs/idempotence; default persistence on explicit activation only; supported maintenance; hash-plus-fresh-probe legacy startup provenance; configuration/resource/cache/browser migration; actual dialogs/mixed windows; switch freeze/drain/adoption/rollback and document ownership remain coordinator-owned later slices. F1 CAS is not an activation IPC API. No new DE capability, compatible export, artwork, package deployment or game acceptance follows from this review.

## Actual focused commands, results and retained probes

Executed from explicit Toolkit workdir; environment changes were local to each shell. The two full focused suites initially ran concurrently, using the same scratch base but different Node-generated and Rust PID/serial subdirectories. The native rerun used a separate base.

```powershell
$env:AI_TOOLKIT_PROFILE_TEST_ROOT = 'S:\Projects\UCP\de-research\review-f1-r2\suite-tests'
node --test --test-reporter=spec tests/game-profiles.test.js
$env:CARGO_TARGET_DIR = 'S:\Projects\UCP\de-research\toolkit-native-target'
cargo test --manifest-path src-tauri/Cargo.toml --lib --locked profiles:: --no-fail-fast
# Full native rerun: same Cargo command, AI_TOOLKIT_PROFILE_TEST_ROOT ...\native-rerun
# Five bounded follow-ups, AI_TOOLKIT_PROFILE_TEST_ROOT ...\contention-reruns:
cargo test --manifest-path src-tauri/Cargo.toml --lib --locked profiles::tests::node_and_native_concurrent_writers_have_no_lost_updates -- --exact
node 'S:\Projects\UCP\de-research\review-f1-r2\boundary-probes.cjs'
node 'S:\Projects\UCP\de-research\review-f1-r2\duplicate-recovery.cjs'
```

- **Node: 67 passed, 0 failed, 0 skipped.** Count includes 19 nested base-layout and 22 nested CLR-mutation cases.
- **Native first run: 22 passed, 1 failed, 0 ignored, 78 filtered. Native full rerun: 23 passed, 0 failed, 0 ignored, 78 filtered.** The selected 23 include the deliberate no-op subprocess harness when its action environment is absent. Five exact contention follow-ups: each **1 passed, 0 failed, 100 filtered**. Do not describe the complete review as having no test failure.
- Added boundary script: **six** store/profile × object/array/alternating cross-backend commit/preservation cases, also checking empty-container counting; **21** parser cases (nine shared Unicode/BOM plus twelve shape/depth boundaries); **20** unsupported-input attempts across missing/ready repositories with unchanged artifact snapshots and **zero getter/toJSON/proxy-trap calls**; **four** extra CLR invalid-range/overlap/cb cases; **four** raw duplicate cases; **two** complete installed probe comparisons. Counts are logical probe groupings, not feature-acceptance totals.
- Added recovery script: one actual sole-child exit at displacement using the duplicate-surrogate original; native fails closed, Node restores exact bytes, as R4 records. No huge journal stress repetition was performed.
- Logs: `node-focused.log`, `native-focused.log`, `native-focused-rerun.log`, `contention-1.log` through `contention-5.log`, `contention-summary.log`, `boundary-probes.log`, and `duplicate-recovery.log`, all under the owned scratch directory.

The standalone `probe.rs` includes the exact reviewed `profiles.rs` via `#[path=...]`; it links the already-built serde/serde_json/sha2/dunce dependencies directly with rustc, installs none, and exposes only the explicit parse/read/inspect/probe/recover/CAS commands used by owned scripts. Compiler command is retained in `build-probe.txt`. It does not reimplement the foundation. Node is `v26.7.0`; rustc is `1.98.1 (48a229cea 2026-09-01)`.

- Focused native test executable `S:\Projects\UCP\de-research\toolkit-native-target\debug\deps\ai_toolkit-a11e2abf0855483c.exe`: SHA-256 **`8f54182f6833670b0aaf51ace863056db99d46ded481e835e53125dc953b86d2`**.
- Standalone `review-f1-r2\probe.exe`: SHA-256 **`6e14f566250431d5ba8b78cf058425fe35f900e6e1b023870ad09655dce3459d`**.
- The review's final source/probe/log hash manifest is `review-f1-r2\review-hashes.json`.

## Structural specification and actual installed binary evidence

**Source-confirmed:** [ECMA-335 sixth edition, Partition II §25.3.3](https://www.ecma-international.org/wp-content/uploads/ECMA-335_6th_edition_june_2012.pdf#page=309) defines the CLI header's size and metadata RVA/size; [§24.2.1](https://www.ecma-international.org/wp-content/uploads/ECMA-335_6th_edition_june_2012.pdf#page=297) defines the BSJB root, bounded padded UTF-8 version and stream count. Node `42–102` and Rust `53–179` now inspect declared file-backed ranges, cb bounds, basic metadata root/version and minimum stream-header room. This is structural recognition, with no full stream/table/IL/runtime validation or version support implied. These primary specification URLs were opened independently. No remote handoff summary was promoted to binary evidence.

**Observed read only:** complete Node/native probe results match for the actual DE and Classic Extreme roots, including profile identity, evidence, source revision, UCP availability and `versionStatus: unknown`. Each binary was read again and its hash compared with the probe evidence. DE has no UCP-library capability; the Classic root does. Neither executable was launched or copied.

| Absolute binary | SHA-256 |
| --- | --- |
| `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\Stronghold Crusader Definitive Edition.exe` | `8acea6d11af81cf26b035a479ba633bdb0d09513742055f3f46330d72b2f203a` |
| `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\Stronghold Crusader Definitive Edition_Data\Managed\Assembly-CSharp.dll` | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition\Stronghold Crusader Definitive Edition_Data\Plugins\x86_64\CrusaderDE.dll` | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |
| `D:\SteamLibrary\steamapps\common\Stronghold Crusader Extreme\Stronghold Crusader.exe` | `3bb0a8c1e72331b3a30a5aa93ed94beca0081b476b04c1960e26d5b45387ac5a` |
| `D:\SteamLibrary\steamapps\common\Stronghold Crusader Extreme\Stronghold_Crusader_Extreme.exe` | `55648e6b05d67d37a5773fe699bbb17a2d6ad4de1bb9dbded9a21caef82bd7fb` |

Added synthetic CLR hashes and exact mutations are in `boundary-probes.cjs` and its log. All four yield null PE evidence in both hosts: CLI RVA overflow, metadata RVA overflow, zero cb, and duplicate fully overlapping section mappings. Together with the 22 shared fixture mutations this is sufficient for the requested R3 structural closure; no additional loader audit is requested.

## Precise next bounded handoff

Assign one **Sol 6.1** correction implementer the original F1 ownership only: `src/node/game-profiles.js`, `src-tauri/src/profiles.rs`, `tests/game-profiles.test.js`, `tests/fixtures/de-mode/foundation.json`, and handoff09. Give it the goal/contract/plan, Review05, Review11, this full R4 reproduction, current source hashes, and the supported/accepted correction outcomes above. Resolve raw duplicate-member Unicode/depth enforcement consistently in both hosts, document the chosen duplicate policy, and add shared malformed-source/read/CAS/recovery tests. Preserve accepted ordinary extension values and all prior valid-domain tests. No root-document or prior-review edits, live callers, context/UI scope, dependencies, installed writes, commits or CI. Return final hashes and focused outcomes for another independent round.

Separately retain C2's original EPERM log for bounded diagnosis before integration; its root cause is unverified. The coordinator owns synthesis, acceptance, any commit and the later F2 task. This reviewer made no code fixes and grants no self-approval.

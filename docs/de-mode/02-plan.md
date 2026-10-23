# DE mode plan and progress

**Resumed on the user's explicit instruction.** The prior
[pause checkpoint](06-resume-checkpoint.md) remains historical evidence. Native
get_goal still reports paused and exposes no resume mutation; implementation is
authorized and continuing while that UI-controlled flag awaits reactivation.

The full objective is retained. Research has established the first contracts; full DE
support is not yet usable or accepted. [Goal](00-goal-verbatim.md),
[contract](01-working-contract.md), [engineering standard](05-engineering-standard.md)
and [acceptance protocol](04-acceptance-protocol.md) remain authoritative.

## Current direction

The coordinator adopts [architecture decision23](research/23-single-source-architecture.md):
one host-independent Rust backend core, linked by Tauri and called by Electron
through a small versioned helper. Shared JavaScript owns lossless documents and
sessions. Classic and DE have explicit providers and formats; host adapters
authenticate windows and carry requests rather than repeat game policy.

The repeated Node/Rust profile discrepancies exposed a maintenance boundary that
needed correction. C1 reuses corrected Rust F1, removes its independent Node policy,
and provides a real helper client/build. It does not rewrite unrelated Classic
services. Existing Classic duplication is tracked migration work: cut over one
operation against existing behavior and retire its replaced implementation.

The next complete user workflow is **select DE -> bind a fresh owned window ->
open a real LORDJSON -> edit an existing scalar -> Save As -> reopen**, beside an
unchanged Classic window. Context authority, raw-byte transport and one document
session must precede that demonstration. The full in-place toggle follows its
unsaved/save/drain/adopt recovery gates. Asset work and game-isolation review can
advance independently; neither blocks the first lossless file workflow.

## Milestones

| Milestone | Acceptance gate | Current state |
| --- | --- | --- |
| Preserve work and intent | Correct nested checkout, active sidebar goal, Classic untouched, no CI | Complete; continuing constraints below |
| Establish contracts | Pinned sources and independently reproduced central claims | Initial research/review complete; targeted gaps remain |
| Unify backend ownership | One canonical policy, generated contracts, both host consumers | C1 final-source validation/package checks resume before independent review |
| Separate editions and deliver first document workflow | Owned roots/contexts, lossless open/edit/save/reopen, Classic regression | Next integrated slice; no live DE toggle yet |
| Support DE castle programs | Lossless ordered AIVJSON and explicit editing operations | Pending; never reconstruct from a final raster |
| Render authentic DE assets | Local pixels, composition, camera and flat/lowered evidence | Review27 GO additive metadata; pixel evaluation follows its commit |
| Deliver packages and optional loaders | Versioned manifest, media validation, reversible owned writes | Vanilla-first contract established; implementation pending |
| Verify actual game behavior | Isolated load/construction/media, expanded features and Classic checks | Review22 supports finite host preflight; no game launch |
| Complete acceptance | Every required CSV criterion has appropriate evidence | Open; foundations are not feature acceptance |

## Current task ownership

Every subagent is Sol6.1 with ultra reasoning and default service tier. The
coordinator owns scope, interfaces, review resolution, acceptance and commits.
Agents may challenge a premise or ownership decision with evidence and a smaller
corrective move. Exact task IDs, file groups and statuses are in
[task-ownership.json](task-ownership.json). Nested agents are capped at3 per owner
and live global capacity; no uncontrolled fan-out.

- **C1 finalization:** one owner verifies the final portable resolver, cross-volume
  packaging, current helper identity, MSRV/transport checks and measurements.
  Independent core review follows; no live contexts/UI are added in this task.
- **DS1 independent Review28:** checks shared session save/undo/receipt boundaries
  and generated schema guards against the unchanged D1 preservation contract.
- **A1 milestone:** Review27 gives GO and root matches all18 source hashes and
  handoff16. Commit only this reviewed metadata crate; pixels remain unaccepted.
- **PXL1 scratch evaluation:** report29 owns decoder/spec/oracle comparisons,
  BC1 alpha/BC7 modes, bounded crop/resource measurements and pinned notices.
  It selects a narrow next implementation without changing product dependencies.
- **Isolation Review22 complete:** accepts the narrow offline result and finite
  direct-EXE vanilla single-player preflight. Fresh copy/roots, scoped backups,
  Steam Cloud/queue evidence and startup/exit observations are still required.
  The acceptance protocol records the coordinator decision and two scoped guard
  defects. No game launch or preference change has occurred.
- **Next consumer slice:** core contexts/leases and opaque byte I/O, shared
  document sessions, then thin desktop/UI wiring. Serialize overlapping edits.
  Scope this against the actual C1 API rather than invent a parallel service.

## Accepted evidence and unresolved limits

- D1 is committed at b4b319f after independent Review18 closed all four findings.
  It preserves UTF-8/BOM, trivia, duplicates, unknown data and exact no-ops, with
  revision-bound atomic scalar edits. Its 180 focused tests do not establish UI
  or game acceptance. Structural edits, ordered AIV and packaging are still open.
  The exact 5079-byte fixture is protected by a narrow .gitattributes rule.
- F1 round3 reports97 Node/26 native focused tests. Duplicate decoded-name
  rejection, malformed recovery authority and process interruption coverage must
  survive canonical extraction and receive independent closure. Reviews11/17
  and handoff09 retain prior findings/responses. Earlier contention EPERM did
  not recur; its root cause remains unknown, not silently reclassified as busy.
- A1 reports29 synthetic tests on Rust1.88/1.98 and 86-object full-field parity.
  Review24 found one P2 work/cancellation gap. Its correction reports35 tests
  and deterministic mid-loop cancellation. Review27 independently closes the P2.
  The reviewed additive core is staged separately. No pixel decoder, whole-building
  rendering or cache contract is accepted. Privileged file-symlink creation was
  unavailable; junction rejection was exercised. Mutation limits are explicit.
- Native/managed DE hashes match the pinned baseline; managed PE32 is not an
  x86-only process. Detection/layout evidence is not version compatibility.
  sources.json, local-evidence.json and ordered differences.csv hold exact pins.
- LORDJSON has118 fields/14 arrays; inspected public converters expose117 and
  omit a distinct speech field. Keep preservation separate from playable export.
  Report19 pins older117-field reference candidates outside Git for real file
  workflow tests; do not auto-fill missing game values or infer their defaults.
- Vanilla CustomLords/CustomMedia is the first package path. Extra guarding
  spots11-30 require verified SE/Fixes configuration and runtime observations.
  Classic30-spot export remains refused; Classic runtime expansion is not built.
- Harness15 demonstrates exact offline transformations and51 synthetic checks.
  launchAllowed is false. Review22 supports a finite host path after concrete
  early Unity/native/client/Cloud/path checks, fresh roots and scoped backups.
  A copied install alone does not isolate saves. Memory compression and dirty
  pre-opened stream defects are scoped explicitly; no runtime acceptance closes.
  No original ACL, Steam preference or profile change has occurred.
- A pre-existing user editor runs from S:\Projects\UCP\Tools\AI Toolkit.
  Later desktop observations must use an owned build/profile and exact executable
  identity/window handle. No live editor has been activated or updated.

## Verification and commits

Focused reviewed evidence belongs to its exact source snapshot. Historical full
regressions after correction round2 passed900 JS and100 native tests, with one
explicit installation-parity ignore; those results predate F1 round3 and C1.
Earlier read-only Classic installation checks passed10/10. Logs and artifact
hashes remain outside Git under S:\Projects\UCP\de-research; sources.json
records their paths. Run changed-boundary checks and appropriate Classic
regressions after the refactor; do not repeatedly rerun unchanged suites.

Commit reviewed coherent milestones only, with explicit staging and [skip ci].
Keep heavy/proprietary files outside Git. NO CI runs/dispatches, PR creation,
merging or release publication. Do not publish over the user's editor or touch
upstream PR11. Push only fork/de/separate-game-mode.

## Workspace binding and continuation

This is normal UCP sidebar thread mcp:24e1fd23-accc-4f55-8906-3de048c9a894,
project2dd89517-2ea6-4ac0-898a-11e0c5076371. The persistent goal was created
first and get_goal verifies active with the full objective and no token budget.
Original classic checkout S:\Projects\Harness\ai-toolkit-setup\source stays
at5ce3676 on its own branch; the last published app remains separate.

The UCP project root is a multi-repository folder, not a Git checkout. T3 rejected
an existing-worktree binding because this Toolkit worktree is not one of that
project root's registered Git worktrees. The approved continuation therefore
uses an explicit UCP-root binding, with this isolated nested checkout as its
working repository. Every shell command that operates on Toolkit must set its
working directory to `S:\Projects\UCP\AI-Toolkit-DE`; the sidebar's project root
is not the Toolkit Git root. Shared research agents can use disjoint reports.
Do not claim T3 worktree isolation where the app cannot provide it; serialize
conflicting implementation changes or resolve workspace support explicitly.

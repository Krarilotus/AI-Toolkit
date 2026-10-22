# DE mode plan and progress

Status: all four original research tracks are complete. Independent edition
review permits an unexposed detection/profile foundation with required fixes.
The [reviewed synthesis and queue](03-synthesis-and-sequencing.md) governs
implementation. Profile-isolation and deeper rendering/domain investigations
continue. Persistent goal active; full DE compatibility remains unverified.
The [acceptance protocol](04-acceptance-protocol.md) specifies later isolated
desktop/game observations and recovery evidence.
[Goal](00-goal-verbatim.md) · [Contract](01-working-contract.md)

## Milestones

| Milestone | Deliverable | Acceptance gate | Status |
| --- | --- | --- | --- |
| 0. Isolate and preserve instructions | DE branch, no automatic CI, UCP sidebar continuation and persistent goal | Correct workspace binding; original checkout untouched | Complete |
| 1. Establish evidence | Pinned repository catalogue, local game/editor hashes, format probes and ordered HD/DE difference ledger | Review primary code and reproduce central claims | Initial gate complete; targeted follow-ups continue |
| 2. Separate edition mode | Edition detection, separate roots/settings/caches and capability model | Classic-only, DE-only, both-installed and mode-switch tests | In progress: F1 duplicate-metadata correction round 3 |
| 3. Implement DE data contracts | Lossless castle/lord/AI codecs, schema-driven UI and safe conversion | Round trips and game/editor/loader fixtures | In progress: D1 accepted for additive commit; D2 castle overlay next |
| 4. Replace DE placeholder art | Local asset extraction and verified DE rendering | Representative units/buildings/terrain and rotations/modes | In progress: reviewed A1 metadata core |
| 5. Deliver custom AI packages | Lord/media package creation and reversible game/loader installation | Real package discovery and isolated in-game loading | Pending |
| 6. Finish compatibility | Acceptance matrix, classic regressions, failure recovery and user workflow checks | All required cases verified; no hidden unsupported paths | Pending |

## First research assignments

1. File contracts: Serpens66 handoff, LORDJSON, AIV JSON, official editor,
   Sushi/AIVE converters, media packaging, unknown-field preservation.
2. Asset/rendering contracts: local DE assets and managed code, GM/Unity/native
   boundaries, authentic DE sprite extraction, palettes/anchors/terrain/cameras.
3. Runtime/loaders and differences: native x64 baseline, HD 1.41 mapping,
   Script Extender/Fixes capabilities, custom lord discovery, install/save/sync.
4. Toolkit architecture: current native service/UI boundaries, migration and
   edition isolation, classic regression risks and implementation sequencing.

For each assignment write evidence and uncertainties to an owned report under
`docs/de-mode/research/`. The coordinator maintains `differences.csv`,
`sources.json`, the acceptance matrix and this progress file. Do not turn a
third-party ChatGPT summary into a fact without inspecting its cited evidence.

## Source seeds

- https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/develop/Findings/AIToolkitDE.md
- https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/tree/main/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge
- Local game: `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition`
- Existing Script Extender checkout:
  `S:\Projects\Harness\ai-toolkit-setup\research-shcde-script-extender`.
- Existing classic analysis: `S:\Projects\UCP\OpenSHC`, plus current Toolkit
  `docs/definitive-edition-integration.md`, `docs/expanded-troop-spots.md`,
  `docs/native-parity.md` and the implementation itself.

Inventory and pin related DE repositories under the UCP project before pulling
updates into existing dirty checkouts. Clone missing research sources separately.
This is not permission to merge unrelated repositories into the UCP game code.

## Handoff notes

### Active continuation, 22 October 2026

- Latest architecture steering is preserved verbatim in goal00 and made explicit
  in contract01/standard05: modular Classic/DE providers, one authoritative policy
  implementation, thin host adapters and focused tooling before growth. The
  repeated Node/Rust profile discrepancies justify reassessing that duplication
  before F2 wiring. A bounded report23 task compares concrete shared-core routes
  and an incremental refactor; no backend is silently removed. Corrected F1 code
  remains uncommitted while this ownership decision is resolved.
- Latest process steering requires critique at the appropriate abstraction and
  ownership level. [Engineering standard](05-engineering-standard.md) records
  the quality attributes, agent autonomy and responsibility boundaries. A bounded
  independent architecture/code-health critique now owns report 21. The next
  integrated demonstration should select DE, bind its window/profile, open/edit/
  save/reopen a real LORDJSON without normalization and retain Classic behavior.
  Parser/module tests remain intermediate evidence.
- Latest user steering: every subagent uses Sol 6.1 with clear instructions.
  The coordinator owns planning, evidence synthesis, review and orchestration;
  implementation will be delegated in controlled, serialized stages.
- Independent Review 05 gives conditional GO for additive F1 metadata/detection,
  with no live services or toggle exposed. F1 is assigned one implementer;
  domain Review 07, isolation 06 and rendering follow-up 08 run with disjoint
  report ownership. Exact task IDs/files are in task-ownership.json.
- Review 07 independently confirms the 118-field/14-array game schema and gives
  conditional GO for D1 with byte/token preservation, duplicate ambiguity,
  explicit UTF-8/BOM handling and separate target diagnostics. One D1 agent
  owns only new document modules/schema/tests, disjoint from F1. No UI or
  package/game acceptance is inferred. Main/develop share relevant code blobs
  but have different SE provenance metadata; the native PE has 77 exports,
  not the baseline narrative's 78 including entry.
- D1 returned seven new files and 73 passing focused tests, with no existing
  integration changed. Independent code Review 12 gives NO-GO: partly frozen
  schemas remain mutable, altered schemas can pass the pinned-contract checks,
  and same-value edits can fail token limits. A Unicode fixture variant also
  silently does nothing. Sol 6.1 correction round 2 owns the same seven files;
  a fresh independent review must resolve the findings before commit/integration.
- D1 correction round 2 is complete: private schema snapshot plus exact pin
  validation, no-op ordering and real Unicode fixture repairs report **180
  focused tests** and four direct finding checks passing. Public APIs and the
  schema JSON bytes are unchanged. Fresh independent Review 18 now owns the
  closure decision. Review 18 now gives GO for the additive D1 commit: all four
  findings independently closed, no new actionable findings. The coordinator
  verified all seven reviewed file hashes before staging. Session/UI, AIV,
  packages and game acceptance remain open; D2 ordered-castle work is next.
- F1 returned equivalent Node/Rust modules and 41 Node + 19 native focused tests.
  Independent Review 11 gives NO-GO: accepted deep/Unicode metadata can become
  unreadable by Rust, Node accepts non-JSON inputs that change on disk, and
  malformed CLR evidence can be recognized as DE. Sol 6.1 correction round 2
  owns the same F1 files; a fresh review gates commit. The cross-process journal
  design and explicit offline abandoned-lock maintenance are accepted for this
  unexposed milestone. Window/context/cache/UI work remains F2/F3.
- F1 correction round 2 is complete: a common bounded JSON domain, strict Node
  input validation and declared CLR/metadata bounds report **67 Node and 23
  native focused tests** passing. The conservative suffix-junction false negative
  is documented. Fresh independent Review 17 owns closure and additive commit
  assessment; live integration remains separate.
- Review 17 closes F1's strict-input and PE findings but gives NO-GO for the
  remaining raw duplicate-member metadata discrepancy. Round 3 must reject
  duplicate decoded names consistently in both hosts and preserve malformed
  recovery evidence. One original contention test returned EPERM before the full
  rerun and five focused runs passed; keep that unresolved low-priority anomaly
  visible before integration rather than disguising it as a fully clean review.
- F1 round3 has returned duplicate decoded-name rejection in both parsers with
  **97 Node/26 native focused tests**. Independent R4 closure remains pending;
  reuse of the corrected logic will follow the single-source ownership decision
  rather than immediately growing two implementations.
- Architecture critique21 found no new serious foundation defect and recommends
  explicit raw-byte transport, domain-owned sessions, dispatch-time window
  authority and separate resource/configuration identities. Its earlier acceptance
  of two host implementations does not settle the user's subsequent requirement
  to avoid duplicate production policy. Preserve both hosts through thin adapters.
- A1 metadata implementation is complete but uncommitted. It reports 29 synthetic
  tests on Rust1.88/1.98 and full-field local parity for 86 objects. Independent
  Review24 now owns correctness/code-health scrutiny. The unexercised privileged
  file-symlink case and documented mutation limits remain explicit. No decoder or
  rendering feature is accepted through this metadata evidence.
- Rendering Review 14 gives conditional GO for A1 metadata only. It independently
  matches every serialized field of 41 Sprites and all 41 Texture2Ds, corroborates
  Healer/Camel stationary selectors and outpost base permutations, and corrects
  the earlier scratch index's narrower name/path-ID comparison. An isolated
  `crates/de-assets-core` implementer owns checked v22 parsing, exact metadata,
  scoped names/references and read-only bounded streams with synthetic tests.
  It adds no production dependency or decoder. DXT5/RGBA32/RGB24, inline/empty
  textures and mip exceptions must survive metadata parsing; later BC1 decode
  must test transparent mode. Stockade, flat/lowered, pixels and game views remain
  open. Exact source/database provenance and notices stay distinct.
- First DE package target: vanilla named Custom Lord plus matching-name
  `CustomMedia`, before optional SE/Fixes capabilities. The shipped media
  instructions and game source support this path; actual playback/loading is
  still pending. The 118-field game LORDJSON schema must preserve the speech
  field omitted by the 117-field inspected editor/converter. See reports 01/03.
- Reference candidates are now pinned individually in report19. The sampled AIC
  export manifest names an older native build and does not establish adjacent
  AIV provenance. Rat's small source can prove open/edit/save preservation while
  honestly showing its missing speech field; playable export is a later gate.
  Keep raw sources outside Git and record authored edits rather than auto-filling
  absent game values.
- Real game launches remain gated on demonstrated profile isolation. A physical
  copy alone still uses the ordinary user's persistence paths. A bounded
  same-user isolation investigation is running before choosing a test-user/VM
  fallback or changing any profile.
- Review 13 selects design A conditionally: owned-copy identity/root redirects,
  supported app Cloud policy and early Workshop/account-write suppression.
  Its synthetic restricted-token candidate B allowed deletion and is rejected.
  Startup stats migration, implicit persistence and leaderboard uploads are
  included in the audit. A new bounded offline harness task owns report 15 and
  external scratch only; it must demonstrate exact transforms/guards and expose
  remaining native/Steam ordering gaps before a launch decision. No game launch,
  Steam preference/ACL change or separate-account/VM prerequisite is assumed.
- Offline harness 15 is now complete with exact transforms, unchanged licensing
  evidence and 51 synthetic checks. Its launch permission remains false: it
  does not contain early Unity/native/child or unrestricted Steam-client activity,
  and path races remain. This is acceptance tooling outside the product. A real
  launch still requires a proportionate concrete boundary and coordinator review.
- Independent Review22 now assesses the completed isolation tools against the
  actual preservation contract, including which residuals require finite probes
  or another environment. It must not invent a universal malicious-program
  containment requirement or turn offline success into game acceptance.
- Before the D1 commit, Git staging exposed CRLF normalization of the deliberate
  lossless fixture. A narrow `.gitattributes` rule now retains its exact reviewed
  5079 bytes and intentional trailing trivia. The staged code/tests/fixture match
  reviewed bytes; only schema JSON receives ordinary Git newline normalization.
  `S:\Projects\UCP\de-research\d1-stage-receipt.json` records both fingerprints.
- The supported Windows observation API was initialized read-only and its
  window inventory works. A pre-existing Toolkit window runs from
  `S:\Projects\UCP\Tools\AI Toolkit\AI Toolkit.exe`; it was not activated or
  changed. Later desktop tests must target a separately owned build by exact
  executable identity and returned window handle, not just the shared title.

- App thread `mcp:24e1fd23-accc-4f55-8906-3de048c9a894`, project UCP
  `2dd89517-2ea6-4ac0-898a-11e0c5076371`. It is a normal sidebar thread,
  not delegated child work. Native provider UUIDs are not T3 thread IDs.
- `create_goal` was the first action. `get_goal` independently returned
  `active` with the full contract objective and no token budget.
- Baseline is clean commit `818503dc40971defef3769ca883f82290405ab94`,
  the pushed workspace-note commit after `73d9447`, branch `de/separate-game-mode`.
- [Task ownership](task-ownership.json) records four shared research tasks,
  each with one disjoint report and no recursive delegation. All selected
  `codex/gpt-6.1-sol`, `reasoningEffort: ultra`, `serviceTier: default`;
  returned identities/options match. Implementation changes remain serialized
  until central findings are independently reviewed.
- [Sources](sources.json), [local identities](local-evidence.json),
  [ordered differences](differences.csv) and [acceptance matrix](acceptance.csv)
  are maintained by the coordinator. The original Serpens source was missing
  from UCP and was cloned read-only with no checkout under `UCP/de-research`.
  `develop` is pinned at `7e199e6f0818173794bdeeb0c4c32d74500b0eec`;
  the requested `main` native-knowledge tree is pinned at
  `a23aa1b32276d670ffbb2a7b641d23b500d8e298` and assigned for inspection.
- The read-only `scripts/de-mode/collect-evidence.mjs` probe independently
  matches the user's native/managed DLL hashes from the handoff. Steam build
  is `24816905`. Managed PE32 is recorded as managed, not mistaken for a
  32-bit-only game process.
- Local baseline: `npm.cmd ci --ignore-scripts --no-audit --no-fund`, then
  `npm.cmd run check`: **653 passed, 0 failed, 0 skipped**, including syntax.
  Full log is outside Git at `S:\Projects\UCP\de-research\baseline-check-818503d.log`.
  PowerShell blocks npm.ps1; use npm.cmd without changing execution policy.
- After `node scripts/build-desktop.mjs` supplies the required frontend bundle,
  native `cargo test --manifest-path src-tauri/Cargo.toml --lib --locked` passes:
  **77 passed, 0 failed, 1 explicitly ignored installation-parity test**.
  Its dedicated build target and log are outside Git under `UCP/de-research`.
  `npm.cmd run test:game` against the existing classic KI-Liga installation
  passes **10/10** read-only map/asset/coordinate checks. These checks launch
  no game process. Baseline-generated tracked locale/theme files were restored
  after confirming their diffs contained no semantic changes.
- With both unexposed F1/D1 modules present, `npm.cmd run check` passes
  **767 tests, 0 failures/skips**, and the native library suite passes
  **96 tests, 0 failures, 1 explicit ignore**. Logs are outside Git at
  `S:\Projects\UCP\de-research\foundations-check-e6733ca.log` and
  `foundations-native-e6733ca.log`. These regressions do not resolve independent
  review findings or establish UI/game acceptance. `get_goal` again confirms
  the full persistent objective is active with no token budget.
- After both correction tasks completed, coordinator `npm.cmd run check` passes
  **900 tests, 0 failures/skips**, including syntax checks. Log:
  `S:\Projects\UCP\de-research\corrections-check-7f22728.log`. Fresh Reviews
  17/18 still decide correctness closure; these regressions establish no GUI or
  real-game acceptance. Do not repeat this suite without further changes or a
  specific unresolved concern.
- Coordinator full native library regression after the corrections passes
  **100 tests, 0 failures, 1 explicit installation-parity ignore**. Log:
  `S:\Projects\UCP\de-research\corrections-native-7f22728.log`. This includes
  existing library/update/IPC tests plus corrected profile tests. No further
  broad rerun is needed until new code or a specific concern justifies it.
- No game/editor launch, installed application update, game-directory write,
  CI dispatch, PR or release has occurred. Next: resolve code review findings,
  prepare reviewed context/provider slices and the offline isolation harness.

The previous Toolkit branch remains at 5ce3676. Its last published native app is
`snapshot-native-b508953a`, with the 30-spot feature and documented DE limits.
PR #11 is unrelated to this new DE branch; do not push these changes to it.
No development app, game process or test setup has been launched for this task.

T3 currently offers no supported cross-project move for an existing thread.
The user approved a linked normal top-level continuation in the UCP project.
Create its persistent goal as its first action; do not leave a second active goal
in the old Harness thread. Verify that the new thread is visible under UCP in
the sidebar before delegating implementation.

The UCP project root is a multi-repository folder, not a Git checkout. T3 rejected
an existing-worktree binding because this Toolkit worktree is not one of that
project root's registered Git worktrees. The approved continuation therefore
uses an explicit UCP-root binding, with this isolated nested checkout as its
working repository. Every shell command that operates on Toolkit must set its
working directory to `S:\Projects\UCP\AI-Toolkit-DE`; the sidebar's project root
is not the Toolkit Git root. Shared research agents can use disjoint reports.
Do not claim T3 worktree isolation where the app cannot provide it; serialize
conflicting implementation changes or resolve workspace support explicitly.

# DE mode plan and progress

Status: all four original research tracks are complete. Independent edition
review permits an unexposed detection/profile foundation with required fixes.
The [reviewed synthesis and queue](03-synthesis-and-sequencing.md) governs
implementation. Profile-isolation and deeper rendering/domain investigations
continue. Persistent goal active; full DE compatibility remains unverified.
[Goal](00-goal-verbatim.md) · [Contract](01-working-contract.md)

## Milestones

| Milestone | Deliverable | Acceptance gate | Status |
| --- | --- | --- | --- |
| 0. Isolate and preserve instructions | DE branch, no automatic CI, UCP sidebar continuation and persistent goal | Correct workspace binding; original checkout untouched | Complete |
| 1. Establish evidence | Pinned repository catalogue, local game/editor hashes, format probes and ordered HD/DE difference ledger | Review primary code and reproduce central claims | Initial gate complete; targeted follow-ups continue |
| 2. Separate edition mode | Edition detection, separate roots/settings/caches and capability model | Classic-only, DE-only, both-installed and mode-switch tests | In progress: unexposed F1 foundation |
| 3. Implement DE data contracts | Lossless castle/lord/AI codecs, schema-driven UI and safe conversion | Round trips and game/editor/loader fixtures | Pending |
| 4. Replace DE placeholder art | Local asset extraction and verified DE rendering | Representative units/buildings/terrain and rotations/modes | Pending |
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

- Latest user steering: every subagent uses Sol 6.1 with clear instructions.
  The coordinator owns planning, evidence synthesis, review and orchestration;
  implementation will be delegated in controlled, serialized stages.
- Independent Review 05 gives conditional GO for additive F1 metadata/detection,
  with no live services or toggle exposed. F1 is assigned one implementer;
  domain Review 07, isolation 06 and rendering follow-up 08 run with disjoint
  report ownership. Exact task IDs/files are in task-ownership.json.
- First DE package target: vanilla named Custom Lord plus matching-name
  `CustomMedia`, before optional SE/Fixes capabilities. The shipped media
  instructions and game source support this path; actual playback/loading is
  still pending. The 118-field game LORDJSON schema must preserve the speech
  field omitted by the 117-field inspected editor/converter. See reports 01/03.
- Real game launches remain gated on demonstrated profile isolation. A physical
  copy alone still uses the ordinary user's persistence paths. A bounded
  same-user isolation investigation is running before choosing a test-user/VM
  fallback or changing any profile.

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
- No game/editor launch, installed application update, game-directory write,
  CI dispatch, PR or release has occurred. Next: synthesize research, reproduce
  central claims and review the edition boundary before implementation.

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

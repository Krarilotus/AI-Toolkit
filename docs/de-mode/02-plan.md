# DE mode plan and progress

Status: isolated branch and handoff bootstrap. Research has not yet established
full DE compatibility. [Goal](00-goal-verbatim.md) · [Contract](01-working-contract.md)

## Milestones

| Milestone | Deliverable | Acceptance gate | Status |
| --- | --- | --- | --- |
| 0. Isolate and preserve instructions | DE branch, no automatic CI, UCP sidebar continuation and persistent goal | Correct workspace binding; original checkout untouched | In progress |
| 1. Establish evidence | Pinned repository catalogue, local game/editor hashes, format probes and ordered HD/DE difference ledger | Review primary code and reproduce central claims | Pending |
| 2. Separate edition mode | Edition detection, separate roots/settings/caches and capability model | Classic-only, DE-only, both-installed and mode-switch tests | Pending |
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

The previous Toolkit branch remains at 5ce3676. Its last published native app is
`snapshot-native-b508953a`, with the 30-spot feature and documented DE limits.
PR #11 is unrelated to this new DE branch; do not push these changes to it.
No development app, game process or test setup has been launched for this task.

T3 currently offers no supported cross-project move for an existing thread.
The user approved a linked normal top-level continuation in the UCP project.
Create its persistent goal as its first action; do not leave a second active goal
in the old Harness thread. Verify that the new thread is visible under UCP in
the sidebar and bound to this checkout before delegating implementation.

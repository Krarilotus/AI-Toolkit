# Coordinator evidence and review record

Read the [verbatim goal](../00-goal-verbatim.md) and
[working contract](../01-working-contract.md). This record distinguishes
identity checks, source inspection and actual game observations.

## Continuation identity

Observed on 22 October 2026: T3 app thread
`mcp:24e1fd23-accc-4f55-8906-3de048c9a894` is a normal thread with no parent,
under UCP project `2dd89517-2ea6-4ac0-898a-11e0c5076371`. The user independently
verified sidebar registration. Native `create_goal` was the first action;
`get_goal` returned the full requested objective, status `active`, no budget.
The native goal's provider thread UUID is not the T3 thread ID.

The Toolkit worktree started clean at
`818503dc40971defef3769ca883f82290405ab94`, branch `de/separate-game-mode`.
The classic checkout was independently read without mutation: clean,
`experiment/local-assets-and-lightweight-ui` at
`5ce3676af8ddb78a11f0148cc2311915eec0a0d8`.

## Reproducible identity probe

Run from `S:\Projects\UCP\AI-Toolkit-DE`:

```powershell
node scripts/de-mode/collect-evidence.mjs `
  --game 'D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition' `
  --classic 'D:\Games\Stronghold Crusader KI-Liga\Stronghold Crusader.exe' `
  --classic 'D:\SteamLibrary\steamapps\common\Stronghold Crusader Extreme\Stronghold Crusader.exe' `
  --source 'serpens=S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods' `
  --source 'script-extender=S:\Projects\Harness\ai-toolkit-setup\research-shcde-script-extender' `
  --source 'toolkit-classic=S:\Projects\Harness\ai-toolkit-setup\source' `
  --output 'S:\Projects\UCP\AI-Toolkit-DE\docs\de-mode\local-evidence.json'
```

The script reads game files and Git identities only. The explicit output is
metadata, not a copy of game contents. It records only app/build ID from the
Steam manifest, excluding account and play-history fields.

Observed, independently corroborated with PowerShell `Get-FileHash` and PE
header reads:

- DE Steam build `24816905`, native DLL SHA-256
  `FBCB93195FC7EFCA9BDAC5204852EFDD76F9818F59A6711750D77C9CEF2831E2`;
  PE32+, machine `0x8664`.
- Managed game DLL SHA-256
  `BC8B6A395F01D48557DB413600C8DD8D1FDFD3ABDF97BFBBB68A3C56B04FD789`;
  CLR directory present. Its PE32/`0x014c` header does not make the game x86.
- Both observed classic executables have PE32/`0x014c` headers. Their hashes
  differ; full paths/sizes/hashes are in `local-evidence.json`. Windows file
  version resources say `1, 1, 0, 1` for both, so that value alone does not
  establish the requested HD 1.41 native baseline.

Matching the handoff hashes establishes that it describes the same binary
identity; it does not independently prove all of the handoff's conclusions.

## Unmodified baseline

Dependencies were installed into this worktree with
`npm.cmd ci --ignore-scripts --no-audit --no-fund`. No lockfile update.
PowerShell's npm.ps1 is blocked by local execution policy; npm.cmd works
without changing that policy.

- `npm.cmd run check`: syntax passed, 653 tests passed, no skips/failures.
- `node scripts/build-desktop.mjs`: local frontend bundle produced. No app
  launch. Generated tracked locale/theme files had no semantic Git diffs
  and were restored to avoid unrelated changes.
- With `CARGO_TARGET_DIR=S:\Projects\UCP\de-research\toolkit-native-target`,
  `cargo test --manifest-path src-tauri/Cargo.toml --lib --locked`:
  77 passed, zero failures, one explicitly ignored installation-reference test.
  First attempt correctly required the missing desktop bundle; rerun after
  creating it passed.
- With `AI_TOOLKIT_TEST_GAME_ROOT=D:\Games\Stronghold Crusader KI-Liga`,
  `npm.cmd run test:game`: 10 passed, no skips/failures. These existing tests
  read installed maps/assets and verify coordinates/atlas data without launching
  the game or writing into its installation.

Full logs and build output stay outside Git under `UCP/de-research`, named
`baseline-check-818503d.log`, `baseline-native-818503d.log`,
`baseline-build-desktop-818503d.log`, and `baseline-classic-game-818503d.log`.
Passing these is a baseline, not evidence of DE support or later regressions.

## Initial central source review

Independently inspected by the coordinator before implementation:

- Script Extender `4014ca67c96974a5e6d697665baf5351cbfebde6`,
  `src/SHCDESE.AICDecoder/src/SHCDESE.AICDecoder/PublicAIC.cs` and
  `AICReader.cs`: public LORDJSON has a `lord` wrapper with named arrays;
  this converter's JSON reader accepts comments, trailing commas and
  case-insensitive properties. That permissiveness belongs to the converter,
  and is not evidence that vanilla Unity JSON accepts the same inputs.
- Serpens source snapshot
  `7e199e6f0818173794bdeeb0c4c32d74500b0eec`, hash-labelled decompilation
  `_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs`:
  separate `.lordjson` and `.aivjson` branches invoke the game's JSON models;
  custom lord directories are scanned directly. The avatar branch checks
  `avatar.png`, fewer than 80,000 bytes and exactly 144 by 144 pixels.
  These are source-confirmed checks in that decompilation. Local binary hashes
  match its labelled identity; local decompilation/runtime corroboration is a
  separate gate.
- Current Toolkit source: native storage requires `ucp/plugins`; game requests
  read one saved `ucpInstallation` and shared cache names. Native skins merge
  bundled preview art with extracted assets and custom skins. Frontend library
  folder selection resets its loaded project without an unsaved guard. Existing
  unsaved-document guards and per-window document delivery should be reused,
  while preventing global mode changes from changing another window's assets.

The four owned research reports and an independent findings review remain
required before implementation. No central claim is upgraded to game-observed
because a converter or unit test passes.

# Acceptance source candidates and version boundaries

2026-10-22, coordinator read-only inventory. These are candidates for document
and eventual game acceptance, not known-good packages for the installed build.
No game, editor or DLL was executed; no installed data was written. Raw exports
remain outside Git at `S:\Projects\UCP\de-research\acceptance-seeds`.

## Provenance

The existing Serpens research clone is read through pinned Git objects, with no
checkout/ref change. Commit:
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`.
Source prefix:
`Helpers/ActiveAIVDetector/BepInEx/plugins/ActiveAIVDetector_Serp/`.

The [VanillaAIC export manifest](https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Helpers/ActiveAIVDetector/BepInEx/plugins/ActiveAIVDetector_Serp/VanillaAIC/manifest.json)
declares exporter 0.1.0, export time `2026-08-10 18:04:35.973 +02:00`, Steam build
`24651686` and native SHA-256
`33aa33457f7dfaaa6d316d1d5e4c5ab97094f2c73b68d349990abf9d0ef3b469`.
The actual manifest blob is `e1cab30db1dd81d6620e9dc82b3ecac9fdfd318d`, 1056 bytes,
SHA-256 `efc57ed14c67a530c0a8d2e2d666331aa0367448479491c4c0ce8007dc161fc8`.
These are observed manifest declarations, not an independently observed export.

The local app manifest still reports build `24816905`; independently reviewed
local native hash is
`fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`.
Thus the AIC reference export is version-identified but does not match the local
native baseline. The AIC manifest does not establish the neighboring AIV exports'
runtime/version provenance. Their exact pinned bytes can still serve as test
inputs; compatibility must be demonstrated rather than assumed.

## Small candidate set

All paths below are relative to the source prefix. Counts are inventory facts
from parsing the copied JSON; they are not executable-target validation.

| Source | Bytes | Inventory | SHA-256 |
| --- | ---: | --- | --- |
| `VanillaAIC/Rat.lordjson` | 5115 | 117 lord fields; speech field absent | `0374107736fd1c3cf68cbe91b4fb119aea6068af69ae7e971ffe28a5e0b92642` |
| `VanillaAIV/rat1.aivjson` | 7857 | 108 frames; 0 pauses; 7 misc entries; classes 6/8 | `764e2af45fd0c5a30d8889103f31e344ddaa8f96e86b1246b08beb79a6250dca` |
| `VanillaAIC/Nomad.lordjson` | 5118 | 117 lord fields; speech field absent | `f1898edb66bb3e07dfbb849af371a3f5e9b22a51d9508fa014be4fa6329b3ec9` |
| `VanillaAIV/nomad1.aivjson` | 7875 | 105 frames; 0 pauses; 10 misc entries; class 9026 | `630c946da4d5cbde3a372930c71699afb4b2d0e932fa34f986155fb948be022b` |
| `VanillaAIC/Surgeon.lordjson` | 5126 | 117 lord fields; speech field absent | `f7f20479911e97cc10bc88d1a93aa978d9de95800283516637c37103d6566059` |
| `VanillaAIV/surgeon1.aivjson` | 42763 | 440 frames; 0 pauses; 34 misc entries; classes 3/6/7/9/18/9023/9026 | `a12e242ffbee97fd509b3ab6ec2fa216a302a0ec1138d41fcbb0ff54a9677a97` |

`inventory.json` in the external directory records every source path, Git blob,
byte count, hash and copy destination. Copies use exact `git show` bytes, not a
PowerShell text pipeline. Existing differing copies are refused. The legacy local
Kratoloros fixture remains separately identified by report01; it is not substituted
for these exports or treated as evidence for DE-specific features.

## Use in the next workflow

The small Rat source is sufficient to exercise preservation and an existing
scalar edit even though the complete canonical game-export policy reports a
missing speech field. Display that distinction. Do not fill it automatically,
derive it from `opponent_type`, invoke a converter or call this a playable export.

For a later full package, obtain a complete version-identified source or record
an explicit authored choice for every added/changed value using verified field
and identifier contracts. Retain originals and a modification manifest. Actual
isolated loading then decides compatibility. A reference-version mismatch is a
validation obligation, not a reason to replace the source with an all-zero
synthetic AI or postpone every editable-document demonstration.

Add deliberately asymmetric operations, pauses and selected DE markers in separate
owned test variants only after the ordered-castle adapter exists. None of these
unpaused source files proves pause handling. Keep package source identity,
document revision, filename, target profile and game build distinct.

## Reproduction

Run from the explicit Toolkit workdir. Read a source with
`git -C S:/Projects/UCP/de-research/Serpens66-Stronghold-Crusader-DE-Mods show
7e199e6f0818173794bdeeb0c4c32d74500b0eec:<source-prefix><relative-path>`.
For byte copies, capture the child process output as a byte buffer, then compute
SHA-256. Do not use a text shell redirect that may alter encoding/newlines.
Read the corresponding Git blob with `rev-parse <commit>:<path>` and compare
the external inventory. Local installation/workshop inventory supplied no loose
lord/castle candidate; the observed installed Workshop item contained a map.
No player-authored profile was modified or selected as a package source.

# AIVE comparison and Definitive Edition integration

Reviewed 2026-09-20. This is an implementation plan, not a claim of DE support.

## Evidence and limits

The author publishes [AIVE 0.9.6 on ModDB](https://www.moddb.com/downloads/aive-ai-village-editor).
The user supplied the release ZIP. Its 144,240,006-byte size and MD5
`b857fb06bf47a4473733b8037e6bafd9` match the publisher's metadata. Inspected the
archive, configuration, item definitions, translations and bundled converter.
The editor GUI itself has not been tested; configuration evidence confirms
available controls, not their runtime correctness.

`AIVEditor.exe` is a PyInstaller package containing Python 3.10, PySide6/Qt6
and Microsoft runtime DLLs. No separate Python or Qt installation is indicated.
The bundled converter ran successfully without installing a framework. The ZIP
is about 137.6 MiB, so this particular Python/Qt distribution is not evidence
that replacing Electron alone produces a tiny download.

The archive's `plugins/source.txt` identifies the author's public
[AIVConverter repository on Codeberg](https://codeberg.org/SuschisWorld/AIVConverter).
Reviewed commit `25ec0c430029fda0ef268fe7420ccb4048c9f181` (GPL-3.0).
This is converter source, not the editor source; no implementation was copied.

For format evidence, inspected
[IIJanII's converter](https://github.com/IIJanII/AIV-to-AIVJson-Converter/blob/main/src/AIVtoAIVJson.py)
and the local Sourcehold checkout at `4f54a802b622180aab99e2767d8f27b723429def`,
particularly [its AIV JSON exporter](https://github.com/sourcehold/sourcehold-maps/blob/4f54a802b622180aab99e2767d8f27b723429def/sourcehold/tool/convert/aiv/exports.py).
These are separate projects, not AIVE source. No external implementation was
copied into the Toolkit.

## Feature comparison

AIVE's author describes shape/curve drawing, guide lines, reusable structures,
image export, customizable categories, localization, extended analysis, DE
items, pause controls, and a scratchpad. The following comparison is against
the Toolkit code inspected in this branch. Bundled settings additionally confirm
shape tools, guide-line docks, showcase/animation settings, converter profiles
and nine translation dictionaries; these have not been GUI-tested.

| Area | Toolkit status / missing work |
| --- | --- |
| Timeline, move/cut/merge, placement validation | Present; preserve existing behavior |
| Lines and fill | Present; circles, polygons and Bézier tools not found |
| Planning aids | Image reference present; editable guide-line manager missing |
| Reusable structures | Persistent clipboard/groups present; a named multi-template library is a separate gap |
| Presentation | No comparable configurable showcase image export found |
| Appearance | Bundled/custom skins and hotkeys present; interactive category management and full localization incomplete |
| Analysis | Population, resources, fear, routes and fire present; DE-aware validation missing |
| DE editing | Item definitions, timing preservation and safe export require work |
| Scratchpad | Editor remains a 100x100 castle grid |

Prioritize correct DE round-tripping over adding every drawing tool. The
reference-image feature and clipboard should be extended where suitable,
rather than introducing parallel models for the same castle data.

## What the format evidence shows

The converter writes an object containing `pauseDelayAmount`, `frames` and
`miscItems`. Frames use `itemType`, `tilePositionOfsets` (the actual spelling)
and `shouldPause`; miscellaneous markers use `itemType`, `positionOfset` and
`number`. Those names already match the Toolkit's document model. IIJanII calls
Sourcehold with `invert_x=False, invert_y=True`; orientation must be verified
with asymmetric fixtures, not inferred from a visually symmetric keep.

The older third-party converter's names conflict with the supplied AIVE
release: AIVE identifies item 79 as a 10x10 Bedouin Post, not a stockade.
Its definitions identify 9022 Camel Lancer, 9023 Healer, 9024 Eunuch,
9025 Ambusher, 9026 Skirmisher, 9027 Heavy Camel, 9028 Sapper and
9029 Demolisher. Treat these as AIVE definitions pending DE game verification,
not as a universally authoritative game registry.

The shipped config selects `Bedouin2Arab`. Its mappings substitute the Bedouin
Post with the Mercenary Post and several DE troops with classic troops.
These are deliberate compatibility substitutions, not lossless DE export.
The converter source preserves empty frames as `{}`, defaults to Y inversion,
uses multi-tile templates, and stores pause flags separately. Its classic
writer caps the pause array and only writes classic miscellaneous unit indices.
Those restrictions must be surfaced during export rather than silently applied.

Executed the bundled converter against the existing saved `Kratoloros.aiv`,
with an explicit output path outside both the repository and game directory.
It produced valid JSON with 716 frames, 50 miscellaneous markers and pause
amount 100. The first keep anchor is 5643. This is the saved file on disk,
not necessarily the 998-step document shown in earlier editor screenshots.
No original file was modified. This checks executable availability and basic
classic-to-JSON conversion only; no DE game or GUI round-trip was performed.

## Concrete gaps in this branch

1. `main.js` accepts `.aivjson` on open, but Save As offers only classic `.aiv`.
   Quick Save also routes through the native writer. An imported JSON path
   must never receive binary contents just because its document kind is `aiv`.
2. `castle-editor.js::normalizeDocument` removes empty frames and clears
   `shouldPause`; `outputDocument` repeats that normalization. This is
   intentional current classic-editor behavior, but cannot be used as a
   lossless DE importer/exporter. A JSON stringify button alone is insufficient.
3. Classic validation, metadata, footprints, unit limits and the native codec
   do not define all DE items. Unknown DE IDs must not silently become ordinary
   buildings or disappear from saved data.
4. Unit normalization renumbers markers. Preserve DE numbering unless actual
   fixtures establish that it is safe to regenerate; validate per-type limits.
5. The selected classic game installation supplies terrain, graphics and balance.
   Reusing that integration for DE without an explicit game profile would make
   incorrect compatibility promises.

## Implementation sequence

1. **Acquire fixtures and define the contract.** AIVE 0.9.6 is acquired. Obtain a DE game
   export and an AIVE GUI save of the same asymmetric castle. Include rotated gates,
   a displaced keep, a multi-tile wall step, all new unit types, marker numbering,
   empty steps and pauses. Record which behaviors belong to the game versus the
   editor. Validate actual files in both applications before claiming interoperability.
2. **Introduce a format boundary.** Track source/target format explicitly and
   expose import, validate and export functions around one shared castle model.
   Preserve timing and unknown fields during import; keep classic restrictions
   in the classic adapter rather than unconditional normalization. Do not
   change established classic pause behavior implicitly.
3. **Add game profiles to item metadata.** Extend the existing item-based rules
   with verified DE definitions and compatibility flags. Keep faction/category
   display separate from placement rules. Future Bedouin units may need another
   faction group; do not force them into Arabians merely to preserve twelve
   buttons. Drawing and selection continue to share the same pipeline.
4. **Implement explicit DE save/export.** Offer a `.aivjson` target, serialize
   its validated schema through the existing atomic writer, and preserve the
   source on failed conversion. Reject unsupported classic exports with a list
   of incompatible items. Never substitute or discard them silently. Keep
   binary-source preservation limited to matching classic files.
5. **Verify both directions.** Test semantic import/export equality, asymmetric
   coordinate anchors, timing and unknown IDs, save-path/content agreement,
   failure atomicity, and unchanged classic regression coverage. Open Toolkit
   output in AIVE and in DE, then inspect actual construction order and unit
   placement. JSON syntax validation is only the first check.
6. **Then close selected UX gaps.** Build guide lines, named clipboard templates,
   shape/curve generators and showcase export around existing geometry and
   rendering. They are independent of DE file compatibility and should be
   reviewed separately. Avoid a second renderer or document model.

Estimated scope should be revisited after the real files are available. GUI and
game-level verification still remain before a feature-parity or working-DE-export
claim is justified.

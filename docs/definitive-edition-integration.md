# AIVE comparison and Definitive Edition integration

Reviewed 2026-09-20. This is an implementation plan, not a claim of DE support.

## Evidence and limits

The author publishes [AIVE 0.9.6 on ModDB](https://www.moddb.com/downloads/aive-ai-village-editor).
No public AIVE source repository was identified, and the user confirmed ModDB
as the distribution source. Direct download requests returned HTTP 403; cached
mirror URLs were expired. The archive was therefore **not downloaded, inspected
or executed**. Feature comparisons below use the author's release description,
not a hands-on test or an assumption about AIVE's implementation.

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
the Toolkit code inspected in this branch; it does not validate AIVE's claims.

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

The converter maps an optional stockade to item 79 and contains partial DE unit
IDs. Its own interface labels several types unknown. That is evidence that
classic-only validation is insufficient, not a complete or current DE registry.
Obtain real DE files before defining additional units or their limits.

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

1. **Acquire fixtures and define the contract.** Obtain AIVE 0.9.6, a DE game
   export and an AIVE save of the same asymmetric castle. Include rotated gates,
   a displaced keep, a multi-tile wall step, all new unit types, marker numbering,
   empty steps and pauses. Record which behaviors belong to the game versus the
   editor. Resolve the archive-download blocker before claiming interoperability.
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

Estimated scope should be revisited after the real files are available. The
missing archive and game-level verification currently prevent an honest
feature-parity or working-DE-export claim.

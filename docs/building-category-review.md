# Building category review

Compared on 2026-09-20 against Firefly's original **Stronghold Crusader AIV,
Text Compiler & TGX Converter** README, section 4, reproduced with the official
tool package at:
https://www.gamefront.com/games/stronghold-crusader/file/stronghold-crusader-modding-utilities

This is the classic Firefly Village Editor, not the Definitive Edition editor
or a community replacement. The README lists eleven placement groups and a
separate Delete group. The toolkit previously had sixteen groups, including Pause.

| Original label | Toolkit label | Change from previous toolkit |
| --- | --- | --- |
| Wa (Wall) | Walls; Stairs | Keep these separate to accommodate the expanded stair options |
| Ca (Castles) | Castle | Combine Castle, Towers and Keep |
| Ga (Gatehouses) | Gatehouses | Keep separate |
| We (Weapons and Troops) | Military | Combine Military and Weapons |
| In (Industry) | Industry | Keep |
| Mi (Misc) | Units & Siege | Rename Units; clearer than Misc |
| Mo (Moats and Pitch) | Moat & Pitch | Already matches intent |
| Fo (Food) | Food | Keep |
| To (Town) | Town | Keep |
| Go (Good Stuff) | Good Things | Keep familiar existing label |
| Ba (Bad Stuff) | Bad Things | Keep familiar existing label |

Implemented result: twelve placement groups in the original order, with Walls
and Stairs the only additional split. Pause is a compact build-order-panel
button that selects the existing Dummy Step item (200), preserving its existing
map-placement behavior. It does not enable disabled per-frame pause flags.
Delete already has a dedicated editor action and need not become a palette group.

Firefly's list explicitly puts towers, the keep, dog cages and killing pits in
Castle, and workshops, barracks, armoury, guilds and stables together. Existing
dog-cage/killing-pit and pitch corrections should remain. Units & Siege is a
proposed clearer label, not Firefly's literal wording.

The README has inconsistencies (Killing Pit appears twice, and Stairs appears
under both Wall and Gatehouses). Use it to establish grouping intent, not as an
authoritative item-ID table. Retain all supported toolkit items, including later
game additions; do not delete items absent from this list.

Placement behavior now comes from item metadata in aiv_constants.json:
unit markers have kind: unit, walls have defaultTool: line, and Dummy Step has
kind: buildOrder. Existing size, overlap, multiPlacement and lineSequence
properties continue to govern placement. Category labels only organize the
palette and its colors. Per-item saved tool preferences retain priority.

Tests cover regrouping items without changing their default tools or unit
storage, the twelve-group order, and complete item availability.

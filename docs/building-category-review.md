# Building category review

Compared on 2026-09-20 against Firefly's original **Stronghold Crusader AIV,
Text Compiler & TGX Converter** README, section 4, reproduced with the official
tool package at:
https://www.gamefront.com/games/stronghold-crusader/file/stronghold-crusader-modding-utilities

This is the classic Firefly Village Editor, not the Definitive Edition editor
or a community replacement. The README lists eleven placement groups and a
separate Delete group. The toolkit currently has sixteen groups, including Pause.

| Original label | Proposed toolkit label | Change from current toolkit |
| --- | --- | --- |
| Wa (Wall) | Walls & Stairs | Combine Walls and Stairs |
| Ca (Castles) | Castle | Combine Castle, Towers and Keep |
| Ga (Gatehouses) | Gatehouses | Keep separate |
| We (Weapons and Troops) | Military & Weapons | Combine Military and Weapons |
| In (Industry) | Industry | Keep |
| Mi (Misc) | Units & Siege | Rename Units; clearer than Misc |
| Mo (Moats and Pitch) | Moat & Pitch | Already matches intent |
| Fo (Food) | Food | Keep |
| To (Town) | Town | Keep |
| Go (Good Stuff) | Good Things | Keep familiar existing label |
| Ba (Bad Stuff) | Bad Things | Keep familiar existing label |

Recommended result: eleven placement groups. Move Pause to a build-order action
instead of treating it as a building category; preserve its insertion behavior.
Delete already has a dedicated editor action and need not become a palette group.

Firefly's list explicitly puts towers, the keep, dog cages and killing pits in
Castle, and workshops, barracks, armoury, guilds and stables together. Existing
dog-cage/killing-pit and pitch corrections should remain. Units & Siege is a
proposed clearer label, not Firefly's literal wording.

The README has inconsistencies (Killing Pit appears twice, and Stairs appears
under both Wall and Gatehouses). Use it to establish grouping intent, not as an
authoritative item-ID table. Retain all supported toolkit items, including later
game additions; do not delete items absent from this list.

Implementation should separate placement rules from display categories first:
`castle-editor.js` currently reads `state.categories.Walls` for wall behavior.
Renaming or merging that group directly would incorrectly change which items
receive wall behavior. Keep stable semantic type sets; let palette groups only
control presentation. Preserve search, selection and all current placement modes.

No palette changes have been made as part of this review.

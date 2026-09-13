# Character storage and fear helpers

The Character sidebar cards use the existing disclosure and metric styles.
Collapse state is remembered locally; it does not change character files.
The helpers recalculate on character edits, population edits and castle changes.
They use the complete AIV, like the existing Character population summary, not
only the Castle editor's currently displayed step. No simulation or rendering
work is started by these helpers.

Stockpile reserves each resource independently at its configured maximum plus
MaxResourceVariance, rounding each resource up to whole spaces. A keep supplies
one starting stockpile in addition to explicit AIV stockpiles; each has 4 spaces.
All eight stockpile resource limits are reserved, even without a local producer.
Wheat uses MaxFood; iron, pitch, hops and flour use MaxResourceOther; wood,
stone and beer use their own limits. Sell-list resources reserve only variance.

The inspected Crusader 1.41 resource table at 0x005B8D10 supplies these capacities
per stockpile space: wood/stone/iron 48, wheat/flour 32, hops/pitch/beer 16.
Resource IDs come from ResourceType. The remaining-capacity routine 0x0040C1F0
uses that table. These are reference-game constants, not dynamically patched UCP
values. In particular, the inspected table does not support 64 wood per space.

Granaries share 250 food per building (0x0041BC40 and 0x0040C284). Each produced
food reserves MaxFood plus variance. Dairy/apple farm slots or matching AIV farms
activate cheese/fruit; AIV bakeries and hunters activate bread/meat. Duplicate
producers do not multiply the resource limit.

Weapons use MaxEquipment for produced types and TradeAmountEquipment for types
inferred from enabled recruitment groups. The larger limit wins, then variance
is added once. A sell-list weapon instead reserves only variance. Both workshop
settings alternate: the first fletcher/poleturner/blacksmith makes bows/spears/
swords; a second activates crossbows/pikes/maces. Armourers and tanners activate
their respective armors. Recruitment purchases are a planning inference; gold,
recruitment timing and market availability are not simulated.

As explicitly requested, armory planning reserves ceil(amount / 5) separate slots
per weapon type, ten slots per armory. The inspected native capacity check at
0x0040C060/0x0040C0D0 instead subtracts total weapons from 50 without per-type
rounding. The requested slot model is conservative, not native capacity parity.

Fear counts positive mappers 166,169,175,313,318,324 and negative mappers
176,177,301,305,306,307,308,310,311. The game's recomputeAllFearFactors at
0x0040B260 supplies the contributing building classes (dog cages do not contribute).
The requested helper computes clamp(trunc((positive-negative)/ceil(population/16)),
-5,5), with at least one group and the population selected in the Character panel.
The inspected native routine uses floor(population/16)+1, differing at exact
multiples of 16; the helper intentionally follows the requested started-group rule.

Validation covers mixed weapon producers, buy/sell precedence, partial-stack
rounding, granary sharing, shortage reporting and positive/negative fear boundaries.
The Electron smoke check exercises field/castle/population updates and sidebar
collapse/expand. Local UI is not automated; interactive checks run offscreen on
the remote test machine and in CI.

## AIV Troop Behaviour character fields

The separate Character section exposes all 32 optional AIC fields registered by
`aiv-troops-behaviour` 0.2.3 (`behavior/policy.lua`): two common defaults and initial
role/movement overrides for 15 troop types. Dig is available only for Engineer,
Archer, Spearman, Pikeman, Maceman and Slave; the common role accepts only defend.
Movement accepts hold/patrol. Values use the plugin's case-sensitive strings.

Inherit is an editor choice represented by an empty template default and omitted
from saved character JSON, including newly created project characters. It is not
written as a plugin value. Existing unsupported values are displayed explicitly
and retained until edited, rather than silently replacing them. Both field-order
templates and search include the section. Help explains precedence and the need
to enable Troop settings and AIC overrides in UCP, then start a new match.

Schema tests cover every field, supported diggers and omission. The Electron
check changes Slave to dig, saves/reloads it, then resets to Inherit and verifies
that the serialized field is absent. Existing characters gain no default overrides.

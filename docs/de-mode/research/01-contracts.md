# DE LORDJSON, AIVJSON, AI and media contracts

Research date: 2026-10-22. Owned output: `docs/de-mode/research/01-contracts.md`.
Toolkit baseline: `818503dc40971defef3769ca883f82290405ab94`, branch
`de/separate-game-mode`. The goal, working contract and plan were read first.
This is a bounded contract investigation, not game acceptance or implementation.

## Findings that affect implementation

1. **Source-confirmed:** vanilla DE already discovers custom `.lordjson`,
   `.aivjson` and `avatar.png`, and has a separate `CustomMedia/<lord name>`
   loader for speech, video and text. A community loader is not required for
   this basic end-to-end design. Media is a separate installation payload;
   putting WAVs beside the LORDJSON is insufficient.
2. **Source-confirmed:** the installed game declares **118** LORDJSON fields,
   including `opponent_type_for_speech`; the inspected official editor and
   extender PublicAIC converter expose **117**. Do not equate their schemas or
   use either typed serializer as a lossless normalization layer.
3. **Source-confirmed:** preserve all 14 arrays, 24 siege-wall slots, all three
   28-entry starting-force arrays, signed values, misspelled keys, numeric ID
   domains, frame order, pauses, overlapping writes and original marker numbers.
4. **Observed:** the real AIVE `Kratoloros.aivjson` round-trips through the bundled
   converter byte-for-byte, but adversarial fixtures lose markers, metadata,
   ordering information and pauses. The bundled executable also differs from
   the pinned Python source and reports some failures with exit code zero.
5. **Source-confirmed:** vanilla marker indexing is `type * 10 + number`.
   Thirty independent spots need the Fixes extension and its per-lord preference;
   writing marker numbers 10–29 alone does not enable the capability.

Labels used below: **observed** means this task ran a read-only probe or inspected
local bytes; **source-confirmed** means a stated behavior follows from the cited
code/documentation at its pinned identity; **inferred** is an implementation
consequence; **unverified** requires a further runtime/semantic check. A
decompilation plus matching binary hash establishes code provenance, not every
gameplay outcome.

## Evidence and identities

The handoff was used as a lead and checked against its underlying code. Serpens
refs were resolved once and not changed:

- `origin/develop`: `7e199e6f0818173794bdeeb0c4c32d74500b0eec` (all Serpens source
  links below use this commit).
- `origin/main`: `a23aa1b32276d670ffbb2a7b641d23b500d8e298` (native seed also inspected).
- Existing extender source: `4014ca67c96974a5e6d697665baf5351cbfebde6`, clean,
  [upstream](https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/tree/4014ca67c96974a5e6d697665baf5351cbfebde6).
- Existing Sushi converter source: `25ec0c430029fda0ef268fe7420ccb4048c9f181`, clean,
  [upstream](https://codeberg.org/SuschisWorld/AIVConverter/src/commit/25ec0c430029fda0ef268fe7420ccb4048c9f181).
- Fixes examined at `a90f96c176e9c8981af83534f5a8bb444838ae0a`, without changing
  the shared clone's newer HEAD/refs. It was already present when inspected.

Primary evidence keys (line numbers in later sections refer to these exact files):

| Key | Pinned file / relevant lines |
| --- | --- |
| G1 | [Game CustomisationFileManager.cs][G1]: NewAIC 157–400; discovery 463–755; media text 758–827 |
| G2 | [Game AIVLoader.cs][G2]: JSON classes and raw writer 4–85 |
| G3 | [Game EngineInterface.cs][G3]: transfer struct 770–1525; public→transfer 4303–4586; wire codec 4589 onward |
| G4 | [Game ConfigSettings.cs][G4]: built-in lord folder names 302–307; directories 2573–2605, 2629–2652 |
| G5 | [Game SFXManager.cs][G5]: mood mapping 940–971; custom WAV 1360–1388; custom video 1797–1856 |
| G6 | [Game FRONT_Multiplayer.cs][G6]: custom join/kick WAV paths 3503–3514, 5295–5306 |
| E1 | [Official-editor JsonReadWrite decompilation][E1]: schema 26–267; LORDJSON load/save 386–395 |
| E2 | [Official-editor LordViewModel decompilation][E2]: direct field bindings 4749–5016; selection tables 5021 onward |
| E3 | [Official-editor Frame.cs][E3]: export 17–24; [FrameManager.cs][E4] export loop 77–84 |
| N1 | [Native decompilation][N1]: Y transform 47940–47946; importer 48911–49387 |
| S1 | [Extender PublicAIC.cs][S1]: properties 3–121; conversions 123–245, 248–570 |
| S2 | [Extender InternalAIC.cs][S2]: binary layout 5–385 |
| S3 | [Extender Enums.cs][S3]: goods 5–69; chimps 72–164; mappers 180 onward; troops 1338 onward; [eStructs.cs][S4] |
| S5 | [Extender AIDefensivePositionClass.cs][S5]: classes 15–65; [AivMiscItemType.cs][S6] 7–32 |
| S7 | [Extender GameAIManagerAPI.cs][S7]: registration 221–286; media 632–769 |
| S8 | [LordInfo.cs][S8], [LordMessageClip.cs][S9], [ModInfo.cs][S10], [asset API guide][S11] |
| C1 | [Sushi aivconverter.py][C1]: classic→JSON 462–569; JSON→classic 637–788 |
| F1 | [Fixes ExpandedGuardingSpotsDetours.cs][F1]: constants/buffers/import hook 24–124 |
| F2 | [Fixes preference declaration][F2] 8; [FixesAIEvents.cs][F3] 308–361; [FixesMapEvents.cs][F4] 63–71 |

**Observed local hashes (SHA-256):**

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| Game `..._Data/Managed/Assembly-CSharp.dll` | 3,693,056 | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| Game `..._Data/Plugins/x86_64/CrusaderDE.dll` | 3,451,392 | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |
| AIVE 0.9.6 `AIVEditor.exe` | 87,437,520 | `6474c8b7433e99532d5d4a90d1ffe40f9e3fb6b652ed5b917529e46c05ec12b4` |
| AIVE bundled `plugins/aivconverter.exe` | 26,879,697 | `a1825e1e4a04c68e0222b60bde4283383ad6a0e87cc7bacbb3ec918f12e18e04` |

The two game hashes match the pinned managed/native baseline. The editor
decompilation's stated assembly hash is
`3735ef057cac15c7173b3cecb12801e2b76a9a913f87dc4131419b7ad5bf1b64`;
**unverified locally:** no corresponding installed official-editor assembly was
found in the inspected Steam libraries, so this task did not recompute that hash.
Treat editor-only observations as version-specific until independently reproduced.

**Observed native cross-check:** direct PE spans at RVA `0x53CA0` (32 bytes) and
`0x55320` (2648 bytes) reproduce baseline raw hashes
`a8d769884d471c4b58fdcbc3d5c50aa72e02104f3f55e49970b8b92e9d1a2b31` and
`82c2ec8b15861341f35073bf176c2c19e5fd76ab5b1d3344d9b8c7e5209ec645`.
A contiguous-span experiment at `0x53D00` does not reproduce its metadata hash:
the [exporter][N2], lines 73–78, hashes listed instructions, while `size` is the
function body's address count. Those are not guaranteed contiguous bytes. This
was a probe-method limitation, not evidence of a different whole binary; no
direct per-function match is claimed for `0x53D00`.

## LORDJSON: known schema and preservation rules

**Source-confirmed, G1:157–400/G3:4303–4586:** root object contains `lord`;
every known member is signed `Int32` or an array of signed `Int32`. The complete
118-field inventory is in Appendix A, with declaration lines, array lengths,
initializers and first internal-struct offsets. It is a syntactic inventory,
not a complete semantic or permissible-value specification.

- Preserve exact keys: `chance_of_harrasment`, `chance_of_seiging`,
  `harrasment_*`, `harrass_delay`, `siege_herring_*`, `siege_assasin_amount`.
- `farm_types[8]`, `sell_all[15]`, three chance arrays `[3]`,
  `troop_production_rate[3]`, defensive/harassment troops `[8]` each,
  harassment/siege machines `[8]` each, `siege_wall_troops[24]`, and three
  starting-force arrays `[28]` must remain independent, ordered arrays.
- The game transfer indexes every known array position directly. Missing/null/
  undersized arrays therefore need diagnostics before game export. S1:562–565
  pads absent positions to zero, which is a converter policy rather than proof
  that vanilla accepts the original input. Extra array positions must survive
  editing even though the current transfer reads only known positions.
- G1 declares final defaults `siege_max_troops=200`,
  `siege_normal_wave_multiplier=5`, `siege_high_gold_wave_multiplier=7`.
  C# initializers do not prove Unity's missing-field deserialization behavior.
  S1's equivalent scalar properties have no such initializers. Do not invent a
  single cross-format defaulting policy from either declaration.

**Important schema mismatch:** G1:167/G3:4308 contain
`opponent_type_for_speech`; E1's NewAIC omits it. S1:128 omits it on export and
S1:254 sets it to `opponent_type` on import. A LORDJSON with different values for
these two fields cannot round-trip faithfully through that converter.

**Source-confirmed binary distinctions:** `.baic` is a packed 1508-byte,
377-word raw native structure (S2). It includes `extendedLordParent` at `0x0450`
and 97 reserved words from `0x0460` through `0x05E0`. Public conversion
reconstructs a new zeroed structure, omitting parent/reserved data. The game's
`EncodeLordConfig` is a different wire representation: a version word `2`, then
279 explicitly serialized public words, **1120 bytes total**, without native
parent/reserved storage (G3:4589–4873). Neither wire encoding nor classic AIC is
an alias for DE BAIC. For binary editing retain the original bytes and change
only verified offsets; retain unmapped bytes and reject size/version mismatch.

### IDs and values that must not be conflated

**Source-confirmed:** a UI selection index is not generally the stored ID.
Use the enum specific to the field, keeping an escape hatch for unknown values.

| Domain / field | Verified values and source |
| --- | --- |
| `farm_types` | structure IDs None 0, Wheat 30, Hops 31, Apple 32, Dairy 33; E2 farm options and S4 |
| Same farms in AIV frames | mapper IDs Wheat 70, Hops 71, Apple 72, Dairy 73; S3 mapper enum |
| Workshop production | blacksmith Maces 21/Swords 22; fletcher Bows 17/Crossbows 18; poleturner Spears 19/Pikes 20; **Both −999** for all three; E2:5282–5331 |
| Popularity | editor scales by 100: 6500 displays as 65; E2:678,711,740 and 4752–4754 |
| Religion and ale | editor offers 0/1/2 (none/low/high), not booleans; E2 collections after 5147 |
| `lord_gfx_type` | Crusader 0, Arabic 1, Bedouin 2, female Crusader 4, female Arabic 6, female Bedouin 7; E2:5114–5145 |
| `who_to_pick_on` | Richest 0, Weakest 1, Closest 2, Any 3, Human 4; E2:5924–5950 |
| `siege_machines` | chimp IDs Catapult 39, Trebuchet 40, Mangonel 41, Siege Tower 58, Ram 59, Shield 60, Ballista 61, Fire Ballista 77; E2:5853 onward |
| `harrasment_machines` | mapper IDs Catapult 190, Trebuchet 191, Siege Tower 192, Ram 193, Shield 194, Fire Ballista 358; E2:5815–5851, bindings 4865–4872 |

Goods IDs (S3:40–69) are 0 None, 1 Wood Logs, 2 Wood Planks, 3 Hops,
4 Stone, 5 Hides, 6 Iron, 7 Raw Pitch, 8 Refined Pitch, 9 Wheat, 10 Bread,
11 Cheese, 12 Meat, 13 Apples, 14 Ale, 15 Gold, 16 Flour, 17 Bows,
18 Crossbows, 19 Spears, 20 Pikes, 21 Maces, 22 Swords, 23 Leather Armour,
24 Metal Armour. These are enum identities, not permission to offer every good
in every field; e.g. editor choice restrictions and runtime categories can differ.

| Unit | AIC chimp ID | AIV defensive class | Starting-force index |
| --- | ---: | ---: | ---: |
| Archer | 22 | 6 | 0 |
| Crossbowman | 23 | 7 | 1 |
| Spearman | 24 | 8 | 2 |
| Pikeman | 25 | 9 | 3 |
| Maceman | 26 | 10 | 4 |
| Swordsman | 27 | 11 | 5 |
| Knight | 28 | 12 | 6 |
| Engineer | 30 | 1, oil-smelter role | 8 |
| Monk | 37 | no ordinary marker asserted | 9 |
| Arabian Archer | 70 | 16 | 10 |
| Slave | 71 | 13 | 11 |
| Slinger | 72 | 14 | 12 |
| Assassin | 73 | 15 | 13 |
| Horse Archer | 74 | 17 | 14 |
| Arabian Swordsman | 75 | 18 | 15 |
| Fire Thrower | 76 | 19 | 16 |
| Fire Ballista | 77 | 5 | 17, editor resets to zero |
| Camel Lancer | 78 | 22 / high form 9022 | 20 |
| Bedouin Healer | 79 | 23 / 9023 | 21 |
| Eunuch | 80 | 24 / 9024 | 22 |
| Ambusher | 81 | 25 / 9025 | 23 |
| Skirmisher | 82 | 26 / 9026 | 24 |
| Heavy Camel | 83 | 27 / 9027 | 25 |
| Sapper | 84 | 28 / 9028 | 26 |
| Demolisher | 85 | 29 / 9029 | 27 |

Table provenance: S3:72–164, S5:15–65, E2:4942–5016. The AIV high form is a
serialization convention established by G2's `>9000` subtraction, not a fifth
unit enum. `eTroops` is another domain (e.g. Archer 1, Crossbowman 4,
Camel Lancer 27), and people-placement mappers 400–407 are not defensive classes.
S6 stops at class 21; do not use that older short enum alone to reject valid
Bedouin class values. Classes 20/21 mean Brazier/Flag to the AIV misc consumer,
but are reserved in S5's defensive-unit enum.

**Unverified slots:** starting-force indices 7,18,19 have no binding in this
editor's loader. Preserve them. E2:4966,4991,5016 actively set index 17 to zero
while loading; official-editor save is therefore not a general preservation
oracle. Runtime meaning/support for these slots still needs an isolated test.

## AIVJSON, ordering, timing and binary representation

**Source-confirmed G2:4–33:**

```text
root: { pauseDelayAmount: Int32, frames: Frame[], miscItems: Misc[] }
Frame: { itemType: Int32, tilePositionOfsets: Int32[], shouldPause: Boolean }
Misc: { positionOfset: Int32, itemType: Int32, number: Int32 }
```

The `Ofsets`/`Ofset` spellings are contractual. There is no declared schema/version
member in these classes. Preserve extension members at root, frame and misc
levels; a future version may use them. Offsets are in a 100×100 local grid,
`p=100*y+x`; preserve list order and duplicates, not just set membership.

**Source-confirmed G2:35–84:** DE BAIV is little-endian signed Int16 words:

1. Pause amount; pause-list count; pause-list words. Writer starts with sentinel
   0 and assigns JSON frame index `k` the pause number `k+2`.
2. Frame count, then each frame. One offset emits `[type, offset]`; any other
   offset count emits `[-type, count, offsets...]`.
3. Misc count, then each `[type, offset, number]`. For a misc type **greater than
   9000**, subtract 9000 **once** before narrowing; it is not a general modulo.

All counts, IDs and offsets are narrowed to short without compatibility guards.
Reject overflow for executable export rather than silently reproducing wrapping.
The pause list's 50-word limit includes its sentinel: only **49** frame pauses
are represented. Later `shouldPause=true` entries remain valid editable input
but do not survive this game-writer conversion. High/low marker spelling also
cannot be uniquely reconstructed from BAIV.

**Source-confirmed N1:49184–49221:** the native counted branch is `type < 0`;
zero is a single-position write. `[0,offset]` clears a cell's mapper and updates
its frame index. JSON `type=0` with multiple offsets cannot be represented by
negating the type: `-0` remains zero and desynchronizes the record interpretation.
Treat exactly one zero-type offset as its own supported operation; preserve
other forms in the document but block executable export pending an explicit
conversion decision. Empty lists with a positive type are structurally distinct
from missing/null lists. G2 dereferences `.Count` directly; `{}` and
`{"shouldPause":true}` have **unverified Unity deserialization/runtime behavior**,
even when an external editor retains them.

**Source-confirmed N1:47942–47945,49199–49223:** the importer transforms offset
`p` to `p - 200*(p/100) + 9900`, i.e. `(x,99-y)` for valid nonnegative grid
offsets. Footprints expand in positive imported X/Y. Consequently a size-s
square anchored at file `(x,y)` covers file columns `x..x+s-1`, rows
`y-s+1..y`; rotating only the anchor is insufficient to reproduce the prepared
raster. Frame application overwrites earlier cells and their build indices.
Keep an ordered operation list as the source of truth; derive a raster for
rendering. Full rotation, keep-origin and fit/boundary semantics need the
runtime track's independent validation; this report does not claim a complete
native construction simulator.

**Source-confirmed official timing documentation:** Firefly describes the global
pause amount in units of 50 game ticks; amount 100 corresponds to 5000 ticks,
shown as 125 seconds. Resource waits can absorb a due pause. Build order is an
attempt order and can be deferred for lack of resources. These are documented
semantics, **not a wall-clock observation in this task**. Do not apply this unit
to similarly named LORDJSON timing fields without separate evidence. See the
[official guide][OFFICIAL], “Build Steps” and “Pause Delay”.

### Guard spots: vanilla versus Fixes

**Source-confirmed N1:48945,49380–49383:** vanilla clears `0x500` bytes (320
Int32 positions), then writes `buffer[type*10+number]`. Number 10 aliases the
next class's slot 0. Duplicate addresses are last-writer-wins. Addressing within
the buffer alone does not prove the intended unit will use that slot.

**Source-confirmed F1:24–124/F2:8/F4:63–71:** Fixes allocates 30 slots per class,
hooks misc decoding and downstream defensive assignment, defaults per player
to 10, and clamps requested capacity to 10–30. For an explicit 30-spot package:

```text
<lord folder>/Override/Fixes/preferences.json
{"GuardingSpotsPerUnitType":30}
```

F3:314 uses `Override/fixes/preferences.json` for Extended Lords; its custom-lord
asset lookup uses normalized `override/fixes/preferences.json` at line 352.
Use the documented `Override/Fixes` layout on Windows and let a loader adapter
handle its normalization. Export this setting as a loader dependency, never as
a fabricated LORDJSON property. Preserve original spot numbers, including gaps;
their identity is not merely their order in `miscItems`. This source capability
has not been exercised in a game session here.

## Exact conversion losses and observed probes

There are three different conversions: JSON editing, DE JSON↔raw DE binary, and
DE↔classic binary AIV. A result in one does not establish another.

### Sushi source at the pinned commit

**Source-confirmed C1** (not necessarily the bundled executable):

| Operation | Data changed/lost |
| --- | --- |
| JSON→classic, 637–650,705–727 | Rebuilds raster layers; overlapping operations collapse to their final per-cell mapper/step. Earlier placements cannot be reconstructed from that raster. |
| JSON→classic, 579–601,723–724 | Unknown mapper is skipped. Moat variants map back to `MOAT_a`; available enum mapping is not bijective. |
| JSON→classic, 671–677 | User profile mappings can substitute templates. The inspected `user_mappings.json` maps frame mapper 79 to 86 (Bedouin Post→Mercenary Post). Its 902x entries do not fix misc markers because this mapping branch runs only over frames. |
| JSON→classic, 711–728 | Out-of-bounds template/tile placement is skipped, rather than retained as an operation. |
| JSON→classic, 730–737 | Inserts a default keep when absent; pause list is truncated to 50 entries including sentinel. |
| JSON→classic, 741–748 | Only low misc types `0..23` and numbers `0..9` are emitted. High-form classes and Bedouin low classes 24–29 are omitted. Duplicate class/number addresses overwrite. |
| Classic→JSON, 543–550 | Skips zero location entries and assigns a dense new `number`; a sparse original spot 4 can become spot 1. |
| Classic→JSON, 515–558 | Only surviving cells provide operations. Empty frames become `{}`, losing pause flags that had no surviving placement. Different items sharing a step cannot remain distinct typed operations. |
| JSON→classic, 753–783 | Regenerates fixed sections/version 200; resets camera, random state and ground data. Extra JSON properties and unrelated original classic sections are not preserved. |

**Observed source-function probe:** exact source functions were imported with
bytecode writes disabled. Only `pack_section`/the unavailable compression module
boundary was replaced to capture raw payloads and feed their raw sections back
to `convert_aiv_to_json`. No compression or section-directory parser is claimed
tested by this probe. Results are retained in `source-converter-probe.json`.
`markers` loses three of five entries and renumbers 4→1; `overlap_unknown` turns
three frames into two, with no remaining pauses or unknown property;
`pause_overflow` retains 49/51 pauses; `empty_zero` loses the zero clear, final
frame and pause-only annotation. A real-fixture source round trip retains the
716 frame count, but that is not a general preservation guarantee.

### Bundled AIVE 0.9.6 converter binary

**Observed**, using its hash above, with every input/output under the owned
research directory and original fixtures read-only:

| Fixture | Result after JSON→classic→JSON |
| --- | --- |
| `markers` | 5 misc entries→2; original class 6 spot 4 becomes spot 1; number 10, type 9022 and type 29 vanish. |
| `overlap_unknown` | 3 frames→2; output types `[61,46]` (injected keep); 2 pauses→0; root/frame extension data disappears. |
| `pause_overflow` | 51 paused wall frames→52 frames including inserted keep; only 49 pauses survive. |
| `empty_zero` | No binary output; stderr `KeyError: 'itemType'` at converter line 574; **process exit code 0**. The subsequent missing-input failure also exits 0. |
| Real `Kratoloros.aivjson` | 716 frames, 50 misc, 0 pauses; final JSON SHA-256 equals original file exactly. Its markers use old low classes and it exercises none of the adversarial preservation cases. |

Thus the packaged tool is not proven to be built from C1: it injects a visible
keep and fails on ghost frames where the inspected source uses a different
policy. Neither its exit code nor its README “bidirectional” claim is sufficient
validation. Do not bundle this as an invisible lossless conversion backend.

The real fixture is
`S:/Projects/Harness/ai-toolkit-setup/reference-aive-0.9.6/Kratoloros.aivjson`,
112926 bytes, SHA-256
`a11f3d7533d44f2bbb9d930ae729e53a7dbdc4f516e8060532712a3d0afa7df9`.
It is local reference material, not a proposed distributable game-asset fixture.

**Observed additional LORDJSON fixture:** [Serpens Rat.lordjson][RAT] is 5115
bytes, SHA-256 `0374107736fd1c3cf68cbe91b4fb119aea6068af69ae7e971ffe28a5e0b92642`.
It has root `lord`, 117 fields and all expected arrays; it omits the speech field.
It is a third-party exported snapshot, not independent proof of vanilla defaults.
Local `CustomLords` and `ExtendedLords` contained no files; the installed game
tree contained no loose `.lordjson`/`.aivjson` fixtures. No claim of testing an
existing local player-authored lord is made.

### Extender binary converters

**Source-confirmed S1/S2:** BAIC→public→BAIC loses speech differences, parent
identity and reserved words; a fresh native structure fills omitted storage
with zero. Null/short public arrays become zero-filled known slots; extra
positions are ignored. Unknown JSON members are not extension storage on the
typed PublicAIC/InternalAIC classes. Internal JSON preserves the declared
377-word layout, not arbitrary future fields or binary tails.

The [AIV encoder][S12], lines 23–73, reproduces G2's 49-pause limit and high-type
subtraction. The [decoder][S13], lines 47–61, collapses pause indices into a set,
and lines 124–129 only warn about trailing words. Such files cannot be promised
byte-identical after reconstruction (noncanonical pause order/duplicates,
sentinel variants and tails). `--restore9000` is explicitly a heuristic. Preserve
raw input to support truly unchanged binary saves; do not infer low/high source
spelling from normalized BAIV alone.

## Vanilla lord discovery and media package

**Source-confirmed G1/G4:** base is
`%USERPROFILE%/AppData/LocalLow/Firefly Studios/Stronghold Crusader Definitive Edition`.

```text
CustomLords/My Lord/Default.lordjson
CustomLords/My Lord/Castle One.aivjson
CustomLords/My Lord/Castle Two.aivjson
CustomLords/My Lord/avatar.png
CustomMedia/My Lord/text.txt
CustomMedia/My Lord/TAUNT1.wav
CustomMedia/My Lord/ADD_PLAYER.wav
CustomMedia/My Lord/KICK_PLAYER.wav
CustomMedia/My Lord/angry.webm
CustomMedia/My Lord/happy.webm
CustomMedia/My Lord/neutral.webm
CustomMedia/My Lord/sad.webm
```

G1:622–648 scans immediate files only, sets custom `lordType=-1`, and registers
a custom lord only when at least one AIV and one config loaded successfully.
Filenames become display names; multiple variants are supported. Invalid JSON
or failed conversion is swallowed in this discovery path, so Toolkit should
validate before installation and report which variant failed.

G1:727–746 accepts only `avatar.png`, smaller than **80000 bytes**, and exactly
**144×144**. This is the selection portrait, separate from videos and
`lord_gfx_type` (in-world appearance). `.data`/`.ldata` are upload-info markers,
not AI data. G4:302–307 lists 29 Extended Lord folder names, currently ending in
`Baldwin`, `Bullseye`, `Surgeon`, `Baibars`. Do not derive these folder names
from extender enum identifiers. Workshop identity can include the item-ID prefix
(G1:628–632); retain actual source path/identity when choosing a variant.

**Source-confirmed official support:** Firefly's [guide][OFFICIAL] distinguishes
Extended Lords from named Custom Lords, documents the avatar, and directs custom
media authors to the game's `StreamingAssets/CustomMediaExample/ReadMe.txt`.
It says custom media is shared separately from Steam Workshop. Do not claim
Workshop uploads carry vanilla media with them.

### Media file and subtitle contract

**Observed official local fixtures:** `..._Data/StreamingAssets/CustomMediaExample`
contains **32 WAVs, four WebMs, `text.txt`, `ReadMe.txt`**. Its README says “30
speech files”; the actual payload and its own list include 30 message WAVs plus
the two lobby WAVs. Treat this as a counting distinction, not two missing clips.

The README SHA-256 is
`7962a7cded30b14a2022d40011078d41631bb2e1b337bf521e134b975acdd2f9`;
`text.txt` is 2455 bytes, SHA-256
`8d9d9dadad7d4b089a62b2b153b1ec6e3a1ff04910b87606bade51ba001a3d45`.
All local media hashes are retained outside Git in `media-fixture-hashes.json`.
`TAUNT1.wav` is PCM mono, 16-bit, 44100 Hz (observed sample, not an exclusive
format constraint). `angry.webm` is VP8, 348×348, 5.9 seconds with no audio
stream in the inspected example. README recommends VP8/Vorbis, 348×348 video;
the loader accepts paths, while actual codec compatibility needs runtime testing.

**Source-confirmed G5:940–971:** 30 message stems and corresponding video moods:

| Video | WAV stems |
| --- | --- |
| `angry.webm` | TAUNT1, TAUNT2, TAUNT4, ANGRY_SIEGE_LOST, VICTORY_HARASS, KILL_PLAYER, WONT_HELP, NOT_SENDING_GOODS |
| `happy.webm` | VICTORY_GOOD, THANK_GOODS, CONGRATS_ON_KILL, BOAST_OF_KILL, TEAM_WINNING, WILL_ATTACK_ENEMY |
| `neutral.webm` | TAUNT3, NERV_PRE_SIEGE, NERV_WEAK, KILL_NPC, REQUEST_GOODS, ALLY_NEED_HELP, ABOUT2SIEGE, SENT_GOODS, WILL_SEND_TROOPS |
| `sad.webm` | ANGRY_CASTLE_DAMAGED, DEFEAT, DIE_ALLY, CANT_ATTACK, WONT_ATTACK, CANT_HELP, TEAM_LOSING |
| lobby audio only | ADD_PLAYER, KICK_PLAYER |

Every WAV stem has `.wav` appended. G5 strips the `SK_` prefix from the internal
message name and checks the corresponding local file, falling back to generic
speech if absent. Custom videos use absolute URIs when their files exist;
otherwise built-in video fallback remains (G5:1797–1856).

G1:418–424 declares 41 text-tag slots: message IDs 1–19, unused 20–22,
messages 23–33, nicknames 34–41. The local `text.txt` has the 30 named message
keys plus `NICKNAME1`…`NICKNAME8`, **38 lines**, and no lobby subtitle keys.
Parsing is `key=value`, case-folded/trimmed key, trimmed value/outer quotes.
Repeated `=` characters are removed when later split segments are concatenated
(G1:768–790); do not silently rewrite a user's original file to match that parser
quirk. Duplicate recognized keys take the last nonempty value. Nicknames fall
back to localized defaults if missing and are truncated to 20 characters
(798–807). Unknown lines and comments should survive Toolkit edits.

**Source-confirmed limitation:** vanilla media is keyed by folder/display name,
not unique Workshop identity. The shipped README explicitly warns that two
lords with the same name use the same `CustomMedia/<name>` content. Plan an
overwrite/collision preview and reversible install across both roots. G1 scans
local `CustomMedia` text, and G5/G6 load the local files; shipping media inside
the lord directory or assuming it arrives with Workshop content is insufficient.
Language-specific vanilla media folders are **unverified**; the inspected path
has no locale layer. Nickname fallback localization does not establish media
localization support.

## Extender lord package: separate optional capability

**Source-confirmed S7:221–286:** this path builds on a lord discovered by the game.
It additionally reads `info.json` (ModInfo), `lordmeta.json` (LordInfo), registers
the folder as an asset provider, then optionally runs `init.lua`. It does not
remove the need for playable `.lordjson`/`.aivjson` variants.

`info.json` fields include GUID, Author, Name, Description, Version, Dependencies,
Website, VersionCheckUrl, WorkshopUrl, Manifest, AssetMode and NetworkMode (S10).
For private per-lord media prefer the verified `AssetMode: Local` capability:
S7:764–769 qualifies references with provider GUID. It is opt-in; Global is the
ModInfo default. Capability/version checks must precede relying on Local.

`lordmeta.json` fields (S8): `LocalizedDisplayName`, `LocalizedTitles`,
`LocalizedDescription`, `LocalizedDifficultyRating`, `LocalizedFavouriteTroops`,
`LocalizedCastles`, `LocalizedPlayStyle`, `LocalizedFavouriteSaying`, `FacePath`,
`JoinAudioPath`, `LeaveAudioPath`, `Messages`, `IncomingMessage`.
Each `Messages` entry maps an `AILordMessageType` name to a list of clips with
`VideoPath`, `AudioPath`, `LocalizedText` (S9). S7:272 parses keys case-insensitively;
729–755 selects a clip using deterministic random and caches subtitle text.
Locale dictionaries fall back to `en-US` in the inspected code.

Example path mapping (S11:101–108), **not an installed package**:

```text
lordmeta FacePath: Assets/GUI/Sprites/face.png
actual file:      <lord>/Override/Assets/GUI/Sprites/face.png
lordmeta audio:   EnglishSpeech/MyLord/taunt.wav
actual file:      <lord>/Override/EnglishSpeech/MyLord/taunt.wav
localized asset:  <lord>/Override/Locales/de-DE/<same asset-relative path>
```

Vanilla `avatar.png` constraints do not prove the extender accepts every arbitrary
portrait size, nor does the broader Asset API prove a specific package played
correctly. Built-in lord override is a third path: `Override/AIV/SK_RAT_0.aivjson`
versus `Override/AIC/SK_RAT.baic` (S11:489–565). The AIC override expects **binary
BAIC**. Retain these capabilities and manifests separately from vanilla export.

Sushi's older AIDE author page describes `.aicjson`, `_spawn.json`, `_unit.json`
and UML/AI-Framework packaging, predating the official LORDJSON workflow. This
is [author-published context][AIDE], not evidence that those files are vanilla
LORDJSON inputs. No unverified AIDE↔LORDJSON migration is recommended.

## Recommended lossless codec and implementation sequence

**Inferred design recommendations, not implemented here:**

1. Detect format by content plus extension. Separate `de-lordjson`,
   `de-aivjson`, `de-baic`, `de-baiv`, classic AIV and UCP-character formats.
   `.aijson` is a Toolkit alias, not a verified vanilla extension. Do not let
   a shared `.json` extension choose the character model.
2. Make a JSON syntax tree/original bytes the document source of truth. Keep
   unknown fields at every level, missing/null distinctions, all array tails,
   duplicates/order, signed values and unknown numeric tokens. Unchanged save
   should reuse original bytes; edited save should patch only selected values.
   Warn about duplicate known object keys rather than resolving them silently.
   Keep unknown numbers beyond JavaScript's safe integer range as lexical tokens.
3. Overlay the 118-field schema and field-specific catalogues for UI. Create
   new files from a complete, version-identified template. Existing import must
   not fill absent values from classic/UCP defaults, normalize unknown IDs,
   truncate arrays, reassign guard numbers or erase unsupported fields.
4. Build an explicit executable-export validator distinct from preservation:
   Int32 known values; Int16 BAIV narrowing/counts; grid bounds; null/missing
   lists; zero-type count; 49-pause limit; vanilla ten spots versus configured
   Fixes capacity. Expose errors before any installation. Successful parsing
   does not label unknown mapper semantics as verified gameplay support.
5. Implement vanilla package planning first: immediate lord files, portrait
   validation, distinct `CustomMedia/<name>`, collision preview and a reversible
   manifest recording source/target/hash/preexisting files. Include source
   identity and configuration/AIV variant selection. Packaging should be
   independent of the game installation's binary directory.
6. Then add the extender adapter for provider-local media/locales, dependency
   metadata, optional scripts and Fixes preferences. Use raw BAIC patching for
   binary overrides, not public-converter reconstruction. Treat 30 spots as an
   explicit loader capability with game/SE/Fixes versions in the package plan.
7. Implement classic conversion last as a reportable transformation. Produce
   a per-field/per-frame/per-marker loss list and a separate output document.
   Refuse a “lossless” claim where chronology, DE IDs, arrays, pauses or media
   cannot map. Obtain an explicit conversion choice through the normal user
   workflow before allowing substitutions/deletions; preserve the DE original.
8. Parent-owned isolated game acceptance must verify vanilla and each selected
   loader profile separately: discovery, variant selection, real construction,
   guarding assignments, portrait, lobby audio, taunt text/video, save/load and
   ordinary versus pre-built castles. This task did not launch the game/editor.

### Focused synthetic fixtures to commit later

Use small self-authored data with deterministic expected changes; leave the
local proprietary/reference media outside Git. The probe's cases are research
artifacts, not yet a production regression suite.

| Fixture | Required assertion |
| --- | --- |
| `lord-all-fields` | All 118 keys, correct 14 lengths, negative −999, differing opponent/speech IDs, root/lord extensions; unchanged bytes and one-field patch preservation. |
| `lord-array-edges` | Missing/null/short/long arrays, unknown ID, unknown large integer token; preservation succeeds and executable validation reports the exact affected path. |
| `start-forces` | Distinct nonzero values in every slot of every 28-array, including 7/17/18/19; all 24 wall troop slots survive. |
| `id-domains` | Farm 30 versus mapper 70; harassment Catapult 190 versus siege Catapult 39; production −999; chimp78 versus marker9022 versus starting slot20. |
| `aiv-order-clear` | Overlapping wall/building/zero-clear operations and duplicate offsets; operation order survives editing; derived raster matches last writer. |
| `aiv-pauses` | First/last, 49/50/51 true entries, empty list versus missing/null list, `{}`, pause-only frame; no silent drop; game-export compatibility reported separately. |
| `spots` | Low/high representation, sparse numbers, duplicates, types22–29, numbers9/10/29/30; no renumbering and correct vanilla/Fixes validation. |
| `asymmetric-castle` | Offset keep, both gate orientations, nontrivial footprint/overlap, all four rotations; compare coordinates to independently checked native behavior. |
| `baic-opaque` | Nonzero speech/parent/reserved words and raw hash; editing one mapped field changes exactly its four bytes; unknown bytes remain. |
| `baiv-opaque` | Noncanonical pause order/duplicates, trailing words, high/low ambiguity; unchanged raw save versus explicit normalized export. |
| `vanilla-media` | Generated 144×144 avatar just below/at 80000 bytes; 32 WAV stems and four video names; text with `=`, duplicates, unknown keys, long nickname; planned paths verified without install. |
| `package-identity` | Same visible lord name from two sources, local and Workshop variants, locale overrides, spaces/umlauts; preview detects shared vanilla media destination. |
| `classic-losses` | Research marker/overlap/empty/51-pause probes produce stable diagnostics; zero-exit converter failure is never interpreted as success. |

## Reproduction and unresolved work

Owned research directory: `S:/Projects/UCP/de-research/contracts`. It contains
the read-only probe script, cached pinned sources, manifests and results. All
Toolkit commands used explicit `workdir=S:/Projects/UCP/AI-Toolkit-DE`; sources
were inspected through their own explicit directories. No clone update, checkout,
ref mutation, source edit, commit, push, CI, PR, release, game launch or installed
game/application write was performed. Only this report is written in Toolkit;
other pending Toolkit files belong to the parent/other research tracks.

Reproduce from Toolkit working directory (all generated outputs stay outside Git):

```powershell
python -X utf8 S:\Projects\UCP\de-research\contracts\probe_contracts.py cache
python -X utf8 S:\Projects\UCP\de-research\contracts\probe_contracts.py fixtures
python -X utf8 S:\Projects\UCP\de-research\contracts\probe_contracts.py converter
python -X utf8 S:\Projects\UCP\de-research\contracts\probe_contracts.py source_converter
python -X utf8 S:\Projects\UCP\de-research\contracts\probe_contracts.py native_spans
python -X utf8 S:\Projects\UCP\de-research\contracts\probe_contracts.py media
```

`source_converter` uses installed NumPy and deliberately bypasses only compression
as documented. `native_spans` uses the existing read-only `pydeps/pefile` reference.
Attempts to install a compressor into the owned directory failed (`dcl-pke` absent;
`dclimplode` Python 3.14 build error), so no full-source compression test is claimed.
The packaged binary probe does exercise its actual compressed AIV output.
`converter-probe.json` includes argv, stderr, exit codes and output hashes;
`source-converter-probe.json`, `fixture-inventory.json`, `native-spans.json`,
`source-manifest.json`, `media-probe.json` and `media-fixture-hashes.json` retain
supporting results.

Remaining questions, in priority order:

1. **Unverified:** actual vanilla loading of a generated full LORDJSON/AIVJSON/
   avatar/media package in the isolated game; no existing local custom lord was
   available. This is the next acceptance step after a lossless codec exists.
2. **Unverified:** missing/null Unity fields, pure pause/empty frames, unknown
   mapper runtime handling and game limits beyond the exact short writer.
3. **Unverified:** semantic meaning of starting slots7/18/19 and Fire Ballista17;
   all LORDJSON timing units, chance-array variant meanings, and exact classic
   AIC correspondence. Similar field names do not prove equivalent behavior.
4. **Unverified:** official-editor decompilation hash locally, and why the
   packaged AIVE converter differs from the public source. Its output behavior
   is established by probes, not a proven build provenance.
5. **Unverified:** media decoding in actual playback, save/load and multiplayer
   transfer behavior, locale conventions in vanilla, and same-name collision
   handling beyond the documented shared media destination.
6. **Unverified:** enabled/installed loader versions and working 30-spot package;
   this report establishes source capability, not installation state or game
   acceptance. Cross-check installer/runtime claims with the parallel loader report.

## Appendix A: complete known LORDJSON field inventory

Generated independently from G1's NewAIC declarations and checked against the
first matching field in S2. **118 fields, 14 arrays, 279 public Int32 words.**
All keys are under `lord`. `Line` is the exact G1 file line. `Offset` refers to
the first word in the **raw native InternalAIC**, not a JSON character position
or the version-prefixed wire stream. Scalars without an explicit initializer
have C# zero initialization; array initializers allocate zero-filled arrays.
These initializers do not establish how missing JSON members deserialize.

| Key | Type / expected length | C# initializer | Offset | Line |
| --- | --- | --- | --- | ---: |
| `opponent_type` | `Int32` | 0 (implicit) | `0x0000` | 165 |
| `opponent_type_for_speech` | `Int32` | 0 (implicit) | `0x0004` | 167 |
| `lord_gfx_type` | `Int32` | 0 (implicit) | `0x0008` | 169 |
| `flag_type` | `Int32` | 0 (implicit) | `0x000C` | 171 |
| `use_of_religion` | `Int32` | 0 (implicit) | `0x0010` | 173 |
| `use_of_ale` | `Int32` | 0 (implicit) | `0x0014` | 175 |
| `vlow_popularity` | `Int32` | 0 (implicit) | `0x0018` | 177 |
| `low_popularity` | `Int32` | 0 (implicit) | `0x001C` | 179 |
| `high_popularity` | `Int32` | 0 (implicit) | `0x0020` | 181 |
| `min_tax` | `Int32` | 0 (implicit) | `0x0024` | 183 |
| `max_tax` | `Int32` | 0 (implicit) | `0x0028` | 185 |
| `farm_types` | `Int32[8]` | 8 zeroes | `0x002C` | 187 |
| `people_to_farm_ratio` | `Int32` | 0 (implicit) | `0x004C` | 189 |
| `extract_wood_ratio` | `Int32` | 0 (implicit) | `0x0050` | 191 |
| `extract_stone_ratio` | `Int32` | 0 (implicit) | `0x0054` | 193 |
| `extract_iron_ratio` | `Int32` | 0 (implicit) | `0x0058` | 195 |
| `extract_pitch_ratio` | `Int32` | 0 (implicit) | `0x005C` | 197 |
| `max_quarries` | `Int32` | 0 (implicit) | `0x0060` | 199 |
| `max_mines` | `Int32` | 0 (implicit) | `0x0064` | 201 |
| `max_woodcutters` | `Int32` | 0 (implicit) | `0x0068` | 203 |
| `max_pitch_dugouts` | `Int32` | 0 (implicit) | `0x006C` | 205 |
| `max_farms` | `Int32` | 0 (implicit) | `0x0070` | 207 |
| `build_rate` | `Int32` | 0 (implicit) | `0x0074` | 209 |
| `crushed_building_delay` | `Int32` | 0 (implicit) | `0x0078` | 211 |
| `sell_food_at` | `Int32` | 0 (implicit) | `0x007C` | 213 |
| `buy_apples_at` | `Int32` | 0 (implicit) | `0x0080` | 215 |
| `buy_cheese_at` | `Int32` | 0 (implicit) | `0x0084` | 217 |
| `buy_bread_at` | `Int32` | 0 (implicit) | `0x0088` | 219 |
| `buy_wheat_at` | `Int32` | 0 (implicit) | `0x008C` | 221 |
| `buy_hops_at` | `Int32` | 0 (implicit) | `0x0090` | 223 |
| `buy_food_amount` | `Int32` | 0 (implicit) | `0x0094` | 225 |
| `buy_weapons` | `Int32` | 0 (implicit) | `0x0098` | 227 |
| `pester_for_goods_delay` | `Int32` | 0 (implicit) | `0x009C` | 229 |
| `send_goods_margin` | `Int32` | 0 (implicit) | `0x00A0` | 231 |
| `ration_boost` | `Int32` | 0 (implicit) | `0x00A4` | 233 |
| `trade_wood_at` | `Int32` | 0 (implicit) | `0x00A8` | 235 |
| `trade_stone_at` | `Int32` | 0 (implicit) | `0x00AC` | 237 |
| `trade_resources_at` | `Int32` | 0 (implicit) | `0x00B0` | 239 |
| `trade_flour_at` | `Int32` | 0 (implicit) | `0x00B4` | 241 |
| `trade_weapons_at` | `Int32` | 0 (implicit) | `0x00B8` | 243 |
| `trade_ale_at` | `Int32` | 0 (implicit) | `0x00BC` | 245 |
| `trade_pitch_at` | `Int32` | 0 (implicit) | `0x00C0` | 247 |
| `trade_minimum` | `Int32` | 0 (implicit) | `0x00C4` | 249 |
| `base_gold_reserves` | `Int32` | 0 (implicit) | `0x00C8` | 251 |
| `blacksmiths_make` | `Int32` | 0 (implicit) | `0x00CC` | 253 |
| `fletchers_make` | `Int32` | 0 (implicit) | `0x00D0` | 255 |
| `poleturners_make` | `Int32` | 0 (implicit) | `0x00D4` | 257 |
| `sell_all` | `Int32[15]` | 15 zeroes | `0x00D8` | 259 |
| `move_mobile_defenders` | `Int32` | 0 (implicit) | `0x0114` | 261 |
| `max_mobile_groups` | `Int32` | 0 (implicit) | `0x0118` | 263 |
| `buy_defense_machines_at` | `Int32` | 0 (implicit) | `0x011C` | 265 |
| `buy_defense_machines_delay` | `Int32` | 0 (implicit) | `0x0120` | 267 |
| `dog_release_timing` | `Int32` | 0 (implicit) | `0x0124` | 269 |
| `dog_points_count` | `Int32` | 0 (implicit) | `0x0128` | 271 |
| `chance_of_defensive` | `Int32[3]` | 3 zeroes | `0x012C` | 273 |
| `chance_of_harrasment` | `Int32[3]` | 3 zeroes | `0x0138` | 275 |
| `chance_of_seiging` | `Int32[3]` | 3 zeroes | `0x0144` | 277 |
| `economy_protection_number` | `Int32` | 0 (implicit) | `0x0150` | 279 |
| `economy_protection_type` | `Int32` | 0 (implicit) | `0x0154` | 281 |
| `bodyguard_number` | `Int32` | 0 (implicit) | `0x0158` | 283 |
| `bodyguard_type` | `Int32` | 0 (implicit) | `0x015C` | 285 |
| `moat_diggers` | `Int32` | 0 (implicit) | `0x0160` | 287 |
| `moat_digger_type` | `Int32` | 0 (implicit) | `0x0164` | 289 |
| `troop_production_rate` | `Int32[3]` | 3 zeroes | `0x0168` | 291 |
| `defense_patrol_trigger_level` | `Int32` | 0 (implicit) | `0x0174` | 293 |
| `defense_patrols` | `Int32` | 0 (implicit) | `0x0178` | 295 |
| `defense_patrol_style` | `Int32` | 0 (implicit) | `0x017C` | 297 |
| `defense_patrol_delay` | `Int32` | 0 (implicit) | `0x0180` | 299 |
| `defensive_trigger_level` | `Int32` | 0 (implicit) | `0x0184` | 301 |
| `defensive_troops` | `Int32[8]` | 8 zeroes | `0x0188` | 303 |
| `harrasment_trigger_level` | `Int32` | 0 (implicit) | `0x01A8` | 305 |
| `harrasment_trigger_variance` | `Int32` | 0 (implicit) | `0x01AC` | 307 |
| `harrasment_troops` | `Int32[8]` | 8 zeroes | `0x01B0` | 309 |
| `harrasment_machines` | `Int32[8]` | 8 zeroes | `0x01D0` | 311 |
| `max_harrasment_machines` | `Int32` | 0 (implicit) | `0x01F0` | 313 |
| `harrass_delay` | `Int32` | 0 (implicit) | `0x01F4` | 315 |
| `siege_trigger_level` | `Int32` | 0 (implicit) | `0x01F8` | 317 |
| `siege_trigger_variance` | `Int32` | 0 (implicit) | `0x01FC` | 319 |
| `siege_troops_before_will_come_to_rescue` | `Int32` | 0 (implicit) | `0x0200` | 321 |
| `siege_troops_on_site_percent` | `Int32` | 0 (implicit) | `0x0204` | 323 |
| `siege_troops_at_home_percent` | `Int32` | 0 (implicit) | `0x0208` | 325 |
| `siege_soften_up_delay` | `Int32` | 0 (implicit) | `0x020C` | 327 |
| `siege_victory_delay` | `Int32` | 0 (implicit) | `0x0210` | 329 |
| `percent_chance_waiting_for_joint_attack` | `Int32` | 0 (implicit) | `0x0214` | 331 |
| `siege_machines` | `Int32[8]` | 8 zeroes | `0x0218` | 333 |
| `siege_cow_timer` | `Int32` | 0 (implicit) | `0x0238` | 335 |
| `siege_eng_amount` | `Int32` | 0 (implicit) | `0x023C` | 337 |
| `siege_moat_troop` | `Int32` | 0 (implicit) | `0x0240` | 339 |
| `siege_moat_amount` | `Int32` | 0 (implicit) | `0x0244` | 341 |
| `siege_herring_troop` | `Int32` | 0 (implicit) | `0x0248` | 343 |
| `siege_herring_amount` | `Int32` | 0 (implicit) | `0x024C` | 345 |
| `siege_assasin_amount` | `Int32` | 0 (implicit) | `0x0250` | 347 |
| `siege_ladder_amount` | `Int32` | 0 (implicit) | `0x0254` | 349 |
| `siege_tunnel_amount` | `Int32` | 0 (implicit) | `0x0258` | 351 |
| `siege_storm_troop` | `Int32` | 0 (implicit) | `0x025C` | 353 |
| `siege_storm_amount` | `Int32` | 0 (implicit) | `0x0260` | 355 |
| `siege_storm_tribes` | `Int32` | 0 (implicit) | `0x0264` | 357 |
| `siege_cover_troop` | `Int32` | 0 (implicit) | `0x0268` | 359 |
| `siege_cover_amount` | `Int32` | 0 (implicit) | `0x026C` | 361 |
| `siege_cover_tribes` | `Int32` | 0 (implicit) | `0x0270` | 363 |
| `siege_shock_troop` | `Int32` | 0 (implicit) | `0x0274` | 365 |
| `siege_shock_amount` | `Int32` | 0 (implicit) | `0x0278` | 367 |
| `siege_reserve_troop` | `Int32` | 0 (implicit) | `0x027C` | 369 |
| `siege_reserve_amount` | `Int32` | 0 (implicit) | `0x0280` | 371 |
| `siege_reserve_tribes` | `Int32` | 0 (implicit) | `0x0284` | 373 |
| `siege_wall_troops` | `Int32[24]` | 24 zeroes | `0x0288` | 375 |
| `siege_wall_amount` | `Int32` | 0 (implicit) | `0x02E8` | 377 |
| `siege_wall_tribes` | `Int32` | 0 (implicit) | `0x02EC` | 379 |
| `who_to_pick_on` | `Int32` | 0 (implicit) | `0x02F0` | 381 |
| `use_improved_sieging` | `Int32` | 0 (implicit) | `0x02F4` | 383 |
| `starting_troops_normal` | `Int32[28]` | 28 zeroes | `0x02F8` | 385 |
| `starting_troops_deathmatch` | `Int32[28]` | 28 zeroes | `0x0368` | 387 |
| `starting_troops_crusader` | `Int32[28]` | 28 zeroes | `0x03D8` | 389 |
| `lord_power_display_level` | `Int32` | 0 (implicit) | `0x0448` | 391 |
| `lord_hps_percent` | `Int32` | 0 (implicit) | `0x044C` | 393 |
| `siege_max_troops` | `Int32` | 200 | `0x0454` | 395 |
| `siege_normal_wave_multiplier` | `Int32` | 5 | `0x0458` | 397 |
| `siege_high_gold_wave_multiplier` | `Int32` | 7 | `0x045C` | 399 |

[G1]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CustomisationFileManager.cs#L157-L827
[G2]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/AIVLoader.cs#L4-L85
[G3]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/EngineInterface.cs#L4303-L4876
[G4]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/ConfigSettings.cs#L2573-L2652
[G5]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/SFXManager.cs#L940-L971
[G6]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/CrusaderDE/FRONT_Multiplayer.cs#L3503-L3514
[E1]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/AI-Toolkit-DE/EditorJsonReadWrite.cs#L26-L267
[E2]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/AI-Toolkit-DE/EditorLordViewModel.cs#L4749-L5016
[E3]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/AI-Toolkit-DE/EditorFrame.cs#L17-L24
[E4]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/AI-Toolkit-DE/EditorFrameManager.cs#L77-L84
[N1]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L48911-L49387
[N2]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/tools/semantic/ExportCrusaderSemantics.java#L73-L78
[S1]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.AICDecoder/src/SHCDESE.AICDecoder/PublicAIC.cs#L3-L565
[S2]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.AICDecoder/src/SHCDESE.AICDecoder/InternalAIC.cs#L5-L385
[S3]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Interop/Enums.cs#L5-L164
[S4]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Interop/EStructs.cs
[S5]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Interop/Enums/AIDefensivePositionClass.cs#L15-L65
[S6]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/Interop/Enums/AivMiscItemType.cs#L7-L32
[S7]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/GameAIManagerAPI.cs#L221-L286
[S8]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/AI/LordInfo.cs
[S9]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/AI/LordMessageClip.cs
[S10]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.BepInEx/API/Components/ModManager/ModInfo.cs
[S11]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/docs/guides/asset-api.md
[S12]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.AIVDecoder/src/SHCDESE.AIVDecoder/AIVEncoder.cs#L23-L73
[S13]: https://gitlab.com/rawra-stronghold-crusader/shcde-script-extender/-/blob/4014ca67c96974a5e6d697665baf5351cbfebde6/src/SHCDESE.AIVDecoder/src/SHCDESE.AIVDecoder/AIVDecoder.cs#L47-L129
[C1]: https://codeberg.org/SuschisWorld/AIVConverter/src/commit/25ec0c430029fda0ef268fe7420ccb4048c9f181/aivconverter.py
[F1]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Detours/ExpandedGuardingSpotsDetours.cs#L24-L124
[F2]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Config/CustomLordPreferencesEntry.cs#L8
[F3]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Events/FixesAIEvents.cs#L308-L361
[F4]: https://gitlab.com/rawra-stronghold-crusader/shcde-fixes/-/blob/a90f96c176e9c8981af83534f5a8bb444838ae0a/src/shcde-fixes/Events/FixesMapEvents.cs#L63-L71
[OFFICIAL]: https://steamcommunity.com/sharedfiles/filedetails/?id=3669320761&l=german
[RAT]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Helpers/ActiveAIVDetector/BepInEx/plugins/ActiveAIVDetector_Serp/VanillaAIC/Rat.lordjson
[AIDE]: https://www.moddb.com/games/stronghold-crusader-definitive-edition/downloads/aide

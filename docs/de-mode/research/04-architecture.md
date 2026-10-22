# Toolkit architecture, edition isolation, and Classic regression assessment

Research date: 2026-10-22. Owner: architecture research subtask. This is a
bounded source review and local probe report, not an implementation or a claim
of DE runtime support.

Read before investigation: `00-goal-verbatim.md`, `01-working-contract.md`, and
`02-plan.md`. Inspected checkout: `S:\Projects\UCP\AI-Toolkit-DE`, branch
`de/separate-game-mode`, HEAD `818503dc40971defef3769ca883f82290405ab94`.
The Classic checkout and installed applications were not changed. No game or
editor GUI was launched. Only this owned report was written by this subtask;
other agents' central evidence files may change independently.

## Findings that determine implementation order

1. **Source-confirmed:** the application has separate Electron and Tauri/Rust
   service implementations behind the legacy `window.electronAPI` interface,
   but one shared editor and Classic castle codec. Keep that boundary. The new
   edition context must reach both service implementations, not just a toggle
   in the palette. [S1, S2, S3]
2. **Observed and source-confirmed:** both installation selectors currently
   require `ucp/plugins`; neither is an edition detector. The installed DE root
   fails the Node selector. Native game requests resolve the one persisted
   `ucpInstallation` on each request, whereas project requests carry an explicit
   `gameRoot`. Changing a global root can therefore give an existing window's
   project a different source of assets and balance. [S4, S5, S6]
3. **Source-confirmed:** choosing a different installation bypasses the existing
   three-editor unsaved gate, persists the root before frontend preparation,
   reloads artwork, and clears library ownership without clearing the old editor
   documents. This is a context-mixing risk; actual document loss was not
   reproduced. Implement a staged switch before exposing a DE toggle. [S7, S8]
4. **Observed:** 73 focused existing tests passed, including Classic byte
   preservation, DE JSON timing/unknown-field retention, format selection,
   restoration, stale asset responses, and typed IPC. They establish a useful
   baseline, not a new mode-isolation or real-game acceptance result. See probes.
5. **Observed and source-confirmed:** the shared catalogue already permits 30
   guarding spots for selected troop types even in a Classic-format editing
   session; Classic export rejects numbers above 9. A capability model needs
   separate preservation, editing, export, and runtime limits. Simply lowering
   shared `maxAmount` risks rejecting or rewriting existing documents. [S9, S10]
6. **Source-confirmed:** DE palette art includes repository SVG illustrations;
   missing isometric buildings use footprint geometry. Classic analysis,
   balance, map readers, sprite extraction, and character templates are still
   Classic integrations. A successful JSON save establishes none of those DE
   capabilities. [S11, S12, S13, S14, S15]

## Evidence conventions and pinned sources

- **Observed:** executed in this subtask; the command and result are recorded.
- **Source-confirmed:** directly checked in the pinned implementation. This
  establishes code behavior, not successful OS/UI or game execution.
- **Inferred:** consequence or risk derived from the implementation; requires
  the proposed test to establish end-to-end behavior.
- **Unverified:** not established by this subtask. Existing documentation's
  historical acceptance claims remain historical evidence.
- **Proposed:** implementation recommendation, not existing behavior.

The implementation and the three requested integration/parity documents are
identical between HEAD and upstream commit
`5ce3676af8ddb78a11f0148cc2311915eec0a0d8`, verified with the `git diff` commands
below. Primary source URLs therefore use that upstream commit, with exact file
and line ranges. Local HEAD is the authoritative inspected checkout; the URLs
are source locators, not a claim that this subtask fetched or tested a release.

| ID | Primary source at `5ce3676af8ddb78a11f0148cc2311915eec0a0d8` | Relevant contract |
| --- | --- | --- |
| S1 | [package.json, lines 1–50](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/package.json#L1-L50); [desktop README, lines 1–39](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/README.md#L1-L39) | Native default scripts, retained Electron entrypoints, generated IPC ownership |
| S2 | [desktop/api.ts, lines 34–109](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/api.ts#L34-L109); [runtime.ts, lines 1–60](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/runtime.ts#L1-L60) | Legacy API adaptation, window-local project root/events, typed transports |
| S3 | [preload.js, lines 1–79](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/preload.js#L1-L79); [desktop/contracts.rs, lines 282–294](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/desktop/contracts.rs#L282-L294) | Electron surface; game requests lack edition/profile identity |
| S4 | [storage.rs, lines 36–80](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/storage.rs#L36-L80); [lines 121–161](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/storage.rs#L121-L161) | Shared Electron-compatible user-data directory, settings, UCP-root normalization |
| S5 | [main.js, lines 94–143](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/main.js#L94-L143); [lines 609–622](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/main.js#L609-L622); [node/ucp-library.js, lines 114–148](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/ucp-library.js#L114-L148) | Electron root/settings/template singleton and installation layout |
| S6 | [desktop.rs, lines 263–315](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/desktop.rs#L263-L315); [lines 521–560](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/desktop.rs#L521-L560); [main.js, lines 671–694](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/main.js#L671-L694) | Root persistence precedes frontend switch; game-service dispatch/cache locations |
| S7 | [app-shell.js, lines 41–82](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/app-shell.js#L41-L82) | Character/castle/dialogue Save, Discard, Cancel gate |
| S8 | [js/ucp-library.js, lines 534–610](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/ucp-library.js#L534-L610); [lines 834–869](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/ucp-library.js#L834-L869); [lines 64–95](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/ucp-library.js#L64-L95) | Installation switch, project opening, asynchronous startup restore, one last-project key |
| S9 | [castle-editor.js, lines 268–307](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-editor.js#L268-L307); [lines 330–398](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-editor.js#L330-L398); [lines 802–858](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-editor.js#L802-L858) | Format-driven normalization, caps, renumbering, document/source-byte lifetime |
| S10 | [castle-format.js, lines 9–50](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-format.js#L9-L50); [aiv_constants.json, lines 1–209](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/config/aiv_constants.json#L1-L209); [lines 808–920](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/config/aiv_constants.json#L808-L920) | JSON preservation validation, Classic rejection, shared DE definitions/caps |
| S11 | [definitive-edition-integration.md, lines 111–126](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/docs/definitive-edition-integration.md#L111-L126); [9022.svg, line 1](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/assets/aiv/skins/9022.svg#L1); [iso-geometry.js, lines 527–550](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/iso-geometry.js#L527-L550); [iso-view.js, lines 1277–1288](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/iso-view.js#L1277-L1288) | Illustration provenance claim and explicit missing-sprite footprint rendering |
| S12 | [game/graphics.rs, lines 25–62](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/game/graphics.rs#L25-L62); [lines 117–184](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/game/graphics.rs#L117-L184); [game/cache.rs, lines 1–34](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/game/cache.rs#L1-L34) | GM1/UCP resolution, stat-based revision inputs, extraction lock per canonical directory |
| S13 | [game/buildings.rs, lines 119–146](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/game/buildings.rs#L119-L146); [game/units.rs, lines 114–138](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/game/units.rs#L114-L138); [game/maps.rs, lines 864–894](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/game/maps.rs#L864-L894) | Revisioned persistent building/unit/map caches; cached absolute asset locations |
| S14 | [castle-game-data.js, lines 1–7](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-game-data.js#L1-L7); [castle-analysis.js, lines 1–4](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-analysis.js#L1-L4); [game/balance.rs, lines 148–153](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/game/balance.rs#L148-L153) | Embedded 1.41 numerical tables, imported analysis singleton, Classic executable costs |
| S15 | [character-editor.js, lines 34–52](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/character-editor.js#L34-L52); [lines 572–590](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/character-editor.js#L572-L590); [lines 662–681](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/character-editor.js#L662-L681); [lines 749–767](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/character-editor.js#L749-L767) | UCP templates, key renaming/default insertion and plugin-field filtering |
| S16 | [desktop/documents.ts, lines 4–29](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/documents.ts#L4-L29); [lines 40–131](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/documents.ts#L40-L131); [node/aiv-file.js, lines 22–70](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/aiv-file.js#L22-L70) | Filename-only config cache, extension-selected save, unchanged Classic bytes, validation before write |
| S17 | [desktop.rs, lines 56–78](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/desktop.rs#L56-L78); [storage.rs, lines 54–74](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/storage.rs#L54-L74); [desktop/assets.ts, lines 1–33](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/assets.ts#L1-L33); [main.js, lines 904–918](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/main.js#L904-L918) | External config precedence; shared skins and native extracted-sprite precedence |
| S18 | [iso-view.js, lines 56–108](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/iso-view.js#L56-L108); [castle-editor.js, lines 2652–2663](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-editor.js#L2652-L2663); [character-editor.js, lines 373–378](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/character-editor.js#L373-L378) | Promise caches, stale-result guards, character skin promise without profile reset |
| S19 | [iso-view.js, lines 163–245](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/iso-view.js#L163-L245); [editor-extras.js, lines 119–143](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/editor-extras.js#L119-L143); [castle-cost-panel.js, lines 8–54](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-cost-panel.js#L8-L54); [lines 300–324](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-cost-panel.js#L300-L324) | Shared map/group/clipboard/balance/production storage and balance response tokens |
| S20 | [library.rs, lines 160–200](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/library.rs#L160-L200); [lines 350–409](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/library.rs#L350-L409); [lines 551–578](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/library.rs#L551-L578); [lines 626–668](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/library.rs#L626-L668) | UCP package schema, mapped `.aiv` target, JSON fallback, transactional managed writes |
| S21 | [desktop/api.ts, lines 114–177](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/api.ts#L114-L177); [library.rs, lines 301–331](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/library.rs#L301-L331) | New AI creation encodes Classic bytes; add/update force `.aiv`; UCP WAV/BIK mappings |
| S22 | [migration.rs, lines 59–98](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/migration.rs#L59-L98); [lib.rs, lines 58–60](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/lib.rs#L58-L60) | Electron localStorage migration, persistent migration marker, user-data asset scope |
| S23 | [game/native_cache.rs, lines 1–23](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/game/native_cache.rs#L1-L23); [node/game-map.js, lines 533–548](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-map.js#L533-L548) | Hash-allowlisted historical Classic captures; Electron default Classic map root |
| S24 | [expanded-troop-spots.md, lines 1–42](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/docs/expanded-troop-spots.md#L1-L42); [native-parity.md, lines 19–62](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/docs/native-parity.md#L19-L62) | Historical acceptance/limits and per-AI expanded-spot requirement |
| S25 | [node/game-building-assets.js, lines 12–19](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-building-assets.js#L12-L19); [lines 95–109](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-building-assets.js#L95-L109); [node/game-map.js, lines 345–361](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-map.js#L345-L361); [lines 452–462](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-map.js#L452-L462); [lines 950–991](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-map.js#L950-L991) | Node revision caches, worker deduplication, module-level map/GM1 state |
| S26 | [storage.rs, lines 238–253](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/storage.rs#L238-L253); [node/game-map.js, lines 140–147](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-map.js#L140-L147) | Parsed JSON castle envelope; hard-coded Classic fallback root |

The supplied Serpens66 lead is pinned locally at develop
`7e199e6f0818173794bdeeb0c4c32d74500b0eec`. Its
[Toolkit section, lines 83–109](https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/Findings/AIToolkitDE.md#L83-L109)
describes an older Toolkit revision (`0a120825...`, listed at line 37). Its
claims were treated as leads; the current implementation above was checked
independently. The native knowledge seed is pinned at main
`a23aa1b32276d670ffbb2a7b641d23b500d8e298` under
[`_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge`](https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/tree/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/knowledge).
This subtask inventoried it but makes no new native semantic claims from it.
Neither clone refs nor checkout were changed.

## Current service, state, and format boundaries

### Two desktop backends and one editor

**Source-confirmed:** normal development/start scripts use Tauri; Electron
remains an explicit alternate entrypoint. Tauri installs an `electronAPI`
adapter, invokes `desktop_request` for filesystem/library/dialog operations and
`game_request` for extraction/maps/balance, and uses Rust-owned enums with
generated TypeScript. The renderer still owns documents, undo, selections and
editor state. Electron's preload forwards similar calls into `main.js` and
Node services. [S1–S3]

Do not confuse Tauri's `game/native_cache.rs` with the DE native engine. It is a
read-only compatibility reader for historical Classic map captures, with two
Classic executable hash allowlist entries. The native desktop application's
architecture does not make it a DE-aware game adapter. [S23]

The two desktop surfaces are not perfectly identical: native exposes
`loadGameUnitSprites`; the inspected Electron preload does not. Treat Electron
as a maintained compatibility backend with explicit operation coverage, not as
proof that native idle-unit extraction is already shared. [S2, S3]

### Root and settings lifetime

**Source-confirmed:** native `user_data()` uses `AI_TOOLKIT_USER_DATA` when set,
otherwise the platform configuration directory plus `AI Toolkit`, deliberately
retaining Electron settings/history. Both use `settings.json` and the one
`ucpInstallation` key. Native reads preserve unrelated settings under a process
mutex and use atomic replacement; its installation validator strips selected
`plugins`/`ucp` suffixes and requires `ucp/plugins`. Node similarly accepts the
game, `ucp`, or `plugins` folder and requires that layout. Neither checks game
edition or executable architecture. [S4, S5]

Native game dispatch has no window/profile argument and rereads the global
installation setting; library requests separately receive `gameRoot`. Electron
asset/map/balance handlers also use the saved global root. **Inferred:** two
windows with separate open projects can disagree about project ownership and
the root supplying textures or calculations after one window changes the
installation. This needs a two-window regression fixture; it was not UI-tested.
[S3, S6]

**Source-confirmed:** external editable `config` next to the executable can
override bundled defaults. `aiv_constants.json` uniquely receives field-wise
default merging, retaining user overrides and unknown item fields. Native
frontend `loadConfig()` caches successful promises by filename alone; Electron
caches the AIV template object for process lifetime. Castle and character
editors also load configuration once. Mode-specific file contents with the
same names will therefore require explicit context/version cache keys and
reinitialization, not just a new directory resolver. [S5, S9, S15–S18]

### Cache inventory and invalidation

| Layer | Current identity/lifetime | Isolation consequence |
| --- | --- | --- |
| Rust extracted buildings | `userData/game-building-assets`, revision from graphics plus catalogue/parts/wall metadata; cached page paths checked | Current revisioning is useful but the directory has no explicit edition namespace. Preserve extraction locks and revision checks. [S6, S12, S13] |
| Rust units | `userData/game-unit-assets`, graphics revision plus pose-data revision; cached paths checked | DE extractor/pose registry needs its own namespace and provenance. [S6, S13] |
| Rust map atlas/captures | `userData/native-map-renderer`, fixed `map-atlas.json` with a checked map/graphics/capture identity; atlas pages alongside | New profile namespaces must preserve Classic capture readability without treating captures as DE-compatible. [S13, S23] |
| Node buildings/maps | Shared user-data directories; revisioned building outputs; worker deduplication by root/cache; map readers have module-level state | A different namespace is needed for DE; do not widen the Classic parser to route solely by extension. [S6; `src/node/game-building-assets.js:12–19,95–109`; `src/node/game-map.js:345–361,452–462,950–991`] |
| Renderer assets | Isometric catalogue and unit promises, URL-keyed images, troop/scene state; existing response-identity guards | Reset/replace the whole edition-owned resource set, including delayed image/worker completion. Existing guards are building blocks, not a full switch protocol. [S18] |
| Character pictures | One `unitSkinRequest` promise | Needs profile-generation invalidation; a castle refresh alone does not reset it. [S18] |
| Config/model data | Filename-only promise cache plus editor-held templates/constants/categories/population | Key by edition/config revision, and replace the dependent editor view model without normalizing the open document as another format. [S15–S18] |
| Browser persistence | Shared last-project, map position, balances/choice/production, clipboard/groups | Partition domain content by edition/profile; keep general appearance/keyboard/layout preferences compatible. [S8, S19] |

**Source-confirmed:** Rust graphics revisions use selected paths, file sizes and
modification times, plus relevant UCP configuration/source inputs. They are not
content hashes of every sprite. **Inferred:** same-size edits with preserved
timestamps can evade that part of invalidation. For a new DE extraction format,
include a versioned manifest of actual source fingerprints; do not claim that
the existing stat fingerprint proves content equality. [S12]

Native custom skins reside in one `userData/aiv-skins/<id>.png`. The frontend
combines bundled skins, selected-game unit sprites, and custom overrides in
that order. Electron loads bundled skins then the same user skin directory.
Thus integer item ID alone is currently the skin namespace. **Proposed:** retain
the legacy directory as the Classic fallback; DE uses its own directory and
per-asset provenance. No DE lookup should silently obtain a user Classic skin
with the same ID. [S4, S5, S17]

**Source-confirmed isolation limitation:** a separate Git checkout does not
isolate application state. Native explicitly preserves the existing Classic
application's data location unless `AI_TOOLKIT_USER_DATA` is supplied. The
inspected Electron `main.js` has no equivalent handling for that variable.
Before later GUI acceptance, use an owned native data root and a separately
verified Electron user-data redirection/test entrypoint. Do not assume the
native environment override isolates Electron too. [S4, S5]

### Import/export is not the package model

**Source-confirmed:** standalone castles share a frame/misc-item document model.
The castle editor keeps `format`, source path and source bytes separately.
`.aivjson`/`.aijson` trigger JSON validation preserving empty frames, pause flags,
marker numbering and unknown fields. Classic import follows the established
Classic empty-step/pause policy. Native desktop saves choose encoding from the
actual destination extension, diagnose incompatible Classic content before
writing, and reuse original bytes for unchanged Classic files. Electron's
`writeNativeAiv` follows that unchanged-byte and pre-write validation contract.
Do not change normalization to follow the active edition toggle. [S9, S10, S16]

The existing AI library is specifically UCP: `character.json`, `meta.json`,
`lines.json`, `aiv/mapping.json`, WAV/BIK mapping directories, and the managed
`aiv-mod-editor-local-1.0.0` plugin with an `aiSwapper` dependency. Library castle
discovery/mappings target `.aiv`; a missing binary can be loaded from an
`.aivjson` fallback, but its target path is deliberately restored to the mapped
Classic `.aiv`. Native create/update/add-castle flows encode or require Classic
binary output. This is correct existing Classic behavior, and must not become
the implementation of a DE lord package by replacing a file suffix. [S20, S21]

The current character editor recursively renames legacy keys, inserts UCP
template defaults, reorders according to that template and strips selected
plugin-specific AIC keys on output. **Observed:** its recursive
`renameKeysPreserveOrder` turns an input array into an object with numeric keys
even with an empty legacy key map (`[11,22]` becomes `{"0":11,"1":22}`).
**Inferred integration consequence:** routing an array-bearing LORDJSON through
the current character load path would change its shape. Keep the rendering
components where useful but give LORDJSON an independent raw document and
schema adapter; do not broadly change the Classic transformation as the first
DE step. This report does not establish any LORDJSON field mapping. [S15]

### First-run and switch behavior

**Source-confirmed:** library initialization reads a saved UCP installation and
scans only when one exists; it does not automatically invoke folder selection.
Only the startup window restores a project (`restoreProject=1`). It checks
document paths, dirty state and castle revision before asynchronous restore,
and uses one `aiv.lastProject.v1` key. These protections should be retained and
extended with profile identity. [S8; `src/js/ucp-library.js:805,891,912`]

Project opening calls `unsavedChanges.confirmAll`, which visits character,
castle and dialogue. Cancel or failed/cancelled save prevents opening. Ordinary
workspace tabs just change visibility; they are not edition switches. Choosing
an installation currently does not call this gate. The backend saves the new
root before the frontend clears map state, refreshes artwork, drops loaded
project ownership and rescans. No claim is made that it currently overwrites
an open document, but using this sequence for an edition toggle would violate
the requested mode-switch contract. [S7, S8, S6]

### DE art, troop slots, and analysis limits

**Source-confirmed:** global item definitions include Bedouin Stockade 79,
outposts 53/178/179, and palette troop IDs 9022–9029. Some entries are marked
`edition: de`; outposts 178/179 instead use `classicAiv: false`. Filtering only
by the edition string would miss them. Catalogue metadata mixes identity,
placement size, export restriction and editor limit; those concerns should
become separate capability inputs. [S10]

The prior integration document identifies the new SVG art as original preview
art rather than extracted DE sprites; the repository contains those SVGs.
Missing isometric entries retain a definition-sized footprint and draw a
diamond. Existence of an icon must not certify authenticity or game support.
DE mode should label missing/unverified sources explicitly until the asset
research track supplies verified local extraction metadata. [S11]

Expanded caps apply to native marker classes 6–19 and 22–28 (palette aliases
9022–9028); siege equipment, oil engineers and 9029 keep their specific old
caps. New placement finds the next unused zero-based number. Edited expanded
JSON groups are compacted when no future slot >=30 is present; untouched JSON
and unknown groups remain preserved. Classic export rejects extra slots. The
current `maxAmount` function has no edition check, so a Classic-format editor
can create an ultimately unexportable 11th marker. [S9, S10; probes below]

The checked project documentation says expanded spots require DE plus
SHCDE-Fixes and the per-AI `GuardingSpotsPerUnitType` preference, and cites
reviewed Fixes commit `a90f96c176e9c8981af83534f5a8bb444838ae0a`. **Unverified by
this subtask:** runtime capacity, contiguous-numbering assumptions in that
loader, and exact current deployment/version support. Those remain owned by
the runtime research track; the documentation is not independent proof of
installed loader behavior. [S24]

Classic numerical analysis is imported from an embedded 1.41 table. Installed
balance reads `Stronghold Crusader.exe` and UCP settings; failure can retain a
previous chosen balance in the cost panel. **Inferred:** after entering DE,
retaining that panel state without an explicit unavailable capability could
present Classic costs, population, fire or path estimates as DE facts. Disable
unverified DE analyses independently of geometry/editing; preserve all existing
Classic computations. [S14, S19]

## Proposed concrete module boundaries

These are implementation recommendations. Names can be adjusted by the parent;
the ownership and data flow should remain explicit.

| Module/change | Responsibility and preserved behavior |
| --- | --- |
| New `src/shared/game-capabilities.js` | Pure evaluation of edition, document kind, verified registry, version and loader/per-AI evidence. Return reasoned availability separately for preserve/edit/export/preview/deploy. No filesystem, global toggle or renderer state. Share rule fixtures across both desktop adapters. |
| New Rust `src-tauri/src/profiles.rs` and Node `src/node/game-profiles.js` | Read-only installation detection, normalized root identities, version/source fingerprints, versioned profile persistence. Keep the existing Classic UCP validator/layout for the Classic library, separate from edition detection. Use common synthetic detection fixtures to keep implementations equivalent. |
| Extend Rust `desktop/contracts.rs` and producer response DTOs; regenerate `src/desktop/generated/` | Add profile/context and probe/activate operations. Give game/library mutations a context token or validated profile ID. Bind an immutable context snapshot at dispatch. Generated files remain generated. |
| New `src/desktop/profiles.ts` and `src/js/game-mode.js` | Transport adapter plus window-local switch coordinator. Establish readiness before restoring projects or initializing edition-dependent models. Reuse `unsavedChanges.confirmAll`. Own switch generation and publish one context change after preparation succeeds. |
| New `src/js/profile-storage.js` | Versioned per-edition/per-installation browser keys; explicit legacy Classic migration. Scope clipboard, groups, balances, production, last-project and map state. Preserve shared UI preferences and existing cross-window synchronization semantics. |
| Extend `src/desktop/documents.ts` and introduce `src/shared/document-kinds.js` | Explicit `classic-aiv`, `de-aivjson`, `ucp-character`, `de-lordjson`, `dialogue` kind/format metadata. Keep current Classic codec and atomic writer contracts. Extension/format governs serialization; selected edition only governs offered operations/defaults. |
| Preserve Classic `src-tauri/src/library.rs` / `src/node/ucp-library.js`; add a separate DE library/package adapter | Enumerate and package DE lord resources only from the verified file/runtime contract. Do not share UCP folder conventions, portrait dimensions, dependency metadata or binary AIV assumptions implicitly. Reuse low-level validated paths/atomic transactions where applicable. |
| Extend game-service dispatch; new `src-tauri/src/game/de/` and a Node DE adapter only where Electron is supported | Keep current Classic readers/extractors intact behind an edition router. Add verified DE asset/map readers as separate implementations with normalized atlas/pose result DTOs. Unsupported operations return a typed reason, not Classic fallback. |
| Extend `iso-view.js`, `castle-editor.js`, `character-editor.js`, analysis workers and cost panel | Consume context-keyed configurations and provenance; invalidate promises/images/GPU scenes/map lists/analysis on context generation. Retain shared canvas, selection, undo and geometry logic. Never mutate a document just to refresh edition assets. |

For native game services, `game_request` needs the invoking window's context
or a validated explicit context token; a persisted default mode is not the
authority for an already-open window. Electron should resolve the same context
from `event.sender`, not call `savedUcpInstallation()` inside every service.
Capture root, config/asset revision and capabilities together before starting
blocking extraction. Respond with profile ID/generation so late work cannot
publish into a newer session.

## Proposed settings and cache contract

Use versioned profile state under the application data directory, while keeping
global interface/updater/window preferences compatible. The existing native
test profile environment variable is useful for the parent's later isolated
application tests; this subtask did not launch it.

Illustrative new persisted state (not a current schema):

```json
{
  "schemaVersion": 1,
  "defaultEdition": "classic",
  "selectedProfiles": { "classic": "classic-root-id", "de": "de-root-id" },
  "profiles": {
    "classic-root-id": { "edition": "classic", "root": "...", "revision": "..." },
    "de-root-id": { "edition": "de", "root": "...", "revision": "..." }
  }
}
```

Recommended storage rules:

1. Keep legacy `settings.json` and unknown keys intact; read its
   `ucpInstallation` as the Classic candidate only. Do not infer DE from a
   filename or migrate a legacy root to DE because the user clicked a toggle.
   Version the new profile file, write atomically, and retain a valid old
   snapshot on parse/write failure. Do not destructively mirror a selected DE
   root back to the legacy UCP key. Specify whether old Electron should continue
   seeing the most recently chosen Classic root, and test that explicitly.
2. Root identity includes canonical path and edition. Installation revision
   separately includes relevant binaries/assets/loader/config fingerprints;
   a game patch updates revision without losing that installation's history.
   Preserve actual path case; Windows case-insensitive lookup must not turn
   into unconditional lowercasing on other platforms.
3. Proposed new cache namespace:
   `profiles/<edition>/<root-id>/cache/<extractor-version>/<source-revision>/`.
   Include edition/ID mapping version, source content manifest, extractor and
   pose/layout versions, and relevant mod/load order in the identity. Validate
   referenced pages before reuse. Different namespaces get independent locks;
   concurrent identical extraction remains serialized/deduplicated.
4. Continue reading valid legacy Classic caches in place as a migration
   fallback, or rebuild only the needed Classic cache in the new location.
   Do not rename cached directories blindly: metadata contains absolute page
   paths. Leave old caches untouched until rollback/compatibility policy is
   tested. No game-owned extracted pixels belong in Git or distributable art.
5. Use distinct DE skins and settings. Existing Classic user skins continue to
   win over Classic extracted/bundled art. Skin IDs are namespaced by edition;
   authenticity is metadata, not implied by the presence of a PNG.
6. Migrate browser domain keys one way into Classic namespaced keys without
   deleting originals or resetting appearance preferences. The existing
   Electron-to-native migration marker is not a profile migration marker.
   Importing a legacy `lastProject` must also retain its original root/AI/castle
   identity. Migrate map captures/references and balance profiles only to
   Classic. [S8, S19, S22]
7. Clipboard/groups can remain shared across windows *within* an edition. A
   cross-edition paste must explicitly validate the target capabilities and
   report unsupported content; never remap units or drop fields silently.
8. Separate each window's active context from the persisted default for future
   windows. A detached viewport inherits its owner's context; Add Window
   inherits a context intentionally and still suppresses startup-project
   restoration. Closing/switching one editor must not invalidate another
   editor's assets or change its write destination.

A profile change should invalidate source data, not generic app chrome.
Themes, language, keyboard bindings and panel layout may remain shared.
Balance selections, production assumptions, unit palettes, map references,
project destinations and custom-game skins must be edition/profile scoped.

## Proposed capability model

A single `isDE` flag or `supportsDE: true` is inadequate. Keep these independent:

- Installation recognition: edition, canonical root, detected/unknown version,
  supporting file evidence and exact fingerprints.
- Document support: parse/preserve, render/edit and write for each format,
  including unknown IDs/fields and source bytes. An unknown runtime version
  need not prevent a lossless standalone JSON save.
- Game rules: verified item identity/footprint/rotation, placement restrictions,
  numerical costs/workers/path/fire, troop recruitment/allocation.
- Asset support: verified local source, missing source, user override, or
  illustrative fallback, separately for icon/building/unit/terrain/pose.
- Deployment: format/layout support, loader requirement/version, per-lord
  settings, safe install path, and actual runtime verification status.

Return a structured state and reason per operation, for example
`supported`, `requires-configuration`, `unverified`, or `unsupported`, together
with evidence/source revision. Export remains usable where its contract is
known even if deployment/runtime acceptance is pending. Availability must not
change serialization or discard loaded unknown data.

For guarding spots, distinguish at least `preservedSlotNumbers`,
`editableSlotCapacity`, `classicExportCapacity`, and
`effectiveRuntimeCapacityByClass`. Validate zero-based slot *numbers* as well
as counts: ten markers with numbers 20–29 are still not Classic-compatible.
Apply per-AI settings, not just the existence of a mod DLL. Respect smaller
custom item caps and the special classes excluded from expansion. Unknown or
future slots can be preserved without becoming editable or deployable.

**Compatibility decision for the parent:** current tests expect selected shared
caps to be 30, independent of mode. Defaulting new Classic placements to ten is
an intentional UI correction relative to this baseline, although it preserves
the existing Classic file/runtime limit. Make tests request a DE/loader
capability fixture explicitly; keep a separate test proving old JSON with
30/future slots survives unchanged. Do not declare this change an unchanged
Classic UI behavior or rewrite the global constants first.

## Proposed first-run and mode-switch transaction

### First-run detection

1. Start profile readiness before edition-dependent editor initialization,
   asset requests and automatic project restore. Preserve command-line/Open
   in New Window documents as higher priority than restoration.
2. If no usable profile exists, offer the normal installation-folder selection.
   A picker cancel leaves a usable no-installation editor state with accurate
   unavailable capabilities; it does not invent a Classic root.
3. Probe the selected root read-only. A DE candidate has the observed launcher,
   `_Data/Managed/Assembly-CSharp.dll`, and `_Data/Plugins/x86_64/CrusaderDE.dll`
   layout; a Classic candidate is separately established by its engine/layout.
   These are detection signatures to test, not a complete edition/version
   support registry. `ucp/plugins` establishes UCP library availability, not
   game edition. Ambiguous, incomplete or mixed layouts receive explicit
   diagnostics; do not manufacture missing UCP folders to accept DE.
4. Select DE automatically when the DE probe succeeds; save its separate root.
   Leave the Classic profile unset when no Classic installation was selected.
   An unknown game hash can still identify the edition but must disable
   unsupported extractors/deployment until verified.
5. Selecting plain Classic/HD without UCP should distinguish ordinary file
   editing/assets from UCP-library availability. This is a deliberate extension
   of today's UCP-only selector and needs its own fixture; retain existing UCP
   root/suffix selection exactly.

### Explicit switch or root replacement

1. Serialize switch requests per window and stage the candidate edition/root
   and capability/config probes without changing the active context or saved
   default. Picking a missing target root must be a non-mutating operation.
2. Freeze editor-changing actions and capture revisions for all three editors.
   Invoke `confirmAll` while their original context, project paths, format and
   source bytes are still authoritative. Save uses the original profile.
   Cancel, failed save or cancelled Save As aborts the switch. A user may have
   saved an earlier editor before cancelling a later one; those requested saves
   remain valid, while no mode/root transition is committed.
3. Prepare target configurations and resource handles without adopting them.
   Revalidate revisions/context before commit. Preflight must not change old
   clipboard/groups/balances or project ownership. Unsupported target assets
   produce explicit gaps; an actual preparation failure leaves the original
   session available.
4. Commit the new window context/generation and persisted default through one
   defined backend activation boundary. Specify rollback if persistence fails.
   Teardown/publish should use prepared data and avoid fallible document
   conversion after commitment.
5. After accepted discard/save and successful activation, detach the previous
   project cleanly or retain it in another intentionally-owned window. Clear
   old content/portrait/project references and dialog destinations together.
   Do not present an old UCP character/castle as a DE project. Restore only the
   target edition/root's last project, with the existing startup safeguards.
6. Invalidate outstanding work by context generation: catalogue/unit/config
   promises, image callbacks, building mini-previews, map listing/tiles,
   terrain/GPU scenes, troop allocations, analysis workers, cost/balance and
   character pictures. Late old results may finish into their old cache but
   cannot update UI or mutate current project metadata.
7. Keep document kind/format independent. Switching to Classic never feeds a
   DE JSON document through Classic normalization or renumbers it. Opening a
   foreign-format file can offer a matching mode or explicit standalone
   interchange editing; conversion is a separate validated Save As/export.

The root chooser must first be split into probe/select and activate operations:
the existing choose operation already persists settings, too early for this
transaction. Merely adding `confirmAll` *after* that call still permits changed
backend state when the user cancels. [S6–S8]

## Classic regression risks and concrete test gates

All gates below are proposed. None should dispatch CI or launch a game from
this research subtask.

| Gate | Fixture/scenario and required result | Existing coverage to retain |
| --- | --- | --- |
| G0: baseline | Pin pre-change source and test results. No production settings, game files, original checkout or updater source changes. | 73 tests listed below; later parent runs relevant Rust and broader local suites. |
| G1: detection | Classic UCP root and its `ucp`/`plugins` selections; Classic without UCP; DE-only; both separately installed; missing/deleted/ambiguous root; unknown binary version. Probe is read-only, selects correct mode, never requires Classic for DE. | Existing UCP layout fixtures; add shared Rust/Node synthetic tree and PE-header fixtures. |
| G2: persistence | Old settings and unknown keys; existing custom constants, skins, last project, map selection, balances and clipboard; corrupt new profile file; failed atomic write; repeated migration. Classic behavior remains equivalent and DE gets separate values. | `storage.rs` config/document tests, `legacy-native-migration.test.js`, `config-assets.test.js`, `castle-session.test.js`. |
| G3: switching | Dirty character/castle/dialogue individually and together; Save/Discard/Cancel, Save As cancel/failure, new target-folder cancel/failure, rapid A→B→A, pending project read. No premature settings mutation, mixed contexts, lost undo/document or wrong-path save. | Existing unsaved gate, `save-flow`, `desktop-bridge`, restoration and response-token tests. Add a state-machine fixture; current tests do not prove a mode switch. |
| G4: windows/races | Window A Classic, B DE; delayed extracts/config/map/balance/worker callbacks in reverse order; detached viewport during switch/close. Every result/write follows its owning immutable context. | `native-viewport-close`, `castle-session`, `game-asset-refresh`, `balance-refresh`, `iso-scene-cache`, window-scoped desktop events. |
| G5: cache identity | Same numeric item and same basename in Classic and DE; two roots of the same edition; same-root parallel requests; warm no-op; game/texture/loader change; missing/corrupt atlas page; moved legacy absolute-path cache. Separate provenance, valid warm reuse and deterministic invalidation. | Rust `game/cache.rs`, building/unit/cache tests; `game-graphics`, `map-atlas-cache`, native map/camera tests. |
| G6: lossless documents | Unchanged real Classic `.aiv` byte equality; edited known sections retain untouched bytes/metadata; DE empty frames, pause amount/flags, unknown top-level/frame/marker fields/IDs, sparse/future slots. Switching does not alter serialization. | `aiv-native-codec`, `castle-format`, `expanded-troop-spots`, `aiv-file`, `desktop-bridge`. |
| G7: conversion boundaries | DE-only items, future IDs, pauses/empty steps or slots above nine to `.aiv` fail before writing; destination bytes/hash unchanged; explicit extension and selected filter agree; cancellation keeps source bytes/dirty state. | Existing Classic rejection, atomic writer and extension-selection tests; add both backends with a profile switch during an open save dialog. |
| G8: schema and package separation | UCP create/clone/update/media mapping still emits its existing files and portraits; DE LORDJSON never enters UCP key/default transformation; DE save never becomes a mapped Classic `.aiv`. Unknown raw lord fields survive. | `ucp-library`, character/startup/content tests and Rust library transactions; add DE schemas/package fixtures from the format track. |
| G9: capabilities/art/analysis | Classic outputs/costs/allocations/previews unchanged; DE missing asset is explicit; unsupported costs/workers/fire/path rules never fall back to Classic; unknown JSON content remains preservable. Expanded slots reflect class and per-AI capacity. | `castle-analysis`, cost-model/panel, `castle-troops`, `resource-buildings`, `castle-format`, art/pose fixtures. |
| G10: application/game acceptance | Later isolated profiles exercise first-run picker, all save/cancel branches and mixed windows in native/Electron as supported. Representative Classic in-game compatibility and DE package loading follow only the parent's isolated-session protocol. | Historical `native-parity.md` has OS-picker/media and DE execution gaps; passing Node fixtures cannot close them. |

Two special risks deserve explicit fixtures:

- **Observed primitive behavior; inferred document risk:** claiming arbitrary unknown JSON fields are completely lossless
  needs a numeric policy. `JSON.parse`/`JSON.stringify` use JavaScript numbers;
  an unrecognized integer above `2^53-1` can lose precision before save. Native
  storage's JSON envelope is not an opaque raw-text transport for castles.
  Decide whether raw JSON token preservation is required, and test safe and
  unsafe integers as well as unknown objects/arrays. Do not broaden existing
  semantic preservation claims into exact token/byte preservation. [S9, S10,
  S16; `src-tauri/src/storage.rs:238–253`]
- **Source-confirmed:** Node map fallback can choose a hard-coded Classic
  installation when no selected root exists. Keep that legacy behavior confined
  to Classic; a DE/no-root call must never use it. Native does not use the same
  Node fallback. [S23; `src/node/game-map.js:147`]

## Concrete implementation sequence

1. **Preserve a baseline before refactoring.** Retain Classic codec, format,
   template/override and asset tests; add failing synthetic isolation/switch
   fixtures for G1–G4. No game asset/deployment work yet.
2. **Introduce identity and read-only detection.** Implement profiles,
   installation probes and shared detection fixtures; add versioned settings
   migration and backend DTOs. Preserve old Classic public calls as adapters
   during transition. Regenerate/check bindings locally using the desktop
   README workflow. Gate: G1–G2 and unchanged Classic fixtures.
3. **Bind services and caches to context.** Remove implicit mutable global-root
   resolution from new calls; add window ownership and context-generation
   responses, config cache keys and edition/root cache directories. Keep
   Classic algorithms intact. Gate: G4–G5 plus typed IPC and warm-cache tests.
4. **Implement startup/switch coordinator.** Split picker from activation,
   wait for profile readiness, reuse the unsaved gate, namespace browser domain
   persistence, and reset all dependent view state. Only then expose a toggle.
   Gate: G3–G4 including cancellation/failure rollback.
5. **Add capability consumption without changing serialization.** Partition
   palette creation/slot limits, label art provenance and disable unverified
   DE analysis. Keep read/preserve independent from edit/deploy; retain current
   Classic byte/format behavior. Gate: G6–G7/G9.
6. **Integrate verified DE codecs and package schemas.** Add LORDJSON and DE
   library adapters from the other research tracks; preserve unknown data.
   Keep UCP package writers independent. Gate: G8 plus asymmetric real-file
   interchange fixtures, never just JSON syntax.
7. **Replace illustrative art through verified local extraction.** Route DE
   extractors into existing renderer DTOs with source fingerprints and pose/
   anchor metadata. Gate: G5/G9 with representative units, structures,
   terrain and rotations; absent sources remain labeled gaps.
8. **Enable deployment last, per proven capability.** Add reversible package
   install planning/writes only after target/loader contracts are verified,
   then let the parent run isolated native/Classic/DE game acceptance. G10
   cannot be replaced by a converter round trip or a successful editor save.

## Reproducible probes and results

Every Toolkit command below ran with explicit workdir
`S:\Projects\UCP\AI-Toolkit-DE`. The commands are read-only or in-memory tests;
no dependency install, build, CI, commit, push, release or game launch occurred.

### Source identities

```powershell
git status --short
git rev-parse HEAD
git branch --show-current
git remote -v
git diff --stat 5ce3676af8ddb78a11f0148cc2311915eec0a0d8 HEAD -- src src-tauri main.js preload.js config assets tests package.json
git diff --name-only 5ce3676af8ddb78a11f0148cc2311915eec0a0d8 HEAD -- docs/definitive-edition-integration.md docs/expanded-troop-spots.md docs/native-parity.md
git -C 'S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods' rev-parse origin/develop origin/main
git -C 'S:\Projects\UCP\de-research\Serpens66-Stronghold-Crusader-DE-Mods' show 7e199e6f0818173794bdeeb0c4c32d74500b0eec:Findings/AIToolkitDE.md
```

**Observed:** initial Toolkit status was clean; HEAD/branch matched the brief.
Both diff commands returned no differences. Origin is
`https://github.com/Schlossgespensty/AI-Toolkit.git`; fork is
`https://github.com/Krarilotus/AI-Toolkit.git`. The source clone's develop/main
resolved to the pins recorded above. Later central-ledger changes from parallel
work were left untouched.

### Local DE binary identity, not runtime acceptance

The three inspected files were read and SHA-256 hashed on this date. No binary
was copied into the repository or executed. Paths below are relative to
`D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition`.

| File | Size (bytes) | Observed SHA-256 |
| --- | --- | --- |
| `Stronghold Crusader Definitive Edition.exe` | 887880 | `8acea6d11af81cf26b035a479ba633bdb0d09513742055f3f46330d72b2f203a` |
| `Stronghold Crusader Definitive Edition_Data/Managed/Assembly-CSharp.dll` | 3693056 | `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789` |
| `Stronghold Crusader Definitive Edition_Data/Plugins/x86_64/CrusaderDE.dll` | 3451392 | `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2` |

```powershell
$architectureGameRoot = 'D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition'
$architectureRelativeFiles = @(
  'Stronghold Crusader Definitive Edition.exe',
  'Stronghold Crusader Definitive Edition_Data\Managed\Assembly-CSharp.dll',
  'Stronghold Crusader Definitive Edition_Data\Plugins\x86_64\CrusaderDE.dll'
)
foreach ($architectureRelativeFile in $architectureRelativeFiles) {
  $architectureBinaryPath = Join-Path $architectureGameRoot $architectureRelativeFile
  Get-Item -LiteralPath $architectureBinaryPath | Select-Object FullName,Length
  Get-FileHash -LiteralPath $architectureBinaryPath -Algorithm SHA256
}
```

The launcher and `CrusaderDE.dll` both returned PE machine `0x8664` and optional
header magic `0x20b`. This confirms the observed x64 binaries, not equivalence
of Classic and DE structures. The managed assembly hash matches the historical
value recorded in the Toolkit DE integration document; version/runtime
semantics were not re-decompiled in this architecture subtask.

```powershell
@'
const fs = require('node:fs');
const root = 'D:/SteamLibrary/steamapps/common/Stronghold Crusader Definitive Edition';
const {normalizeInstallationPath} = require('./src/node/ucp-library');
try { console.log(normalizeInstallationPath(root)); }
catch (error) { console.log(error.message); }
for (const file of ['Stronghold Crusader Definitive Edition.exe',
  'Stronghold Crusader Definitive Edition_Data/Plugins/x86_64/CrusaderDE.dll']) {
  const bytes = fs.readFileSync(root + '/' + file), pe = bytes.readUInt32LE(0x3c);
  console.log(file, bytes.readUInt16LE(pe + 4).toString(16),
    bytes.readUInt16LE(pe + 24).toString(16));
}
'@ | node
```

**Observed selector result:** `This is not a UCP installation. Expected to find
an ucp/plugins folder.` Native rejection is source-confirmed by the matching
validator, not separately executed through a native application.

### Existing format/refresh/regression tests

Node version: `v26.7.0`. Existing dependencies were used without installation.

```powershell
node --test --test-reporter=spec tests/aiv-native-codec.test.js tests/aiv-format.test.js tests/castle-format.test.js tests/expanded-troop-spots.test.js tests/castle-session.test.js tests/game-asset-refresh.test.js tests/save-flow.test.js
node --test --test-reporter=spec tests/desktop-bridge.test.js tests/character-startup.test.js tests/castle-editor-regressions.test.js tests/castle-troops.test.js tests/balance-refresh.test.js tests/scene-refresh.test.js tests/iso-scene-cache.test.js
```

**Observed:** first command 27 passed, zero failures/skips; second command 46
passed, zero failures/skips. The desktop bridge test also runs TypeScript's
`noEmit` contract fixtures. These are source/in-memory fixtures, not GUI picker,
game fixture, full test-suite, Rust compilation, or new isolation acceptance.

### Existing Classic-format cap mismatch

```powershell
@'
const fs = require('node:fs'), vm = require('node:vm');
const constants = require('./config/aiv_constants.json');
const source = fs.readFileSync('src/js/castle-editor.js', 'utf8');
const start = source.indexOf('  function maxAmount(');
const end = source.indexOf('\n  function ', start + 5);
const context = vm.createContext({ state: { format: 'aiv' },
  itemInfo: type => constants[type] || {},
  isUnitType: type => constants[type]?.kind === 'unit' });
vm.runInContext(source.slice(start, end), context);
console.log('Classic editing cap:', context.maxAmount(6));
console.log(require('./src/js/castle-format').classicIssues({frames: [],
  miscItems: [{itemType: 6, number: 10, positionOfset: 100}]}, constants));
'@ | node
```

**Observed:** cap `30`; export diagnostic says spots above 10 cannot be saved
in Classic `.aiv` and recommends DE `.aivjson`. This demonstrates the current
UI/export distinction without writing any document.

### Character-array and unknown-number preservation boundary

```powershell
@'
const fs = require('node:fs'), vm = require('node:vm');
const source = fs.readFileSync('src/js/character-editor.js', 'utf8');
const start = source.indexOf('function renameKeysPreserveOrder(');
const end = source.indexOf('\nfunction ', start + 5);
const context = vm.createContext({ legacyKeyMap: {} });
vm.runInContext(source.slice(start, end), context);
const output = context.renameKeysPreserveOrder({ futureArray: [11, 22] });
console.log(JSON.stringify(output), Array.isArray(output.futureArray));
console.log(JSON.stringify(JSON.parse('{"future":9007199254740993}')));
'@ | node
```

**Observed:** the character transform returns
`{"futureArray":{"0":11,"1":22}}` and `false`; JSON numeric parsing followed
by serialization returns `{"future":9007199254740992}`. These are in-memory
boundary probes, not an attempted import/save of an actual DE lord. They
justify array fixtures and a numeric-preservation policy before adding that
document kind.

## Unresolved questions and handoff boundaries

1. The format/runtime tracks must supply version-pinned LORDJSON/package/media
   contracts, native/loader capacity limits and validated slot/ID mappings.
   This report deliberately does not promote the Serpens66 lead or old Toolkit
   comments into independent game evidence.
2. Define unknown/future JSON preservation precisely, including large integers,
   array ordering and omitted/default-valued fields. The existing common model
   is valuable but not a proof of arbitrary raw-token losslessness.
3. Confirm whether both desktop backends are product acceptance targets for
   DE. Recommended default: implement detection/settings/document safety for
   both, expose only capabilities each backend actually supports, and retain
   Classic Electron behavior. Do not silently advertise native-only previews
   through the Electron interface.
4. Decide the user-visible behavior for switching with an open foreign-format
   standalone document: cleanly close after the existing gate, or keep it in
   an intentionally owned window. Either can work; changing its edition/schema
   in place cannot. The user has already authorized separate roots/modes;
   ordinary implementation decisions need not block initial isolation work.
5. Asset research must supply authentic DE provenance/anchors/rotations and
   missing-item coverage. Illustrative SVGs and Classic extracted sprites are
   not substitutes for that acceptance.
6. Historical native parity leaves OS pickers, playback and DE game execution
   pending. The parent should own isolated runtime verification after G1–G9;
   this subtask has neither launched the game nor closed those acceptance rows.

Immediate recommended next implementation milestone: profiles, read-only
edition detection, context-bound service calls, and a failure-safe switch
coordinator with synthetic isolation fixtures. Keep DE package deployment and
new extraction behind capability gaps until their primary evidence is ready.

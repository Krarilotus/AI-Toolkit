# Native preview parity and footprint review

Reviewed against `snapshot-native-4b10b163`, published on 22 September 2026.
The baseline is the Electron `main.js`/`preload.js` contract and the shared
editor implementation, not a claim that every OS interaction has been tested.
Follow-up fixes below are explicitly distinguished from that published build.

## Evidence levels

- **Live verified**: exercised in a separate native editor/profile, using real
  WebView2 and native IPC. A substituted file-picker destination does not count
  as testing the Windows picker itself.
- **Fixture verified**: real file/codec/transaction work with owned test files,
  or exact comparison with the existing Node implementation and a local game.
- **Unit verified**: isolated automated contract/state tests, without the full
  desktop/OS flow.
- **Source reviewed / untested**: implementation exists, but this review has no
  corresponding end-to-end evidence. This is not an assertion that it is broken.

The release check recorded 536 editor tests and 35 passing Rust tests. One Rust
fixture test is intentionally excluded from the portable suite because it needs
an explicitly supplied game installation; that test was run separately. See
[preview validation](native-preview-validation.md) for the measured rendering
runs and [packaging](native-packaging.md) for the image and installer audit.

## Compatibility matrix

| Area | Native behavior and evidence | Status / remaining verification |
| --- | --- | --- |
| Public desktop API | `tests/desktop-bridge.test.js` checks every legacy preload method exists in the native adapter. Commands remain consumed by the existing editors. | Unit verified; API presence alone does not establish behavior parity. |
| Classic `.aiv` open/save | Shared `aiv-codec.mjs` is bundled for the browser; Rust reads/writes bytes. An unchanged save retains original source bytes; edits use the same proven codec and classic-format validation. | Fixture/unit verified, plus real castle loading. Windows Save/Open picker interaction still needs a native smoke test. |
| DE `.aivjson` / `.aijson` | Shared castle-format import/export is retained. Explicit extension controls encoding; Save As offers Classic/DE separately and asks if a platform returns an extensionless name. Unsupported classic exports are rejected before writing. | Unit/format-fixture verified. DE is installed at `D:\Games\Stronghold Crusader Definitive Edition`; loading exported castles in that game is untested, and no game was launched. |
| Character and dialogue JSON | Serialized game keys remain unchanged by interface translation. Character and AI Content use the existing normalization/serialization code. Native writes replace files transactionally. | Existing editor tests plus native fixture coverage; full native OS Save As flow untested. |
| Editable `config/*.json` | External config next to the executable overrides embedded defaults. New item fields merge while custom/unknown values survive; other config files retain the old replacement contract. | Native unit verified and real updater preservation verified. Immutable defaults are intentionally still embedded. |
| AI library discovery | Native code finds active/latest UCP plugin versions, metadata, portraits, castle mappings and vanilla castles. | Live verified on the selected installation; malformed definitions and filesystem permission failures are not exhaustively covered. |
| Project opening/restoration | Same settings directory and legacy localStorage keys; copied LevelDB migration leaves the original database untouched. Main startup restores the last project; explicit extra windows do not auto-restore over their requested file. | Live verified in an isolated copied profile; migration fixture verifies original files remain unchanged. |
| JSON fallback for a mapped classic castle | Reads the `.aivjson` fallback but keeps its mapped `.aiv` destination. Unreadable existing dialogue files fail instead of becoming a blank replacement. | Native fixture verified. |
| Create / clone / update AI | Per-project staged replacement preserves unrelated files and encoded data; failed traversal/staging leaves the original AI intact. | Native fixture verified. Follow-up source also fixes the metadata side effect described below. |
| Add castle / replace character / castle mapping | Existing context warnings retained; add/replace encode classic castles before writing. Mapping accepts up to eight existing `.aiv` files. | Adapter/native unit and source reviewed. A complete native picker-driven add/replace scenario is not yet recorded. |
| Portrait replacement | Uses shared nearest-neighbor scaling and the original binary-alpha threshold for 72×72 / 36×36 output. | Shared pixel tests and bridge/source reviewed; OS image picker untested. This is user-requested portrait conversion, not release image shrinking. |
| Speech / Bink | Speech data is returned for browser playback; Bink opens externally. Replacement resolves an existing mapping and checks the file extension. | Source reviewed; full audio playback / external Bink association / picker interaction untested. |
| Custom item skins / castle background | Existing userData skin directory and numeric item filenames are retained. Custom skins override local game previews. Background loading accepts the same image formats. | Source and existing renderer tests; native picker and damaged-image scenarios need OS-level checks. |
| Full-resolution castle PNG | Export uses the shared renderer, not the current screen zoom. | Live verified: 8900×8900 PNG with local game sprites, unchanged document. Test supplied its own destination instead of interacting with the OS picker. |
| Additional editor windows | Native senders target a window label; renderer listeners are window-scoped too. Document readiness and pending content share one mutex. | Live verified on final release build and unit verified: a secondary castle does not detach the main Gatekeeper project. Closing the secondary window leaves main open. |
| Detached 2.5D window | Same-origin child view reuses the rendering state and theme/language services. | Live verified; multi-monitor mixed-DPI movement is untested. |
| Window bounds / maximization | Main window restores normal bounds and maximized state; restoration clamps to available monitor work areas. | Live restored-profile check and geometry unit tests. Removed-monitor geometry is tested, not every physical monitor arrangement. |
| Unsaved changes / confirmation dialogs | Existing shared unsaved state gate is retained; closed-window events are scoped. | Live window/update guard verified. Published build's missing native dialog owner is fixed in follow-up source; OS modal ownership still awaits rebuilt smoke test. |
| Native menus and shortcuts | File/Edit/View actions, customized castle shortcuts, viewport keys, zoom/fullscreen/reload and theme/language selection are bridged. Reload respects the unsaved gate. | Unit plus selected live actions. OS popup keyboard navigation and every accelerator are not comprehensively exercised. |
| Themes / languages | Default and UCP packs share components; custom pack selection/persistence and all nine language switches work. Global language/theme broadcasts intentionally reach all editor windows. | Live verified plus schema/catalogue/reference tests. Language completeness is not a claim of native-speaker review of every sentence. RTL/theme follow-up work is separate from this baseline. |
| Game terrain / cliffs / trees / rotations | Pure Rust readers reproduce the existing map metadata and exact atlas pixels. Former native-camera captures may be read only if their fingerprints match. | Local-game fixture verified on GreekSea, A Friend Indeed and Double Trouble, including all four cached camera directions; live maps rendered. No game was launched or attached to. |
| Active texture overrides | Maps, buildings, units and HUD icons share the selected game/UCP source resolver and source revision. Only declarative registrations are interpreted; arbitrary Lua is not executed. | Local fixture/live installed-pack checks and resolver tests. Every third-party dynamic Lua registration scheme is not supported or claimed. |
| Local unit previews | Classic IDs 1–21 are extracted from game GM1s, with player palette 1 and rider composition where applicable. Texture crops preserve scale/pixels. | Palette/trim unit tests and installed-game live checks. These 2D previews use frame 0 and are not claimed to be idle 3D troops. |
| Asset caching / transport | Extraction requests sharing a cache root are serialized. Warm results reuse PNG file URLs and do not rewrite pages. Source revisions invalidate changed game/pack metadata. | Concurrent cache test, exact warm payload/mtime fixtures and live bridge measurements. Old disk-cache revisions are not pruned yet. |
| Native updater | Dynamic official/fork selection, digest validation, staged install/rollback, configuration preservation and verified installed receipt. | Live baseline-to-published-snapshot self-update passed; transaction failure cases are unit tested. See evidence below. |
| Installer | NSIS obtains WebView2 separately only if missing; editable config is written only when absent and retained on uninstall. | Real NSIS hook/reinstall/abort checks on owned directories. Full clean-Windows-machine install and missing-WebView2 download remain untested. |
| Other operating systems | Tauri/browser source remains portable; the current package and native update transaction target Windows x64. | Linux/macOS builds and OS integration are untested; no cross-platform release claim. |

## Concrete findings and boundaries

### Native dialogs did not have an owner

In the published build, `desktop.rs` created file and message dialogs through
`app.dialog()` without supplying the invoking window. Electron explicitly passed
`BrowserWindow.fromWebContents(...)`. This loses the intended ownership/modal
relationship and can leave a dialog behind its editor. It also permits a risky
sequence: Save As captures a document before the picker opens, then clears dirty
state after writing that captured document while edits might have continued.

**Follow-up source fix:** `pick(app, window, payload)` now requires a window at
every call site and uses `set_parent(window)`; image selection forwards that
window; confirmations call `parent(window)`. Compilation covers every Open/Save,
game-directory, image/portrait, skin, media and PNG picker call. The focused Rust
test passes. Actual Windows owner/modal behavior must be checked on the rebuilt
executable; this review does not count compilation as that OS-level proof.

### Failed managed-project operations rewrote plugin metadata

`library.rs::managed_target()` writes the generated `definition.yml` before
`create()` checks duplicate IDs/blank names or `update()` validates JSON, and
before their project transaction starts. Consequently an operation that reports
failure can create or replace managed-plugin metadata. The prior Electron code
performed validation first and wrote that definition inside its staged plugin
transaction. This is a concrete failure-side-effect regression, separate from
the tested preservation of the AI's own files.

**Follow-up source fix:** target computation is now read-only. Existing plugin
metadata is preserved byte-for-byte, and ordinary updates still stage just the
affected AI. If the plugin definition is missing, a plugin-level transaction
stages the definition and requested AI together and commits both in one rename.
This avoids copying every other AI during routine saves. Six native library
tests pass, including first-creation failure, duplicate-ID/invalid-JSON failure,
failure after a changed character was staged, missing-definition recovery
failure, and successful create/update preservation of custom plugin and AI files.

### Deliberate remaining limits

- First migration from an old Electron build uses setup or manual ZIP extraction.
  That older updater requires `resources/app.asar`, which the native package does
  not contain. Native → official Electron installation has package/receipt unit
  coverage, not a live migration test; an old official Electron build cannot then
  consume a native-only snapshot through its old updater.
- Idle 3D defensive formations are not implemented. Verified sprite research and
  the remaining frame/anchor questions are in
  [native idle sprite research](native-idle-sprite-research.md).
- Asset changes are rechecked during game selection and map/asset reload. There
  is no background filesystem watcher. Disk cache revision pruning is still
  absent; it affects long-term local disk use, not the download size.
- Cold application startup has not been given a controlled end-to-end benchmark
  here. Map extraction timings and slider animation-frame timings must not be
  presented as startup or screen-presentation latency.

## Published updater acceptance result

An untouched `local-preview` portable ZIP was extracted into a unique test
directory with its own userData and debug port 9242. The real update button
downloaded `snapshot-native-4b10b163`, replaced the executable, restarted, and
displayed `Aktuell` with `releaseCurrent`, in 6.99 seconds for the whole harness.
The profile started with no unsaved document. The test preserved and verified:

- Customized configuration present before download.
- A second configuration edit made after staging completed, before install.
- A settings field, localStorage value and the selected experimental repository.
- Original baseline ZIP bytes, with no changes to the user's installation.

The installed receipt key matched the selected GitHub release/asset/digest;
the executable matched the downloaded ZIP. Only the test window was closed.
The active editor on 9241 was left running.

| Artifact | SHA-256 |
| --- | --- |
| Published portable ZIP | `c3380bf86f07c667897e19cecc18b8fd5bbf62a85f4eec08e80e5da2a85f4131` |
| Installed executable | `79192435031aa24703bf53db9580c603afc43614a4ac7fdfd4e8b7cb4044bd40` |

Local reproducible evidence is kept outside the repository at
`ai-toolkit-setup/native-updater-e2e-1790043681978/result.json`, alongside the
guarded `test-native-updater-e2e.mjs` harness. It used same-volume staging; it does
not prove a cross-volume OS update. The cross-volume acquisition/recovery path
has separate native transaction coverage.

## Footprint measurements and bounded next steps

The published ZIP is **7,728,703 bytes**; setup is **7,075,528 bytes**. WebView2 is
an external OS runtime, not included in these numbers. The ZIP central directory
gives the following actual compressed contributions:

| Payload | Raw bytes | Compressed bytes |
| --- | ---: | ---: |
| Executable, including embedded frontend | 11,231,744 | 7,581,434 |
| Dependency/artwork notices | 750,595 | 81,423 |
| External isometric metadata | 776,181 | 28,626 |
| All 19 editable config files | 401,375 | 31,349 |
| README | 2,152 | 1,087 |

The executable is 98.1% of the download. Removing editable config or required
notices would save little and break compatibility or attribution. The current
release already excludes Chromium, Node, Firefly sprite PNGs, source maps,
authoring files and unused legacy atlases. No image conversion is proposed here.

1. **OS TLS on Windows, Rustls elsewhere: implemented in follow-up source.** `cargo tree -i rustls`,
   `-i ring` and `-i webpki-roots` show these dependencies enter the Windows build
   only through `reqwest`. The follow-up Windows `native-tls` dependency uses
   SChannel; the active Windows graph no longer contains Rustls. Other targets
   retain Rustls. Certificate validation remains enabled; trust follows Windows
   policy instead of the bundled Mozilla roots. Real GitHub API, redirect/download
   and checksum checks are required before publishing the optimized candidate.
2. **Selective Pixi bundle: implemented in follow-up source.** A
   temporary esbuild experiment retained the 13 symbols used by
   `castle-gpu-worker.js`, plus `pixi.js/unsafe-eval`. It produced 460,564 bytes
   versus the current 844,066-byte Pixi/CSP scripts. Independently deflating the
   scripts estimated 132,901 versus 237,912 bytes: approximately 105 KB less.
   This script estimate is not an exact EXE saving. Graphics masks, fire overlays,
   tile sprites, context recovery and both GPU
   surfaces must remain live in the same realistic scrub benchmark before release.
3. **Avoid a redundant native English catalogue.** The browser already receives
   all English messages from `locales/english.js`; `i18n.js` marks English loaded
   at initialization. Native packaging could omit the unused `en.json` while
   retaining it for Node tests. Its independent deflate size is about 30 KB.
   Verify English → another language → English and detached views before removal.
4. **Keep a single declarative payload policy.** Native packaging, updater
   allowlists and installer config handling currently repeat related file rules.
   Generate/validate their shared file list from one small manifest, preserving
   separate update/install semantics. This reduces drift, not image quality.
5. **Prune old caches separately from rendering.** Only after current and previous
   scene references are protected, prune obsolete revision directories under the
   owned userData cache. Never introduce cache scanning into scrub/pan/zoom paths.
   This is a local disk-space task, not a release-size change.

Some permitted skin files have identical bytes. Mapping duplicate item IDs to a
single immutable source can simplify the skin manifest without changing pixels,
but do not assume a useful executable saving: the compiler may already fold
identical embedded compressed data. Measure before introducing extra machinery.

The existing shared codec, source resolver, cache extraction gate, atomic writer,
theme components and YAML/i18next pipeline are the appropriate reuse boundaries.
Further refactoring should strengthen request/result types around the existing
desktop operations and preserve those shared modules, rather than introduce a
second renderer, a second castle serializer or a generic framework for trivial
file operations.

The combined SChannel/selective-Pixi optimized candidate measured **10,232,320
executable bytes** and a **7,115,886-byte portable ZIP**, versus 11,231,744 and
7,728,703 for the published baseline. That is 612,817 fewer ZIP bytes without
image changes. It still used the previous notices and preceded the final UI
refinements; it is a comparison build, not the final audited release size.

# Lightweight releases and responsive startup

Plan prepared against PR #4 commit 9f25a94, 20 September 2026.
No asset downscaling, lossy recompression, feature removal or framework migration
is part of this planning commit. The released snapshot remains independently testable.

## What the package actually contains

Measurements use the Windows x64 ZIP and its unpacked directory, not repository
or node_modules development sizes. MB below means 1,000,000 bytes.

| Item | Installed MB | ZIP contribution MB |
| --- | ---: | ---: |
| Complete snapshot | 354.96 | 151.55 |
| Electron application executable | 246.15 | 103.72 |
| resources.pak | 12.44 | 12.33 |
| dxcompiler.dll | 25.74 | 9.89 |
| Application archive (app.asar) | 13.00 | 8.62 |
| ICU data | 10.88 | 4.42 |
| Chromium license notices | 20.47 | 2.00 |

The application archive contains 9.39 MB of assets, 1.32 MB of production Node
packages, 0.85 MB of browser vendor bundles, 0.64 MB of renderer JavaScript,
0.16 MB of Node source and 0.14 MB of CSS. The executable alone accounts for
about 68% of the download. Even deleting the entire application archive would
save only 8.62 MB of this ZIP: compressing artwork cannot solve the runtime cost.

Largest application files: building-parts.png 1.91 MB, icon.png 1.48 MB,
background.png 1.16 MB, pixi.min.js 0.83 MB, sprite catalogue 0.82 MB.
Exact duplicate asset bytes total only about 70 KB. Deduplicating those may
simplify asset ownership, but is not a significant release-size optimization.

Already done: retained all nine UCP locales while excluding unused Electron
locales; shipped only Pixi browser bundles plus license. The earlier da1ce18 ZIP
was 161.50 MB; the current ZIP is 151.55 MB, approximately 6.2% smaller.

Do not manually delete Chromium DLLs, software rendering fallbacks, ICU, licenses
or high-DPI resources. Their absence can break graphics, accessibility, language
handling, media or machines unlike the development PC.

## Code-path findings and local measurements

These are component timings from Node on Khaleesi, using the actual game folder,
GreekSea and the existing native capture. They are not a cold-boot benchmark or
end-to-end UI timings. No game helper was launched for this audit. Packaging had
completed before these probes. OS file caches were not cleared.

| Operation | Observed | Interpretation |
| --- | ---: | --- |
| Library scan, 240 AIs / 22 plugins | 182 / 148 / 153 ms | Synchronous main-process work; precedes last-project restoration. |
| Serialized library result | 4.49 MB | Includes eager portrait data URLs, not just metadata. |
| Read existing native layer files | 1.68 ms | The captured raw layers are already cheap to reuse. |
| Construct four native camera atlases | 2,165 ms | Current dominant measured CPU preparation stage. |
| Serialized four-camera result | 31.87 MB | Image data URLs and base64 grids increase transfer/allocation costs. |
| Construct saved-map atlas separately | 623 ms | Eager fallback work happens even on successful native loads. |

Concrete code paths:

- `src/js/ucp-library.js: initialize()` awaits `scan()` before locating/restoring
  the previous project. `main.js` invokes `scanUcpInstallation()` synchronously.
  `src/node/ucp-library.js` recursively scans metadata/castles and reads portraits
  into base64 during that operation.
- `src/node/game-map.js: readNativeMapTiles()` first calls `readMapTiles()` to
  build the saved fallback, then builds native atlases on success. Validation
  and fallback construction are coupled unnecessarily.
- `buildTileAtlas()` decodes GM1 imagery, constructs RGBA atlases and calls the
  synchronous PNG encoder. Four native cameras repeat this work. `readMapTiles()`
  also exposes camera zero at the top level alongside the camera array; inspect
  actual IPC allocation before assuming its shared values are free to transfer.
- Native capture startup has since been removed: the map reader only validates
  existing captures and otherwise uses saved terrain. It never prepares a helper
  installation or launches Crusader. Fingerprint reads still occur for existing
  captures; no-cache startup skips them entirely.
- `src/js/iso-view.js: setMapTiles()` initializes all four camera images and
  decodes all their base64 grids immediately. Each image completion can request
  another refresh. `loadCatalogue()` caches the result but not an in-flight
  promise; overlapping init/mount calls can repeat the request/parse.
- `src/index.html` eagerly loads all workspace scripts. `main.js` eagerly imports
  the AIV codec. These are candidates to measure, not evidence that every script
  should be split. The total renderer source is much smaller than the map payload.
- Release-source discovery queries forks before initial updater UI completion.
  This should remain independent of project loading; do not move it onto the
  startup critical path while refactoring.

## Ordered implementation plan

### 1. Establish observable startup stages

Add optional performance marks at process entry, window creation, DOM ready,
controls usable, project restored, first correct 2D frame, first correct 2.5D
frame, and all camera assets ready. Measure long tasks and cancellation as well
as elapsed time. Keep diagnostic output out of normal user flows.

Run five warm restarts and three first-map/cache-miss loads at the user's saved
maximized size/zoom. Record median and range, plus a timeline. Use separate runs
for CPU profiling and uninstrumented timing. First launch with no project,
missing project, disconnected game folder and a large AI library are separate
cases. Never report warm native-cache timing as cold launch timing.

### 2. Stop preparing the same map twice

Separate map validation/section parsing from atlas materialization. On native
success, build only native output. Construct the saved fallback only after a
native failure. Reuse parsed sections within that request. Preserve bounds,
hash validation, start places, terrain heights and compound removal.

Coalesce concurrent requests by installation/map/revision. Move heavy atlas
construction to a bounded worker so the main process remains responsive. Add
cancellation/generation tokens: a late result for a previous map must never
replace the current one. Avoid running four CPU-heavy encoders simultaneously
without measuring peak memory and foreground responsiveness.

Acceptance: success path performs zero saved-fallback atlas builds; failure path
still displays the correct saved map; existing fixtures and four-camera output
match. A request cancelled during map switching releases work and images.

### 3. Cache derived assets, then reduce transfer work

Persist completed atlas artifacts atomically, keyed by map content, relevant
game assets, capture format and atlas/compound schema version. Reuse the existing
native provenance contract rather than inventing a separate stale-cache rule.
Corrupt/partial entries regenerate; cap storage with eviction, retain only active
assets in memory, and expose cache size/clear-cache in diagnostics if needed.

Load the selected camera first. Decode other views during idle time, sharing
height/grid data where identical. Replace large data URLs with a narrow,
validated asset protocol or binary transfer where supported by the actual IPC
bridge. Never accept arbitrary filesystem paths from renderer requests. Revoke
or close image resources when documents/maps change.

Acceptance: warm reopen does not decode GM1 or encode PNG again; rapid rotations
show the correct camera without temporary stale geometry. Terrain asset quality
and pixel dimensions are unchanged. Measure cache-hit latency, disk growth and
peak resident memory. Set a numeric startup target only after phase 1 establishes
whole-app timings; the immediate structural target is removing the measured
2.17-second atlas rebuild from warm startup.

### 4. Restore the active project before filling the library

Validate and open the saved project directly through the same path/installation
checks used for manual opening. Refresh the full library asynchronously, updating
metadata incrementally. Read portraits only for visible rows/details, with
bounded caching. Preserve active plugin/version selection and the existing rule
that manual opens or edits take precedence over pending restoration.

Make the first useful editor frame interactive while optional library/media/map
work completes. Show concise progress in the relevant panel, not a modal spinner
or a blank screen. Do not initially render an unrelated empty castle over the
restored project's slot. UI navigation and Save/Cancel remain usable throughout.

### 5. Small, lossless packaging wins

Audit production dependencies and exclude unused source maps, development builds
and documentation only after checking runtime imports. js-yaml source maps alone
currently occupy about 0.55 MB uncompressed; their ZIP saving will be smaller.
Keep licenses. Test a tree-shaken Pixi build with only used rendering modules;
accept it only if CSP-safe worker initialization, context recovery and output
remain correct. Do not add a large build framework merely to save a few KB.

Lossless image recompression may be evaluated with decoded-pixel equality and
actual ZIP savings. Keep resolution/alpha intact. Avoid maintaining duplicate
optimized/source images inside the shipped archive. Report size diffs in CI so
new assets/dependencies have an explicit cost.

### 6. Make repeat updates small without breaking portable releases

Keep the full ZIP for first installs, manual download and recovery. Evaluate an
additional application-only update artifact when the installed Electron runtime
fingerprint matches. The current compressed app archive is 8.62 MB, illustrating
the opportunity; this is not a promised final update size.

Require a versioned manifest, cryptographic artifact checks, exact runtime/base
compatibility, atomic replacement, configuration preservation and rollback.
Fall back to a full download for runtime changes or any mismatch. Test official
and experimental channel switching, interrupted downloads, locked files and
restart receipts. Never silently combine app code with an incompatible runtime.
Prefer complete app artifacts over binary patch chains initially: fewer failure
states and simpler recovery. First-install size is unaffected by this phase.

### 7. Decide on Tauri with a bounded prototype

See `runtime-direction.md` for the host-service inventory. Tauri can avoid bundling
Chromium, but it still renders this HTML/JS UI in a WebView. The map preparation
and allocation problems must be fixed regardless. Evaluate Windows WebView2,
macOS WKWebView and Linux WebKitGTK worker/WebGL support, file codecs, native
capture restrictions and signed update channels before committing to migration.

Compare full installation cost including WebView prerequisites, not just the app
executable. Keep the UI and pure geometry modules; port privileged services
behind a typed adapter. Do not promise a 1-2 MB fully self-contained editor.
A Node sidecar would undermine the size objective and needs explicit justification.

## Quality and release gates

Each phase is a small reviewed commit on PR #4, with before/after measurements
and tests at the affected boundary. Do not create two long-lived implementations
of the same geometry or loading policy. Use typed data contracts and explicit
ownership for transferable buffers, bitmaps and cancellation. Keep required
Canvas fallbacks until equivalent behavior is demonstrated.

For every candidate: same project, zoom, window state and five rapid scrubbing
sweeps/second; check map rotations, build-step occlusion, overlays, selection,
project restoration and updater recovery. Test detached and hidden panels so
unseen views do not continue unnecessary rendering. Measure p95/p99 input-to-frame
latency separately from worker duration and frame intervals.

No lossy assets, removed features or favourable zoom settings qualify as a win.
The next implementation should be phases 1-2, followed by the derived-atlas cache;
small packaging cleanup can accompany those once its import audit is complete.

## Implementation checkpoint: atlas reuse

Implemented after snapshot-9f25a94:

- Parse/validate map sections once. Build saved-map fallback output only when
  native loading or validation fails. Rasterize the shared height grid once.
- Cache one complete native atlas result on disk, capped at 128 MiB per entry.
  GreekSea occupies 27.75 MB. Atomic replacement can temporarily use space for
  both old and new entries. There is no unbounded map-cache directory.
- Key reuse by map content, installation, game/helper/GM provenance, raw native
  layer content and explicit atlas schema version. Clear decoded GM assets when
  provenance changes. Failed writes/corrupt caches regenerate normally.
- Exclude unused js-yaml source maps from packaging; retain its runtime and license.

Identical serialized atlas output was verified for saved-map and all four native
cameras. A component benchmark using the existing captured native layers measured
2,718 ms for the previous successful-load path; the new cache miss took 2,122 ms,
and three cache hits took 68, 65 and 60 ms. These exclude native-helper preparation,
IPC and image display, and do not establish complete startup time. All images,
pixel dimensions and PNG payloads are unchanged.

Current local check: 442 tests passed, 10 skipped. The installer integration
fixture occasionally retained Windows file handles during cleanup; bounded
cleanup retries were added without weakening its restart/receipt assertions.

Still pending: main-process startup timeline instrumentation, moving cache-miss
atlas computation off the main thread, latest-request scheduling, reducing the
31.9 MB IPC payload and lazy camera decoding, direct last-project restore before
full library scan, and smaller update artifacts. The cache trades bounded local
disk space for faster reopen; it does not increase the release's bundled assets.

# Native preview validation

Windows x64, 22 September 2026. This records measured results and remaining
limits; the preview is not a claim of tested Linux/macOS support.

## Test conditions

The actual packaged WebView2 application used a separate user-data directory,
the existing Gatekeeper/Kratoloros castle (998 steps), and GreekSea from the
selected classic installation. The window was maximized at 2560 × 1369, with
both 2D and 2.5D views visible. No game process was started or attached to.

`scripts/benchmark-native-preview.mjs` sends mouse dragging events to the real
range control: 60 jumps at 100 ms intervals, approximately five round trips
per second between steps 100 and 900, also visiting adjacent steps. It records
the actual resulting values because range-thumb geometry can differ by theme.
It preserves the current view; `--fit` explicitly requests fitting the map.
All runs below had both GPU surfaces active and left the document unchanged.

The measurements are input-handler to next animation-frame callback, **not**
photon/presentation latency. CDP dispatch is measured separately. An idle frame
interval is not proof that a changed scene was presented in that interval.

## Rendering and map transport

| Optimized build | Median input → next frame | p95 | Maximum | Main-thread tasks over 50 ms |
| --- | ---: | ---: | ---: | ---: |
| Default | 14.9 ms | 18.9 ms | 24.3 ms | 0 |
| UCP | 14.7 ms | 20.8 ms | 23.4 ms | 0 |
| UCP, one wheel step closer | 11.8 ms | 19.0 ms | 19.4 ms | 0 |

The first native integration was materially worse: median input-to-frame was
about 69 ms. Asset-protocol images had been loaded without anonymous CORS, so
their ImageBitmaps could not transfer to the renderer worker. That silently
selected the CPU fallback. Loading these local images with the correct CORS
mode restores the existing GPU pipeline; the fix does not reduce image quality.

GreekSea's map response previously contained approximately 45.26 MB of base64
PNG data. It now contains approximately 1.50 MB of metadata and cache-file URLs.
The PNG bytes are unchanged. Three optimized, warm, complete bridge requests
took 60.9, 60.0 and 59.6 ms. These timings exclude later scene construction and
are not cold-start measurements. The existing Node and new Rust map decoders
were compared on the installed game in all four camera directions, including
Double Trouble. Concurrent asset requests share one extraction per cache path.

## Compatibility and visual checks

- Default and UCP are separate complete packs using the same shared components.
  The UCP pack uses original nine-slice button frames, arrows, fields, tabs,
  checkbox and scrollbar artwork by their intended role.
- Palette rows have uniform 44 px previews; image intrinsic height cannot enlarge
  the row. The player palette uses game colours, not the debug colour table.
- Nine catalogues contain 1,723 messages each. Completeness, interpolation and
  explicit source references are checked during development/packaging. Live
  switching was exercised for every language; Persian uses RTL without mirroring
  game coordinates. Domain labels were reviewed against their actual behavior.
- Existing project, clipboard, selected game/map, window bounds and maximized
  state were restored in an isolated copy of existing settings. Original settings
  are not modified by the legacy storage migration.
- Full-resolution PNG export produced an 8900 × 8900 image with the extracted
  game sprites, leaving the castle unchanged. The test substituted only the save
  picker destination with an owned temporary filename; it did not test the OS
  file-picker interaction itself.
- Detached 2.5D rendering uses the same theme and language services. New-window
  document delivery has one atomic pending/readiness state to prevent lost loads.
- Custom theme discovery, selection and persistence were exercised with an owned
  temporary pack. Existing custom configuration is covered by real NSIS reinstall
  and abort tests; defaults are only written when the file does not already exist.
- ZIP contents are round-trip verified. Every packaged image is byte-identical
  to its permitted source. No Firefly unit/isometric sprite pixels are bundled.

The final source checks passed 536 editor tests, 35 native tests, strict TypeScript,
complete catalogues and 1,024 explicit translation references. One game-fixture Rust test is explicitly
ignored in the ordinary portable suite; it was separately exercised against the
local installation. See the release notes for final test/artifact counts.

## Repeating the interactive benchmark

Run a separate portable copy, never the user's active installation:

```powershell
$env:AI_TOOLKIT_USER_DATA = '<owned test profile>'
$env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = '--remote-debugging-port=9241'
Start-Process '<test copy>/AI Toolkit.exe' -WindowStyle Hidden
# Load the unchanged 998-step castle and game map, then:
node scripts/benchmark-native-preview.mjs performance.json
```

`--profile` also writes a CPU profile and adds profiling overhead. Do not use
profiling runs to represent normal operation. The script refuses an unsaved
document, a missing map or fewer than 901 steps, and rejects the CPU fallback.
The debug port is a test-only launch option, not enabled in shipped shortcuts.

## Limits

WebView2 is an external runtime, downloaded separately if missing. The first
Electron-to-native migration uses the installer or manual portable extraction;
the old Electron updater cannot consume a native package. The native updater
subsequently uses native ZIP releases.

3D defensive troop formations remain research, not a shipped feature. Local
asset changes are rechecked on installation selection and map reload, not by a
background filesystem watcher. Native OS popup/file-picker interaction still
needs user testing: the computer-use bridge was unavailable, so live checks used
WebView2/CDP, screenshots and native integration tests.

# Native preview validation

Windows x64, 22 September 2026. Native compilation/tests now also pass on
Linux/macOS; their OS GUI and updater integration remain untested.

## Final cleanup preview: 39659543

Published `snapshot-native-39659543`: **7,208,195 bytes portable / 6,597,650 bytes
Setup**. All 122 packaged images match their source bytes. 564 JavaScript tests,
strict TypeScript and all nine catalogues pass.
[Native CI](https://github.com/Krarilotus/AI-Toolkit/actions/runs/35736981014)
passes on Windows, Linux and macOS: 47 Rust tests and native binary compilation.
The opt-in local game parity test passed separately against the installed game.

Native create/save/clone/reopen/add/mapping checks preserve unknown character
fields and unchanged castle bytes. Object-valued JSON saves work. Twelve rapid
panel detach/dock cycles leave only `main` registered and the document clean.
The final rebuilt detached UCP/Default controls fit without an inner scrollbar;
Persian switches text direction without moving layout. Four maximized UCP tab
screenshots were captured. No temporary CSS overrides were injected.

All following drag runs use GreekSea/Kratoloros, 998 steps, 2560x1369, both GPU
surfaces, zoom 0.2790625, pan (470,376.25), and 60 alternating pointer jumps at
100 ms intervals. This castle has 50 troop markers. Document/AIC values are unchanged.

| Build / mode | Median input to next rAF | p95 | Maximum | Tasks >50 ms |
| --- | ---: | ---: | ---: | ---: |
| f06c691c, Default, matched baseline | 16.0 ms | 22.2 ms | 23.9 ms | 0 |
| f06c691c, UCP + fire, matched baseline | 16.5 ms | 22.1 ms | 27.2 ms | 0 |
| 39659543, Default | 16.4 ms | 22.4 ms | 26.7 ms | 0 |
| 39659543, UCP + fire | 17.5 ms | 23.0 ms | 28.0 ms | 0 |

The preliminary 474bd4c6 Default run was slower: 19.8/29.1 ms median/p95, then
18.9/32.0 ms on a warm repeat. Profiling found a nested generator merge added
roughly 0.96 ms/input; the final single-pass stable merge removes that traversal.
Troop command generation sampled 0.185 ms/input and support heights 0.063 ms/input.
Disabling troops did not establish the cause of all timing variation. These
small samples do not prove universally identical performance or screen latency.

### Startup

The new startup benchmark launches only an owned process/profile and verifies
clean shutdown. Fresh profiles copy preferences, not app asset/WebView caches;
OS filesystem caches are not flushed. Readiness is polled every 50 ms and means
DOM/data readiness, not a fully presented GPU frame.

| Build / profile | DOM ready | Project ready | Map data ready |
| --- | ---: | ---: | ---: |
| f06c691c, fresh | 0.66 s | 1.18 s | 1.52 s |
| f06c691c, warm restart | 0.95 s | 1.21 s | 0.95 s |
| 39659543, fresh | 0.67 s | 1.04 s | 1.42 s |
| 39659543, warm restart | 0.96 s | 1.23 s | 0.96 s |

These are individual paired observations, not a statistically proven speedup.
Project and map loading are independent. Repeat with:

```powershell
node scripts/benchmark-native-startup.mjs --exe '<preview>/AI Toolkit.exe' --profile '<new-profile-directory>' --seed '<owned-settings-profile>' --port 9245 --output startup.json
```

The earlier real 4b10b163-to-f06c691c update passed download/install/restart,
receipt, settings and config preservation. The repeat against 39659543 was
blocked **before download** by GitHub's anonymous API quota (HTTP 403; reset
22 September, 14:25:56 UTC). It is not claimed as a successful final-release
update. Direct release downloads remain available.

## UCP usability follow-up

The optimized `a16a6e50` candidate was checked in a separate WebView2 profile
with the same 998-step castle, maximized window and both GPU views. These are
input-to-next-animation-frame timings, not screen-presentation latency:

| Test | Median | p95 | Maximum | Tasks over 50 ms |
| --- | ---: | ---: | ---: | ---: |
| Default, rapid mouse jumps | 15.2 ms | 20.3 ms | 25.4 ms | 0 |
| UCP with fire overlay enabled, rapid mouse jumps | 14.6 ms | 20.4 ms | 22.3 ms | 0 |
| UCP with CPU profiler recording | 18.0 ms | 23.4 ms | 27.2 ms | 0 |

The smaller Pixi bundle retained both GPU surfaces and the fire-mask pass. Its
public exports and standard CSP adapter are bundled together by esbuild; no
renderer logic or artwork was replaced. Windows SChannel successfully checked
GitHub and downloaded/digest-verified the previous published portable release.

Persian/English switching was checked against live pane/tab order, literal
paths, numeric controls, input direction and caret selection. Content textareas
retain their identity and values; switching languages no longer rebuilds them.
The test restores the original language/workspace and checks unchanged project
content and dirty state. Detached-view language/title propagation and secondary
editor document isolation also passed. Closing a detached view exposed a stale
native-window entry; the lifecycle correction is documented with the parity
review, rather than treating the initial smoke test as sufficient updater proof.

The follow-up source checks pass 544 editor tests, 40 Rust tests, strict desktop
TypeScript and all nine complete language catalogues. The unchanged game-fixture
test remains opt-in and was run separately for the previous published baseline.
Full-window UCP screenshots are captured for Library, Character, Castle and AI
Content from the built preview. Native OS picker interaction and Linux/macOS
builds still have the limits listed in the parity review.

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
$env:AI_TOOLKIT_DEBUG_PORT = '9241'
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

Fourteen classic idle poses now have cached defensive formations; unverified
engineer/siege/DE poses remain explicit rally markers. Local
asset changes are rechecked on installation selection and map reload, not by a
background filesystem watcher. Native OS popup/file-picker interaction still
needs user testing: the computer-use bridge was unavailable, so live checks used
WebView2/CDP, screenshots and native integration tests.

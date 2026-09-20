# Runtime direction and cleanup plan

Status: planning only, following snapshot-5dd20f4. Keep this work on PR #4.

## Recommendation

Keep Electron for the current release while measuring the retained rendering
pipeline on the user's real project and camera settings. Evaluate Tauri in a
separate prototype after those results; do not rewrite the editor UI or game
geometry to change the desktop shell.

Tauri runs HTML/CSS/JavaScript in the operating system's WebView, with a Rust
core for privileged services. It avoids shipping its own WebView, but brings
platform differences: WebView2 on Windows, WKWebView on macOS and WebKitGTK on
Linux. This is a credible download-size opportunity, not evidence that the
same JavaScript rendering work will become faster automatically.
Source: https://v2.tauri.app/concept/process-model/

## Cleanup order

1. Keep a repeatable maximized benchmark: GreekSea/Kratoloros, both views open,
   native isometric zoom, five arbitrary back-and-forth sweeps per second.
   Record active-input frame intervals separately from idle time, worker
   completion times and input-to-presentation latency. Label baseline windows
   explicitly. Do not substitute average frame intervals for input latency.
2. Document the shared scene-command and worker-message contracts with checked
   types. Consolidate lifecycle/queue helpers only where the GPU and Canvas
   implementations have genuinely identical ownership semantics. Their scene
   payloads and asset lifetimes differ; avoid a generic rendering framework.
3. Keep placement drawing and visible-neighbour geometry as the sole source of
   rendering rules. Remove obsolete caches only after proving no fallback or
   analysis overlay uses them. Move fire compositing off the UI thread only
   with pixel/order tests preserving flammable-building occlusion.
4. Measure cold startup in phases: process start, usable controls, project
   restored, map ready. Defer optional asset decoding and library work based on
   those measurements. Preserve project restoration and user navigation.
5. Add package-size reporting to release verification; audit duplicate assets
   and unused production dependencies. Keep required licenses and UCP locales.
   Do not trade portable installation for an undocumented runtime prerequisite.

The snapshot ZIP is 151,551,641 bytes versus 161,504,231 bytes for da1ce18:
9,952,590 bytes (6.2%) smaller. It includes the Pixi browser bundles/license,
not the Pixi development tree, and the nine UCP Electron locales. This does not
establish a startup-time improvement; that requires the measurements above.

## Tauri feasibility sequence

| Existing boundary | Work required before migration |
| --- | --- |
| main.js / preload.js IPC | Inventory commands; define typed requests/results, error and cancellation semantics; introduce a narrow host adapter without changing renderer consumers. |
| Project files, AIC/AIV, archives | Port or replace Node-dependent filesystem/archive/codec services with fixture-compatible Rust implementations; preserve round trips and save safety. |
| Native map capture | Preserve helper lifecycle, cancellation and cached results; isolate its Windows/game dependency from the cross-platform editor. |
| Windows, menus, shortcuts, clipboard | Map existing behavior to Tauri APIs; test docked/detached views, focus, maximized restoration and unsaved changes. |
| Settings and project restoration | Migrate the existing user-data paths/schema and last-project state once, with rollback; never silently start an empty project. |
| Release channels and installation | Preserve official/fork eligibility and installed-build identity; design signed artifacts and trusted publisher keys for each experimental source. |

Tauri's updater requires signature verification and a publishing/signing flow;
our GitHub asset digest/receipt model cannot simply be copied unchanged.
Source: https://v2.tauri.app/plugin/updater/

Prototype only open/save, project restoration and both render workers first.
Test OffscreenCanvas, WebGL, worker loading, CSP and canvas composition on every
target WebView. Do not assume support parity from one Windows test. Avoid a
bundled Node sidecar unless required: it would preserve much of the runtime and
maintenance cost the migration aims to remove.

Compare like-for-like builds: download/installed size including missing runtime
prerequisites, cold/warm startup, memory, input latency p95/p99, rendering fidelity,
updater recovery and three-platform CI effort. Proceed only if the measured
benefit justifies the new platform matrix. No migration code or schedule is
committed by this document.

## Separate outstanding product work

Centralized localization and language selection, and the Sushi's World editor /
Definitive Edition format investigation, remain outstanding. Neither is claimed
as complete by this performance snapshot.

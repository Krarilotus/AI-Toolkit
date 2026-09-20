# UI polish and localization

Base: upstream `c9c345b` (19 September 2026), after PR #3 merged.

## Upstream intent to preserve

- `fe1687a`: remove the redundant rendered-terrain image/IPC path; the native tile
  atlas supplies terrain. Do not restore `load-map-terrain` or its mode selector.
- `ccfe9de`: derive/cache terrain-height summaries from native tiles.
- `d204c48`: share map/view coordinate conversion and use clickable start-position
  markers, including edge arrows for off-screen positions.
- `03ada4f`: recover cactus sprites from the game's saved RNG value; keep this
  deterministic mapping rather than introducing another fallback renderer.
- `c9c345b`: group toolbar actions, unify shortcuts, scroll selected placements into
  the build-order list, and explain empty AI Content fields.

## Current work

1. Palette background coverage, compact edge-to-edge thumbnails, category changes,
   and a clear menu/workspace divider with the same UI typeface.
2. Profile 2D scrubbing. Upstream coalesces slider inputs and reuses build-list rows,
   but `rebuildStaticCache` still clears both canvases and draws all placements.
   Population/production summaries also run during every step selection. Measure
   before changing these paths; retain exact future-step tint and overlay ordering.
3. JSON locale catalogs grouped by editor area; persisted language selection,
   native-menu and renderer localization, named interpolation, English fallback,
   and no DOM-wide mutation observer in the rendering path. UCP GUI languages:
   en, de, fr, ru, hu, tr, ch (Chinese; map to BCP47 zh), es, fa (RTL).
4. After implementation and tests: inspect Sushi's World AI Editor and document
   what Definitive Edition support requires, supported by actual format evidence.

Remote validation uses SSH to GamerGrill. Its old DESKTOP-OFSPMEO hostname was stale; the SSH alias now uses GamerGrill, verified against the existing pinned host key.
Do not substitute local UI automation/game launches. A scrubbing profiler is
prepared at ai-toolkit-setup/profile-scrub.cjs, outside the repository.

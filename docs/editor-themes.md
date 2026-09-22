# Editor themes

Theme selection belongs under **Edit → Theme**. `Default` is the existing dark
palette; `UCP` demonstrates Monsterfish's parchment, framed buttons and sword
checkboxes. The original PNG bytes are preserved. Attribution travels with each
pack in `theme.json` and `ATTRIBUTION.md`; no game sprites or fonts are included.

## Authoring one pack

Copy `assets/themes/ucp/` to a new folder and change its manifest ID/name. A pack
contains `theme.json`, `tokens.json`, generated `variables.css`, and `textures/`.
Add the ID/name to `assets/themes/registry.json` for a bundled pack. User packs
are discovered under the editor data folder's `themes/<pack-id>/` directory
(`%APPDATA%/AI Toolkit/themes` on Windows) and provide a scoped local `baseUrl`.
Copy one complete pack folder there and restart the editor to select it from
Edit → Theme. Use a new ID for a custom pack; the built-in `default` and `ucp`
IDs are reserved so there is always a known fallback. Replacing that one folder
updates all of its shared component textures and tokens together.
Pack IDs never select arbitrary filesystem paths or remote websites.
When the native menu discovers a newly added pack while the editor is open,
selecting it refreshes the renderer registry. Replacing a previously loaded pack's
files takes effect after restart, so active controls cannot mix revisions.

Use DTCG 2025.10 tokens and run `node scripts/build-themes.mjs`. Style Dictionary
is a development dependency; none of it ships in the renderer. The hierarchy is
primitive palette/font/radius → semantic surface/content/action/status → shared
component roles. Aliases remain native CSS variables, so a palette change updates
every consumer. UCP overrides only its differences and inherits Default.

Replace an image inside `textures/` to replace that role throughout the app:
control, controlHover, controlPressed, panel frame, panelSurface material, checkbox,
checkboxChecked, sidebar, backdrop. Frame slots use CSS nine-slice borders; material
slots tile; artwork can cover or contain. `theme.schema.json` describes the format.
Optional broken images fall back to Default and emit a diagnostic. Packs must not
contain layout CSS, JavaScript, remote URLs, arbitrary selectors or unknown tokens.

Layout remains in `src/css/combined.css`, with shared component surfaces in
`theme-components.css`. The duplicate blue layout stylesheet was removed. Category
colors and map data colors remain content semantics rather than theme artwork.
Real checkbox elements retain labels, keyboard operation, mixed/disabled states,
focus indicators and forced-colors fallback. System font fallbacks cover translated
scripts; no themed font is required to read the interface.

## Desktop integration

Load `js/theme.js` after `desktop-api.js`; initialization reads
`electronAPI.getInterfaceSettings().theme`. `ToolkitTheme.select(id)` applies a
validated pack and calls `electronAPI.setTheme(id)`. Native Edit menus use that same
setting and emit `onThemeChanged(id)`. `listThemes()` may supply additional
`{id,name,baseUrl}` entries. Browser-only development falls back to localStorage.

`ToolkitTheme.list()`, `.current`, `.subscribe(listener)`, and `.texture(slot)`
provide shared state without duplicating manifest parsing. Detached windows call
`.attachWindow(win)` once; they inherit current/future variables and the shared
detached stylesheet. No game extraction or scene rebuilding happens on selection.
Concurrent loading is coalesced and stale requests cannot replace a newer choice.

## Verification

`tests/theme.test.js` verifies pack assets/attribution, traversal rejection, CSS
restrictions, shared roles, asynchronous switching, persistence and detached views.
The implementation was also rendered with Chromium's actual CSSOM in an isolated
preview: UCP applied the expected button/checkbox PNGs and switching back restored
the original dark app surface. Test the packaged Tauri preview's native menu and
restart persistence as part of its desktop integration checks.

## UCP role mapping and visual review

The UCP pack follows the source GUI's component intent rather than treating every
button as the same textured rectangle:

| Role | UCP source artwork | Application |
| --- | --- | --- |
| Main commands | `button_ucp*`, 8px filled nine-slice | Open/save and toolbar actions |
| Workspace tabs | `ornament_border_button*`, 18px slice | Main workspace navigation |
| Reading frame | `ornament_border_shadow`, slice 16, auto image width | Reading panels, cards, dialogs and contextual panels |
| Reading surface | `parchment_bg_light` | One continuous panel, with quiet data rows |
| Text input | `searchfield` | Text fields and search |
| Numeric value | `value_box` | Number fields |
| Selection affordance | `dropdown_sel` | Native select arrow |
| Reorder | `move_up*`, `move_down*`, original 12 by 7 | Artwork centered in a 24 by 24 hit target |
| Stepper | `add*`, `remove*` | Brush size controls |
| Range | `slider*` | Build-step slider and transparency sliders |
| Scrolling | `scroll_bar_middle`, `scroll_bar_bottom` | Native scrollbar paint |
| Checkbox | `checkbox_empty`, `checkbox_full` | Real checkbox controls |
| Categories | `outline_border` | Original category colours retained |

The command's actual CSS border width matches its nine-slice frame width; text
is never painted underneath the frame. State variants fall back to the base image
when a custom pack omits them. Optional texture roles have presence flags, so a
minimal pack cannot hide arrow labels behind absent icons. Main-menu actions,
viewport controls and selectable rows remain distinct from large command buttons.
A renamed copy of UCP uses the same role flags; there are no pack-ID selectors.

Live Tauri/WebView2 checks covered Castle, Character, Library, AI Content, the
snapshot dialog, all 14 category hover colours, command hover/focus and native
checkboxes. Category hover contrast was at least 4.62:1. Switching back to Default
restored its original dark surface and untextured controls. No project content was
edited by this style review. Developer screenshots and the measured style report
are local review artifacts, not release assets.

Palette thumbnails do not contribute their intrinsic sprite dimensions to row
layout. The keep's tall 7×15 image previously expanded its row to 91px; the shared
thumbnail slot now covers the left side of a compact row (45px in the live check),
with name and dimensions adjacent. This applies equally to both themes.

### Source correspondence for the UCP hierarchy

- UCP3-GUI `components/variables.css` and `titlebar/titlebar.css` define
  `#212529` chrome. The Toolkit shell, toolbars and spaces between reading
  panels use that dark role, with its existing Monsterfish backdrop behind the
  workspaces. Maps and the entire application do not become parchment.
- `components/base.css` defines `.parchment-box` with the shadow ornament
  border. `ucp-tabs/config-editor/config-editor.tsx` explicitly selects
  `.parchment-box-bg-light` for its main reading panel; this is the original
  light parchment used by the Toolkit pack. Nested rows use the source's quiet
  translucent grey/light shading instead of repeating the frame or texture.
- `components/scrollbar.css` puts the rope shaft on only the leading track
  segment and inside the thumb, with the bottom-cap asset and radial fade.
  `scroll_bar_top.png` exists in the source assets but is not used by that
  stylesheet. The port follows the working source composition, clears native
  track/hover/button paint, and uses the original ornament on horizontal bars.
- `extension-element/extension-element.css` centers unscaled reorder
  artwork. The 12 by 7 arrow is not stretched to the control's square hit area.
- The pack uses a system serif stack for UCP's historical type role. The source
  GUI's custom fonts are not bundled.

Paper foreground/border/accent tokens are scoped to reading components, not the
root palette. Each theme therefore remains internally consistent, and a copied
UCP pack is selected by its available component roles rather than its name. These
changes add one original 1,231-byte ornament image; no image was resized or
re-encoded. Text-only bidirectional rendering is shared with detached windows and
does not mirror the workspace or world coordinates.

Numeric fields have a separate `component.value` color role from text/search
fields: the original 15 by 15 `value_box.png` has an opaque black center, and
UCP GUI `CreateNumberInput.tsx` uses `text-light`. Numeric and decimal inputs
therefore use a light foreground; parchment `searchfield.png` text inputs use
the dark foreground. The texture and foreground always change as one role.

# Isolated application and game acceptance protocol

This is the coordinator's execution contract for later bounded test tasks.
Read [the goal](00-goal-verbatim.md), [working contract](01-working-contract.md),
[reviewed sequence](03-synthesis-and-sequencing.md), and the current
[acceptance matrix](acceptance.csv). A planned test is not passing evidence.

## Entry conditions and records

- Test only this DE branch and an owned application build/profile. Demonstrate
  the actual native/Electron user-data paths before invoking settings changes;
  a guessed command-line flag is insufficient isolation.
- Use an owned physical DE installation copy and a demonstrated isolated game
  profile. Reports06/13/15 and independent Review22 establish the finite
  preflight below; actual path, Steam and preservation evidence is still required.
  A copied EXE directory alone does not meet this condition.
- Check current user input activity and relevant app/game processes immediately
  before real launches. Defer an interfering launch while the user is active.
  The user already authorized isolated tests and idle-time launches; do not
  request the same permission again.
- Record branch/HEAD, game build/hash pair, asset manifest, actual paths, loader
  release/archive/DLL identities when used, exact preferences, and package file
  hashes. Keep pixels, binaries, saves, captures and detailed logs outside Git.
- Record each case as passed/failed/unverified with observation/log/capture
  paths, expected versus actual behavior and unresolved discrepancies. A tool
  exit status, menu badge or source signature match alone is insufficient.
- Preserve original installed game/editor/profile hashes and user-owned files.
  Uninstall only unchanged files in the owned manifest; changed files and
  uncertain recovery remain visible instead of being deleted.

The supported Windows observation route was initialized read-only using the
bundled Computer Use skill (`node_repl` plus `@oai/sky`). `list_windows()`
succeeded on 22 October 2026 and returned an existing user Toolkit window at
`S:\Projects\UCP\Tools\AI Toolkit\AI Toolkit.exe`. No activation/input/state
change was sent to it. Later test tasks must select the returned window for
their owned executable path, with exactly one match, rather than using the
shared display title `AI Toolkit`. Follow the skill's fresh observation/action
workflow; do not mix direct PowerShell UI Automation with Computer Use.

On 23 October, read-only background captures of two exactly selected Steam
windows returned non-target visual content and only disabled-pane accessibility.
They establish no Cloud/queue state. No input was sent and those captures are
invalid evidence. At the later idle-time UI gate, foreground the selected window
and verify a fresh screenshot matches before choosing any control; stop if the
mismatch persists. Do not reuse old coordinates or infer a setting from a title.

Read-only source inventory at `7f22728`: native `storage::user_data` already
honors `AI_TOOLKIT_USER_DATA`, and editor creation explicitly places WebView2
data under that directory's `WebView` child. The legacy-update helper also reads
the override. This supplies a concrete owned-profile route to verify at launch;
it is not yet an observation of a running test instance. Detached viewport
creation does not explicitly set the data directory, so F2 and GUI acceptance
must establish inheritance/ownership rather than assuming it. Electron currently
uses `app.getPath('userData')` and has no corresponding early environment
override in `main.js`; add/verify an owned test route before launching it.
Keep the exact process environment and effective storage/WebView paths in the
test manifest. These preparation checks do not authorize changing the live app.

## Finite first-game preflight after Review22

The coordinator accepts Review22's narrow offline result and proportionate host
route. The existing harness remains launchAllowed:false. Do not turn that result
into a generic sandbox project or a claim that the current package is runnable.
The first run is vanilla single-player, direct copied EXE, with unchanged genuine
authentication. SE/Fixes, multiplayer, browser/help and Workshop UI are separate.

Before launch, one bounded preparation must produce a fresh sealed physical
copy, fresh managed and engine identities, no link/reparse/namespace collisions,
all dependency hashes and exact EXE/CWD/app-ID bytes. Make verified scoped backups
of original profile, PlayerPrefs presence/key and Workshop/bookkeeping; inventories
alone are insufficient. Record effective roots and native bridge arguments before
forwarding, with required assertion failure stopping the owned run. Observe early
Unity/native/child activity and compare preservation after startup/exit before
expanding into the representative package case. Review22 supplies exact paths,
source evidence, exclusions and restoration ordering.

Establish Steam's app-specific Cloud-off state before association, with no active
game, sync/conflict or pending app/Workshop install/update. The coordinator treats
the user's standing isolated-test authority as covering a temporary reversible
app-only Cloud UI change, with its exact prior state recorded and restoration
verified after preservation passes. Initially off stays off. This covers no global
toggle, VDF edit, stats reset, subscription change or client restart. Do not call
SetCloudEnabledForApp as a substitute for the supported UI route. Unresolved queue
state, a demanded original-library update or disruption to unrelated client work
fails the host gate; use an independently writable test environment instead.

Two reproduced guard defects remain scoped: memory-only DeflateStream writes are
rejected, and inspecting a dirty pre-opened FileStream can flush before denial.
Review22 identified no such protected dirty stream in the selected game workflow;
its actual compression path is excluded from the first single-player exercise.
Do not advertise general stream/multiplayer compatibility. No arbitrary inherited
application-data handles are allowed. These findings and runtime observations
remain separate from the Toolkit's production loader and document support.

## Application cases: DE-01, DE-02, DE-09

| Case | Required observation |
| --- | --- |
| Fresh DE-only profile | Folder selection recognizes DE automatically without a selected Classic/UCP root; restart uses the intended default and DE-specific roots/caches. Picker cancellation leaves a usable standalone editor. |
| Classic-only and plain Classic | Existing UCP suffix selections remain valid; plain Classic is detected without creating UCP directories. UCP-only library operations have explicit unavailable reasons when absent. |
| Both editions and two roots of one edition | Separate root identities, domain preferences, custom skins and asset caches; identical item IDs/basenames never cross-contaminate. |
| Mixed windows | A Classic window and DE window keep their own service/config/cache/write context. Add Window inherits intentionally; a detached viewport follows its owner. Focus/close/restart-default changes cannot redirect another window. |
| Unsaved switch | Exercise Character/castle/dialogue alone and together: Save, Discard, Cancel, failed save and cancelled Save As. Saves retain original path/format. Cancel/failure retains current documents, undo, ownership and context. |
| Pending operations | Freeze edits and drain accepted writes during switch. Deliver old reads/images/config/balance/library callbacks after A→B→A; they cannot publish into the new generation or clear its busy/error state. |
| Migration/recovery | Legacy bytes/settings/keys/skins/caches survive. Missing versus corrupt/future/unreadable stores remain distinct. Concurrent writers and interrupted replacements recover without adopting a failed target. |
| Missing/updated assets | Missing pages, changed art/game inputs and unavailable extractor capabilities are explicit. Warm extraction reuses valid files without rewriting them. DE never uses a hidden Classic fallback. |

These cases need actual isolated desktop interactions as well as meaningful
state/IPC fixtures. No current unit-test count closes picker/mixed-window rows.

## Documents: DE-04 and DE-05

Use synthetic boundary fixtures in Git and real local fixtures outside Git.
Pin the origin/hash of each real fixture; never redistribute game resources.

| Case | Required evidence |
| --- | --- |
| Unchanged and minimal JSON edits | Identical source bytes including UTF-8 BOM/trivia; one scalar or array-index edit changes exactly its selected token. Preserve duplicate occurrences, unknown numeric/string lexemes, signed values and array tails. |
| LORD interpretation | All 118 game fields and 14 array contracts are distinct from the inspected 117-field editor/converter. Preserve different opponent/speech values, all three 28-slot arrays and all 24 wall slots. Missing/unknown/ambiguous input is diagnosed without UCP normalization or inserted defaults. |
| Error boundaries | Distinguish malformed JSON, unsupported/invalid encoding, limits, wrong LORD shape and target incompatibility. Failed/stale/overlapping edits and failed writes leave originals intact. |
| Castle semantics | An asymmetric fixture covers keep displacement, both gate orientations, overlap/clear operations, repeated offsets, empty/pause-only frames and preserved marker numbering. Verify four views and actual construction order; resource-driven deferral must be distinguished from a codec/order defect. |
| Timing/capacity | Exercise pause boundaries and marker numbers 9/10/29/30 with separate preservation and explicit vanilla/Fixes target checks. Vanilla cannot be certified for expanded slots merely because the JSON parses. |
| Conversion refusal | A lossy Classic conversion reports specific fields/frames/markers before writing and preserves both DE input and existing destination. User-directed substitutions create a distinct output document. |
| Format identity | UCP Character, LORDJSON, AIVJSON, classic AIV and internal DE binary/wire representations remain explicit. No extension/length heuristic or public converter silently normalizes another format. |

A complete self-authored schema fixture is not a known-good playable AI. Obtain
a version-identified real DE lord/castle source, then record every intentional
edit and prove the resulting package in the game. Public exported snapshots
are candidates until observed loading; declaration initializers are not a
substitute for runtime defaults.

## Authentic rendering: DE-03

Compare representative common and DE-only units, a mounted/layered unit,
Stockade/outpost world structures, terrain/shore/cliff/farm/wall details, and
four camera views. Preserve the sprite/mask/atlas/source identities, pivots,
PPU, sparse indices, player-color and light parameters used by each capture.
Verify advertised normal/flat/lowered modes against the same scene. Extracted
frame-zero samples and menu icons have their explicit thumbnail role until
idle/facing/world-composition contracts are proven. Unsupported combinations
remain visible gaps; generated illustrations cannot count as authentic art.

## Representative custom lord: DE-06, DE-07 and DE-08

Start with a short unique named vanilla lord and matching-name CustomMedia;
the actual source/config/castle variant identities stay in the install plan.
Neither config nor castle is required to be named `Default`. Do not require
all media files merely for discovery. Use owned identifiable test portrait,
speech, text and WebM rather than redistributing shipped examples.

1. Preflight both destination roots together. Check exact names, collisions,
   containment, versions, JSON target diagnostics, avatar bounds, media formats
   and existing-file hashes. Preview the concrete install/rollback manifest.
2. Install only into the demonstrated isolated profile. Observe named lord
   discovery, selected config/castle variants and portrait. Record actual chosen
   source paths/checksums; a shared display name or lord enum is insufficient.
3. Observe construction and recruited/guarding DE units/features in play, with
   expected positions/order and any game restriction clearly recorded.
4. Observe lobby add-player speech plus representative in-game speech, dialogue
   text and emotion video. Capture recognizable owned content and resolved-file
   evidence; file presence alone does not prove playback. Check missing-media
   fallback separately.
5. Save/reload the isolated session and verify relevant AI/castle/media state.
   Then install separately pinned SE/Fixes only where needed. Verify hook logs,
   supported class capacity/preferences, actual slots 11–30 and save/reload.
   The conservative 99-byte bound applies to the reviewed SE native reference
   path; it is not a generic LORDJSON or universal vanilla filename rule.
6. Uninstall/rollback through the manifest, compare pre/post ownership hashes
   and prove original user data remained intact. Do not claim removing Fixes
   automatically converts its saves into vanilla saves.

Finish with relevant post-change Classic checks and representative Classic
game-backed observations in their own isolated environment. Retain failures
and remaining coverage gaps in acceptance.csv; parsing, static signatures or
successful export never stand in for this runtime gate.

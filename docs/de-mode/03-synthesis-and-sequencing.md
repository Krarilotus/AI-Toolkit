# Reviewed synthesis and implementation queue

Read the [verbatim goal](00-goal-verbatim.md) and
[working contract](01-working-contract.md). The coordinator owns this sequence;
every delegated agent uses Sol 6.1, explicit paths and bounded file ownership.

The coordinator adopts [architecture23](research/23-single-source-architecture.md):
one Rust backend core linked by Tauri and used through a versioned private
Electron helper, shared JavaScript document sessions, and generated schema/DTO
contracts. Classic and DE remain explicit providers/formats. Existing Classic
duplication migrates one operation at a time against preserved behavior; it is
not a prerequisite for the first LORDJSON workflow.

D1 is committed at b4b319f after Review18 closed its findings. F1 round3
corrections remain uncommitted; C1 now extracts their Rust implementation and
removes independent Node policy. Independent review of the extracted core must
close raw duplicate/recovery R4. Review24 found one A1 geometry cumulative-work/
cancellation gap; a focused correction is running. Review22 accepts the narrow
offline isolation result and finite host preflight;
its two guard defects are scoped and no real-launch evidence exists.
Historical 900 JS/100 native regressions predate round3/C1. The current plan02
and task ledger identify live owners.

## Evidence accepted for the first implementation boundary

All four original research tracks are complete. Their conclusions are reviewed
as specific contracts, not blanket DE compatibility claims:

1. **Identity:** local DE native/managed hashes match the pinned source baseline;
   the Steam classic executable matches OpenSHC's strict HD 1.41 target.
   A managed PE32 header is not evidence of an x86-only DE process. Detection
   must use layout plus native PE evidence, independently of optional UCP.
2. **Data:** LORDJSON is distinct from UCP Character JSON. The game exposes
   118 fields; the inspected editor/converter exposes 117 and can lose the
   distinct speech field. Arrays, signed values, unknown tokens and extension
   data must survive. Existing UCP normalization demonstrably destroys arrays.
   Converters have observed losses and unreliable zero exit codes.
3. **Loading/media:** vanilla discovers named CustomLords and separately named
   CustomMedia. The coordinator independently verified the shipped media
   instructions and hash. Basic lord/castle/avatar/WAV/WebM/text packaging does
   not require SE. Playback, discovery and construction still need game tests.
4. **Runtime limits:** vanilla marker indexing has ten slots per group. Expanded
   11–30 support is a distinct SE/Fixes capability, including per-lord settings,
   compatible signatures and later observed hook/placement/save behavior.
5. **Art:** eight DE troop samples and representative building/terrain/menu art
   were extracted locally from Unity data, with masks/pivots/source hashes.
   Classic GM1 is not a DE decoder. Sample frame zero is not proven idle;
   whole-building views and flattened/lowered rules remain explicit gaps.
6. **Isolation:** install directory, game profile and editor settings are
   independent. Copying the game does not isolate LocalLow. No real game launch
   occurs until a concrete profile-isolation route is demonstrated and user
   activity is checked. A targeted investigation is running.

The coordinator reproduced hashes, the current DE-folder rejection and the
array-normalization defect. [Review 05](research/05-edition-boundary-review.md)
independently inspected the architecture and grants conditional GO for additive,
unexposed detection/profile work. It explicitly does not approve a DE toggle or
domain support. Further domain/asset evidence review remains separate.

## Required design decisions from independent review

- Backend-owned immutable window contexts are authoritative. A saved default
  affects future startup only; other open windows retain their own roots.
- Explicit activation updates `defaultProfileId` and `selectedByEdition`
  transactionally. Startup/inheritance/focus/close never update that preference.
- New metadata lives in `game-profiles.v1.json`. Legacy settings, root keys,
  browser data, skins and caches remain unwritten. Only a missing new store
  permits initial migration; corrupt/future/I/O failures are distinct.
- Canonical root plus edition identifies a profile; binary/resource revision
  is separate. Classic without UCP is valid, with UCP operations unavailable.
- Probe/pick precedes activation without mutation. Before switching, freeze
  edits, drain accepted writes, run the unsaved gate in the original context,
  revalidate staged evidence and commit/adopt with explicit recovery.
- Epoch plus generation and source revision guard every asynchronous publication.
  An A→B→A sequence cannot accept the first A's late response.
- Document format, raw source, path and owner remain independent. No switch
  implicitly converts a file or feeds LORDJSON into the UCP normalizer.

## Bounded implementation queue

**C1 — Canonical F1 core and transport (running).** One owner moves corrected
Rust detection/metadata/recovery policy into toolkit-core, links Tauri to it,
removes independent Node policy, and implements the bounded private Electron
helper/client, generated Rust DTOs and local packaging build. Domain/crash
fixtures and strict malformed metadata refusal must survive. This task does
not add window contexts, raw document writes or live UI. Independent review
checks extracted policy and real transport adaptation; matching tests alone
do not confer approval.

**DS1 session and schema generation (running).** config/de-lord-schema.json is the
maintained inventory. One owner generates its runtime guard and builds the shared
lossless session with edit/undo/revision/save-receipt ownership. Retain D1 private
snapshots, mutation rejection and independent reviewed test oracle. Check mode
rejects stale output. No silent schema change, host or UI integration.

**F2 — Window context and service plumbing (after C1 review).** One
owner handles both desktop boundaries, typed DTOs/generated bindings, windows,
legacy adapters, leases and cache namespaces. Bind before initialization;
capture context before queued work. Keep Classic algorithms intact and return
unavailable DE capabilities rather than falling back to Classic.

Frontend cutover must precede edition-specific script startup. At 757ba68,
index.html statically starts character-editor, castle-editor, ucp-library and
iso-view; they eagerly load Classic configuration, restore projects and read or
write legacy browser preferences. A late mode label or API branch is insufficient.
Bind the owned context first, then start the matching edition's controller and
provider. Preserve Classic script order and behavior. Share chrome/i18n/theme
where appropriate; do not clone the whole shell or monkeypatch localStorage.
Legacy-key compatibility/migration belongs explicitly to Classic. Fresh owned
DE windows can establish the first file workflow, but do not satisfy the later
in-place toggle's freeze/drain/unsaved/adopt recovery gate.

Startup policy after C1: an explicit saved default wins after fresh revalidation.
An inactive migrated Classic candidate may bind only to that startup window when
the unchanged legacy file's hash matches the recorded migration provenance,
fresh detection resolves its saved path to a stored Classic profile, and that
profile's identity still matches. This writes no preference. A changed/missing
legacy source, missing candidate, ambiguous probe or unavailable root leaves a
usable standalone window with a diagnostic and folder selection. Do not guess
from an arbitrary sole profile. Inherited editors copy their caller's snapshot
before initialization and receive a fresh window epoch; they never run startup
preference selection again. F2 must test these paths and expose supported offline
maintenance before live callers depend on the repository.

**F3 — Startup, storage and staged mode switch (serialized after F2).** Namespace
edition-sensitive domain state, preserve Classic migrations, implement switch
freeze/drain/adopt/recovery and stale-result guards. Expose the toggle only
after failure/cancel/mixed-window fixtures and isolated application checks.

**D1 — Raw DE document foundation (committed after Review18).** The shared
token-preserving JSON/LORDJSON modules preserve unknown large-number lexemes,
duplicates, arrays/tails and unchanged bytes, with separate target diagnostics.
The next document owner adds a shared session over that implementation; desktop
and UI routing are integrated through the canonical context/byte boundary.

Later document routing keeps a document session's format, immutable source bytes,
revision, explicit path and owning context together. Native/Electron transport
must supply opaque bytes for DE documents; a parsed JSON object is insufficient.
Recognition and target diagnostics remain distinct. A valid unknown JSON file
can be preserved without being advertised as a playable LORDJSON/AIVJSON. A
successful edition switch closes old document owners together only after the
accepted Save/Discard/Cancel gate and successful adoption; cancellation retains
their bytes, undo and destinations. Keeping both editions' open projects at once
uses separate intentionally owned editor windows, never implicit conversion.

**A1 — Authentic local DE provider.** First review a shipping extraction strategy
and remaining idle/facing/building/mode contracts. Keep all pixels outside Git.
Use source fingerprints and shared renderer DTOs; no generated art masquerading
as DE assets, guessed frames or menu icons claimed as world compositions.

**D2 — Ordered AIVJSON overlay (after D1 correction review).** Add a DE-specific
overlay/validator over the lossless document API, leaving `castle-format.js` and
the existing editor untouched until reviewed. Its source is the ordered frame
program, not a final raster: preserve every offset occurrence, empty/missing/null
distinction, pause, extension, unknown ID and sparse marker number. Keep typed
shape, representability by the managed Int16 writer, known target capabilities
and unverified gameplay semantics separate. Cover the 49-pause boundary,
zero-type counted-record ambiguity, narrowing/count overflow, one-time high
marker adjustment and vanilla versus configured Fixes indexing with asymmetric
fixtures. A later D3 must supply reviewed structural JSON edits and explicit
castle-editor operations; D1 scalar edits alone cannot create/delete frames or
markers. Existing `castle-format.stringify` calls `JSON.stringify` and cannot
serve as the DE lossless save path. No hidden converter or raster reconstruction
may replace the original operation program.

**P1 — Reversible vanilla package and optional loader adapters.** Manifest-first
planning, exact file/media names and validation, collisions, owned-file hashes,
staging and rollback. No installation until profile isolation is established.
Then verify vanilla loading/media before SE/Fixes expanded behavior.

**Acceptance.** Keep the CSV matrix open until isolated game observations and
post-change Classic regressions pass. Baseline 653 JS + 77 native + 10 classic
installation checks are recorded, with one explicit native reference-test skip.
No CI, PR, release or installed editor update is authorized.

UCP is not a Git root. All Toolkit commands explicitly use
`S:\Projects\UCP\AI-Toolkit-DE`. T3 shared tasks do not provide worktree
isolation here; disjoint new modules can run concurrently, conflicting edits
must be serialized. Parent alone maintains central docs and commits.

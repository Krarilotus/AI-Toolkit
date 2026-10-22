# Reviewed synthesis and implementation queue

Read the [verbatim goal](00-goal-verbatim.md) and
[working contract](01-working-contract.md). The coordinator owns this sequence;
every delegated agent uses Sol 6.1, explicit paths and bounded file ownership.

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

**F1 — Detection and metadata repository (start now).** One implementer owns new
Node/Rust profile modules, shared synthetic detection fixtures, meaningful
profile recovery/CAS tests and the Rust module declaration. Implement F1/F2
gates from Review 05; no live editor wiring or toggle. Resolve cross-process
locking, atomic recovery and legacy-file preservation explicitly. Return code
for independent review; coordinator commits accepted milestones with `[skip ci]`.

**F2 — Window context and service plumbing (serialized after F1 review).** One
owner handles both desktop boundaries, typed DTOs/generated bindings, windows,
legacy adapters, leases and cache namespaces. Bind before initialization;
capture context before queued work. Keep Classic algorithms intact and return
unavailable DE capabilities rather than falling back to Classic.

**F3 — Startup, storage and staged mode switch (serialized after F2).** Namespace
edition-sensitive domain state, preserve Classic migrations, implement switch
freeze/drain/adopt/recovery and stale-result guards. Expose the toggle only
after failure/cancel/mixed-window fixtures and isolated application checks.

**D1 — Raw DE document foundation (after independent domain review).** A separate
owner may add new token-preserving JSON/LORDJSON schema modules and synthetic
tests without touching F1/F2 files. Preserve unknown large-number lexemes,
duplicates, arrays/tails and unchanged bytes; separate game-export validation
from preservation. Integrate UI and existing castle paths only in a later
serialized slice with explicit ownership.

**A1 — Authentic local DE provider.** First review a shipping extraction strategy
and remaining idle/facing/building/mode contracts. Keep all pixels outside Git.
Use source fingerprints and shared renderer DTOs; no generated art masquerading
as DE assets, guessed frames or menu icons claimed as world compositions.

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

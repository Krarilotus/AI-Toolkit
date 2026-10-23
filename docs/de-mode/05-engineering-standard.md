# Engineering standard and ownership

This records the user's 22 October steering about abstraction, critical thinking,
code quality and fidelity. Read the verbatim goal and working contract first.

## What progress must achieve

The target is a usable separated Classic/DE workflow, authentic rendering and an
exported AI observed in the game. Parser tests, research reports and isolated
modules are intermediate evidence. Prefer the next complete user workflow over
indefinite growth of unused foundations. Keep the full acceptance matrix open
until actual evidence closes it.

The next integrated demonstration should select a DE installation, bind the
correct window/profile, open a real LORDJSON without normalization, edit a value,
save/reopen its exact bytes and retain Classic behavior. Expand that path into
castle editing, authentic rendering and reversible package installation. Shared
foundations may proceed in parallel where they serve these concrete consumers.

## Responsibilities

| Layer | Owns | Must not absorb |
| --- | --- | --- |
| Coordinator | Original intent; architecture; dependency order; scope decisions; review resolution; acceptance; commits | Every implementation detail or reviewers' preferred style |
| Desktop/profile backend | Installation identity; per-window authority; activation; operation lifetimes; persistence and cache namespaces | LORD/AIV rules or renderer assumptions |
| Document domain | Original bytes; document revisions; format interpretation; edits; target compatibility | Global game-root selection or filesystem installation authority |
| Asset provider | Local-file decoding; source identity; bounded resources; sprite metadata/pixels | Document semantics or guessed scene composition |
| Renderer and UI | Supported scene composition; document commands; unsaved transitions; capability presentation | Hidden format conversion or backend ownership decisions |
| Package installer | Concrete file plan; collision checks; backups; version requirements; reversible owned writes | UI defaults, game authentication changes or codec normalization |
| Acceptance tooling | Isolated observations and reproducible evidence outside the product | New shipping dependencies merely for research convenience |

## Single source of truth

Single source of truth is a design requirement. Separate Classic and DE adapters
behind explicit contracts; share an algorithm only where its semantics match.
Desktop transports should adapt a canonical implementation rather than each
reimplementing detection, validation, persistence or DE decoding. Shared fixtures
can detect drift but do not remove duplicated production ownership. Prefer
generated bindings/manifests over manually synchronized contract inventories.
Independent test oracles remain valuable and are not a second runtime policy.

Before F2 grows live services, explicitly decide the authoritative core and thin
adapter boundary. The current unexposed Node/Rust profile duplication and repeated
cross-host parser discrepancies are concrete evidence to reconsider that design.
Keep asset decoding in the one Rust core and lossless document logic in its one
shared document implementation. Assess other boundaries on their actual consumers,
portability, packaging and maintenance costs; do not replace the problem with a
generic framework. Record an incremental migration preserving Classic behavior.

The coordinator adopted report23: one host-independent Rust core linked by
Tauri and used through a versioned private Electron helper. Shared JavaScript
owns lossless document sessions. Rust DTOs and the declarative LORD schema
generate their consumers. Extract corrected code before growing contexts;
migrate existing Classic algorithms operation by operation and remove each
replaced runtime path. Preserve both hosts, meaningful independent tests and
honest packaging/performance evidence. This is a concrete ownership decision;
existing duplication still needs the recorded migration.

## Task briefs and critical agency

Each agent gets the goal/contract links, intended user outcome, dependency inputs,
owned files, interface obligations, relevant source pins, concrete evidence and
explicit exclusions. Use Sol 6.1 only. No uncontrolled recursive delegation.

A brief defines responsibility and success, not every implementation decision.
Agents must challenge a mistaken premise, wrong abstraction, misplaced owner,
unnecessary generalization, duplicate mechanism or unsupported claim. Return the
evidence, affected contract, proposed structural move and smallest next step.
Do useful work within ownership; report necessary cross-owner changes before
editing them. The coordinator reconciles the interfaces and serializes conflicts.

## Preserve smoothness

Read [existing performance rationale](../iso-scrub-performance.md) and relevant
[native parity/cache contracts](../native-parity.md) before touching hot paths.
Understand comments and Git history before removing or simplifying an optimization.
These are historical baselines and design reasons, not current DE measurements.

Preserve worker-owned retained WebGL/2D scenes, latest-only pending frames, texture
and geometry reuse, spatial terrain-command indexing and stable painter merges,
dirty-region invalidation, visible-row updates and deferred population/cost work.
Intentional Canvas and fire-mask paths retain their roles. Previously rejected
whole-scene bitmap transfers and union-clip changes cannot be revived merely to
make an edition adapter easier; they need measured evidence.

Keep profile probes, large hashes, extraction/decoding and IPC out of per-frame
paths. Batch/cache at the proper owner, avoid reserializing complete histories
just to count their cost, and retain warm-cache identity and latest-result reuse.
Changes affecting smoothness need an owned before/after workload with equal
scene/camera/cache conditions: input/frame intervals, CPU/allocation/memory and
pixel/behavior checks as relevant. Report percentile/peak costs and remaining
limits; no invented universal FPS threshold or microbenchmark-as-UI claim.

## Quality and review

Review correctness, readability, architecture, preservation/security and measured
resource use. Ask whether the behavior advances the original goal, whether the
owning layer is correct and whether the abstraction earns its complexity. Prefer
a structural correction over another unrelated conditional or silent fallback.
Validation belongs at real boundaries; do not multiply defensive layers without
an observed invariant or risk. Keep explicit unsupported states honest.

Preserve behavior during cleanup. Understand the original reason before deleting
code. Keep substantial refactors separate from feature changes. Remove dead
wrappers, duplicated policies and accidental coupling when evidence supports the
change; do not rename or compress code merely to appear cleaner. Comments should
explain non-obvious intent, source contracts or limits.

Independent review must include relevant negative and recovery behavior, not
just green test counts. Defects affecting data preservation, wrong-owner writes
or truthful support claims block the affected milestone. Optional style changes
must not become endless correctness gates. A real design flaw gets a proposed
move with an owner, not only a complaint about complexity.

Trace cross-layer guarantees through their actual shipping entry points. A
bounded primitive does not bound a facade that copies before calling it, and a
snapshot taken after a wrapper's await is not a call-time snapshot. Reviews and
regressions must cover those wrappers as well as the owning primitive. Review36
demonstrates this gap; fixing it requires one admission owner, not a second quota.

The coordinator checks reviewed hashes, the actual staged diff and commit scope.
Byte-sensitive fixtures retain their exact bytes in Git. Run focused checks for
the change and broader checks when integration or changed code justifies them.
Keep unit evidence distinct from desktop and game acceptance. No CI, PR or release
operations; use [skip ci] and the existing isolated branch rules.

At each meaningful milestone reassess the user workflow, ownership, complexity,
evidence and next experiment. Report at that level; test totals supplement the
assessment. Do not replace product progress with repeated status updates.

## Consulted workflow sources

- pstack's ownership-oriented explanation guidance:
  https://github.com/backnotprop/pstack/blob/main/skills/how/SKILL.md
- Addy Osmani's code review and simplification guidance:
  https://github.com/addyosmani/agent-skills/tree/main/skills/code-review-and-quality
  https://github.com/addyosmani/agent-skills/tree/main/skills/code-simplification

These are consulted engineering guidance. The user's Sol-only model choice,
existing authorization, no-CI policy and original goal take precedence. No global
skill installation or cross-project skill changes are part of this update.

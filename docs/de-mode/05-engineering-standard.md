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

# DE mode working contract

Read [the verbatim goal](00-goal-verbatim.md) before choosing architecture or
changing scope. This file translates that goal into working rules and completion
criteria. It does not replace the user's instructions.

## Workspace and persistence

- Dedicated checkout: `S:\Projects\UCP\AI-Toolkit-DE`.
- Branch: `de/separate-game-mode`, based on `5ce3676af8ddb78a11f0148cc2311915eec0a0d8`.
- User's fork: `Krarilotus/AI-Toolkit`. Push only this DE branch.
- Existing classic checkout: `S:\Projects\Harness\ai-toolkit-setup\source`.
  Leave its branch, application installation and settings intact.
- No CI runs, workflow dispatches, PR creation, merges or release publication
  for this research branch without a later explicit instruction. Automatic
  Native CI triggers are removed in this branch only. Use `[skip ci]` on commits
  as a second guard. Run relevant local checks instead.
- Commit at completed research and implementation milestones. Record results and
  next actions before yielding or delegating. Never mark the persistent goal
  complete merely because a plan or a research report is ready.
- Keep heavy decompilations, extracted proprietary assets, game binaries and
  test installations outside Git. Commit reproducible extraction tools, hashes,
  schemas, evidence summaries and synthetic fixtures when suitable.

## Confirmed authority and pending decisions

Community loaders such as SHCDE-Fixes/Script Extender are allowed when needed.
Isolated in-game verification is allowed. The installed game may be launched on
the PC when the user is not using it. Check for user activity before launching;
prefer owned test copies/profiles. Preserve existing saves, mod setups and the
classic editor. These permissions do not authorize distributing game assets or
publishing someone else's work.

The opening ambiguity questions have been answered. Investigate `lordson` as a
likely reference to the documented LORDJSON contract, and record the confirmed
extension rather than treating the spelling as a new format. Ask further
questions only when the evidence and original goal leave a material decision
unresolved; continue independent work while waiting.

## Acceptance criteria

1. Classic and DE have separate installation roots, settings, asset caches,
   formats and capability decisions. Switching modes cannot silently convert or
   lose the open project. First-run folder selection detects the edition and
   chooses the matching mode. Users can explicitly switch modes later.
2. DE uses verified local game artwork for supported buildings, units, terrain
   and previews. Unsupported assets remain explicit gaps, not generated artwork
   presented as authentic DE content.
3. DE castle and lord/AI import/export follow the actual game/editor/loader
   contracts. Preserve unknown fields, valid unknown IDs, timing, ordering and
   extended guarding spots. Refuse lossy classic conversions with useful guidance.
4. Portraits, dialogue, voices and related custom-lord media can reach the game
   through a verified vanilla or community-loader path. Installation is reversible
   and checks file layouts, game/loader versions and overwrites before writing.
5. At least one representative custom DE AI package exported by the Toolkit
   loads and works in an isolated real game session. Verify the relevant castle,
   lord settings, media and extra units/features, with logs and observations.
   Document limits rather than claiming full parity from file parsing alone.
6. Classic Crusader editing, assets and exports still pass appropriate local
   regression checks and representative game-backed checks. No DE-specific
   assumptions leak into classic behavior.
7. A source-pinned difference ledger covers HD 1.41 x86 versus DE managed/native
   x64 contracts, conversions, identifiers, game versions and remaining gaps.
8. The source/repository catalogue, plan, task ownership and acceptance matrix
   remain current. The sidebar continuation owns an active persistent goal until
   every required criterion is met or a genuine external blocker meets the goal
   tool's blocking rules.

## Research and delegation

Delegate bounded work in parallel with explicit output ownership. Give every
agent the path to `00-goal-verbatim.md` and this contract. Use separate worktrees
for implementation agents when their edits can conflict. Require primary source
links, pinned commits/binary hashes, reproducible probes, and distinctions between
observed facts, inferences and unverified behavior. Review central findings.

Begin with independent tracks for DE file/lord/media contracts; real DE assets
and rendering; native/managed engine differences and loaders; and existing
Toolkit mode boundaries. Reuse verified shared logic, but do not assume x86/x64
offset or format equivalence. No recursive uncontrolled agent fan-out.

Confirmed orchestration preference (22 October 2026): use **Sol 6.1 for every
subagent**, with clear bounded instructions. The coordinator focuses on planning,
evidence synthesis, review and orchestration; implementation is delegated with
explicit ownership and conflicting edits serialized. Current T3 selection is
`codex/gpt-6.1-sol`, `reasoningEffort: ultra`, `serviceTier: default`.

The user also requires continuing critique of intent, abstraction and ownership.
The [engineering standard](05-engineering-standard.md) records this steering:
bounded agents may challenge the brief itself with evidence, while the coordinator
owns scope reconciliation and prioritizes complete user workflows. Review code
health as well as correctness; preserve behavior during cleanup and avoid
unnecessary abstraction, duplicated policies and unrelated refactoring.

Architecture steering is explicit: keep Classic and DE responsibilities visibly
separate, make reusable policies and contracts authoritative in one place, and
avoid independently maintained implementations that drift across backends.
Equivalent tests do not by themselves justify duplicate production policy.
Invest in focused generation/build/validation tooling and refactor the relevant
boundaries before adding more behavior when that prevents repeated rework.
The user's wording is retained in `00-goal-verbatim.md`. Reviewers must assess
these requirements as well as correctness before accepting new shared boundaries.

On explicit resumption the user permits each subagent at most three children
when necessary. This is a ceiling, not a required fan-out: respect live global
capacity, use Sol6.1 only, give every child the goal/contract and bounded ownership,
and serialize conflicting edits. Root retains central review and acceptance.

Smoothness is an explicit regression requirement. Before changing optimized
paths, understand their comments, Git history and original measured purpose.
Preserve workers, batching, caches, invalidation and latest-only queues. Compare
affected interactive workloads against an isolated baseline; functional tests
and helper microbenchmarks alone do not establish UI performance. See standard05
and docs/iso-scrub-performance.md for existing rationale and evidence.

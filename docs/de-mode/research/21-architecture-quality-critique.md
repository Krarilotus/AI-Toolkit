# Architecture and code-health critique — bounded review 21

2026-10-22. **No new serious defect found in the inspected foundations.** The
ownership model is sound. The main risk is how those foundations acquire their
first callers. The four findings below are integration/design concerns, not a
new commit gate for D1 or a substitute for F1/A1 correctness review. The
coordinator retains scope, architecture and acceptance decisions.

Read: goal00, contract01, plan02, synthesis03, standard05; ownership Review05;
D1 code and Review18's closure; F1 Node/Rust code, shared fixture and Review17; existing
host/UI attachment points; A1 README/handoff16 and Review14 contracts; report15's
tooling/product boundary. Shared HEAD observed:
`b4b319fabed2d3464445b5fa567d3655f2fdf239` (D1 committed during this pass).
F1/A1 were moving work: this report does not certify their final implementation.
Raw duplicate-name rejection was visible in both metadata parsers; that observation
does not independently close Review17's recovery finding.

## Prioritized findings

1. **P1 — Give DE documents an explicit byte transport and a domain-owned session.**
   **Evidence:** [documents.ts:40](../../../src/desktop/documents.ts#L40) treats
   every `sourceBase64` result as binary AIV. Its save path at lines 73–115
   serializes object projections. [storage.rs:238](../../../src-tauri/src/storage.rs#L238)
   and [main.js:565](../../../main.js#L565) return text or parsed castle JSON;
   [character-editor.js:572](../../../src/js/character-editor.js#L572) applies
   template ordering/defaults, then its output path stringifies a projection.
   These are source-confirmed existing behaviors, not newly introduced D1 bugs.
   Reusing their current contracts for LORDJSON would defeat preservation and can
   misroute bytes into the AIV decoder.
   **Owner/action:** desktop adapters carry an explicit raw-byte result variant,
   path and format hint; Rust owns generated DTOs. Document domain owns the D1
   document/revision and serialization; UI owns the edit command/unsaved prompt;
   backend owns the save operation's authority and lifetime. Keep session state
   out of `runtime.ts`. Route DE around the Classic normalizers rather than
   adding edition branches inside them. Extend the existing base64 byte-write
   facility, not a second filesystem writer. Recognition remains domain-owned.
   **Preservation test:** through each host adapter, open/save a synthetic BOM/CRLF
   LORDJSON with duplicate extensions and a large number; unchanged save is byte
   identical, a unique scalar edit changes only its token, and a failed/cancelled
   save retains the session. Existing Classic fixtures retain their behavior.

2. **P1 — Implement window authority once at dispatch, before worker scheduling.**
   **Evidence:** [desktop.rs:522](../../../src-tauri/src/desktop.rs#L522) resolves
   global installation state inside `spawn_blocking`; library calls separately
   accept `gameRoot`. [main.js:609](../../../main.js#L609) similarly uses saved
   global roots for assets while library requests supply roots. These are the
   existing hazards established by [Review05 R1–R5](05-edition-boundary-review.md),
   still visible here. Adding DE checks to individual handlers would preserve
   two competing authorities and make every future operation harder to audit.
   **Owner/action:** F2's desktop/profile service resolves the authenticated caller
   and captures the immutable context/operation lease at ingress. Both game and
   legacy library adapters use it; conflicting legacy root arguments are refused
   before writes. Expose narrow probe/bind/activation commands, not renderer-owned
   whole-store CAS. Keep the staged-switch coordinator in UI lifecycle code and
   repository recovery in F1; neither belongs in LORD/AIV codecs. Explicit
   per-publication freshness checks remain necessary after the ingress check.
   **Preservation test:** queue A's request, change the saved default from B, then
   release A's worker: it uses A's original root/cache. Test caller/root mismatch,
   inherited windows, A→B→A stale publications and drain-before-switch writes.
   This implements the accepted contract; it does not reopen its design review.

3. **P2 — Do not promote detection's `sourceRevision` into a resource-cache identity.**
   **Evidence:** [game-profiles.js:173](../../../src/node/game-profiles.js#L173)
   and [profiles.rs:418](../../../src-tauri/src/profiles.rs#L418) fingerprint
   executable evidence plus UCP presence. They explicitly do not cover assets.
   Review05's proposed context/result DTOs also use the name `sourceRevision`.
   [A1's contract](../../../crates/de-assets-core/README.md) supplies opened-source
   stamps/range identities and expressly leaves persistent cache manifests for
   later work. Thus treating those revisions as interchangeable would allow stale
   art/configuration after resource changes with unchanged executables.
   **Owner/action:** in the F2/A2 interface distinguish detection evidence from
   provider resource identity and configuration revision. Backend assembles the
   cache namespace; provider supplies the relevant input identity and decoder
   revision. Document revisions stay with document sessions. No new global revision
   service, profile-store atlas hashing or per-handler fingerprint logic is needed.
   **Preservation test:** replace a synthetic resource while retaining all PE
   fixtures: profile identity and detection fingerprint remain stable, affected
   resource caches invalidate, unchanged resources retain warm reuse, and a late
   result cannot republish into the replacement namespace. Persistent caches need
   the source-manifest contract A1 explicitly does not yet supply.

4. **P2 — Shift the next dependency sequence toward the named LORDJSON workflow.**
   **Evidence:** [synthesis03:83](../03-synthesis-and-sequencing.md#L83) gives F2
   both hosts, windows, DTOs, legacy adapters, leases and caches; F3 adds all editor
   transitions, while D2/A1 add further unused foundations. Each has a valid
   eventual purpose, but requiring all of them before the first D1 consumer
   postpones the demonstration already specified in
   [standard05:14](../05-engineering-standard.md#L14).
   **Impact/owner/action:** coordinator should split integration into reviewable
   steps with one complete workflow as the shared destination. Finish the bounded
   F1 correction/review; do not expand it into a universal metadata framework.
   Defer D2 structural editing, decoder/scene breadth and stronger game-containment
   work as dependencies of this document demonstration. Finish/review existing
   A1 scope without using it as a prerequisite for LORDJSON editing. Preserve all
   public-toggle safety requirements; postponing the toggle is acceptable for an
   interim fresh-window demonstration.
   **Preservation test:** the slice's acceptance is select DE → open actual
   LORDJSON → edit one existing scalar → save/reopen, alongside an unchanged
   Classic window. Module/test totals alone do not satisfy it.

## Explicitly accepted decisions

- **D1's complexity earns its place.** Immutable original bytes, duplicate-aware
  paths, exact numeric lexemes/no-op comparison, revision-bound handles, atomic
  patch publication and limits serve lossless edits. Keep this shared JS core for
  LORD and later ordered AIV overlays; do not clone it into each host or renderer.
  Snapshotting and checking the pinned schema addresses established defects;
  removing it for brevity would undo Review18's closure.
- **Different duplicate policies are intentional.** F1 metadata can reject raw
  duplicate decoded names and restrict numbers/Unicode/depth; game documents must
  retain ambiguous input. Keep the shared Node/Rust conformance fixture, not a
  universal JSON policy. Domain target diagnostics, including canonical-package
  duplicate/exact-array rules, must not become a blanket ban on preserving Save.
  Package installation chooses target acceptance; the codec preserves bytes.
- **Two host implementations and durable F1 recovery are justified.** Both hosts
  exist and can share storage. Keep locking, CAS, retained recovery bytes and
  fail-closed maintenance. Do not add online stale-lock stealing or a generic
  repository/strategy framework. F1 must remain free of activation/UI policy.
- **A1 belongs to the asset provider.** Bounded reads, source-held ranges, exact
  scoped identifiers and separate parse/support gates are appropriate. Metadata
  success is not decode/scene acceptance. NTFS-only file support is an explicit
  provider limitation, not a reason to call a recognized DE edition invalid.
  Renderer owns facing/composition; neither profiles nor A1 should guess it.
- **Report15 remains acceptance tooling.** Its offline evidence and
  `launchAllowed: false` authorize no game run. Do not ship its IL guards/oracles
  as product dependencies or require a game launch to prove a file-edit workflow.
  No stylistic cleanup or file-size preference is an additional blocker here.

## Practical next slice and task sequence

1. Resolve F1 round3 through its existing bounded review. D1's accepted decision
   stands. Have the coordinator settle the small byte/session/context interface;
   no extra architecture approval round is proposed.
2. One serialized host owner implements context capture/startup/inheritance and
   raw document transport for both hosts. A disjoint document/UI owner can build
   the LORD session/one scalar control against that agreed interface. Keep DE
   game/library operations explicitly unavailable until their adapters are safe;
   bind context before eager Classic initialization. Do not expose a partial toggle.
3. Integrate a fresh empty DE-owned editor: explicit folder selection/detection,
   read an existing `.lordjson`, display one schema field and diagnostics, edit,
   Save As to owned output, reopen and compare bytes. Persist an explicit default
   transactionally; leave legacy settings and the Classic window intact. This
   demonstrates editing/preservation, not playable export. Later coordinator-owned
   isolated app observation closes the UI claim; no launch occurs in this review.
4. Complete staged switching, persistence/cache migration and mixed-window failure
   checks before exposing the toggle. Then consume D2 with explicit ordered-castle
   operations, A1 through the smallest authentic preview, and vanilla named
   CustomLord/CustomMedia package planning before optional loaders. Game isolation
   is a separate dependency of actual install/game acceptance.

Future briefs should name outcome, owned files, required interfaces, exclusions
and behavior evidence, with a short **premise challenge** slot: disputed premise,
source evidence, affected owner and smallest alternative. Agents continue useful
in-scope work and return cross-owner proposals without editing those files. The
coordinator accepts/rejects/resequences them explicitly. Close a bounded review
when evidence resolves its concrete defects; reopen for changed behavior or new
evidence, not another preferred abstraction. This preserves critical agency
without silently expanding implementation scope.

Criteria consulted directly: [pstack's ownership/flow explanation guidance](https://github.com/backnotprop/pstack/blob/main/skills/how/references/explorer-prompt.md),
[Addy Osmani's structural review criteria](https://github.com/addyosmani/agent-skills/blob/main/skills/code-review-and-quality/SKILL.md)
and [behavior-preserving simplification](https://github.com/addyosmani/agent-skills/blob/main/skills/code-simplification/SKILL.md).
Used as critique criteria only; no skill installation, mutation workflow or model
selection was adopted. Their advice supports concrete ownership moves and
separating defects from preferences, not another blanket implementation gate.

Only this report was written. No children, implementation/test edits, dependency
changes, suite reruns, commits, CI/PR operations, launches or installed-state
changes. Evidence here is source inspection and existing review contracts; no new
runtime correctness or product-acceptance claim is made.

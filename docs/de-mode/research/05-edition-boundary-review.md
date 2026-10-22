# Independent edition-boundary review — round 1

Date: 2026-10-22. Scope: detection/profile/context foundation only.
Owned output: `docs/de-mode/research/05-edition-boundary-review.md`.

## Verdict and scope

**Conditional GO to begin one serialized, initially unexposed foundation implementation using the corrected contract below. NO-GO to expose a working DE toggle, route DE through Classic services, or claim DE support until the foundation gates pass.** The fixes are design requirements for that implementation, not assertions that existing code implements them. No further format, extraction or deployment conclusion is required to start additive detection/profile work.

The coordinator's decisions correctly address the main architecture direction: retain Classic adapters; separate probing from activation; bind services and caches to immutable window identity; namespace domain persistence; use Save/Discard/Cancel; preserve unknown JSON without the Classic character normalizer. The remaining ownership, migration and asynchronous-operation details must be settled as specified here. In particular, “one activation boundary” alone is not an atomic transaction spanning backend storage, localStorage and three editors.

Read first: [verbatim goal](../00-goal-verbatim.md), [working contract](../01-working-contract.md), [plan](../02-plan.md). Independently reviewed [architecture report](04-architecture.md), [coordinator evidence](00-coordinator-evidence.md), and implementation. HEAD was `818503dc40971defef3769ca883f82290405ab94`, branch `de/separate-game-mode`. Concurrent central research changes were present; implementation paths had no worktree diff. No other research report is a prerequisite for this narrow verdict.

Evidence labels: **observed** = executed read-only/in-memory here; **source-confirmed** = directly inspected code; **inferred** = consequence requiring integration verification; **proposed** = recommended contract; **unverified** = no evidence established here. Every design below is proposed unless labelled otherwise.

## Findings and required fixes

### R1 — High: the window must own authority; a renderer-supplied root or global default must not

**Source-confirmed:** Rust `game_request` has no invoking window argument and calls `storage::installation` inside the queued blocking closure. It can therefore choose a root later than request submission. Library operations instead carry `gameRoot`. Electron asset/map/balance handlers also resolve the saved global root, while project dialogs already use `event.sender`. [S1–S3, S6]

**Observed in-memory:** executing the actual Electron resource-icon handler with stubbed readers gave window A `classic-root` initially, then `de-root` after changing the global selection; window B also received `de-root`. Sender A still represented the Classic project. This demonstrates dispatch behavior, not an executed mixed-window GUI session.

**Required fix:** keep an immutable backend context snapshot per editor window. Resolve identity from Tauri's injected `WebviewWindow` or Electron's `event.sender`; validate an accompanying context token against that owner. Capture the complete root/config/capability/cache snapshot **before** scheduling work. Never trust a request's separate root to override that snapshot. Reject mismatching legacy `gameRoot` arguments, while preserving their public call shapes through adapters.

Apply this to configuration, skins, UCP reads/writes, map paths, balances, dialog defaults, project restore and cache operations, not only `game_request`. Standalone documents retain their explicit document paths and format; their saves carry document ownership and an operation lease rather than being redirected to the active game root.

**Proposed ownership policy:** each editor is independent; Add Window and Load in New Window inherit the caller's current context snapshot, with `restoreProject=0`. Establish that binding before page/editor initialization. Each new editor copies the profile/resource snapshot but receives its own window epoch and generation; it must not reuse its parent's context token. A detached viewport belongs to its editor, cannot select a profile or persist a startup default, and obtains services through its owner. Preserve the existing owner-close cleanup. [S6]

### R2 — High: distinguish active windows from the persistent startup preference

The architecture's `defaultEdition` plus `selectedProfiles` needs deterministic update rules; otherwise focus, closing or startup restoration can undo a deliberate switch in another window.

**Required fix / proposed policy:**

- Persist `defaultProfileId` and `selectedByEdition`, together with a store revision. A successful **explicit user activation** updates both in the same profile-store transaction. First-run accepted folder selection counts as explicit activation.
- Startup binding, inherited windows, focus, close, asset refresh and project restoration never update either preference. Existing windows ignore default changes.
- Concurrent explicit selections serialize in the profile repository; the last successfully committed explicit selection determines the next startup. Use revision checks and merge/retry rather than writing a stale whole-file snapshot.
- A window's generation advances only when that window commits an activation. A global store revision is not its context generation.
- Empty/no-profile state is explicit. Picker cancellation remains a usable standalone editor state; it must not pick the Node module's fallback Classic installation. That fallback currently exists. [S11]

A default points to an installation profile, not a globally “active” root. Changing the default never revokes another window's existing profile or assets. Profile deletion/root replacement is outside this minimal slice; add a new immutable profile identity rather than editing the root underneath live windows.

### R3 — High: metadata migration must fail without replacing good state

**Source-confirmed:** Rust settings writes use a process mutex; Electron `readSettings` converts any read/parse failure to `{}`. Rust's writer uses a temporary file and backup rename, with a crash interval while the canonical path is absent. Neither establishes a cross-process transactional profile repository. Existing Electron-to-native browser migration has its own marker and cannot serve as the edition migration marker. [S1, S9]

**Required fix:**

1. Add a separate `game-profiles.v1.json`; leave legacy `settings.json`, `ucpInstallation`, browser keys, custom config, skins and caches intact. In this first slice, do not dual-write the old root key. Both updated Classic adapters resolve the new window context; an older installed app retains its prior Classic selection.
2. Distinguish missing, malformed, unsupported-schema and I/O-failed new stores. Only **missing** permits automatic initial migration. Corrupt/future/unreadable stores must not be treated as empty and overwritten.
3. Read the old root as a migration candidate, not proof of Classic edition. Probe it. If missing/ambiguous, retain its original value and expose a diagnostic/unavailable legacy candidate; keep standalone editing usable. Never invent a DE profile from the old UCP key or install UCP to satisfy detection.
4. Validate the new snapshot, write durably, and only then mark migration complete. No deletion/renaming of legacy data. A write failure leaves no activated new context/default; a repeat is idempotent.
5. Define recovery for an interrupted profile-store replacement. Reusing `atomic_write` is reasonable only with a tested retained backup/recovery rule; its current temporary-backup cleanup is not itself crash recovery.
6. If native and Electron processes can access the same new store concurrently, use one cross-process writer/lock plus revision validation, or an equally explicit tested coordination mechanism. The Rust static mutex covers one process only. Do not call process-local serialization cross-process safety.
7. Migrate browser domain keys by copy-on-missing into Classic-only namespaces. Retain originals. Record completion only after every intended key succeeds; if storage is blocked, continue explicitly in memory without claiming durable migration. Retries never overwrite an already populated new namespace.

Do not sweep unrelated legacy settings-number handling into this slice. Exact preservation of the legacy file follows naturally by leaving it unwritten.

### R4 — High: stage the switch and drain writes before adopting the target

**Source-confirmed:** current installation selection persists the backend root before frontend asset preparation. The frontend then changes `state.gameRoot`, clears map state, awaits refresh and clears project ownership without the unsaved gate. Adding the gate after the chooser would be too late. `scan()` also publishes asynchronously without a context guard. [S2–S5]

**Required switch protocol:**

1. Pick a folder and probe it without activation, persistence, directory creation, library normalization or asset extraction. Staging must not call today's mutating chooser.
2. Stage target config/capability handles. Treat explicitly unavailable DE assets as capability gaps; treat unreadable/inconsistent preparation as failure.
3. Serialize switches per editor. Before the unsaved gate, prevent document-changing actions in docked/detached views, menu/keyboard actions and automatic project restores; capture all three document revisions and the old context. Drain accepted in-flight saves/library mutations. Later mutations are rejected/deferred; pending reads cannot publish while frozen.
4. Call `confirmAll` under the **old** context. Save uses original format/path/source bytes. Cancel, rejected save, failed Save As or cancelled Save As aborts. If Character was explicitly saved before Castle cancels, keep that legitimate save; do not promise to undo requested disk writes.
5. Recheck revisions, profile-store revision and the probe's root identity/fingerprint. If stale or removed, abort/reprobe before changing ownership. Revalidation is not a complete filesystem snapshot against outside game updates; provenance must still be checked by later extractors/installers.
6. Commit the validated profile-store/default update and backend window-context replacement under one serialized activation operation. Allocate/validate the new snapshot before persisting it; after a persistence success, its in-memory publication must be non-failing. Retain the old editor documents until renderer adoption succeeds.
7. Adopt prepared context/view state without parsing/converting/resetting documents through the new edition's schema. On success, close/detach the old project **and all its document owners, dialogue/media/portrait references and dialog destinations** together. Choose one policy: this minimal implementation closes them after the accepted gate; keeping them requires a separate intentionally owned window.
8. If renderer adoption can fail, it needs an explicit snapshot rollback before the context is announced ready. Roll back backend binding/default with compare-and-swap so recovery cannot overwrite a later successful choice by another window. Alternatively prove the prepared adoption path cannot fail. A failed target project restore is separate: retain the successfully activated empty target session and diagnose the unavailable project, without resurrecting old project metadata.
9. Unfreeze; allow only the current context's callbacks to publish. A switch cancelled/failed before adoption preserves old root, project, content, undo history and domain state, apart from saves the user explicitly completed.

**Observed in-memory:** existing `confirmAll` with “Discard, then Cancel” returned false and left all editors dirty; with “Save, then Cancel” it saved only Character and returned false. “Discard” authorizes later replacement; it does not currently clear data. Preserve this useful behavior. [S4]

### R5 — High: request generation is necessary at every publication boundary

**Source-confirmed:** native configuration promises are keyed only by filename; Character has one persistent skin promise; castle assets and balance have useful independent response tokens; isometric images have onload/onerror callbacks without a context token. Editor startup loads templates/constants and may normalize a document before any profile readiness barrier. [S7, S8, S10]

**Required fix:** a request captures one context for its entire lifetime, across every await. Include that identity in the response envelope and verify it before updating UI, localStorage, project metadata, “busy” flags, errors or current cache handles. A→B→A must reject the first A's callbacks: profile ID equality alone is insufficient; include an unrepeatable window epoch plus generation and a resource revision.

Keep caches keyed by edition + stable root/profile identity + resource/extractor/config revision. Keep renderer promises/context view models equally scoped; clearing one map or reloading castle sprites is insufficient. When an old promise fails, it may delete only its own cache entry, never a newer promise for the same logical name. Old read/extraction work may finish into its immutable old cache namespace; it may not repaint or change the new selection.

Freeze/drain accepted mutations under R4; do not “cancel” a write merely by ignoring its response after it has written somewhere. Startup document delivery and project restoration need the same readiness barrier and both context/document-revision guards. Existing per-window event scoping remains valuable but does not supply context identity. [S5–S8]

### R6 — Medium: Classic without UCP is a valid installation, not a UCP library

**Source-confirmed:** both legacy normalizers require `ucp/plugins`. Native canonicalizes the result; Node returns `path.resolve`, so aliases/junctions can receive different identities today. Low-level graphics readers already start with `gm` and treat UCP configuration as optional; the UCP library itself requires its own layout. [S1, S12]

**Required fix:** new edition detection is independent of these validators. Recognize the actual Classic engine/assets separately from optional `ucp/plugins`; offer standalone editing and only individually verified game-reader capabilities. Disable UCP scan/create/clone/update/media operations with an explanatory capability reason when UCP is absent. Do not create folders or label the entire edition invalid.

Canonicalize identities consistently across backends, preserve display paths and platform case semantics, and keep installation identity separate from binary/resource revision. DE detection must examine launcher + managed/native data layout and PE evidence, never folder name, an arbitrary `ucp/plugins` tree, or bitness alone. Mixed Classic/DE signatures are ambiguous; a toggle's requested edition must not silently override detected evidence. Unknown version hashes can identify an edition while extraction/deployment stay unverified.

**Observed limitation:** both locally inspected Classic roots already have UCP. Plain-Classic detection is not game-observed here; it needs shared synthetic fixtures and later isolated acceptance. The Extreme root contains both `Stronghold Crusader.exe` and `Stronghold_Crusader_Extreme.exe`; do not assume a single executable basename covers every supported Classic variant.

### R7 — High boundary, deferred implementation: format identity survives a mode change

**Source-confirmed and observed:** Classic Character's recursive key rename changes `[11,22]` into `{"0":11,"1":22}`; native castle reads place parsed JSON in the IPC envelope; JavaScript parsing/re-emitting `9007199254740993` yields `9007199254740992`. The coordinator's raw-token requirement is necessary. [S13]

**Required foundation rule:** document kind, source text/bytes, path, source format and owning context are independent of the active default. The foundation must not accept LORDJSON via `loadFromContent`, shared template defaults or a native `serde_json::Value`/JS-number round trip. Reserve raw text/bytes transport for a later token-preserving document adapter. Preserve unknown arrays, large integer lexemes and future IDs without silent coercion; rejecting an unsupported edit is preferable to an apparently successful lossy save.

No lossless LORDJSON codec, versioned DE schema, authentic art, deployment or runtime capacity is approved by this review. Keep DE-only operations typed as unavailable until their own evidence gates pass. Do not change Classic normalization, shared troop caps, analysis or package writers merely to land profile metadata.

## Minimal foundation contract

These are proposed API shapes, not new implementation. Preserve existing `window.electronAPI` methods as backend-specific Classic adapters while migrating callers; never silently let a DE context enter those algorithms.

```ts
type Edition = "classic" | "de";
type ContextRef = Readonly<{ epoch: string; generation: number }>;
type Profile = Readonly<{
  id: string; edition: Edition; canonicalRoot: string; displayRoot: string;
}>;
type ProfileStoreV1 = {
  schemaVersion: 1; revision: number;
  defaultProfileId: string | null;
  selectedByEdition: Partial<Record<Edition, string>>;
  profiles: Record<string, Profile>;
  // Versioned migration provenance/status; do not reuse nativeMigration.v1.
};
type Context = Readonly<{
  ref: ContextRef; profile: Profile | null;
  sourceRevision: string; configRevision: string;
  capabilities: CapabilitySnapshot; cacheNamespace: string;
}>;
type ProbeResult =
  | { status: "recognized"; probeId: string; profile: Profile;
      sourceRevision: string; evidence: ProbeEvidence[] }
  | { status: "ambiguous" | "incomplete" | "unknown" | "unreadable";
      diagnostics: Diagnostic[] };
type ContextResult<T> = { context: ContextRef; sourceRevision: string; value: T };

// Caller window is supplied by the host, never accepted as a payload window ID.
probeInstallation({ path }): Promise<ProbeResult>; // read-only, no activation
getProfiles(): Promise<StoreResult>; // missing/corrupt/future/io-error are distinct
bindWindowContext({ mode: "startup" | "inherit" }): Promise<Context>;
// Inherit source is host-verified caller/owner; bootstrap does not write default.
prepareActivation({ probeId, expectedContext }): Promise<PreparedActivation>;
activateProfile({ preparedId, expectedContext, expectedStoreRevision,
                  requestId }): Promise<ActivationResult>;
// Explicit user activation; remember startup preference only on committed success.
getWindowContext(): Promise<Context>;
gameRequest({ context, operation, payload }): Promise<ContextResult<unknown>>;
```

Use actual discriminated/operation-specific Rust DTOs and generated TS response maps, not `unknown` in production. `CapabilitySnapshot`, `ProbeEvidence`, `StoreResult`, `PreparedActivation` and `ActivationResult` above are placeholders for explicit typed records. Needed activation statuses include committed, stale-context, stale-store/probe, invalid-owner and persistence-failed. A stable request ID allows a lost IPC response to be retried/queried without double activation. A probe/prepared token is window-owned, immutable and revalidated at commit; it does not grant permanent trust to a mutable directory.

All edition-sensitive RPCs, including legacy library mutations and skin/config operations, receive or derive the same context/operation lease. Document operations additionally retain document identity. Bind contexts before page initialization; in native dispatch copy the validated context before `spawn_blocking`. Return unsupported/unverified capability results explicitly; don't hide them as Classic defaults.

Use the new profile directory for new edition-specific caches and settings. Keep legacy Classic skin/cache/config paths as explicitly Classic-only read compatibility fallbacks; never infer DE provenance from them. Any writable namespaced replacement must preserve existing Classic overrides and test warm-cache/absolute-path handling.

Browser keys must be resolved from an explicit captured context: installation/project history, maps/positions, balance choice/profiles, production and project-linked groups are profile-scoped; clipboard may be edition-scoped to preserve same-edition window sharing. Appearance, language, keyboard bindings and panel layout can remain global. Legacy keys are imported only into Classic. Storage events and paste-at-read-time must honor the resolved namespace. [S14]

## One serialized implementation: file ownership and order

One implementer owns the following changes in order; do not fan out edits to these shared boundaries. Names for new modules are recommendations.

1. **Identity/detection fixtures and metadata repository:** add `src/node/game-profiles.js`, `src-tauri/src/profiles.rs`, and shared synthetic detection/profile fixtures under `tests/fixtures/de-mode/`. Keep filesystem detection separate from pure signature/capability rules. Add Node/Rust profile tests for recognized/ambiguous layouts, identity and failure recovery. At this step nothing switches a live editor.
2. **Typed context/session plumbing:** same owner edits `src-tauri/src/desktop/contracts.rs`, `src-tauri/src/desktop/responses.rs`, `src-tauri/src/desktop.rs`, `src-tauri/src/lib.rs`, `src-tauri/src/windows.rs`, `main.js` and `preload.js`; add `src/desktop/profiles.ts`; adjust `runtime.ts`, `api.ts`, `assets.ts`, `documents.ts`. Regenerate `src/desktop/generated/` from Rust; never hand-edit it. Isolate Classic algorithms behind context-resolving adapters. No DE reader/writer yet.
3. **Cache/storage ownership:** same owner adds `src/js/profile-storage.js` and threads context namespaces into game caches and existing domain-key consumers. Preserve Classic cache locks/revision verification. Add context-bound cache tests, including same-edition different roots.
4. **Startup and staged switch coordinator:** add `src/js/game-mode.js`; edit `src/index.html`, `src/js/app-shell.js`, `src/js/ucp-library.js`, Character/castle/content lifecycle code, `iso-view.js`, `editor-extras.js`, cost panel and relevant async consumers. Supply explicit lifecycle APIs to freeze, prepare, snapshot/adopt and restore; don't attempt switch teardown by ad hoc globals. Native/Electron context binding must precede eager initialization. Hide the toggle until gates below pass.
5. **Review handoff:** return exact changed files, local focused check results and unresolved adoption/cross-process recovery findings to the parent. The parent owns central docs/ledger/acceptance, wider regression runs and any later UI/game acceptance. This review authorizes no commit, push, CI, PR, release or installed-app operation.

The first two steps can proceed while DE format/asset/runtime research continues. Use conservative DE capability gaps; do not fill them with Classic implementations to make the new context API appear complete.

## Validation gates for foundation acceptance

These are required new/extended tests, **not passed results**. Retain existing Classic coverage rather than rerunning the entire baseline in this research review.

- **F1 — Read-only detection:** shared Node/Rust fixtures for Classic with/without UCP; root/`ucp`/`plugins` selections; DE-only and both separately installed; mixed layouts; a UCP tree without a game; missing/unreadable roots; unknown binary version; path aliases/junctions and case rules. Check no game/profile/cache writes, no loader execution and no Classic prerequisite for DE. Edition evidence must not equal “PE x64”.
- **F2 — Migration/recovery:** legacy settings/unknown fields unchanged byte-for-byte; valid prior skins/config/history retained; only missing new store triggers migration; corrupt/future/I/O-failed stores remain untouched; failed write/rename and interrupted replacement recover the previous store; repeat migration is idempotent. Simulate partial localStorage failure and two windows/processes updating the store. No success/default on failed persistence.
- **F3 — Ownership/defaults:** A Classic, B DE, C another Classic root; requests complete in reverse order and each uses its original root/config/cache. Explicit activation changes only its editor and the next-startup preference. Focus/close/inherited windows don't overwrite it. Viewports inherit correct owner; destroying one editor doesn't affect others. Root mismatch in legacy mutation payloads is rejected before write.
- **F4 — Transition failure:** dirty Character/castle/dialogue separately and together; Save/Discard/Cancel; discard then later cancel; successful save then later cancel; Save As cancel/error; picker cancel; failed probe/prepare/persist/adopt; target removal; double-clicked switches; pending save/library update. Verify old project/root/documents/undo remain, except explicitly completed saves. Verify no wrong-path write and no post-commit normalization.
- **F5 — Async readiness:** startup/config/skin/map/balance/library/image/worker results after switch and A→B→A; old rejection/finally must not erase new cache entries or busy/error state; bootstrap can't overwrite a delivered document; profile readiness precedes all edition-sensitive startup work. Test stale requests queued before backend worker execution.
- **F6 — Persistence/cache boundaries:** identical IDs/basenames in Classic/DE and different roots cannot share sensitive entries; unchanged source retains warm reuse; changed source/config revision invalidates correctly; legacy cached absolute asset paths remain valid or are rebuilt. Classic preferences and same-edition clipboard behavior remain equivalent; DE never imports Classic map/balance/skin data by fallback.
- **F7 — Format safety and maintained API:** unchanged Classic AIV bytes, Classic JSON/string transport, explicit save-extension behavior, UCP library transactional writes, typed IPC fixture generation, and standalone no-installation editing retain existing behavior. LORDJSON routing stays unavailable until its independent adapter exists. Preserve representative unknown array/integer source text across context changes without the Character normalizer.

Passing F1–F2 permits metadata/detection to be accepted. Passing F3/F5/F6 permits context plumbing to be accepted. Exposing any toggle additionally needs F4/F7 and a later parent-owned isolated application check of actual native/Electron picker, document and mixed-window behavior. Passing unit tests alone does not close those GUI acceptance rows or approve full DE mode.

## Independent probes and results

Every shell invocation used explicit Toolkit workdir `S:\Projects\UCP\AI-Toolkit-DE`; only this report was written. No clone/pull, reference-source checkout, full-suite rerun, dependency installation, implementation edit, commit, game/editor launch or installed-app/game write occurred. Existing local primary code sufficed; no new repository or binary was needed.

**Observed source parity:** both commands returned no diff, exit 0:

```powershell
git diff --exit-code 5ce3676af8ddb78a11f0148cc2311915eec0a0d8 HEAD -- main.js preload.js src src-tauri tests config
git diff --exit-code HEAD -- main.js preload.js src src-tauri tests config
```

Consequently source URLs below use the identical upstream implementation at `5ce3676af8ddb78a11f0148cc2311915eec0a0d8`; inspected local HEAD remains `818503d...`. The two research inputs were uncommitted shared reports, read at these SHA-256 values (later coordinator edits may differ):

- `04-architecture.md`: `a3b39d459878e12b4dc0fd92afc17385dfd6e1129c2ebfaa407563e75e74c04b`.
- `00-coordinator-evidence.md`: `3a3866f63ce642b2a1c2625d75a81c7ec3a61dfd5bf84134238f2eec72ec45a8`.

**Observed focused existing tests: 8 passed, 0 failed, 0 skipped.** They verify existing components, not the proposed foundation:

```powershell
node --test --test-reporter=spec --test-name-pattern 'startup restores|new windows|a slow earlier|a manual choice|a late previous|document delivery and close|typed transport|failed configuration' tests/castle-session.test.js tests/game-asset-refresh.test.js tests/balance-refresh.test.js tests/desktop-bridge.test.js
```

Reproduce the global-root handler probe without invoking Electron or reading game data:

```powershell
node -e "const fs=require('node:fs'),vm=require('node:vm'),handlers={};let selected='classic-root';vm.runInNewContext(fs.readFileSync('main.js','utf8').split('\n').slice(608,611).join('\n'),{ipcMain:{handle:(n,f)=>handlers[n]=f},savedUcpInstallation:()=>selected,require:()=>({readResourceIcons:root=>({root}),readInstalledBalance:root=>({root})})});const a={sender:{id:'A'}},b={sender:{id:'B'}};console.log(handlers['read-resource-icons'](a));selected='de-root';console.log(handlers['read-resource-icons'](a),handlers['read-resource-icons'](b));"
```

For the unsaved probe, extract `app-shell.js` from `function editorFor(` to the subsequent `for (const tab of tabs)`, evaluate in `node:vm` with three dirty stub editors and queued `confirmUnsaved` answers, and call `confirmAll`. Observed outputs: discard/cancel → false, all dirty; save/cancel → false, only Character saved to its original stub path. No disk save occurred.

For the array probe, extract `function renameKeysPreserveOrder(` up to the next top-level function from `character-editor.js`, evaluate with `legacyKeyMap: {}`, and apply to `{futureArray:[11,22]}`. Observed `{"futureArray":{"0":11,"1":22}}`. Numeric probe: `JSON.stringify(JSON.parse('{"future":9007199254740993}'))` produced `{"future":9007199254740992}`.

**Observed local binary identities:** independently read and SHA-256 hashed; none executed or copied. DE paths are relative to `D:\SteamLibrary\steamapps\common\Stronghold Crusader Definitive Edition`.

- `Stronghold Crusader Definitive Edition.exe`, 887880 bytes: `8acea6d11af81cf26b035a479ba633bdb0d09513742055f3f46330d72b2f203a`; PE machine `0x8664`, optional header `0x20b`.
- `Stronghold Crusader Definitive Edition_Data/Managed/Assembly-CSharp.dll`, 3693056 bytes: `bc8b6a395f01d48557db413600c8dd8d1fdfd3abdf97bfbbb68a3c56b04fd789`; PE machine `0x014c`, optional header `0x10b`. This PE header alone does not establish the managed runtime's process bitness.
- `Stronghold Crusader Definitive Edition_Data/Plugins/x86_64/CrusaderDE.dll`, 3451392 bytes: `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`; PE machine `0x8664`, optional header `0x20b`.
- `D:\SteamLibrary\steamapps\common\Stronghold Crusader Extreme\Stronghold Crusader.exe`, 8376320 bytes: `3bb0a8c1e72331b3a30a5aa93ed94beca0081b476b04c1960e26d5b45387ac5a`; PE machine `0x014c`, optional header `0x10b`.

Reproduce hashes with `Get-FileHash -LiteralPath '<absolute binary path>' -Algorithm SHA256`; read the PE offset with `readUInt32LE(0x3c)`, machine at `pe+4`, optional header magic at `pe+24`. DE's current root has no `ucp/plugins`, `gm` or `aiv` directory; both inspected Classic roots have all three. Calling current Node `normalizeInstallationPath` on DE rejected it with “This is not a UCP installation. Expected to find an ucp/plugins folder.” The two Classic roots were accepted. Recognition heuristics and an unmodded Classic fixture remain implementation work.

## Primary source index

All URLs below are primary Toolkit code at exact commit `5ce3676af8ddb78a11f0148cc2311915eec0a0d8`, independently checked identical to the reviewed implementation paths. Local binary observations above do not rely on the Serpens summary. No decompilation/runtime or game-format claim was needed from that lead in this review.

- **S1:** [storage.rs L36–80](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/storage.rs#L36-L80), [L82–160](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/storage.rs#L82-L160): shared user data/settings, replacement semantics, process mutex use, persisted installation and UCP validator.
- **S2:** [desktop.rs L263–315](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/desktop.rs#L263-L315), [L521–563](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/desktop.rs#L521-L563): early chooser persistence, explicit library roots, implicit game root/cache dispatch.
- **S3:** [main.js L609–622](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/main.js#L609-L622), [L676–699](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/main.js#L676-L699): Electron implicit root versus explicit project root.
- **S4:** [app-shell.js L48–64](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/app-shell.js#L48-L64): non-destructive discard authorization and sequential three-editor save gate.
- **S5:** [ucp-library.js L498–548](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/ucp-library.js#L498-L548), [L834–869](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/ucp-library.js#L834-L869): scan publication, unsafe current root switch and restoration guards.
- **S6:** [windows.rs L151–209](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/windows.rs#L151-L209), [desktop.rs L469–472](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/desktop.rs#L469-L472), [main.js L554–563](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/main.js#L554-L563), [L866–882](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/main.js#L866-L882): viewport owners, additional editor lifecycle, sender-scoped dialog roots and file delivery.
- **S7:** [runtime.ts L7–39](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/runtime.ts#L7-L39), [documents.ts L4–15](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/documents.ts#L4-L15), [api.ts L75–110](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/api.ts#L75-L110): transport state, filename-only cache, game/project adapter contracts.
- **S8:** [character-editor.js L373–378](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/character-editor.js#L373-L378), [castle-editor.js L2652–2663](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-editor.js#L2652-L2663), [L3935–3950](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-editor.js#L3935-L3950): skin lifetime, partial async guard, eager config initialization.
- **S9:** [main.js L99–122](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/main.js#L99-L122), [migration.rs L59–98](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/migration.rs#L59-L98): Electron read fallback and distinct existing migration marker.
- **S10:** [desktop.rs L56–78](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/desktop.rs#L56-L78), [iso-view.js L56–126](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/iso-view.js#L56-L126): external configuration, asset promises and image completion.
- **S11:** [game-map.js L147](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-map.js#L147), [L533–547](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-map.js#L533-L547): Classic fallback root and optional plugin map folders.
- **S12:** [node/ucp-library.js L114–148](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/ucp-library.js#L114-L148), [game-graphics.js L7–46](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/node/game-graphics.js#L7-L46), [graphics.rs L117–130](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/game/graphics.rs#L117-L130): Node validation/path identity and optional-UCP graphics resolution.
- **S13:** [character-editor.js L572–590](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/character-editor.js#L572-L590), [L662–681](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/character-editor.js#L662-L681), [storage.rs L238–253](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src-tauri/src/storage.rs#L238-L253), [documents.ts L103–116](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/desktop/documents.ts#L103-L116): destructive character transformation and parsed-versus-raw document transport.
- **S14:** [ucp-library.js L64–98](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/ucp-library.js#L64-L98), [editor-extras.js L119–143](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/editor-extras.js#L119-L143), [L420–424](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/editor-extras.js#L420-L424), [castle-cost-panel.js L8–55](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/castle-cost-panel.js#L8-L55), [iso-view.js L163–211](https://github.com/Schlossgespensty/AI-Toolkit/blob/5ce3676af8ddb78a11f0148cc2311915eec0a0d8/src/js/iso-view.js#L163-L211): existing shared domain persistence and cross-window clipboard events.

## Remaining uncertainties for the parent

- Actual mixed-window GUI ownership, native/Electron picker behavior, renderer adoption rollback and concurrent-backend recovery remain unverified until implemented and tested; the eight passing tests do not settle them.
- Exact Classic variant detection signatures beyond the inspected files need fixture/primary-source coverage. Both observed Classic roots are modded; no clean no-UCP installation was tested.
- Lossless JSON token handling, DE schemas, local asset extraction/provenance and package/runtime contracts belong to the other research/implementation milestones. None can be inferred from an installation signature.
- A process crash after a durable user selection may leave that profile as the next startup preference even if the renderer never acknowledged it. Specify this as the commit point and test recovery; cancellation before commit must never have that effect.

The concrete policies above resolve the four stated foundation objections in design: host-owned mixed windows; explicit-selection-only default persistence; accepted Classic-without-UCP with restricted capabilities; fail-safe migration plus context/epoch guards. They remain validation obligations for the serialized implementation, not completed acceptance criteria.

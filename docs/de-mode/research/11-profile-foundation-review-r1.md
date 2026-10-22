# Independent F1 profile foundation code review — round 1

Date: 2026-10-22. Owned output: `docs/de-mode/research/11-profile-foundation-review-r1.md`.

**NO-GO for COMMIT of the current additive F1 snapshot.** The supplied focused suites pass, and the cross-process transaction design is credible within its stated process-crash limits. However, accepted writes can produce metadata that the native backend cannot subsequently read; Node also accepts non-JSON values and silently changes their meaning on disk. Both PE inspectors accept out-of-file CLR declarations and missing managed metadata. Resolve R1–R3 in one bounded implementation/review round before committing. No live context, service, cache, IPC or toggle activation is approved here.

Read in full: goal `00-goal-verbatim.md`, contract `01-working-contract.md`, plan `02-plan.md`, Review05 `05-edition-boundary-review.md`, and completed handoff `09-profile-foundation-handoff.md`. This applies Review05's additive detection/repository gates; it does not move window integration or game acceptance into F1.

## Scope and evidence identity

Inspected exactly the requested implementation: `src/node/game-profiles.js`, `src-tauri/src/profiles.rs`, the single `mod profiles;` diff in `src-tauri/src/lib.rs`, `tests/game-profiles.test.js`, `tests/fixtures/de-mode/foundation.json`, and handoff09. Base HEAD is **`e6733cabc81731f4c8f0b71013456caa201657fd`**, branch `de/separate-game-mode`; F1 is uncommitted. The earlier `818503d...` assignment baseline is not the review snapshot. Concurrent central-doc/D1 changes were left alone; no D1 review was performed.

Evidence labels: **observed** = independently executed here; **source-confirmed** = directly inspected stated lines; **inferred** = consequence of those observations; **unverified** = not established. Findings below are observed and source-confirmed unless qualified.

Uncommitted sources have no truthful remote commit permalink yet. Exact local file/line references below plus these SHA-256 hashes identify the primary source. Add final fork commit permalinks after a later authorized commit; URLs at the base commit would not contain these new modules.

| Primary source, relative to Toolkit | SHA-256 |
| --- | --- |
| `src/node/game-profiles.js` | `37667db13203d7a66b608727f5dbfabf9a873429f51ed3ace1d8a29f24439951` |
| `src-tauri/src/profiles.rs` | `760c70f6e106f989502e3190416053a7f3c6522b460f0ea7b8e96f71b6722dcd` |
| `src-tauri/src/lib.rs` | `ed081350c4b18552115275ad28e9983c9a719d974a7547d1b414719ee78387d5` |
| `tests/game-profiles.test.js` | `019eba674e2826192e83fafba205077d36f090b8acf649bc54ed060c39f80fae` |
| `tests/fixtures/de-mode/foundation.json` | `244837a630e8d8d9484567508f988f4ed007ef85379d867ec9ad338fb46b101c` |
| `docs/de-mode/research/09-profile-foundation-handoff.md` | `ac6701c16f757411ef81b9b12e817a4b7c9fae6101472e6978bf8e4a33a7085d` |

Every Toolkit command used explicit workdir `S:\Projects\UCP\AI-Toolkit-DE`. Scratch sources, synthetic installations, logs and executables are owned under **`S:\Projects\UCP\de-research\review11-f1-r1`**. No implementation edit, formatter, dependency installation, source checkout/ref alteration, commit, push, CI, PR, release, app/game launch, or installed-game/application/settings write occurred. No child was delegated and no goal created.

## Severity-ranked findings

### R1 — High / commit blocker: successful CAS can create an unreadable native store

**Locations:** Node `game-profiles.js:162–168,181–190,255–261,274–289`; Rust `profiles.rs:413–424,465–505,677–689,709–736`.

Neither validator bounds nested extension containers. Rust `parse_metadata` uses ordinary `serde_json::from_str` with its recursion limit, while validation, serialization and CAS accept deeper in-memory `Value`s. Node accepts and serializes the same objects. A store with 130 nested extension objects receives **committed** from both writers, but native `read()` immediately returns **corrupt**. This is a native self-round-trip failure and a cross-backend failure, without a crash, race, bad number, external edit or unsupported schema.

Minimal proposal, with `api` bound to the Node module and `r` a fresh scratch repository:

```js
const s = api.emptyStore();
let extension = null;
for (let i = 0; i < 130; i++) extension = { child: extension };
s.extension = extension;
r.compareAndSwap(null, s); // committed
r.read();                  // ready in Node
// Native repository read of same directory: corrupt
```

The scratch Rust probe builds the equivalent `serde_json::Value` directly and calls `compare_and_swap(None, &store)` followed by `read()`: **committed → corrupt**. `rust-deep.log` retains that result; store: `review11-f1-r1\rust-deep`.

Additional disagreements in the same serialization domain:

- Node commits `s.extension = '\ud800'` and reads it as ready; native reads the resulting store as corrupt. Node does not check Unicode scalar validity; Rust strings cannot represent that value.
- A UTF-8-BOM-prefixed, otherwise valid empty v1 store is ready in Node and corrupt in Rust. Node's `TextDecoder` strips the BOM by default; Rust passes it to the JSON parser. Normal writers do not produce this input, so it is a lower-impact read-policy mismatch.

**Impact:** an accepted extension can make the store unavailable to the other host, or its own native writer on restart. Fail-closed reads prevent destructive migration but do not make an unreadable committed snapshot acceptable. Unknown-field support is part of F1; the numeric restriction alone does not define a common serialization domain.

**Required fix:** enforce a common bounded JSON domain before commit, with a depth limit accounting for all store/profile wrappers and consistent Unicode/BOM policy. Reject unsupported values without truncation/coercion/dropping extensions. Ensure every accepted serialized proposal is parseable and valid under that common contract, including after extension preservation. Add depth-boundary, native self-round-trip, both cross-backend directions, surrogate and BOM tests. Disabling a parser safety limit without a reviewed bound is insufficient.

### R2 — Medium / commit blocker: Node's JSON-only validator accepts values serialization destroys

**Locations:** Node `game-profiles.js:15,162–168,255–261,274,289`.

`object()` accepts any non-array object; `checkJson` visits enumerable string values without restricting objects to JSON records. `structuredClone` retains several non-JSON types; `JSON.stringify` changes or discards their contents. The committed return contains the cloned proposal rather than the parsed persisted representation.

Independent scratch results:

| Extension proposal | CAS | Returned extension | Subsequent stored extension |
| --- | --- | --- | --- |
| `new Map([['keep',1]])` | committed | Map, size 1 | `{}` |
| `new Date('2026-10-22T00:00:00Z')` | committed | Date | string `2026-10-22T00:00:00.000Z` |
| `Array(1)` | committed | sparse array | `[null]` |

Minimal repro: `const s=api.emptyStore(); s.extension=new Map([['keep',1]]); const w=r.compareAndSwap(null,s);` Compare `w.store.extension.size` (1) with `r.read().store.extension` (`{}`). No renderer or unsafe metadata number is involved.

**Impact:** committed does not certify that returned state equals durable state; values accepted by the advertised conservative metadata validator can silently disappear. Rust accepts only `serde_json::Value`, so there is no equivalent Rust input behavior.

**Required fix:** reject non-JSON objects/sparse arrays, or normalize an explicitly documented input representation and return exactly that normalized snapshot. Prefer rejection for conservative F1. Validate final post-preservation state with the same strict JSON predicate. Add rejected-input and committed-return/read-equality tests; leave the game document codec separate.

### R3 — Medium / commit blocker: malformed CLR evidence becomes recognized DE

**Locations:** Node `game-profiles.js:56–69,133–140`; Rust `profiles.rs:95–121,336–355`. Existing PE tests: Node test file `56–66`; Rust `1082–1101`. Both layout loops pass all 19 fixtures, but omit these malformed declarations.

The inspectors check that 72 bytes can be found at the CLR directory RVA and `cb >= 72`. They do not bound declared directory length/`cb` against mapped data or inspect the CLR metadata directory/root. Each independent mutation below, on the shared managed fixture, still yields managed/IL-only evidence and **recognized DE in both backends**:

```js
const b = Buffer.from(fixture.binaries.managed.base64, 'base64');
const opt = b.readUInt32LE(0x3c) + 24;
b.writeUInt32LE(0xfffffff0, opt + 96 + 14 * 8 + 4); // directory beyond file
// Independently, on fresh copies:
// b.writeUInt32LE(0xfffffff0, 0x200); // cb beyond available header/file
// b.writeUInt32LE(0xfffffff0, 0x208); // impossible metadata RVA
// b.fill(0, 0x250, 0x254);           // erase BSJB metadata-root signature
```

Place mutated bytes at `DE_FILES[1]` in the unchanged shared `de-only` layout. Synthetic binary SHA-256 values:

- Oversize CLR directory: `e0db53dd985ad862bc9cedf142a537ac495274f2fd4fbed430d5051dc1dfdc61`.
- Oversize `cb`: `ce64e615b891668e6e92c4a23d61374b11baddf9e927f545ac80743cbff07cf0`.
- Invalid metadata RVA: `2dbbbd531c7c9051eb5b748c2c75a156a54e6d95afc7d0b53e6dd15995f30da2`.
- Erased signature: `cef1a87a318ccb41958d7af4fd88c8c5967153f4e058aa121c6a67e21d351b97`.

**Primary specification:** ECMA-335 sixth edition, Partition II §25.3.3 defines the CLI header and metadata RVA/size; §24.2.1 defines the metadata root/signature. [Official ECMA-335 PDF](https://www.ecma-international.org/wp-content/uploads/ECMA-335_6th_edition_june_2012.pdf). These structural checks are separate from game-version approval or full IL/runtime verification.

**Impact:** incomplete/corrupt assemblies pass the valid-managed-evidence gate. The inspected code has no out-of-bounds memory read and activates no service; this is recognition correctness.

**Required fix:** consistently validate mapped declared CLR/header ranges and basic mapped metadata-root evidence; return incomplete for malformed layouts. Keep binary version unknown. Add independent directory-length/`cb`, metadata-RVA/size and signature adversarial fixtures. A full CLR loader or game-version whitelist is not required.

### C1 — Low / nonblocking: suffix aliases are narrower than root aliases

**Locations:** Node `game-profiles.js:88–99`; Rust `profiles.rs:254–275`.

A junction named `mods-alias` pointing at a valid game's `ucp` directory is unknown in both backends; selecting the real `ucp` directory is recognized. Suffix stripping uses the lexical basename before canonicalization. Root junctions, normal `ucp/plugins` selections and tested ordinary case aliases work. This is a conservative false negative, not a wrong-edition selection. Narrow the alias claim or add canonical-suffix handling while preserving own-root-signature precedence. C1 need not block commit once R1–R3 are resolved.

## Protocol review and independently observed positive results

These conclusions come from source inspection and meaningful execution, not test counts alone:

- Both backends atomically create the same adjacent lock directory for **reads, writes and recovery**. Ordinary paths release it once; unlock failure after commit remains committed with a diagnostic. Age does not grant lock ownership. Node `238–247`; Rust `557–575,598–641`.
- State/CAS revision are checked under that lock. Missing uses null/None and initial revision zero; ready requires exact old revision and next +1. Corrupt, future, I/O-failed and recovery-required cannot become missing. Existing profiles cannot be deleted/retargeted; display paths may change. Node `223–264,365–376`; Rust `602–689,910–937`.
- The journal prepares fsynced exact before/after snapshots and a versioned SHA-256 manifest before displacement. Before `.transaction → .backup`, recovery rolls back; after the rename, backup represents committed after-state. The rename/return gap is an uncertain caller response, not a reason to undo committed selection. Node `267–340`; Rust `691–855`.
- Recovery validates the restoration source's hash/schema and checks pending canonical bytes against allowed before/after hashes. It refuses unexpected external canonical edits. Committed backup restoration only fills a missing canonical file, never a present corrupt/future store. Not all unused snapshot/`displaced.json` bytes are revalidated, but they do not supply restoration authority; I found no replacement defect from that fact.
- Supplied tests actually exercise competing Node/native processes, prepared/displaced/installed process exits, failed create/rename/rollback obstructions, real Windows sharing denial, corrupt recovery and external future edits. They are substantive process/filesystem checks.
- Added scratch probes cover **first-write** exits at prepared/displaced/installed followed by native recovery: all return to genuinely missing state. They terminate Node immediately **after the commit-directory rename**: native and Node reads retain revision 1. Another terminates recovery immediately after canonical unlink: native recovery retries and restores exact prior bytes.
- Unknown migration metadata, nested arrays, safe integer extremes, multilingual/emoji strings and an own `__proto__` extension survive a Node update omitting migration plus eight native CAS updates; revision advances 1→9 with extensions intact. This supplements generic future-field tests and does not negate R1/R2.
- Legacy settings are read only, including unsafe integer source text, and never reserialized. Migration follows only missing new state and a recognized Classic probe. Success remains inactive (`defaultProfileId:null`, empty `selectedByEdition`); failed persistence cannot activate. Node `342–361`; Rust `857–907`. Existing exact-byte legacy, unrelated-history/skin preservation and idempotence checks pass. Very large exponents/deep legacy extensions are not comprehensively covered across both legacy parsers; do not claim arbitrary legacy-JSON parser equivalence.
- All nineteen shared layouts are checked by both backends; the native test compares complete Node/native results and tree snapshots. Classic plain/UCP/Extreme/both, DE, mixed/incomplete, bad PE/CLR and unknown cases pass. `gp1` separates edition/root from fingerprint; tested root aliases canonicalize and ordinary Windows case variants converge. Version remains unknown; source revision is binary/UCP evidence, not an asset/config/loader manifest.

### Abandoned-lock recovery decision

**Accepted for this unexposed milestone; no unsafe age-based takeover requested.** Handoff09 gives a concrete offline path for ordinary process termination:

1. Stop and verify all Node/native hosts/writers, including helper/maintenance processes. PID age is not verification.
2. Inspect/preserve canonical, `.transaction`, `.backup` and lock artifacts in the explicit owned metadata directory. Remove only the verified abandoned **empty** lock directory. Never recursively delete an obstructed lock or unknown directory.
3. Instantiate the repository, call `recover()` when journal state requires it, then `read()` and inspect status. With no journal, removing a read-only/preflight lock can already yield ready/missing; recover's no-artifact result does not imply canonical corruption.
4. Partial manifests, corrupt snapshots, changed canonical bytes, obstructed locks and partially removed transactions remain fail-closed. Preserve/quarantine evidence under offline manual maintenance and validate retained canonical/candidate snapshots before explicit repair; the library does not automate that repair.

The supplied process tests reap the only synthetic writer before lock removal. Extra probes demonstrate rollback and committed-after crash states. That is sufficiently recoverable for a library with no live callers. **Before integration, F2 must provide and test a supported maintenance path, including partial-preflight/cleanup cases.** Users must not simply delete a lock while hosts may still run. No online stale-owner detection, automatic reclamation or recovery UI is claimed.

Files are fsynced, but Windows directory entries are not. Hardware power-loss/storage-cache durability is **unverified**, appropriately not claimed. A power-cut test or stronger hardware guarantee is not required to commit this unexposed process-recovery foundation after the correctness fixes.

## Checks and reproducibility

Independently executed successfully, with explicit Toolkit workdir:

```powershell
node --test --test-reporter=spec tests/game-profiles.test.js
$env:CARGO_TARGET_DIR = 'S:\Projects\UCP\de-research\toolkit-native-target'
cargo test --manifest-path src-tauri/Cargo.toml --lib --locked profiles:: --no-fail-fast
```

Results: **41/41 Node**, **19/19 native**, zero failed/skipped/ignored in the selections; 78 unrelated native tests filtered out. Native count includes the deliberately no-op `subprocess_worker` when no action env var is set. Node count includes nineteen nested layouts. This is not sixty independent feature-acceptance cases. No full baseline/build was run.

The standalone scratch Rust probe includes the exact current `profiles.rs` via `#[path=...]` and links existing built dependencies; it does not reimplement the code. Inline compiler arguments are retained in `review11-f1-r1\build-probe.ps1`. Invoking that `.ps1` itself was denied by execution policy; the same literal compiler command succeeded inline, without changing policy. `probe.rs` exposes read/probe/recover/parse and in-memory write-deep modes.

- Focused native test executable SHA-256: `c7b4d9d523f74ff6aac2e51555eaabc056f3fff4469bffccd76f58a4b342b92d`.
- Scratch `probe.exe` SHA-256: `4707817930985d959205f22064227fa64a321a87600fb60805174c5b2777d343`.

Retained scratch repros (each creates new owned synthetic directories):

```powershell
node 'S:\Projects\UCP\de-research\review11-f1-r1\probes.cjs'
node 'S:\Projects\UCP\de-research\review11-f1-r1\clr-probes.cjs'
node 'S:\Projects\UCP\de-research\review11-f1-r1\protocol-probes.cjs'
node 'S:\Projects\UCP\de-research\review11-f1-r1\migration-probe.cjs'
# probe.exe write-deep <fresh-existing-owned-metadata-directory>
```

`protocol-probes.log`, `migration-probe.log`, `clr-probes.log` and `rust-deep.log` retain added results. `probes.cjs` prints Node/native depth, surrogate, BOM and suffix-alias results; the minimal examples above suffice for permanent regression tests. No real game binary was used; R3 hashes identify synthetic evidence only.

## Separate F2 integration requirements

After F1 commit, these remain required; none authorizes wiring F1 into the current app prematurely:

1. **Window authority:** host-authenticated immutable context per editor, fresh epoch/generation, detached views bound to their owner. Capture root/config/capability/resources before queued work. Renderer roots/global defaults are not authority; reject mismatching legacy mutation roots.
2. **Activation/request IDs:** window-owned probe/prepared registries, serialized activation, store/context/probe checks, idempotent request/query after lost responses. Only explicit activation changes default and selected-by-edition together. Store commit can precede renderer acknowledgment; preserve that without double adoption. Generic CAS is not an activation IPC API.
3. **Source revalidation:** freshly verify canonical identity/binary evidence before adoption. Add resource/config/extractor manifests and operation leases. F1 fingerprint is not a complete filesystem snapshot or DE-service permission.
4. **Startup legacy candidate/default policy:** migration intentionally imports without a default. Specify how an existing Classic user binds at startup without losing that selection or persisting an explicit new default. A defensible policy is revalidate and bind the identifiable migrated candidate only to that startup window, without preference writes; unavailable/ambiguous stays standalone with diagnostics/selection. Do not guess from an arbitrary sole profile. Current migration records no candidate profile ID, so define reliable provenance or deliberately extend metadata before relying on it. Test imported/no-default, explicit default, unavailable candidate, cancellation, inherited windows and multiple roots. Startup/focus/close never rewrite preferences.
5. **Caches/resources/browser migration:** edition+profile+resource/config namespaces, Classic-only fallbacks, warm-cache/absolute-path handling, copy-on-missing browser keys with originals retained and incomplete-marker retries after partial localStorage failure. Guard publication/finally/error callbacks by owner epoch/generation and revision, including A→B→A.
6. **Transition acceptance:** freeze mutations, drain accepted writes, Save/Discard/Cancel under old document owners, revalidation, prepared adoption/rollback, stale-response rejection and startup readiness. Preserve document bytes/formats/paths and detached ownership. Actual native/Electron picker/mixed-window observations remain parent-owned acceptance.
7. **Supported maintenance:** offline recovery for abandoned locks and partial journal/cleanup obstructions; never substitute lock timeouts. Describe hardware durability accurately. DE algorithms/assets/package deployment remain unavailable until independent gates pass.

## Precise next bounded task

Assign one Sol 6.1 implementer the same F1 source/test/fixture/report09 ownership only: resolve **R1 common serialization domain**, **R2 strict Node JSON inputs**, and **R3 declared CLR/metadata bounds**, with shared/adversarial tests and corrected handoff claims. C1 may be fixed if bounded, otherwise document it. No live services/context/UI, formatter sweep, commits, CI or installed writes. Return hashes and focused results for a new independent review round. The coordinator owns central docs, acceptance and commit authority. This review contains no code fixes.

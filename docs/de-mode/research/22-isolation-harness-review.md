# Independent review of the offline A isolation harness

2026-10-22. Reviewer: Sol 6.1; no children. Initial checkout was
`de/separate-game-mode`, `b4b319fabed2d3464445b5fa567d3655f2fdf239`.
The shared checkout advanced through `a81faaad9c268adca7ea99b491ee9a51d161c26d`
to `757ba681f3d5400bbd1c59c6a193af4a8f0a260e` during review. This reviewer
made no commit and owns **only this report**.
Read the verbatim goal, working contract, plan, acceptance protocol, engineering
standard, and reports 13 and 15, including their qualifications.

**H** = `S:\Projects\UCP\de-research\isolation-harness-a`, inspected read-only.
**R** = `S:\Projects\UCP\de-research\review-isolation-harness\review-20261022T234610307`,
fresh reviewer-owned scratch. All terminal commands explicitly used Toolkit
workdir `S:\Projects\UCP\AI-Toolkit-DE`.

Only metadata readers/transformers, the cooperative helper and synthetic probes
were executed. No game code/native game DLL was loaded for execution, no real
game/app was launched, and no Steam Init/API/policy action, profile/registry/ACL
write, account/VM/service creation, dependency installation, commit or CI occurred.
Registry access was limited to checking the proposed new key's existence with
KEY_READ; no values were exported. Original package evidence was not overwritten.

## Disposition

**Accept the narrow offline result, with the defects below. Conditional GO for
one bounded, direct-EXE, vanilla single-player instrumented run after the finite
preflight below; NO-GO for launch from the present package state.** This is a
recommendation to the coordinator, not launch authority. `launchAllowed: false`
is correct, and remains false. No runtime acceptance row is closed here.

An independent writable environment is **not inherently required** for a
legitimate pinned game using stable, physically separate paths. The concrete
controls have useful preventive effects: engine identity replacement precedes
managed startup; managed roots are redirected before use; native save roots have
a checked bridge; account setters and Workshop calls are replaced before their
first managed execution. Positive raw-child/native/client bypasses establish
that these controls are cooperative. They do not establish that this particular
single-player workflow performs those bypasses against originals.

This does **not** waive Steam's separate boundary. Host Steam must already be
quiescent for this app, Cloud must be off before association, and the copied EXE
must start directly with its exact app-ID file/CWD. Do not use a library Launch,
`steam://run`, integrity verification, or a prerequisite original-library update
to get the test running. If that route requires an original game/Workshop update,
has pending/indeterminate app work, or cannot retain the scoped Cloud policy
without disrupting the user's client, **do not try it on the host**. The smallest
fallback is the independent environment described below. Quiescence is an entry
condition and observation, not an OS veto or a promise about all future client
activity.

I do not recommend another general handle-relative sandbox project before this
bounded workflow. It would address a stronger concurrent-attacker model and
would still leave early Unity and the existing Steam client untouched.

## Independently reproduced evidence

`R\summary.json`, `extra-results.json`, `commands.json` and the evidence index
are the entry points. Assertions were performed against actual bytes, not only
the implementation's success flags.

- All **71 indexed H files**, **15 input/tool pins**, and **15 source copies**
  matched their hashes. Each source copy was also compared to its exact pinned
  Git object, without checkout or ref changes. Serpens source pin remains
  `a23aa1b32276d670ffbb2a7b641d23b500d8e298`; SE remains
  `4014ca67c96974a5e6d697665baf5351cbfebde6`. SE binaries remain excluded.
- Recompiled the exact `Audit.cs` and `Instrument.cs` with the pinned existing
  compiler/Cecil/dnlib. A single `Guard.Base` literal was routed to R solely for
  fresh allowed targets/output routing; `routing-change.json` records that
  difference. No guard policy code changed. Two transform replays produced
  **exactly H's game-assembly output hash**,
  `1d7ec9bf0324413e5dda8863fc65cd0a2bd913ad519134d4c4d7885bdcce520c`.
- Fresh Cecil reads matched H's full before/after method records. Confirmed
  **195 edits / 55 changed original methods / 8,083 unchanged original methods /
  13 added stubs**, all original method tokens preserved, and no unlisted
  changed method. A separate Python PE/body-span parser recomputed all 8,138
  before/after raw-body hashes, including headers and exception sections.
  This count includes methods without IL bodies; it is not 8,138 executed bodies.
- All **12 audited game-side licensing methods** retained raw bytes and call
  targets; all **84 P/Invoke declarations** matched. Original EXE, UnityPlayer,
  native simulation, genuine native Steam DLL and Steamworks.NET hashes matched.
  No fake initialized flag, substitute Steam DLL or licensing bypass was found.
  This is unchanged authentication code, not proof that licensed startup works.
- Confirmed zero remaining direct persistent getters and direct account/UGC
  mutation calls in the transformed game assembly. Replayed the independent
  **79 redirect/IO signature / 98 mutation stack-shape** check. This is metadata
  compatibility evidence, not a complete Mono verifier or runtime execution.
- Reparsed the **18 Unity objects**, checked the two exact metadata edits and
  app.info coherence, all **17 other objects** unchanged, and byte-exact reverse
  restoration. Confirmed the reported metadata/app.info output hashes. Replayed
  all **five** wrong-hash/count refusals, including preservation of an existing
  managed output on the two transformer failures.
- Recompiled/reran `GuardTests.cs` against the policy-identical routed helper:
  **51 checks, zero failures**, synthetic protected tree unchanged. Actual
  junction/hardlink, allowed deletion, recursive denial, cooperative child and
  positive uncovered-path probes ran only in R. The seven registry checks call
  a throwing facade; they perform no registry operations and prove no native
  PlayerPrefs containment.
- Additional tests below used an **exact copy of the packaged guard DLL**, SHA
  `a567fa8c2f53554bf57fe541c1e9d4cf9b0f9898a480d97dcea5b80bb28ca6a2`,
  rather than the routed rebuild. An end-of-review recheck retained H's seal.

Existing SDK identities were retained: dnlib **4.5.0**, NuGet package SHA
`63bc2f9579568204cc8b30fa9f6700a231bcf868a8032e09118887af3eafee58`,
DLL SHA `97ef5328d1d1703924c48d9cd1d45b7227fe3836e116dcded623b6a0dbd52c23`;
Cecil SHA `7ae470288fff4a402899c254d0a76cefef55877f5c54f96e83c797cc5bb6e2f6`;
UnityPy **1.24.2** from the existing pydeps, bytecode writes disabled; compiler
SHA `eca02e6b15cde93009a59a3d129d5a77fb5008f2e1cf62cf573b6737c747ecc3`.
No SDK, loader, game or library update was substituted during review.

## Severity-ranked reproducible defects

### Medium: the stream rewrite rejects the game's memory-only compression

`H\Instrument.cs:51` rewrites both `Stream.Write` sites in
`Platform_Multiplayer.Compress`. The second receiver is a **DeflateStream over a
MemoryStream**. `H\Guard.cs:51-58,82` permits FileStream or MemoryStream and throws
`UnauthorizedAccessException("unknown writable stream type")` for that receiver.
Signature/stack checks cannot detect this behavioral regression.

Reproduction: `R\CompressionProbe.cs`, compiled against the exact packaged
helper, performs the same memory/deflate writes. Ordinary compression succeeds;
the guarded variant throws. `compression-probe.json` records both outcomes.
Pinned `Platform_Multiplayer.cs:1933-1941` and the exact transform manifest
identify the receiver/site. This review found no direct caller of Compress or
Decompress in the pinned game assembly, so it does not invent a failure in the
selected single-player path. Multiplayer/compression compatibility is unverified
and this helper must not be advertised as behavior-preserving there. Excluding
that unused path is proportionate for the first run; a later owner can resolve
the regression before testing a consumer. No fix was made here.

### Low for this run, preservation-relevant if broadened: handle inspection can flush before denial

`H\Guard.cs:53` reads `FileStream.SafeFileHandle` **before** destination validation.
On the tested .NET Framework this flushes pending managed writes. A protected
pre-opened stream with a dirty buffer can therefore modify its file during a
guard call which ultimately throws.

Reproduction: `R\OriginalGuardProbe.cs` opens a scratch sentinel, queues one raw
buffered byte, verifies through a shared reader that disk still says `preserve`,
then calls packaged `Guard.StreamWrite`. It denies, but a shared read immediately
after denial says **`Xreserve`**. See
`buffered-stream-probe-2\result.json`. The earlier exploratory probe used an
incompatible reader sharing mode and is not passing evidence.

The raw queued write deliberately originates outside the guard. This disproves
a broad claim of side-effect-free denial for arbitrary pre-opened FileStreams;
it is not evidence of such a stream in this game's selected workflow. The two
actual Stream.Write receivers belong to the memory compression method above;
the CopyTo destination is memory. All four direct FileStream constructors are
rewritten, and no dirty protected FileStream entry was identified. Keep arbitrary
pre-opened handles out of the actual launch/inputs; do not require a new OS
sandbox solely to handle a source not present in the proposed run.

No reproducible original-path escape was found for the actual stable managed
path operations within the stated scope. That is a scoped result, not a proof
about reflection, native calls, arbitrary stream subclasses or concurrent links.

## Startup, native and dependency assessment

I inspected actual metadata for **all 108 installed managed DLLs**, including
runtime-initializer attributes; `boundary-audit.json` pins every file and records
the selected call sites/IL. Also read native imports/selected strings without
loading code, including the nested Chromium support DLLs and `.vuplex` worker
(`native-imports.json`). These scans are inventories, not whole-program proofs.

**Early Unity:** the equal-length company/product edits plus coherent app.info
are a concrete engine identity control. Unity 2021.3 documents company/product
Windows storage and PlayerPrefs identities. The predicted new LocalLow directory
and exact HKCU key were both absent at this review's read-only check
(`runtime-path-existence.json`). Their future ownership must be included in the
run manifest; the S: managed profile is a separate location. Use the prepared
absolute log/crash arguments and child-local TEMP/TMP pointed to owned scratch;
do not change the user's global environment. Actual effective temporary/cache
and crash paths still need observation. The temporary-cache API does not document
a precise Windows path, so do not invent one. [Unity persistent storage][U-PATH],
[PlayerPrefs][U-PREFS], [logs/crashes][U-LOG], [temporary cache][U-TEMP].

**Known native simulation roots:** checked the pinned native SetPath consumer,
RVA `0x876F0`, and setters `0xAE90`, `0x26BE0`, `0x26C80`. They copy the streaming,
MP-autosave and save-directory UTF-16 inputs into native storage; the first has
a byte-length bound below 1000, the other two below 2000. Exact proposed paths
fit. The save consumers at `0x13030` and `0x13480` use the resulting native globals
`DAT_1888e3d94` / `DAT_1888e4564` to construct autosave/save paths. Saved slices and
original source line numbers are in `native-root-slices.json`.

Native SetPath's one-time initialization precedes the copies. The inspected init
callee `0x10A0E0` initializes tables, while `0x516A0` is empty in this decompilation;
I found no original-profile write in those callees. The inspected native semantic
source has no named LocalLow/Firefly/registry/process-launch reference. Its PE
imports include CreateFileW/WriteFile/GetTempPathW, not a direct profile-folder or
registry API. **These facts support the configured roots; they do not certify all
native write sinks.** Keep CWD/resources inside the physical copy and obtain
actual bridge/path/save evidence before crediting gameplay. Native filename
arguments must be fresh simple owned names, not user-supplied absolute/traversal
paths. [Pinned managed/native entry][NATIVE].

**A concrete child/dependency, not an imaginary arbitrary program:** installed
`Vuplex.WebView.dll` SHA
`b4f62b575569a6c7ee32ae01fd52e51c1b4153d98b4c2ce58333990bd4d1194c`
has an attributed runtime initializer `StandaloneWebView._initializePlugin`.
Its IL calls native initialization, then `_getCachePath` / `_setCachePath`.
The default is Unity persistentDataPath + `Vuplex.WebView\chromium-cache`.
That direct getter is outside the 19 game-assembly redirects, but follows the
changed **engine** identity. The native plugin imports CreateProcessW and the
shipped `.vuplex` worker exists. Actual browser-child timing/cache behavior is
unobserved, not zero. Record its identity/path if started; do not exercise Help,
external browser/store, download, PDF, newsletter or multiplayer UI in the first
single-player run. Downloads/PDF helpers use temporaryCachePath, another reason
to record effective temp paths rather than promising everything writes to S:.

Other concrete dependency sinks include UnityNativeTool crash-log file APIs and
InputSystem trace-file output; no direct game calls to those features were found.
Framework/engine API declarations alone are not evidence that the game writes
original profiles through them. No original hard-coded profile literal or direct
Registry/PlayerPrefs mutation call was found in the non-framework dependency
scan. This reduces a specific uncertainty; it does not erase native internals.

**Scope consequence:** no evidence here requires hostile-code confinement,
concurrent-reparse resistance, arbitrary broker access denial or a ban on every
shared graphics/client cache. Fresh path checks and a stable owned copy are
appropriate for the authorized test. Conversely, an observed child/native write
to the original game/profile/PlayerPrefs/mod inputs is a preservation failure;
it cannot be excused as an ordinary cache or repaired by a watcher after the fact.

## Steam controls and the actual remaining preservation risk

The fourteen original Auto-Cloud rules do not change with Unity metadata.
Use Steam's supported **per-game Cloud checkbox, off before any game/helper/SE
Init or association**, with its exact prior state recorded. Cloud's before/after
session synchronization is a concrete original-save risk. Do not invoke Init to
query a boolean before the pre-Init policy has been established. A later read-only
IsCloudEnabledForApp check can corroborate the UI; it cannot protect earlier
events. Never edit VDFs or use a global toggle. [Valve Cloud][V-CLOUD].

The exact copy-local `steam_appid.txt` plus exact CWD is the supported way to avoid
RestartAppIfNecessary handing control to the original library executable. It does
not isolate Cloud, Workshop or the account. Genuine Init/ownership checks remain
necessary. [Valve restart/initialization][V-INIT].

**Workshop ordering is not solved by empty game enumeration.** Valve documents
that a Steam-managed launch can update installed Workshop items before starting
the game, then download newly subscribed items in the background. The direct-EXE
route avoids requesting that documented library-launch path; documentation does
**not** guarantee that direct Init can never cause client work. Current queue,
update and conflict evidence is therefore required in addition to the old ACF
snapshot. The existing installed app Workshop item makes this a real preservation
surface, not an arbitrary-client thought experiment. [Valve installation order][V-WORKSHOP].

`ISteamUGC.SuspendDownloads(true)` is a supported ongoing-session control, but
requires initialized interfaces, affects all Workshop downloads, and ends with the
session. It is not implemented/called in H and cannot be credited against
pre-Init/in-flight work. Do not add it automatically if it interferes with the
user's unrelated downloads. Empty enumeration also avoids GetItemInstallInfo's
documented used-item side effect. [Valve UGC][V-UGC].

Under a direct launch with no pending app work, no SE/updater, no remaining
game-side UGC requests, early account setter suppression and pre-associated
Cloud false, A is proportionate for the narrow run. It does not guarantee a
byte-static Steam client under every future remote update. If concrete preflight
cannot establish that state, or the client demands a library-managed update,
the host route fails the gate; use the independent environment rather than
declaring a late suspension/backup preventive. Do not perform a risky Init-only
host experiment merely to manufacture a missing preservation guarantee.

Ordinary licensed authentication, presence, rich presence, last-played/playtime,
and routine client logs are distinct from test-origin save/progress/subscription
changes. No separate licensed account is required merely to hide those ordinary
signals. Achievement/stat setters and leaderboard uploads remain suppressed;
resetting account stats afterward is not acceptable recovery.

**Authorization assessment:** isolated testing, community loaders and idle-time
game launch are already authorized; do not ask those questions again. Temporary,
reversible **app-only** Cloud-off is proportionate preparation for that purpose,
not a reason to seek global policy authority. This task was expressly offline,
so it made no change. If Cloud is already off, preserve it: no preference choice
remains. If it is on, the record has no explicit app-specific selection; the
coordinator owns whether standing authority covers the supported UI transition.
If a distinct selection is needed, the only conditional preference is temporary
**3024040 Cloud on -> off -> prior state**, with the concrete snapshot/restore
plan. Valve's SetCloudEnabledForApp API additionally requires an explicit user
request; do not use that API to bypass a missing choice. No question is asked
by this reviewer. [Valve Cloud-setting API][V-CLOUD-API].

## Finite path to the first real acceptance evidence

One bounded copy/preflight/startup assignment is the next action. It should not
be another general guard redesign. The following are **remaining gates**, not
claims that they were executed here.

1. **Prepare a fresh run instance without modifying H's evidence.** H's proposed
   `owned\profile\tests` already contains three synthetic fixture runs, including
   links. It is not a fresh game profile. Use a new owned runtime instance and
   coherently pin its helper constants, transformed artifacts, launch/snapshot
   plan and engine namespace. Re-run the exact offline refusals/signature/raw-body
   checks for those bytes. Reject path/identity collisions, including an existing
   engine LocalLow/PlayerPrefs namespace. Do not delete H's tests to make it look
   fresh or silently relocate a fixed-root helper.
2. **Seal the physical copy and paths.** Ordinary copies, no hardlinks/reparse
   entries, full recursive source/destination manifest including all executable
   dependencies and Chromium worker/support files, exact EXE/CWD/app-ID bytes,
   matching game build, helper and metadata. Verify fresh file IDs/link counts
   and every existing ancestor for copy/profile/log/crash/temp/engine roots;
   validate all descendants that native/children may use. Confirm native path
   byte bounds. No BepInEx/SE/Fixes/unreviewed DLL addition in this vanilla stage.
   Preserve Classic editor/settings and originals in the protected inventory.
3. **Record recoverable scoped state, then resolve Steam before association.**
   Make and verify real recovery copies of the original profile, exact PlayerPrefs
   key/presence and app Workshop/bookkeeping (inventory-only is not backup).
   Record the supported Cloud checkbox/prior state; require resulting false,
   no active DE session, no sync/conflict, and no pending/in-flight app depot or
   Workshop install/update. Use UI/app-specific client logs/state, not stale ACF
   flags alone. Any unresolved original-library update or conflicting device
   session defers this host run. Do not restart/suspend/close the user's client
   or unsubscribe items to force a passing preflight.
4. **Add bounded observable startup assertions to the owned run, then seal them.**
   Current Guard returns/checks paths but does not log successful roots or bridge
   arguments. Record helper/module identities, company/product, Unity engine
   persistent/temp/crash paths, data/StreamingAssets, actual CWD, all ConfigSettings
   roots and the three SetPath strings **before forwarding**. Record account
   suppression counts and any child image/cache paths. A failed required assertion
   must stop the owned run, not merely throw into a Unity callback and let later
   gameplay continue. Keep authentication bodies intact and audit this small
   diagnostic delta. These checks establish runtime evidence; they do not
   retroactively prevent an earlier unknown write.
5. **Coordinator performs its fresh activity/process gate and bounded startup/exit.**
   Direct copied EXE only, no inherited application data handles, child-local
   TEMP/TMP, explicit owned logs/crashes, genuine successful licensed Init.
   Observe from process creation, including pre-managed file/registry/child
   events and app-specific Steam activity. Stop the owned run on an unexpected
   original-target write, foreign module/child root, failed path assertion or
   unexplained client install. A watcher is detection, not a preventive sandbox.
   First compare preservation after startup/exit before increasing the exercise.
6. **Then run the representative single-player package case.** Use a known-good
   pinned lord/castle fixture with uniquely named owned media and a simple owned
   save filename. Observe actual discovery/resolved assets, construction/features,
   portrait/speech/video and save/reload through the checked native roots, per
   acceptance protocol 04. No multiplayer/Workshop/browser/UI side paths; SE's
   released assembly/root/early-Init/updater review is a separate later stage.
   Record failures and limits; instrumented gameplay is neither unmodified-game
   acceptance nor proof of SE/Classic compatibility.

Fresh paths and the stated workflow avoid the demonstrated dirty-handle and
concurrent-link cases. If a required real path or child cannot be tied to those
owned identities, stop this finite attempt and select the environment fallback;
do not broaden the claim to get a green result.

## Restoration and fallback

After each owned run: close only its processes/children/handles; retain Cloud off;
compare protected game/profile/PlayerPrefs/Workshop/Classic identities with the
fresh baseline, attributing unrelated client bookkeeping separately. Keep logs,
observations, suppression counts and test saves. Investigate any original change
or sync conflict before restoring anything; do not overwrite newer user data.

Only after preservation passes, restore **only** the changed per-app Cloud UI
setting to its recorded value and observe sync/conflict outcome. Initially off
stays off. Do not reset stats, auto-resolve conflicts, bulk-restore Steam config
or blindly resume unrelated downloads. Retain evidence if restoration is uncertain.
Remove/revert only unchanged manifest-owned copy files and newly owned engine
namespace artifacts after handles close and identity/hash checks pass; preserve
changed/foreign files. No originals currently need restoration from this review.

If the host Steam/path gates cannot be met, the smallest concrete prerequisite is
**one independently writable graphical Windows/Steam test context with no writable
mapping to the original host game, saves, PlayerPrefs, Workshop or Classic data**.
An existing suitable VM/checkpoint or another isolated machine qualifies; a copied
directory or same-client second account label does not establish that boundary.
It needs enough disk/graphics and legitimate ownership. The same licensed account
can suffice with app Cloud off and early progress/subscription suppression;
ordinary playtime is still possible. That environment contains launch-triggered
local updates in its own library. No new account, VM, service, token or ACL setup
is requested or authorized by this report. Restricted-token B remains rejected.

## Tooling and product ownership

This work belongs to **external acceptance tooling**. Pinned metadata transforms,
raw-method evidence and fresh synthetic checks are proportionate and useful;
dnlib/Cecil/UnityPy/Guard are not Toolkit shipping dependencies or a game installer
policy. Do not make this one-machine instrumentation the production DE loader.

Keep the run manifest authoritative for concrete roots/artifact versions when
preparing the runtime instance; currently the same fixed root appears in helper,
scripts and plans, so arbitrary relocation is unsafe. This calls for one coherent
run preparation, not a reusable sandbox framework. Synthetic-only helper APIs
(registry facade, Move/Replace/SetLength, etc.) must remain distinguished from
actual rewritten game sites. Their test counts do not enlarge runtime coverage.

The coordinator owns authorization interpretation, real activity checks, final
launch decision, central acceptance records and sequencing. The next owner should
return a sealed fresh copy/preflight plus one observed startup/exit, then the
representative single-player workflow if its first preservation check passes.
This review supplies no automatic launch or implementation-fix authority.

## Evidence and reproduction entry points

All review-owned evidence is under R. `independent_review.py` reproduces the
package/input/source checks, exact source builds, deterministic managed transform,
negative managed cases, licensing/raw records and routed 51-test run.
`extra_checks.py` independently parses raw method spans, replays Unity metadata
checks/three refusals and relocates the signature audit. To repeat, copy these
scripts into **fresh owned scratch** first: they deliberately use their own
directory and refuse already-created run subdirectories. Do not execute H/run.py
against its original evidence for this review.

`BoundaryAudit.cs`/`boundary-audit.json` contain metadata-only dependency/initializer
inspection. `native-imports.json` and `native-root-slices.json` retain the native
observations. `CompressionProbe.cs` and `OriginalGuardProbe.cs` compile with the
pinned csc, reference an unchanged copy of H/OfflineA.Guard.dll located beside
their EXEs, and accept only output/target locations in fresh scratch. Results are
`compression-probe.json` and `buffered-stream-probe-2/result.json`. All probes
executed with explicit Toolkit workdir. Documentation HTML captures and hashes
are in `documentation/manifest.json`; pages below were rechecked 2026-10-22 and
are unversioned where the publisher provides no immutable revision.

[U-PATH]: https://docs.unity3d.com/2021.3/Documentation/ScriptReference/Application-persistentDataPath.html
[U-PREFS]: https://docs.unity3d.com/2021.3/Documentation/ScriptReference/PlayerPrefs.html
[U-LOG]: https://docs.unity3d.com/2021.3/Documentation/Manual/LogFiles.html
[U-TEMP]: https://docs.unity3d.com/2021.3/Documentation/ScriptReference/Application-temporaryCachePath.html
[NATIVE]: https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/a23aa1b32276d670ffbb2a7b641d23b500d8e298/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/exports/semantic-decompiled-functions.c#L79013-L79036
[V-INIT]: https://partner.steamgames.com/doc/api/steam_api#SteamAPI_RestartAppIfNecessary
[V-CLOUD]: https://partner.steamgames.com/doc/features/cloud
[V-CLOUD-API]: https://partner.steamgames.com/doc/api/ISteamRemoteStorage#SetCloudEnabledForApp
[V-UGC]: https://partner.steamgames.com/doc/api/ISteamUGC#SuspendDownloads
[V-WORKSHOP]: https://partner.steamgames.com/doc/features/workshop/implementation#ItemInstallation

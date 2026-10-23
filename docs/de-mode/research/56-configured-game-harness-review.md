# Configured game harness and owned installation plan: independent review

23 October 2026. Sol6.1; no children. Read the exact goal00, contract01, plan02
and standard05 first, then full acceptance04, reports15/22/41/46/55 and the
performance/native-parity contracts. The resumed full goal remains authoritative.
This is shared-checkout review, not worktree isolation. Only this report is owned
inside Git; all reviewer sources, metadata and synthetic evidence are under
`S:/Projects/UCP/de-research/review-configured-game-harness-r1` (**S**).

Initial HEAD was `9f0c66e43f1be8f1dd7f9c138f4ce7b470260168`; the measured review
ran at `657dbb339d439629cffa50d47567e1d24c7a6649`; final handoff HEAD was
`14a5884cfd6943be3433b1aa6c60e6a90186dbb6`, branch `de/separate-game-mode`.
Those advances were coordinator work. Every Toolkit terminal call explicitly
used `S:/Projects/UCP/AI-Toolkit-DE` as workdir. No commit/reset/staging occurred.

**H** = `S:/Projects/UCP/de-research/isolation-harness-a`.
**P** = `S:/Projects/UCP/de-research/game-acceptance-preflight-20261023-r1-prepared`.
**R** = `P/relocated-harness-r1`; physical copy = `P/game-original-copy`.

## Disposition

**GO for the configured offline artifacts and concrete reversible copy-install
plan, and for preparing the finite observed startup. NO-GO for launching the
current unobserved configuration.** No new blocking artifact defect was found.
`artifactsInstalled`, `gameLaunched` and `launchAllowed` correctly remain false.
Nothing was installed or launched. This review supplies no Steam/activity gate
and closes no real-game, package, media, loader or Classic acceptance criterion.

Review22's accepted direct copied-EXE, vanilla single-player route remains
proportionate. There is no new blanket approval, OS sandbox or VM-project gate.
Standing isolated idle-time launch authority remains intact; root owns its real
activity/Steam checks and execution. First observe startup/exit preservation;
the representative exported AI workflow follows only after that passes.

## Fresh verification and exact pins

`S/summary.json`, `method-check.json`, `paths-plan-check.json`, `commands.json`
and `handoff-seal.json` are the evidence entry points. `first-pins.json` and
`final-pins.json` match exactly; the later handoff seal rechecked those same
configured inputs and the five target states. Important **first = final** SHA-256:

- `R/configured-receipt.json`:
  `9abb447bf233b0d1f7cd71be31c1aa24e4355c25b881bcb7a974cb950668e036`.
- `R/owned-install-plan-r1.json`:
  `6bf3c6380c38f7ce8381292f1decd4a5f8637d1d3b011056c91c6cdb5565cf2b`.
- `R/run-manifest.json`:
  `818beba60fa38260e156768421542a11844173d3cb674dcd9eeef3a6c2eb47b1`.
- Configured `Guard.cs`:
  `523069a33f4c7b53ea31aad7a1cf5fe7fd3964ac3db77f426f615c66cfb2d524`;
  configured `OfflineA.Guard.dll`:
  `74abc264e1c937d7bec7b9c48383181d4142b1759a151d359ac069fe202278ec`.
- Unchanged `Instrument.cs`:
  `9dd831aa732ebf1aa32714f9f4ce4e99fc43bbe562ccc32e09fe0efbb3c1afe9`;
  unchanged `Audit.cs`:
  `a9be6e7a4678bb85aaced8ab6df13f9d539e35843f4bf3db9315b0746afb2583`.
- Managed output:
  `1d7ec9bf0324413e5dda8863fc65cd0a2bd913ad519134d4c4d7885bdcce520c`;
  engine metadata output:
  `1ac3b8f4f3bf522a8b13e4acaeb72d218becd465dfd0c3317815ae5d2347ed3f`;
  app.info output:
  `90b3cbaf7e11c7ea8a94d469ee50dc3098d8f42d567ed3f3224c369aadaa8d9f`.
- Root preparation / verification / plan source scripts respectively:
  `b07bb013c1836903e75189b6361794599d7f598a67cc2a192d66637d90ea200d`,
  `77bd3b0e7e878c161bec2b2365dcd56f9f56bcb4f0ee3a17cac6bdaa23946288`,
  `86b5e7767e44e69453ff5eaee82f68c739cef6380232ac7bd980935499990994`.

**Fresh:** all37 configured receipt entries match their sizes/hashes, including
the provenance relabel. `receipt.json` is explicitly historical; no claim relies
on treating its former runnable-source filename as current. The copied old
runner is only `provenance/pinned-run-source.py`; neither its main nor either
preparation script was rerun against retained evidence.

**Fresh/source-confirmed:** applying exactly the three recorded Base/Profile/
CopyRoot declaration replacements to H's pinned Guard source yields the entire
current source, with no other policy change. Instrument/Audit/Cecil/dnlib and
historical runner bytes match H. All15 retained primary-source copies also
match their exact local Git objects: Serpens
`a23aa1b32276d670ffbb2a7b641d23b500d8e298` and SE
`4014ca67c96974a5e6d697665baf5351cbfebde6`.
`S/source-pin-check.json` retains each path, hash, pin and primary URL.

**Fresh:** independently compiled the pinned Cecil reader, read the original
copy assembly and transformed artifact as metadata, and matched the complete
configured before/after records. A separate Python PE/body-span parser checked
raw body and IL hashes for16,289 before/after method records. Confirmed195sites,
55 changed original methods,8,083 unchanged originals,13 added stubs, preserved
original tokens, all12 audited licensing bodies **and call records** unchanged,
and all84 P/Invoke declarations unchanged. No direct game-assembly persistent
getter remains. No game/Unity/Steam assembly was loaded for CLR execution.

**Fresh:** transformed assembly, globalgamemanagers and app.info are byte-equal
to H's independently reviewed artifacts. **Inherited:** Review22's full18-object
Unity reparse/reversal, five refusal cases,79 IO/redirect signatures and98 mutation
stack-shape checks therefore apply to these same bytes; they were not rerun or
renamed fresh here. The unchanged authentication code is no proof of successful
licensed startup, and metadata verification is no full Mono verifier.

**Fresh:** a scratch-owned probe using an exact copy of the configured helper
passed31 metadata/synthetic assertions: helper identity and referenced API
signatures, configured constants, persistent/slash roots, bridge acceptance and
wrong-root denial, representative invalid paths, registry-facade denial,
scratch-sentinel preservation and an in-memory write. All probe writes stayed
inside S; it made no configured-profile writes. **Inherited:** root's17 relocation
smokes and prior51 guard checks retain their original scope; these counts are
not pooled into a broader runtime guarantee.

## Containment, installation and reversal

**Fresh:** all nine critical copy inputs match the reviewed hashes, including
the EXE `8acea6d11af81cf26b035a479ba633bdb0d09513742055f3f46330d72b2f203a`,
native `fbcb93195fc7efca9bdac5204852efdd76f9818f59a6711750d77c9cef2831e2`,
genuine native Steam DLL and Steamworks.NET. Also rehashed13 Vuplex managed/
worker/support files against Report41's copy manifest, including the actual
`.vuplex` image. No code in those files was executed.

A fresh stat/path scan found the expected4,702files,51directories and
6,730,673,704bytes, without new entries, reparse points or multiply linked files.
All existing relevant ancestors resolve ordinarily. **Inherited:** full copied
content parity remains Report41's evidence; this review did not rehash6.7GB or
claim resistance to timestamp-preserving concurrent changes. No loader addition
was present relative to that sealed vanilla copy inventory.

The five destinations exactly match the plan: three overwrites (managed assembly,
globalgamemanagers, app.info), plus currently absent Guard/app-ID additions.
All source/old/new hashes match; the three overwrite backup paths are distinct
under the absent `R/owned-install-backups-r1`, outside the copy and separate from
original-profile recovery. No destination or rollback path names the installed
game, original profile, Steam bookkeeping or Classic. No unowned write is
authorized by this plan. Actual backup/staging writes must also stay in the
named owned tree.

EXE and CWD are exactly the manifest's physical copy. Prepared app-ID bytes are
`33 30 32 34 30 34 30 0a` (`3024040\n`), SHA
`e673a03b59a73c3fab5cfe0b80c815d24e625ca1cb3107b5bfd89d6c578b6ca9`.
The empty managed profile, absent engine directory and absent exact HKCU engine
key were freshly checked; registry access was KEY_READ only. Engine identity is
`Toolkit DE LabA / AIToolkit DE Offline AXXXXXXXXXXXXXXXX`, separately owned from
the S: managed profile. Recheck collisions at launch; current absence is not a
future claim.

**Root's installation execution obligation:** revalidate identities/collisions,
create the new backup root exclusively, copy and verify all three old files
before the first replacement, and retain a small per-operation progress record.
Stage replacements under owned ordinary paths, recheck target/source identities
and hashes immediately before replacement, then verify each result. The plan is
data, not an already tested installer; no actual backup/install/rollback ran here.

For interruption/reversal, classify **each** target: expected after-hash means
restore its verified copy-only backup or remove its unchanged owned addition;
expected before-hash, or absent never-added file, means leave it alone. Anything
else stops that operation for investigation. These distinct states discriminate
all32 before/after mixtures, including every partial-install prefix. Do not
require all five targets to be installed before recovery; do not overwrite a
changed file or reuse old backup evidence. Temporary staging and journal paths
also need explicit ownership. This is a finite execution detail, not a demand
for a new general installer framework or another unchanged-artifact review.

## Remaining findings and finite startup gate

**Medium, already-open run gate — missing successful-path/early-runtime evidence.**
Exact witness: `R/Guard.cs:60-66` validates/returns roots and bridge inputs but
records no successes; `run-manifest.json.remaining` explicitly leaves observers
and effective paths open. A caught Unity callback exception also need not stop
later gameplay. Owner: root's acceptance tooling. Smallest correction is one
bounded startup observation/assertion delta and one process-creation-to-exit
capture, sealed with updated hashes if bytes change. No product dependency or
research daemon is needed.

A source-bound implementation can log each distinct validated return once in
`Guard.PersistentRoot` / `ManagedRoot`, and the three raw and canonical strings
inside `Bridge` **before** `EngineInterface.sendPath` forwards/encodes them
(pinned `EngineInterface.cs:4018-4029`). Use an owned observation path, for example
`R/owned/profile/observations/startup.jsonl`, declared in the run manifest.
Add one small startup caller using existing Unity references to record the real
engine APIs; Guard alone cannot observe unredirected Unity paths. Identify this
diagnostic delta separately from the present unchanged195-site artifact.

Minimum fields/observations are:

1. Run ID, UTC/monotonic order, PID/creation identity, actual image/CWD, module
   identities, expected-manifest identity and helper load. Hash large inputs
   externally once, never repeatedly in a callback. Record company/product,
   Unity version, actual `dataPath`/`streamingAssetsPath`, unredirected engine
   `persistentDataPath`, `temporaryCachePath`, OS effective temp and child-local
   TEMP/TMP, plus actual log/crash outputs. The engine persistent root must be
   the new LocalLow identity; the managed root must be the distinct S: profile.
2. Actual ConfigSettings return values and checked bridge strings before native
   use. Any one-time diagnostic getter evaluation must be source-bound:
   `GetSettingsFileName(false)` is observational; **true creates paths and copies
   ReadMe.txt** (`ConfigSettings.cs:2556-2611`) and must not be invoked merely to
   collect evidence. Other unused paths can be labeled expected/unobserved rather
   than falsely reported as consumed. ConfigSettings-derived startup writes must
   resolve under the owned profile. Bridge UTF-16 byte lengths are306/232/230
   for StreamingAssets/MP-auto directory/save directory, within the inherited
   native bounds below1000/2000/2000. Record originals and normalization; preserve
   the valid MP directory's trailing slash.
3. Start OS file/registry/image/process observation **before process creation**,
   covering early Unity and native code, exact copied process and descendants,
   and protected-target writes. Record any `.vuplex` child's image, parent,
   creation identity, command line and actual cache/temp roots. Its concrete
   expected cache follows the engine root under
   `Vuplex.WebView/chromium-cache`; absence of a child is an observation too.
   Verify native modules come from the copy; generic API imports are not proof
   of actual writes. Observe the registry namespace and effective caches rather
   than assuming every output lives on S:.
4. Required mismatch or missing readiness must stop the exact owned run through
   its bounded launcher/controller, with PID/creation or process/job handles;
   a logged exception alone is insufficient. Own/reap all descendants after
   success, failure, timeout or cancellation. Record account-suppression counts
   at shutdown. Keep logging bounded to startup/distinct paths/bridge/exit, not
   per-frame instrumentation or heavy IPC.

**Medium, root-only launch gate — current Steam and preservation state.** Exact
witness: `cloudPolicyEstablished:false`; Report41 backups are preparation-time,
not fresh launch-time state. Before association/Init, root must refresh scoped
original-profile/PlayerPrefs-presence-and-key/Workshop/bookkeeping recovery and
protected game/Classic inventories, verify original source pins, then establish
supported Steam **app3024040 Cloud off**, recording the prior state and a fresh
matching UI observation. There must be no active DE game, sync/conflict or
pending/in-flight app depot/Workshop work. Old ACF flags or the mismatched prior
background captures prove none of this. No global toggle, VDF edit, Steam restart,
subscription change or SetCloudEnabledForApp substitute is needed or authorized.

Immediately before the bounded run, root checks user activity and exact relevant
processes, supplies child-local TEMP/TMP, explicit owned logs/crashes, direct
copied EXE/CWD/app-ID and no arbitrary inherited application-data handles.
Successful genuine licensed initialization must be observed. No SE/Fixes,
multiplayer, browser/Help/store/download or Workshop UI is in this first exercise.
An unresolved queue, demanded original-library update, path/child ownership failure
or disruptive client prerequisite fails the host gate; use the already accepted
independently writable environment fallback. Do not invent another permission
flow or force the user's client into a passing state.

On owned startup/exit, stop for unexpected original-target writes, foreign
modules/children, failed assertions or unexplained app installation. Keep Cloud
off while comparing protected before/after bytes, PlayerPrefs tree/presence,
Workshop/subscription/bookkeeping and Classic. Attribute ordinary licensed
playtime/presence/client logs separately; do not excuse save/progress/subscription
changes as logs. Close/reap owned processes and descendants, preserve evidence,
and only after preservation passes restore a changed app-only Cloud checkbox to
its recorded state and observe resulting sync/conflict. Initially off stays off;
never reset account stats or blindly restore newer user files.

**Inherited scoped defects, unchanged:** Guard's unknown-stream rejection still
breaks the memory-only DeflateStream path; `SafeFileHandle` inspection at line53
can flush a dirty protected preopened FileStream before denial. Review22 found
neither as a selected single-player original-write source. Keep that compression
path and arbitrary inherited/dirty application-data handles excluded. No broad
stream/multiplayer/native/child/client confinement claim is accepted.

## Ownership, reproduction and limits

This advances the original user workflow through external acceptance tooling.
The concrete run manifest owns roots; its one preparation script generates the
three fixed guard declarations coherently. These one-run copies do not create
competing Toolkit production policy. No renderer, input/draw path, retained worker,
cache/invalidation or queue changed, and no UI-performance claim is made.

Reproduction entry points, with explicit Toolkit workdir:

```powershell
python -B 'S:/Projects/UCP/de-research/review-configured-game-harness-r1/independent_review.py'
python -B 'S:/Projects/UCP/de-research/review-configured-game-harness-r1/final_seal.py'
```

The first script refuses its already-created first-pin output. For a new run,
copy both sources and Probe.cs into fresh reviewer-owned scratch and change only
their scratch constant; retain R/H unchanged. Exact csc, metadata-reader, probe
and15git-object command arrays, cwd, PID, start time, exit and output digests are
in `S/commands.json`. Both recorded entry commands exited0. No production test
suite, full-game rehash, installation, game/native-DLL execution, Steam/UI/API
operation, app/browser launch or mounted OpenSHC/Ghidra call occurred.

One later supplemental read-only `python -c` formatting expression had mismatched
parentheses and failed at parse time; the enclosing PowerShell continued its
read-only rg commands. Its exact command/error are in `S/retained-format-error.txt`,
with context in `S/retained-error.json`, and it was replaced
by final_seal.py; it is not counted as passing evidence. Official review results
were already successful and were not overwritten.

Every subprocess in the review runner started suspended, entered its own
kill-on-close Windows Job before resuming, had bounded waits/finally cleanup,
and was reaped. Jobs included observed console/Git descendants, not merely the
top PID; all final active-process counts were0. Exec session99240 completed;
`S/final-owned-processes.json` independently found0 live scratch Audit/Probe/
Python helpers after completion. No service/port was opened, no unrelated process
was killed and no old-directory cleanup was attempted. Root retains acceptance,
central records, any subsequent artifact changes, integration and commits.

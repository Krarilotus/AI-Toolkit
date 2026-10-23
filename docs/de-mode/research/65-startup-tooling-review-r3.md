# Review65: correction64 and finite ordinary-user startup adapter

23 October 2026. Independent Sol6.1 ultra/default review; no children and no
implementation. Read the exact goal00, contract01, plan02 and standard05 first,
then full acceptance04 and reports22/56/57/63/64. Original intent and ownership
remain authoritative: the full separated Classic/DE workflow is open; external
startup instrumentation is acceptance tooling, not a new production sandbox.

Every terminal invocation used explicit Toolkit cwd
`S:/Projects/UCP/AI-Toolkit-DE`. Initial and final HEAD were
`9f9ef7b5fcc1731ab43a4f70fa81f61a1a8bd90a`, branch
`de/separate-game-mode`. This is disjoint-report ownership in the shared tree,
not worktree isolation. Only this report is edited inside the repository. Root's
concurrent69/product work and other owners' files were not edited/restored/staged.
Reviewer scratch **V** is
`S:/Projects/UCP/de-research/review-startup-tooling-r3`; **T** is correction64's
`S:/Projects/UCP/de-research/observed-game-startup-r3`. H/P/R/S/Q retain63/64's
meanings and were read-only, as was T. No retained builder was rerun in place.

## Disposition

**NO-GO for the exact current finite startup-preservation adapter.** One fresh
medium-severity defect remains at the actual protected-file notification boundary
(65-01 below). It can report success after an existing protected file is changed
and restored. This affects real file targets in the final watch plan. Do not
issue an approved independent65 execution receipt for these source-tools.

**GO for the narrow offline binary correction and the corrected rollback/module
boundaries.** 63-01,63-02 and63-04 are independently closed for their stated
metadata/synthetic scope. The demonstrated root-replacement, absent-root/key and
shutdown-tail cases of63-03 now fail correctly, but its broader continuous scoped
notification guarantee remains incomplete for existing files. Fixing65-01 belongs
to the existing external FileScope owner, followed by new source-tool/manifest/
plan pins and focused review. It does not require another guard architecture,
complete file-read tracing, elevation, ETW retry, or a shipping dependency.

This is no launch authorization or game acceptance. Root still owns fresh actual
Steam/Cloud/queue/activity/preservation gates, installation and any actual run.
`launchAllowed`, `artifactsInstalled` and `gameLaunched` remain **false**. No real
copy installation, app/game/Unity/Steam/native-game-DLL execution, Steam Init,
UI/browser/ComputerUse action, original preference/key/profile/Classic change,
ETW/elevation/driver/security/ACL change, broad process cleanup, commit, CI, PR or
publication occurred. Synthetic keys/files/helpers alone were written/executed.

## Blocking finding65-01: existing protected files lack content notifications

**Medium; owner: root's external acceptance-tooling/FileScope maintainer.**
`T/preservation.py:74-95`, specifically87-88, selects full notification masks only
when an existing directory equals the target or the last existing object. For an
**existing regular-file target**, the last existing object is the file and is
skipped by `if p.is_dir()`. Every watched directory therefore uses mask `1|2`
(FILE_NAME/DIR_NAME), with no LAST_WRITE/SIZE/ATTRIBUTES content coverage. Retained
file identity detects replacement, and final hashes detect persistent changes;
neither detects a same-file write followed by byte restoration. The resulting
absence of notifications is incorrectly credited as continuous observation.

`T/final/protected-watch-plan.json` includes existing-file targets
`appworkshop_3024040.acf` and `appmanifest_3024040.acf`. This is relevant to the
selected finite route, including its conservative Steam bookkeeping rule. It is
not a request to capture every OS write or attribute notifications to PIDs.

**Fresh actual-boundary witness:** `V/file-target-transient-result.json` records
two runs of the same self-authored worker through an exact-source controller
copy. The worker uses real file writes to change an8-byte synthetic ACF in place,
then restores its exact bytes. With that file as the protected target, the
controller returns **success/readiness true**, records **zero protected
notifications**, and reports equal final identity/content snapshots. The worker's
separate actual-write witness exists. With its containing directory protected,
the same writes produce real protected notifications and fail the run. Both Jobs
empty and retained handles signal. No notification/result API was substituted.
The synthetic worker SHA-256 is
`558f096fcd8f053ca5f680176bcfa4cda70dd09f7182cabb02b5b64e033305b4`.

The smallest correction is to arm the existing file's immediate parent with the
required content-change mask, retain the existing name/ancestor/identity anchors,
and filter returned names to that file. Avoid recursively watching unrelated
Steam trees merely to cover one file. Add an actual existing-file transient
write/restore regression at the controller/adapter boundary:64's adapter fixture
currently creates directories even for its `app-workshop-manifest` label, so it
misses this target-type distinction. Require the negative case to fail and retain
the directory-positive, root-replacement, absent-target and shutdown-tail checks.
Refresh the source-tools and dependent seals in new owned outputs; do not rewrite
T's immutable evidence. No game/helper binary change is indicated by this defect.

## Independently verified pins and source/binary boundary

`V/initial-pins.json` and `final-pin-check.json` verify all **3,523 listed index
entries** (including the separately pinned report64), the index's own hash, and
all **82** old baseline input identities before/after. No input changed.
T/handoff-index.json SHA-256 is
`8a4e415c68d5a0633bd124d52ebee41d0b8ac5b299cf23e9656080b9db6b6c3d`;
report64 remains
`958dee6d5a1b2b989178b9190bbd0c98f6a926859fece81ae150121d2d57acd3`.

Final reviewed SHA-256 values:

- Manifest: `8185d8b16fc17bed407053f8a825be5feee481f3af45993e51c18076ea47aff4`.
- Five-file plan: `25656bcf77b5ee4d52858c3654c5af4650ebdf15219b66c75aad840d0ca0448f`.
- Source-tools receipt: `f7fa2bf74a1c270d9e43dcf6a27c8b263ea28683957ebe28af882fa55d2173c5`.
- Final helper: `b2b663a51270d3f85962a79e7567cca662f0b90d9765611f491f0d257c0a8cf2`,
  20,992bytes, freshly read MVID `693877ea-bae2-4d51-8845-3a99d07ca4e2`.
- Final game assembly: `c7415d8890154b70c1dacb13614ab3550c443e0cde0c1860062692dc370a39cb`,
  3,764,224bytes, byte-identical to S/final.
- Guard.cs: `2bda9f2cd870dc7cc8f81e33cda754eed6b14bda793348bcfa7b98c58a6ef588`.
- controller.py: `3f9b9390d45a6ac084df073ebdc9e479a11e47431299eb794657a8c52094d321`.
- preservation.py: `02650c4dea03195f95c35b7a4b4a11bea9ab5f0fe6c8095dedacef2876e37b8d`.
- copy_executor.py: `8fca820aa8d5945849e4eccbd12db906d033436f2e2de2c8a357291844ef53e5`.
- run_adapter.py: `982312cb08d592f70bba2e5570814af06054167c7b0dac5374e13013dda4f5f8`.
- bounded.py: `20bc8671d05d51a5fd7705545be2523eb0c3d214f688e91eaf6fe81d4aeacfd3`.

**Fresh metadata, not execution:** `V/metadata-result.json` and the five audit
outputs cover original8,138, r1/r3 game8,151each, and r2/r3 helper46each:
24,532 records checked through a freshly compiled Cecil reader and a separate
PE/body-span parser. All12 licensing bodies **and call records**, all84 P/Invokes,
and original method tokens match. The existing195-site parent remains pinned at
`1d7ec9bf0324413e5dda8863fc65cd0a2bd913ad519134d4c4d7885bdcce520c`.
The only r1-to-final game change is the entry call to `OfflineA.Startup.Capture`
in FatControler.Awake; no game method is added in that delta. Relative to r2,
only existing Guard.ManagedRoot changes semantic fingerprint; the other45 helper
records match. No fake initialized flag, substitute native Steam DLL or new
licensing transformation was introduced.

`V/source-binary-result.json` goes beyond source/hash association: exact final
Guard/Diagnostic sources were compiled into new scratch with57's pinned compiler
and compile-only game/CoreModule references. All46 helper method fingerprints,
call records and P/Invokes match the retained helper. The new helper's MVID/bytes
are not asserted deterministic. A separately compiled exact AddStartup source
replays the r1-to-final metadata transform into V and produces the **exact final
game-assembly hash**. Nothing is written to retained build outputs.

Four managed primary-source copies were freshly compared with their local Git
objects at Serpens pin `a23aa1b32276d670ffbb2a7b641d23b500d8e298`;
commands, URLs and output hashes are in `metadata-result.json` and commands.jsonl.
SteamManager's `Steam Initialized` line follows successful genuine Init in that
source and unchanged body. That is a source-bound readiness witness, not observed
licensed startup. Native setter/autosave semantics remain22/63's pinned
hash-associated decompilation evidence; no native code ran here.

## Correction closure and finite adapter checks

**63-01 closed.** Fresh exact-final-helper execution preserves all16 pinned
source-expression-equivalent returns, including `/settings.cfg` and MP trailing
separator. The real helper pipeline logs306/232/230 UTF-16 bytes and native-style
filename append stays under the MP directory. Wrong-root/traversal refusals pass.
The game getters/native autosave were not executed. PersistentRoot redirect and
Canonical IO containment remain unchanged. See exact-helper-lexical-regression.

**63-02 closed.** Four fresh actual CLI synthetic apply/rollback cases pass.
A hardlinked target exits2 and preserves foreign alias bytes while recovering
four siblings; a hardlinked unused source exits0 and all five recover; a bad
individual backup exits2 and the other four recover. Positive CLI recovery also
passes. Source confirms fixed global schema/hash/inventory/lexical/backup binding
with mutable target/required-backup checks inside each operation. Unused rollback
sources are not inspected. See actual-cli-regressions.json. The unchanged32-state,
five-prefix and collision/tamper suites remain separately identified64 evidence;
they were not relabeled fresh or added to a unique aggregate.

**63-03 partially closed;65-01 blocks the remaining guarantee.** Nine fresh Win32
cases pass their expected outcomes: normal, rename/recreate/new-write, absent-root
creation, deterministic real exit-tail write, key delete/recreate, missing-key
parent watch, and live First/Next/snapshot errors. Root/key identity failures stop;
watches remain active through Job stop, retained handle exit, quiet drain and
final comparisons. The tail case now fails with actual protected changes. See
watch-module-regressions.json. Directory/key notification limits stay detective.

**63-04 closed for the bounded controller/checkpoint.** First/Next errors are
captured immediately;18 alone ends enumeration. Fresh live Win325 injections
fail. Source inspection and64's unchanged observer-limit receipts establish the
explicit exact-retained-handle exit-race branch; those race cases were not rerun.
The real adapter requires positive EXE/UnityPlayer/CrusaderDE/genuine steam_api64
path/hash witnesses, helper path/MVID, source and managed/helper external pins.
Missing samples cannot satisfy readiness. Transient loads remain unsampled.

**Fresh actual adapter entries:** `entry-review-results.json` covers12 synthetic
pre-creation refusals, a full synthetic normal run, the exact real missing-gate
refusal, and an exact real-copy read-only check. `supplemental-entry-results.json`
adds four synthetic entry refusals and the exact real **prepare-only** command's
synthetic-issuer refusal. Negative cases include manifest/plan pins, source bytes
and inventory, registered controller source, installed-file hashes, backup bytes
and binding, review artifact/tool binding, wrong copy scope, copy inventory,
expired gate/full-copy seal, missing gate and wrong issuer. Synthetic negatives
create no runtime directory/worker at their rejected boundaries. No generated
synthetic gate was ever supplied to real `--execute`.

The normal fixture uses only self-authored AdapterProbe/Guard/fake engine and
synthetic UI/idle/auth/review evidence, with inert non-game artifact bytes. It
cannot establish real engine paths or genuine Init. Python source copies match
T exactly; only bounded.ROOT's file-location-derived scratch routing differs.
The genuine real entry with **no gate** exits1 before RootRun or process creation.
The prepare-only real entry with synthetic issuer also refuses before installation
checks/creation. The real executor check exits0 with target states
**before / absent / before / before / absent**. Real copy-only backups remain absent.

Source inspection confirms manifest-owned roots, exact EXE/CWD/app-ID bytes,
pinned full-copy inventory plus five after-states, installed hashes/three backups,
120second root/Steam/activity/preservation evidence and600second content seal.
These are validation bindings to root-supplied evidence, not a machine proof that
arbitrary boolean/UI receipts are genuine. Root alone must establish their facts.
Current receipt/source/manifest/plan identity is checked before creation.

The one controller/executor is reused; the adapter adds the concrete run gates
and checkpoint rather than another game-policy owner. Checkpoint requires actual
engine/company/product/version/data/streaming/persistent/cache/temp/log/helper,
source-bound ManagedRoot/Bridge/settings(false), modules and genuine Init witness.
There is no diagnostic true/createReadMe call. Cache must be owned or specifically
reviewed outside preservation targets; the exception list starts empty. Present
Vuplex children need exact image/parent/command/cache and observed TEMP/TMP.
Reconciled Job identities fail unidentifiable children; sampled external relevant
processes fail relaunch/broker handoff without killing unrelated processes.
Normal parent exit, forced descendant stop and graceful exit remain separate.
No account reset, automatic original restore or Cloud-policy mutation exists.

64's other controller10, diagnostic6 and child-identity5 groups, module-exit races
and overflow refusal are preserved hashed evidence, not fresh runtime acceptance
here. No Toolkit hot path, worker/queue/cache/invalidation or renderer changed;
no UI/game performance result is claimed.

## Reproduction, failed probes, cleanup and handoff

Successful commands used explicit Toolkit cwd and `python -B V/<script>`:
init_review.py, metadata_review.py, focused_review.py, source_binary_review.py,
entry_review.py, supplemental_entry.py and finalize_review.py. Bounded compiler,
metadata-reader, Git/CLI-helper and worker commands/exits/Job identities are in
V/commands.jsonl or the controller result/event files. Source files and fixtures
are retained. Reproduction requires **new owned scratch and coherent routing**;
these entry scripts create outputs and must not be replayed over evidence.
For the principal witness, copy focused_review.py and its exact input sources
into new scratch; its last two runs compare a protected existing file with its
containing directory using the same native worker operations.

Three additional exploratory arming-boundary probes expected a swallowed queued
notification but **did not reproduce false success**: actual subsequent native
notifications stopped each attempt before worker creation, with equal final
snapshots. Their failed reviewer assertions, sources/results and limits are
retained in retained-review-probe-failures.json and synthetic/arm-* outputs.
They are not passing regressions or additional actionable findings. Their exact
new registry fixture was deleted and absence verified. No implementation was
changed to make an experiment pass.

All helper trees start suspended, enter the exact kill-on-close/no-breakaway Job
before resume, use bounded waits/finally reap and retain controller child handles
through signaling. Final read-only shutdown checking covers **81 recorded
PID/creation identities:0 live owned,0 unverifiable**. All completed worker Jobs
report Active=0; registry cleanup receipts verify only new UUID-owned test keys
are absent. TCP/UDP IPv4/IPv6 endpoint inventory finds no owned endpoint; no server
or port was opened and no kill was issued by shutdown checking. Top-level shell/
Python executions are tool-managed; this claim concerns recorded helpers, not
every Windows process. Initial/final short shell-managed Git reads have tool completion output but no separate PID receipts; the81 identities cover the recorded helpers/tests. No old-directory deletion occurred.

**Next owner:** correct65-01 in the existing external watcher, add the actual-file
negative and refresh source-tools/dependent seals in new artifacts. Focused fresh
review can close that boundary without repeating unchanged licensing/game suites.
Then root still needs current actual Classic roots, recoverable original profile/
PlayerPrefs/Workshop/bookkeeping, genuine supported app3024040 Cloud-off with
prior state and current no-queue/sync/conflict/update evidence, fresh content seal,
idle/process checks, installation and actual runtime paths/modules/genuine Init.
Unexplained protected notifications remain failures; shared Steam bookkeeping
needs narrow actual attribution or a stop. Cloud stays off through preservation
and shutdown; root alone restores a changed app-only prior UI state afterward.
Essential continuity/prevention/runtime ownership failure selects63(b).

Ordinary authentication/playtime/presence/client logs and specifically reviewed
OS caches outside preservation targets remain outside the claim. There is no
universal writable confinement, complete read trace, PID attribution or complete
LoadImage claim, and the retained ETW ACCESS_DENIED receipt remains unchanged.
Representative exported lord/castle/media/features/save-reload, authentic rendering
and Classic game-backed acceptance remain later requirements of the full goal.


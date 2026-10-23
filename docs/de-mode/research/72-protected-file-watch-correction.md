# Review65-01 correction72: frozen r4 handoff for fresh73

23 October 2026. Sol6.1 ultra/default; no children. This is external acceptance
tooling for the original full Classic/DE goal. Root owns acceptance, actual
Steam/preservation/activity evidence, installation and any later real launch.

Only `docs/de-mode/research/72-protected-file-watch-correction.md` is edited in
Toolkit. All new sources, artifacts, fixtures and receipts are under
`S:/Projects/UCP/de-research/observed-game-startup-r4` (**U**). Every terminal
invocation used explicit Toolkit cwd `S:/Projects/UCP/AI-Toolkit-DE`, branch
`de/separate-game-mode`, HEAD `9f9ef7b5fcc1731ab43a4f70fa81f61a1a8bd90a`.
This is shared/disjoint ownership, not worktree isolation. Product owner69 and
D2A owner71's actual worktree were untouched. No commits, CI/PR/release, app/game/
Unity/Steam execution, ComputerUse/browser, original profile/key/ACL/preference
writes, ETW/elevation/security changes or broad process cleanup occurred.

## Disposition and ownership

**Implemented and frozen for fresh73 review; no independent approval or launch
authority is claimed.** Review65 remains **NO-GO**. All prepared
`launchAllowed`, `artifactsInstalled`, `gameLaunched` flags are **false**.
Actual UI/Cloud/queue/idle/backups/Classic roots/review facts remain unset in the
root gate template. No synthetic fixture receipt authorizes the real copy.

Read full canonical goal00, contract01, plan02 and engineering standard05 first,
then acceptance04 and full65/64/63, with relevant57/22. The original full-game
objective remains open. This correction fixes target-kind coverage at the
existing FileScope owner; it adds no shipping sandbox, adapter policy override,
recursive Steam observer or final-hash substitute. No cross-owner edit was needed.

## Change at the existing owners

`U/preservation.py` now recognizes an existing regular file from its initial
snapshot and arms its **immediate parent** with the existing full mask
`FILE_NAME|DIR_NAME|ATTRIBUTES|SIZE|LAST_WRITE|CREATION` (`287`). That parent watch
is **nonrecursive**. Existing ancestor/name anchors, retained target/ancestor
identity handles and exact target filtering remain. A sibling's content event
is filtered; target replacement/name events and identity loss still fail.
Directory targets and absent targets keep their previous coverage.

`U/controller.py`'s existing DirectoryWatch decoder rejects failed waits,
unknown actions, malformed/truncated headers/names, invalid next offsets,
escaping paths and invalid trailing records before a name can be filtered.
Completion errors and zero-byte overflow remain failures. This validation has
one owner, with no duplicate adapter policy. Observer lifetime, root/key
continuity, Job reconciliation, quiet shutdown drain and final comparisons are
unchanged. Notifications detect changes; they do not veto writes or identify
PIDs/reads. Sampled modules do not establish universal LoadImage coverage.

`U/run_adapter.py` changes only its two default manifest/plan filenames to r4.
The legacy `independent65` receipt-field name remains schema-compatible: root
must populate it with **fresh73 approval bound to these exact r4 bytes**, if that
review approves. It is currently null; neither65 nor a manufactured73 is supplied.

The adapter fixture now uses an actual8-byte `appworkshop_3024040.acf` protected
**file**, with a file recovery entry relative `.`. Its neighboring synthetic ACF
is separate. Fake UI/idle/auth/review evidence and a distinct synthetic issuer
remain explicitly synthetic. The fixture executes only self-authored probe/
routed helper code; original assemblies are compile-only references and
`Startup.Capture`/Unity/game/native Steam code is not executed.

## Observed boundary evidence

First reproduced the original65 defect in fresh U scratch using unmodified r3
source bytes, routing only imported bounded.ROOT to U. The exact retained worker
SHA-256 is `558f096fcd8f053ca5f680176bcfa4cda70dd09f7182cabb02b5b64e033305b4`.
The old file-target run reports success/zero notifications/equal final bytes,
with the worker's actual-write witness; the same writes under a directory target
fail. `U/original65-reproduction.json` retains both actual controller results.
No old builder or binary was replayed in its retained output directory.

Final focused records are separate, with no added inherited totals:

| Record under U | Actual result |
| --- | --- |
| `file-controller-regressions-final.json` | Four exact-retained-worker cases: existing-file transient write/restore fails; unchanged matching file passes; unrelated sibling content write/restore passes; real directory transient write/restore fails |
| `file-adapter-cli-regressions-final.json` | Four actual `run_adapter.py --execute --synthetic-fixture` entries with real protected file: normal/sibling pass; protected-file/directory transient writes fail |
| `invalid-event-regressions-final.json` | Nine real controller/native-completion fault cases refuse overflow, completion error, wait error, unknown action, empty name, traversal, truncated header/name and invalid offset |
| `watch-continuity-r4-final.json` | Six retained actual Win32/controller cases: normal passes; rename/recreate, absent target, exit-tail write, key replacement and absent-key creation fail |
| `adapter-events-and-watch-layout.json` | Independently asserts exact adapter event names, sibling write witness with zero protected events, full nonrecursive file-parent mask and name-only nonrecursive ancestor anchors |
| `entrypoint-r4-checks.json` | Actual real-copy check exits0, with before/absent/before/before/absent; actual real adapter `--execute` with no gate exits1 before runtime/process creation |

Transient content cases compare equal final target identity/bytes; the observed
notifications still fail them. Nine malformed/error tests inject only a native
completion/wait result after a real event on new owned files; they are explicit
fault tests, not nine naturally occurring OS corruptions. All fixture keys are
new UUID-owned HKCU keys, deleted individually and absence rechecked. No originals
are restored, and no evidence/cache/tree is deleted.

## Fresh dependent seals and unchanged binaries

U/final is the proposed r4 artifact layer. Manifest, five-file plan, gate template
and source-tool receipt were regenerated coherently at new paths. The plan keeps
the same five real destinations and three before hashes; its sources are U copies
and its unused copy-only backup root is `U/owned-install-backups-r4`.

| U/final artifact | SHA-256 |
| --- | --- |
| `run-manifest-r4.json` | `55375769ec56ee2380268135638827b14ccf10bd88273fbce82b543796c1ad4b` |
| `owned-install-plan-r4.json` | `740a9e4fdd631999323bd4fdd73c92637d04d7da4e5ab5116d476cf8d83e7920` |
| `acceptance-tools.json` | `c85f1ff3d5a8db0a13d2dede6b74d5330e6901cf604ed3e523aeeb322a5f58cf` |
| `OfflineA.Guard.dll` | `b2b663a51270d3f85962a79e7567cca662f0b90d9765611f491f0d257c0a8cf2` |
| `Assembly-CSharp.observed.dll` | `c7415d8890154b70c1dacb13614ab3550c443e0cde0c1860062692dc370a39cb` |

Final runtime source pins: preservation
`4f94a231671057436fd6198bb2378e861f0a16d0b5009d1bdac1e06aa575daca`,
controller `53f99bc7fa9b4cc3ca5c48f2f18505de8ca3cbe6732fd3c58c3944dbff6f7812`,
adapter `53af681a542f2eef1a01a6f509be5d864b76f32a4c87986863ac7d63e00b4739`.
Exact before/after pins and unchanged remaining tools/binaries are in
`copied-inputs.json`, `final/artifact-refresh-receipt.json` and
`final/inherited-binary-and-closure-receipt.json`.

The final helper remains20,992bytes, MVID
`693877ea-bae2-4d51-8845-3a99d07ca4e2`; the managed game remains3,764,224bytes.
Neither final binary was rebuilt or transformed. Review65's independent63-01
lexical306/232/230,63-02 CLI recovery and63-04 module/positive-pin closure is
**inherited**, as are its12 unchanged licensing bodies plus calls and84 P/Invokes.
Those suites and the old full metadata/32-mixture corpus were not rerun. Routed
synthetic helper/probe compilations exist solely for the changed adapter tests.

T=`observed-game-startup-r3`, V=`review-startup-tooling-r3`, and all inherited
H/P/R/S/Q inputs remained read-only. Initial/final checks match **3,523** T index
entries, **82** baseline pins and **287** V files, plus Review65 itself.
T/handoff-index.json remains
`8a4e415c68d5a0633bd124d52ebee41d0b8ac5b299cf23e9656080b9db6b6c3d`.
The old64 manifest/plan/tool pins `8185d8b1...` / `25656bcf...` / `f7fa2bf7...`
remain old inherited identities, never presented as the new r4 seals. The retained
ETW denial is unchanged. The real copy's five before/absent states, absent new
backup root, empty fixed managed profile and absent engine directory/key remain
preparation-time read-only observations, not later launch-time gates.

## Reproduction, retained failures and lifecycle

U/README.md provides the exact entry commands, minimal fresh-scratch input list
and receipt map. `commands.jsonl` retains56 bounded compiler/CLI/Git commands with
argv/cwd/exit/creation identities and Job reap. The final focused entry is:

```powershell
python -B S:/Projects/UCP/de-research/observed-game-startup-r4/test_review65.py
```

**Do not replay it over frozen U outputs.** Copy the listed inputs into a fresh
sibling scratch first; bounded.ROOT derives routing from its local file. Preserve
T/V/U and all their receipts. U's setup/seal/final-check entry scripts exclusively
create their handoff outputs and are not in-place refresh commands.

Two development failures are retained, not passing evidence: the initial exact
worker was outside the controller's synthetic admission subtree (refused before
creation), then a fourth adapter fixture collided with a controller fixture's
`directory-transient` name after three entries ran. Only test routing/names were
corrected. `development/`, `failed-run-*.json` and all partial fixtures remain.
The final23 focused cases pass at the frozen runtime bytes; earlier partial
runs are not added to that count. Top-level Python/inline-edit/shell invocations
are tool-managed and lack separate retained PID identities; their exact entry
commands/exits and this limitation are recorded, not invented as Job receipts.

Every directly spawned helper starts suspended and is assigned to the existing
kill-on-close/no-breakaway Job before resume, with deadlines and finally cleanup.
Inherited descendants are reconciled and their exact handles retained through
shutdown. Final read-only checking covers **148 PID/creation identities**:
**0 live owned /0 unverifiable**; all56 recorded bounded command Jobs end Active=0.
Endpoint inventory queries TCP/UDP IPv4/IPv6, filtered to exact live-owned
identities, and records **0 owned endpoints**; no server/listener was started.
The check issues no kills. See `final-owned-processes.json`,
`owned-port-check.json`, `final-verification.json` and the frozen handoff index.

**Next owner:** fresh73 independently reviews these exact r4 sources/artifacts.
Root alone reconciles acceptance and supplies fresh genuine Steam Cloud/queue,
activity/process, recoverable preservation/Classic-root, copy/namespace and
runtime path/module/auth evidence before any installation or game launch.
Essential continuity or prevention failures retain63(b). No real-game, AI/media,
rendering, loader, smoothness or Classic acceptance row closes here.

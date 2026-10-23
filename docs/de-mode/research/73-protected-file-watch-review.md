# Review73: independent review of correction72 for Review65-01

23 October 2026. Sol6.1 ultra/default; no children. Read goal00, contract01,
plan02 and engineering standard05 first, then acceptance04, full65/72/64/63 and
the relevant57/22 evidence. The full separated Classic/DE and real-game goal
remains open. This review concerns external acceptance tooling, not a shipping
sandbox or a new requirement to trace every Windows read or image load.

Every terminal command used explicit Toolkit cwd
`S:/Projects/UCP/AI-Toolkit-DE`. Initial/final branch was
`de/separate-game-mode`, HEAD
`9f9ef7b5fcc1731ab43a4f70fa81f61a1a8bd90a`. This is shared/disjoint report
ownership, not worktree isolation. Only this report was edited in the repository;
69/product/central files and71's actual D2A worktree were untouched.

**W** = new reviewer scratch
`S:/Projects/UCP/de-research/review-startup-tooling-r4`.
**U** = frozen72 `observed-game-startup-r4`; **T** = frozen64
`observed-game-startup-r3`; **V** = frozen65 `review-startup-tooling-r3`.
U/T/V and H/P/R/S/Q were read-only. Needed runtime sources, fixture constructors
and the exact retained synthetic worker were copied into W with coherent local
ROOT routing. No retained builder or evidence output was rerun/overwritten.

## Disposition

**GO for correction72 of Review65-01 at the exact frozen r4 pins below.** The
existing-file transient-write observation defect is independently closed at the
actual controller and adapter CLI boundaries. No blocking correctness finding
was reproduced in this changed scope. One nonblocking P3 report-label correction
is recorded below; it requires no mask/code change or binary rebuild.

This is **not launch permission**. The finite63(a) host route remains conditional
on root's real current gates. The prepared manifests/plans/template still have
`launchAllowed:false`, `artifactsInstalled:false`, `gameLaunched:false`.
Review65 remains a historical overall NO-GO; its receipt cannot approve r4.
This reviewer did not create an executable real approval receipt or populate
`independent65`. Root may bind fresh73 only after accepting this actual review.

No real installation/rollback, game/app/Unity/Steam/native-game-DLL execution,
Steam Init, UI/ComputerUse/browser launch, original profile/key/settings/ACL
mutation, ETW/elevation/security change, dependency installation, broad process
cleanup, commit, CI, PR or publication occurred. Only self-authored workers,
routed synthetic helpers and metadata readers executed; original game/Unity
assemblies were compile-only references for those fixtures.

## Actionable finding

**73-01 — Low/P3, documentation only; nonblocking.**
Source: `docs/de-mode/research/72-protected-file-watch-correction.md:35`, checked
against `U/preservation.py:93` and `U/controller.py:45`.
The report labels mask287 as
`FILE_NAME|DIR_NAME|ATTRIBUTES|SIZE|LAST_WRITE|CREATION`. The actual expression
is `1|2|4|8|16|256`, hexadecimal `0x11f`: the last bit is **SECURITY**.
CREATION is `0x40`; the expression with CREATION in place of SECURITY would be95.
The [Microsoft ReadDirectoryChangesW definition](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw)
was checked during review and confirms these values.

Probe: fresh W/controller73-results.json records the real file-parent mask287,
nonrecursive coverage and SIZE/LAST_WRITE bits. The actual adapter's same-size,
flushed in-place write/restore fails while equal final bytes/identity remain.
Thus the incorrect CREATION label does not reopen65-01 or justify widening the
observer. Owner: report72 author/root. Minimal move: correct the report's final
symbol to SECURITY, or explicitly note the correction in the next owned report;
retain frozen U and its pins. Do not change the code/filter to fit wrong prose.
This report supplies the correction without editing another owner's file.

## Fresh source and binding verification

W/initial-pins.json and final-audit73.json independently hash-check U's **895
indexed entries including report72**, T's3,523 entries, the82 baseline pins,
V's287 files and Review65. Deduplication yields **4,789 unique input identities**;
all match before/after. Another58 nested artifact/plan/tool/receipt bindings
match. No hash or success field alone substitutes for the behavioral probes.

All five copied runtime Python files exactly match U. W/source-diffs.json
independently derives the r3/r4 changes: FileScope's existing-file parent mask,
the existing DirectoryWatch completion decoder, and the adapter's two default
filenames. bounded.py/copy_executor.py are byte-identical. No RunAdapter watch
override, duplicate policy, recursive Steam-tree coverage or final-hash fallback
was added.

`U/preservation.py:74-110` retains target/ancestor identity handles and name
anchors. For an existing file, only its immediate parent gains mask287 and
remains nonrecursive; other ancestor watches remain nonrecursive mask3.
Windows Path comparisons retain case-insensitive exact-name behavior. Tests
exclude both a similarly prefixed filename and the same basename in an unrelated
subdirectory; a watched uppercase leaf still receives the lowercase native name.

`U/controller.py:58-81` validates waits, completion status/bounds, action,
header/name/UTF-16, offsets, trailing records and path containment before
FileScope filters names. Unknown or malformed sibling records therefore fail.
`controller.py:266-301` keeps observers open through Job stop, retained child
exit, bounded quiet drain, final comparison and a further poll before close.
Root/key replacement and uncertain coverage fail instead of reopening a new
object. Notifications detect violations; they cannot veto or PID-attribute them.

Final reviewed SHA-256 values:

| Input | SHA-256 |
| --- | --- |
| U/handoff-index.json | `1d1e9907c489a8998d7e03e54be2b740f8f7516a547ced2dac3a81fc7019b898` |
| U/final/run-manifest-r4.json | `55375769ec56ee2380268135638827b14ccf10bd88273fbce82b543796c1ad4b` |
| U/final/owned-install-plan-r4.json | `740a9e4fdd631999323bd4fdd73c92637d04d7da4e5ab5116d476cf8d83e7920` |
| U/final/acceptance-tools.json | `c85f1ff3d5a8db0a13d2dede6b74d5330e6901cf604ed3e523aeeb322a5f58cf` |
| U/preservation.py | `4f94a231671057436fd6198bb2378e861f0a16d0b5009d1bdac1e06aa575daca` |
| U/controller.py | `53f99bc7fa9b4cc3ca5c48f2f18505de8ca3cbe6732fd3c58c3944dbff6f7812` |
| U/run_adapter.py | `53af681a542f2eef1a01a6f509be5d864b76f32a4c87986863ac7d63e00b4739` |
| U/copy_executor.py | `8fca820aa8d5945849e4eccbd12db906d033436f2e2de2c8a357291844ef53e5` |
| U/bounded.py | `20bc8671d05d51a5fd7705545be2523eb0c3d214f688e91eaf6fe81d4aeacfd3` |
| U/final/OfflineA.Guard.dll | `b2b663a51270d3f85962a79e7567cca662f0b90d9765611f491f0d257c0a8cf2` |
| U/final/Assembly-CSharp.observed.dll | `c7415d8890154b70c1dacb13614ab3550c443e0cde0c1860062692dc370a39cb` |

The helper20,992bytes and game3,764,224bytes are freshly byte-compared with T.
Guard.cs/Diagnostic.cs/AddStartup.cs are unchanged too. Helper MVID
`693877ea-bae2-4d51-8845-3a99d07ca4e2` is inherited from the byte-identical
reviewed binary, not a fresh metadata execution here. Review65's63-01 lexical
306/232/230,63-02 per-operation CLI recovery,63-04 module/positive-pin closure,
12 licensing bodies plus calls and84 P/Invokes remain **inherited closure**.
Those unchanged suites/full metadata/old32-state corpus were not replayed.
T's original index remains
`8a4e415c68d5a0633bd124d52ebee41d0b8ac5b299cf23e9656080b9db6b6c3d`;
64's old manifest/plan/tools hashes are not substituted for r4 identities.

## Fresh behavioral evidence

Expectations were independently authored around the exact controller and
actual adapter CLI. The inspected72 fixture constructor and retained continuity
fixture were reused only as synthetic input generators; their old passing flags
were not adopted. No manual event-set substitution was used.

| Record under W | Fresh observed result |
| --- | --- |
| old-r3/original73-results.json | Exact old source plus retained worker reproduces existing-file success, zero notifications and equal final bytes/identity; containing directory fails on the same actual writes |
| controller73-results.json | Seven cases: corrected file write/restore fails; unchanged file, sibling content, similar-name sibling and nested unrelated sibling pass; directory write/restore and uppercase worker path fail |
| case-filter73-result.json | Additional actual mixed-case filter case: uppercase protected leaf, lowercase returned native name, real write/restore refuses with equal final snapshot |
| decoder73-results.json | Sixteen native-completion/wait fault cases fail after a real sibling notification: overflow, completion/wait error, unknown action, empty/odd name, traversal, truncated header/name, invalid offset, absolute/nested path, trailing data, invalid UTF-16, oversized completion and bad second record after a valid filtered sibling |
| adapter73-results.json | Four actual CLI runs with a genuine new8-byte protected file and recovery relative `.`: unchanged/sibling pass; protected-file/directory transient writes fail. All final protected snapshots equal; real notifications independently decide failure |
| adapter73-results.json, preCreationRefusals | Seven actual CLI refusals: wrong manifest/plan pin, unapproved/missing review, old tool-receipt binding, bad source-byte pin and directory-style recovery entry for the actual file |
| watch-continuity-r4-final.json and continuity73-independent-check.json | Six fresh inspected-fixture cases: normal passes; root rename/recreate, absent-target creation, deterministic real exit-tail write, key replacement and absent-key creation fail; independent outcome and reap assertions pass |
| real-entry73-results.json | Actual U executor read-only check exits0: before/absent/before/before/absent. Actual real U adapter --execute with no gate exits1 before RootRun/runtime/process creation |

The exact retained worker hashes to
`558f096fcd8f053ca5f680176bcfa4cda70dd09f7182cabb02b5b64e033305b4`.
Actual-write witness files and equal identity/content comparisons are required
for the transient cases, so final-hash equality cannot turn them green. Adapter
mutations use an existing FileStream, same-size writes and Flush(true), covering
LAST_WRITE behavior without a directory-labelled stand-in.

Malformed completions are explicitly injected returned-native-data faults after
real events on new owned files, not naturally observed OS corruption. Their
payloads name an otherwise filtered sibling, including a valid first record
followed by an invalid second record. Decoder errors cannot be credited as
unchanged siblings. All fault worker Jobs and handles are reaped.

The actual file recovery check executes before worker creation. A deliberately
wrong `sentinel.txt` recovery relative fails there; it may allocate its owned
runtime/observer directory but creates no worker. Earlier artifact/review/tool
refusals create no runtime directory. All synthetic gates retain their distinct
issuer and synthetic-only files; none was supplied to a real --execute.

## Real gate inspection and remaining root work

`U/run_adapter.py:89-128` binds manifest, five-file plan, independent review and
source-tools before runtime allocation; line300 refuses a missing root gate
before mutable-copy inspection. Lines129-199 retain freshness, real issuer,
Steam/activity evidence, current protected snapshots/recovery and actual Classic
root requirements. The file recovery inventory matches snapshot relative `.`
at this actual boundary. Required modules/installed hashes/copy-only backups and
full-copy content-seal binding remain in the unchanged adapter policy.

The real copy's five before/absent states and three overwrite hashes match
before/after; U's new copy-only backup root remains absent. U/runtime entries
are unchanged by the real missing-gate entry. The three preparation flags remain
false. The actual UI/Cloud/queue/activity/backups/Classic-root/review/content-seal
facts remain null/unset in the real template; no genuine facts were manufactured.
The legacy `independent65` field can carry fresh73 only after actual root review
acceptance, bound to the exact r4 manifest/plan/tools. Its name alone gives no
authority and historical65 is still NO-GO.

Root must still establish current supported app3024040 Cloud-off and prior state,
matching UI/client queue/sync/conflict/update evidence, genuine idle/exact-process
state, fresh recoverable original profile/PlayerPrefs/Workshop/bookkeeping and
actual Classic roots, fresh physical-copy/namespace/content seals, and any later
installation. Actual engine/native/cache/Vuplex/child paths, positive modules,
genuine licensed Init and preservation through real shutdown remain **unverified**.
Essential missing continuity/prevention/runtime conditions retain63(b).
Cloud stays off through preservation/shutdown; root alone restores a changed
app-only prior state after preservation passes. No launch authorization follows
from this review. Authentic rendering, exported AI/castle/media/features,
save/reload, smoothness and Classic game-backed acceptance remain open.

## Commands, retained reviewer failure and cleanup

Successful top-level entries, all with explicit Toolkit cwd, were:

```powershell
python -B S:/Projects/UCP/de-research/review-startup-tooling-r4/init_review73.py
python -B S:/Projects/UCP/de-research/review-startup-tooling-r4/controller_review73.py --decoder-only
python -B S:/Projects/UCP/de-research/review-startup-tooling-r4/adapter_review73.py
python -B S:/Projects/UCP/de-research/review-startup-tooling-r4/entry_review73.py
python -B S:/Projects/UCP/de-research/review-startup-tooling-r4/final_audit73.py
```

The initial controller_review73.py invocation exits1 **after** the old-source
pair and seven target-kind cases pass: my assertion wrongly required English
notification text for the localized injected Win32 error5. The implementation
correctly refused and reaped. The script/version and partial results remain in
development/ and synthetic/decoder73; no production code changed. The corrected
decoder-only run uses numeric Win32 expectations and new UUID-owned outputs,
passing all16 cases. The two earlier partial decoder cases are not added to the
final group. W/entry-commands.json records exits and this distinction.

W/commands.jsonl records **31 bounded helper/CLI/compiler commands**, actual
argv/cwd/creation identities/exits/Jobs, including the exact two real commands.
W/old-r3/reproduce_original73.py ran as a bounded child of the initial controller
entry. Scripts create outputs: reproduction needs fresh scratch with coherent
ROOT routing, never replay over W/U/T/V/H/P/R/S/Q or erase failed fixtures.

Final read-only audit includes the old-source subtree and failed reviewer probes:
**107 retained PID/creation identities;0 live owned;0 unverifiable**. All31
bounded command Jobs report Active=0; all38 recorded controller runs with an
owner have empty Jobs, reaped parents and signaled retained child handles.
Both new UUID HKCU fixture keys are deleted individually and absence rechecked.
TCP/UDP IPv4/IPv6 table queries succeed and find **0 owned endpoints**; no server
or listener was started. Audit issued no kills. See final-audit73.json,
final-owned-processes.json, recorded-reap73.json and owned-port-check.json.

Top-level shell/Python/Git reads are tool-managed and have completion output but
no separate retained PID receipt; the107 identities concern recorded owned
helpers, not every host process. No unrelated process was stopped, old evidence
deleted, original recovery attempted or real policy changed. This bounded review
ends with65-01 closed and actual acceptance authority retained by root.

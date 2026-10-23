# OpenSHC MCP lazy initialization and process lifecycle

23 October 2026; implementation handoff for coordinator review. Toolkit HEAD at
inspection and handoff: `a55ea99542763e9103b1db5d6b494bd6390870a6` on
`de/separate-game-mode`. The resumed goal, contract, plan, engineering standard,
ISO performance rationale and native parity contracts were read. No applicable
`AGENTS.md` was found at the inspected ancestor/owned-directory paths.

## Scope and ownership

Production change: `S:/Projects/Harness/tools/openshc-mcp/launch.py` only.
Focused helpers beside it: `test_lifecycle.py`, `test_lifecycle_unit.py`.
This report is the only Toolkit file owned by this assignment. The launcher is
local Harness integration referenced by existing Codex configuration; it is not
OpenSHC upstream code or a Toolkit application change. A Toolkit commit of this
report alone does not version the external launcher. Root owns review/adoption.

OpenSHC source, installed packages, global configuration, original/private-source
Ghidra project, Classic profiles and application/game code were preserved. No
mounted OpenSHC MCP tool, GUI, game, service change, commit, push, CI or PR was
used. Existing-process cleanup belonged to root. Historical session directories
were not deleted, including after root reported rejection of its optional sweep.

Evidence root: `S:/Projects/UCP/de-research/openshc-process-lifecycle-fix`.
It contains original/final launcher bytes, `launch.diff`, `source-pins.json`,
`measurement-summary.json`, `final-audit.json`, failed diagnostics and the final
`inline-final/` real-process evidence. Proprietary copies remained outside Git.

## Causes and the final correction

The original launcher created a roughly 119,637,330-byte private project copy,
imported `ghidracpp` and initialized its database before starting MCP. Installed
`ghidracpp/__init__.py` calls `pyghidra.start()` on import. That starts the JVM
inside Python, explaining the large base-Python working set without a separate
`java.exe`. A Windows venv shim plus its base Python is one server connection.

The saved unchanged launcher exits naturally on actual stdin EOF and removes its
copy. Root's process audit and the observed unused transport auto-started with
this assignment support host connection retention as a separate issue. They do
not establish that every historical process/copy had the same cause. Old CPU
lifetimes around 20–27 seconds do not identify a crash or a closed pipe. Older
locked directories can also result from forced termination/startup timeout.
Additionally, the old explicit Ghidra cleanup covered only `mcp.run`, leaving
initialization failures outside that cleanup boundary.

The final launcher imports upstream once for its registrations and source roots.
Only the genuine decompilation tool gets a `functools.wraps` adapter, registered
through public FastMCP `remove_tool`/`add_tool` APIs. Its complete per-name tool
metadata, descriptions, input/output schemas and defaults match the original
12-tool manifest. Source/build/cached-source functions remain upstream-owned.
No second manifest or HTTP fallback is introduced.

The adapter initializes one private copy on first actual Ghidra use, injects the
existing dependency and reuses it. Bootstrap and decompilation both remain
inline/on the main thread, matching upstream execution. An ExitStack closes the
program/project before removing the copy, including partial initialization and
release failures. It replaces the bridge's registered blanket-except cleanup
with one explicit owner. Failed initialization requires reconnection to retry;
source tools remain available.

Lazy startup also exposed a real Windows interaction: MCP's blocking reader on
CRT descriptor 0 can prevent JVM startup. OpenJDK's Windows initialization calls
`setmode_streams`, which changes stdin/stdout/stderr modes. The installed JDK's
release file pins Adoptium source `1c417fbfc2f7`; its
[Windows initialization source](https://raw.githubusercontent.com/adoptium/jdk21u/1c417fbfc2f7/src/hotspot/os/windows/os_windows.cpp)
contains this operation. Stack traces stopped in `jpype.startJVM`. Giving MCP an
owned duplicate stdin descriptor resolved the observed startup stall; the
original descriptor is preserved and the duplicate is closed after transport
shutdown. This uses ordinary stream injection, with no MCP private-API patch.

## Verification and failures retained

The final inline variant passed the saved eager baseline, eight real-process
cases and four focused ownership/error unit tests. Final process cases cover:
initialize/list/source with no JVM DLL or copy; EOF before initialization;
malformed JSON followed by recovery; a genuinely closed stdout pipe; a 1 ms
client startup deadline; actual copy failure followed by source recovery; two
genuine read-only decompilations plus a missing-function error and EOF after an
outstanding genuine request's 1 ms client deadline; and the installed MCP SDK's
`ClientSession`/`stdio_client` close sequence.

The genuine target was
`OpenSHC::Map::Units::UnitsState::findNearestEnemyAndHeadTowardsIt`.
The two responses matched, reused one copy, and produced a 30,280-character
serialized result with SHA-256
`46fe506fc8ed500dc303a738eaf83c6d42853973ce98e31bd80a859b8f83661e`.
The last outstanding request's exact native scheduling boundary was not
instrumented; the session had already performed real decompilation twice.
Partial-open and release-exception cleanup are unit evidence; the native success
and copy-error paths are real-process evidence.

In `inline-final/`, base-Python working sets were 610,344,960 bytes (582.07 MiB)
for eager initialize/list, versus 63,160,320 bytes (60.23 MiB) for lazy listing
and 63,352,832 bytes (60.42 MiB) after the source read. Shim cost was about
5.1 MiB separately. Genuine Ghidra use still costs hundreds of MiB: 426.52 MiB
after the first result and 479.52 MiB after reuse. These are instantaneous
working-set observations, not JVM heap limits or long-duration/UI benchmarks.
Baseline execution relocates only its session-copy root, preserving its saved
logic and actual source/project roots. Warm-cache/startup timings are not UI
smoothness evidence; no Toolkit draw/input path changed.

Final baseline EOF exited 0 in 0.675 seconds; source EOF in 0.518 seconds; heavy
EOF in 0.786 seconds. The closed-stdout case returned a transport-error exit,
then reaped naturally. Final cases and the outer supervisor report
`forced_cleanup: false`, with no retained test copy or active Job descendant.
Exact PIDs, parents, creation times, executables, memory and final reap records
are in the per-case `*.processes.json`, including `sdk.processes.json`.

Failures were not discarded. Early lazy candidates stalled in JVM startup with
the original stdin descriptor; see `worker-diagnostic/after-ghidra.stderr.log`.
An intermediate worker-bootstrap/native-call candidate also failed heavy EOF:
`after-ghidra.processes.json` at the evidence root records a 40-second wait and
forced cleanup for shim/base identities `1996`/`40764`. That historical failure
is not a result for the final inline source. Exact source bytes were not archived
for every failed intermediate candidate. The final variant removes the added
JPype worker-lifetime coupling and passes the real heavy lifecycle checks.

Every test server belongs to an owned Windows Job. A 150-second outer process
deadline bounds SDK context shutdown, JNI and interpreter exit, followed by
finite reap/kill cleanup of test-owned descendants. The helper's new temporary
copy root is removed only after its process owner exits. No watchdog is retained.

## Pins and reproduction

Configured Python: `S:/Projects/Harness/tools/openshc-mcp-py313/Scripts/python.exe`,
Python 3.13.15. Installed versions: MCP 1.30.0, AnyIO 4.15.1, ghidracpp 1.0.0,
PyGhidra 3.1.0, JPype1 1.5.2, pywin32 312; Ghidra 12.1.3 and Temurin
21.0.12.1+1. The existing configuration's startup/tool timeouts are both 120 s.
No package or configuration was changed.

- Original launcher SHA-256:
  `9acb2f571c2fbbc3b55ecad0f2ae87c4b6129184fd67ca228a65a8282a56c640`.
- Final launcher SHA-256:
  `78a8a297d4095e0f9fc86a9ae4339efd9c2268016333064138da086e0925e5df`.
- OpenSHC HEAD: `126f25c9a53c14270ccd10c6a5db6f05bd143204`; MCP file's
  last commit `54f26f558a226cc299394ac2b8aaf7ac8b2477a1`; unchanged file SHA-256
  `7f933f8ef180d0ce7f7f41f4e5144d9f0878f8f2e3cd804bfba35c022ce2372c`.
- ghidra-cpp checkout: `d05d7a2ed4f95978c494197b7118350c11bd434e`.
  Installed `__init__.py` and `rewrite_function.py` hashes match that checkout:
  `223c2d28cbdc623d2b8a439b997caee273abd546dea64e2a3bd190f54769a6f0`
  and `a9a7ecda61361e5d9b3c2c65153bffb017bc7d19b931891bf4232f6f04aa230f`.

Full helper, SDK, Python launcher and JVM DLL hashes are in `source-pins.json`.
Run from the actual Toolkit directory, using a new external output directory:

```powershell
$env:PYTHONDONTWRITEBYTECODE='1'
& 'S:\Projects\Harness\tools\openshc-mcp-py313\Scripts\python.exe' `
  'S:\Projects\Harness\tools\openshc-mcp\test_lifecycle_unit.py' -v
& 'S:\Projects\Harness\tools\openshc-mcp-py313\Scripts\python.exe' `
  'S:\Projects\Harness\tools\openshc-mcp\test_lifecycle.py' `
  --output 'S:\Projects\UCP\de-research\openshc-process-lifecycle-fix\review' `
  --baseline 'S:\Projects\UCP\de-research\openshc-process-lifecycle-fix\launch.before.py' `
  --after
```

## Limits and final cleanup

The launcher cannot infer that a turn ended while a host keeps stdio open.
After real Ghidra use, one live channel intentionally retains its initialized
JVM/project. Closing/reaping unnecessary cached channels is host-owned work.
No idle-kill timer, parent-PID polling or additional daemon was added.

Inline startup/decompilation delays session shutdown until native work returns,
as upstream did. The decompiler supplies its existing 30-second operation
timeout; this is not a universal bound on JVM/native hangs. Forced OS termination
can bypass Python cleanup. The installed Python MCP client allows only two
seconds of graceful close before terminating its Job; closing during a longer
native operation can therefore leave a copy. The launcher does not claim to
solve that host/client policy or hard-kill recovery by deleting old sessions.

`final-audit.json`, 19:34:37 +02:00, records zero Python processes globally,
zero test-owned private temporary directories and zero listeners for recorded
test PIDs. All explicit test shims/base processes and SDK descendants were
reaped. Historical source/session copies remain root-owned and untouched.
Coordinator acceptance and integration remain pending.

## Retained-handle test cleanup hardening, round 2

23 October 2026; helper-only follow-up, with Toolkit HEAD still
`a55ea99542763e9103b1db5d6b494bd6390870a6`. The mandatory goal/contract/plan/
engineering files and performance/parity rationale were read again. Only
`S:/Projects/Harness/tools/openshc-mcp/test_lifecycle.py`, its focused
`test_lifecycle_unit.py` and this appended report were changed. Production
`launch.py` remains byte-identical to the reviewed source above. No Ghidra/JVM,
game/application, historical-directory deletion, mounted-channel termination,
global configuration, unrelated PID change, child agent or Git mutation ran.

Root identified a harness gap: `Popen` precedes Job assignment, so an already
born child may be outside that Job. The earlier statement that every server
belongs to an owned Job therefore did not establish containment of every
pre-assignment descendant. Repeating `TerminateJobObject` cannot reap an escaped
child. Previously retained handles could wait/query but lacked termination access.

The exact helper diff is **16 added / 2 removed lines**: retain
`PROCESS_TERMINATE` alongside the existing handle rights, then attempt
`TerminateProcess` only on recorded handles still alive after Job termination.
Retained kernel handles preserve identity across PID reuse. A failed termination
gets a bounded 10-second wait for a racing exit; a still-live process remains an
error. The original natural-EOF code, assertions, deadlines and production
launcher are unchanged. This is fallback cleanup for recorded owned descendants,
without a new watcher or process-name scan. Exact unified diffs and before/after
bytes are outside Git in
`S:/Projects/UCP/de-research/openshc-process-lifecycle-fix/cleanup-r2/`:
`test_lifecycle.diff` and `test_lifecycle_unit.diff`.

The new finite synthetic unit case delays assignment until a self-authored
30-second child exists and its parent/creation/command identity and handle are
recorded. It explicitly verifies that child is outside the server Job, lets its
parent exit on real stdin EOF, then raises an intentional body assertion. The
helper must preserve that assertion while forcibly reaping the escaped child
through its exact retained handle. A separate test-only safety Job contains the
synthetic child before it resumes, so an assertion/startup failure or a broken
helper can still be cleaned up independently. The test also owns its exact
parent `Popen` handle and a duplicate child audit handle. No borrowed PID is used.

Final focused verification: **5 tests passed in 1.430 seconds**, including the
four existing launcher ownership/error unit cases. The final synthetic child
PID was `54316`; `escaped-child.processes.json` records its exact creation time,
parent and command, the handle-termination record and final reap. Its audit
reports `outside_server_job: true`, `rescue_needed: false`, `parent_exited: true`,
`child_wait: 0` and `safety_job_active: 0`. Forced cleanup is intentional in this
synthetic assertion case and does not replace the earlier eight cases' natural
EOF evidence. No heavy case was rerun by this follow-up. Root independently
confirmed the same frozen hashes and all five focused checks, then began its
own bounded baseline/eight-case replay; that replay's result is root-owned.

Development diagnostics are retained, rather than labeled as passes:
`synthetic-first.log` records a base-interpreter pywin32 import failure before
child creation; its temporary outside-Job audit placeholder is not witness
evidence. `synthetic-second.log` and its process/audit files record an
access-denied termination race and successful independent safety rescue. The
final helper adds the bounded exit wait for that race. Windows documents both
asynchronous termination and access denied after process termination in its
[TerminateProcess contract](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-terminateprocess).
`synthetic-third.log` and `unit-final.log` record passing final-source probes.

Frozen SHA-256 values:

- `test_lifecycle.py` (22,243 bytes):
  `e771384e6b3ee4d70072732568c0c523248ce3aa252fa9b7b54c27890f511e84`.
- `test_lifecycle_unit.py` (12,082 bytes):
  `142ca744c67dfc5bdd702f5f304ece06ac7de1fa51fb18b26f59f277601ac24f`.
- Unchanged `launch.py` (5,128 bytes):
  `78a8a297d4095e0f9fc86a9ae4339efd9c2268016333064138da086e0925e5df`.
- Before-change helper:
  `a12927a8a4b1e2d7d04ee96922f1d7454213d7f05ccb7da3d72be004de2ef037`.
- Before-change unit file:
  `a88d1b10dd8363f95a9ef412f89f840350c8638c4fcf2d1cfd209a2e65cdbb6c`.

Finite reproduction from `S:/Projects/UCP/AI-Toolkit-DE`:

```powershell
$env:PYTHONDONTWRITEBYTECODE='1'
& 'S:\Projects\Harness\tools\openshc-mcp-py313\Scripts\python.exe' -B `
  'S:\Projects\Harness\tools\openshc-mcp\test_lifecycle_unit.py' -v
& 'S:\Projects\Harness\tools\openshc-mcp-py313\Scripts\python.exe' -B `
  'S:\Projects\UCP\de-research\openshc-process-lifecycle-fix\cleanup-r2\freeze.py'
```

The second command freezes exact helper bytes/diffs/hashes and performs a
read-only final WMI check of recorded PID **and creation identity**, with no
termination action. `source-pins.json` and `final-audit.json` record the result:
**zero matching owned processes alive, zero safety-Job processes, and zero
owned synthetic temporary directories**. Unrelated active lightweight mounted
connections were preserved. The helper source is frozen and ready for root.

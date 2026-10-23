# Process ownership and OpenSHC helper cleanup

23 October 2026. The user's Task Manager report prompted a live process audit.
This steering is preserved in goal00, contract01 and engineering05. It does not
pause or replace the full Classic/DE objective.

## Observed ownership and cleanup

The initial Win32 inventory found36 Python processes:18 virtual-environment
launcher/base-interpreter pairs, all running the exact
`S:/Projects/Harness/tools/openshc-mcp/launch.py` command. Their chain reaches
native Codex PID42044, also the parent of this thread's actual shell command.
Summed working set was approximately5.94GiB. Later samples found many copies
idle25–169 minutes; executable name alone was not used to classify them.

The local launcher eagerly imported Ghidra and copied/opened a private project
before starting MCP stdio. That explains substantial idle allocations. A process
inventory alone does not prove whether a client channel was retained, startup
failed or EOF handling failed; the bounded launcher task tests those separately.

Root rechecked each candidate's PID, creation time, exact command, executable and
parent before stopping it, and checked for unexpected non-console children.
Sixteen explicit stops plus naturally exiting/already-exited helpers removed all
36 initial identities. A newly auto-started unused pair47764/50320 was separately
identified and closed. Root then observed zero Python processes. No unrelated
Python command line was targeted, and no Codex/T3 parent or game was stopped.

Subsequent Python processes were positively attributed to the fix's finite
`test_lifecycle.py --after --heavy-only` / `--serve-current` diagnostic, with
their own tracked parent/shim chain. They are distinct from the cleared idle
mounts; their final exit/reaping must be checked before the fix reports success.

The exact snapshots/actions are outside Git:
`S:/Projects/UCP/de-research/process-cleanup-20261023-{before,actions,after,current,clean-check}.json`.
The historical final-zero observation is in the root tool result; clean-check
captures later explicit test processes and must not be called a zero-process
snapshot. Working-set sums are process observations, not a precise attribution
of physical RAM freed across the entire machine.

## Temporary copies and policy boundary

The launcher sessions directory contained357 pre-audit `client-*` database
copies, including327 with Ghidra lock sidecars. No standalone Java/Ghidra GUI
process was observed. The base `project` directory is distinct and protected.

The planned cleanup checked the exact absolute sessions parent, direct child
names, known private-project layout and reparse-free traversal. Automatic command
review rejected the deletion command **before execution**, reporting only
`blocked by policy`. No directory deletion ran, and no alternate tool/language
was used to bypass that rejection. Those old database copies remain in place.
Plans and shape inventories are retained outside Git; this is not a claim that
all historical copy ownership was proved from timestamps alone.

## Corrective owner and acceptance gate

A bounded Sol6.1 task owns only the local OpenSHC launcher and focused lifecycle
tests, plus Report48. It must preserve the tool manifest and user project, defer
Ghidra/project creation until a real dependent call, and test actual stdio EOF,
error, timeout and descendant cleanup with owned processes. No global Codex/T3
configuration change or idle-kill timer is authorized by that assignment.

Root independently reviews its source/protocol evidence and rechecks the final
process state. The new standard applies to every task: own and reap helpers,
descendants, pipes and new temporary resources; a completed parent shell is not
proof of child shutdown. Old blocked copies remain outside this fix's cleanup
scope. F2W1 desktop implementation continues; completed SPR2 awaits independent
review after the process-fix slot becomes available.

## Coordinator closure

Report52 now accepts the local lazy launcher and the narrow test-owned cleanup
correction after independent execution. Five ownership/error tests, the saved
baseline and all eight final real-process cases pass. The12 tool contracts match;
real decompilation reuses one copy and heavy EOF exits naturally in0.705seconds.
All finite test descendants/copies are reaped. Newly active mounted connections
remain around60MiB without a loaded JVM; host-retained channel lifetime and forced
termination are separate explicit limits. Historical blocked copies remain.
The full DE goal and independent desktop/Sprite reviews continue.

# Root review of the local OpenSHC process fix

23 October 2026. **Accepted for the local Harness launcher and its finite test
helpers.** This is process-maintenance acceptance, not desktop/game acceptance.
The full Classic/DE goal remains active. Reports47/48 preserve the original
inventory, implementation, failed experiments and exact source pins.

## Scope and independent observations

The runtime owner remains `S:/Projects/Harness/tools/openshc-mcp/launch.py`.
No Toolkit application renderer, OpenSHC upstream source, installed package or
global Codex/T3 setting was changed by this fix. Committing these reports does
not version that external launcher or create another runtime implementation.

Root inspected the complete launcher, its upstream dependency/tool registration
paths and the small test-harness correction. Optional Ghidra state is connection
owned and lazy. Public FastMCP registration preserves the upstream contracts;
project/program closure precedes removal of the connection's new private copy.
The duplicated stdin descriptor has one explicit lifetime and addresses the
observed Windows CRT/JVM interaction. Ghidra remains on its original inline
thread. No idle watcher, eager copy or worker-lifetime workaround was retained.

Root independently froze the three final sources, rebinding only the tests'
`HERE` and unit-test evidence directory into its own output tree. Execution
still uses the canonical external production launcher. The unchanged source
hashes were verified again after execution:

- Launcher: `78a8a297d4095e0f9fc86a9ae4339efd9c2268016333064138da086e0925e5df`.
- Process helper: `e771384e6b3ee4d70072732568c0c523248ce3aa252fa9b7b54c27890f511e84`.
- Unit helper: `142ca744c67dfc5bdd702f5f304ece06ac7de1fa51fb18b26f59f277601ac24f`.

Fresh root execution passed all five ownership/error unit checks, including an
explicit recorded child outside the server Job after an intentional assertion.
The escaped child was terminated through its retained exact handle; its separate
safety Job needed no rescue, and both parent and child were reaped. This narrowly
closes the observed cleanup gap without claiming atomic process-tree containment.

The saved eager baseline and all eight final real-process cases passed. The full
12-tool metadata manifest matches per name, including descriptions and schemas.
Listing/source calls create no private database. Empty EOF, malformed request
recovery, closed output, startup timeout and initialization-error/source recovery
all exit and reap naturally. The closed-output case intentionally exits120.
Actual installed MCP SDK client closure also passes.

Two genuine read-only decompilations reused one copy and reproduced the pinned
30,280-character result hash `46fe506fc8ed500dc303a738eaf83c6d42853973ce98e31bd80a859b8f83661e`.
The subsequent heavy EOF exited0 in **0.705 seconds**, with no forced cleanup or
retained copy. Baseline/source EOF took0.716/0.535 seconds. Every ordinary case
and the outer finite supervisor records `forced_cleanup:false` and final reap.
The intentional escaped-child assertion is a separate forced-cleanup test.

Root's instantaneous base-interpreter working sets were626,966,528 bytes after
eager initialization/listing versus63,533,056 after lazy listing and63,627,264
after source reading. These corroborate report48's582-to60MiB comparison; they
are not heap limits or a machine-wide physical-memory measurement. Genuine
Ghidra use still requires hundreds of MiB. No draw/input performance claim follows.

## Evidence and remaining limits

Fresh root evidence is outside Git at
`S:/Projects/UCP/de-research/root-openshc-lifecycle-review-r1`.
`source-identity.json` records original/configured test hashes;
`verification.json` binds28 protocol/source records and the separate escape
audit. `protocol/*.processes.json` records the exact owned PIDs, creation times,
commands, natural exits and reaping. Setup/verifier scripts are retained beside
that directory. No mounted OpenSHC tool was used for this replay.

The17:52:22 UTC read-only `live-process-audit.json` finds only three newly opened
mounted client pairs, each base interpreter around60MiB with **no loaded JVM**.
Those active channels are distinct from the cleared historical heavy processes
and the completed test descendants. Starting further agents can create further
light channels. The launcher cannot close a host-retained stdio channel merely
because an agent turn ended. Cached-channel retirement remains host-owned.
Forced OS termination can bypass `finally`; closing during long native work
can still leave a copy under the client's short termination policy. These limits
are explicit rather than hidden by an idle-kill timer or a process-name sweep.

The historical357-copy deletion was rejected before execution with only
`blocked by policy`. No alternate tool retried it, and those files remain.
New test-owned temporary resources were cleaned through their normal owners.
The process ownership/lazy-state/finite-reap requirements now live in goal00,
contract01 and engineering05 and are included in every new agent brief.

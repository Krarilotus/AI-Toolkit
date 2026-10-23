# Idle OpenSHC MCP clients: root audit and containment

23 October 2026. This concerns research tooling, not a Toolkit application leak.
The user again reported many idle Python processes. The earlier lazy-Ghidra
correction reduced memory per client; it did not prevent client accumulation.

The initial CIM census found46 Python processes:23 launcher/interpreter pairs,
all using the configured OpenSHC MCP launcher and parented through Codex
app-server PID42044. Their combined working set was about1,509MiB. A corrected
identity-bound observation found44 surviving original identities, all with zero
CPU change, no loaded JVM/Ghidra module and no module-inspection error. They were
idle connections, not active decompilation jobs. The exact association of each
connection to an individual completed thread was not established; the observed
process owner and launcher were established.

Root stopped40 positively identified idle Python processes in20 pairs. Six of
the original46 exited naturally during the audit. The final census was **zero
Python processes**. Only the exact launcher trees, including their owned console
hosts, were targeted. Codex, T3 and unrelated applications were not terminated.
No directory/evidence cleanup was attempted.

The first cleanup attempts stopped nothing: one encountered PowerShell JSON
array enumeration differences; the corrected guard then refused the additional
owned conhost child. Their receipts are retained. The final guard checked current
PID, creation time, command, executable, parent/children, unchanged CPU and
absence of JVM state before each targeted termination. This is a finite verified
cleanup, not an OS-wide guarantee.

Root backed up the user Codex config in its original private directory and set
only `mcp_servers.openshc.enabled=false`, retaining the launcher, arguments and
environment. The installed CLI's `mcp get openshc --json` reports disabled. A
project-only override was tried first but that CLI still reported enabled; it
was not accepted as proof of effective containment. No trust policy, T3 server,
agent model or Toolkit configuration was changed. Explicit finite research
access remains available; do not automatically re-enable this optional MCP for
every agent.

OpenAI documents the supported [MCP enabled setting](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).
Its [app-server lifecycle documentation](https://learn.chatgpt.com/docs/app-server)
also distinguishes thread subscriptions and unloading. Those documents do not
prove that T3 issued unsubscribe for these particular clients. Root did not
restart the shared app-server or invent an MCP idle-timeout option. General host
connection retirement remains outside this local containment fix. Explicitly
enabled clients still require lifecycle cleanup.

After starting the next bounded correction agent, a fresh root census again
found zero Python processes. Continue checking actual attributed resources at
task completion; a terminal task status alone is insufficient.

Evidence remains outside Git under
`S:/Projects/UCP/de-research/root-desktop-observation-r3`:

- `python-audit-current.json`: original identities and memory sample.
- `python-audit-final-candidates.json`: corrected idle/JVM observation.
- `python-idle-cleanup.json` and `python-idle-cleanup-r2.json`/`r3.json`:
  retained guarded attempts which terminated nothing.
- `python-idle-cleanup-r4.json`: successful cleanup and zero census.
- `openshc-disabled-config-receipt.json`: private backup path and config hashes;
  the configuration contents are not copied into Git.

The full Classic/DE goal remains active. Review74 still blocks its first-run
slice. Domain Review76 and watch Review73 are separate bounded GOs, not desktop
or game acceptance.

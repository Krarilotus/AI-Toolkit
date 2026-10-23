# Game acceptance preparation, 23 October 2026

The coordinator prepared a physical game copy and verified scoped recovery data.
**No game was launched. `launchAllowed` remains false.** This advances the finite
Review22 preflight; it does not establish an isolated runnable installation.

All artifacts remain outside Git at
`S:/Projects/UCP/de-research/game-acceptance-preflight-20261023-r1-prepared`.
Commands used explicit Toolkit workdir `S:/Projects/UCP/AI-Toolkit-DE`, branch
`de/separate-game-mode`, HEAD `e3d891cb815a9758542b897065141e71da4a7ca2`.
The installed build remains24816905. A fresh process inventory found no
Stronghold/Crusader process before preparation. This is not a later launch gate.

## Observed preparation

- Read-only inventory found4,702 installed files totaling6,730,673,704 bytes.
  Native and managed DLL hashes still equal the pinned FBCB9319 / BC8B6A39
  baseline. Source files/ancestors were checked for reparse points and hardlinks.
- The reviewed `isolation-harness-a/snapshot.py` algorithm ran with `--backup`.
  Its output root alone was rebound in memory to the new preparation directory;
  the original script and harness receipts were left untouched. It copied116
  scoped profile/Workshop/per-app bookkeeping files totaling234,511,705 bytes.
  Exact PlayerPrefs recovery data is DPAPI encrypted outside Git.
- A separate check rehashed all116 copied files against the inventory and
  decrypted the DPAPI blob in memory to verify its recorded tree digest.
  No registry plaintext was written or printed. This verifies recovery bytes,
  not an actual restoration or an atomic snapshot of a running Steam client.
- An unmodified physical copy was created in `game-original-copy`, using new
  files rather than links. Every copied-byte digest equals its independently
  reread destination SHA-256; source paths/sizes/mtimes/link counts agree before
  and after. Both pinned DLLs match. Copy finished at16:17:04 UTC.
  The record does not claim protection against privileged or timestamp-preserving
  concurrent source mutation. No copy is treated as isolated merely by location.

`source-inventory.json`, `preparation.json`, `physical-copy.json`,
`backup-verification.json` and the pointed snapshot inventory bind these results.
`receipt.json` hashes those records and the exact preparation scripts. No
original game/profile/settings/registry/ACL write or Steam policy change occurred.

## Commands and retained setup failure

```powershell
python -B S:/Projects/UCP/de-research/prepare-game-acceptance-r1.py
python -B S:/Projects/UCP/de-research/copy-game-acceptance-r1.py
```

Both final commands completed with exit0. A first preparation attempt assumed
the native DLL was at the installation root and stopped before backup/copy.
The existing catalogue supplied its actual `Data/Plugins/x86_64` path. The
failed directory retains `setup-failure.json`; the corrected run used the fresh
`-prepared` directory. No failed attempt is counted as passing evidence.

These one-run scripts refuse existing output/copy directories. Reproduction must
select fresh owned output paths, retaining the old evidence. The inventory and
backup verification are preparation evidence and must be refreshed at launch.

## Remaining owner and launch gates

The next acceptance-tooling slice must prepare fresh managed/engine identities,
guarded transformations and native path assertions for this exact physical copy.
The prior harness has fixed roots: its binaries cannot simply be relocated into
this new copy. Use one concrete run manifest and preserve licensing/authentication.
Independently verify its changed artifacts before launch.

Then establish app-specific Steam Cloud/queue state and record any permitted
temporary UI change plus restoration policy. Check activity/processes and take
fresh scoped before/after inventories. Observe startup/exit preservation before
installing the representative exported package or testing gameplay. Early Unity,
native/child and Steam-client behavior remains unverified. Review22 and the
acceptance protocol retain the two scoped stream limitations. No change here
closes package, media, real-game or Classic acceptance.

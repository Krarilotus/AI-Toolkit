# Owned game-copy installation plan

23 October 2026. Root prepared a concrete five-file installation/rollback plan
for the physical copy from41 and the relocated offline artifacts from46.
**No artifact was installed and no game or Steam initialization occurred.**
This is preparation for the original isolated-game acceptance requirement.

The external plan is
`S:/Projects/UCP/de-research/game-acceptance-preflight-20261023-r1-prepared/relocated-harness-r1/owned-install-plan-r1.json`,
SHA-256 `6bf3c6380c38f7ce8381292f1decd4a5f8637d1d3b011056c91c6cdb5565cf2b`.
It binds the run manifest and all37 configured receipt entries. Root freshly
rehashed all37, checked ordinary/unchanged resolved ancestors, and verified the
unmodified copy's native DLL against `FBCB9319...`. The planning script reads
inputs and creates only this new JSON plan; it performs no installation, backup
restoration or launch. The existing configured receipt remains unchanged.

| Owned copy target | Planned action |
| --- | --- |
| `*_Data/Managed/Assembly-CSharp.dll` | Replace with the deterministic195-site offline artifact; preserve exact old bytes in a new copy-only backup |
| `*_Data/Managed/OfflineA.Guard.dll` | Add the relocated guard; target is currently absent |
| `*_Data/globalgamemanagers` | Replace with the previously reviewed engine-identity metadata artifact; backup old bytes |
| `*_Data/app.info` | Replace with the matching two-line engine identity; backup old bytes |
| `steam_appid.txt` | Add exact prepared app-ID bytes; target is currently absent |

Every operation has exact source/old/new sizes and SHA-256, a contained absolute
destination, and its rollback rule. The backup root is a new owned child of the
relocated harness, separate from original user-profile recovery data. Later
installation must revalidate paths/hashes and create verified backups before
changing the copy. Rollback may restore/remove only the expected installed hash;
an unexpected changed target stops the operation. Neither the installed game nor
its original profiles/Steam bookkeeping is a destination in this plan.

Reproduction uses explicit Toolkit cwd and the external finite Node script:

```powershell
node 'S:/Projects/UCP/de-research/prepare-owned-game-install-plan-r1.cjs'
```

The script refuses an existing output plan rather than overwriting evidence.
Its first execution exited0; all37 receipt entries match, three overwrite targets
match their pinned originals, and both add targets are absent. Managed and native
input hashes still match the reviewed build. No broad4702-file rehash or fresh
runtime/preservation observation is claimed here.

Independent configured-artifact/plan review, effective early Unity/native/child
path observations, a fresh preservation baseline, app-only Steam Cloud/queue
policy and user-idle checks remain before the root-owned startup/exit gate.
`artifactsInstalled`, `launchAllowed` and `gameLaunched` remain false. This plan
does not establish playable export, media, loader or Classic acceptance.

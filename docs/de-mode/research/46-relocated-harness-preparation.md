# Relocated offline game-test artifacts

23 October 2026. The coordinator configured the reviewed harness for the
physical copy from Report41 and verified its offline outputs. **Artifacts are
not installed; no game/Steam initialization occurred; launchAllowed stays false.**

Outputs are outside Git under
`S:/Projects/UCP/de-research/game-acceptance-preflight-20261023-r1-prepared/relocated-harness-r1`.
`run-manifest.json` is the concrete root plan. The managed profile is its
`owned/profile` child; the copy remains the sibling `game-original-copy`.
The unused engine namespace is `Toolkit DE LabA / AIToolkit DE Offline A`
with the exact existing38-character product padding from the reviewed metadata.
Its predicted LocalLow directory and exact registry key were read-only checked
absent. This must be checked again at launch.

## Fresh observed checks

- Verified six reused harness source/tool hashes against its original package
  index, all nine critical copy-input hashes against the reviewed build, and
  the exact existing .NET compiler hash. No source/game input was changed.
- Generated the guard from the reviewed source by changing exactly three path
  declarations: Base, Profile and CopyRoot. Policy methods remain source-identical.
  The manifest and `configuration-delta.json` record those values.
- Compiled only offline Guard/Audit/Instrument tools. The managed metadata
  transformation is deterministic, changes the expected195 sites in55 original
  methods and leaves8,083 original methods unchanged. All12 licensing-related
  method bodies remain byte-identical. The transformed game assembly itself is
  byte-identical to the earlier independently reviewed artifact: only the separate
  guard's configured roots changed.
- Reexecuted the unchanged metadata-only engine identity transformation. Both
  globalgamemanagers and app.info outputs equal the earlier reviewed artifacts;
  its other objects/settings and byte-exact reversal assertions pass.
- Compiled and ran a small relocation smoke helper:17 checks pass. It verifies
  actual new constants, persistent/bridge paths, an owned guarded stream write
  and cleanup, a synthetic protected sentinel's preservation, and denial of
  traversal, prefix siblings, UNC/device/alternate-stream paths and a synthetic
  registry mutation. It loads no game/Unity/Steam assembly into the CLR.

The smoke writes only new synthetic files in the prepared tree. The intended
managed-profile directory is now present and empty after its probe cleanup;
the separate synthetic protected sentinel remains. The real game copy's critical
inputs and all original harness sources rehash unchanged. Neither original
profiles/registry/ACLs nor Steam policy were modified.

The new17 checks do not replace or expand the prior51-case guard audit. Its
memory-compression and dirty pre-opened stream limitations remain as scoped in
Review22. CLR tools do not establish behavior inside Unity's Mono runtime.

## Reproduction and remaining owner

With explicit Toolkit cwd `S:/Projects/UCP/AI-Toolkit-DE`:

```powershell
python -B S:/Projects/UCP/de-research/prepare-relocated-harness-r1.py
python -B S:/Projects/UCP/de-research/verify-relocated-harness-r1.py
```

Both commands completed with exit0. The setup refuses an existing output tree;
use fresh owned paths to reproduce without overwriting evidence. Command arrays,
exits and outputs are in commands.json/smoke-commands.json. The unchanged legacy
runner is retained as `provenance/pinned-run-source.py`, deliberately outside the
runnable entry points because its main still refers to the old research paths.
`configured-receipt.json` binds current artifact/source/record hashes after that
label correction; the earlier receipt remains historical.

Next: independent configured-artifact review; finite early Unity/native/child
observation and effective temp/cache/path assertion handoff; an exact reversible
installation manifest for the owned copy; app-only Steam Cloud/queue evidence;
fresh activity/process and preservation checks; then root-observed startup/exit.
The copy remains unmodified pending those steps. No startup, gameplay, playable
export, media, loader or Classic acceptance closes here.

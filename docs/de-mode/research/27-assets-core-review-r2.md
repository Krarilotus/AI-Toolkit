# Independent A1 assets-core review, round 2

2026-10-23. **GO for the exact additive, unexposed A1 metadata crate commit.
A1-R1-01 is closed.** No actionable P0/P1/P2 finding remains in this bounded
correction review. The coordinator retains final acceptance, staging and commit
ownership. This approves no decoder, provider integration, UI or game feature.

## Scope and reviewed identity

Read first and in full: `00-goal-verbatim.md`, `01-working-contract.md`,
`02-plan.md`, `05-engineering-standard.md`; then the full reports 14/16/24,
including handoff16's appended round 2 response. Independently inspected the
complete before/after crate diff and the final geometry/Work/reference code,
source/notice contracts, fixture builder and probe transports. Review is by
Sol 6.1, with no children.

Every `exec_command.workdir` explicitly used
`S:/Projects/UCP/AI-Toolkit-DE`; paths were absolute. This remains the shared
checkout, with no T3 worktree isolation. Branch is `de/separate-game-mode`;
start/end observed HEAD is `773f80b8a31d9337cd83342957bd8b76d969515c`.
C1/DS1/coordinator changes in other paths were left alone. Only this report was
written inside Toolkit. All reviewer code, logs, synthetic bytes and build
output are under `S:/Projects/UCP/de-research/review-assets-a1-r2` (**R**), with
dedicated `target-msrv`, `target-current`, `target-consumer`, `target-parity`.
Neither earlier evidence package was overwritten. No implementation/test/other
document edits, staging, commit/push, CI/PR/release, dependency/toolchain install,
app/game/Steam launch, installed/original/Classic or OS changes occurred.

## Prior finding closure and independent reproductions

**P2 A1-R1-01 — CLOSED.** The geometry owner now receives the caller's existing
`Work`; repeated descriptor ranges consume the same cumulative allowance and
check its real cancellation atomic. Raw parsing remains a separate operation.

The scratch consumer at R/`probe` is an ordinary binary depending on the actual
crate, compiled on Rust 1.88 without `cfg(test)` in that dependency. It imports
only the unchanged synthetic wire builder. Its own construction reproduces the
original **977,976-byte** Sprite: **19,000** legal repeated submesh descriptors,
**32,766** indices each, **622,554,000** total index visits. A read-counting
wrapper around immutable `BytesSource` distinguishes geometry failure from a
later texture-read cancellation. No new production hook or hostile source is
required. Evidence: `consumer-debug.log`, `consumer-release.log`,
`consumer-witness.log`; exact argv/environment/exit receipts in
`consumer-checks.json` and `witness-check.json`.

- Both direct `validate_geometry` and `validate_sprite` exhaust each tested
  geometry allowance **0; 1; 50; 128; 32,000; 33,000; 65,536; 1,000,000**, returning
  `Limit("work units")` with zero remaining. Index validation makes exactly one
  source read, for the Sprite; it never reaches the Texture2D read. Raw metadata
  compares equal after every failure and re-parses with exactly object-byte
  allowance, leaving zero. No byte/count limit was increased.
- The complete legal counterexample succeeds in an optimized consumer with
  exactly **622,687,086 geometry units**, leaving zero:
  `86 + 19,000 * (7 + 32,766)`. Repeated ranges were preserved, not rejected as a
  workaround. A smaller three-range case costs exactly 125 units. Two calls
  sharing 249 units allow the first and limit the second; an exact combined
  Sprite-read + geometry + Texture2D-read allowance succeeds with zero remaining
  and exactly two reads. There is no submesh/object/validation reset.
- A separate deterministic production-build budget witness changes only index
  visit 1,025 to an invalid vertex. Geometry allowance 1,117 returns `Limit`
  **before** that visit; allowance 1,118 reaches it and returns
  `Corrupt("submesh index vertex")`. Both direct and index routes agree, preserve
  raw metadata and avoid the texture read. This independently corroborates
  per-index accounting without the implementer's private test countdown.
- Real atomic cancellation requested by another thread interrupts both routes
  after substantial geometry progress. Geometry units consumed, excluding any
  Sprite read, were **1,509,736 direct / 1,077,730 index** in debug and
  **47,105,948 direct / 46,600,647 index** in release. All are beyond the 93 units
  preceding index work and below 622,687,086. No texture read occurs; raw
  metadata remains equal. A 50 ms sleep only triggers the request; neither these
  progress receipts nor closure assert a portable latency/scheduler bound.
- Empty shapes and dimension-zero channels exhaust work, pre-cancelled geometry
  spends nothing, `u64::MAX` allowance subtracts correctly, and maximal wire-sized
  index offsets/counts fail checked span bounds. The library's deterministic
  cancellation tests additionally stop after 1,024 index visits, before the
  deliberately invalid 1,025th, and cover the last visit and other geometry
  branches. Their private injection sets the real atomic.

### Loop coverage, arithmetic and API propagation

`src/metadata.rs:282-441` checks cancellation at entry and successful completion.
Every nonconstant traversal has cumulative charges: finite scalar walks at 286;
bind-pose matrices at 317 through their fixed 16 scalars; shapes/points at 320-324,
including empty shapes; bones at 326-330; channels and overlap comparisons
at 338-356; stream/layout/span walks at 361-376; channel/vertex/component walks
at 378-396; submesh descriptors/bounds and every index visit at 403-439. Component
count is checked at most 4 and bound-array lengths are fixed. Stream keys are
validated 0..15, so BTreeMap operations do not hide an attacker-sized map walk.
The remaining extent predicates/fixed field loops are constant size. No
variable index span is traversed between unchecked cancellation points.

`src/serialized.rs:426` charges each secondary reference and `:435` passes the
same mutable Work into geometry. `validate_sprite(key, work)` retains its
signature. The direct no-argument geometry method becomes
`validate_geometry(&mut Work)`; all owned callers are updated and ordinary
consumer compilation confirms propagation. The crate is still absent from app
manifests and other crates' dependencies. No duplicate Node parser is needed.

`src/lib.rs:122-136` checks cancellation before checked subtraction. A failed
subtraction leaves the balance unchanged; earlier successful charges remain
consumed. There is no count multiplication used as an unchecked allowance or
reset. The changed exhaustion diagnostic, `"work bytes"` to `"work units"`, and
mixed byte/geometry accounting are documented in the README. Metadata/layout,
reference errors, packing policy and source-token semantics otherwise retain
their prior contracts. The countdown field, initializer, charge-injection block
and test modules are all `cfg(test)`; none exists in a consumer build. The x64
consumer's Work size is 24 bytes, consistent with its three production fields.

### Ownership, readability and preservation

Carrying existing Work at the asset-core geometry owner is the smallest coherent
correction. It replaces the missed CPU boundary without another host policy,
new resource framework, overlap prohibition or changed parser. The explicit
charge in each traversal is readable and makes cost/cancellation auditable.
The private test injection earns its limited complexity through deterministic
mid-loop/last-visit evidence; no public callback/API is introduced. No optional
style preference is being promoted into another correctness gate.

R/`verify_snapshot.py` inspected receipt shapes before comparing contents:
`final-sha256.json` is an object with 18 crate entries plus handoff; the baseline
and Review24 end receipts are 17-entry arrays with capitalized fields. Actual
start/end SHA-256 and sizes match **18/18 crate files + handoff16**, and all
**22** correction evidence hashes match. The final receipt itself hashes to
`4c4297f3262cf70721d8f796f1df19558ce8212e98d28f0c508e0d0bbd7362e9`.
The saved original crate matches Review24's 17 hashes independently. Actual
before/after diff confirms exactly five original files changed (README,
lib/metadata/serialized, core tests), one geometry test file added, and 12
original files unchanged. Sprite wire types/parser prefix, Texture wire
parser/types suffix, fixture builder and original handoff prefix are preserved
byte-for-byte. `independent-crate.diff`, `hash-start.json`, `hash-end.json` record
these checks. No proprietary payload or schema dataset enters Git; source/layout
pins and notices retain their reviewed hashes.

## Commands and verification results

All commands used the explicit Toolkit workdir. Existing toolchains only; every
Cargo build/test used an external dedicated target and `--offline --locked`
(the initial scratch-only lock generation uses `--offline`). Full exact command
arrays, cwd, environment, exits and logs are in R/`checks.json`,
`consumer-checks.json`, `witness-check.json`, `parity-checks.json`.

```powershell
python -B S:/Projects/UCP/de-research/review-assets-a1-r2/verify_snapshot.py start
python -B S:/Projects/UCP/de-research/review-assets-a1-r2/run_checks.py
python -B S:/Projects/UCP/de-research/review-assets-a1-r2/run_consumer.py
# The final consumer source also supports the independently added witness:
$env:RUSTUP_HOME='S:/Projects/UCP/de-research/assets-core-a1/rustup'
cargo +1.88.0 run --manifest-path S:/Projects/UCP/de-research/review-assets-a1-r2/probe/Cargo.toml --target-dir S:/Projects/UCP/de-research/review-assets-a1-r2/target-consumer --offline --locked -- --witness-only
python -B S:/Projects/UCP/de-research/review-assets-a1-r2/verify_snapshot.py end
```

`run_checks.py` sets separate owned fixture directories and runs:

| Check | Independently observed result |
| --- | --- |
| Rust 1.88.0 full debug suite | 35 passed: 6 library + 20 core + 9 resolver; doc 0 |
| Rust 1.98.1 full debug suite | 35 passed; doc 0 |
| Rust 1.88 optimized library regressions | 6 passed |
| Rust 1.98.1 scoped Clippy, all targets, `-D warnings` | Pass |
| Scoped `cargo fmt --check` | Pass |
| Rust 1.88 ordinary consumer debug/release + exact index witness | All assertions pass; exit 0 |
| Fresh hash-gated local full-field parity | 3 Sprites + 3 referenced Texture2Ds pass |

The fresh parity task independently narrows the **unchanged original** transport
and oracle to direct IDs for Camel 512 (11 vertices), fractional Healer 640
(5 vertices) and outpost 1290 (quad), plus their three Texture2Ds. It compares all
typed fields, float32 bits, arrays, PPtrs and blobs against fresh reads by the
pinned UnityPy oracle **and Review24's independently reviewed canonical hashes**.
Usable geometry/references, ranges and bounded first-block reads pass. Index
reports 137,773 objects, 51 scripts, 3 externals. Rust pass 0.228 s is diagnostic,
not startup/performance acceptance. Fresh full 86-object parity and full name
scan were not rerun or claimed; their readers, builder and original probe files
are unchanged. Implementer's separate 7+5 focused result was inspected and
hash-verified, not relabelled as this review's run.

Parity setup/run is R/`prepare_and_run_parity.py`; its scratch-only copy creation
intentionally refuses existing directories, so use fresh output paths to rerun
setup. The resulting focused wrapper can be rerun directly:

```powershell
& ([ScriptBlock]::Create((Get-Content -Raw -LiteralPath S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/probes/local_parity.ps1))) -DataRoot 'D:/SteamLibrary/steamapps/common/Stronghold Crusader Definitive Edition/Stronghold Crusader Definitive Edition_Data' -OracleDependencies S:/Projects/UCP/de-research/assets/pydeps -LayoutEvidence S:/Projects/UCP/de-research/rendering-contracts -Scratch S:/Projects/UCP/de-research/review-assets-a1-r2/parity -Target S:/Projects/UCP/de-research/review-assets-a1-r2/target-parity -ProbeDirectory S:/Projects/UCP/de-research/review-assets-a1-r2/parity-probe/probes
```

The wrapper independently hashes the opened art inputs once each and retains
read/share locks. Both match Review14:
`resources.assets` 114,825,928 B,
`9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a`;
`resources.assets.resS` 1,396,428,560 B,
`be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e`.
Evidence is R/`parity/parity.json`, `rust-transcript.tsv`, `rust-stderr.txt`,
`parity-wrapper.log`. Proprietary transcripts remain outside Git.

## Exact reviewed source SHA-256

Actual start/end hashes below are equal. R/`review-evidence-sha256.json` also
records the final report and reviewer evidence hashes. Paths are relative to
`crates/de-assets-core/`.

| File | SHA-256 |
| --- | --- |
| Cargo.lock | `f5e73ffb5b3565362a877c1a0065e9a93b8377b6032ead12b9b059a9c5dfb666` |
| Cargo.toml | `dca676e50c37430a19594182c41f31e142ccdf64f7a60de65251d41ea2ef189a` |
| examples/local_probe.rs | `616e0b9537573c7fc06ec5a76cc0b58c7f4f9934637547d07102d888d5659517` |
| probes/local_oracle.py | `44814f8a3957338ef921fdb076635f5f461f5819c2efd2dfec6d463681c81561` |
| probes/local_parity.ps1 | `2e5569f2d4bd149f0a9eee87b011bd04ef522755c249ea30c0873947c8ea8b47` |
| PROVENANCE.md | `48e8efb34b47d7f2e822510445c2c4c9e785592ed4c8e4d8c81dace76393208f` |
| README.md | `cd1faf1cd8eb96f13a81ae1073db67c7a14fb3dd21a82c667e1559222560a68a` |
| src/cursor.rs | `d1d8cf8a4ec0395ffed8e75aae26c249c489f9302e81f18652bcb1a24d9a8527` |
| src/geometry_tests.rs | `5b7b2cd6a8a941bd13a39d65cce4c37dac1bd0358bdcc30e05a1ac5bcb00f3fb` |
| src/lib.rs | `b3c920b028edfe942d90abd2aed203408be182103735ee9ae3f60b61a2001a18` |
| src/metadata.rs | `aad585c8f985bf2ec189ff741c742e4815bef3e29e5583c0bc2b54777ef3953d` |
| src/reader.rs | `ac95e532269d613918bf173b5ac42c37668e4b1008b2c96c420cdd54e91c5601` |
| src/serialized.rs | `4fc14005a75f35f026f9acf0869f10b16389f10547dcbebab10bf9fefbf6a8c2` |
| src/streams.rs | `67a5cbe8a012b299b3f3d52f82d6f56eac59489ef57eab74d492ee73d0985d8d` |
| tests/common/mod.rs | `75afab63045cdeef168756fc9c6b36ca71a5a5a03157d24fbc6a25bf48d58fb4` |
| tests/core.rs | `61e1003e399d40234982db0a282356a7cf25064ecf7ca187b9b34981bd26bbc8` |
| tests/resolver.rs | `c4b4fafe2b5fd191e26a2c01159f2c056811ee244c36b1450048c26f99f3dc5d` |
| THIRD-PARTY-NOTICES.txt | `22d10f6ab80bf7bc78efd51a2744a6e9bcbe9870a65c126dd9da35581550c220` |

Reviewed handoff16 SHA-256:
`5af335efee14419d10ecda89689fd207d41c257d7e51fdca47711899e21ad057`.
The root should check these exact bytes and stage only the intended A1 milestone;
other owners' concurrent changes are outside this acceptance.

## Remaining gates and next narrow task

The Windows file-symlink test again reports missing privilege 1314: that case
remains **unexercised** despite the green test count. Directory-junction
rejection executes and passes. No privilege/OS change was attempted. Ordinary
fixed-local Windows NTFS/cooperating ReadAt and mutation exclusions remain
accepted as declared: no cryptographic snapshot, administrator/kernel or
stamp-preserving covert-mutation guarantee. Other OS/filesystem behavior,
future cache manifests, decoder correctness and live desktop behavior remain
unverified here. These are preserved limits, not new findings.

After the coordinator commits this additive milestone, the next asset task is
**PXL1 scratch-only block-decoder evaluation**, bounded by Review14: pin the
candidate source/transitive inputs, evaluate BC1 versus BC1a transparent index 3
and BC7 modes 0..7 against the existing oracle, verify BGRA/RGBA/row orientation,
truncation and wrapper bounds, then measure bounded crop I/O/memory/time and
release/dependency size plus complete notices. Compare representative unit,
building and mask blocks before selecting a dependency. No decoder install or
shipping choice was made in this review. Keep the one Rust implementation for
both hosts; thin provider integration follows its own reviewed contract.

Mesh/pixel reconstruction, packing variants, masks/shader/colour, pivots and
world anchors, final scene/facing, flat/lowered substitutions, complete Stockade
composition, cache/profile/window integration, Classic regressions, UI,
packaging and isolated game observations remain open acceptance gates. Metadata
closure and these local checks do not establish authentic rendered game output.

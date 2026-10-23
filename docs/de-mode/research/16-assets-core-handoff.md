# A1 serialized assets core: implementation handoff

2026-10-22. **Ready for independent code review; not integrated or accepted as a
rendering feature.** Read the verbatim goal, working contract, plan, synthesis,
reports 02/08 and all of Review 14 before implementation. This task implements
Review 14's conditional GO for a new metadata/index core only.

Original baseline: `818503dc40971defef3769ca883f82290405ab94`. Assignment named
HEAD `a2db8691cc9d0c14eb3fbaa278dc6a814b39338f`; shared HEAD was later observed
at `7f227286c6bd90f60a3ba3fd709484538efd66af` as other work progressed. No commits,
staging, resets, pushes or shared-file restoration were performed by this agent.
Every Toolkit shell command explicitly used
`S:\Projects\UCP\AI-Toolkit-DE`. There is no claimed T3 worktree isolation.
No children were spawned. No boundary expansion was required.

## Exact owned files

All are new:

```text
crates/de-assets-core/Cargo.toml
crates/de-assets-core/Cargo.lock
crates/de-assets-core/README.md
crates/de-assets-core/PROVENANCE.md
crates/de-assets-core/THIRD-PARTY-NOTICES.txt
crates/de-assets-core/src/lib.rs
crates/de-assets-core/src/cursor.rs
crates/de-assets-core/src/reader.rs
crates/de-assets-core/src/serialized.rs
crates/de-assets-core/src/metadata.rs
crates/de-assets-core/src/streams.rs
crates/de-assets-core/tests/common/mod.rs
crates/de-assets-core/tests/core.rs
crates/de-assets-core/tests/resolver.rs
crates/de-assets-core/examples/local_probe.rs
crates/de-assets-core/probes/local_parity.ps1
crates/de-assets-core/probes/local_oracle.py
docs/de-mode/research/16-assets-core-handoff.md
```

The crate is unpublished, Rust 2021/MSRV 1.88, std only, with its own standalone
workspace/manifest/lock. The lock has only this package. No app manifest/lock,
module declaration, Classic parser, Node/UI/IPC/generated TS, shared research
report or central document was modified. Build output is exclusively
`S:\Projects\UCP\de-research\de-assets-core-target`; scratch/toolchain/parity
evidence is under `S:\Projects\UCP\de-research\assets-core-a1`.

## API and implementation contract

`ReadAt` reports an opened-input `SourceStamp` and short-read-capable bounded
I/O. `SerializedIndex::read(source, limits, work)` fully validates the v22 index
before typed reads: exact extended length/endian/header tuple, Unity version,
platform/tree profile, signed counts with caps and remaining-span bounds,
class114 script-ID bytes, checked alignment/offsets, duplicate signed i64 IDs,
type indices, object spans/overlap, scripts, external descriptors, reference-type
count and user information. Nonzero reference types are unsupported. Other
classes remain opaque. Target type hashes/stripped/script index select the
audited layout at typed-read time; they are not authentication.

`ObjectKey` privately scopes a signed i64 ID to one index identity.
`find_name(class, exact_name, work)` returns explicit zero/one/many;
`find_names` batches an uncached scan. A mask lookup uses Texture2D/28, not a
global map. Names are strict UTF-8 and byte/case exact; no sparse-name compaction
or suffix interpretation occurs.

`read_sprite` and `read_texture` preserve every audited serialized field,
including raw float32 bits/boolean bytes/integers, negative atlas offsets,
fractional rectangles, GUID/render key, atlas tags/PPtrs, secondary textures,
submeshes/index bytes, vertex channels/blob, bind poses, physics shapes/bones,
packing settings, all texture settings/flags/platform blob, inline serialized
bytes and stream fields. No decoding or pixel reconstruction occurs.

`validate_sprite` is a separate usable-geometry/reference gate: finite values,
positive scale, texture bounds without rounding, local target existence/class,
triangle/base/first-vertex/index spans, float32 stream/channel ranges, channel
overlap and Unity's 16-byte stream alignment. Unknown encodings/topology and
atlas/alpha/secondary/nonlocal references stay explicit unsupported results;
raw metadata remains available through `read_sprite`. `packing().audited()`
accepts the observed unpacked/rotation-zero cases with either mesh bit; it does
not equate settings64 with all valid metadata. Packed flips/rotations/reserved
bits survive parsing and return `UnsupportedPacking` from the support gate.

Texture byte-range validation covers BC7/25, DXT1/10, DXT5/12, RGBA32/4 and
RGB24/3, inline data, six/twelve mips and empty Font Texture. Every mip uses
checked rounded-up block or uncompressed arithmetic. Unsupported formats,
dimensions/image counts and stripped mips retain readable metadata but do not
produce usable range tokens. No decoder is available for any format here.

`StreamResolver::for_file` binds the original opened assets input.
`validate(index, key, work)` re-reads the indexed Texture2D; callers cannot
forge a token by mutating public metadata. `VerifiedRange::read_relative`
accepts only a relative offset and bounded output buffer and retains the
original source/identity/span. Empty paths are legal only for bounded inline or
no-data records. Only literal `resources.assets.resS` can open. There is no
external following, normalization, search, installation fallback or network
dependency discovery. `for_sources` supports owned/virtual test sources without
opening any filesystem paths; its implementor owns the ReadAt contract.

Errors distinguish unsupported layout/reference/packing/format, corruption,
not-found, ambiguity, changed source, limit, cancellation and I/O. Default limits
implement Review 14's proposed caps; name queries/inventory add a 32 MiB cap.
`Work` carries cumulative I/O, selected-object bytes and atomic cancellation;
reuse it across an entire operation. The synchronous geometry pass is bounded
by the already capped object/arrays. See the crate README for the complete API,
limits and partial-output-on-error contract.

## Source identity and OS limits

Filesystem opening is deliberately Windows/fixed-local-NTFS only; portable
memory/virtual parsing remains available. Initial UNC/device/relative/traversal
root syntax is rejected. Canonical root drive type and the opened volume's
NTFS name are checked. Both art files open read-only with `FILE_SHARE_READ`,
denying ordinary write/delete sharing, including conflicting pre-existing
writer opens. The root handle denies deletion. Final-component reparse handles
are rejected using `OPEN_REPARSE_POINT` and attributes; final paths from root
and file handles must match the selected canonical sibling. S: and D: were
observed as fixed NTFS volumes. Other filesystem guarantees are not claimed.

Each checked read compares handle-based volume/file identity, length,
creation/last-write times and final paths before/after I/O. Observable changes
return `ChangedSource`, including shortened sources discovered at EOF. Range
tokens never reopen a fresh caller path. This is not path+mtime cache identity
or a cryptographic immutable snapshot: pre-existing writable mappings,
privileged/kernel edits, covert stamp-preserving edits or a dishonest custom
ReadAt can defeat content-change detection. Future caches need a separately
reviewed source-manifest/hash protocol. The optional probe hashes opened inputs
once each and keeps share locks throughout; there is no full-file hash per
object in the core.

## Commands and results

All commands use the Toolkit workdir and the dedicated external target.

```powershell
cargo test --manifest-path crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-core-target --offline --locked
cargo clippy --manifest-path crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-core-target --all-targets --offline --locked -- -D warnings
cargo fmt --manifest-path crates/de-assets-core/Cargo.toml --check

# Isolated toolchain; no change to the ordinary user's Rust default.
$env:RUSTUP_HOME='S:/Projects/UCP/de-research/assets-core-a1/rustup'
cargo +1.88.0 test --manifest-path crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-core-target --offline --locked -- --nocapture
```

**29 synthetic tests pass** (20 core + 9 resolver), plus zero-test library/doc
targets. Clippy with warnings denied and scoped rustfmt check pass on rustc
1.98.1; the same synthetic suite compiles and passes on **rustc 1.88.0**
(`6b00bc388`, 2025-06-23). The isolated minimal 1.88 toolchain was downloaded only
into owned scratch. Cargo reports zero ignored tests, but one test has an
explicit environmental branch: file-symlink creation returned Windows1314
(missing privilege), so that file-symlink case was **not exercised**. The
separate directory-junction rejection test did execute and pass. Do not report
that the privileged file-symlink path was tested.

Coverage includes every file/Sprite/Texture prefix truncation; header endian,
every metadata prefix with adjusted internally consistent header/file lengths;
reserved fields, false length and metadata/data boundaries; negative/huge index
and object-array counts; metadata tail; invalid/oversized/unterminated strings;
type/hash/profile/index errors; duplicate/overlapping IDs/spans; signed IDs and
sparse virtual u64 offsets above2^53; object trailing/alignment boundaries;
raw nonfinite float payload preservation and unusable-geometry rejection;
broken/wrong-class/nonlocal/null/atlas/tag/alpha/secondary references;
serialized horizontal/vertical/180/90 packing flags and reserved bits;
channel/vertex/submesh/index errors; aggregate/cancellation limits;
read-only handles/no cache/settings creations; literal-path rejection for
drive/UNC/device/traversal/ADS/NUL/sibling-prefix/case/separator aliases;
no fallback; short/range-overflow/changed/inline sources; injected short reads,
I/O failures and changed-source stamps; and junction rejection.

Early checks found ordinary lint issues (corrected), script-policy rejection
(the documented ScriptBlock invocation changes no policy), and one transient
MSRV linker error when its build tried to replace the still-running local probe
executable. The MSRV build was rerun after that probe ended and passed. Do not
run concurrent builds that replace an active Windows probe executable.

### Optional local full-field parity

Run the command in the crate README. No game, editor, app frontend or DLL is
executed. UnityPy/Python are optional local research oracles only. The wrapper
streams and verifies these opened inputs once each, retaining read/share locks:

| Input | Bytes | SHA-256 |
| --- | ---: | --- |
| resources.assets | 114,825,928 | `9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a` |
| resources.assets.resS | 1,396,428,560 | `be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e` |

**Passed: all fields of 41 original Sprites + all 41 Texture2Ds + four extra
Sprites (86 objects).** A typed Rust field-by-field canonical transcript is
compared to independently read UnityPy dictionaries in the pinned exported
layout order, including raw float32 bits, arrays and blobs. The Rust example
also runs usable geometry/references/ranges on these objects and bounded
first-block reads. Original selection: Camel512..519, Healer640..647 and
outpost1290..1314. Named extras: Healer0x, Skirmisher2135 and2172 surrounding the
hole, and same-name Sprite `body16Sprites_m`. Exact-name Rust lookups independently
check missing Skirmisher2136, alternate0x and class-scoped mask IDs. Texture
cases include inline text/pointer, Font Texture, DXT5 body6Sprites_m and
UIMask6/TrialExpiredTexture12 mips. Fractional Healer/5 vertices, Camel/11 and
outpost quad geometry are checked; no suffix compaction or pixel claim occurs.

Index totals: **137,773 objects, 51 script refs, three externals**. Proprietary
metadata transcripts, per-object canonical hashes and result report are only at
`S:\Projects\UCP\de-research\assets-core-a1\parity\` (`parity.json`,
`rust-transcript.tsv`, `rust-stderr.txt`). Nothing from those files is required
by synthetic tests. No proprietary fixture or exported dataset enters Git.
The final probe's Rust index/name/metadata/geometry/range pass took24.374s;
this includes the full uncached name scan and is a diagnostic, not a startup
benchmark. Per-file implementation hashes and the final1.98 test log are at
`assets-core-a1/implementation-sha256.json` and `final-tests-rust1.98.log`.

The oracle gates UnityPy1.24.2, Review14's per-file parser/TPK/layout pins and
additional local TypeTreeHelper/UnityPyBoost hashes. `PROVENANCE.md` records all
pins and the MIT notice treatment. Exported schemas/TPK remain outside Git;
unresolved historical TypeTreeDumps licensing is not assumed resolved.

## Independent review handoff

Review the crate as an unexposed new library, separately from F1/D1. Prioritize
the fixed-layout completeness and typed-vs-usable distinction, all bounds and
allocation ordering, float stream/index/texture range rules, scoped PPtrs and
duplicate-name behavior, Windows FFI ABI/share/final-path checks and precise
mutation-race contract. Check the skipped file-symlink privilege branch on a
properly equipped review machine. Reproduce synthetic tests on1.88; optionally
re-run the hash-gated local86-object probe. Batch names are still uncached scans;
no startup/performance decision is implied.

No decoder, app integration, cache/settings/profile writes, installed app/game
writes, game/editor launches, CI, PR, commit or feature acceptance is included.
The coordinator owns review and any commit/integration decision. Remaining
world work stays explicit: flat/lowered final substitutions, complete Stockade
compound, mesh/pixel/shader reconstruction and isolated game captures. BC1
transparent-index correction and dependency/size/performance/notice selection
belong to PXL1. These open tasks do not invalidate the narrow read-only A1
metadata milestone and do not become accepted through these tests.

## A1-R1-01 correction, round 2 — 2026-10-23

**Implementation response ready for fresh independent review; no integration or
commit acceptance claimed.** Review24's sole P2 finding is addressed in the
reviewed input. Its original report is unchanged. The complete original handoff
above, its 29-test/86-object evidence and the original probe files are preserved.
This section supersedes the earlier statement that capped arrays alone bound
the synchronous geometry pass sufficiently. It does not supersede the source,
layout, filesystem or unsupported-feature contracts.

Read all of 00/01/02/05, Review14, this handoff and the full Review24 before the
correction. Every Toolkit command explicitly used
`S:/Projects/UCP/AI-Toolkit-DE`; this remains a shared checkout. Branch observed:
`de/separate-game-mode`; shared HEAD at this handoff:
`773f80b8a31d9337cd83342957bd8b76d969515c`. Other owners' files were left alone.
No children, staging, commits, pushes, CI/PR/release, app/game/Steam launch,
installed/Classic writes or OS privilege changes occurred. Scratch, probe and
build outputs are exclusively under
`S:/Projects/UCP/de-research/fix-assets-a1-r2` (**R2**), with dedicated targets
`target-msrv`, `target-current`, `target-parity` (and the initial `target`).

### Finding response and smallest boundary

Review24 demonstrated 622,554,000 index visits from one 977,976-byte Sprite:
19,000 legal overlapping descriptors, each referencing 32,766 indices. Object
and array byte limits cannot account for repeated traversal. Rejecting all
overlap would alter the geometry contract; increasing byte caps cannot fix the
work defect. A separate geometry allowance would add another resource mechanism
for callers to coordinate. The smaller correction passes the **existing Work**
through this same Rust owner's validation and makes its accounting explicit.
Neither desktop host nor renderer needs to copy this policy.

- Public API change: `SpriteMetadata::validate_geometry(&mut Work) -> Result<()>`
  replaces the no-argument method. `SerializedIndex::validate_sprite(key, work)`
  retains its signature and passes the same Work through. All owned direct
  callers in `tests/core.rs` are updated. Existing examples/probes already use
  `validate_sprite(key, work)` and require no API edit; their bytes are unchanged.
- `Work::new(units)` now explicitly mixes one unit per byte read with one unit
  per geometry scalar/loop visit. The numeric argument type and `remaining()`
  are unchanged. Exhaustion is `Limit("work units")`, replacing the diagnostic
  string `"work bytes"`. There is no new cap, dependency or resource framework.
- Charge every finite scalar; shape/bone/submesh descriptor; channel visit and
  overlap comparison; stream/span visit; vertex and index visit. Every repeated
  index visit is paid again. Empty shapes and dimension-zero channels still
  cost work. `validate_sprite` also charges its secondary-reference loop.
  Bind poses/physics points are covered by their fixed-size scalar walks.
  Packing is constant work; texture mip iteration retains its existing fixed
  maximum of 32, so it needs no new geometry mechanism.
- Each charge checks the real atomic cancellation flag and uses checked u64
  subtraction. Entry/completion checks cover pre-cancelled and last-visit cases.
  Between checks there is constant work, including bounded stream-map lookups;
  no entire variable index range is left unchecked. This is a logical operation
  bound, not a wall-clock scheduler guarantee. Allowance is never reset for a
  submesh, a later validation or a later object. Failed subtraction preserves
  the current balance; earlier successful charges remain consumed.
- `read_sprite` remains independent. Raw metadata is retained when usable
  validation returns `Limit`/`Cancelled`; repeated ranges remain valid with
  sufficient allowance. No layout reader, object bytes, source-bound token,
  signed/scoped reference, decoder or scene policy was replaced.

### Regression and verification evidence

Six new library-unit regressions in `src/geometry_tests.rs` reuse the original
serialized fixture builder read-only; the existing 20 core +9 resolver tests
remain. A private `cfg(test)` countdown on successful Work charges sets the
**real cancellation atomic** deterministically. It adds no production callback,
public hook or integration-build behavior.

1. The exact serialized Review24-size example parses with `object_bytes+128`
   work, leaving 128. Both direct geometry validation and `validate_sprite`
   return `Limit("work units")`, consume the 128 and never reach the texture
   read. The raw metadata compares equal after failure and re-parses with an
   object-byte-only allowance. No allocation/count cap was raised.
2. Two overlapping ranges succeed with the exact 112-unit geometry allowance;
   a shared allowance permits one pass and rejects the next at exhaustion.
   Sprite read + geometry + texture read also share one exact allowance.
3. Serialized cancellation completes **1,024 index visits** in the first long
   descriptor, then returns `Cancelled` before invalid visit 1,025. A control
   pass reaches that deliberately invalid index and returns the expected
   corruption error. Exact remaining work and selected-object bytes prove the
   cancellation occurred inside geometry, before any texture read, for both
   direct and index validation. No sleep or wall-time threshold is used.
4. Deterministic cancellation covers bind poses, physics, bones, channel work,
   vertices, submesh bounds and indices, including the last visit. Empty
   shapes/inactive channels cannot bypass the allowance.
5. Checked accounting covers u64::MAX, zero and exhaustion without wrap;
   maximal wire-sized index spans still fail checked bounds. Already-cancelled
   validation consumes no work, including when the geometry itself is invalid.

Final exact-source checks, all exit 0:

| Check | Result / R2 log |
| --- | --- |
| Existing isolated rustc 1.88.0, debug suite | 35 passed (6+20+9), doc 0; `tests-msrv-final.log` |
| Installed rustc 1.98.1, debug suite | 35 passed (6+20+9), doc 0; `tests-current-final.log` |
| rustc 1.88.0 optimized geometry regressions | 6 passed; `tests-msrv-release.log` |
| Installed scoped Clippy, all targets, warnings denied | Pass; `clippy-final.log` |
| Scoped rustfmt check | Pass; `fmt-final.log` |

The filesystem suites again reported the file-symlink privilege limitation
(Windows 1314): **that file-symlink case remains unexercised**. Directory junction
rejection executed and passed. No privilege or security-setting adjustment was
made. An initial test compile used `Range<u64>::len()` (unavailable); it was
corrected to end-minus-start before the first passing regression run. An initial
Clippy constant-assertion warning was corrected to assert the parsed lengths;
`clippy-initial.log` is retained. Native PowerShell stderr formatting appears in
early logs; final logs use subprocess capture and record actual exit status.

Reproduce the final checks (full exact argv/environment receipts in
R2/`checks.json`; `run_checks.py` runs these sequentially):

```powershell
$env:DE_ASSETS_TEST_SCRATCH='S:/Projects/UCP/de-research/fix-assets-a1-r2'
$env:RUSTUP_HOME='S:/Projects/UCP/de-research/assets-core-a1/rustup'
cargo +1.88.0 test --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/fix-assets-a1-r2/target-msrv --offline --locked -- --nocapture
cargo +1.88.0 test --release --lib --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/fix-assets-a1-r2/target-msrv --offline --locked -- --nocapture

# Fresh shell with the ordinary installed 1.98.1 toolchain, no RUSTUP_HOME override.
$env:DE_ASSETS_TEST_SCRATCH='S:/Projects/UCP/de-research/fix-assets-a1-r2'
cargo test --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/fix-assets-a1-r2/target-current --offline --locked -- --nocapture
cargo clippy --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/fix-assets-a1-r2/target-current --all-targets --offline --locked -- -D warnings
cargo fmt --manifest-path S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/Cargo.toml --check
```

Focused local parity **passed for seven Sprites plus five referenced Texture2Ds**:
Camel512, fractional Healer640, outpost1290, Healer0x, Skirmisher2135/2172 and the
same-name mask Sprite. All typed fields, float32 bits, arrays, blobs and PPtrs
match a fresh pinned UnityPy oracle **and** the original 86-object canonical
hashes. Usable geometry/references/ranges and bounded first-block reads pass.
The Rust pass took 0.213s; it reads the full checked index but uses explicit IDs
and skips the unchanged full name scan. This is diagnostic, not a startup or
rendering benchmark. Original 86-object/full-name evidence remains historical;
it was not rerun or re-labelled as new evidence.

R2/`prepare_parity.py` reproducibly creates scratch-only copies of the unchanged
probe transport/oracle, narrowing only the selection/name scan and recording
per-Sprite work. It first checks both originals' reviewed hashes. The original
wrapper still checks opened art hashes and holds read/share locks. Its first
scratch build refused a missing scratch Cargo.lock under `--locked`; an offline
`cargo generate-lockfile` created that std-only probe lock, then the wrapper
passed. `parity-wrapper-initial.log` retains that setup failure. No dependency
or toolchain was installed. Reproduction:

```powershell
python -B S:/Projects/UCP/de-research/fix-assets-a1-r2/prepare_parity.py
cargo generate-lockfile --manifest-path S:/Projects/UCP/de-research/fix-assets-a1-r2/probe/Cargo.toml --offline
& ([ScriptBlock]::Create((Get-Content -Raw -LiteralPath S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/probes/local_parity.ps1))) -DataRoot 'D:/SteamLibrary/steamapps/common/Stronghold Crusader Definitive Edition/Stronghold Crusader Definitive Edition_Data' -OracleDependencies S:/Projects/UCP/de-research/assets/pydeps -LayoutEvidence S:/Projects/UCP/de-research/rendering-contracts -Scratch S:/Projects/UCP/de-research/fix-assets-a1-r2/parity -Target S:/Projects/UCP/de-research/fix-assets-a1-r2/target-parity -ProbeDirectory S:/Projects/UCP/de-research/fix-assets-a1-r2/probe/probes
```

Both opened source files still match the original hashes and lengths:
`resources.assets` 114,825,928B,
`9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a`;
`resources.assets.resS` 1,396,428,560B,
`be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e`.
Layout/TPK/oracle pins remain those above. R2/`parity/parity.json`,
`rust-transcript.tsv`, `rust-stderr.txt` and `parity-wrapper.log` hold the new
local evidence outside Git. No proprietary byte payload was added here.

### Exact correction files and SHA-256 receipt

Changed relative to Review24: `README.md`, `src/lib.rs`, `src/metadata.rs`,
`src/serialized.rs`, `tests/core.rs`; added `src/geometry_tests.rs`, all under
`crates/de-assets-core/`. This appended handoff section is the only other write
inside Git. All other 12 original crate files retain their Review24 hashes.
Original 17/17 hashes were confirmed before editing; R2/`baseline-sha256.json`
and `baseline-crate/` preserve that input. The original complete handoff is
preserved as R2/`baseline-handoff16.md` with hash
`f499fd654adf9a334fb283a658b76f9e4512957ddcadcd3714e32db155c411bc`.

Final crate hashes (paths relative to `crates/de-assets-core/`):

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

R2/`final-sha256.json` records all 18 final crate hashes **and the final handoff
hash**, plus reproducibility/evidence file hashes. The handoff hash is outside
this file to avoid a self-referential receipt. R2/`correction.diff` contains the
complete owned delta; `preservation.json` records unchanged parser/layout blocks,
original test-builder bytes and the intact original handoff prefix.

Residuals remain explicit: no cryptographic mutation snapshot, and no exercised
privileged file-symlink case. This correction accepts no decoder/pixel output,
UI/desktop integration, final-scene/game behavior or Classic acceptance. Fresh
independent review must assess A1-R1-01 closure and these exact input hashes before
the coordinator makes any commit or integration decision.

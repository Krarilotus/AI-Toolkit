# Independent A1 assets-core review, round 1

2026-10-22. **Recommendation: NO-GO for the exact additive A1 commit pending one
P2 bounded-work/cancellation correction.** No P0/P1 finding was identified in
this review. The metadata/layout, scoped-key, literal-path and opened-range
boundaries otherwise withstand the checks below. This recommendation applies
only to the unexposed library, not integration, decoding or game acceptance.
The coordinator owns acceptance and reconciliation of this gate.

## Scope, identity and ownership

Read in full: `00-goal-verbatim.md`, `01-working-contract.md`, `02-plan.md`,
`05-engineering-standard.md`, `research/14-rendering-provider-review.md` and
`research/16-assets-core-handoff.md`. Independently inspected all 17 files under
`crates/de-assets-core/`. No child agents were used. The reviewer is Sol 6.1.

Every Toolkit command explicitly used `S:/Projects/UCP/AI-Toolkit-DE` as its
working directory. This is a shared checkout, not T3 isolation. Initial branch
was `de/separate-game-mode`, HEAD
`b4b319fabed2d3464445b5fa567d3655f2fdf239`. At 23:51:38 +02:00, HEAD was
`a81faaad9c268adca7ea99b491ee9a51d161c26d` as other work progressed. All 17
reviewed crate files still matched the implementer's recorded hashes; handoff16
also matched. No shared changes were restored, staged or committed.

Only this report was authored inside Toolkit. Reviewer probes/logs are at
`S:/Projects/UCP/de-research/review-assets-core-r1` (**R**); build output is at
`S:/Projects/UCP/de-research/de-assets-review-target` (**T**). No source/test,
other-document, dependency, application integration, installed application,
game, profile, settings or cache changes were made. No CI, app/game launch,
commit, PR or security-setting change occurred. The first supplied MSRV test run
used that test suite's default temporary fixture directory under
`assets-core-a1`; its fixtures clean themselves up. Subsequent supplied tests
and reviewer filesystem probes used R explicitly.

## Severity-ranked findings

### P2 / A1-R1-01: charge and cancel repeated submesh index validation

**Locations:** `crates/de-assets-core/src/metadata.rs:280` and `:390-421`,
especially the nested index loop at `:416-420`;
`crates/de-assets-core/src/serialized.rs:434` invokes it without `Work`.

`validate_geometry()` has no work/cancellation argument. For every submesh it
walks that submesh's entire declared index range again. Repeated, in-bounds
ranges are accepted. Consequently the 1 MiB object cap and individual array
caps do not provide a proportionate cumulative CPU allowance: the work is the
product of descriptor count and referenced index count. Parsing is checked and
bounded, but this later usable-geometry pass can amplify those bytes into
hundreds of millions of unchecked visits.

**Reproduction:** R's `src/lib.rs`, test
`repeated_index_spans_work_and_cancellation_probe`, imports the supplied
synthetic builder read-only. It replaces one Sprite's single submesh with
19,000 descriptors, each with `first_byte=0`, `index_count=32,766`, triangle
topology, `base_vertex=first_vertex=0`, and `vertex_count=3`. The index blob is
65,532 bytes containing in-range zero indices. Existing three-vertex streams,
finite bounds, references and the rest of the layout are retained. The resulting
Sprite is **977,976 bytes**, below the default object cap; both arrays are below
65,536. An ordinary immutable `BytesSource` suffices. No hostile ReadAt or
filesystem race is involved.

Observed on Rust 1.88:

- `read_sprite` succeeds. `validate_geometry` succeeds after **622,554,000 index
  visits** (`19,000 * 32,766`). A Work allowance with only 128 bytes left after
  the object read remains at 128: this computation has no work charge.
- Debug geometry: **11.663 s**. Calling `validate_sprite` with cancellation
  requested from another thread at 50 ms returns `Cancelled` only after
  **12.047 s**, when the subsequent texture read finally checks Work.
- Optimized geometry: **272.324 ms** in the focused run, **214.323 ms** in the
  final probe suite. Corresponding cancelled `validate_sprite` calls take
  **271.546 ms / 210.375 ms**, despite the 50 ms request. These are measurements
  on this machine, not portable performance bounds.

The README openly describes the geometry pass as synchronous. I do not claim
an infinite loop or an unbounded single allocation: existing caps give a finite
worst case. The issue is that Review14's cumulative work/cancellation boundary
is absent precisely where a small object multiplies work. A stream of selected
objects can repeat the cost within the selected-byte allowance. The 29 supplied
tests check cancellation before operations, not during this pass.

**Owner and smallest correction:** the existing Rust asset core's geometry
validator owns this work. Pass the caller's Work, or a narrow explicit geometry
allowance, into validation; charge cumulative index visits with checked
arithmetic and check cancellation at bounded intervals. An explicit usable-
geometry limit is also reasonable. Preserve `read_sprite` metadata for records
that exceed the usable-work limit; return `Limit`/`Cancelled` from validation.
Do not move this policy to each host, invent a renderer policy, or add a cache or
second parser. Add a serialized adversarial regression demonstrating that
repeated spans exhaust the geometry allowance and cancellation interrupts the
pass. The exact fix/API remains the implementer's responsibility.

**Closure gate:** independently show a cumulative bound for repeated ranges and
deterministic cancellation within the validation loop, then rerun focused crate
checks and confirm the reviewed layout bytes remain preserved. No source fix
was made in this review.

## Review14 requirement evidence

| Requirement | Inspection / independently observed evidence | Assessment |
| --- | --- | --- |
| Audited header and profile | `serialized.rs:83-118`: 48-byte v22 header, endian0, zero reserved tuple, exact source length, checked metadata/data bounds, exact Unity/platform/no-tree tuple. | Satisfied for the stated profile. |
| Full metadata index | `serialized.rs:120-205`: signed bounded counts, class114 script ID, complete scripts/externals/reference count/user info, exact cursor finish. Reference types remain unsupported. Local probe reports 137,773 objects, 51 script refs, 3 externals. | Satisfied; no dependency following. |
| Index budgets, IDs and spans | Counts are checked before capacity allocation, also against remaining minimum bytes; types/objects/scripts/externals have separate caps. Signed i64 IDs are BTreeMap keys; data offsets remain u64. Checked additions/spans, duplicate-ID and overlap rejection precede typed reads. Sparse offsets above 2^53 are tested. | Satisfied within caller-selected Limits. |
| Exact typed tuple | `serialized.rs:251-265` checks class, stripped=0, script index=-1 and the exact Sprite/Texture2D hash. Other classes stay opaque; an unsupported target type can still be indexed. | Satisfied; selector is not authentication. |
| Full typed layout consumption | `metadata.rs:118-267` and `:476-547` retain the complete audited fields and require cursor finish. All 86 local objects match the independent oracle's canonical fields. Additional synthetic nonempty branches round-trip byte-for-byte through the pinned schema oracle. | Satisfied for the audited layouts and tested cases. |
| Allocation/arithmetic limits | Capped metadata allocation, selected-object/object/array/blob/string/nesting/read limits; counts and remaining spans precede target allocations. Nested shape arrays and blobs remain bounded by object bytes plus element caps. Checked mip and stream arithmetic. | Satisfied for memory/I/O; geometry work gap above. |
| Name/reference ownership | Private ObjectKey contains per-index identity and signed path ID. `entry` rejects foreign keys. Exact class-scoped UTF-8 name lookup returns zero/one/many. PPtrs retain signed file/path integers; local target class/existence checked; external descriptors are never opened. | Satisfied. Raw PPtr values remain relative wire metadata; resolve them through their owning index. |
| Sparse / alternate / collision cases | Supplied zero/one/many tests; reviewer Unicode+embedded-NUL exact names and foreign-key probe; local missing Skirmisher2136, Healer0x and Sprite/Texture2D mask checks. Full extra parity includes Skirmisher2135/2172 and same-name mask Sprite. | Satisfied; no suffix compaction. |
| Geometry and packing | Raw fractional/negative offsets and float bits retained. Separate finite/scale/texture-bound gates, triangle/base/first-vertex/index checks, float-channel overlap/stride/16-byte stream alignment. Unknown encodings/topology and nonaudited packing are explicit errors. | No bounds defect found; cumulative validation work needs correction. |
| Preserve texture exceptions | All 41 real Texture2Ds match: BC7, DXT1, DXT5, RGBA32, RGB24; inline text/pointer; empty Font Texture; six/twelve mips. Checked block rounding and uncompressed arithmetic compute bounded ranges without decoding. | Satisfied. No format gains a decoder from these results. |
| Source-held ranges | `streams.rs`: resolver is bound to the same source Arc/stamp as the index; it re-reads the Texture2D rather than trusting mutable DTOs. Private range/span/stamp and opened source stay with the token. Only relative bounded reads are public. | Satisfied. |
| Path/open boundary | Exact `resources.assets.resS` match; no normalization/search/fallback. Windows local/fixed/NTFS checks; canonical root handle; final-component OPEN_REPARSE_POINT and reparse-attribute rejection; exact final-handle sibling checks. | Satisfied under the documented ordinary threat model; file-symlink runtime gap below. |
| OS share / identity boundary | Reviewed repr(C) FILETIME/BY_HANDLE_FILE_INFORMATION layout and system ABI. Files use read access and FILE_SHARE_READ. Synthetic pre-existing assets/stream writers fail with Windows32; active root rename fails with Windows5. Local parity exercises both real opened files. IDs, lengths and creation/write times are handle-derived. | Satisfied for exercised Windows NTFS paths. |
| Changed/short/error reads | `reader.rs:60-106`: charge, original span, stamp comparisons before/after, short-read loop, EOF/error change detection, invalid returned-length rejection. Five reviewer partial-read variants leave a visible written prefix but return the correct error. README requires discarding buffers on error. | Satisfied; output is deliberately not transactional. |
| Cancellation / cumulative resources | Supplied budget/pre-cancel/selected-byte tests pass; range operations check Work. Reviewer cancellation after a partial read returns Cancelled. | Geometry exception is the sole finding. |
| Source notices and production boundary | Unpublished standalone Rust1.88/std-only manifest and single-package lock. No app dependency. PROVENANCE distinguishes hand-audited layout, per-file UnityPy/TPK pins and unresolved historical dataset licensing; conservative UnityPy MIT notice included. No TPK/layout dataset or decoder copied into crate. | Appropriate for A1; no shipping decoder/license selection inferred. |

### Ownership and maintainability judgment

The crate is explicitly DE-specific and keeps one authoritative implementation
for future native and Electron consumers. `reader`, `serialized`, `metadata`,
`streams` and the private checked cursor have concrete responsibilities. The
small generic ReadAt boundary earns its existence through short/error/change
injection and sparse-u64 tests. The filesystem checks belong to the asset source
owner; exact layout and geometry checks belong to this same DE core. I found no
concrete misplaced shipping responsibility or gratuitous framework requiring a
move. The one necessary change is to carry the existing operation allowance
through geometry validation, not build a new host-level mechanism.

Future hosts should expose thin adapters to this crate. Classic asset modules
and DE adapters must remain explicit, with installation/profile/window/cache
lifecycle owned by the backend. Do not copy this parser or later decoder into
Node, and do not treat independent test oracles as production implementations.
A1 correctly adds no Classic branch or renderer/GM/chimp/marker semantics to
this format reader. Nothing here selects a scene facing, proves a Stockade
compound, or resolves flat/lowered rendering. Those owners and gates remain
with the coordinator's later work.

## Commands, counts and reproducible evidence

All commands below were executed with Toolkit workdir set explicitly. `R`/`T`
are abbreviations for the absolute scratch/target paths above, not environment
variables passed literally. The existing isolated Rust1.88 toolchain was used;
no toolchain, Python package or production dependency was installed.

```powershell
$env:RUSTUP_HOME='S:/Projects/UCP/de-research/assets-core-a1/rustup'
cargo +1.88.0 test --manifest-path crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-review-target --offline --locked -- --nocapture

# Fresh shell: ordinary installed rustc 1.98.1, no RUSTUP_HOME override.
$env:DE_ASSETS_TEST_SCRATCH='S:/Projects/UCP/de-research/review-assets-core-r1'
cargo test --manifest-path crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-review-target --offline --locked -- --nocapture
cargo clippy --manifest-path crates/de-assets-core/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-review-target --all-targets --offline --locked -- -D warnings
cargo fmt --manifest-path crates/de-assets-core/Cargo.toml --check

& ([ScriptBlock]::Create((Get-Content -Raw crates/de-assets-core/probes/local_parity.ps1))) -DataRoot 'D:/SteamLibrary/steamapps/common/Stronghold Crusader Definitive Edition/Stronghold Crusader Definitive Edition_Data' -OracleDependencies S:/Projects/UCP/de-research/assets/pydeps -LayoutEvidence S:/Projects/UCP/de-research/rendering-contracts -Scratch S:/Projects/UCP/de-research/review-assets-core-r1/parity -Target S:/Projects/UCP/de-research/de-assets-review-target

$env:RUSTUP_HOME='S:/Projects/UCP/de-research/assets-core-a1/rustup'
cargo +1.88.0 test --manifest-path S:/Projects/UCP/de-research/review-assets-core-r1/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-review-target --offline -- --nocapture --test-threads=1
cargo +1.88.0 test --release --manifest-path S:/Projects/UCP/de-research/review-assets-core-r1/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-review-target --offline --locked repeated_index -- --nocapture
cargo +1.88.0 test --release --manifest-path S:/Projects/UCP/de-research/review-assets-core-r1/Cargo.toml --target-dir S:/Projects/UCP/de-research/de-assets-review-target --offline --locked -- --nocapture --test-threads=1
python -B S:/Projects/UCP/de-research/review-assets-core-r1/synthetic_oracle.py
```

- Supplied suite: **29 passed on1.88, 29 passed on1.98.1** (20 core +9 resolver
  each). Library/doc targets contain zero tests. Clippy all-targets with warnings
  denied and scoped rustfmt check pass. Logs: R/`tests-1.88.log`,
  `tests-current.log`, `clippy.log`, `fmt.log`.
- Reviewer suite: initial four probes pass in debug; final expanded **six probes
  pass in release**. The resource probe intentionally asserts the observed
  deficiency, so a green reviewer probe is not finding closure. R contains
  `src/lib.rs`, `Cargo.toml`, scratch-only `Cargo.lock`, `adversarial-debug.log`,
  `geometry-release.log` and `adversarial-final.log`. Scratch library-only build
  warnings are unused test helpers, not a failure of crate Clippy.
- The deterministic mutation probe exercises **12,000** files without panic:
  8,187 successful indexes and 6,256 successful Sprite parses. Failed parses
  are also exercised through name/usable validation when applicable. This is
  bounded targeted mutation evidence, not exhaustive fuzzing or 12,000 distinct
  test definitions.
- Five partial-read modes cover partial I/O error, partial EOF, revision change
  on error, invalid ReadAt length, and cancellation after the first short read.
  Each output remains `[7,8,99,99]` and reports the appropriate Io/Corrupt/
  ChangedSource/Cancelled result; callers must discard it.
- Additional Windows sharing probe confirms pre-existing writer exclusion for
  each input and root-rename denial. An initial reviewer assertion expected
  Windows32 for root rename; actual Windows5 also denies the rename. The scratch
  assertion was corrected; no crate change followed. Its exact leftover owned
  fixture was removed nonrecursively. `sharing.log` retains the initial probe
  expectation failure; the final six-probe log contains the passing check.
- Local hash-gated parity: **41 original Sprites +41 Texture2Ds +4 extra Sprites
  =86 objects**, all typed fields equal, including float32 canonical bits,
  arrays/blobs/PPtrs. Geometry, scoped-name/range checks and first-block reads
  succeed. Rust pass **27.139s**, including the uncached Sprite-name scan; this
  is not a startup benchmark. R/`parity/parity.json`, `rust-transcript.tsv` and
  `rust-stderr.txt` hold evidence outside Git.
- Both opened art hashes exactly match Review14:
  `resources.assets` 114,825,928B,
  `9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a`;
  `resources.assets.resS` 1,396,428,560B,
  `be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e`.
  The wrapper hashes each opened input once and holds its read/share locks.
  An initial attempt with outer PowerShell `*>` redirection promoted normal
  Cargo stderr to NativeCommandError under the wrapper's Stop preference;
  the displayed command without outer redirection passed. This was shell
  capture behavior, not a parity failure; `parity-wrapper.log` retains it.
- Two synthetic nonempty layout branches are independently read and rewritten
  using UnityPy with the pinned 167/44-node schemas. The Sprite includes tags,
  external signed PPtrs, secondary textures, physics shape and a bone, including
  Unicode/empty strings. The Texture keeps an unsupported format, negative
  dimension and inline bytes as metadata. Both consume exactly and round-trip
  byte-for-byte (556B /124B). R/`synthetic-oracle.json`, `synthetic-oracle.log`
  and `synthetic_oracle.py` record the checks. These bytes are synthetic.

## Exact reviewed SHA-256 receipts

All **17/17** entries match
`S:/Projects/UCP/de-research/assets-core-a1/implementation-sha256.json` both
before inspection and after probes. R/`hash-start.json` and `hash-end.json`
record expected and actual hashes. Paths below are relative to
`crates/de-assets-core/`.

| File | SHA-256 |
| --- | --- |
| Cargo.lock | `f5e73ffb5b3565362a877c1a0065e9a93b8377b6032ead12b9b059a9c5dfb666` |
| Cargo.toml | `dca676e50c37430a19594182c41f31e142ccdf64f7a60de65251d41ea2ef189a` |
| PROVENANCE.md | `48e8efb34b47d7f2e822510445c2c4c9e785592ed4c8e4d8c81dace76393208f` |
| README.md | `abbbc1955efe2a8db2bc53370fa05df595b8e0230fe034a4233c9f7403d04aa5` |
| THIRD-PARTY-NOTICES.txt | `22d10f6ab80bf7bc78efd51a2744a6e9bcbe9870a65c126dd9da35581550c220` |
| examples/local_probe.rs | `616e0b9537573c7fc06ec5a76cc0b58c7f4f9934637547d07102d888d5659517` |
| probes/local_oracle.py | `44814f8a3957338ef921fdb076635f5f461f5819c2efd2dfec6d463681c81561` |
| probes/local_parity.ps1 | `2e5569f2d4bd149f0a9eee87b011bd04ef522755c249ea30c0873947c8ea8b47` |
| src/cursor.rs | `d1d8cf8a4ec0395ffed8e75aae26c249c489f9302e81f18652bcb1a24d9a8527` |
| src/lib.rs | `5e91b0d7b978060888279e7da6c4024f2c688cda02e40877ec5113ca65d68d74` |
| src/metadata.rs | `d8cbad0adf90d7d2269877885922344b72da5681cd99aa71edaa58da3bbf5b43` |
| src/reader.rs | `ac95e532269d613918bf173b5ac42c37668e4b1008b2c96c420cdd54e91c5601` |
| src/serialized.rs | `038172a60152d05a3bf330ca90df94b998a4310d83621c9e814058161b10f265` |
| src/streams.rs | `67a5cbe8a012b299b3f3d52f82d6f56eac59489ef57eab74d492ee73d0985d8d` |
| tests/core.rs | `ba734f9f6bc4b176ed7a9f17de948539fcc4e8365042a145991cfb7a0d4cad8a` |
| tests/resolver.rs | `c4b4fafe2b5fd191e26a2c01159f2c056811ee244c36b1450048c26f99f3dc5d` |
| tests/common/mod.rs | `75afab63045cdeef168756fc9c6b36ca71a5a5a03157d24fbc6a25bf48d58fb4` |

Handoff16 SHA-256 is
`f499fd654adf9a334fb283a658b76f9e4512957ddcadcd3714e32db155c411bc`,
matching `assets-core-a1/handoff-sha256.json`. Source files and handoff remained
unchanged throughout review.

## Limitations and next gate

Windows file-symlink creation returned **1314** in both supplied runs: the
file-symlink case was **not exercised**, even though its test reports success.
The separate directory-junction rejection case did run and pass. No OS
privileges or user security settings were changed. Keep this environmental gap
visible; it is not evidence of a filesystem escape.

The reviewed source contract is ordinary fixed-local Windows NTFS with
cooperating ReadAt implementations and share-locked handles. It does not promise
a cryptographic snapshot, containment against administrators/kernel code,
pre-existing writable mappings, covert stamp-preserving edits, or a dishonest
ReadAt. Those exclusions are documented and are not new findings. Future caches
still need a source-manifest/hash design. No other OS or filesystem was exercised.

There is no pixel/mesh-rasterization, BC1 transparency, BC7 dependency,
shader/colour/anchor, final-scene, Classic regression, GUI, package or game
acceptance here. BC1 transparent-index evaluation belongs to PXL1. Numeric
selectors and metadata parity do not close scene parity. The next bounded A1
step is the single geometry work/cancellation correction and independent
closure review; root retains the commit decision and all later gates.
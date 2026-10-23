# Source/layout provenance

This is a new hand-written reader and tiny fixed layout, implemented from the
audited field/byte contracts in DE research reports 02/08/14, not a copied TPK,
TypeTreeDumps dataset, generated parser, UnityPy worker or Classic GM1 parser.
No proprietary payload, upstream exported layout JSON or TPK is redistributed.
The optional oracle harness uses locally installed UnityPy through its API.
The conservative UnityPy MIT notice is retained in `THIRD-PARTY-NOTICES.txt`
because its source and helpers informed the audit (including metadata framing
and 16-byte vertex stream alignment). No decoder source is copied into this crate.

Review 14's exact evidence is under
`S:/Projects/UCP/de-research/rendering-provider-review`, exported layouts under
`S:/Projects/UCP/de-research/rendering-contracts`:

- UnityPy SerializedFile.py / Tpk.py / SpriteHelper.py match
  `807f3888b8a2ddaa6504fca0737481baab4d6a99` after LF normalization.
- ObjectReader.py matches `578a1b2f13f341db079fd969706d36d915b0dc8d`.
- Effective Sprite layout begins at `2021.1a2`; Texture2D at `2020.2a16`, selected
  by the oracle for `2021.3.45f2`. This is database-selected evidence, not a new
  engine dump. Sprite 167-node layout SHA-256:
  `f661930315e8fb7f46ba8d07216206b3f691b9e26a817c7607de16862964cc5f`.
  Texture2D 44-node layout SHA-256:
  `ec92966a3d251274e6e4ad89d66f0a277f7fb8d6806b0211d65f222fcf99f26e`.
- Oracle UnityPy 1.24.2 TPK is byte-identical to commit
  `3135aa937e46ec8a7e2c60e84fb2fbb51a9c95c8`, SHA-256
  `3777edf16f1a57908640ef6d1e49fa51533e545424188b239c1b8e2ead3988da`.
- The historical dataset-to-TPK mapping and TypeTreeDumps dataset licensing
  remain unresolved. No redistribution permission is inferred from Tpk's MIT
  tooling license.

The optional probe additionally gates the locally observed execution inputs:
`TypeTreeHelper.py` raw SHA-256
`cbacde65daabdd9be41bb99a74528d43cc775c93dee7c1250c2b26b28a5cc58d` and
`UnityPyBoost.cp314-win_amd64.pyd` SHA-256
`b57ba7de45fedf1c4f430d8e8684a73d511cc09ca6cf8f72d43b8067e000943c`.
These are local-file pins, without a claimed upstream commit mapping. The
observed Python interpreter is 3.14.7; it is not a production dependency.

Pinned primary references:

- [UnityPy SerializedFile](https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/files/SerializedFile.py)
- [UnityPy ObjectReader](https://github.com/K0lb3/UnityPy/blob/578a1b2f13f341db079fd969706d36d915b0dc8d/UnityPy/files/ObjectReader.py)
- [UnityPy Tpk](https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/helpers/Tpk.py)
- [UnityPy MIT license](https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/LICENSE)

## PXL2 decoder selection and notices

The standalone manifest selects `texture2ddecoder` 0.1.2 from Git revision
`551fcbfbe86c05424ccc2ff942525c0ec7171d65`, with its default `alloc` feature.
The standalone lock pins its sole normal/build dependency, `paste` 1.0.15,
archive SHA-256 `57c0d7b74b563b49d38dae00a0c37d4d6de9b432382b2892f0574ddcae73fd0a`.
Both declare MIT OR Apache-2.0. Paste is a build-time proc macro, not a runtime
DLL. No app dependency graph is changed. The upstream no-default-feature build
is broken at this pin and is deliberately not selected (report29 evidence).

Only the fixed-size BC1a and BC7 block calls are used, behind private array-sized
wrappers. The upstream unchecked whole-image functions and other codecs are not
exposed. The 60,409-byte reviewed PXL1 notice bundle is preserved byte-for-byte
in `notices/`, including complete candidate MIT/Apache/COPYRIGHT/README credits,
paste's two licenses, AssetStudio's MIT notice and all other upstream codec
notices named by the candidate (mikunyan, FP16, public-domain Binomial crunch,
zlib Unity crunch), plus the original A1 UnityPy notice. `notices/SOURCES.json`
records exact source pins, hashes and size for each copied file. The conservative
additional codec snapshots do not claim historical derivation pins absent from
upstream. Candidate COPYRIGHT references absent Rust/LLVM paths; retaining it
does not assert an LLVM package dependency. No Toolkit license is invented.

- [Pinned candidate](https://github.com/K0lb3/texture2ddecoder-rs/tree/551fcbfbe86c05424ccc2ff942525c0ec7171d65)
- [Pinned paste archive](https://static.crates.io/crates/paste/paste-1.0.15.crate)
- [AssetStudio notice](https://github.com/Perfare/AssetStudio/blob/d158e864b556b5970709c2a52e47944d53aa98a2/LICENSE)

`tests/vectors/README.md` describes the promoted authored vectors and exact
specification/generator provenance. No specification dataset, TPK, game pixels,
compressed game blocks or research oracle package is redistributed. Fresh
real-art comparisons and instrumentation remain external research under
`S:/Projects/UCP/de-research/pixels-pxl2`; report31 records their source and result
hashes. Their pixel agreement does not establish Sprite/scene/game acceptance.

## SPR2 extraction and fixed-triangle adaptation

`sprite_pixels.rs` follows the limited unpacked branches of UnityPy
[SpriteHelper.py](https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/export/SpriteHelper.py)
and [MeshHelper.py](https://github.com/K0lb3/UnityPy/blob/807f3888b8a2ddaa6504fca0737481baab4d6a99/UnityPy/helpers/MeshHelper.py).
The private shared float32 stream helper factors the already accepted A1 policy;
there is no new parser or copied serialized/schema dataset. The existing UnityPy
MIT notice remains intact. Source LF-normalized SHA-256 pins are respectively
`e077830c860e04c75bcbe38c1df0c23a1a0c919613c8b5d30ca115e8666f4017`
and `c957123af5a1e6a28586c7227c3b4b470a2f39dd22fcb6c19bfd6da1566ee76d`.

`sprite_raster.rs` adapts the fixed-triangle, binary-mask portions of Pillow
[Draw.c](https://github.com/python-pillow/Pillow/blob/293218ad059d994baf1777d882911bed6a49704a/src/libImaging/Draw.c)
at `293218ad059d994baf1777d882911bed6a49704a`, SHA-256
`5aefa0c335e8e6c3a30c9e61a4e5aa790d72544aa9be0f41704b184e503b2e0d`.
Draw.c attribution is Copyright (c)1996-2006 Fredrik Lundh and
Copyright (c)1997-2006 Secret Labs AB. The relevant source is `add_edge`,
`polygon_generic`, horizontal clipping and ROUND_UP/DOWN, with coordinate
truncation confirmed in
[_imaging.c](https://github.com/python-pillow/Pillow/blob/293218ad059d994baf1777d882911bed6a49704a/src/_imaging.c)
(SHA-256 `3145c84174cf30d0eedf2ef946f821f230b07ecf258d30c58dd301e0ade07053`).
This adaptation uses fixed stack edges/intersections, existing Work, one shared
coverage canvas and triangle-local UV-copy scans (Review40 P2 correction).
It includes no Pillow library/dependency or general affine renderer.

The exact upstream1457-byte notice is preserved in `notices/Pillow-LICENSE`,
SHA-256 `15181e7363dca9aed78b79bebebc7fde7f1814b8bd311ea3b87ae8ccadfc185b`.
Its actual text calls the license **MIT-CMU**. The crate-local attributes file
prevents newline conversion of this notice. Existing decoder/UnityPy notices
remain unchanged. No proprietary pixels, oracle package or schema dataset ships.

`sprite_catalogue.rs` owns only the source-proven family-pairing contract from
[spriteLoader.cs](https://github.com/Serpens66/Stronghold-Crusader-DE-Mods/blob/7e199e6f0818173794bdeeb0c4c32d74500b0eec/_inspect/CrusaderDE-Native-Baseline/sem/FBCB9319/managed/BC8B6A39/decompiled/spriteLoader.cs),
Git blob SHA-256 `24e57447e342a45fdf0eee0da844bc466e4132619f94508784c19e33ed3bb59a`.
No sample path IDs, animation/GM selectors, shader colours or scene rules enter
the geometry/raster owner. Source and tool/oracle receipts,57 real planes and
authored source-bound comparison artifacts stay outside Git under
`S:/Projects/UCP/de-research/sprite-planes-spr2`; report42 records exact evidence.

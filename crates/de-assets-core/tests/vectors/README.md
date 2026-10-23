# Authored synthetic texture vectors

`bc7-authored.txt` contains only blocks authored for PXL1 and independently
derived expected bytes: 39 constant/endpoint/P-bit/rotation/selector/gradient
cases and 272 legal partition cases. Expected RGBA rows follow raw block order;
the crop regression reverses rows to check the public top-left output contract.
No game block, image, TPK, exported metadata or complete spec table is included.
BC1's endpoint/alpha/channel/asymmetric-row vectors are generated independently
in `tests/texture_crop.rs`, with RGB565 replication and integer interpolation.

The PXL1 generator is external
`S:/Projects/UCP/de-research/pixels-pxl1/evaluate_synthetic.py`, SHA-256
`e8799d7d2808a3300ae5dbec4fd26a5d370bdfb27c5e85194297b193fc6e86f7`.
It independently writes encoded fields and expected values using the primary
mode definitions, bit expansion and interpolation weights. Partition expectations
use pinned Khronos Table.P2/P3 subset ownership with distinct authored subset
colours; the production decoder's partition constants are not the oracle.
These authored outputs matched pinned Pillow and the candidate exactly in PXL1.
Public inputs are the primary specifications linked below; the authored fixture
bytes are published here for deterministic regression without those packages.

Exact source documents:

- MicrosoftDocs/win32 commit `d6ef0356f11875ce355c025170e3e218fc8a5193`,
  [BC7 algorithm](https://github.com/MicrosoftDocs/win32/blob/d6ef0356f11875ce355c025170e3e218fc8a5193/desktop-src/direct3d11/bc7-format.md),
  SHA-256 `76a8b47fb12ed66a5ccc039e116c9258a60172ad81ab808f6fce25abf484a517`;
  [mode reference](https://github.com/MicrosoftDocs/win32/blob/d6ef0356f11875ce355c025170e3e218fc8a5193/desktop-src/direct3d11/bc7-format-mode-reference.md),
  SHA-256 `9eef9698e7420ec28e6da0530b10b754cecf7e7f8d514061531da9677a1f80ab`.
- Khronos OpenGL-Registry commit `6af574a14089ccfee87efe230ebcdd8742859813`,
  [BPTC](https://github.com/KhronosGroup/OpenGL-Registry/blob/6af574a14089ccfee87efe230ebcdd8742859813/extensions/ARB/ARB_texture_compression_bptc.txt),
  SHA-256 `ab85a0e9b885a0fa1d23e18606b4bad1ab1eacc2bc18011806ea43d9c51bf666`;
  [S3TC](https://github.com/KhronosGroup/OpenGL-Registry/blob/6af574a14089ccfee87efe230ebcdd8742859813/extensions/EXT/EXT_texture_compression_s3tc.txt),
  SHA-256 `4b8064e3032ebef0f2afdef6c38f2d758d1911f759eeeceac904b0d81f301c4c`.

The promoted JSON receipts are fixed by the self-contained promotion tool.
It checks the UTF-8 transcript with universal newline normalization, so Git's
Windows checkout newline policy does not change the authored vector meaning.
To check exact reproduction from the preserved external evidence (no network,
Pillow, game or product output writes):

```powershell
python -B S:/Projects/UCP/AI-Toolkit-DE/crates/de-assets-core/probes/promote_authored_vectors.py --evidence-root S:/Projects/UCP/de-research/pixels-pxl1
```

Reserved BC7 first-byte-zero blocks are separately authored in the regression:
the product returns `Corrupt` before dependency decoding. PXL1 observed raw
candidate zero RGBA as specified, whereas Pillow returned alpha255. Valid-block
agreement never hides that discrepancy.

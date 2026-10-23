"""Reproduce only the reviewed authored PXL1 vectors; never imports game data.

Usage: python -B probes/promote_authored_vectors.py --evidence-root <PXL1>
Default compares the checked-in output. --write replaces only this vector file.
"""
from pathlib import Path
import argparse
import hashlib
import json

PINS = {
    "known-vectors.json": "73ce54a6bb488b1bb6d11153ca549c90d50ca244932205c933e2cf28089c6983",
    "partition-vectors.json": "d131f3c1d572622659f2cd493e725b6535e32a7941b702343caa0f561f377dde",
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence-root", type=Path, required=True)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    lines = ["# PXL1 authored BC7 vectors: mode, case, compressed hex, expected RGBA hex."]
    for name, pin in PINS.items():
        raw = (args.evidence_root / name).read_bytes()
        if hashlib.sha256(raw).hexdigest() != pin:
            raise ValueError(f"unreviewed authored input: {name}")
        for i, case in enumerate(json.loads(raw)):
            lines.append(f"{case['mode']} {name[:-5]}-{i} {case['block']} {case['rgba']}")
    data = ("\n".join(lines) + "\n").encode()
    target = Path(__file__).resolve().parents[1] / "tests/vectors/bc7-authored.txt"
    if args.write:
        target.write_bytes(data)
    elif target.read_text(encoding="utf-8").encode("utf-8") != data:
        raise ValueError("authored vector drift")
    print(f"311 authored vectors: {hashlib.sha256(data).hexdigest()}")


if __name__ == "__main__":
    main()

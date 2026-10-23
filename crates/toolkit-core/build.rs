// In-process builds also identify dirty core source, never Git HEAD alone.
// The helper builder supplies the wider bundle identity (client/config/notices).
use sha2::{Digest, Sha256};
use std::{env, fs, path::Path, process::Command};
fn main() {
    let root = env::var("CARGO_MANIFEST_DIR").unwrap();
    let root = Path::new(&root);
    let mut source = Sha256::new();
    for name in [
        "Cargo.toml",
        "Cargo.lock",
        "build.rs",
        "src/lib.rs",
        "src/profiles.rs",
        "src/contracts.rs",
        "../../src-tauri/Cargo.lock",
        "../../.cargo/config.toml",
        "../../.cargo/config",
    ] {
        let path = root.join(name);
        println!("cargo:rerun-if-changed={}", path.display());
        source.update(name.as_bytes());
        if let Ok(bytes) = fs::read(path) {
            source.update(bytes);
        }
    }
    let source_id = format!("{:x}", source.finalize());
    let mut contract = Sha256::new();
    for name in ["types.ts", "contract.json"] {
        let path = root.join("../../src/desktop/generated/core").join(name);
        println!("cargo:rerun-if-changed={}", path.display());
        // Newline normalization agrees with the helper tool and packaged client.
        if let Ok(text) = fs::read_to_string(path) {
            contract.update(text.replace("\r\n", "\n").as_bytes());
        }
    }
    let contract_hash = format!("{:x}", contract.finalize());
    let mut build = Sha256::new();
    build.update(source_id.as_bytes());
    build.update(contract_hash.as_bytes());
    for name in [
        "TARGET",
        "PROFILE",
        "OPT_LEVEL",
        "DEBUG",
        "CARGO_ENCODED_RUSTFLAGS",
        "RUSTC",
        "RUSTC_WRAPPER",
        "RUSTC_WORKSPACE_WRAPPER",
    ] {
        println!("cargo:rerun-if-env-changed={name}");
        build.update(name.as_bytes());
        build.update(env::var(name).unwrap_or_default().as_bytes());
    }
    if let Ok(output) = Command::new(env::var_os("RUSTC").unwrap())
        .arg("-vV")
        .output()
    {
        build.update(output.stdout);
    }
    for (name, fallback) in [
        ("TOOLKIT_SOURCE_ID", source_id),
        ("TOOLKIT_CONTRACT_HASH", contract_hash),
        ("TOOLKIT_BUILD_ID", format!("{:x}", build.finalize())),
        ("TOOLKIT_TARGET", env::var("TARGET").unwrap()),
    ] {
        println!("cargo:rerun-if-env-changed={name}");
        println!(
            "cargo:rustc-env={name}={}",
            env::var(name).unwrap_or(fallback)
        );
    }
}

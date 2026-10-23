use toolkit_core::{contracts::*, profiles::*};
use ts_rs::TS;
fn main() {
    if std::env::args().any(|arg| arg == "--spec") {
        println!(
            "{}",
            serde_json::json!({"protocolMajor":PROTOCOL_MAJOR,"protocolMinor":PROTOCOL_MINOR,"schemaVersion":1,
            "maxFrameBytes":MAX_FRAME_BYTES,"maxRawBytes":MAX_RAW_BYTES,"queueCapacity":QUEUE_CAPACITY,
            "maxMetadataBytes":MAX_METADATA_BYTES,"maxMetadataResultBytes":MAX_METADATA_RESULT_BYTES,
            "maxRequestId":MAX_REQUEST_ID,"maxWireDepth":MAX_JSON_DEPTH + 4,
            "storeName":STORE_NAME,"deData":DE_DATA,"classicExes":CLASSIC_EXES,"deFiles":DE_FILES,
            "maxJsonDepth":MAX_JSON_DEPTH,"emptyStore":empty_store()})
        );
        return;
    }
    // This protocol has bounded safe integers only; future i64 asset IDs need strings.
    let config = ts_rs::Config::default().with_large_int("number");
    let declarations = [
        serde_json::Value::decl(&config),
        PeEvidence::decl(&config),
        Profile::decl(&config),
        ProbeEvidence::decl(&config),
        ProbeResult::decl(&config),
        StoreResult::decl(&config),
        MetadataSizeLimit::decl(&config),
        MetadataRepresentation::decl(&config),
        Hello::decl(&config),
        Operation::decl(&config),
        Input::decl(&config),
        OperationResult::decl(&config),
        Output::decl(&config),
    ];
    println!(
        "// Generated from toolkit-core Rust DTOs. Do not edit.\n{}",
        declarations.map(|d| format!("export {d}")).join("\n")
    );
}

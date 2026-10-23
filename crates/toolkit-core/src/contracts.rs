//! Canonical private wire contract. JSON metadata policy stays in profiles.
use crate::profiles::{PeEvidence, ProbeResult, StoreResult};
use serde::{Deserialize, Serialize};
use serde_json::Value;

pub const MAX_FRAME_BYTES: usize = 12 * 1024 * 1024;
pub const PROTOCOL_MAJOR: u32 = 1;
pub const PROTOCOL_MINOR: u32 = 1;
pub const MAX_RAW_BYTES: usize = 8 * 1024 * 1024;
pub const QUEUE_CAPACITY: usize = 16;
pub const MAX_REQUEST_ID: u64 = 9_007_199_254_740_991;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Hello {
    pub protocol_major: u32,
    pub protocol_minor: u32,
    pub schema_version: u32,
    pub contract_hash: String,
    pub source_id: String,
    pub build_id: String,
    pub architecture: String,
    pub target: String,
    pub max_frame_bytes: u32,
    pub max_raw_bytes: u32,
    pub max_metadata_bytes: u32,
    pub max_metadata_result_bytes: u32,
    pub queue_capacity: u32,
}
pub fn hello() -> Hello {
    Hello {
        protocol_major: PROTOCOL_MAJOR,
        protocol_minor: PROTOCOL_MINOR,
        schema_version: 1,
        contract_hash: env!("TOOLKIT_CONTRACT_HASH").into(),
        source_id: env!("TOOLKIT_SOURCE_ID").into(),
        build_id: env!("TOOLKIT_BUILD_ID").into(),
        architecture: std::env::consts::ARCH.into(),
        target: env!("TOOLKIT_TARGET").into(),
        max_frame_bytes: MAX_FRAME_BYTES as u32,
        max_raw_bytes: MAX_RAW_BYTES as u32,
        max_metadata_bytes: crate::profiles::MAX_METADATA_BYTES as u32,
        max_metadata_result_bytes: crate::profiles::MAX_METADATA_RESULT_BYTES as u32,
        queue_capacity: QUEUE_CAPACITY as u32,
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "op", rename_all = "camelCase", deny_unknown_fields)]
pub enum Operation {
    Probe {
        path: Option<String>,
    },
    Read {
        directory: String,
    },
    Recover {
        directory: String,
    },
    #[serde(rename_all = "camelCase")]
    CompareAndSwap {
        directory: String,
        expected_revision: Option<u64>,
        store: Value,
    },
    #[serde(rename_all = "camelCase")]
    MigrateLegacy {
        directory: String,
        legacy_file: String,
    },
    InspectPe {
        bytes: Vec<u8>,
    },
    ParseMetadata {
        bytes: Vec<u8>,
    },
    ValidateStore {
        store: Value,
    },
}
impl Operation {
    pub fn is_write(&self) -> bool {
        matches!(
            self,
            Self::CompareAndSwap { .. } | Self::Recover { .. } | Self::MigrateLegacy { .. }
        )
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "camelCase", deny_unknown_fields)]
pub enum Input {
    Request { id: u64, operation: Operation },
    Cancel { id: u64 },
}

#[derive(Debug, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum OperationResult {
    Probe { value: ProbeResult },
    Store { value: StoreResult },
    Pe { value: Option<PeEvidence> },
    Metadata { value: Value },
    Rejected { code: String },
    Cancelled,
    QueueFull,
}

#[derive(Debug, Serialize, Deserialize)]
#[cfg_attr(feature = "export-types", derive(ts_rs::TS))]
#[serde(tag = "kind", rename_all = "camelCase")]
#[allow(clippy::large_enum_variant)] // At most 35 queued DTOs; avoid a per-reply heap allocation.
pub enum Output {
    Hello { hello: Hello },
    Started { id: u64 },
    Reply { id: u64, result: OperationResult },
}

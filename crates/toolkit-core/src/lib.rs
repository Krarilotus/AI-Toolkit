//! One profile implementation for in-process and helper consumers.
pub mod contracts;
pub mod profiles;

use contracts::{Operation, OperationResult};
use profiles::ProfileRepository;
use std::path::Path;

/// Private backend API. Hosts must not expose repository CAS to renderers.
/// No operation selects a live context or grants game/document authority.
pub fn execute(operation: Operation) -> OperationResult {
    match operation {
        Operation::Probe { path } => OperationResult::Probe {
            value: profiles::probe_installation(path.as_deref().map(Path::new)),
        },
        Operation::InspectPe { bytes } if bytes.len() <= contracts::MAX_RAW_BYTES => {
            OperationResult::Pe {
                value: profiles::inspect_pe(&bytes),
            }
        }
        Operation::ParseMetadata { bytes } if bytes.len() <= contracts::MAX_RAW_BYTES => {
            match profiles::parse_metadata(&bytes) {
                Ok(value) => OperationResult::Metadata { value },
                Err(code) => OperationResult::Rejected { code: code.into() },
            }
        }
        Operation::InspectPe { .. } | Operation::ParseMetadata { .. } => {
            OperationResult::Rejected {
                code: "raw-too-large".into(),
            }
        }
        Operation::ValidateStore { store } => match profiles::validate_store(&store) {
            Ok(()) => match profiles::validate_metadata_size(&store) {
                Ok(()) => OperationResult::Metadata { value: store },
                Err(_) => OperationResult::Rejected {
                    code: "metadata-too-large".into(),
                },
            },
            Err(code) => OperationResult::Rejected { code: code.into() },
        },
        operation => {
            let directory = match &operation {
                Operation::Read { directory }
                | Operation::Recover { directory }
                | Operation::CompareAndSwap { directory, .. }
                | Operation::MigrateLegacy { directory, .. } => directory,
                _ => unreachable!(),
            };
            if !Path::new(directory).is_absolute() {
                return OperationResult::Rejected {
                    code: "absolute-directory-required".into(),
                };
            }
            let repository = match ProfileRepository::new(Path::new(directory)) {
                Ok(repository) => repository,
                Err(error) => {
                    return OperationResult::Store {
                        value: profiles::StoreResult {
                            status: "io-error".into(),
                            store: None,
                            diagnostics: vec![error.to_string()],
                            candidate: None,
                            size_limit: None,
                        },
                    }
                }
            };
            OperationResult::Store {
                value: match operation {
                    Operation::Read { .. } => repository.read(),
                    Operation::Recover { .. } => repository.recover(),
                    Operation::CompareAndSwap {
                        expected_revision,
                        store,
                        ..
                    } => repository.compare_and_swap(expected_revision, &store),
                    Operation::MigrateLegacy { legacy_file, .. } => {
                        if !Path::new(&legacy_file).is_absolute() {
                            return OperationResult::Rejected {
                                code: "absolute-legacy-file-required".into(),
                            };
                        }
                        repository.migrate_legacy(Path::new(&legacy_file))
                    }
                    _ => unreachable!(),
                },
            }
        }
    }
}

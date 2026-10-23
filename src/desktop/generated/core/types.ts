// Generated from toolkit-core Rust DTOs. Do not edit.
export type JsonValue = number | string | boolean | Array<JsonValue> | { [key in string]: JsonValue } | null;
export type PeEvidence = { machine: number, magic: number, managed: boolean, ilOnly: boolean, requires32Bit: boolean, };
export type Profile = { id: string, edition: string, canonicalRoot: string, displayRoot: string, } & ({ [key in string]: number | string | boolean | Array<JsonValue> | { [key in string]: JsonValue } | null });
export type ProbeEvidence = { relativePath: string, sha256: string, pe: PeEvidence, };
export type ProbeResult = { "status": "recognized", profile: Profile, sourceRevision: string, evidence: Array<ProbeEvidence>, ucpLibraryAvailable: boolean, versionStatus: string, } | { "status": "ambiguous", diagnostics: Array<string>, } | { "status": "incomplete", diagnostics: Array<string>, } | { "status": "unknown", diagnostics: Array<string>, } | { "status": "unreadable", diagnostics: Array<string>, };
export type StoreResult = { status: string, store?: JsonValue, diagnostics?: Array<string>, candidate?: ProbeResult, sizeLimit?: MetadataSizeLimit, };
export type MetadataSizeLimit = { representation: MetadataRepresentation, maxBytes: number, actualBytes: number, };
export type MetadataRepresentation = "persisted" | "result";
export type Hello = { protocolMajor: number, protocolMinor: number, schemaVersion: number, contractHash: string, sourceId: string, buildId: string, architecture: string, target: string, maxFrameBytes: number, maxRawBytes: number, maxMetadataBytes: number, maxMetadataResultBytes: number, queueCapacity: number, };
export type Operation = { "op": "probe", path: string | null, } | { "op": "read", directory: string, } | { "op": "recover", directory: string, } | { "op": "compareAndSwap", directory: string, expectedRevision: number | null, store: JsonValue, } | { "op": "migrateLegacy", directory: string, legacyFile: string, } | { "op": "inspectPe", bytes: Array<number>, } | { "op": "parseMetadata", bytes: Array<number>, } | { "op": "validateStore", store: JsonValue, };
export type Input = { "kind": "request", id: number, operation: Operation, } | { "kind": "cancel", id: number, };
export type OperationResult = { "kind": "probe", value: ProbeResult, } | { "kind": "store", value: StoreResult, } | { "kind": "pe", value: PeEvidence | null, } | { "kind": "metadata", value: JsonValue, } | { "kind": "rejected", code: string, } | { "kind": "cancelled" } | { "kind": "queueFull" };
export type Output = { "kind": "hello", hello: Hello, } | { "kind": "started", id: number, } | { "kind": "reply", id: number, result: OperationResult, };

param(
    [Parameter(Mandatory=$true)][string]$DataRoot,
    [Parameter(Mandatory=$true)][string]$OracleDependencies,
    [Parameter(Mandatory=$true)][string]$LayoutEvidence,
    [Parameter(Mandatory=$true)][string]$Scratch,
    [string]$Target = 'S:/Projects/UCP/de-research/de-assets-core-target',
    [string]$ProbeDirectory = (Join-Path $PWD 'crates/de-assets-core/probes')
)
$ErrorActionPreference = 'Stop'
# One streaming hash per opened input. Keep handles open across the probe, with
# FILE_SHARE_READ, so ordinary local Windows write/delete opens cannot race it.
$pins = @{
    'resources.assets' = '9567ebdce10ef16baf12cf49a9cbdfa064d6b159cdbf3b2d180ea6d04c79730a'
    'resources.assets.resS' = 'be074b3f04769c1be41f99efbf4fa9de70e55e20b21ed54e6e250605d86f066e'
}
$handles = @()
try {
    foreach ($name in @('resources.assets','resources.assets.resS')) {
        $handle = [IO.File]::Open((Join-Path $DataRoot $name),[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
        $handles += $handle
        $sha = [Security.Cryptography.SHA256]::Create()
        try { $digest = [BitConverter]::ToString($sha.ComputeHash($handle)).Replace('-','').ToLowerInvariant() } finally { $sha.Dispose() }
        if ($digest -ne $pins[$name]) { throw "Source hash mismatch: $name" }
        Write-Output "$name SHA256=$digest bytes=$($handle.Length)"
    }
    $manifest = Join-Path $ProbeDirectory '../Cargo.toml'
    & cargo build --manifest-path $manifest --example local_probe --target-dir $Target --offline --locked
    if ($LASTEXITCODE -ne 0) { throw 'Rust probe build failed' }
    & python -B (Join-Path $ProbeDirectory 'local_oracle.py') $DataRoot $OracleDependencies $LayoutEvidence $Scratch (Join-Path $Target 'debug/examples/local_probe.exe')
    if ($LASTEXITCODE -ne 0) { throw 'Local full-field parity failed' }
} finally { foreach ($handle in $handles) { $handle.Dispose() } }

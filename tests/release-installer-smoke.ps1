param([string]$Installer)
$ErrorActionPreference='Stop'
$root=Join-Path $env:TEMP ('release-install-test-'+[Guid]::NewGuid().ToString('N'))
$live=Join-Path $root 'live';$stage=Join-Path $root 'stage';$package=Join-Path $root 'package'
foreach($dir in @($live,$stage,$package)) {foreach($sub in @('resources','config','locales')) {[IO.Directory]::CreateDirectory((Join-Path $dir $sub)) | Out-Null}}
foreach($name in @('AI Toolkit.exe','resources/app.asar','ffmpeg.dll','config/template.json','config/custom.json')) {
 Set-Content (Join-Path $live $name) 'old'
 Set-Content (Join-Path $package $name) 'new'
}
Set-Content (Join-Path $package 'locales/en-US.pak') 'new locale'
Set-Content (Join-Path $package 'user-project.json') 'do not install'
Set-Content (Join-Path $live 'user-project.json') 'preserve'
@{'config/template.json'=(Get-FileHash (Join-Path $live 'config/template.json')).Hash;'config/custom.json'='different'} | ConvertTo-Json | Set-Content (Join-Path $stage 'config-baseline.json')
Compress-Archive -Path (Join-Path $package '*') -DestinationPath (Join-Path $stage 'release.zip')
$script=$Installer
@{repo='Krarilotus/AI-Toolkit';key='snapshot-test';tag='snapshot-test'} | ConvertTo-Json | Set-Content (Join-Path $stage 'release.json')
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $script -Mode Prepare -Stage $stage -InstallRoot $live
if($LASTEXITCODE){throw 'Prepare failed'}
$manifest=Get-Content (Join-Path $stage 'manifest.json') -Raw | ConvertFrom-Json
if($manifest.file -contains 'config/custom.json' -or $manifest.file -contains 'user-project.json'){throw 'Custom data included'}
$lock=[IO.File]::Open((Join-Path $live 'resources/app.asar'),'Open','ReadWrite','None')
try {
 & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $script -Mode Install -Stage $stage -InstallRoot $live -NoRestart
 if($LASTEXITCODE -eq 0){throw 'Lock should block'}
 if((Get-Content (Join-Path $live 'AI Toolkit.exe')) -ne 'old'){throw 'Partial update'}
} finally {$lock.Dispose()}
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $script -Mode Install -Stage $stage -InstallRoot $live -NoRestart
if($LASTEXITCODE){throw 'Install failed'}
foreach($entry in $manifest){if((Get-FileHash (Join-Path $live $entry.file)).Hash -ne $entry.sha256){throw 'Installed hash mismatch'}}
if((Get-Content (Join-Path $live 'config/custom.json')) -ne 'old'){throw 'Custom config changed'}
if((Get-Content (Join-Path $live 'user-project.json')) -ne 'preserve'){throw 'Project changed'}
if((Get-Content (Join-Path $stage 'backup/AI Toolkit.exe')) -ne 'old'){throw 'No rollback backup'}
Write-Output 'PASS: ZIP staging, locked-file refusal without partial update, runtime/config install, custom config/project preservation, hashes and backup.'

$receipt=Get-Content (Join-Path $live '.toolkit-release.json') -Raw | ConvertFrom-Json
if($receipt.key -ne 'snapshot-test' -or $receipt.asarSha256 -ne (Get-FileHash (Join-Path $live 'resources/app.asar')).Hash.ToLowerInvariant()){throw 'Invalid installed provenance'}

# Only remove the explicitly created unique test directory below TEMP.
if([IO.Path]::GetFullPath($root).StartsWith([IO.Path]::GetFullPath($env:TEMP).TrimEnd('\')+'\') -and (Split-Path $root -Leaf).StartsWith('release-install-test-')) { Remove-Item -LiteralPath $root -Recurse -Force }

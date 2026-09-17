param([ValidateSet('Prepare','Install')][string]$Mode, [string]$Stage, [string]$InstallRoot, [int]$WaitPid=0, [switch]$NoRestart)
$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
$live=[IO.Path]::GetFullPath($InstallRoot).TrimEnd('\')
$stageRoot=[IO.Path]::GetFullPath($Stage)
function Hash($file) { (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash }
function SafePath($root,$name) {
 $result=[IO.Path]::GetFullPath((Join-Path $root $name))
 if (-not $result.StartsWith($root.TrimEnd('\')+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid package path.' }
 return $result
}
function Allowed($name) {
 return $name -match '^(AI Toolkit\.exe|[a-zA-Z0-9_.-]+\.(dll|pak|bin|dat)|vk_swiftshader_icd\.json|LICENSE[\w.-]*\.(txt|html)|resources/app\.asar|resources/elevate\.exe|locales/[\w-]+\.pak|config/[\w-]+\.json)$'
}
function RestartEditor {
 if ($NoRestart) { return }
 $start=New-Object Diagnostics.ProcessStartInfo
 $start.FileName=Join-Path $live 'AI Toolkit.exe';$start.WorkingDirectory=$live;$start.UseShellExecute=$false
 $start.EnvironmentVariables.Remove('ELECTRON_RUN_AS_NODE')
 [Diagnostics.Process]::Start($start) | Out-Null
}
if ($Mode -eq 'Prepare') {
 Add-Type -AssemblyName System.IO.Compression.FileSystem
 $archive=[IO.Compression.ZipFile]::OpenRead((Join-Path $stageRoot 'release.zip'))
 try {
  $executables=@($archive.Entries | Where-Object { $_.FullName.Replace('\','/') -match '(^|/)AI[ -]Toolkit\.exe$' })
  if ($executables.Count -ne 1) { throw 'This release is not a supported Windows portable package.' }
  $exe=$executables[0];$exeName=$exe.FullName.Replace('\','/');$prefix=$exeName.Substring(0,$exeName.LastIndexOf('/')+1)
  $incoming=Join-Path $stageRoot 'incoming';[IO.Directory]::CreateDirectory($incoming) | Out-Null
  $baseline=Get-Content -LiteralPath (Join-Path $stageRoot 'config-baseline.json') -Raw | ConvertFrom-Json
  $manifest=@();$seen=@{};$total=0L
  foreach($entry in $archive.Entries) {
   $entryName=$entry.FullName.Replace('\','/')
   if($entryName -match '(^|/)\.\.(/|$)' -or $entryName.StartsWith('/')) { throw 'Invalid ZIP path.' }
   if(-not $entryName.StartsWith($prefix) -or $entryName.EndsWith('/')) { continue }
   $name=$entryName.Substring($prefix.Length)
   if($entry -eq $exe) { $name='AI Toolkit.exe' }
   if(-not (Allowed $name)) { continue }
   if($seen.ContainsKey($name)) { throw 'Duplicate package file.' };$seen[$name]=$true
   $total+=$entry.Length
   if($total -gt 1800000000 -or $manifest.Count -gt 2000) { throw 'Package is too large.' }
   $destination=SafePath $live $name
   $previous=$null
   if(Test-Path -LiteralPath $destination) { $previous=Hash $destination }
   if($name.StartsWith('config/') -and $previous) {
    $known=$baseline.PSObject.Properties[$name]
    if(-not $known -or $known.Value -ne $previous) { continue } # Preserve customized definitions.
   }
   $file=SafePath $incoming $name
   [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($file)) | Out-Null
   [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$file,$true)
   $manifest+=@{file=$name;sha256=(Hash $file);previous=$previous}
  }
  if(-not ($manifest.file -contains 'AI Toolkit.exe') -or -not ($manifest.file -contains 'resources/app.asar')) { throw 'Incomplete Windows release.' }
  $manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $stageRoot 'manifest.json') -Encoding UTF8
 } finally { $archive.Dispose() }
 exit 0
}
$opened=@();$changed=$false
try {
 if($WaitPid) {
  $waiting=Get-Process -Id $WaitPid -ErrorAction SilentlyContinue
  if($waiting -and -not $waiting.WaitForExit(120000)) { throw 'Toolkit did not close; installation cancelled.' }
 }
 $manifest=Get-Content -LiteralPath (Join-Path $stageRoot 'manifest.json') -Raw | ConvertFrom-Json
 if(-not ($manifest.file -contains 'AI Toolkit.exe') -or -not ($manifest.file -contains 'resources/app.asar')) { throw 'Incomplete manifest.' }
 $seen=@{}
 foreach($entry in $manifest) {
  if(-not (Allowed $entry.file) -or $seen.ContainsKey($entry.file)) { throw 'Invalid update manifest.' };$seen[$entry.file]=$true
  $file=SafePath (Join-Path $stageRoot 'incoming') $entry.file
  if((Hash $file) -ne $entry.sha256) { throw 'Update file failed verification.' }
  $dest=SafePath $live $entry.file
  $exists=Test-Path -LiteralPath $dest
  if($exists -and (Hash $dest) -ne $entry.previous) { throw 'Installation changed after download. Please retry.' }
  if(-not $exists -and $entry.previous) { throw 'Installation changed after download.' }
  [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($dest)) | Out-Null
  $fileMode=if($exists){[IO.FileMode]::Open}else{[IO.FileMode]::CreateNew}
  $stream=[IO.File]::Open($dest,$fileMode,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
  $opened += [PSCustomObject]@{Entry=$entry;Stream=$stream;File=$file;Destination=$dest;Existed=$exists;Backup=$null}
 }
 foreach($item in $opened) {
  if(-not $item.Existed) { continue }
  $backup=SafePath (Join-Path $stageRoot 'backup') $item.Entry.file
  [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($backup)) | Out-Null
  if(Test-Path -LiteralPath $backup) { throw 'Backup already exists.' }
  $out=[IO.File]::Create($backup)
  try {$item.Stream.Position=0;$item.Stream.CopyTo($out)} finally {$out.Dispose()}
  $item.Backup=$backup
  if((Hash $backup) -ne $item.Entry.previous) { throw 'Installation changed while acquiring locks.' }
 }
 $changed=$true
 foreach($item in $opened) {
  $inputStream=[IO.File]::OpenRead($item.File)
  try {$item.Stream.Position=0;$item.Stream.SetLength(0);$inputStream.CopyTo($item.Stream);$item.Stream.Flush($true)} finally {$inputStream.Dispose()}
  $item.Stream.Position=0;$hasher=[Security.Cryptography.SHA256]::Create()
  try {$digest=[BitConverter]::ToString($hasher.ComputeHash($item.Stream)).Replace('-','')} finally {$hasher.Dispose()}
  if($digest -ne $item.Entry.sha256) { throw 'Installed hash mismatch.' }
 }
} catch {
 $failure=$_
 if($changed) { foreach($item in $opened) { if($item.Existed -and $item.Backup) {
  $inputStream=[IO.File]::OpenRead($item.Backup)
  try {$item.Stream.Position=0;$item.Stream.SetLength(0);$inputStream.CopyTo($item.Stream);$item.Stream.Flush($true)} finally {$inputStream.Dispose()}
 } } }
 foreach($item in $opened) { $item.Stream.Dispose();if(-not $item.Existed) { Remove-Item -LiteralPath $item.Destination } }
 $opened=@()
 $failure.ToString() | Set-Content -LiteralPath (Join-Path $stageRoot 'error.txt') -Encoding UTF8
 if(-not $NoRestart) { Add-Type -AssemblyName PresentationFramework;[System.Windows.MessageBox]::Show('Update failed. Your previous installation was retained. '+$failure.Exception.Message,'AI Toolkit update') | Out-Null }
 if($changed) { RestartEditor }
 exit 1
} finally { foreach($item in $opened) { $item.Stream.Dispose() } }
Copy-Item -LiteralPath (Join-Path $stageRoot 'manifest.json') -Destination (Join-Path $live 'installed-release.json') -Force
RestartEditor

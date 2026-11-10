param(
  [string]$SourceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
  [string]$DestinationRoot,
  [switch]$CheckOnly
)
$ErrorActionPreference = 'Stop'
$manifest = Join-Path $SourceRoot 'scripts\dragon\runtime-files.json'
$source = Join-Path $SourceRoot 'vendor\gpt-niang'
$files = @(Get-Content -LiteralPath $manifest -Raw -Encoding UTF8 | ConvertFrom-Json)
if (!$files.Count) { throw 'The dragon runtime manifest is empty.' }
foreach ($file in $files) {
  if ($file -isnot [string] -or [IO.Path]::IsPathRooted($file) -or $file -match '(^|[\\/])\.\.([\\/]|$)') {
    throw 'Invalid dragon runtime manifest path.'
  }
  if ($file -match '(^|/)(\.git|\.codex-plugin|macos|tests)(/|$)|/(watch|supervisor|update|mcp|worker)[^/]*\.(mjs|ps1)$') {
    throw "Standalone background runtime must not be packaged: $file"
  }
  if (!(Test-Path -LiteralPath (Join-Path $source $file) -PathType Leaf)) {
    throw "Dragon runtime file missing: $file. Initialize the submodule before packaging."
  }
}
if ($CheckOnly) { Write-Output "Dragon runtime manifest: $($files.Count) required files verified."; return }
if (!$DestinationRoot) { throw 'DestinationRoot is required when copying the dragon runtime.' }
foreach ($file in $files) {
  $destination = Join-Path (Join-Path $DestinationRoot 'vendor\gpt-niang') $file
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
  Copy-Item -LiteralPath (Join-Path $source $file) -Destination $destination
}

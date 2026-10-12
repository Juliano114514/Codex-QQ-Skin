param([int]$Port = 9341, [switch]$RestartExisting, [ValidateSet('native','qq','custom')][string]$SkinMode = '')
. (Join-Path $PSScriptRoot 'common-windows.ps1')
$lifecycle = Enter-SkinLifecycle
try {

if ($Port -lt 1024 -or $Port -gt 65535) { Stop-WithError 'Port must be between 1024 and 65535.' }
Initialize-StateRoot
Resolve-NodeRuntime | Out-Null
Resolve-CodexApp | Out-Null
Seed-BundledTheme

$debugReady = Test-CodexCdpEndpoint -Port $Port
Stop-RecordedInjector
$running = @(Get-CodexProcesses)
if ($running.Count -gt 0 -and -not $debugReady) {
  if (-not $RestartExisting) { Stop-WithError 'Codex is already running without the verified QQ Skin debug endpoint. Close it or pass -RestartExisting.' }
  Stop-CodexApp
}

if (-not $debugReady) {
  $Port = Get-AvailablePort -Preferred $Port
  Write-Host "Launching ChatGPT with loopback debug port $Port..."
  Start-CodexWithCdp -Port $Port
  if (-not (Wait-CodexCdpEndpoint -Port $Port)) {
    Stop-WithError ("ChatGPT 未能在 45 秒内于本机端口 {0} 打开可用的调试接口（CDP）。请查看 {1}。" -f $Port, $script:CodexErrorLog)
  }
}

# Apply and verify synchronously before starting the persistent watcher. This
# avoids a startup race where verification begins before the packaged app has
# finished constructing its renderer shell.
$injectArgs = @('--once','--enable-skin','--port',$Port,'--theme-dir',$script:ThemeDir,'--timeout-ms','60000')
if ($SkinMode) { $injectArgs += @('--skin-mode', $SkinMode) }
Invoke-Injector -Arguments $injectArgs | Out-Null
$codexProcess = @(Get-CodexProcesses) | Select-Object -First 1
if (-not $codexProcess) {
  Stop-WithError 'ChatGPT exited before the running state could be recorded.'
}
$codexPid = [int]$codexProcess.ProcessId
$owner = [Guid]::NewGuid().ToString('N')
$supervisorPath = Join-Path $PSScriptRoot 'supervise-qq-skin-windows.ps1'
$supervisor = Start-Process -FilePath $script:SupervisorExe -WindowStyle Hidden -PassThru -ArgumentList @(
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"{0}"' -f $supervisorPath), '-Port', $Port, '-Owner', $owner
) -RedirectStandardOutput (Join-Path $script:StateRoot 'supervisor-output.log') `
  -RedirectStandardError (Join-Path $script:StateRoot 'supervisor-error.log')
$startedAt = (Get-CimInstance Win32_Process -Filter "ProcessId=$($supervisor.Id)").CreationDate.ToUniversalTime().ToString('o')
Write-State -Port $Port -InjectorPid 0 -InjectorStartedAt '' -CodexPid $codexPid `
  -SupervisorPid $supervisor.Id -SupervisorStartedAt $startedAt -SupervisorOwner $owner
Write-Host "ChatGPT QQ Skin $($script:SkinVersion) is active on loopback port $Port."
exit 0
} finally { $lifecycle.ReleaseMutex(); $lifecycle.Dispose() }

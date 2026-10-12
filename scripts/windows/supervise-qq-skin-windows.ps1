param([Parameter(Mandatory)][ValidateRange(1024,65535)][int]$Port,
  [Parameter(Mandatory)][ValidatePattern('^[a-f0-9]{32}$')][string]$Owner)
. (Join-Path $PSScriptRoot 'common-windows.ps1')
Initialize-StateRoot
Resolve-NodeRuntime | Out-Null
Resolve-CodexApp | Out-Null
$child = $null
$delays = @(1, 2, 5, 10, 30)
$failures = 0
$nextStart = [DateTime]::UtcNow
$missingSince = $null
$supervisorStarted = (Get-CimInstance Win32_Process -Filter "ProcessId=$PID").CreationDate.ToUniversalTime().ToString('o')
$logPath = Join-Path $script:StateRoot 'supervisor.log'
function Write-SupervisorLog([string]$Message) {
  Add-Content -LiteralPath $logPath -Value "[$([DateTime]::UtcNow.ToString('o'))] $Message" -Encoding UTF8
}
function Publish-ChildState([int]$ChildPid, [string]$ChildStartedAt, [int]$AppPid) {
  Write-State -Port $Port -InjectorPid $ChildPid -InjectorStartedAt $ChildStartedAt -CodexPid $AppPid `
    -SupervisorPid $PID -SupervisorStartedAt $supervisorStarted -SupervisorOwner $Owner
}
# The launcher publishes ownership before this process may start a child.
$deadline = [DateTime]::UtcNow.AddSeconds(15)
do {
  $state = Read-State
  if ($state -and $state.PSObject.Properties['supervisorOwner'] -and $state.supervisorOwner -eq $Owner) { break }
  Start-Sleep -Milliseconds 100
} while ([DateTime]::UtcNow -lt $deadline)
if (-not $state -or -not $state.PSObject.Properties['supervisorOwner'] -or $state.supervisorOwner -ne $Owner) { exit 1 }
try {
  Write-SupervisorLog 'Supervisor started.'
  while ($true) {
    $state = Read-State
    if (-not $state -or -not $state.PSObject.Properties['supervisorOwner'] -or $state.supervisorOwner -ne $Owner) { break }
    $app = @(Get-CodexProcesses) | Select-Object -First 1
    if (-not $app) {
      if (-not $missingSince) { $missingSince = [DateTime]::UtcNow }
      if (([DateTime]::UtcNow - $missingSince).TotalSeconds -ge 10) { break }
    } else { $missingSince = $null }
    if ($child) {
      $child.Refresh()
      if ($child.HasExited) {
        $delay = $delays[[Math]::Min($failures, $delays.Count - 1)]
        $failures++
        $nextStart = [DateTime]::UtcNow.AddSeconds($delay)
        Write-SupervisorLog "Injector exited (code $($child.ExitCode)); retry in $delay seconds."
        $child.Dispose()
        $child = $null
        Publish-ChildState 0 '' $(if ($app) { [int]$app.ProcessId } else { 0 })
      } elseif (([DateTime]::UtcNow - $child.StartTime.ToUniversalTime()).TotalSeconds -ge 60) { $failures = 0 }
    }
    if ($app -and -not $child -and [DateTime]::UtcNow -ge $nextStart -and (Test-CodexCdpEndpoint -Port $Port)) {
      $lifecycle = Enter-SkinLifecycle
      try {
        $state = Read-State
        if (-not $state -or $state.supervisorOwner -ne $Owner) { break }
        $child = Start-Injector -Port $Port
        $started = (Get-CimInstance Win32_Process -Filter "ProcessId=$($child.Id)").CreationDate.ToUniversalTime().ToString('o')
        Publish-ChildState $child.Id $started ([int]$app.ProcessId)
        Write-SupervisorLog "Injector started (PID $($child.Id))."
      } catch {
        if ($child -and -not $child.HasExited) { $child.Kill() }
        $child = $null
        $delay = $delays[[Math]::Min($failures, $delays.Count - 1)]
        $failures++
        $nextStart = [DateTime]::UtcNow.AddSeconds($delay)
        Write-SupervisorLog "Injector start failed; retry in $delay seconds."
      } finally { $lifecycle.ReleaseMutex(); $lifecycle.Dispose() }
    }
    Start-Sleep -Seconds 2
  }
} finally {
  if ($child) {
    $child.Refresh()
    if (-not $child.HasExited) { $child.Kill(); $child.WaitForExit(8000) | Out-Null }
    $child.Dispose()
  }
  $state = Read-State
  if ($state -and $state.PSObject.Properties['supervisorOwner'] -and $state.supervisorOwner -eq $Owner) {
    Write-State -Port $Port -InjectorPid 0 -InjectorStartedAt '' -CodexPid 0
  }
  Write-SupervisorLog 'Supervisor stopped.'
}

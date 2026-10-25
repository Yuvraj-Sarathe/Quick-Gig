# QuickGig one-click launcher — smart about already-running servers.
# Launched via START-HERE.bat; you shouldn't need to run this by hand.

$ErrorActionPreference = 'Stop'

function ApiAlive {
  try {
    $r = Invoke-WebRequest -Uri 'http://127.0.0.1:5001/api/jobs' -UseBasicParsing -TimeoutSec 4
    return $r.StatusCode -eq 200
  } catch { return $false }
}

function IsOurApp {
  param($Port)
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 4
    return ($r.Content -like '*QuickGig*')
  } catch { return $false }
}

function WaitFor {
  param($ScriptBlock, $Seconds)
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    if (& $ScriptBlock) { return $true }
    Start-Sleep -Milliseconds 900
  }
  return $false
}

Write-Host ''
Write-Host '  QuickGig — starting...' -ForegroundColor Green

# ---------------------------------------------------------------- backend ---
if (ApiAlive) {
  Write-Host '  [ok] Backend already running on http://127.0.0.1:5001' -ForegroundColor Green
} else {
  Write-Host '  [**] Starting backend window (its log lives there)...'
  Start-Process cmd -ArgumentList '/k', "`"$PSScriptRoot\start-backend.bat`""
  if (-not (WaitFor { ApiAlive } -Seconds 60)) {
    Write-Host ''
    Write-Host '  [!] Backend did not come up in 60s. Check the "QuickGig backend"' -ForegroundColor Yellow
    Write-Host '      window for the actual error (first run can take a few minutes' -ForegroundColor Yellow
    Write-Host '      while pip installs).' -ForegroundColor Yellow
  }
}

# --------------------------------------------------------------- frontend ---
$frontPort = $null
if (IsOurApp 3000) {
  Write-Host '  [ok] Frontend already running on http://localhost:3000' -ForegroundColor Green
  $frontPort = 3000
} else {
  Write-Host '  [**] Starting frontend window (its log lives there)...'
  Start-Process cmd -ArgumentList '/k', "`"$PSScriptRoot\start-frontend.bat`""
  # Vite honors port 3000 unless something occupies it, in which case it uses
  # the next one up (3001). We look for the app on both and open whichever one
  # is the real QuickGig.
  $port3000Up = WaitFor { IsOurApp 3000 } -Seconds 45
  if ($port3000Up) {
    $frontPort = 3000
  } elseif (WaitFor { IsOurApp 3001 } -Seconds 20) {
    $frontPort = 3001
  } else {
    Write-Host ''
    Write-Host '  [!] Frontend did not come up. Check the "QuickGig frontend" window' -ForegroundColor Yellow
    Write-Host '      (first run can take minutes while npm installs).' -ForegroundColor Yellow
  }
}

# ------------------------------------------------------------------ open ---
if ($frontPort) {
  $url = "http://localhost:$frontPort"
  Write-Host ''
  Write-Host "  All set — opening $url" -ForegroundColor Green
  Write-Host '  Leave the two server windows open; closing them stops the servers.'
  Write-Host ''
  Start-Process $url
}
Read-Host '  Press Enter to close this launcher (server windows stay open)'

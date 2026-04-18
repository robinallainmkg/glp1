# GLP1-EU Orchestrator — startup script
# Run at Windows boot to keep bridge + agent-server + tunnel alive
# Install: create a scheduled task or shortcut in shell:startup

$ErrorActionPreference = "SilentlyContinue"
$projectRoot = "C:\Users\robin\glp1\glp1"

# Kill any existing instances
Get-Process -Name "node" | Where-Object { $_.CommandLine -match "agent-server|orchestrator-bridge" } | Stop-Process -Force 2>$null
Get-Process -Name "cloudflared" | Stop-Process -Force 2>$null

Start-Sleep -Seconds 2

# Start agent-server (port 7854)
Start-Process -FilePath "node" -ArgumentList "$projectRoot\scripts\agent-server.mjs" -WorkingDirectory $projectRoot -WindowStyle Hidden

# Start orchestrator bridge (port 7855)
Start-Process -FilePath "node" -ArgumentList "$projectRoot\scripts\orchestrator-bridge.mjs" -WorkingDirectory $projectRoot -WindowStyle Hidden

# Start cloudflared tunnel
Start-Process -FilePath "C:\Program Files (x86)\cloudflared\cloudflared.exe" -ArgumentList "tunnel --url http://localhost:7855" -WindowStyle Hidden

Start-Sleep -Seconds 5

# Verify
$health = Invoke-RestMethod -Uri "http://localhost:7855/health" -Headers @{ Authorization = "Bearer $env:ORCHESTRATOR_TOKEN" } -ErrorAction SilentlyContinue
if ($health.ok) {
    Write-Host "All services started OK. Budget mode: $($health.budget.mode)"
} else {
    Write-Host "WARNING: Bridge health check failed"
}

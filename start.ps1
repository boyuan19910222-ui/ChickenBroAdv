# ChickenBro 游戏启动脚本
# 用法: .\start.ps1
# 如果遇到执行策略限制需要先运行 Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

Set-Location $PSScriptRoot

# ── 环境选择 ─────────────────────────────────────────────────
Write-Host ""
Write-Host "请选择启动环境:"
Write-Host "  [1] 开发环境 (development) - 默认"
Write-Host "  [2] 生产环境 (production)"
Write-Host ""
$choice = Read-Host "输入选项 (直接回车选 1)"

if ($choice -eq '2') {
    $NODE_ENV = 'production'
    Write-Host "已选择: 生产环境" -ForegroundColor Yellow
} else {
    $NODE_ENV = 'development'
    Write-Host "已选择: 开发环境" -ForegroundColor Cyan
}
Write-Host ""
# ─────────────────────────────────────────────────────────────

Write-Host "正在启动 ChickenBro 服务..."

# 检查并杀死已存在的进程
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*server/index.js*" -or $_.CommandLine -like "*server\index.js*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 1

# 启动后端
Write-Host "启动后端服务 (端口 3001)..."
$env:NODE_ENV = $NODE_ENV
$serverProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c node server/index.js" -PassThru -NoNewWindow
Write-Host "后端 PID: $($serverProcess.Id)"

Start-Sleep -Seconds 2

# 启动前端
Write-Host "启动前端服务 (端口 5173)..."
$viteProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx vite --port 5173" -PassThru -NoNewWindow
Write-Host "前端 PID: $($viteProcess.Id)"

# 保存 PID
$serverProcess.Id | Out-File -FilePath "$env:TEMP\chickenbro_server.pid" -Encoding utf8
$viteProcess.Id | Out-File -FilePath "$env:TEMP\chickenbro_vite.pid" -Encoding utf8

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=========================================="
Write-Host "  ChickenBro 已启动！"
Write-Host "=========================================="
Write-Host ""
Write-Host "  前端地址: http://localhost:5173/"
Write-Host "  后端端口: 3001"
Write-Host "  当前环境: $NODE_ENV"
Write-Host ""
Write-Host "  按 Ctrl+C 停止所有服务"
Write-Host "=========================================="
Write-Host ""

# 等待，捕获 Ctrl+C 后停止子进程
try {
    $pids = @()
    if ($serverProcess) { $pids += $serverProcess.Id }
    if ($viteProcess)   { $pids += $viteProcess.Id }
    if ($pids.Count -gt 0) { Wait-Process -Id $pids }
} finally {
    Write-Host "正在停止服务..."
    if ($serverProcess) { Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($viteProcess)   { Stop-Process -Id $viteProcess.Id   -Force -ErrorAction SilentlyContinue }
}

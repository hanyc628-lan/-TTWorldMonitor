#Requires -Version 5.1
<#
.SYNOPSIS
  一键推送 GitHub + 打开 Render 部署页
.USAGE
  powershell -ExecutionPolicy Bypass -File scripts/one-click-deploy.ps1
  # 或带 Token:
  $env:GITHUB_TOKEN="ghp_xxx"; powershell -ExecutionPolicy Bypass -File scripts/one-click-deploy.ps1
#>
$ErrorActionPreference = 'Stop'
$Root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $Root

$env:Path = "C:\Program Files\GitHub CLI;C:\Program Files\Honor\MagicClaw\PresetEnv\node-v24.14.1-win-x64;C:\Program Files\Git\cmd;" + $env:Path

Write-Host "`n=== TTWorldMonitor 一键部署 ===`n" -ForegroundColor Cyan

function Test-GhAuth {
  gh auth status *> $null
  return $LASTEXITCODE -eq 0
}

# 1. GitHub 认证
if ($env:GITHUB_TOKEN) {
  Write-Host "使用 GITHUB_TOKEN 登录..." -ForegroundColor Yellow
  $env:GITHUB_TOKEN | gh auth login --with-token
}

if (-not (Test-GhAuth)) {
  Write-Host "需要 GitHub 授权。正在启动浏览器登录..." -ForegroundColor Yellow
  Write-Host "（若网络超时，请手动运行: gh auth login --web）`n"
  gh auth login --hostname github.com --git-protocol https --web --scopes repo,workflow
}

if (-not (Test-GhAuth)) {
  Write-Host "GitHub 未登录，部署中止。" -ForegroundColor Red
  exit 1
}

$user = (gh api user --jq .login)
Write-Host "GitHub 用户: $user" -ForegroundColor Green

# 2. 创建远程仓库
$repoName = 'TTWorldMonitor'
$remote = "https://github.com/$user/$repoName.git"

gh repo view "$user/$repoName" *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "创建仓库 $user/$repoName ..." -ForegroundColor Yellow
  gh repo create $repoName --public --source=. --remote=origin --description "乒乓球世界实时情报仪表盘 · 云端自我进化"
  if ($LASTEXITCODE -ne 0) {
    gh repo create $repoName --public --description "TTWorldMonitor"
    git remote remove origin 2>$null
    git remote add origin $remote
  }
} else {
  if (-not (git remote get-url origin 2>$null)) {
    git remote add origin $remote
  }
  Write-Host "仓库已存在: $remote" -ForegroundColor Green
}

# 3. 推送
Write-Host "推送到 GitHub main ..." -ForegroundColor Yellow
git branch -M main
git -c user.name="TTWorldMonitor" -c user.email="deploy@ttworldmonitor.local" push -u origin main

Write-Host "`n✓ 代码已推送: https://github.com/$user/$repoName" -ForegroundColor Green

# 4. 打开 Render
Write-Host "`n打开 Render Blueprint（选择仓库后点 Apply）..." -ForegroundColor Yellow
Start-Process "https://dashboard.render.com/blueprints"
Start-Process "https://github.com/settings/installations"

Write-Host "`n部署完成后运行:" -ForegroundColor Cyan
Write-Host "  node scripts/verify-cloud-deploy.mjs https://ttworldmonitor.onrender.com`n"

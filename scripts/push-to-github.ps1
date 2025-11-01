<#
Interactive PowerShell script to initialize, commit and push this repository to GitHub.
It asks for confirmation before making any remote changes.
#>
param(
    [string]$RemoteUrl = 'https://github.com/SahilRouthan/Devbhoomi-Drycleaner.git'
)

Set-StrictMode -Version Latest
$cwd = Get-Location
Write-Host "Working directory: $cwd" -ForegroundColor Cyan

function Confirm([string]$msg) {
    $r = Read-Host "$msg (y/n)"
    return $r -match '^[Yy]'
}

# Ensure git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "git is not available in PATH. Install Git for Windows and try again." -ForegroundColor Red
    exit 1
}

# Initialize repo if needed
if (-not (Test-Path .git)) {
    if (Confirm "No .git found. Initialize a new git repository here?") {
        git init
        Write-Host ".git created." -ForegroundColor Green
    } else {
        Write-Host "Aborting: repository not initialized." -ForegroundColor Yellow
        exit 0
    }
}

# Show status
git status --porcelain

# Add .gitignore if missing
if (-not (Test-Path .gitignore)) {
    if (Confirm ".gitignore not found. Create a standard .gitignore now?") {
        @'
node_modules/
dist/
.env
.DS_Store
Thumbs.db
.vscode/
*.log
'@ | Out-File -FilePath .gitignore -Encoding utf8 -NoNewline
        git add .gitignore
        git commit -m "Add .gitignore" 2>$null | Out-Null
        Write-Host ".gitignore created and committed." -ForegroundColor Green
    }
}

# Stage and commit changes (if any)
$staged = git add . 2>$null; $status = git status --porcelain
if ($status) {
    Write-Host "Staging and committing changes..."
    git add .
    git commit -m "Initial commit: website files" || Write-Host "No new changes to commit." -ForegroundColor Yellow
} else {
    Write-Host "No changes to commit." -ForegroundColor Yellow
}

# Ensure branch main
try { git branch -M main } catch { }

# Check remote
$existingRemote = $null
try { $existingRemote = git remote get-url origin 2>$null } catch { }
if ($existingRemote) {
    Write-Host "Remote 'origin' exists: $existingRemote" -ForegroundColor Yellow
    if (Confirm "Replace existing origin with $RemoteUrl? (this will change where pushes go)") {
        git remote set-url origin $RemoteUrl
        Write-Host "origin set to $RemoteUrl" -ForegroundColor Green
    } else {
        Write-Host "Keeping existing origin: $existingRemote" -ForegroundColor Yellow
    }
} else {
    if (Confirm "Add remote origin -> $RemoteUrl?") {
        git remote add origin $RemoteUrl
        Write-Host "origin added: $RemoteUrl" -ForegroundColor Green
    } else {
        Write-Host "No remote added. You can add one later with 'git remote add origin <url>'" -ForegroundColor Yellow
    }
}

# Create a local backup branch before pushing
$time = Get-Date -Format "yyyyMMdd-HHmmss"
$backupBranch = "backup-before-push-$time"
git branch $backupBranch 2>$null
Write-Host "Local backup branch created: $backupBranch" -ForegroundColor Cyan

# Final confirmation before push
if (-not (git remote get-url origin 2>$null)) {
    Write-Host "No origin remote configured; aborting push." -ForegroundColor Yellow
    exit 0
}
Write-Host "About to push local branch 'main' to remote 'origin'." -ForegroundColor Cyan
if (-not (Confirm "Proceed with git push to origin main now?")) {
    Write-Host "Push cancelled by user." -ForegroundColor Yellow
    exit 0
}

# Push
try {
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Push succeeded." -ForegroundColor Green
    } else {
        Write-Host "Push finished with non-zero exit code: $LASTEXITCODE" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Push failed: $_" -ForegroundColor Red
}

Write-Host "If anything went wrong, review 'git status' and use the backup branch ($backupBranch) to recover local state." -ForegroundColor Cyan
Write-Host "To delete the remote branch (requires permission): git push origin --delete main" -ForegroundColor Yellow

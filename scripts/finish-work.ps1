param(
    [Parameter(Mandatory = $true)]
    [string]$CommitMessage,

    [string]$BaseBranch = "main",
    [switch]$SkipChecks,
    [switch]$NoPR
)

$ErrorActionPreference = "Stop"

if (-not (git rev-parse --is-inside-work-tree 2>$null)) {
    throw "Not a git repository. Run this script inside a repo."
}

$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
if ($currentBranch -eq $BaseBranch) {
    throw "You are on '$BaseBranch'. Create/use a feature branch first."
}

if (-not $SkipChecks) {
    if (Test-Path "pom.xml") {
        Write-Host "Running backend checks (mvn verify)..."
        mvn -B -ntp verify
    }
    elseif (Test-Path "package.json") {
        Write-Host "Running frontend checks (lint + build)..."
        npm run lint
        npm run build
    }
    else {
        Write-Host "No known project type detected. Skipping checks."
    }
}

git add -A

if (-not (git status --porcelain)) {
    Write-Host "No changes to commit."
    exit 0
}

Write-Host "Committing changes..."
git commit -m $CommitMessage

Write-Host "Pushing branch $currentBranch ..."
git push -u origin $currentBranch

if ($NoPR) {
    Write-Host "Done. PR creation skipped (--NoPR)."
    exit 0
}

$ghCmd = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghCmd) {
    Write-Host "GitHub CLI (gh) not found. Create PR manually."
    exit 0
}

Write-Host "Creating/updating PR..."
try {
    gh pr create --base $BaseBranch --head $currentBranch --fill
} catch {
    Write-Host "PR may already exist; continuing."
}

try {
    gh pr merge $currentBranch --auto --squash --delete-branch=false
    Write-Host "Auto-merge enabled via GitHub CLI."
} catch {
    Write-Host "Could not enable auto-merge via GitHub CLI. Trying fallback label..."
    try {
        gh pr edit $currentBranch --add-label automerge
        Write-Host "Label 'automerge' added."
    } catch {
        Write-Host "Could not add label 'automerge' automatically."
    }
}

Write-Host "Done."

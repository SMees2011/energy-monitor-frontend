param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [string]$Type = "feat"
)

$ErrorActionPreference = "Stop"

if (-not (git rev-parse --is-inside-work-tree 2>$null)) {
    throw "Not a git repository. Run this script inside a repo."
}

if (git status --porcelain) {
    throw "Working tree is not clean. Commit/stash changes first."
}

$branch = "$Type/$Name"

Write-Host "Syncing main..."
git checkout main
git pull origin main

Write-Host "Creating branch $branch ..."
git checkout -b $branch

Write-Host "Done. Current branch: $branch"

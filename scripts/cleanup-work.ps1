param(
    [string]$BaseBranch = "main",
    [string]$BranchToDelete
)

$ErrorActionPreference = "Stop"

if (-not (git rev-parse --is-inside-work-tree 2>$null)) {
    throw "Not a git repository. Run this script inside a repo."
}

if (-not $BranchToDelete) {
    $BranchToDelete = (git rev-parse --abbrev-ref HEAD).Trim()
}

if ($BranchToDelete -eq $BaseBranch) {
    throw "Refusing to delete base branch '$BaseBranch'."
}

Write-Host "Switching to $BaseBranch and syncing..."
git checkout $BaseBranch
git pull origin $BaseBranch

Write-Host "Deleting local branch $BranchToDelete ..."
git branch -d $BranchToDelete

Write-Host "Pruning remote-tracking branches..."
git fetch --prune

Write-Host "Done."

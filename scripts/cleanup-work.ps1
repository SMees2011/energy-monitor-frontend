param(
    [string]$BaseBranch = "main",
    [string]$BranchToDelete,
    [switch]$DeleteRemote
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

if ($DeleteRemote) {
    $merged = git branch --merged origin/$BaseBranch | Select-String ("\\b" + [regex]::Escape($BranchToDelete) + "\\b")
    if ($merged) {
        Write-Host "Deleting remote branch origin/$BranchToDelete ..."
        git push origin --delete $BranchToDelete
        git fetch --prune
    }
    else {
        Write-Host "Remote branch not deleted because '$BranchToDelete' is not confirmed merged."
    }
}

Write-Host "Done."

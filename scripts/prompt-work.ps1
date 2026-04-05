param(
    [Parameter(Mandatory = $true)]
    [string]$Prompt
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoDir = Split-Path -Parent $scriptDir
$repoName = Split-Path -Leaf $repoDir
$repoType = if ($repoName -like '*frontend*') { 'frontend' } else { 'backend' }

$startScript = Join-Path $scriptDir "start-work.ps1"
$cleanupScript = Join-Path $scriptDir "cleanup-work.ps1"
$finishScript = Join-Path $scriptDir "finish-work.ps1"

if (-not (Test-Path $startScript)) {
    throw "Could not find start-work.ps1 in scripts folder."
}

if (-not (Test-Path $cleanupScript)) {
    throw "Could not find cleanup-work.ps1 in scripts folder."
}

if (-not (Test-Path $finishScript)) {
    throw "Could not find finish-work.ps1 in scripts folder."
}

$rawPrompt = $Prompt.Trim()
$normalized = $rawPrompt.ToLowerInvariant()

# Start branch examples:
# - "maak een feature branch aan met naam mobile-layout"
# - "maak een fix branch aan met naam login-bug"
if ($normalized -match '^maak\s+een\s+(feature|fix)\s+branch\s+aan\s+met\s+naam\s+([a-z0-9._/-]+)$') {
    $type = if ($Matches[1] -eq 'feature') { 'feat' } else { 'fix' }
    $name = $Matches[2]

    & $startScript -Type $type -Name $name
    exit 0
}

# Explicit cleanup examples:
# - "ruim branch mijn-branch in backend lokaal op"
# - "ruim branch mijn-branch in frontend lokaal en remote op"
if ($normalized -match '^ruim\s+branch\s+([a-z0-9._/-]+)\s+in\s+(backend|frontend)\s+lokaal\s+op$') {
    $branch = $Matches[1]
    $targetRepo = $Matches[2]

    if ($targetRepo -ne $repoType) {
        throw "Deze repo is '$repoType'. Je vroeg cleanup voor '$targetRepo'."
    }

    & $cleanupScript -BranchToDelete $branch
    exit 0
}

if ($normalized -match '^ruim\s+branch\s+([a-z0-9._/-]+)\s+in\s+(backend|frontend)\s+lokaal\s+en\s+remote\s+op$') {
    $branch = $Matches[1]
    $targetRepo = $Matches[2]

    if ($targetRepo -ne $repoType) {
        throw "Deze repo is '$repoType'. Je vroeg cleanup voor '$targetRepo'."
    }

    & $cleanupScript -BranchToDelete $branch -DeleteRemote
    exit 0
}

# Backward compatible cleanup examples:
# - "ruim deze branch op"
# - "ruim deze branch op en verwijder hem ook remote"
if ($normalized -eq 'ruim deze branch op') {
    & $cleanupScript
    exit 0
}

if ($normalized -eq 'ruim deze branch op en verwijder hem ook remote') {
    & $cleanupScript -DeleteRemote
    exit 0
}

# Finish work examples:
# - "rond werk af met commit bericht voeg polling fix toe"
# - "rond werk af met commit login flow afgerond"
if ($rawPrompt -match '^(?i)rond\s+werk\s+af\s+met\s+commit(?:\s+bericht)?\s+(.+)$') {
    $commitMessage = $Matches[1].Trim()
    if (-not $commitMessage) {
        throw "Commit message mag niet leeg zijn."
    }

    & $finishScript -CommitMessage $commitMessage
    exit 0
}

throw "Prompt not recognized. Use: maak een feature/fix branch aan met naam <naam> | ruim branch <naam> in backend/frontend lokaal op | ruim branch <naam> in backend/frontend lokaal en remote op | rond werk af met commit (bericht) <jouw boodschap>"
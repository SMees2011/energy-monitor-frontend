param(
    [Parameter(Mandatory = $true)]
    [string]$Prompt
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$startScript = Join-Path $scriptDir "start-work.ps1"

if (-not (Test-Path $startScript)) {
    throw "Could not find start-work.ps1 in scripts folder."
}

$normalized = $Prompt.Trim().ToLowerInvariant()

# Dutch examples:
# - "maak een feature branch aan met naam mobile-layout"
# - "maak een fix branch aan met naam login-bug"
if ($normalized -match '^maak\s+een\s+(feature|fix)\s+branch\s+aan\s+met\s+naam\s+([a-z0-9._/-]+)$') {
    $type = if ($Matches[1] -eq 'feature') { 'feat' } else { 'fix' }
    $name = $Matches[2]

    & $startScript -Type $type -Name $name
    exit 0
}

throw "Prompt not recognized. Use: maak een feature branch aan met naam <naam> OR maak een fix branch aan met naam <naam>"

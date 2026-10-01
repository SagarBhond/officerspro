$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $repoRoot "compose.yaml"

if (-not (Test-Path -LiteralPath $composeFile)) {
    throw "Frontend Compose file not found: $composeFile"
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Docker Desktop is not ready. Start Docker Desktop, then rerun this script."
}

Push-Location $repoRoot
try {
    docker compose config --quiet
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend Compose configuration is invalid."
    }

    docker compose up -d --build --wait --wait-timeout 180
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend did not start successfully. Check with: docker compose logs --tail 100"
    }

    docker compose ps
}
finally {
    Pop-Location
}

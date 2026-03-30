@echo off
REM MessWala Automated Docker Deployment Script (Windows)
REM Uses Docker Compose to deploy backend, frontend, and MongoDB

setlocal enabledelayedexpansion

echo.
echo 🐳 MessWala Docker Deployment Suite
echo ====================================
echo.

REM Configuration
set REPO_ROOT=%~dp0
set ENV_FILE=%REPO_ROOT%.env.production

REM Step 1: Check Docker Installation
echo [Step 1] Checking Docker Installation
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker is not installed
    echo Install Docker from: https://docs.docker.com/get-docker/
    exit /b 1
)

for /f "tokens=*" %%i in ('docker --version') do set DOCKER_VERSION=%%i
echo ✅ %DOCKER_VERSION%

where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Compose is not installed
    echo Install Docker Compose from: https://docs.docker.com/compose/install/
    exit /b 1
)

for /f "tokens=*" %%i in ('docker-compose --version') do set COMPOSE_VERSION=%%i
echo ✅ %COMPOSE_VERSION%
echo.

REM Step 2: Validate Environment File
echo [Step 2] Validating Environment Configuration
if not exist "%ENV_FILE%" (
    echo ❌ .env.production not found at %ENV_FILE%
    echo Create it from template: cp .env.example .env.production
    exit /b 1
)
echo ✅ Environment file found
echo.

REM Step 3: Build Docker Images
echo [Step 3] Building Docker Images
call docker-compose -f "%REPO_ROOT%docker-compose.yml" build --no-cache
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Images built successfully
echo.

REM Step 4: Start Services
echo [Step 4] Starting Services
call docker-compose -f "%REPO_ROOT%docker-compose.yml" up -d
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to start services
    exit /b 1
)
echo ✅ Services started
echo.

REM Step 5: Wait for Services
echo [Step 5] Waiting for Services to be Ready
echo Waiting for MongoDB to be healthy...
timeout /t 10 /nobreak

echo Waiting for Backend to be healthy...
set /a RETRIES=0
:health_check_loop
if %RETRIES% geq 30 (
    echo ❌ Backend failed to start
    call docker-compose -f "%REPO_ROOT%docker-compose.yml" logs backend
    exit /b 1
)

powershell -Command "try { $result = Invoke-WebRequest -Uri 'http://localhost:5000/api/live' -UseBasicParsing -ErrorAction Stop; if ($result.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend is healthy
    goto :verify_deployment
)

set /a RETRIES=%RETRIES%+1
echo Attempt %RETRIES%/30...
timeout /t 2 /nobreak
goto health_check_loop

:verify_deployment
REM Step 6: Verify Deployment
echo.
echo [Step 6] Verifying Deployment
echo Checking Backend Health...
powershell -Command "try { $result = Invoke-WebRequest -Uri 'http://localhost:5000/api/live' -UseBasicParsing; if ($result.Content -match 'alive') { Write-Host '✅ Backend Health: OK' } else { Write-Host '❌ Backend Health: FAILED' } } catch { Write-Host '❌ Backend Health: UNREACHABLE' }"

echo Checking Backend Readiness...
powershell -Command "try { $result = Invoke-WebRequest -Uri 'http://localhost:5000/api/ready' -UseBasicParsing; if ($result.Content -match 'ready') { Write-Host '✅ Backend Readiness: OK' } else { Write-Host '❌ Backend Readiness: FAILED' } } catch { Write-Host '❌ Backend Readiness: UNREACHABLE' }"

echo Checking Frontend...
powershell -Command "try { $result = Invoke-WebRequest -Uri 'http://localhost' -UseBasicParsing; if ($result.Content -match 'DOCTYPE') { Write-Host '✅ Frontend: OK' } else { Write-Host '⏳ Frontend: Starting' } } catch { Write-Host '⏳ Frontend: Starting' }"

REM Step 7: Show Service Status
echo.
echo [Step 7] Service Status
call docker-compose -f "%REPO_ROOT%docker-compose.yml" ps
echo.

REM Step 8: Display Access Information
echo.
echo ════════════════════════════════════════════════════════════
echo ✅ DOCKER DEPLOYMENT COMPLETE
echo ════════════════════════════════════════════════════════════
echo.
echo 🌐 Access Your Services:
echo.
echo   Frontend:    http://localhost
echo   Backend API: http://localhost:5000/api
echo   Health Check: curl http://localhost:5000/api/health
echo   API Docs:    http://localhost:5000/api/docs
echo.
echo 📊 Useful Commands:
echo.
echo   View logs:           docker-compose logs -f
echo   View backend logs:   docker-compose logs -f backend
echo   View frontend logs:  docker-compose logs -f frontend
echo   Stop services:       docker-compose down
echo   Stop and remove:     docker-compose down -v
echo   Restart services:    docker-compose restart
echo   View status:         docker-compose ps
echo.
echo ⚠️  Production Deployment:
echo   For production use, ensure:
echo   • MongoDB has authentication enabled
echo   • JWT_SECRET is at least 64 characters
echo   • ENCRYPTION_KEY is secure
echo   • FRONTEND_URL and VITE_API_URL are correct
echo   • Services are behind a reverse proxy (nginx/Traefik)
echo   • HTTPS/SSL is enabled
echo   • Regular backups are configured
echo.
echo ════════════════════════════════════════════════════════════
echo.

endlocal

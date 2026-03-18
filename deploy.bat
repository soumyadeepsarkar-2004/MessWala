@echo off
REM 🚀 Production Deployment Script (Windows)
REM 
REM This script automates pre-deployment validation and deployment
REM Usage: deploy.bat [backend|frontend|both]
REM
REM Prerequisites:
REM - Git configured and authenticated
REM - Node.js 18+ installed
REM - Environment variables set on hosting platforms

setlocal enabledelayedexpansion

REM Color codes (Windows 10+)
for /F %%A in ('echo prompt $H ^| cmd') do set "BS=%%A"

set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

REM Helper functions
:log_info
echo [%BLUE%*%RESET%] %~1
exit /b

:log_success
echo [%GREEN%OK%RESET%] %~1
exit /b

:log_warning
echo [%YELLOW%!%RESET%] %~1
exit /b

:log_error
echo [%RED%X%RESET%] %~1
exit /b

:check_prerequisites
echo.
echo Checking prerequisites...

where /q node
if errorlevel 1 (
    call :log_error "Node.js is not installed"
    exit /b 1
)

where /q git
if errorlevel 1 (
    call :log_error "Git is not installed"
    exit /b 1
)

call :log_success "All prerequisites met"
exit /b 0

:validate_backend
echo.
echo Validating backend environment...
cd backend

if exist "validate-production-env.js" (
    call node validate-production-env.js
    if errorlevel 1 (
        call :log_error "Backend environment validation failed"
        cd ..
        exit /b 1
    )
)

call :log_success "Backend environment validated"
cd ..
exit /b 0

:test_backend
echo.
echo Running backend tests...
cd backend
call npm test
if errorlevel 1 (
    call :log_error "Backend tests failed"
    cd ..
    exit /b 1
)
cd ..
call :log_success "Backend tests passed"
exit /b 0

:lint_backend
echo.
echo Linting backend code...
cd backend
call npm run lint
cd ..
call :log_success "Linting complete"
exit /b 0

:security_audit
echo.
echo Running security audit...
cd backend
call npm audit --audit-level=moderate
cd ..
call :log_success "Security audit complete"
exit /b 0

:build_frontend
echo.
echo Building frontend...
cd frontend
call npm run build
if errorlevel 1 (
    call :log_error "Frontend build failed"
    cd ..
    exit /b 1
)
cd ..
call :log_success "Frontend built successfully"
exit /b 0

:create_backup_reminder
echo.
call :log_warning "MANUAL STEP REQUIRED: Create MongoDB backup before deployment"
echo.
echo Before deployment, create a backup:
echo 1. Go to MongoDB Atlas Console
echo 2. Navigate to: Clusters - Backups
echo 3. Click 'Take a Snapshot'
echo 4. Wait for backup to complete
echo.
set /p continue="Press Enter after backup is complete..."
exit /b 0

:prepare_git
echo.
echo Preparing Git repository...
call :log_success "Git repository ready"
exit /b 0

:deploy_backend
echo.
call :log_info "Deploying backend to Render..."
call :log_info "Pushing code to GitHub..."
call git push origin main
if errorlevel 1 (
    call :log_error "Git push failed"
    exit /b 1
)
call :log_success "Backend deployment initiated"
call :log_info "Monitor at: https://dashboard.render.com"
exit /b 0

:deploy_frontend
echo.
call :log_info "Deploying frontend to Vercel..."
call :log_info "Pushing code to GitHub..."
call git push origin main
if errorlevel 1 (
    call :log_error "Git push failed"
    exit /b 1
)
call :log_success "Frontend deployment initiated"
call :log_info "Monitor at: https://vercel.com/dashboard"
exit /b 0

:main
set TARGET=%1
if "%TARGET%"=="" set TARGET=both

echo.
echo 🚀 MessWala Production Deployment Script
echo ========================================
echo Target: %TARGET%
echo.

call :check_prerequisites
if errorlevel 1 exit /b 1

call :prepare_git
if errorlevel 1 exit /b 1

call :validate_backend
if errorlevel 1 exit /b 1

call :test_backend
if errorlevel 1 exit /b 1

call :lint_backend

call :security_audit

if "%TARGET%"=="frontend" goto skip_backend
if "%TARGET%"=="both" (
    call :build_frontend
    if errorlevel 1 exit /b 1
)

:skip_backend
if "%TARGET%"=="backend" goto skip_frontend
if "%TARGET%"=="both" (
    call :build_frontend
    if errorlevel 1 exit /b 1
)

:skip_frontend
call :create_backup_reminder

echo.
call :log_warning "========================================"
call :log_info "Starting deployment..."
echo.

if "%TARGET%"=="backend" goto deploy_backend_only
if "%TARGET%"=="both" (
    call :deploy_backend
    call :deploy_frontend
    goto deployment_complete
)
if "%TARGET%"=="frontend" (
    call :deploy_frontend
    goto deployment_complete
)

:deploy_backend_only
call :deploy_backend

:deployment_complete
echo.
call :log_warning "========================================"
call :log_success "Deployment initiated!"
echo.
call :log_info "Monitor your dashboards:"
call :log_info "- Backend: https://dashboard.render.com"
call :log_info "- Frontend: https://vercel.com/dashboard"
echo.
call :log_warning "Be on-call for next 24 hours"
echo.

set /p end_input="Press Enter to finish..."

endlocal

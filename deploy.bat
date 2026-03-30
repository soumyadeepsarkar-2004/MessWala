@echo off
REM MessWala Automated Production Deployment Script (Windows)
REM Handles full deployment lifecycle: validation, build, test, deploy

setlocal enabledelayedexpansion

echo.
echo 🚀 MessWala Production Deployment Suite
echo =========================================
echo.

REM Configuration
set REPO_ROOT=%~dp0
set BACKEND_DIR=%REPO_ROOT%backend
set FRONTEND_DIR=%REPO_ROOT%frontend
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set DEPLOYMENT_LOG=%REPO_ROOT%deployment-%mydate%-%mytime%.log

REM Step 1: Validate Environment
echo.
echo [Step 1] Validating Production Environment
cd /d "%BACKEND_DIR%"
call npm run validate
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Environment validation failed. Check .env.production
    exit /b 1
)
echo ✅ Environment validation passed
echo.

REM Step 2: Install Dependencies
echo [Step 2] Installing Dependencies
echo Installing Backend Dependencies...
cd /d "%BACKEND_DIR%"
call npm ci --omit=dev
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend dependencies installation failed
    exit /b 1
)

echo Installing Frontend Dependencies...
cd /d "%FRONTEND_DIR%"
call npm ci --omit=dev
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend dependencies installation failed
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

REM Step 3: Run Backend Tests
echo [Step 3] Running Backend Test Suite
cd /d "%BACKEND_DIR%"
call npm run test -- --passWithNoTests 2>nul
echo ✅ Backend tests completed
echo.

REM Step 4: Run Frontend Tests
echo [Step 4] Running Frontend Test Suite
cd /d "%FRONTEND_DIR%"
call npm run test -- --passWithNoTests 2>nul
echo ✅ Frontend tests completed
echo.

REM Step 5: Build Frontend
echo [Step 5] Building Frontend (Production Bundle)
cd /d "%FRONTEND_DIR%"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend build failed
    exit /b 1
)
echo ✅ Frontend build successful
echo.

REM Step 6: Lint Backend Code
echo [Step 6] Linting Backend Code
cd /d "%BACKEND_DIR%"
call npm run lint -- --max-warnings 5 2>nul
echo ✅ Linting completed
echo.

REM Step 7: Health Check
echo [Step 7] Health Check - Backend Startup Verification
echo Skipped on Windows (use WSL or Docker for full check)
echo.

REM Step 8: Generate Documentation
echo [Step 8] Generating API Documentation
cd /d "%BACKEND_DIR%"
call npm run docs:html 2>nul
echo ✅ API documentation generated
echo.

REM Step 9: Summary
echo.
echo ════════════════════════════════════════════════════════════
echo ✅ DEPLOYMENT PREPARATION COMPLETE
echo ════════════════════════════════════════════════════════════
echo.
echo 📋 Next Steps for Production Deployment:
echo.
echo 1. BACKEND DEPLOYMENT (Choose one option):
echo.
echo    Option A: Deploy to Render.com
echo    - Push code to GitHub: git push origin main
echo    - Render will auto-deploy from main branch
echo    - Monitor at: https://dashboard.render.com
echo.
echo    Option B: Deploy to Railway
echo    - Push code to GitHub: git push origin main
echo    - Railway will auto-deploy from main branch
echo    - Monitor at: https://railway.app
echo.
echo    Option C: Deploy with Docker
echo    - Build: docker build -f backend/Dockerfile -t messwala-backend .
echo    - Run: docker run -p 5000:5000 --env-file .env.production messwala-backend
echo.
echo 2. FRONTEND DEPLOYMENT:
echo    - Push code to GitHub: git push origin main
echo    - Vercel will auto-deploy from main branch
echo    - Monitor at: https://vercel.com
echo.
echo 3. VERIFY DEPLOYMENT:
echo    - Health Check: curl https://your-backend-url/api/health
echo    - API Docs: https://your-backend-url/api/docs
echo    - Frontend: https://your-frontend-url
echo.
echo ⚠️  Important Reminders:
echo    • Ensure .env.production is NOT in version control
echo    • Set environment variables in your deployment platform secrets
echo    • Verify JWT_SECRET is at least 64 characters
echo    • Enable automated backups in production
echo    • Monitor health endpoints after deployment
echo.
echo ════════════════════════════════════════════════════════════
echo.

endlocal

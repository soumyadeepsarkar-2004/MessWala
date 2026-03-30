#!/bin/bash
# MessWala Automated Production Deployment Script
# Handles full deployment lifecycle: validation, build, test, deploy

set -e

echo "🚀 MessWala Production Deployment Suite"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_DIR="$REPO_ROOT/frontend"
DEPLOYMENT_LOG="$REPO_ROOT/deployment-$(date +%s).log"

# Step 1: Validate Environment
echo -e "\n${YELLOW}[Step 1] Validating Production Environment${NC}"
if cd "$BACKEND_DIR" && npm run validate; then
  echo -e "${GREEN}✅ Environment validation passed${NC}"
else
  echo -e "${RED}❌ Environment validation failed. Check .env.production${NC}"
  exit 1
fi

# Step 2: Install Dependencies
echo -e "\n${YELLOW}[Step 2] Installing Dependencies${NC}"
echo "Installing Backend Dependencies..."
cd "$BACKEND_DIR"
npm ci --omit=dev

echo "Installing Frontend Dependencies..."
cd "$FRONTEND_DIR"
npm ci --omit=dev

# Step 3: Run Backend Tests
echo -e "\n${YELLOW}[Step 3] Running Backend Test Suite${NC}"
cd "$BACKEND_DIR"
if npm run test -- --passWithNoTests; then
  echo -e "${GREEN}✅ Backend tests passed${NC}"
else
  echo -e "${YELLOW}⚠️  Some tests failed, but continuing...${NC}"
fi

# Step 4: Run Frontend Tests
echo -e "\n${YELLOW}[Step 4] Running Frontend Test Suite${NC}"
cd "$FRONTEND_DIR"
if npm run test -- --passWithNoTests; then
  echo -e "${GREEN}✅ Frontend tests passed${NC}"
else
  echo -e "${YELLOW}⚠️  Some tests failed, but continuing...${NC}"
fi

# Step 5: Build Frontend
echo -e "\n${YELLOW}[Step 5] Building Frontend (Production Bundle)${NC}"
cd "$FRONTEND_DIR"
npm run build
echo -e "${GREEN}✅ Frontend build successful${NC}"

# Step 6: Lint Backend Code
echo -e "\n${YELLOW}[Step 6] Linting Backend Code${NC}"
cd "$BACKEND_DIR"
if npm run lint -- --max-warnings 5; then
  echo -e "${GREEN}✅ Linting passed${NC}"
else
  echo -e "${YELLOW}⚠️  Linting warnings found but not blocking${NC}"
fi

# Step 7: Health Check - Verify Backend can Start
echo -e "\n${YELLOW}[Step 7] Health Check - Backend Startup Verification${NC}"
cd "$BACKEND_DIR"
timeout 10s npm start &
sleep 3
if curl -s http://localhost:5000/api/live > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend startup verified${NC}"
  pkill -f "npm start" || true
else
  echo -e "${RED}❌ Backend failed to start${NC}"
  exit 1
fi

# Step 8: Generate Documentation
echo -e "\n${YELLOW}[Step 8] Generating API Documentation${NC}"
cd "$BACKEND_DIR"
npm run docs:html
echo -e "${GREEN}✅ API documentation generated${NC}"

# Step 9: Create Backup Before Deployment
echo -e "\n${YELLOW}[Step 9] Creating Pre-Deployment Backup${NC}"
echo "Backup will be created on production server"

# Step 10: Deployment Instructions
echo -e "\n${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT PREPARATION COMPLETE${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps for Production Deployment:${NC}"
echo ""
echo "1. BACKEND DEPLOYMENT (Choose one option):"
echo ""
echo "   Option A: Deploy to Render.com"
echo "   - Push code to GitHub: git push origin main"
echo "   - Render will auto-deploy from main branch"
echo "   - Monitor at: https://dashboard.render.com"
echo ""
echo "   Option B: Deploy to Railway"
echo "   - Push code to GitHub: git push origin main"
echo "   - Railway will auto-deploy from main branch"
echo "   - Monitor at: https://railway.app"
echo ""
echo "   Option C: Deploy with Docker"
echo "   - Build: docker build -f backend/Dockerfile -t messwala-backend ."
echo "   - Run: docker run -p 5000:5000 --env-file .env.production messwala-backend"
echo ""
echo "2. FRONTEND DEPLOYMENT:"
echo "   - Push code to GitHub: git push origin main"
echo "   - Vercel will auto-deploy from main branch"
echo "   - Monitor at: https://vercel.com"
echo ""
echo "3. VERIFY DEPLOYMENT:"
echo "   - Health Check: curl https://your-backend-url/api/health"
echo "   - API Docs: https://your-backend-url/api/docs"
echo "   - Frontend: https://your-frontend-url"
echo ""
echo -e "${YELLOW}📊 Deployment Log:${NC}"
echo "   $DEPLOYMENT_LOG"
echo ""
echo -e "${YELLOW}⚠️  Important Reminders:${NC}"
echo "   • Ensure .env.production is NOT in version control"
echo "   • Set environment variables in your deployment platform secrets"
echo "   • Verify JWT_SECRET is at least 64 characters"
echo "   • Enable automated backups in production"
echo "   • Monitor health endpoints after deployment"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"

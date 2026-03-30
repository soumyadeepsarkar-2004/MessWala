#!/bin/bash
# MessWala Automated Docker Deployment Script
# Uses Docker Compose to deploy backend, frontend, and MongoDB

set -e

echo "🐳 MessWala Docker Deployment Suite"
echo "===================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${REPO_ROOT}/.env.production"

# Step 1: Check Docker Installation
echo -e "\n${YELLOW}[Step 1] Checking Docker Installation${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker: $(docker --version)${NC}"
echo -e "${GREEN}✅ Docker Compose: $(docker-compose --version)${NC}"

# Step 2: Validate Environment File
echo -e "\n${YELLOW}[Step 2] Validating Environment Configuration${NC}"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ .env.production not found at $ENV_FILE${NC}"
    echo "Create it from template: cp .env.example .env.production"
    exit 1
fi
echo -e "${GREEN}✅ Environment file found${NC}"

# Step 3: Build Docker Images
echo -e "\n${YELLOW}[Step 3] Building Docker Images${NC}"
docker-compose -f "${REPO_ROOT}/docker-compose.yml" build --no-cache
echo -e "${GREEN}✅ Images built successfully${NC}"

# Step 4: Start Services
echo -e "\n${YELLOW}[Step 4] Starting Services${NC}"
docker-compose -f "${REPO_ROOT}/docker-compose.yml" up -d
echo -e "${GREEN}✅ Services started${NC}"

# Step 5: Wait for Services to be Ready
echo -e "\n${YELLOW}[Step 5] Waiting for Services to be Ready${NC}"
echo "Waiting for MongoDB to be healthy..."
sleep 10

echo "Waiting for Backend to be healthy..."
for i in {1..30}; do
    if curl -s http://localhost:5000/api/live > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    echo -n "."
    sleep 2
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        docker-compose -f "${REPO_ROOT}/docker-compose.yml" logs backend
        exit 1
    fi
done

# Step 6: Verify Deployment
echo -e "\n${YELLOW}[Step 6] Verifying Deployment${NC}"

# Check Backend
echo -n "Checking Backend Health..."
if curl -s http://localhost:5000/api/live | grep -q "alive"; then
    echo -e " ${GREEN}✅${NC}"
else
    echo -e " ${RED}❌${NC}"
fi

# Check Readiness
echo -n "Checking Backend Readiness..."
if curl -s http://localhost:5000/api/ready | grep -q "ready"; then
    echo -e " ${GREEN}✅${NC}"
else
    echo -e " ${RED}❌${NC}"
fi

# Check Frontend
echo -n "Checking Frontend..."
if curl -s http://localhost | grep -q "<!DOCTYPE"; then
    echo -e " ${GREEN}✅${NC}"
else
    echo -e " ${YELLOW}⏳ Still starting${NC}"
fi

# Step 7: Show Service Status
echo -e "\n${YELLOW}[Step 7] Service Status${NC}"
docker-compose -f "${REPO_ROOT}/docker-compose.yml" ps

# Step 8: Display Access Information
echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DOCKER DEPLOYMENT COMPLETE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}🌐 Access Your Services:${NC}"
echo ""
echo "  Frontend:    http://localhost"
echo "  Backend API: http://localhost:5000/api"
echo "  Health Check: curl http://localhost:5000/api/health"
echo "  API Docs:    http://localhost:5000/api/docs"
echo ""
echo -e "${YELLOW}📊 Useful Commands:${NC}"
echo ""
echo "  View logs:           docker-compose logs -f"
echo "  View backend logs:   docker-compose logs -f backend"
echo "  View frontend logs:  docker-compose logs -f frontend"
echo "  Stop services:       docker-compose down"
echo "  Stop and remove:     docker-compose down -v"
echo "  Restart services:    docker-compose restart"
echo "  View status:         docker-compose ps"
echo ""
echo -e "${YELLOW}🔍 Admin Commands:${NC}"
echo ""
echo "  Health Summary:      curl http://localhost:5000/api/admin/health-summary"
echo "  Cache Stats:         curl http://localhost:5000/api/admin/cache/stats"
echo "  Job Queue Status:    curl http://localhost:5000/api/admin/jobs/status"
echo "  Create Backup:       curl -X POST http://localhost:5000/api/admin/backup"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}⚠️  Production Deployment:${NC}"
echo "  For production use, ensure:"
echo "  • MongoDB has authentication enabled"
echo "  • JWT_SECRET is at least 64 characters"
echo "  • ENCRYPTION_KEY is secure"
echo "  • FRONTEND_URL and VITE_API_URL are correct"
echo "  • Services are behind a reverse proxy (nginx/Traefik)"
echo "  • HTTPS/SSL is enabled"
echo "  • Regular backups are configured"
echo ""

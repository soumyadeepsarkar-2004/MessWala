#!/bin/bash

# 🚀 Production Deployment Script
# 
# This script automates the pre-deployment validation and deployment steps
# Usage: ./deploy.sh [backend|frontend|both]
#
# Prerequisites:
# - Git configured and authenticated
# - Node.js 18+ installed
# - Environment variables set on hosting platforms
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Git
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check Node version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version must be 18 or higher (current: $(node -v))"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Validate backend environment
validate_backend() {
    log_info "Validating backend environment..."
    
    cd backend
    
    # Run validation script
    if [ -f "validate-production-env.js" ]; then
        node validate-production-env.js
        if [ $? -ne 0 ]; then
            log_error "Backend environment validation failed"
            cd ..
            exit 1
        fi
    fi
    
    log_success "Backend environment validated"
    cd ..
}

# Run backend tests
test_backend() {
    log_info "Running backend tests..."
    
    cd backend
    npm test 2>&1
    if [ $? -ne 0 ]; then
        log_error "Backend tests failed"
        cd ..
        exit 1
    fi
    cd ..
    
    log_success "Backend tests passed"
}

# Run backend linting
lint_backend() {
    log_info "Linting backend code..."
    
    cd backend
    npm run lint 2>&1
    if [ $? -ne 0 ]; then
        log_warning "Backend linting found issues (not blocking)"
    fi
    cd ..
    
    log_success "Backend linting complete"
}

# Check for security vulnerabilities
security_audit() {
    log_info "Running security audit..."
    
    cd backend
    npm audit --audit-level=moderate 2>&1
    AUDIT_RESULT=$?
    
    if [ $AUDIT_RESULT -eq 1 ]; then
        log_warning "Security audit found vulnerabilities"
        log_info "Run 'npm audit fix' to resolve"
    else
        log_success "Security audit passed"
    fi
    cd ..
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."
    
    cd frontend
    npm run build
    if [ $? -ne 0 ]; then
        log_error "Frontend build failed"
        cd ..
        exit 1
    fi
    cd ..
    
    log_success "Frontend built successfully"
}

# Create backup notification
create_backup_reminder() {
    log_warning "MANUAL STEP REQUIRED: Create MongoDB backup before deployment"
    log_info "1. Go to MongoDB Atlas Console"
    log_info "2. Navigate to: Clusters → Backups"
    log_info "3. Click 'Take a Snapshot'"
    log_info "4. Wait for backup to complete"
    log_info "5. Press Enter to continue..."
    read -r
}

# Git operations
prepare_git() {
    log_info "Preparing Git repository..."
    
    # Check if working directory is clean
    if [ -n "$(git status --porcelain)" ]; then
        log_info "Uncommitted changes detected:"
        git status --short
        log_info "Commit these changes before deploying? (y/n)"
        read -r response
        if [ "$response" != "y" ]; then
            log_warning "Deployment cancelled"
            exit 1
        fi
    fi
    
    # Check if current branch is main
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [ "$CURRENT_BRANCH" != "main" ]; then
        log_warning "Current branch is '$CURRENT_BRANCH', not 'main'"
        log_info "Switch to main branch? (y/n)"
        read -r response
        if [ "$response" = "y" ]; then
            git checkout main
        fi
    fi
    
    log_success "Git repository ready"
}

# Deploy backend
deploy_backend() {
    log_info "Deploying backend to Render..."
    log_info "Pushing code to GitHub (Render will auto-deploy)..."
    
    git push origin main
    
    if [ $? -ne 0 ]; then
        log_error "Git push failed"
        exit 1
    fi
    
    log_success "Backend deployment initiated"
    log_info "Monitor at: https://dashboard.render.com"
    log_info "Expected deployment time: 2-5 minutes"
}

# Deploy frontend
deploy_frontend() {
    log_info "Deploying frontend to Vercel..."
    log_info "Pushing code to GitHub (Vercel will auto-deploy)..."
    
    git push origin main
    
    if [ $? -ne 0 ]; then
        log_error "Git push failed"
        exit 1
    fi
    
    log_success "Frontend deployment initiated"
    log_info "Monitor at: https://vercel.com/dashboard"
    log_info "Expected deployment time: 1-3 minutes"
}

# Post-deployment verification
post_deployment_verification() {
    log_warning "MANUAL VERIFICATION REQUIRED"
    log_info ""
    log_info "After deployments complete (check dashboards):"
    log_info "1. [ ] Visit frontend URL and verify loading"
    log_info "2. [ ] Test login functionality"
    log_info "3. [ ] Check API endpoints in browser console"
    log_info "4. [ ] Monitor error tracking (Sentry/etc.)"
    log_info "5. [ ] Review backend logs in Render dashboard"
    log_info ""
    log_info "Press Enter after verification complete..."
    read -r
}

# Main deployment flow
main() {
    DEPLOY_TARGET="${1:-both}"
    
    log_info "🚀 MessWala Production Deployment Script"
    log_info "========================================"
    log_info "Target: $DEPLOY_TARGET"
    log_info ""
    
    # Prerequisites
    check_prerequisites
    log_info ""
    
    # Pre-deployment checks
    log_info "Running pre-deployment checks..."
    prepare_git
    validate_backend
    log_info ""
    
    # Testing & Quality
    log_info "Running tests and quality checks..."
    test_backend
    lint_backend
    security_audit
    log_info ""
    
    # Build
    if [ "$DEPLOY_TARGET" = "frontend" ] || [ "$DEPLOY_TARGET" = "both" ]; then
        build_frontend
        log_info ""
    fi
    
    # Backup reminder
    create_backup_reminder
    log_info ""
    
    # Deployment
    log_info "Starting deployment..."
    log_warning "========================================"
    
    if [ "$DEPLOY_TARGET" = "backend" ] || [ "$DEPLOY_TARGET" = "both" ]; then
        deploy_backend
        log_info ""
    fi
    
    if [ "$DEPLOY_TARGET" = "frontend" ] || [ "$DEPLOY_TARGET" = "both" ]; then
        deploy_frontend
        log_info ""
    fi
    
    log_warning "========================================"
    log_success "Deployment initiated!"
    
    log_info ""
    post_deployment_verification
    
    log_success "✅ Deployment process complete!"
    log_info "Monitor your dashboards for any issues"
    log_info "Be on-call for next 24 hours"
}

# Run main function
main "$@"

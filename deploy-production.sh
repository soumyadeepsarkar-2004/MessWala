#!/bin/bash

# MessWala - Production Deployment & Automation Script
# Comprehensive setup for scalable, automated deployment

set -e

echo "🚀 MessWala Production Deployment & Automation Setup"
echo "================================================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_section() {
  echo -e "\n${BLUE}>>> $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_section "Checking Prerequisites"

if ! command -v node &> /dev/null; then
  print_error "Node.js not found. Please install Node.js 18+"
  exit 1
fi
print_success "Node.js $(node -v)"

if ! command -v npm &> /dev/null; then
  print_error "npm not found"
  exit 1
fi
print_success "npm $(npm -v)"

if ! command -v docker &> /dev/null; then
  print_warning "Docker not found. Install for containerization."
else
  print_success "Docker $(docker --version)"
fi

# Install dependencies
print_section "Installing Dependencies"
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
print_success "Dependencies installed"

# Run tests
print_section "Running Test Suite"
cd backend
npm run test:coverage
cd ..
print_success "Backend tests passed"

cd frontend
npm run test:coverage
cd ..
print_success "Frontend tests passed"

# Build
print_section "Building Application"
cd frontend
npm run build
cd ..
print_success "Frontend built"

# Linting & formatting
print_section "Code Quality Checks"
cd backend
npm run lint
npm run format:check
cd ..
print_success "Backend code quality verified"

cd frontend
npm run lint
npm run format:check
cd ..
print_success "Frontend code quality verified"

# Production environment validation
print_section "Production Environment Validation"
cd backend
npm run validate
cd ..
print_success "Environment variables validated"

# Docker build (optional)
if command -v docker &> /dev/null; then
  print_section "Building Docker Images"
  
  if docker build -t messwala-backend:latest ./backend; then
    print_success "Backend Docker image built"
  else
    print_warning "Backend Docker build failed"
  fi
  
  if docker build -t messwala-frontend:latest ./frontend; then
    print_success "Frontend Docker image built"
  else
    print_warning "Frontend Docker build failed"
  fi
fi

# Security scan
print_section "Security Audit"
npm audit --audit-level=moderate || print_warning "Some vulnerabilities found, review with: npm audit"

# Generate documentation
print_section "Generating Documentation"
if command -v mkdocs &> /dev/null; then
  mkdocs build
  print_success "Documentation generated"
else
  print_warning "MkDocs not installed. Skipping documentation generation."
fi

# Create deployment checklist
print_section "Creating Deployment Checklist"
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# Pre-Deployment Checklist

## Environment Variables
- [ ] MONGO_URI set to MongoDB Atlas connection string
- [ ] JWT_SECRET set to cryptographically secure 32+ character string
- [ ] FRONTEND_URL set to production domain
- [ ] NODE_ENV set to 'production'
- [ ] All optional vars (Google OAuth, Email, etc.) configured if needed

## Security
- [ ] SSL/TLS certificate installed
- [ ] CORS origins whitelist updated
- [ ] Rate limiting thresholds reviewed
- [ ] Security headers verified
- [ ] Database backup strategy confirmed

## Performance
- [ ] Database indexes created (run npm run seed in backend)
- [ ] Cache warming strategy configured
- [ ] CDN configured for static assets
- [ ] Compression middleware enabled
- [ ] Load balancer configured (if multi-instance)

## Monitoring & Logging
- [ ] Error tracking (Sentry/DataDog) configured
- [ ] Performance monitoring (New Relic/Datadog) enabled
- [ ] Log aggregation (ELK/CloudWatch) setup
- [ ] Alerts configured for:
  - High error rate (> 5%)
  - Slow response time (> 1s)
  - High memory usage (> 85%)
  - High CPU (>70%)
  - Database connection issues

## Deployment
- [ ] All tests passing
- [ ] Code quality checks passing
- [ ] Dependencies up to date
- [ ] Docker images built (if containerized)
- [ ] Database migrations applied
- [ ] Backup created before deployment
- [ ] Rollback plan documented

## Post-Deployment
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Database queries fast (< 100ms)
- [ ] No error spikes in logs
- [ ] Cache hit rates healthy (> 50%)
- [ ] Rate limiting working correctly
- [ ] Monitoring dashboards updated

## Documentation
- [ ] API documentation generated
- [ ] Deployment guide updated
- [ ] Runbook created for common issues
- [ ] Team trained on new features
EOF

print_success "Deployment checklist created"

# Create operational guide
print_section "Creating Operational Guide"
cat > OPERATIONAL_GUIDE.md << 'EOF'
# MessWala Operational Guide

## Daily Operations

### Monitor System Health
```bash
# Check all system metrics
curl https://your-domain/api/admin/health-summary

# Check cache performance
curl https://your-domain/api/admin/cache/stats

# Monitor job queue
curl https://your-domain/api/admin/jobs/status
```

### Common Tasks

#### Clear Cache
```bash
curl -X POST https://your-domain/api/admin/cache/clear
```

#### Clear Failed Jobs
```bash
curl -X POST https://your-domain/api/admin/jobs/clear-failed
```

#### Create Database Backup
```bash
curl -X POST https://your-domain/api/admin/backup
```

#### View Rate Limiter Analytics
```bash
curl https://your-domain/api/admin/health-summary | jq '.rateLimiter'
```

## Troubleshooting

### High Error Rate
1. Check recent logs in monitoring dashboard
2. Review rate limiter trust scores
3. Check database connection status
4. Verify API response times

### Slow API Response
1. Check cache hit rates
2. Review database query times
3. Check job queue backlog
4. Monitor memory and CPU usage

### Database Issues
1. Verify MongoDB Atlas connection
2. Check index usage
3. Review slow query logs
4. Run index optimization

### Out-of-Memory Issues
1. Reduce cache size
2. Clear job queue
3. Increase server capacity
4. Review memory leaks in monitoring

## Scaling

### When to Scale

**Vertical Scaling (add resources to existing instance):**
- Response time consistently > 1 second
- Memory usage > 80%
- CPU utilization > 70%

**Horizontal Scaling (add more instances):**
- Concurrent users approaching capacity
- Single instance at max capacity
- Load balancer at 80%+ capacity

### Scaling Steps

1. Load test current setup
2. Adjust thresholds in code if needed
3. Deploy to new instance(s)
4. Update load balancer
5. Monitor new instances
6. Remove old instances (if no longer needed)

## Maintenance Schedule

**Daily:**
- Monitor metrics dashboard
- Review error logs
- Check backup completion

**Weekly:**
- Review performance trends
- Analyze user behavior
- Audit security events

**Monthly:**
- Database optimization (REINDEX, ANALYZE)
- Review and cleanup old logs
- Performance benchmarking
- Security audit
- Cost analysis

**Quarterly:**
- Dependency updates
- Security patches
- Infrastructure review
- Capacity planning

EOF

print_success "Operational guide created"

# Summary
print_section "Deployment Preparation Complete"
echo -e "\n${GREEN}Summary:${NC}"
echo "✅ All dependencies installed"
echo "✅ Tests passed"
echo "✅ Code quality verified"
echo "✅ Environment validated"
echo "✅ Documentation generated"
echo ""
print_warning "Next Steps:"
echo "1. Review DEPLOYMENT_CHECKLIST.md"
echo "2. Configure production environment variables"
echo "3. Deploy to your infrastructure"
echo "4. Verify health checks"
echo "5. Monitor the first few hours"
echo ""
echo "For deployment help, see OPERATIONAL_GUIDE.md"
echo ""
echo "API Docs will be available at: /api/docs (HTML) or /api/docs.json (OpenAPI)"

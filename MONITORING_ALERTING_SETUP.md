# MessWala Monitoring & Alerting Setup Guide

## Overview

This guide provides comprehensive monitoring and alerting setup for MessWala production deployment. Monitoring is essential for detecting issues early, tracking performance, and ensuring system reliability.

---

## Built-in Monitoring Endpoints

Your application includes several built-in monitoring endpoints that can be integrated with monitoring platforms:

### Health & Status Endpoints

```
GET /api/health
  - Detailed health status including database, memory, cache
  - Response: { status, database, memory, cache, overall }
  - Use for: Manual health checks, basic monitoring

GET /api/ready
  - Readiness probe (used by Kubernetes/Docker)
  - Returns 200 if database is connected
  - Returns 503 if service not ready
  - Use for: Container orchestration, load balancer health checks

GET /api/live
  - Liveness probe (used by Kubernetes/Docker)
  - Returns 200 if process is alive
  - Use for: Detecting hung processes, automatic restarts

GET /api/metrics
  - Performance metrics and system stats
  - Response: { uptime, memory, performance }
  - Use for: Performance monitoring dashboards

GET /api/admin/health-summary
  - Comprehensive system health summary
  - Response: { status, cache, jobQueue, rateLimiter }
  - Authentication: Admin required
  - Use for: Admin dashboards, alerting rules
```

---

## Option 1: Render.com Monitoring (Built-in)

If deploying to Render.com, monitoring is included automatically:

### Features
- ✅ Automatic health checks
- ✅ CPU, memory, disk monitoring
- ✅ Uptime tracking
- ✅ Application logs
- ✅ Deployment history

### Setup

1. Deploy to Render following PRODUCTION_DEPLOYMENT_GUIDE.md
2. In Render dashboard, go to **Service Settings**
3. Configure Health Check:
   - **HTTP Method**: GET
   - **Path**: `/api/ready`
   - **Port**: 5000
   - **Timeout**: 30 seconds
   - **Interval**: 30-60 seconds

4. View metrics in **Analytics** tab:
   - CPU usage
   - Memory usage
   - Request count
   - Response times
   - Error rates

### Alerting with Render

1. Go to **Notifications** in Render dashboard
2. Configure notification channels:
   - Email (free)
   - Slack (free)
   - PagerDuty (premium)

3. Create alert rules:
   - Service down (automated)
   - High error rate
   - High CPU usage
   - High memory usage

---

## Option 2: Docker/Self-Hosted Monitoring with Prometheus

For self-hosted deployments using Docker:

### Install Prometheus

1. Add Prometheus to docker-compose.yml:

```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: messwala-prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
  networks:
    - messwala-network
```

2. Create `monitoring/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - /etc/prometheus/alert-rules.yml

scrape_configs:
  - job_name: 'messwala-backend'
    static_configs:
      - targets: ['messwala-backend:5000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'messwala-frontend'
    static_configs:
      - targets: ['messwala-frontend:80']
    scrape_interval: 60s
```

### Install Grafana (Visualization)

1. Add Grafana to docker-compose.yml:

```yaml
grafana:
  image: grafana/grafana:latest
  container_name: messwala-grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
    - GF_USERS_ALLOW_SIGN_UP=false
  volumes:
    - grafana_data:/var/lib/grafana
    - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
  networks:
    - messwala-network
```

2. Create Grafana datasource configuration:
   - Add Prometheus as data source
   - URL: `http://prometheus:9090`
   - Scrape interval: 15s

3. Import pre-built dashboards:
   - Node Exporter (system metrics)
   - Redis (cache metrics)
   - MongoDB (database metrics)

### Install AlertManager

1. Add AlertManager to docker-compose.yml:

```yaml
alertmanager:
  image: prom/alertmanager:latest
  container_name: messwala-alertmanager
  ports:
    - "9093:9093"
  volumes:
    - ./monitoring/alertmanager-config.yml:/etc/alertmanager/alertmanager-config.yml
    - alertmanager_data:/alertmanager
  command:
    - '--config.file=/etc/alertmanager/alertmanager-config.yml'
  networks:
    - messwala-network
```

2. Create `monitoring/alert-rules.yml`:

```yaml
groups:
  - name: messwala
    rules:
      # High error rate (>5% error rate for 5 minutes)
      - alert: HighErrorRate
        expr: |
          (rate(messwala_errors_total[5m]) / rate(messwala_requests_total[5m])) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # High CPU usage (>80%)
      - alert: HighCPUUsage
        expr: |
          container_cpu_usage_seconds_total{job="messwala-backend"} > 0.8
        for: 5m
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is {{ $value | humanizePercentage }}"

      # High memory usage (>80%)
      - alert: HighMemoryUsage
        expr: |
          container_memory_usage_bytes{job="messwala-backend"} / container_spec_memory_limit_bytes > 0.8
        for: 5m
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # Database connection failures
      - alert: DatabaseConnectionFailure
        expr: |
          messwala_database_connection_errors_total > 10
        for: 2m
        annotations:
          summary: "Database connection failures"
          description: "{{ $value }} connection errors in 2 minutes"

      # Service down
      - alert: ServiceDown
        expr: |
          up{job="messwala-backend"} == 0
        for: 1m
        annotations:
          summary: "MessWala API service is down"
          description: "Service has been unreachable for 1 minute"

      # Notification queue buildup
      - alert: NotificationQueueBacklog
        expr: |
          messwala_notification_queue_size > 1000
        for: 10m
        annotations:
          summary: "Notification queue backing up"
          description: "{{ $value }} notifications pending"

      # Cache hit rate low
      - alert: LowCacheHitRate
        expr: |
          messwala_cache_hits / (messwala_cache_hits + messwala_cache_misses) < 0.5
        for: 15m
        annotations:
          summary: "Low cache hit rate"
          description: "Cache effectiveness is {{ $value | humanizePercentage }}"
```

3. Create `monitoring/alertmanager-config.yml`:

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

receivers:
  - name: 'default'
    slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts'
        title: 'Alert: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    email_configs:
      - to: 'alerts@yourdomain.com'
        from: 'prometheus@yourdomain.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'your-email@gmail.com'
        auth_password: 'your-app-password'
```

### Start Monitoring Stack

```bash
# Add to docker-compose.yml and start
docker-compose up -d prometheus grafana alertmanager

# Access dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
# AlertManager: http://localhost:9093
```

---

## Option 3: External Monitoring with Datadog

### Setup Datadog Agent

1. Create Datadog account at [datadog.com](https://www.datadoghq.com)

2. Add Datadog agent to docker-compose.yml:

```yaml
datadog:
  image: datadog/agent:latest
  container_name: messwala-datadog
  environment:
    - DD_API_KEY=${DATADOG_API_KEY}
    - DD_SITE=datadoghq.com
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
    - /proc:/host/proc:ro
    - /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
  networks:
    - messwala-network
```

3. Configure APM (Application Performance Monitoring):

```javascript
// In backend/server.js, add at the top:
if (process.env.DD_ENABLED === 'true') {
  const tracer = require('dd-trace').init();
}
```

4. In Datadog dashboard:
   - Set up monitors for key metrics
   - Configure alert notifications
   - Create custom dashboards
   - Set up log aggregation

---

## Option 4: Manual Application Logging & Alerting

Your application includes comprehensive logging support:

### Application Logs

All logs are written to `backend/logs/` directory:

```
logs/
├── application.log      # General application logs
├── error.log           # Error logs
├── performance.log     # Performance metrics
└── access.log          # HTTP access logs
```

### Production Logging Setup

1. Configure log level in `.env`:
   ```
   LOG_LEVEL=warn    # Production: warn, debug only in development
   ```

2. Send logs to external service:

   **Option A: Send to AWS CloudWatch**
   ```bash
   npm install winston-cloudwatch
   ```

   **Option B: Send to ELK Stack**
   ```bash
   npm install winston-elasticsearch
   ```

   **Option C: Send to Papertrail/Datadog**
   ```bash
   npm install winston-datadog-transport
   ```

### Monitor Logs for Alerts

Create scripts to monitor logs for critical errors:

```bash
#!/bin/bash
# monitor-logs.sh - Alert on critical errors

tail -f backend/logs/error.log | while read line; do
  if [[ $line == *"CRITICAL"* ]] || [[ $line == *"FATAL"* ]]; then
    # Send alert
    curl -X POST https://slack-webhook.com \
      -d "{\"text\": \"⚠️ ALERT: $line\"}"
  fi
done
```

---

## Application Metrics Available

Your application provides these metrics:

### Performance Metrics
```
GET /api/metrics

Response:
{
  "uptime": 3600,
  "memory": {
    "rss": 100000000,
    "heapTotal": 50000000,
    "heapUsed": 30000000
  },
  "performance": {
    "avgResponseTime": 45,
    "p95ResponseTime": 120,
    "p99ResponseTime": 250,
    "requestsPerSecond": 10,
    "errorRate": 0.01
  }
}
```

### System Health Summary
```
GET /api/admin/health-summary

Response:
{
  "status": "healthy",
  "cache": {
    "hits": 5000,
    "misses": 1000,
    "hitRate": "83.3%"
  },
  "jobQueue": {
    "pending": 5,
    "failed": 0,
    "processed": 10000
  },
  "rateLimiter": {
    "blockedRequests": 10,
    "totalRequests": 100000
  }
}
```

---

## Recommended Alert Thresholds

These thresholds work well for MessWala:

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error Rate | >2% | >5% | Investigate logs, scale service |
| CPU Usage | >70% | >90% | Scale up, optimize queries |
| Memory Usage | >75% | >90% | Restart, add memory, optimize |
| Response Time (p95) | >500ms | >2s | Check database, optimize queries |
| Database Latency | >100ms | >300ms | Check indexes, scale database |
| Notification Queue | >500 items | >2000 items | Check notification service |
| Cache Hit Rate | <60% | <40% | Adjust cache settings |
| Service Downtime | - | 1+ minute | Auto-restart, page on-call |

---

## Monitoring Checklist

### Daily Tasks
- [ ] Check health endpoint responses
- [ ] Review error logs for new patterns
- [ ] Monitor request rates and response times
- [ ] Verify backup completion

### Weekly Tasks
- [ ] Review performance trends
- [ ] Check resource usage patterns
- [ ] Analyze slow query logs
- [ ] Review alert history
- [ ] Update alert thresholds if needed

### Monthly Tasks
- [ ] Full health assessment report
- [ ] Performance optimization review
- [ ] Capacity planning check
- [ ] Security audit of logs
- [ ] Escalation policy review

---

## Testing Monitoring

### Simulate High Load
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << 'EOF'
config:
  target: "https://your-backend-domain.com"
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "API Load Test"
    flow:
      - get:
          url: "/api/health"
      - get:
          url: "/api/hostels"
      - post:
          url: "/api/meals"
          json:
            hostelId: "123"
EOF

# Run load test
artillery quick --count 100 --num 10 https://your-backend-domain.com/api/health
```

### Test Alerts
```bash
# Trigger a test alert
curl -X POST https://your-domain.com/admin/test-alert
```

---

## Production Monitoring Checklist

- [ ] Health endpoints responding correctly
- [ ] Monitoring dashboard accessible
- [ ] Alert rules configured and tested
- [ ] Notification channels working (Email, Slack, SMS)
- [ ] Logs being collected and archived
- [ ] Performance baselines established
- [ ] Escalation procedures documented
- [ ] On-call schedule configured
- [ ] Historical metrics being retained
- [ ] Dashboards showing real-time data

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Prometheus Docs**: https://prometheus.io/docs
- **Grafana Docs**: https://grafana.com/grafana/documentation/
- **Datadog Docs**: https://docs.datadoghq.com
- **Health Check Best Practices**: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

---

**Document Version**: 1.0  
**Status**: ✅ Ready for Production  
**Last Updated**: March 29, 2026


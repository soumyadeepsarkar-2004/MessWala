const express = require('express');

const router = express.Router();
const {
  getHealthStatus,
  getReadiness,
  getLiveness,
  getDeploymentStatus,
} = require('../controllers/healthController');

// Health status endpoint
router.get('/health', getHealthStatus);

// Kubernetes readiness probe
router.get('/ready', getReadiness);

// Kubernetes liveness probe
router.get('/live', getLiveness);

// Deployment verification endpoint
router.get('/deployment-status', getDeploymentStatus);

module.exports = router;

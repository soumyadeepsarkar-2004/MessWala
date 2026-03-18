/**
 * API Versioning & Deprecation Management
 * Support multiple API versions with graceful deprecation
 */

const { getLogger } = require('./logger');

const logger = getLogger('APIVersioning');

/**
 * API Version Configuration
 */
const API_VERSIONS = {
  v1: {
    status: 'deprecated',
    description: 'Initial version',
    deprecatedSince: '2026-01-01',
    sunsetDate: '2026-12-31',
    features: ['basic auth', 'expenses', 'attendance'],
  },
  v2: {
    status: 'current',
    description: 'Current production version',
    deprecatedSince: null,
    sunsetDate: null,
    features: ['JWT auth', 'OAuth2', 'multi-hostel', 'advanced analytics', 'i18n', 'compliance'],
  },
  v3: {
    status: 'beta',
    description: 'Next generation API',
    deprecatedSince: null,
    sunsetDate: null,
    features: ['GraphQL', 'webhooks', 'real-time updates', 'improved caching'],
  },
};

/**
 * Endpoint deprecation registry
 */
const DEPRECATED_ENDPOINTS = {
  'GET /api/v1/analytics/expense-trend': {
    removedIn: 'v3',
    sunsetDate: '2026-12-31',
    replacement: 'GET /api/v2/advanced-analytics/expense-trends',
    reason: 'Replaced by advanced analytics module',
  },
  'POST /api/v1/auth/login': {
    removedIn: 'v3',
    sunsetDate: '2026-12-31',
    replacement: 'POST /api/v2/auth/admin/login',
    reason: 'Improved authentication flow',
  },
};

/**
 * API version detection middleware
 */
function detectApiVersion(req, res, next) {
  // Check Accept header
  const acceptHeader = req.get('Accept') || '';
  const versionMatch = acceptHeader.match(/version=([a-z0-9]+)/i);
  const headerVersion = versionMatch ? versionMatch[1] : null;

  // Check URL path for version
  const pathMatch = req.path.match(/^\/api\/(v[0-9]+)\//);
  const pathVersion = pathMatch ? pathMatch[1] : null;

  // Check query parameter
  const queryVersion = req.query.api_version;

  // Determine version (priority: URL > query > header > default)
  let version = pathVersion || queryVersion || headerVersion || 'v2';

  if (!API_VERSIONS[version]) {
    version = 'v2'; // Default to current
  }

  req.apiVersion = version;
  req.apiVersionConfig = API_VERSIONS[version];

  // Log deprecation warnings
  if (API_VERSIONS[version].status === 'deprecated') {
    res.set('Deprecation', 'true');
    res.set('Sunset', API_VERSIONS[version].sunsetDate);

    logger.warn('Deprecated API version used', {
      version,
      endpoint: `${req.method} ${req.path}`,
      sunsetDate: API_VERSIONS[version].sunsetDate,
    });
  }

  next();
}

/**
 * Deprecated endpoint handler
 */
function deprecatedEndpoint(replacementEndpoint, sunsetDate) {
  return (req, res, next) => {
    res.set('Deprecation', 'true');
    res.set('Sunset', sunsetDate);
    res.set('Link', `<${replacementEndpoint}>; rel="successor-version"`);

    logger.info('Deprecated endpoint accessed', {
      endpoint: `${req.method} ${req.path}`,
      replacement: replacementEndpoint,
      sunsetDate,
    });

    // Continue to handler
    next();
  };
}

/**
 * Validate endpoint exists in version
 */
function validateVersionEndpoint(req, res, next) {
  const endpoint = `${req.method} ${req.path}`;

  // Check if endpoint is deprecated
  if (DEPRECATED_ENDPOINTS[endpoint]) {
    const deprecationInfo = DEPRECATED_ENDPOINTS[endpoint];

    res.set('Deprecation', 'true');
    res.set('Sunset', deprecationInfo.sunsetDate);
    res.set('Link', `<${deprecationInfo.replacement}>; rel="successor-version"`);

    const daysTillSunset = Math.ceil(
      (new Date(deprecationInfo.sunsetDate) - new Date()) / (1000 * 60 * 60 * 24),
    );

    logger.warn('Endpoint nearing sunset', {
      endpoint,
      replacement: deprecationInfo.replacement,
      daysTillSunset,
    });
  }

  next();
}

/**
 * API changelog
 */
const API_CHANGELOG = [
  {
    version: 'v2.5.0',
    date: '2026-03-18',
    changes: [
      'Added multi-hostel support',
      'Introduced advanced analytics module',
      'Implemented i18n for EN + HI',
      'Added compliance document management',
    ],
    breaking: false,
  },
  {
    version: 'v2.4.0',
    date: '2026-03-01',
    changes: [
      'Improved error handling with structured errors',
      'Added request logging and performance monitoring',
      'Implemented transaction support',
    ],
    breaking: false,
  },
  {
    version: 'v2.3.0',
    date: '2026-02-15',
    changes: [
      'Enhanced validation utilities',
      'Added database indexing strategy',
      'Implemented query optimization',
    ],
    breaking: false,
  },
  {
    version: 'v2.0.0',
    date: '2026-01-01',
    changes: [
      'Complete API redesign',
      'Introduced OAuth2 authentication',
      'Multi-role access control',
    ],
    breaking: true,
  },
];

/**
 * Migration helper for v1 to v2
 */
const V1_TO_V2_MIGRATION_MAP = {
  '/api/analytics/expense-trend': '/api/advanced-analytics/expense-trends',
  '/api/auth/login': '/api/auth/admin/login',
  '/api/meals/attendance': '/api/meals/mark',
};

/**
 * Handle v1 endpoint requests gracefully
 */
function handleV1ApiRequest(req, res, next) {
  const oldPath = req.path;
  const newPath = V1_TO_V2_MIGRATION_MAP[oldPath];

  if (newPath) {
    logger.info('V1 API redirect', {
      oldPath,
      newPath,
    });

    res.set('Deprecation', 'true');
    res.set('Location', newPath);

    // Return 301 Moved Permanently or handle migration
    // Could also transform request and call next with new path
  }

  next();
}

/**
 * Get API documentation for version
 */
function getApiDocumentation(version = 'v2') {
  const config = API_VERSIONS[version];

  return {
    version,
    ...config,
    changelog: API_CHANGELOG,
    endpoints: getEndpointsForVersion(version),
  };
}

/**
 * Get endpoints available in version
 */
function getEndpointsForVersion(_version) {
  // This would be auto-generated from routes
  return {
    auth: [
      'POST /api/auth/admin/login',
      'POST /api/auth/google',
      'POST /api/auth/student/complete-profile',
      'GET /api/auth/profile',
    ],
    expenses: [
      'POST /api/expenses',
      'GET /api/expenses',
      'GET /api/expenses/summary',
      'GET /api/expenses/cost-per-plate',
      'DELETE /api/expenses/:id',
    ],
    analytics: [
      'GET /api/analytics/expense-trend',
      'GET /api/analytics/category-breakdown',
      'GET /api/advanced-analytics/meal-preferences',
      'GET /api/advanced-analytics/expense-trends',
      'GET /api/advanced-analytics/cost-predictions',
    ],
    // ... more endpoints
  };
}

/**
 * Version compatibility check middleware
 */
function checkVersionCompatibility(req, res, next) {
  const version = req.apiVersion;
  const config = API_VERSIONS[version];

  // If version is deprecated, add Warning header
  if (config.status === 'deprecated') {
    const days = Math.ceil((new Date(config.sunsetDate) - new Date()) / (1000 * 60 * 60 * 24));

    res.set(
      'Warning',
      `299 - "API Version Deprecated" "${version} will be discontinued in ${days} days. See ${config.replacement} for upgrade guide."`,
    );
  }

  // If version is beta, add X-Beta-Version header
  if (config.status === 'beta') {
    res.set('X-Beta-Version', 'true');
    logger.debug('Beta version used', { version });
  }

  next();
}

module.exports = {
  API_VERSIONS,
  DEPRECATED_ENDPOINTS,
  API_CHANGELOG,
  detectApiVersion,
  deprecatedEndpoint,
  validateVersionEndpoint,
  handleV1ApiRequest,
  getApiDocumentation,
  getEndpointsForVersion,
  checkVersionCompatibility,
};

/* eslint-disable no-console */

/**
 * Production Environment Validator
 */

const REQUIRED_ENV_VARS = {
  backend: [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'FRONTEND_URL',
    'APP_VERSION',
    'BACKUP_ENABLED',
    'BACKUP_SCHEDULE',
    'ENCRYPTION_KEY',
    'LOG_LEVEL',
  ],
  optional: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS',
    'REDIS_URL',
    'PROMETHEUS_METRICS_ENABLED',
  ],
};

function validateEnvironment() {
  // Skip environment validation if we are in Vercel deployment environment
  // Vercel handles secrets via its own dashboard
  if (process.env.VERCEL) {
    console.log('🚀 Detected Vercel deployment - skipping manual env validation');
    process.exit(0);
  }

  console.log('\n🔍 Advanced Production Environment Validator\n');
  console.log('━'.repeat(50));

  let hasErrors = false;
  let hasWarnings = false;

  // Check required variables
  console.log('\n🔐 Checking CRITICAL infrastructure environment variables:\n');
  REQUIRED_ENV_VARS.backend.forEach((env) => {
    const value = process.env[env];
    if (!value) {
      if (env === 'BACKUP_ENABLED') {
        process.env.BACKUP_ENABLED = 'true';
        console.log(`⚠️  ${env}: MISSING (Defaulting to "true")`);
        return;
      }
      console.error(`❌ ${env}: NOT SET (REQUIRED)`);
      hasErrors = true;
    } else {
      // Hide sensitive values
      let display = value;
      if (
        ['JWT_SECRET', 'MONGO_URI', 'GOOGLE_CLIENT_SECRET', 'ENCRYPTION_KEY', 'REDIS_URL'].includes(
          env,
        )
      ) {
        display = '(set - hidden)';
      }
      console.log(`✅ ${env}: ${display}`);
    }
  });

  // Check optional variables
  console.log('\n📊 Checking OPTIONAL feature flags:\n');
  REQUIRED_ENV_VARS.optional.forEach((env) => {
    const value = process.env[env];
    if (!value) {
      console.log(`💡 ${env}: NOT SET (using safe defaults)`);
    } else {
      console.log(`✅ ${env}: (set and enabled)`);
    }
  });

  // Validate NODE_ENV
  console.log('\n🔒 Security Mode Verification:\n');
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  WARNING: Running in non-production mode! Security headers might be relaxed.');
    hasWarnings = true;
  } else {
    console.log('✅ PROD_MODE: Strict security active');
  }

  // Validate JWT_SECRET strength - Enterprise Requirement
  if (process.env.JWT_SECRET) {
    const secretLength = process.env.JWT_SECRET.length;
    if (secretLength < 64) {
      console.error(
        `❌ SECURITY ERROR: JWT_SECRET too weak (${secretLength} bytes). Minimum 64 required for production.`,
      );
      hasErrors = true;
    } else {
      console.log(`✅ JWT_STRENGTH: Enterprise Grade (${secretLength} bytes)`);
    }
  }

  // Encryption key check
  if (process.env.ENCRYPTION_KEY) {
    const keyLength = process.env.ENCRYPTION_KEY.length;
    if (keyLength < 32) {
      console.error(
        `❌ SECURITY ERROR: ENCRYPTION_KEY too short (${keyLength} bytes). Minimum 32 required.`,
      );
      hasErrors = true;
    } else {
      console.log(`✅ ENCRYPTION_STRENGTH: Strong (${keyLength} bytes)`);
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('\n🏁 FINAL PRODUCTION READINESS SUMMARY:\n');

  if (hasErrors) {
    console.error('🛑 DEPLOYMENT BLOCKED: Critical environment misconfigurations found.\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn(
      '⚠️  DEPLOYMENT WARNING: Passed with non-critical alerts. Review optional settings.\n',
    );
    process.exit(0);
  } else {
    console.log('🚀 DEPLOYMENT APPROVED: All production requirements met!\n');
    process.exit(0);
  }
}

// Run validation
validateEnvironment();

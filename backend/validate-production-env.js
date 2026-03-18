#!/usr/bin/env node

/**
 * Production Environment Validator
 *
 * Usage: node validate-production-env.js
 *
 * This script validates that all required environment variables
 * are set for production deployment.
 */

/* eslint-disable no-console */

const REQUIRED_ENV_VARS = {
    backend: [
        'NODE_ENV',
        'PORT',
        'MONGO_URI',
        'JWT_SECRET',
        'FRONTEND_URL',
    ],
    optional: [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'EMAIL_USER',
        'EMAIL_PASS',
        'BACKUP_ENABLED',
    ],
};

function validateEnvironment() {
    console.log('\n🔍 Production Environment Validator\n');
    console.log('━'.repeat(50));

    let hasErrors = false;
    let hasWarnings = false;

    // Check required variables
    console.log('\n✅ Checking REQUIRED environment variables:\n');
    REQUIRED_ENV_VARS.backend.forEach((env) => {
        const value = process.env[env];
        if (!value) {
            console.error(`❌ ${env}: NOT SET`);
            hasErrors = true;
        } else {
            // Hide sensitive values
            const display =
                ['JWT_SECRET', 'MONGO_URI', 'GOOGLE_CLIENT_SECRET'].includes(env)
                    ? '(set - hidden)'
                    : value;
            console.log(`✅ ${env}: ${display}`);
        }
    });

    // Check optional variables
    console.log('\n⚠️  Checking OPTIONAL environment variables:\n');
    REQUIRED_ENV_VARS.optional.forEach((env) => {
        const value = process.env[env];
        if (!value) {
            console.log(`⚠️  ${env}: NOT SET (optional)`);
            hasWarnings = true;
        } else {
            console.log(`✅ ${env}: (set)`);
        }
    });

    // Validate NODE_ENV
    console.log('\n🔐 Checking Environment Mode:\n');
    if (process.env.NODE_ENV !== 'production') {
        console.warn(
            '⚠️  NODE_ENV is not "production" - some security features may be disabled',
        );
        hasWarnings = true;
    } else {
        console.log('✅ NODE_ENV: Set to "production" (security features enabled)');
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET) {
        const secretLength = process.env.JWT_SECRET.length;
        if (secretLength < 32) {
            console.error(`❌ JWT_SECRET: Too short (${secretLength} chars, need 32+)`);
            hasErrors = true;
        } else {
            console.log(`✅ JWT_SECRET: Strong (${secretLength} chars)`);
        }
    }

    // Summary
    console.log('\n' + '━'.repeat(50));
    console.log('\n📊 Validation Summary:\n');

    if (hasErrors) {
        console.error('❌ FAILED: Fix required environment variables\n');
        process.exit(1);
    } else if (hasWarnings) {
        console.warn('⚠️  PASSED: But review optional warnings\n');
        process.exit(0);
    } else {
        console.log('✅ SUCCESS: All environment variables validated!\n');
        process.exit(0);
    }
}

// Run validation
validateEnvironment();

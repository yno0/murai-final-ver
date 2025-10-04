#!/usr/bin/env node

/**
 * Pre-deployment check script for MURAI Web
 * Validates that all necessary files and configurations are ready for Render deployment
 */

import fs from 'fs';
import path from 'path';

const checks = [];

function addCheck(name, status, message) {
    checks.push({ name, status, message });
}

function checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        addCheck(description, '✅', `Found: ${filePath}`);
        return true;
    } else {
        addCheck(description, '❌', `Missing: ${filePath}`);
        return false;
    }
}

function checkPackageJson(filePath, requiredScripts) {
    if (!fs.existsSync(filePath)) {
        addCheck(`Package.json (${filePath})`, '❌', 'File not found');
        return false;
    }

    try {
        const pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let allScriptsPresent = true;

        for (const script of requiredScripts) {
            if (pkg.scripts && pkg.scripts[script]) {
                addCheck(`Script: ${script}`, '✅', `Found in ${filePath}`);
            } else {
                addCheck(`Script: ${script}`, '❌', `Missing in ${filePath}`);
                allScriptsPresent = false;
            }
        }

        return allScriptsPresent;
    } catch (error) {
        addCheck(`Package.json (${filePath})`, '❌', `Invalid JSON: ${error.message}`);
        return false;
    }
}

console.log('🚀 MURAI Web Deployment Readiness Check\n');

// Check essential files
checkFile('render.yaml', 'Render configuration');
checkFile('package.json', 'Root package.json');
checkFile('server/package.json', 'Server package.json');
checkFile('vite.config.js', 'Vite configuration');
checkFile('server/server.js', 'Server entry point');
checkFile('server/app.js', 'Server app configuration');

// Check package.json scripts
checkPackageJson('package.json', ['build', 'dev']);
checkPackageJson('server/package.json', ['start', 'build']);

// Check for environment configuration
if (fs.existsSync('server/config/cors.js')) {
    addCheck('CORS configuration', '✅', 'Found server/config/cors.js');
} else {
    addCheck('CORS configuration', '❌', 'Missing server/config/cors.js');
}

// Check for health endpoint
if (fs.existsSync('server/config/app.js')) {
    const appContent = fs.readFileSync('server/config/app.js', 'utf8');
    if (appContent.includes('/health')) {
        addCheck('Health endpoint', '✅', 'Found in server/config/app.js');
    } else {
        addCheck('Health endpoint', '❌', 'Not found in server/config/app.js');
    }
} else {
    addCheck('Health endpoint', '❌', 'Cannot check - app.js missing');
}

// Check API configuration
if (fs.existsSync('src/client/config/api.js')) {
    const apiContent = fs.readFileSync('src/client/config/api.js', 'utf8');
    if (apiContent.includes('VITE_API_URL')) {
        addCheck('Frontend API config', '✅', 'Uses VITE_API_URL environment variable');
    } else {
        addCheck('Frontend API config', '⚠️', 'May not use environment variable');
    }
} else {
    addCheck('Frontend API config', '❌', 'Missing src/client/config/api.js');
}

// Display results
console.log('📋 Deployment Readiness Results:\n');

let passedChecks = 0;
let totalChecks = checks.length;

checks.forEach(check => {
    console.log(`${check.status} ${check.name}: ${check.message}`);
    if (check.status === '✅') passedChecks++;
});

console.log(`\n📊 Summary: ${passedChecks}/${totalChecks} checks passed\n`);

if (passedChecks === totalChecks) {
    console.log('🎉 All checks passed! Your project is ready for deployment.');
    console.log('\n📝 Next steps:');
    console.log('1. Push your code to GitHub');
    console.log('2. Create a new Blueprint in Render');
    console.log('3. Set up environment variables');
    console.log('4. Deploy!');
} else {
    console.log('⚠️  Some checks failed. Please address the issues above before deploying.');
}

console.log('\n📖 For detailed deployment instructions, see DEPLOYMENT_GUIDE.md');

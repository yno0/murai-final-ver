#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.join(__dirname, '..');

// Generate a secure JWT secret
function generateJWTSecret() {
    return crypto.randomBytes(64).toString('hex');
}

// Default environment configuration
const defaultEnvConfig = `# Murai Server Configuration
# Generated on ${new Date().toISOString()}

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/murai

# JWT Configuration
JWT_SECRET=${generateJWTSecret()}
JWT_EXPIRES_IN=7d

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Update with your SMTP settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@murai.com
FROM_NAME=Murai

# Google OAuth Configuration (Optional)
# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session Configuration
SESSION_SECRET=${generateJWTSecret()}
SESSION_MAX_AGE=86400000

# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=true

# Security Configuration
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Cache Configuration
CACHE_TTL=3600
REDIS_URL=redis://localhost:6379

# Development Configuration
DEBUG_MODE=true
ENABLE_CORS=true
TRUST_PROXY=false
`;

function createEnvFile() {
    const envPath = path.join(serverRoot, '.env');
    
    if (fs.existsSync(envPath)) {
        console.log('⚠️  .env file already exists. Creating .env.example instead...');
        fs.writeFileSync(path.join(serverRoot, '.env.example'), defaultEnvConfig);
        console.log('✅ Created .env.example file');
        console.log('📝 Please copy .env.example to .env and update the values');
        return;
    }
    
    fs.writeFileSync(envPath, defaultEnvConfig);
    console.log('✅ Created .env file with default configuration');
    console.log('📝 Please update the following values in your .env file:');
    console.log('   - SMTP_USER and SMTP_PASS for email functionality');
    console.log('   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET for OAuth');
    console.log('   - MONGODB_URI if using a different database');
}

function createLogDirectory() {
    const logDir = path.join(serverRoot, 'logs');
    
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        console.log('✅ Created logs directory');
    } else {
        console.log('📁 Logs directory already exists');
    }
}

function createGitignore() {
    const gitignorePath = path.join(serverRoot, '.gitignore');
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
tmp/
temp/

# Build outputs
dist/
build/

# Database files
*.db
*.sqlite
*.sqlite3

# Uploads
uploads/
public/uploads/
`;

    if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log('✅ Created .gitignore file');
    } else {
        console.log('📁 .gitignore file already exists');
    }
}

function updatePackageJson() {
    const packageJsonPath = path.join(serverRoot, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Add setup script if it doesn't exist
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        
        if (!packageJson.scripts.setup) {
            packageJson.scripts.setup = 'node scripts/setup.js';
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log('✅ Added setup script to package.json');
        }
    }
}

function displayNextSteps() {
    console.log('\n🎉 Setup complete! Next steps:');
    console.log('');
    console.log('1. Update your .env file with your actual configuration values');
    console.log('2. Ensure MongoDB is running on your system');
    console.log('3. Install dependencies: npm install');
    console.log('4. Start the development server: npm run dev');
    console.log('');
    console.log('📚 For more information, see the README.md file');
    console.log('🔍 Health check: http://localhost:5000/health');
    console.log('');
}

// Main setup function
function main() {
    console.log('🚀 Setting up Murai Server...\n');
    
    try {
        createEnvFile();
        createLogDirectory();
        createGitignore();
        updatePackageJson();
        displayNextSteps();
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main as setup };

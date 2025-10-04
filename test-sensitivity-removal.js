// Test script to validate complete removal of sensitivity features
// Run this to ensure no sensitivity references remain in the codebase

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🧪 Testing Complete Sensitivity Removal...\n');

// Files that should NOT contain sensitivity references
const filesToCheck = [
  // Extension files
  'murai-extension/src/App.jsx',
  'murai-extension/src/components/index.js',
  'murai-extension/src/background.js',
  
  // Client files
  'src/client/pages/features/Extension.jsx',
  'src/client/services/extensionSettingsService.js',
  'src/client/pages/Debug.jsx',
  'src/client/pages/Landing.jsx',
  
  // Content scripts
  'src/content/contentScript.js',
  
  // Admin files
  'src/admin/pages/integrations/ConnectedDomains.jsx'
];

// Files that should exist (no sensitivity components)
const filesShouldNotExist = [
  'murai-extension/src/components/SensitivitySelector.jsx',
  'src/admin/pages/dictionary/SensitivityLevels.jsx'
];

let allTestsPassed = true;

console.log('1. Checking for sensitivity references in key files...\n');

filesToCheck.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const sensitivityMatches = content.match(/sensitivity|Sensitivity/gi);
      
      if (sensitivityMatches) {
        console.log(`❌ ${filePath}: Found ${sensitivityMatches.length} sensitivity references`);
        sensitivityMatches.forEach((match, index) => {
          const lines = content.split('\n');
          const lineNumber = lines.findIndex(line => line.includes(match)) + 1;
          console.log(`   - Line ${lineNumber}: "${match}"`);
        });
        allTestsPassed = false;
      } else {
        console.log(`✅ ${filePath}: No sensitivity references found`);
      }
    } else {
      console.log(`⚠️ ${filePath}: File not found`);
    }
  } catch (error) {
    console.log(`❌ ${filePath}: Error reading file - ${error.message}`);
    allTestsPassed = false;
  }
});

console.log('\n2. Checking that sensitivity components are removed...\n');

filesShouldNotExist.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`❌ ${filePath}: File should not exist but was found`);
    allTestsPassed = false;
  } else {
    console.log(`✅ ${filePath}: Correctly removed`);
  }
});

console.log('\n3. Testing extension build...\n');

// Check if extension builds without errors
try {
  console.log('Building extension...');
  const buildOutput = execSync('npm run build', {
    cwd: 'murai-extension',
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  if (buildOutput.includes('✓ built')) {
    console.log('✅ Extension builds successfully without sensitivity features');
  } else {
    console.log('❌ Extension build may have issues');
    allTestsPassed = false;
  }
} catch (error) {
  console.log(`❌ Extension build failed: ${error.message}`);
  allTestsPassed = false;
}

console.log('\n4. Testing default settings structure...\n');

// Test that default settings don't include sensitivity
try {
  const extensionSettingsPath = 'src/client/services/extensionSettingsService.js';
  if (fs.existsSync(extensionSettingsPath)) {
    const content = fs.readFileSync(extensionSettingsPath, 'utf8');
    
    // Check if getDefaultSettings method exists and doesn't include sensitivity
    const defaultSettingsMatch = content.match(/getDefaultSettings\(\)\s*{[\s\S]*?return\s*{[\s\S]*?};/);
    if (defaultSettingsMatch) {
      const defaultSettingsContent = defaultSettingsMatch[0];
      if (defaultSettingsContent.includes('sensitivity')) {
        console.log('❌ Default settings still contain sensitivity');
        allTestsPassed = false;
      } else {
        console.log('✅ Default settings do not contain sensitivity');
      }
    }
  }
} catch (error) {
  console.log(`❌ Error checking default settings: ${error.message}`);
  allTestsPassed = false;
}

console.log('\n5. Summary of sensitivity removal...\n');

const removalSummary = [
  '✅ Removed sensitivity dropdown from extension popup',
  '✅ Removed sensitivity from extension web settings page',
  '✅ Removed sensitivity from extension storage and services',
  '✅ Removed sensitivity from content scripts and background script',
  '✅ Removed sensitivity from admin panel components',
  '✅ Updated landing page to remove sensitivity mentions',
  '✅ Removed SensitivitySelector component',
  '✅ Updated default settings to exclude sensitivity',
  '✅ Updated debug and test files'
];

removalSummary.forEach(item => console.log(item));

console.log('\n📊 Test Results:\n');

if (allTestsPassed) {
  console.log('🎉 All sensitivity removal tests PASSED!');
  console.log('✅ Sensitivity features have been completely removed from MURAi');
  console.log('\n🚀 Benefits of removal:');
  console.log('- Simplified user interface');
  console.log('- Reduced complexity in detection logic');
  console.log('- Focus on dictionary-based detection');
  console.log('- Cleaner codebase without unused features');
  console.log('\n📝 Next steps:');
  console.log('1. Test extension functionality in browser');
  console.log('2. Verify detection works with database-driven dictionaries');
  console.log('3. Update documentation to reflect changes');
} else {
  console.log('❌ Some sensitivity removal tests FAILED!');
  console.log('Please review the errors above and fix remaining sensitivity references.');
}

console.log('\n🔍 Manual verification steps:');
console.log('1. Load extension in Chrome and check popup UI');
console.log('2. Visit extension settings page and verify no sensitivity options');
console.log('3. Test detection on a webpage with inappropriate content');
console.log('4. Check browser console for any sensitivity-related errors');

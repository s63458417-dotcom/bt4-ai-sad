const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting BT4 AI Local Server Setup...');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found!');
  process.exit(1);
}

// Function to check if a command exists
function commandExists(command) {
  try {
    execSync('which ' + command, { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

// Check if Node.js is installed
if (!commandExists('node')) {
  console.error('❌ Node.js is not installed. Please install Node.js before running this script.');
  process.exit(1);
}

console.log('✅ Node.js is installed');

// Check if npm is installed
if (!commandExists('npm')) {
  console.error('❌ npm is not installed. Please install npm before running this script.');
  process.exit(1);
}

console.log('✅ npm is installed');

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
const packageLockPath = path.join(__dirname, 'package-lock.json');

if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(packageLockPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed');
}

// Check if Playwright Chromium is installed
try {
  console.log('🔍 Checking if Playwright Chromium is installed...');
  execSync('npx playwright install chromium', { 
    cwd: __dirname, 
    stdio: 'pipe',
    env: process.env 
  });
  console.log('✅ Playwright Chromium is installed');
} catch (error) {
  // This might fail if it's already installed, which is fine
  console.log('Checking Playwright installation status...');
  try {
    // Try to run a simple Playwright command to verify
    execSync('node -e "const { chromium } = require(\'playwright-extra\'); console.log(\'Playwright is available\');"', { 
      cwd: __dirname, 
      stdio: 'pipe' 
    });
    console.log('✅ Playwright Chromium is properly installed');
  } catch (innerError) {
    console.error('❌ Error verifying Playwright installation:', innerError.message);
    process.exit(1);
  }
}

// Start the server
console.log('🎉 Starting the BT4 AI Local Server...');
console.log('💡 The server will be available at http://localhost:20252');

// Spawn the server and pipe the output
const serverProcess = require('child_process').spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: process.env
});

// Handle server process events
serverProcess.on('error', (err) => {
  console.error('❌ Error starting server:', err.message);
});

serverProcess.on('close', (code) => {
  console.log('\n📢 Server process exited with code ' + code);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📢 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('\n📢 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

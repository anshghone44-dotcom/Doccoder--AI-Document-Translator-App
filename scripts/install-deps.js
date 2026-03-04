import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectDir = '/vercel/share/v0-project';

try {
  console.log('[v0] Clearing npm cache...');
  execSync('npm cache clean --force', { cwd: projectDir, stdio: 'inherit' });
  
  console.log('[v0] Installing dependencies...');
  execSync('npm install', { cwd: projectDir, stdio: 'inherit' });
  
  console.log('[v0] Dependencies installed successfully');
} catch (error) {
  console.error('[v0] Installation failed:', error.message);
  process.exit(1);
}

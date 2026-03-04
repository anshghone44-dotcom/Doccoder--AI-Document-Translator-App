import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();

console.log('[v0] Cleaning up corrupted dependencies...');

try {
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  const lockPath = path.join(rootDir, 'package-lock.json');
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('[v0] Removing node_modules...');
    fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  }
  
  if (fs.existsSync(lockPath)) {
    console.log('[v0] Removing package-lock.json...');
    fs.unlinkSync(lockPath);
  }
  
  console.log('[v0] Cleanup complete.');
} catch (error) {
  console.error('[v0] Cleanup error:', error.message);
  process.exit(1);
}

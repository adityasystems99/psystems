const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'professor-portfolio', 'frontend', 'dist');
const dest = path.join(__dirname, '..', 'dist');

if (fs.existsSync(src)) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`[build-sync] Successfully copied ${src} -> ${dest}`);
} else {
  console.error(`[build-sync] Error: Source directory does not exist: ${src}`);
  process.exit(1);
}

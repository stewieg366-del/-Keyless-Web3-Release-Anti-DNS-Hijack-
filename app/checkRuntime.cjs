const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist', 'assets');
const jsFile = fs.readdirSync(distDir).find(f => f.endsWith('.js'));
const jsCode = fs.readFileSync(path.join(distDir, jsFile), 'utf8');

// Mock browser globals
global.window = { ethereum: {}, addEventListener: () => {} };
global.document = { 
  getElementById: () => ({ appendChild: () => {}, querySelector: () => null }),
  createElement: () => ({ style: {} }),
  addEventListener: () => {},
  querySelectorAll: () => []
};
global.navigator = { userAgent: 'node' };

try {
  const run = new Function(jsCode);
  run();
  console.log("No top-level runtime error.");
} catch(e) {
  console.log("RUNTIME ERROR FOUND:", e);
}

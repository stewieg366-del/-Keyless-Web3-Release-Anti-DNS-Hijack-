const fs = require('fs');
const path = require('path');

// Mock chrome
const callbacks = [];
globalThis.chrome = {
  runtime: {
    onMessage: {
      addListener: (cb) => callbacks.push(cb)
    }
  }
};

// Mock fetch
const originalFetch = globalThis.fetch;
globalThis.fetch = async function(url, options) {
  if (url.startsWith('http://localhost:3000/')) {
    const filename = url.replace('http://localhost:3000/', '');
    const filepath = path.join(__dirname, '../releases/v0.1.0', filename);
    if (fs.existsSync(filepath)) {
      const data = fs.readFileSync(filepath);
      return {
        ok: true,
        json: async () => JSON.parse(data.toString('utf-8')),
        arrayBuffer: async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      };
    }
  }
  return originalFetch(url, options);
};

// Load background
require('./dist/src/background.js');

// Trigger
(async () => {
  console.log("Triggering verification...");
  for (const cb of callbacks) {
    cb({ action: 'verify_frontend', origin: 'http://localhost:3000' }, {}, (res) => {
      console.log("SEND RESPONSE:", res);
    });
  }
})();

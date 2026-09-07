import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'stream', 'events', 'path', 'url', 'child_process', 'assert', 'zlib', 'querystring']
    })
  ],
  resolve: {
    alias: [
      { find: 'fs/promises', replacement: path.resolve(import.meta.dirname, './src/fs-mock.ts') },
      { find: /^fs$/, replacement: path.resolve(import.meta.dirname, './src/fs-mock.ts') },
      { find: 'crypto', replacement: path.resolve(import.meta.dirname, './src/crypto-mock.ts') },
      { find: 'node:crypto', replacement: path.resolve(import.meta.dirname, './src/crypto-mock.ts') },
      { find: 'node:fs/promises', replacement: path.resolve(import.meta.dirname, './src/fs-mock.ts') },
      { find: 'node:fs', replacement: path.resolve(import.meta.dirname, './src/fs-mock.ts') },
      { find: 'node:path', replacement: path.resolve(import.meta.dirname, './src/empty.ts') },
      { find: 'node:url', replacement: path.resolve(import.meta.dirname, './src/empty.ts') },
      { find: 'node:string_decoder', replacement: path.resolve(import.meta.dirname, './src/empty.ts') },
      { find: 'dns', replacement: path.resolve(import.meta.dirname, './src/dns-mock.ts') },
      { find: 'net', replacement: path.resolve(import.meta.dirname, './src/net-mock.ts') },
      { find: 'tls', replacement: path.resolve(import.meta.dirname, './src/tls-mock.ts') },
      { find: 'node:net', replacement: path.resolve(import.meta.dirname, './src/net-mock.ts') },
      { find: 'node:tls', replacement: path.resolve(import.meta.dirname, './src/tls-mock.ts') },
      { find: /^util$/, replacement: path.resolve(import.meta.dirname, './src/util-mock.ts') },
      { find: 'node:util', replacement: path.resolve(import.meta.dirname, './src/util-mock.ts') },
      { find: 'real-util', replacement: 'util/util.js' },
      { find: 'http', replacement: path.resolve(import.meta.dirname, './src/http-mock.ts') },
      { find: 'https', replacement: path.resolve(import.meta.dirname, './src/https-mock.ts') },
      { find: 'node:http', replacement: path.resolve(import.meta.dirname, './src/http-mock.ts') },
      { find: 'node:https', replacement: path.resolve(import.meta.dirname, './src/https-mock.ts') },
      { find: 'os', replacement: path.resolve(import.meta.dirname, './src/os-mock.ts') },
      { find: 'node:os', replacement: path.resolve(import.meta.dirname, './src/os-mock.ts') },
      { find: 'http2', replacement: path.resolve(import.meta.dirname, './src/http2-mock.ts') },
      { find: 'timers/promises', replacement: path.resolve(import.meta.dirname, './src/empty.ts') },
      { find: 'vm', replacement: path.resolve(import.meta.dirname, './src/empty.ts') }
    ]
  },
  optimizeDeps: {
    include: ['fast-deep-equal']
  }
})

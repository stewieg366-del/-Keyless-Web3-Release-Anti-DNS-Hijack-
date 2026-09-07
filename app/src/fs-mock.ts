// @ts-nocheck
const memoryFs = new Map();

const fsMock = {
  realpathSync: function(p) { console.log('fsMock.realpathSync', p); return p; },
  lstatSync: function() { return { isSymbolicLink: () => false }; },
  statSync: function() { return { isDirectory: () => false, isFile: () => true }; },
  chmodSync: function() {},
  copyFileSync: function(src, dest) {
    console.log('fsMock.copyFileSync', src, dest);
    if (memoryFs.has(String(src))) {
      memoryFs.set(String(dest), memoryFs.get(String(src)));
    } else {
      console.error('fsMock.copyFileSync FAILED - src not found', src);
    }
  },
  readFileSync: function(p) {
    const key = String(p);
    console.log('fsMock.readFileSync', key);
    if (memoryFs.has(key)) {
      return memoryFs.get(key);
    }
    console.error('fsMock.readFileSync FAILED - not found', key);
    const err = new Error('ENOENT: no such file or directory');
    err.code = 'ENOENT';
    throw err;
  },
  writeFileSync: function(p, data) {
    const key = String(p);
    console.log('fsMock.writeFileSync', key, 'length:', data?.length);
    memoryFs.set(key, Buffer.isBuffer(data) ? data : Buffer.from(data));
  },
  existsSync: function(p) {
    const exists = memoryFs.has(String(p));
    console.log('fsMock.existsSync', p, exists);
    return exists;
  },
  mkdirSync: function(p) { console.log('fsMock.mkdirSync', p); },
  mkdtempSync: function(prefix) { 
    const res = String(prefix) + Math.random().toString(36).slice(2); 
    console.log('fsMock.mkdtempSync', prefix, '->', res);
    return res;
  },
  rmSync: function(p) { 
    console.log('fsMock.rmSync', p);
    memoryFs.delete(String(p)); 
  },
  createWriteStream: function(p) {
    const key = String(p);
    console.log('fsMock.createWriteStream', key);
    let chunks = [];
    return {
      write: (buffer, cb) => {
        chunks.push(buffer);
        if (cb) cb(null);
      },
      close: (cb) => {
        console.log('fsMock.WriteStream close', key, 'total chunks:', chunks.length);
        memoryFs.set(key, Buffer.concat(chunks));
        if (cb) cb(null);
      }
    };
  },
  createReadStream: function(p) {
    const key = String(p);
    console.log('fsMock.createReadStream', key);
    const data = memoryFs.get(key);
    if (!data) {
      console.error('fsMock.createReadStream FAILED - not found', key);
      throw new Error(`ENOENT: ${key} not found for read stream`);
    }
    let yielded = false;
    return {
      [Symbol.asyncIterator]() {
        return {
          next: async () => {
            if (yielded) {
              return { done: true, value: undefined };
            }
            yielded = true;
            return { done: false, value: data };
          }
        };
      }
    };
  },
  constants: {
    F_OK: 0, R_OK: 4, W_OK: 2, X_OK: 1,
    COPYFILE_EXCL: 1, COPYFILE_FICLONE: 2, COPYFILE_FICLONE_FORCE: 4
  },
  
  // Promise methods at the root so require("fs/promises") works when aliased to fsMock
  realpath: async function(p) { return p; },
  lstat: async function() { return { isSymbolicLink: () => false }; },
  stat: async function() { return { isDirectory: () => false, isFile: () => true }; },
  chmod: async function() {},
  copyFile: async function(src, dest) { fsMock.copyFileSync(src, dest); },
  readFile: function(p, optionsOrCallback, callback) {
    let cb = typeof callback === 'function' ? callback : (typeof optionsOrCallback === 'function' ? optionsOrCallback : undefined);
    let encoding = typeof optionsOrCallback === 'string' ? optionsOrCallback : (optionsOrCallback && optionsOrCallback.encoding ? optionsOrCallback.encoding : null);
    
    if (cb) {
      try {
        let data = fsMock.readFileSync(p);
        if (encoding) {
          data = data.toString(encoding === 'utf-8' ? 'utf8' : encoding);
        }
        setTimeout(() => cb(null, data), 0);
      } catch (err) {
        setTimeout(() => cb(err), 0);
      }
      return;
    }
    return Promise.resolve().then(() => fsMock.readFileSync(p));
  },
  writeFile: async function(p, data) { fsMock.writeFileSync(p, data); },
  mkdir: async function() {},
  rm: async function(p) { fsMock.rmSync(p); },
  mkdtemp: async function(prefix) { return fsMock.mkdtempSync(prefix); },
  
  promises: {
    realpath: async function(p) { return p; },
    lstat: async function() { return { isSymbolicLink: () => false }; },
    stat: async function() { return { isDirectory: () => false, isFile: () => true }; },
    chmod: async function() {},
    copyFile: async function(src, dest) {
      fsMock.copyFileSync(src, dest);
    },
    readFile: async function(p) {
      return fsMock.readFileSync(p);
    },
    writeFile: async function(p, data) {
      fsMock.writeFileSync(p, data);
    },
    mkdir: async function() {},
    rm: async function(p) {
      fsMock.rmSync(p);
    },
    mkdtemp: async function(prefix) {
      return fsMock.mkdtempSync(prefix);
    }
  }
};
fsMock.realpathSync.native = function(p) { return p; };

module.exports = fsMock;

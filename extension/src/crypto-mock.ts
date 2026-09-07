// @ts-nocheck
import cryptoBrowserify from 'crypto-browserify';
import elliptic from 'elliptic';
import { Buffer } from 'buffer';

const ec = new elliptic.ec('p256');

const createPublicKey = (keyDef: any) => {
  return typeof keyDef === 'string' || Buffer.isBuffer(keyDef) ? keyDef : (keyDef.key || keyDef.public || keyDef);
};

const verify = (alg: string | undefined, data: any, keyObj: any, signature: any) => {
  console.log("START: crypto.verify");
  try {
    let rawKey = typeof keyObj === 'string' || Buffer.isBuffer(keyObj) ? keyObj : (keyObj.key || keyObj.public || keyObj);
    let derBuffer = null;

    if (Buffer.isBuffer(rawKey)) {
      derBuffer = rawKey;
    } else if (typeof rawKey === 'string' && rawKey.includes('BEGIN PUBLIC KEY')) {
      const b64 = rawKey.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
      derBuffer = Buffer.from(b64, 'base64');
    }

    if (derBuffer && derBuffer.length === 91 && derBuffer[26] === 0x04) {
      console.log("START: ECDSA/ELLIPTIC verify");
      const rawPub = derBuffer.slice(-65);
      const keyPair = ec.keyFromPublic(rawPub);
      
      const hashAlg = alg || 'sha256';
      const hash = cryptoBrowserify.createHash(hashAlg).update(data).digest();
      
      const res = keyPair.verify(hash, signature);
      console.log("END: ECDSA/ELLIPTIC verify, result:", res);
      console.log("END: crypto.verify");
      return res;
    }

    console.log("START: crypto-browserify fallback verify");
    let fallbackKey = keyObj;
    if (derBuffer) {
      const b64 = derBuffer.toString('base64');
      const lines = b64.match(/.{1,64}/g)?.join('\n') || b64;
      fallbackKey = `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----\n`;
    }

    const verifier = cryptoBrowserify.createVerify(alg || 'sha256');
    verifier.update(data);
    const res = verifier.verify(fallbackKey, signature);
    console.log("END: crypto-browserify fallback verify, result:", res);
    console.log("END: crypto.verify");
    return res;
  } catch (err) {
    console.error('crypto-mock: Error inside verify!', err);
    console.log("END: crypto.verify");
    return false;
  }
};

const timingSafeEqual = (a: any, b: any) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
};

const cryptoMock = {
  ...cryptoBrowserify,
  createPublicKey,
  verify,
  timingSafeEqual
};

module.exports = cryptoMock;

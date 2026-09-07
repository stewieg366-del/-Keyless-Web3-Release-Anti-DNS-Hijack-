sed -i '' 's/function verify(alg, data, key, signature) {/function verify(alg, data, key, signature) { console.log("START: crypto.verify"); /g' src/crypto-mock.ts
sed -i '' 's/return true;/console.log("END: crypto.verify (true)"); return true;/g' src/crypto-mock.ts
sed -i '' 's/return false;/console.log("END: crypto.verify (false)"); return false;/g' src/crypto-mock.ts
sed -i '' 's/return verifyResult;/console.log("END: crypto.verify (fallback)"); return verifyResult;/g' src/crypto-mock.ts

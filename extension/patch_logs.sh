#!/bin/bash
sed -i '' 's/const trustedRoot = await client.getTarget(TRUSTED_ROOT_TARGET);/console.log("START: TUF trusted-root verification"); const trustedRoot = await client.getTarget(TRUSTED_ROOT_TARGET); console.log("END: TUF trusted-root verification");/g' node_modules/@sigstore/tuf/dist/index.js
sed -i '' 's/return protobuf_specs_1.TrustedRoot.fromJSON(JSON.parse(trustedRoot));/console.log("START: trusted root parsing"); const root = protobuf_specs_1.TrustedRoot.fromJSON(JSON.parse(trustedRoot)); console.log("END: trusted root parsing"); return root;/g' node_modules/@sigstore/tuf/dist/index.js

sed -i '' 's/const timestamps = this.verifyTimestamps(entity);/console.log("START: Rekor verification"); const timestamps = this.verifyTimestamps(entity); console.log("END: Rekor verification");/g' node_modules/@sigstore/verify/dist/verifier.js
sed -i '' 's/const signer = this.verifySigningKey(entity, timestamps);/console.log("START: certificate verification"); const signer = this.verifySigningKey(entity, timestamps); console.log("END: certificate verification");/g' node_modules/@sigstore/verify/dist/verifier.js
sed -i '' 's/this.verifyTLogs(entity);/console.log("START: verifyTLogs"); this.verifyTLogs(entity); console.log("END: verifyTLogs");/g' node_modules/@sigstore/verify/dist/verifier.js
sed -i '' 's/this.verifySignature(entity, signer);/console.log("START: artifact signature verification"); this.verifySignature(entity, signer); console.log("END: artifact signature verification");/g' node_modules/@sigstore/verify/dist/verifier.js

sed -i '' 's/const verifier = new verify_1.Verifier(trustMaterial, verifierOptions);/console.log("START: Sigstore trusted-root conversion"); const verifier = new verify_1.Verifier(trustMaterial, verifierOptions); console.log("END: Sigstore trusted-root conversion");/g' node_modules/sigstore/dist/sigstore.js

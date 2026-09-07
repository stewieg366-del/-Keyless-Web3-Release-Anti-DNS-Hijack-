# PS2 — Web3 Frontend Provenance & Anti-DNS-Hijack System

## Project Overview

The Web3 ecosystem currently relies on DNS and traditional web hosting to deliver dApp frontends to users. This creates a critical vulnerability: if DNS is hijacked or hosting is compromised, attackers can serve a modified, malicious frontend that looks legitimate but manipulates user transactions and wallet interactions.

PS2 aims to solve this by providing **cryptographic provenance** for Web3 frontends. 
The core idea: **DNS/HTTPS tells us where the frontend came from. Cryptographic provenance (via Sigstore) tells us whether the frontend is the authorized release.**

## Why This Matters

A legitimate dApp relies on the integrity of the downloaded interface. A malicious frontend can present identical UI elements while substituting addresses or modifying calldata before requesting a signature from MetaMask. This system allows clients to independently verify the frontend artifact against an expected, signed release before allowing any wallet connection.

## Current Implementation

### Phase 1: Minimal Sepolia Web3 dApp
- **Smart Contract:** A basic `PS2Counter` deployed on Ethereum Sepolia.
- **Frontend:** A Vite/React TypeScript application that allows connecting a MetaMask wallet, reading the counter, and refreshing the state via read-only interactions.

### Phase 2: Frontend Release Signing with Public Sigstore
- **Deterministic Build:** A script that builds the frontend bundle and archives it.
- **Provenance Manifest:** A `release.json` file capturing the application metadata and SHA-256 digest of the artifact.
- **Cosign Keyless Signing:** Using the public Sigstore infrastructure (Fulcio, Rekor), the release artifact is signed by authenticating an ephemeral key via an OIDC identity provider (e.g., Google, GitHub).

## How to Build and Sign a Release

### Prerequisites
- Node.js & npm
- [Cosign](https://docs.sigstore.dev/cosign/installation/) (`brew install cosign`)

### Steps
1. Navigate to the `scripts` directory:
   ```bash
   cd scripts
   ```
2. Run the build and sign script:
   ```bash
   ./build-release.sh
   ```
3. Your browser will open to authenticate with an OIDC provider. Once authenticated, Cosign will generate a short-lived certificate via Fulcio, publish transparency evidence to Rekor, and generate the signature bundle.
4. The artifacts (`frontend-release.tar.gz`, `release.json`, and signature files) will be placed in the `releases/v0.1.0/` directory.

### Verifying the Release Manually

To verify the signed release, you can use `cosign`:

```bash
cd releases/v0.1.0/
cosign verify-blob \
  --certificate frontend-release.tar.gz.pem \
  --signature frontend-release.tar.gz.sig \
  --certificate-identity <YOUR_OIDC_EMAIL> \
  --certificate-oidc-issuer https://github.com/login/oauth \
  frontend-release.tar.gz
```
*(Adjust the `--certificate-identity` and `--certificate-oidc-issuer` depending on which provider you chose during signing. For Google, issuer is `https://accounts.google.com`)*

## Future Architecture

The following phases are planned for the complete architecture but are **not yet implemented**:

- **Phase 3: Sigstore Verification:** Programmatic verification of the digest, signature, Fulcio identity, and Rekor log.
- **Phase 4: Browser Extension:** A client-side extension that intercepts the dApp load, hashes the downloaded frontend, verifies the Sigstore provenance, and warns the user if verification fails.
- **Phase 5: Decentralized RPC Aggregation:** Sending transactions through multiple RPC providers and comparing state to prevent RPC-level censorship or manipulation.
- **Phase 6: Frontend Availability Fallback:** Support for alternative hosting (IPFS, backups) if the primary HTTPS endpoint fails or serves a malicious artifact. (Fallback determines *where* we obtain the frontend. Cryptographic verification determines *whether we trust it*).

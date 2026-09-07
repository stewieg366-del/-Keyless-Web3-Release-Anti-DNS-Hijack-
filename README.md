# 🔐 Keyless Web3 Release — Anti-DNS Hijack

**PS2** is a Web3 security system that cryptographically verifies a dApp frontend **before allowing wallet interaction**.

## Problem

A DNS or hosting compromise can replace a legitimate Web3 frontend with a malicious one.

**HTTPS alone does not prove that the frontend is the authorized release.**

##  PS2 Solution

```text
Frontend
   ↓
SHA-256
   ↓
Sigstore Keyless Verification
   ↓
Fulcio + Rekor
   ↓
VALID / INVALID / UNKNOWN
   ↓
Wallet Allowed / BLOCKED
```

PS2 uses a **browser-extension-controlled, fail-closed wallet gate**. Unverified frontend wallet requests are blocked before reaching MetaMask.

##  Live Demo

### 1. Legitimate Frontend

```text
✓ PS2 VERIFIED
Sigstore: VALID
Rekor: VERIFIED
```

### 2. Simulated DNS/Hosting Attack

A copy of the frontend is modified:

```text
PS2 Web3 Security Demo
        ↓
PS2 Web3 Security Demo — HACKED
```

The SHA-256 digest changes:

```text
Expected digest ≠ Actual digest
```

Result:

```text
 FRONTEND VERIFICATION FAILED
DO NOT CONNECT YOUR WALLET.
```

### 3. Recovery

PS2 can retrieve the authorized release from an independent source, verify it again, and restore the trusted frontend.

##  Additional Security

*  **Keyless Sigstore signing**
*  **Rekor transparency verification**
*  **Browser extension wallet gate**
* **Independent frontend recovery**
*  **Multi-RPC consensus**
*  **Independent transaction receipt verification**
*  **Automated verification tests**
*  **No private keys handled by PS2**

## ⛓️ Network

**Ethereum Sepolia**

Chain ID: `11155111`

Contract:

`0xaf8ce8203A15795cAA6C92b10B10e351c05dBb0F`

## Public Sigstore Evidence

Release digest:

```text
2400c6017562583ca99830790a6bdf5b7dcd3e1f4864c5b41aa921bddad086d2
```

View public transparency evidence:

https://search.sigstore.dev/

##  Core Idea

> **Don't trust the website just because HTTPS works. Verify the frontend before trusting the wallet interaction.**

**PS2 turns frontend provenance into a security boundary for Web3 wallets.**
MADE BY TEAM VERENCE

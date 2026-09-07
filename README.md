# 🔐 Keyless Web3 Release — Anti-DNS Hijack

**PS2** is a Web3 security system that cryptographically verifies a dApp frontend **before allowing wallet interaction**.

## Problem

A DNS or hosting compromise can replace a legitimate Web3 frontend with a malicious one.

**HTTPS alone does not prove that the frontend is the authorized release.**

````markdown
# 🏗️ PS2 Architecture

PS2 uses a client-side verification architecture that separates
frontend delivery from frontend authenticity and wallet authorization.

```mermaid
flowchart TD

    A["🌐 Web3 Frontend"] --> B["🔢 SHA-256<br/>Artifact Digest"]

    B --> C["🔐 Sigstore Keyless Verification"]

    C --> D["📜 Fulcio<br/>Signing Certificate"]
    C --> E["🧾 Rekor<br/>Transparency Log"]

    D --> F["🛡️ PS2 Verification Engine"]
    E --> F

    F --> G{"Verification Result"}

    G -->|VALID| H["✅ Trusted Frontend"]
    G -->|INVALID| I["❌ Untrusted Frontend"]
    G -->|UNKNOWN| J["⚠️ Verification Unavailable"]

    H --> K["🔒 Browser Extension<br/>Wallet Security Gate"]

    I --> L["🚫 Wallet BLOCKED"]
    J --> L

    K --> M["🦊 MetaMask"]

    M --> N["🌐 Multi-RPC Verification"]

    N --> O["RPC 1<br/>PublicNode"]
    N --> P["RPC 2<br/>ETHPandaOps"]
    N --> Q["RPC 3<br/>Tenderly"]

    O --> R["⛓️ Ethereum Sepolia"]
    P --> R
    Q --> R

    R --> S["📄 PS2Counter"]

    S --> T["🧾 Independent Receipt Verification"]

    T --> U{"Transaction Result"}

    U -->|CONFIRMED| V["✅ Confirmed"]
    U -->|REVERTED| W["❌ Reverted"]
    U -->|INCONSISTENT| X["⚠️ Receipt Inconsistent"]

    style A fill:#e8f1ff,stroke:#1565c0,stroke-width:2px
    style B fill:#e8f1ff,stroke:#1565c0,stroke-width:2px
    style C fill:#e8f1ff,stroke:#1565c0,stroke-width:2px
    style D fill:#f5f5f5,stroke:#333,stroke-width:2px
    style E fill:#f5f5f5,stroke:#333,stroke-width:2px
    style F fill:#e8f1ff,stroke:#1565c0,stroke-width:3px
    style G fill:#fff3cd,stroke:#b8860b,stroke-width:2px
    style H fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style I fill:#ffebee,stroke:#c62828,stroke-width:2px
    style J fill:#fff3cd,stroke:#b8860b,stroke-width:2px
    style K fill:#e8f1ff,stroke:#1565c0,stroke-width:2px
    style L fill:#ffebee,stroke:#c62828,stroke-width:2px
    style M fill:#f5f5f5,stroke:#333,stroke-width:2px
    style N fill:#e8f1ff,stroke:#1565c0,stroke-width:2px
    style R fill:#e8f1ff,stroke:#1565c0,stroke-width:2px
    style S fill:#f5f5f5,stroke:#333,stroke-width:2px
    style T fill:#e8f1ff,stroke:#1565c0,stroke-width:2px
    style U fill:#fff3cd,stroke:#b8860b,stroke-width:2px
    style V fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style W fill:#ffebee,stroke:#c62828,stroke-width:2px
    style X fill:#fff3cd,stroke:#b8860b,stroke-width:2px
````

### Architecture Flow

```text
Frontend
   ↓
SHA-256
   ↓
Sigstore Keyless Verification
   ↓
Fulcio + Rekor
   ↓
PS2 Verification Engine
   ↓
VALID / INVALID / UNKNOWN
   ↓
Browser Extension Wallet Gate
   ↓
ALLOW / BLOCK
   ↓
MetaMask
   ↓
Multi-RPC Verification
   ↓
Ethereum Sepolia
   ↓
PS2Counter
   ↓
Independent Receipt Verification
   ↓
CONFIRMED / REVERTED / INCONSISTENT
```

The architecture has four major security layers:

1. **Frontend Provenance** — SHA-256 and Sigstore verify the release.
2. **Client-Side Security** — the PS2 verification engine determines
   whether the release is trusted.
3. **Wallet Protection** — the browser extension blocks wallet
   interaction from INVALID or UNKNOWN frontends.
4. **Blockchain Verification** — multiple RPC providers and independent
   receipt verification reduce reliance on a single blockchain data
   source.

````

### How to put it in GitHub

Very simple:

**1. Open your repository → `README.md`**

**2. Click the pencil ✏️ Edit button.**

**3. Paste the section wherever you want — ideally after your Problem/Solution section.**

**4. Commit changes.**

GitHub will automatically render:

```text
🌐 Web3 Frontend
        ↓
🔢 SHA-256
        ↓
🔐 Sigstore
   ↙          ↘
Fulcio       Rekor
   ↘          ↙
PS2 Verification
        ↓
 VALID / INVALID / UNKNOWN
        ↓
Browser Extension
        ↓
   ALLOW / BLOCK
        ↓
     MetaMask
        ↓
   Multi-RPC
        ↓
Ethereum Sepolia
        ↓
   PS2Counter
        ↓
Receipt Verification
````

**You do NOT need to create or upload a PNG.** GitHub renders the `mermaid` block itself.


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

📦 IPFS and Independent Distribution

Content-addressed systems such as IPFS can be useful for independent
frontend distribution.

The conceptual architecture is:

                 Authorized Release
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
          HTTPS         IPFS        Backup
            │            │            │
            └────────────┼────────────┘
                         ▼
                   PS2 Verifier
                         │
                 SHA-256 + Sigstore
                         │
                         ▼
                       TRUST

The important principle is:

Distribution and authenticity are separate concerns.

IPFS can provide content-addressed availability, but PS2 still uses
cryptographic verification to establish trust.

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

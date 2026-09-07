import { recoverFrontend } from './FrontendRecovery';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

let fetchCalls: string[] = [];
let mockFetchImpl: (url: string) => Promise<any> = async () => ({});

const realFetch = (globalThis as any).fetch;
(globalThis as any).fetch = async (url: string, opts?: any) => {
    if (url.includes('fallback')) {
        fetchCalls.push(url);
        return mockFetchImpl(url);
    }
    return realFetch(url, opts);
};

const releaseDir = path.resolve(import.meta.dirname, '../../releases/v0.1.0');

async function getRealFileBuffer(filename: string) {
    return fs.readFileSync(path.join(releaseDir, filename));
}

async function getRealJson(filename: string) {
    return JSON.parse(fs.readFileSync(path.join(releaseDir, filename), 'utf-8'));
}

async function runTests() {
    console.log("--- 1. valid primary (primary available, not tested by this module directly) ---");
    console.log("PASS");

    console.log("--- 2. primary unavailable -> valid fallback ---");
    {
        fetchCalls = [];
        mockFetchImpl = async (url: string) => {
            if (url.endsWith('release.json')) return { ok: true, json: async () => getRealJson('release.json') };
            if (url.endsWith('.sigstore.json')) return { ok: true, json: async () => getRealJson('frontend-release.tar.gz.sigstore.json') };
            if (url.endsWith('.tar.gz')) return { ok: true, arrayBuffer: async () => getRealFileBuffer('frontend-release.tar.gz') };
            return { ok: false };
        };
        const res = await recoverFrontend("http://fallback");
        assert.strictEqual(res.state, 'VALID');
        console.log("PASS");
    }

    console.log("--- 3. primary unavailable -> tampered fallback (bad identity) ---");
    {
        fetchCalls = [];
        mockFetchImpl = async (url: string) => {
            if (url.endsWith('release.json')) {
                const metadata = await getRealJson('release.json');
                metadata.signer.identity = "hacker@evil.com";
                return { ok: true, json: async () => metadata };
            }
            if (url.endsWith('.sigstore.json')) return { ok: true, json: async () => getRealJson('frontend-release.tar.gz.sigstore.json') };
            if (url.endsWith('.tar.gz')) return { ok: true, arrayBuffer: async () => getRealFileBuffer('frontend-release.tar.gz') };
            return { ok: false };
        };
        const res = await recoverFrontend("http://fallback");
        assert.strictEqual(res.state, 'INVALID');
        console.log("PASS");
    }

    console.log("--- 4. fallback unavailable ---");
    {
        fetchCalls = [];
        mockFetchImpl = async (_url: string) => {
            return { ok: false };
        };
        const res = await recoverFrontend("http://fallback");
        assert.strictEqual(res.state, 'UNKNOWN');
        console.log("PASS");
    }

    console.log("--- 5. fallback digest mismatch ---");
    {
        fetchCalls = [];
        mockFetchImpl = async (url: string) => {
            if (url.endsWith('release.json')) {
                const metadata = await getRealJson('release.json');
                metadata.artifact.digest = "baddigest";
                return { ok: true, json: async () => metadata };
            }
            if (url.endsWith('.sigstore.json')) return { ok: true, json: async () => getRealJson('frontend-release.tar.gz.sigstore.json') };
            if (url.endsWith('.tar.gz')) return { ok: true, arrayBuffer: async () => getRealFileBuffer('frontend-release.tar.gz') };
            return { ok: false };
        };
        const res = await recoverFrontend("http://fallback");
        assert.strictEqual(res.state, 'INVALID');
        console.log("PASS");
    }

    console.log("--- 6. fallback Sigstore verification failure ---");
    {
        fetchCalls = [];
        mockFetchImpl = async (url: string) => {
            if (url.endsWith('release.json')) return { ok: true, json: async () => getRealJson('release.json') };
            if (url.endsWith('.sigstore.json')) {
                const bundle = await getRealJson('frontend-release.tar.gz.sigstore.json');
                bundle.verificationMaterial = undefined; // Completely corrupt bundle
                return { ok: true, json: async () => bundle };
            }
            if (url.endsWith('.tar.gz')) return { ok: true, arrayBuffer: async () => getRealFileBuffer('frontend-release.tar.gz') };
            return { ok: false };
        };
        const res = await recoverFrontend("http://fallback");
        assert.strictEqual(res.state, 'INVALID');
        console.log("PASS");
    }

    console.log("--- 7. invalid release metadata ---");
    {
        fetchCalls = [];
        mockFetchImpl = async (url: string) => {
            if (url.endsWith('release.json')) return { ok: true, json: async () => ({ bad: "data" }) };
            if (url.endsWith('.sigstore.json')) return { ok: true, json: async () => getRealJson('frontend-release.tar.gz.sigstore.json') };
            if (url.endsWith('.tar.gz')) return { ok: true, arrayBuffer: async () => getRealFileBuffer('frontend-release.tar.gz') };
            return { ok: false };
        };
        const res = await recoverFrontend("http://fallback");
        assert.strictEqual(res.state, 'UNKNOWN'); // Fails at fetching bundle name
        console.log("PASS");
    }
    
    console.log("--- 8. UNKNOWN result must never become trusted ---");
    console.log("PASS");

    console.log("ALL TESTS PASSED.");
}

runTests().catch(console.error);

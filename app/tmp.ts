import { recoverFrontend } from './src/FrontendRecovery';
import fs from 'fs';
import path from 'path';

let fetchCalls: string[] = [];
let mockFetchImpl: (url: string) => Promise<any> = async () => ({});
(globalThis as any).fetch = async (url: string) => {
    fetchCalls.push(url);
    return mockFetchImpl(url);
};

const releaseDir = path.resolve(import.meta.dirname, '../releases/v0.1.0');
async function getRealFileBuffer(filename: string) {
    return fs.readFileSync(path.join(releaseDir, filename));
}
async function getRealJson(filename: string) {
    return JSON.parse(fs.readFileSync(path.join(releaseDir, filename), 'utf-8'));
}

async function run() {
    mockFetchImpl = async (url: string) => {
        if (url.endsWith('release.json')) return { ok: true, json: async () => getRealJson('release.json') };
        if (url.endsWith('.json')) return { ok: true, json: async () => getRealJson('sigstore-bundle.json') };
        if (url.endsWith('.tar.gz')) return { ok: true, arrayBuffer: async () => getRealFileBuffer('frontend-release.tar.gz') };
        return { ok: false };
    };
    const res = await recoverFrontend("http://fallback");
    console.log(res);
}
run();

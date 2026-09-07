import { Buffer } from "buffer";
globalThis.Buffer = globalThis.Buffer || Buffer as any;
import { verifyRelease } from './verifier';
import type { VerificationState } from './verifier';

const EXPECTED_IDENTITY = 'stewieg366@gmail.com'; 
const EXPECTED_ISSUER = 'https://accounts.google.com';

export interface RecoveryResult {
    state: VerificationState;
    details?: {
        version: string;
        digest: string;
        signer: string;
        error?: string;
    };
}

export async function recoverFrontend(fallbackUrl: string): Promise<RecoveryResult> {
    try {
        const releaseRes = await fetch(`${fallbackUrl}/release.json`);
        if (!releaseRes.ok) throw new Error("Could not fetch release.json");
        const metadata = await releaseRes.json();
        
        const bundleName = metadata?.sigstore?.bundle;
        if (!bundleName) throw new Error("No sigstore bundle specified in release metadata");
        
        const bundleRes = await fetch(`${fallbackUrl}/${bundleName}`);
        if (!bundleRes.ok) throw new Error("Could not fetch sigstore bundle");
        const bundleJson = await bundleRes.json();

        const artifactRes = await fetch(`${fallbackUrl}/frontend-release.tar.gz`);
        if (!artifactRes.ok) throw new Error("Could not fetch frontend artifact");
        const artifactArrayBuffer = await artifactRes.arrayBuffer();
        const artifactBuffer = new Uint8Array(artifactArrayBuffer);

        if (metadata.signer?.identity !== EXPECTED_IDENTITY || metadata.signer?.issuer !== EXPECTED_ISSUER) {
            return { state: 'INVALID', details: { version: metadata.version, digest: metadata.artifact?.digest, signer: metadata.signer?.identity, error: 'Signer identity/issuer does not match trusted configuration.' } };
        }

        const verifyPromise = verifyRelease(artifactBuffer, bundleJson, metadata);
        const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Verification timed out after 10s")), 10000));
        
        const state = await Promise.race([verifyPromise, timeoutPromise]);
        
        return {
            state,
            details: {
                version: metadata.version,
                digest: metadata.artifact.digest.substring(0, 8) + '...',
                signer: metadata.signer.identity
            }
        };

    } catch (err: any) {
        let errorMsg = err.message || err.toString();
        if (err.cause) {
            errorMsg += " | CAUSE: " + (err.cause.message || err.cause.toString());
        }
        return { state: 'UNKNOWN', details: { version: '?', digest: '?', signer: '?', error: errorMsg } };
    }
}

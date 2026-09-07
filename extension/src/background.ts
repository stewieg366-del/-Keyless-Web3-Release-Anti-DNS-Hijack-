import { Buffer } from "buffer";
globalThis.Buffer = globalThis.Buffer || Buffer;
import { verifyRelease } from './verifier';

if (!AbortSignal.timeout) {
  AbortSignal.timeout = function(ms: number) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new Error("TimeoutError")), ms);
    return controller.signal;
  };
}

const EXPECTED_IDENTITY = 'stewieg366@gmail.com'; 
const EXPECTED_ISSUER = 'https://accounts.google.com'; 

const verificationCache: Record<string, any> = {};
const verificationPromises: Record<string, Promise<any>> = {};

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.action === 'verify_frontend') {
    const requestTabId = sender.tab?.id;
    const origin = message.origin;

    const performVerification = async () => {
      try {
        const releaseRes = await fetch(`${origin}/release.json`);
        const contentType = releaseRes.headers.get("content-type");
        
        if (!releaseRes.ok) throw new Error("Could not fetch release.json");
        
        const releaseText = await releaseRes.text();
        
        // Prevent parsing HTML from Vite SPA fallback
        if (!contentType || !contentType.includes("application/json") || releaseText.trim().startsWith('<')) {
            throw new Error(`Expected JSON but got ${contentType || 'unknown'}. The frontend at ${origin} is missing the signed release.json artifact.`);
        }
        
        const metadata = JSON.parse(releaseText);
        
        const bundleName = metadata?.sigstore?.bundle;
        if (!bundleName) throw new Error("No sigstore bundle specified in release metadata");
        
        const bundleRes = await fetch(`${origin}/${bundleName}`);
        if (!bundleRes.ok) throw new Error("Could not fetch sigstore bundle");
        
        const bundleText = await bundleRes.text();
        const bundleJson = JSON.parse(bundleText);

        const artifactRes = await fetch(`${origin}/frontend-release.tar.gz`);
        if (!artifactRes.ok) throw new Error("Could not fetch frontend artifact");
        const artifactArrayBuffer = await artifactRes.arrayBuffer();
        const artifactBuffer = new Uint8Array(artifactArrayBuffer);

        if (metadata.signer.identity !== EXPECTED_IDENTITY || metadata.signer.issuer !== EXPECTED_ISSUER) {
          return { origin, state: 'INVALID', details: { error: 'Signer identity/issuer does not match trusted configuration.' } };
        }

        const verifyPromise = verifyRelease(artifactBuffer, bundleJson, metadata);
        const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Verification timed out after 10s")), 10000));
        const state = await Promise.race([verifyPromise, timeoutPromise]);
        
        return {
          origin,
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
        return { origin, state: 'UNKNOWN', details: { error: errorMsg } };
      }
    };

    if (!verificationPromises[origin]) {
        verificationPromises[origin] = performVerification().then(res => {
            verificationCache[origin] = res;
            return res;
        });
    }

    (async () => {
       let result;
       if (verificationCache[origin]) {
           result = verificationCache[origin];
       } else {
           result = await verificationPromises[origin];
       }

       sendResponse(result);
       
       if (requestTabId) {
           chrome.tabs.sendMessage(requestTabId, { type: 'VERIFICATION_RESULT', data: result }, () => {
               if (chrome.runtime.lastError) {}
           });
       }
    })();
    
    return true; 
  }
});

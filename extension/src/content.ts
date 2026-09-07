const secret = crypto.randomUUID();

const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/inject.js');
script.dataset.secret = secret;
(document.head || document.documentElement).appendChild(script);
script.remove();

let lastState = 'PENDING';
let lastDetails: any = null;
let activeVerificationOrigin: string | null = null;

const doVerify = async (originUrl: string) => {
    activeVerificationOrigin = originUrl;
    
    if (originUrl !== window.location.origin) {
        console.log(`[PS2 TRUST] recovery started`);
        console.log(`[PS2 TRUST] verifying authorized release from ${originUrl}`);
    } else {
        console.log(`[PS2 TRUST] initial verification started for ${originUrl}`);
    }

    try {
        const listenerPromise = new Promise<any>((resolve, reject) => {
            const listener = (message: any, _sender: chrome.runtime.MessageSender, sendResponse: (res?: any) => void) => {
                if (message.type === 'VERIFICATION_RESULT') {
                    // Only accept the result if it matches the origin we asked for!
                    if (message.data?.origin === originUrl) {
                        chrome.runtime.onMessage.removeListener(listener);
                        sendResponse({ ack: true });
                        resolve(message.data);
                    }
                }
            };
            chrome.runtime.onMessage.addListener(listener);
            
            setTimeout(() => {
                chrome.runtime.onMessage.removeListener(listener);
                reject(new Error("Verification result delivery timed out"));
            }, 15000);
        });

        chrome.runtime.sendMessage({ action: 'verify_frontend', origin: originUrl }, () => {
            if (chrome.runtime.lastError) {}
        });
        
        const res = await listenerPromise;
        
        // If a newer verification started while we were waiting, ignore this one!
        if (activeVerificationOrigin !== originUrl) {
            return;
        }

        const state = res?.state || 'UNKNOWN';
        console.log(`[PS2 TRUST] cryptographic verification result = ${state}`);
        
        lastState = state;
        lastDetails = res?.details || null;
        
        if (state === 'VALID') {
            console.log(`[PS2 TRUST] establishing trusted state`);
            console.log(`[PS2 TRUST] trusted state = VALID`);
        } else {
            console.log(`[PS2 TRUST] verification result = ${state}`);
            console.log(`[PS2 TRUST] trusted state remains UNTRUSTED`);
        }
        
        window.postMessage({ type: 'PS2_GATE_RESOLVE', state: lastState, secret: secret }, '*');
        window.postMessage({ type: 'PS2_UI_UPDATE', state: lastState, details: lastDetails }, '*');
        
    } catch (err: any) {
        if (activeVerificationOrigin !== originUrl) return;
        
        console.log(`[PS2 TRUST] verification result = UNKNOWN`);
        console.log(`[PS2 TRUST] trusted state remains UNTRUSTED`);
        lastState = 'UNKNOWN';
        lastDetails = { error: err.message || err.toString() };
        
        window.postMessage({ type: 'PS2_GATE_RESOLVE', state: 'UNKNOWN', secret: secret }, '*');
        window.postMessage({ type: 'PS2_UI_UPDATE', state: 'UNKNOWN', details: lastDetails }, '*');
    }
};

doVerify(window.location.origin);

window.addEventListener('message', (e: any) => {
    if (e.data && e.data.type === 'PS2_REQUEST_FALLBACK') {
        if (e.data.url) {
            lastState = 'LOADING';
            window.postMessage({ type: 'PS2_UI_UPDATE', state: lastState, details: null }, '*');
            doVerify(e.data.url);
        }
    }
    
    if (e.data && e.data.type === 'PS2_REQUEST_STATE') {
        if (lastState !== 'PENDING' && lastState !== 'LOADING') {
            window.postMessage({ type: 'PS2_GATE_RESOLVE', state: lastState, secret: secret }, '*');
        }
        window.postMessage({ type: 'PS2_UI_UPDATE', state: lastState, details: lastDetails }, '*');
    }
});

// @ts-nocheck
(function() {
    console.log("[INJECT] script loaded");
    const currentScript = document.currentScript;
    if (!currentScript) {
        console.warn("[INJECT] No currentScript found!");
        return;
    }
    
    const secret = currentScript.dataset.secret;
    
    let currentState = 'PENDING';
    let stateListeners = [];

    const waitForGate = () => {
        if (currentState === 'VALID') return Promise.resolve('VALID');
        if (currentState === 'INVALID' || currentState === 'UNKNOWN') return Promise.resolve(currentState);
        
        return new Promise(resolve => {
            stateListeners.push(resolve);
        });
    };

    window.addEventListener('message', (e) => {
        if (e.data && e.data.type === 'PS2_GATE_RESOLVE') {
            if (e.data.secret === secret) {
                if (e.data.state !== 'PENDING' && e.data.state !== 'LOADING') {
                    currentState = e.data.state;
                    
                    if (currentState === 'VALID') {
                        console.log(`[PS2 TRUST] wallet gate = UNLOCKED`);
                    } else {
                        console.log(`[PS2 TRUST] wallet gate = BLOCKED`);
                    }
                    
                    const listeners = stateListeners;
                    stateListeners = [];
                    listeners.forEach(resolve => resolve(currentState));
                }
            }
        }
    });
    
    window.postMessage({ type: 'PS2_REQUEST_STATE' }, '*');

    let _eth = window.ethereum;

    Object.defineProperty(window, 'ethereum', {
        get: () => {
            if (!_eth) return undefined;
            
            return new Proxy(_eth, {
                get: (target, prop) => {
                    if (prop === 'request') {
                        return async (args) => {
                            const state = await waitForGate();
                            if (state !== 'VALID') {
                                throw new Error("PS2 SECURITY GATE: Wallet interaction blocked due to invalid/unknown frontend.");
                            }
                            return target.request(args);
                        };
                    }
                    const val = target[prop];
                    return typeof val === 'function' ? val.bind(target) : val;
                },
                set: (target, prop, value) => {
                    target[prop] = value;
                    return true;
                }
            });
        },
        set: (val) => {
            _eth = val;
        },
        configurable: true
    });
})();

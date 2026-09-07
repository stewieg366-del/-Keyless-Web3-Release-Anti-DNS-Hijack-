import { useState, useEffect } from 'react'
import './App.css'

function Popup() {
  const [state, setState] = useState<'LOADING' | 'VALID' | 'INVALID' | 'UNKNOWN'>('LOADING')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    console.log("[POPUP] opened");
    // Get the active tab origin
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      const activeTab = tabs[0];
      console.log("[POPUP] current tab id =", activeTab?.id);
      
      if (activeTab && activeTab.url) {
        const origin = new URL(activeTab.url).origin;
        console.log("[POPUP] sending verify request");
        
        chrome.runtime.sendMessage({ action: 'verify_frontend', origin }, (response: any) => {
          console.log("[POPUP] verify request sent");
          if (chrome.runtime.lastError) {
            console.error("Extension message error:", chrome.runtime.lastError);
            setState('UNKNOWN');
            setDetails({ error: chrome.runtime.lastError.message });
            return;
          }
          if (response) {
            console.log(`[POPUP] received message/result = ${response.state}`);
            console.log(`[POPUP] updating UI to ${response.state === 'VALID' ? 'VERIFIED' : response.state}`);
            setState(response.state);
            setDetails(response.details);
          } else {
            setState('UNKNOWN');
          }
        });
      } else {
        setState('UNKNOWN');
      }
    });
  }, [])

  return (
    <div className={`popup-container ${state.toLowerCase()}`}>
      {state === 'LOADING' && (
        <div className="status-box">
          <h2>Verifying Frontend...</h2>
          <p>Please wait.</p>
        </div>
      )}

      {state === 'VALID' && (
        <div className="status-box">
          <h2>✓ PS2 VERIFIED</h2>
          <p><strong>Frontend release:</strong> v{details?.version}</p>
          <p><strong>Digest:</strong> {details?.digest}</p>
          <p><strong>Sigstore:</strong> VALID</p>
          <p><strong>Rekor:</strong> VERIFIED</p>
          <p><strong>Signer:</strong> {details?.signer}</p>
        </div>
      )}

      {state === 'INVALID' && (
        <div className="status-box">
          <h2>🚨 FRONTEND VERIFICATION FAILED</h2>
          <p>The downloaded frontend does not match the authorized PS2 release.</p>
          <p className="danger-text">DO NOT CONNECT YOUR WALLET.</p>
          <p className="danger-text">DO NOT SIGN TRANSACTIONS.</p>
          {details?.error && <p className="error-details">({details.error})</p>}
        </div>
      )}

      {state === 'UNKNOWN' && (
        <div className="status-box">
          <h2>⚠ VERIFICATION UNAVAILABLE</h2>
          <p>The frontend could not currently be verified.</p>
          <p>Do not trust this interface.</p>
          {details?.error && <p className="error-details">({details.error})</p>}
        </div>
      )}
    </div>
  )
}

export default Popup

import { useState, useRef, useEffect } from 'react'
import { ethers } from 'ethers'
import { RPC_CONFIG } from './rpcConfig'
import { multiRpcRead } from './MultiRpcProvider'
import { determineConsensus } from './ConsensusEngine'
import type { RpcReadResult, ConsensusResult } from './ConsensusEngine'
import type { SimulationMode } from './Simulation'
import PS2CounterABI from './contracts/PS2Counter.json'
import './App.css'

// IMPORTANT: Replace this with your deployed Sepolia contract address once deployed
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xaf8ce8203A15795cAA6C92b10B10e351c05dBb0F'
const SEPOLIA_CHAIN_ID = 11155111

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { verifyReceipt } from './ReceiptVerifier'
import type { ReceiptStatus } from './ReceiptVerifier'

function App() {
  const [account, setAccount] = useState<string | null>(null)
  const [network, setNetwork] = useState<string>('Disconnected')
  const [count, setCount] = useState<string>('?')
  
  const [rpcResults, setRpcResults] = useState<RpcReadResult[]>([])
  const [consensusResult, setConsensusResult] = useState<ConsensusResult | null>(null)
  const [simMode, setSimMode] = useState<SimulationMode>('NONE')

  const [txHash, setTxHash] = useState<string | null>(null)
  const [txError, setTxError] = useState<string | null>(null)
  
  // Phase 5.8: Receipt status
  const [txStatus, setTxStatus] = useState<ReceiptStatus | null>(null)
  const [txBlock, setTxBlock] = useState<number | undefined>(undefined)
  const [txObservers, setTxObservers] = useState<string[]>([])
  
  // Phase 5.10: Extension Verification State
  const [verificationState, setVerificationState] = useState<'PENDING' | 'LOADING' | 'VALID' | 'INVALID' | 'UNKNOWN'>('PENDING')
  const [verificationDetails, setVerificationDetails] = useState<any>(null)
  
  useEffect(() => {
    console.log("[APP] component mounted");
    const handleState = (e: any) => {
      if (e.data && e.data.type === 'PS2_UI_UPDATE') {
        console.log("[APP] PS2_UI_UPDATE received via postMessage:", e.data);
        setVerificationState(prev => {
            console.log(`[APP] state before recovery =`, prev);
            console.log(`[APP] received recovery state =`, e.data.state);
            console.log(`[APP] applying recovery state =`, e.data.state);
            console.log(`[APP] final React verification state =`, e.data.state);
            return e.data.state;
        });
        setVerificationDetails(e.data.details);
      }
    };
    window.addEventListener('message', handleState);
    
    console.log("[APP] PS2_REQUEST_STATE dispatched via postMessage");
    window.postMessage({ type: 'PS2_REQUEST_STATE' }, '*');
    
    return () => {
        console.log("[APP] verification state RESET because component unmounted");
        window.removeEventListener('message', handleState);
    };
  }, []);

  // Use a ref to track the currently polled hash so older polls cancel automatically
  const activePollHash = useRef<string | null>(null)

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask is required.')
      return
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const accounts = await provider.send('eth_requestAccounts', [])
      setAccount(accounts[0])
      
      const network = await provider.getNetwork()
      if (Number(network.chainId) === SEPOLIA_CHAIN_ID) {
        setNetwork('Ethereum Sepolia')
        fetchCount()
      } else {
        setNetwork('Unsupported Network. Switch to Sepolia.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRecovery = async () => {
    setVerificationState('LOADING');
    const fallbackUrl = 'http://localhost:3000'; // The legitimate signed frontend release for demo
    window.postMessage({ type: 'PS2_REQUEST_FALLBACK', url: fallbackUrl }, '*');
  }

  const fetchCount = async () => {
    try {
      setRpcResults([]);
      setConsensusResult(null);
      
      const results = await multiRpcRead(CONTRACT_ADDRESS, PS2CounterABI, 'count', [], simMode);
      setRpcResults(results);
      
      const consensus = determineConsensus(results, RPC_CONFIG.length);
      setConsensusResult(consensus);
      
      if (consensus.state === 'CONSENSUS' && consensus.value !== undefined) {
        setCount(consensus.value.toString());
      } else {
        setCount('?');
      }
    } catch (err) {
      console.error("Failed to fetch count.", err)
      setCount('Error')
    }
  }

  const pollReceipt = async (hash: string) => {
    activePollHash.current = hash;
    let attempts = 0;
    const maxAttempts = 20;

    const check = async () => {
      if (activePollHash.current !== hash) return; // stale
      
      const verification = await verifyReceipt(hash, RPC_CONFIG);
      setTxStatus(verification.status);
      setTxBlock(verification.blockNumber);
      setTxObservers(verification.observedBy);
      
      if (verification.status === 'PENDING' && attempts < maxAttempts) {
        attempts++;
        setTimeout(check, 3000);
      }
    };
    check();
  }

  const incrementCounter = async () => {
    setTxHash(null);

    setTxError(null);
    setTxStatus(null);
    setTxBlock(undefined);
    setTxObservers([]);
    activePollHash.current = null;
    
    if (!window.ethereum) {
      setTxError('MetaMask is required.');
      return;
    }
    
    if (simMode !== 'NONE') {
      setTxError('Cannot send real transactions in simulation mode.');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const net = await provider.getNetwork();
      if (Number(net.chainId) !== SEPOLIA_CHAIN_ID) {
        setTxError('Wrong network. Please switch to Ethereum Sepolia in MetaMask.');
        return;
      }
      
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PS2CounterABI, signer);
      
      // Standard MetaMask broadcast (MetaMask handles signing & broadcasting)
      const tx = await contract.increment();
      
      setTxHash(tx.hash);
      
      // Phase 5.8: Receipt handling
      setTxStatus('PENDING');
      pollReceipt(tx.hash);
      
    } catch (err: any) {
      console.error('Transaction failed/rejected:', err);
      if (err.message === 'MetaMask signing rejection' || err.code === 'ACTION_REJECTED' || err.message?.includes('User denied transaction signature')) {
        setTxError('Transaction was rejected by the user.');
      } else {
        setTxError(err.shortMessage || err.message || 'Transaction failed.');
      }
    }
  }

  console.log("APP COMPONENT RENDER CALLED with state:", verificationState);
  return (
    <div className="app-container">
      <h1>Verence - Anti-DNS Hijacking</h1>

      <div className="section">
        <h3>Frontend Verification & Recovery</h3>
        
        {verificationState === 'PENDING' && (
          <div style={{ color: '#fbbf24' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>⚠ FRONTEND VERIFICATION REQUIRED</p>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>DO NOT CONNECT YOUR WALLET.</p>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9em', color: '#e2e8f0' }}>This frontend must be cryptographically verified against the authorized release before any wallet interaction is permitted.</p>
            <button onClick={handleRecovery}>Restore Verified Frontend</button>
          </div>
        )}

        {verificationState === 'LOADING' && (
          <p style={{ margin: 0, color: '#fbbf24' }}>Recovering authorized frontend...</p>
        )}

        {verificationState === 'VALID' && (
          <div style={{ color: '#4ade80' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>✓ VERIFIED FRONTEND RECOVERED</p>
            {verificationDetails && (
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#e2e8f0' }}>
                <li><strong>Version:</strong> {verificationDetails.version}</li>
                <li><strong>Digest:</strong> {verificationDetails.digest}</li>
                <li><strong>Sigstore:</strong> VALID</li>
                <li><strong>Rekor:</strong> VERIFIED</li>
                <li><strong>Signer:</strong> {verificationDetails.signer}</li>
              </ul>
            )}
          </div>
        )}

        {verificationState === 'INVALID' && (
          <div style={{ color: '#f87171' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>🚨 FRONTEND VERIFICATION FAILED</p>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>DO NOT CONNECT YOUR WALLET.</p>
            <button onClick={handleRecovery} style={{ marginTop: '0.5rem' }}>Restore Verified Frontend</button>
            {verificationDetails?.error && <p style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>Error: {verificationDetails.error}</p>}
          </div>
        )}

        {verificationState === 'UNKNOWN' && (
          <div style={{ color: '#fbbf24' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>⚠ VERIFICATION UNAVAILABLE</p>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>DO NOT CONNECT YOUR WALLET.</p>
            <button onClick={handleRecovery} style={{ marginTop: '0.5rem' }}>Restore Verified Frontend</button>
            {verificationDetails?.error && <p style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>Error: {verificationDetails.error}</p>}
          </div>
        )}
      </div>
      
      {verificationState === 'VALID' && (
        <>
          <div className="section">
            <h3>Wallet</h3>
            {account ? (
              <>
                <p><strong>Address:</strong> {account}</p>
                <p><strong>Network:</strong> {network}</p>
              </>
            ) : (
              <>
                <p>Not connected</p>
                <button onClick={connectWallet}>Connect Wallet</button>
              </>
            )}
          </div>

          <div className="section">
            <h3>Contract</h3>
            <p>{CONTRACT_ADDRESS}</p>
          </div>

          <div className="section">
            <h3>Counter</h3>
            <p className="count-display">{count}</p>
            <div className="flex-controls">
              <button disabled={!account || network !== 'Ethereum Sepolia'} onClick={() => fetchCount()}>
                Refresh / Read
              </button>
              
              <select 
                value={simMode} 
                onChange={(e) => setSimMode(e.target.value as SimulationMode)}
                style={{ padding: '0.4rem', borderRadius: '4px' }}
              >
                <option value="NONE">Live Network (Real RPCs)</option>
                <option value="HEALTHY">Simulate: Healthy (3/3)</option>
                <option value="INCONSISTENT_RPC">Simulate: 1 Inconsistent</option>
                <option value="RPC_FAILURE">Simulate: 1 RPC Failure</option>
                <option value="NO_CONSENSUS">Simulate: No Consensus</option>
              </select>
            </div>
          </div>

          <div className="section">
            <h3>Transaction</h3>
            <button 
              onClick={incrementCounter} 
              disabled={!account || network !== 'Ethereum Sepolia' || simMode !== 'NONE'}
            >
              Increment Counter
            </button>
            {txHash && (
              <div className="tx-box">
                <p style={{ margin: '0 0 0.5rem 0', wordBreak: 'break-all' }}><strong>Hash:</strong> {txHash}</p>

                {txStatus && (
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    <strong>Status:</strong> 
                    <span style={{ marginLeft: '0.5rem', fontWeight: 'bold', color: txStatus === 'CONFIRMED' ? '#4ade80' : txStatus === 'PENDING' ? '#fbbf24' : '#f87171' }}>
                      {txStatus}
                    </span>
                  </p>
                )}
                {txBlock && <p style={{ margin: '0 0 0.5rem 0' }}><strong>Block:</strong> {txBlock}</p>}
                {txObservers.length > 0 && <p style={{ margin: 0 }}><strong>Receipt observed by:</strong> {txObservers.join(', ')}</p>}
              </div>
            )}
            {txError && (
              <p className="error-text" style={{ marginTop: '0.5rem' }}>
                {txError}
              </p>
            )}
          </div>

          {rpcResults.length > 0 && (
            <div className={`section rpc-health ${consensusResult?.state === 'CONSENSUS' && (!consensusResult.outliers || consensusResult.outliers.length === 0) ? 'rpc-healthy' : 'rpc-critical'}`}>
              <h3>RPC HEALTH</h3>
              <table className="rpc-table">
                <tbody>
                  {rpcResults.map((r) => (
                    <tr key={r.id} className={r.success ? 'rpc-row-healthy' : 'rpc-row-critical'}>
                      <td><strong>{r.id}</strong></td>
                      <td>{r.success ? '✓ OK' : '⚠ ERR'}</td>
                      <td>{r.latencyMs} ms</td>
                      <td>{r.success ? `value: ${r.value}` : 'failed'}</td>
                      <td className="block-num">{r.blockNumber ? `block: ${r.blockNumber}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="consensus-box">
                <h4>CONSENSUS</h4>
                {consensusResult?.state === 'CONSENSUS' && (
                  <>
                    <p>{consensusResult.outliers ? '⚠' : '✓'} {consensusResult.agreement} RPCs agree</p>
                    <p><strong>Value: {consensusResult.value?.toString()}</strong></p>
                    {consensusResult.outliers && (
                      <p className="warning-text">{consensusResult.outliers.join(', ')} appears inconsistent</p>
                    )}
                  </>
                )}
                
                {consensusResult?.state === 'NO_CONSENSUS' && (
                  <p className="error-text">🔴 NO RPC CONSENSUS</p>
                )}

                {consensusResult?.state === 'RPC_UNAVAILABLE' && (
                  <p className="error-text">🔴 ALL RPCS UNAVAILABLE</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
      <div className="footer-text">Made By Prabhat Kumar Jha and Shubhi Misra |</div>
    </div>
  )
}

export default App

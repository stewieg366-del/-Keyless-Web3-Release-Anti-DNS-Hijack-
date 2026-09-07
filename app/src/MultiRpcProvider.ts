import { ethers } from 'ethers';
import { RPC_CONFIG } from './rpcConfig';
import type { RpcReadResult } from './ConsensusEngine';
import { simulateMultiRpcRead, type SimulationMode } from './Simulation';

export const multiRpcRead = async (
  contractAddress: string,
  abi: any,
  methodName: string,
  args: any[] = [],
  simMode: SimulationMode = 'NONE'
): Promise<RpcReadResult[]> => {
  if (simMode !== 'NONE') {
    return simulateMultiRpcRead(simMode);
  }

  const promises = RPC_CONFIG.map(async (endpoint) => {
    const startTime = Date.now();
    const result: RpcReadResult = {
      id: endpoint.id,
      url: endpoint.url,
      success: false,
      latencyMs: 0,
    };

    try {
      const provider = new ethers.JsonRpcProvider(endpoint.url);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      
      const [value, blockNumber] = await Promise.all([
        contract[methodName](...args),
        provider.getBlockNumber()
      ]);

      result.success = true;
      result.value = value;
      result.blockNumber = blockNumber;
    } catch (err: any) {
      result.success = false;
      result.error = err.message || String(err);
    } finally {
      result.latencyMs = Date.now() - startTime;
    }
    
    return result;
  });

  return Promise.all(promises);
};

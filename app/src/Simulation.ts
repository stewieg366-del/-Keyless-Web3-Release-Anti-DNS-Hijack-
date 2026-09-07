import type { RpcReadResult } from './ConsensusEngine';

export type SimulationMode = 'NONE' | 'HEALTHY' | 'INCONSISTENT_RPC' | 'RPC_FAILURE' | 'NO_CONSENSUS';

export const simulateMultiRpcRead = async (mode: SimulationMode): Promise<RpcReadResult[]> => {
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
  
  // Base healthy nodes
  const rpc1: RpcReadResult = { id: 'RPC_1', url: 'sim://node1', success: true, value: 7n, blockNumber: 6628000, latencyMs: 120 };
  const rpc2: RpcReadResult = { id: 'RPC_2', url: 'sim://node2', success: true, value: 7n, blockNumber: 6628000, latencyMs: 145 };
  const rpc3: RpcReadResult = { id: 'RPC_3', url: 'sim://node3', success: true, value: 7n, blockNumber: 6628000, latencyMs: 160 };

  await delay(200); // Simulate network time

  switch (mode) {
    case 'HEALTHY':
      return [rpc1, rpc2, rpc3];
    
    case 'INCONSISTENT_RPC':
      return [
        rpc1,
        rpc2,
        { ...rpc3, value: 999n, latencyMs: 190 }
      ];
      
    case 'RPC_FAILURE':
      return [
        { ...rpc1, success: false, error: 'TIMEOUT', latencyMs: 3000, value: undefined, blockNumber: undefined },
        rpc2,
        rpc3
      ];
      
    case 'NO_CONSENSUS':
      return [
        rpc1,
        { ...rpc2, value: 999n },
        { ...rpc3, value: 123n }
      ];
      
    default:
      return [];
  }
};

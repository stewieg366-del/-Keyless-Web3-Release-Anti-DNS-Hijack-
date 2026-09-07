export interface RpcReadResult {
  id: string;
  url: string;
  success: boolean;
  value?: any;
  latencyMs: number;
  error?: string;
  blockNumber?: number;
}

export type ConsensusState = 'CONSENSUS' | 'INCONSISTENT' | 'NO_CONSENSUS' | 'RPC_UNAVAILABLE';

export interface ConsensusResult {
  state: ConsensusState;
  value?: any;
  agreement?: string;
  outliers?: string[];
}

export function determineConsensus(results: RpcReadResult[], totalExpected: number): ConsensusResult {
  const successes = results.filter(r => r.success);
  
  if (successes.length === 0) {
    return { state: 'RPC_UNAVAILABLE' };
  }

  // Count occurrences of each value (converting to string for comparison)
  const valueCounts = new Map<string, { count: number, originalValue: any, ids: string[] }>();
  
  successes.forEach(res => {
    const key = typeof res.value === 'bigint' ? res.value.toString() : JSON.stringify(res.value);
    if (!valueCounts.has(key)) {
      valueCounts.set(key, { count: 0, originalValue: res.value, ids: [] });
    }
    const entry = valueCounts.get(key)!;
    entry.count++;
    entry.ids.push(res.id);
  });

  let maxCount = 0;
  let majorityKey: string | null = null;
  
  for (const [key, entry] of valueCounts.entries()) {
    if (entry.count > maxCount) {
      maxCount = entry.count;
      majorityKey = key;
    }
  }

  const majorityRequired = Math.floor(totalExpected / 2) + 1;
  
  if (maxCount >= majorityRequired) {
    const entry = valueCounts.get(majorityKey!)!;
    const outliers = results
      .filter(r => !entry.ids.includes(r.id) && r.success)
      .map(r => r.id);
      
    // If there is a majority, the state is CONSENSUS.
    return {
      state: 'CONSENSUS',
      value: entry.originalValue,
      agreement: `${maxCount}/${totalExpected}`,
      outliers: outliers.length > 0 ? outliers : undefined
    };
  }
  
  // No majority
  if (valueCounts.size > 1) {
    // If there is an explicit tie (e.g. 2 vs 2) or complete disagreement (1 vs 1 vs 1),
    // we return NO_CONSENSUS to match the user's 3-way disagreement example.
    // INCONSISTENT could be used for specific divergence cases later.
    return { state: 'NO_CONSENSUS' };
  } else {
    // We have 1 value, but it doesn't meet the majority threshold (e.g. 1/3 successes)
    return { state: 'NO_CONSENSUS' };
  }
}

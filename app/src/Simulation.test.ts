import { simulateMultiRpcRead } from './Simulation';
import type { SimulationMode } from './Simulation';

const runSimTests = async () => {
  const modes: SimulationMode[] = ['HEALTHY', 'INCONSISTENT_RPC', 'RPC_FAILURE', 'NO_CONSENSUS'];
  
  for (const mode of modes) {
    const results = await simulateMultiRpcRead(mode);
    console.log(`\n--- CASE: ${mode} ---`);
    console.log(results.map(r => `${r.id} -> ${r.success ? (r.value !== undefined ? r.value.toString() : 'undef') : (r.error || 'timeout')}`));
  }
};

runSimTests();

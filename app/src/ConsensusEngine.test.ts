import { determineConsensus } from './ConsensusEngine';
import type { RpcReadResult } from './ConsensusEngine';

const createResult = (id: string, success: boolean, value?: any): RpcReadResult => ({
  id,
  url: `http://${id}`,
  success,
  value,
  latencyMs: 100
});

const runTests = () => {
  console.log("--- 1. 3/3 agreement ---");
  console.log(determineConsensus([
    createResult('RPC1', true, 7),
    createResult('RPC2', true, 7),
    createResult('RPC3', true, 7),
  ], 3));

  console.log("\n--- 2. 2/3 majority ---");
  console.log(determineConsensus([
    createResult('RPC1', true, 7),
    createResult('RPC2', true, 7),
    createResult('RPC3', true, 999),
  ], 3));

  console.log("\n--- 3. no majority (3 different) ---");
  console.log(determineConsensus([
    createResult('RPC1', true, 7),
    createResult('RPC2', true, 999),
    createResult('RPC3', true, 123),
  ], 3));

  console.log("\n--- 4. one RPC failure (2 agree) ---");
  console.log(determineConsensus([
    createResult('RPC1', true, 7),
    createResult('RPC2', true, 7),
    createResult('RPC3', false),
  ], 3));
  
  console.log("\n--- 4b. one RPC failure (2 disagree) ---");
  console.log(determineConsensus([
    createResult('RPC1', true, 7),
    createResult('RPC2', true, 999),
    createResult('RPC3', false),
  ], 3));

  console.log("\n--- 5. two RPC failures (1 success) ---");
  console.log(determineConsensus([
    createResult('RPC1', true, 7),
    createResult('RPC2', false),
    createResult('RPC3', false),
  ], 3));

  console.log("\n--- 6. all RPCs unavailable ---");
  console.log(determineConsensus([
    createResult('RPC1', false),
    createResult('RPC2', false),
    createResult('RPC3', false),
  ], 3));
};

runTests();

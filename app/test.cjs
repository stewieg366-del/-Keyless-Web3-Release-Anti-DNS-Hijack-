const fs = require('fs');
const content = fs.readFileSync('./src/ConsensusEngine.ts', 'utf8');
const transformed = content.replace(/export type.*?;/g, '').replace(/export interface.*?}/gs, '').replace(/export function/g, 'function').replace(/:\s\w+\[\]/g, '').replace(/:\s\w+/g, '').replace(/<.*?>/g, '').replace(/ as any/g, '');

eval(transformed);

const createResult = (id, success, value) => ({ id, url: `http://${id}`, success, value, latencyMs: 100 });

console.log("--- 1. 3/3 agreement ---");
console.log(determineConsensus([createResult('RPC1', true, 7), createResult('RPC2', true, 7), createResult('RPC3', true, 7)], 3));

console.log("\n--- 2. 2/3 majority ---");
console.log(determineConsensus([createResult('RPC1', true, 7), createResult('RPC2', true, 7), createResult('RPC3', true, 999)], 3));

console.log("\n--- 3. no majority ---");
console.log(determineConsensus([createResult('RPC1', true, 7), createResult('RPC2', true, 999), createResult('RPC3', true, 123)], 3));

console.log("\n--- 4. one RPC failure ---");
console.log(determineConsensus([createResult('RPC1', true, 7), createResult('RPC2', true, 7), createResult('RPC3', false)], 3));

console.log("\n--- 5. two RPC failures ---");
console.log(determineConsensus([createResult('RPC1', true, 7), createResult('RPC2', false), createResult('RPC3', false)], 3));

console.log("\n--- 6. all RPCs unavailable ---");
console.log(determineConsensus([createResult('RPC1', false), createResult('RPC2', false), createResult('RPC3', false)], 3));

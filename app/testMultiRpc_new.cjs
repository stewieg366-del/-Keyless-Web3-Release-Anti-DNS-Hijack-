const { ethers } = require('ethers');
const fs = require('fs');

const RPC_CONFIG = [
  { id: 'RPC_1', url: "https://ethereum-sepolia-rpc.publicnode.com" },
  { id: 'RPC_2', url: "https://sepolia.drpc.org" },
  { id: 'RPC_3', url: "https://gateway.tenderly.co/public/sepolia" }
];

const CONTRACT_ADDRESS = '0xaf8ce8203A15795cAA6C92b10B10e351c05dBb0F';
const abi = JSON.parse(fs.readFileSync('./src/contracts/PS2Counter.json', 'utf8'));

async function test() {
  const promises = RPC_CONFIG.map(async (endpoint) => {
    const startTime = Date.now();
    const result = { id: endpoint.id, url: endpoint.url, success: false, latencyMs: 0 };
    try {
      const provider = new ethers.JsonRpcProvider(endpoint.url);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
      const [value, blockNumber] = await Promise.all([
        contract.count(),
        provider.getBlockNumber()
      ]);
      result.success = true;
      result.value = value.toString();
      result.blockNumber = blockNumber;
    } catch (err) {
      result.success = false;
      result.error = err.code || err.message;
    } finally {
      result.latencyMs = Date.now() - startTime;
    }
    return result;
  });

  const results = await Promise.all(promises);
  console.log(JSON.stringify(results, null, 2));
}

test();

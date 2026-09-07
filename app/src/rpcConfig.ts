export interface RpcEndpoint {
  id: string;
  url: string;
}

export const SEPOLIA_CHAIN_ID = 11155111;

export const RPC_CONFIG: RpcEndpoint[] = [
  {
    id: 'RPC_1',
    url: import.meta.env.VITE_RPC_1 || "https://ethereum-sepolia-rpc.publicnode.com",
  },
  {
    id: 'RPC_2',
    url: import.meta.env.VITE_RPC_2 || "https://rpc.sepolia.ethpandaops.io",
  },
  {
    id: 'RPC_3',
    url: import.meta.env.VITE_RPC_3 || "https://gateway.tenderly.co/public/sepolia",
  }
].filter(endpoint => endpoint.url && endpoint.url.trim() !== "");

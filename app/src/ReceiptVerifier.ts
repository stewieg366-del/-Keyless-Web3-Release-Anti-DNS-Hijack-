import { JsonRpcProvider } from 'ethers';
import type { RpcEndpoint } from './rpcConfig';

export type ReceiptStatus = 'PENDING' | 'CONFIRMED' | 'REVERTED' | 'RECEIPT_INCONSISTENT';

export interface ReceiptVerificationResult {
    status: ReceiptStatus;
    blockNumber?: number;
    observedBy: string[];
}

export async function verifyReceipt(
    hash: string,
    rpcs: RpcEndpoint[],
    createProvider: (url: string) => any = (url) => new JsonRpcProvider(url)
): Promise<ReceiptVerificationResult> {
    const promises = rpcs.map(async (rpc) => {
        try {
            const provider = createProvider(rpc.url);
            const receipt = await provider.getTransactionReceipt(hash);
            return { rpc: rpc.id, receipt };
        } catch (err) {
            // Network failure for this RPC
            return { rpc: rpc.id, receipt: undefined };
        }
    });

    const results = await Promise.all(promises);
    
    // validReceipts are instances where the RPC successfully responded with a mined receipt
    const validReceipts = results.filter(r => r.receipt !== null && r.receipt !== undefined);
    
    if (validReceipts.length === 0) {
        return { status: 'PENDING', observedBy: [] };
    }

    const first = validReceipts[0].receipt;
    let inconsistent = false;

    for (let i = 1; i < validReceipts.length; i++) {
        const current = validReceipts[i].receipt;
        if (current.status !== first.status || current.blockHash !== first.blockHash) {
            inconsistent = true;
            break;
        }
    }

    const observedBy = validReceipts.map(r => r.rpc);

    if (inconsistent) {
        return { status: 'RECEIPT_INCONSISTENT', observedBy };
    }

    if (first.status === 1) {
        return { status: 'CONFIRMED', blockNumber: first.blockNumber, observedBy };
    } else {
        return { status: 'REVERTED', blockNumber: first.blockNumber, observedBy };
    }
}

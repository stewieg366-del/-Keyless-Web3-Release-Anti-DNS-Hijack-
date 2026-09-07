import { verifyReceipt } from './ReceiptVerifier.js';
import assert from 'assert';

const MOCK_RPCS = [
    { id: 'RPC_1', url: 'url1' },
    { id: 'RPC_2', url: 'url2' },
    { id: 'RPC_3', url: 'url3' }
];

const HASH = '0x123';
const CONFIRMED_RECEIPT = { status: 1, blockHash: '0xabc', blockNumber: 100 };
const REVERTED_RECEIPT = { status: 0, blockHash: '0xabc', blockNumber: 100 };

async function runTests() {
    console.log("--- 1. Receipt found by RPC_1 with status 1 -> CONFIRMED ---");
    {
        const createProvider = (url: string) => ({
            getTransactionReceipt: async () => url === 'url1' ? CONFIRMED_RECEIPT : null
        });
        const res = await verifyReceipt(HASH, MOCK_RPCS, createProvider);
        assert.strictEqual(res.status, 'CONFIRMED');
        assert.deepStrictEqual(res.observedBy, ['RPC_1']);
        console.log("PASS");
    }

    console.log("--- 2. RPC_1 unavailable, RPC_2 finds status 1 -> CONFIRMED ---");
    {
        const createProvider = (url: string) => ({
            getTransactionReceipt: async () => {
                if (url === 'url1') throw new Error('Network error');
                if (url === 'url2') return CONFIRMED_RECEIPT;
                return null;
            }
        });
        const res = await verifyReceipt(HASH, MOCK_RPCS, createProvider);
        assert.strictEqual(res.status, 'CONFIRMED');
        assert.deepStrictEqual(res.observedBy, ['RPC_2']);
        console.log("PASS");
    }

    console.log("--- 3. RPC_1/2 unavailable, RPC_3 finds status 1 -> CONFIRMED ---");
    {
        const createProvider = (url: string) => ({
            getTransactionReceipt: async () => {
                if (url === 'url1' || url === 'url2') throw new Error('Network error');
                return CONFIRMED_RECEIPT;
            }
        });
        const res = await verifyReceipt(HASH, MOCK_RPCS, createProvider);
        assert.strictEqual(res.status, 'CONFIRMED');
        assert.deepStrictEqual(res.observedBy, ['RPC_3']);
        console.log("PASS");
    }

    console.log("--- 4. No RPC has receipt yet -> PENDING ---");
    {
        const createProvider = (_url: string) => ({
            getTransactionReceipt: async () => null
        });
        const res = await verifyReceipt(HASH, MOCK_RPCS, createProvider);
        assert.strictEqual(res.status, 'PENDING');
        console.log("PASS");
    }

    console.log("--- 5. Receipt status 0 -> REVERTED/FAILED ---");
    {
        const createProvider = (_url: string) => ({
            getTransactionReceipt: async () => REVERTED_RECEIPT
        });
        const res = await verifyReceipt(HASH, MOCK_RPCS, createProvider);
        assert.strictEqual(res.status, 'REVERTED');
        console.log("PASS");
    }

    console.log("--- 6. RPCs return consistent receipt -> CONFIRMED ---");
    {
        const createProvider = (_url: string) => ({
            getTransactionReceipt: async () => CONFIRMED_RECEIPT
        });
        const res = await verifyReceipt(HASH, MOCK_RPCS, createProvider);
        assert.strictEqual(res.status, 'CONFIRMED');
        assert.deepStrictEqual(res.observedBy, ['RPC_1', 'RPC_2', 'RPC_3']);
        console.log("PASS");
    }

    console.log("--- 7. RPCs return conflicting receipt information -> RECEIPT_INCONSISTENT ---");
    {
        const createProvider = (url: string) => ({
            getTransactionReceipt: async () => {
                if (url === 'url1') return CONFIRMED_RECEIPT;
                return REVERTED_RECEIPT;
            }
        });
        const res = await verifyReceipt(HASH, MOCK_RPCS, createProvider);
        assert.strictEqual(res.status, 'RECEIPT_INCONSISTENT');
        assert.deepStrictEqual(res.observedBy, ['RPC_1', 'RPC_2', 'RPC_3']);
        console.log("PASS");
    }

    console.log("--- 8. One RPC fails while another successfully returns the receipt ---");
    {
        const createProvider = (url: string) => ({
            getTransactionReceipt: async () => {
                if (url === 'url1') throw new Error('Network error');
                return CONFIRMED_RECEIPT;
            }
        });
        const res = await verifyReceipt(HASH, MOCK_RPCS, createProvider);
        assert.strictEqual(res.status, 'CONFIRMED');
        assert.deepStrictEqual(res.observedBy, ['RPC_2', 'RPC_3']);
        console.log("PASS");
    }

    console.log("--- 9. Normal block-number differences must not cause a false inconsistency ---");
    {
        // RPC 1 returns null (hasn't synced), RPC 2 returns receipt.
        const createProvider = (url: string) => ({
            getTransactionReceipt: async () => {
                if (url === 'url1') return null;
                return CONFIRMED_RECEIPT;
            }
        });
        const res = await verifyReceipt(HASH, MOCK_RPCS, createProvider);
        assert.strictEqual(res.status, 'CONFIRMED');
        assert.deepStrictEqual(res.observedBy, ['RPC_2', 'RPC_3']);
        console.log("PASS");
    }

    console.log("ALL RECEIPT TESTS PASSED.");
}

runTests().catch(console.error);

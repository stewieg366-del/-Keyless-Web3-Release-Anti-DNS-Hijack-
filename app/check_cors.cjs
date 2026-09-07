const https = require('https');

function checkCors(urlStr) {
    const url = new URL(urlStr);
    const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'OPTIONS',
        headers: {
            'Origin': 'http://localhost:5173',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type'
        }
    };

    const req = https.request(options, (res) => {
        console.log(`[${urlStr}] Status: ${res.statusCode} CORS: ${res.headers['access-control-allow-origin']}`);
    });
    
    req.on('error', (e) => {
        console.error(`[${urlStr}] Error: ${e.message}`);
    });
    
    req.end();
}
checkCors('https://rpc.sepolia.ethpandaops.io');
checkCors('https://gateway.tenderly.co/public/sepolia');
checkCors('https://eth-sepolia.public.blastapi.io');
checkCors('https://ethereum-sepolia.blockpi.network/v1/rpc/public');

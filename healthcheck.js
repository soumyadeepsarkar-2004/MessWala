// Minimal test server to verify Railway proxy connectivity
const http = require('http');
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT, time: new Date().toISOString() }));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server listening on 0.0.0.0:${PORT}`);
});

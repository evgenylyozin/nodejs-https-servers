import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('./keys/test-key.pem'),
  cert: fs.readFileSync('./keys/test-cert.pem'),
};

const server = https.createServer(options, (req, res) => {
  console.log(req.url, req.method, req.headers);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ data: 'hello' }));
});

const PORT = '12345';
server.listen(PORT);
server.on('listening', () => {
  console.log(`HTTPS server (http 1.1) is listening on port ${PORT}`);
});

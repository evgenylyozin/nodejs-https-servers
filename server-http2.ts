import http2 from 'http2';
import fs from 'fs';

const options = {
  key: fs.readFileSync('./keys/test-key.pem'),
  cert: fs.readFileSync('./keys/test-cert.pem'),
};

const server = http2.createSecureServer(options);

server.on('stream', (stream, headers) => {
  console.log(headers);
  // stream is a Duplex
  stream.respond({
    'content-type': 'text/html; charset=utf-8',
    ':status': 200,
  });
  stream.end('<h1>Hello World</h1>');
});

const PORT = '54321';
server.listen(PORT);
server.on('listening', () => {
  console.log(`HTTPS (http2) server is listening on port ${PORT}`);
});

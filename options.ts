import fs from 'fs';

export const options = {
  key: fs.readFileSync('./keys/test-key.pem'),
  cert: fs.readFileSync('./keys/test-cert.pem'),
};

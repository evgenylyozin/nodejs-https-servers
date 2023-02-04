import https from 'https';
import fs from 'fs';
import path from 'path';
import {
  createBufferFromRequestBody,
  getBoundary,
  parseMultipartFormData,
  parseFormURLEncodedData,
  saveFileToTheServer,
} from './helpers';
import { options } from './options';

const server = https.createServer(options, async (req, res) => {
  // logging some useful request info
  console.log(req.url, req.method, req.headers);

  if (req.method === 'POST') {
    // working with multipart/form-data including files
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      req.setEncoding('latin1');
      const rawData = await createBufferFromRequestBody(req);
      let boundary = getBoundary(req.headers['content-type']);
      const rawDataArr = rawData.split(boundary);
      const parsedData = parseMultipartFormData(rawDataArr);

      // logging parsed multipart/form-datave
      console.log(parsedData);

      // potentially save files on the server
      // for (let i = 0; i < parsedData.files.length; i++) {
      //   const file = parsedData.files[i];
      //   const stream = fs.createWriteStream(
      //     `./${file.filename}` || `./${i}.file`
      //   );
      //   stream.write(file.data, 'binary');
      //   stream.close();
      // }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: 'multipart/form-data received' }));
      return;
    }

    // working with application/x-www-form-urlencoded data in the request
    if (
      req.headers['content-type']?.includes('application/x-www-form-urlencoded')
    ) {
      const rawData = await createBufferFromRequestBody(req);
      const parsedData = parseFormURLEncodedData(rawData);
      console.log(parsedData);

      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: 'application/x-www-form-urlencoded' }));
      return;
    }

    // working with binary data
    const SomeMimeTypes = ['image/jpeg', 'application/pdf', 'application/zip'];
    if (
      req.headers['content-type'] &&
      SomeMimeTypes.includes(req.headers['content-type'])
    ) {
      req.setEncoding('latin1');
      const type = req.headers['content-type'].split('/')[1];
      await saveFileToTheServer(req, type);

      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: 'binary data received' }));
      return;
    }

    // working with other raw data (text, json, js, html, xml)

    const rawData = createBufferFromRequestBody(req);
    console.log((await rawData).toString());
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        data: 'other raw data like text, json, js, html or xml received',
      })
    );
    return;
  }

  if (req.method === 'GET') {
    if (req.url === '/secured') {
      const token = req.headers['token'];
      if (token && token === 'valid') {
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end('<h1>Secured page</h1>');
        return;
      } else {
        res.writeHead(401, { 'content-type': 'text/html' });
        res.end('<h1>You are unauthorized to see the secured content</h1>');
        return;
      }
    }
    if (req.url === '/getfile') {
      const filePath = path.join(__dirname, '../', 'README.md');
      const stat = fs.statSync(filePath);

      res.writeHead(200, {
        'content-type': 'text/markdown',
        'Content-Length': stat.size,
      });

      return fs.createReadStream(filePath).pipe(res);
    }
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<h1>Hello!</h1>');
    return;
  }

  res.writeHead(405, { 'content-type': 'text/html' });
  res.end(`<h1>Server doesn\'t support method ${req.method}</h1>`);
  return;
});

const PORT = '12345';
server.listen(PORT);
server.on('listening', () => {
  console.log(`HTTPS server (http 1.1) is listening on port ${PORT}`);
});

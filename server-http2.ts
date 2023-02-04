import http2 from 'http2';
import fs from 'fs';
import {
  createBufferFromRequestBody,
  getBoundary,
  parseMultipartFormData,
  parseFormURLEncodedData,
  saveFileToTheServer,
} from './helpers';
import { options } from './options';
import path from 'path';

const server = http2.createSecureServer(options);

server.on('stream', async (stream, headers) => {
  // logging some useful request info
  console.log(headers);

  if (headers[':method'] === 'POST') {
    // working with multipart/form-data including files
    if (headers['content-type']?.includes('multipart/form-data')) {
      stream.setEncoding('latin1');
      const rawData = await createBufferFromRequestBody(stream);
      const boundary = getBoundary(headers['content-type']);
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

      stream.respond({
        'content-type': 'application/json',
        ':status': 200,
      });
      stream.end(JSON.stringify({ data: 'multipart/form-data received' }));
      return;
    }

    // working with application/x-www-form-urlencoded data in the request
    if (
      headers['content-type']?.includes('application/x-www-form-urlencoded')
    ) {
      const rawData = await createBufferFromRequestBody(stream);
      const parsedData = parseFormURLEncodedData(rawData);
      console.log(parsedData);

      stream.respond({
        'content-type': 'application/json',
        ':status': 200,
      });
      stream.end(JSON.stringify({ data: 'application/x-www-form-urlencoded' }));
      return;
    }

    // working with binary data
    const SomeMimeTypes = ['image/jpeg', 'application/pdf', 'application/zip'];
    if (
      headers['content-type'] &&
      SomeMimeTypes.includes(headers['content-type'])
    ) {
      stream.setEncoding('latin1');
      const type = headers['content-type'].split('/')[1];
      await saveFileToTheServer(stream, type);

      stream.respond({
        'content-type': 'application/json',
        ':status': 200,
      });
      stream.end(JSON.stringify({ data: 'binary data received' }));
      return;
    }
    // working with other raw data (text, json, js, html, xml)
    const rawData = createBufferFromRequestBody(stream);
    console.log((await rawData).toString());
    stream.respond({
      'content-type': 'application/json',
      ':status': 200,
    });
    stream.end(
      JSON.stringify({
        data: 'other raw data like text, json, js, html or xml received',
      })
    );
    return;
  }

  if (headers[':method'] === 'GET') {
    if (headers[':path'] === '/secured') {
      const token = headers['token'];
      if (token && token === 'valid') {
        stream.respond({
          'content-type': 'text/html',
          ':status': 200,
        });
        stream.end('<h1>Secured page</h1>');
        return;
      } else {
        stream.respond({
          'content-type': 'text/html',
          ':status': 401,
        });
        stream.end('<h1>You are unauthorized to see the secured content</h1>');
        return;
      }
    }
    if (headers[':path'] === '/getfile') {
      const filePath = path.join(__dirname, '../', 'README.md');
      const stat = fs.statSync(filePath);

      stream.respond({
        'content-type': 'text/markdown',
        'Content-Length': stat.size,
        ':status': 200,
      });

      return fs.createReadStream(filePath).pipe(stream);
    }

    stream.respond({
      'content-type': 'text/html',
      ':status': 200,
    });
    stream.end('<h1>Hello!</h1>');
    return;
  }

  stream.respond({
    'content-type': 'text/html',
    ':status': 405,
  });
  stream.end(`<h1>Server doesn\'t support method ${headers[':method']}</h1>`);
  return;
});

const PORT = '54321';
server.listen(PORT);
server.on('listening', () => {
  console.log(`HTTPS (http2) server is listening on port ${PORT}`);
});

import https from 'https';
import fs from 'fs';
import { IncomingMessage } from 'http';

const options = {
  key: fs.readFileSync('./keys/test-key.pem'),
  cert: fs.readFileSync('./keys/test-cert.pem'),
};

const createBufferFromRequestBody = (request: IncomingMessage) => {
  return new Promise<string>((resolve) => {
    let data = '';
    request.on('data', (chunk) => {
      data += chunk;
    });
    request.on('end', () => {
      resolve(data);
    });
  });
};

const saveFileToTheServer = (request: IncomingMessage, type: string) => {
  return new Promise<boolean>((resolve) => {
    let data = '';
    request.on('data', (chunk) => {
      data += chunk;
    });
    request.on('end', () => {
      const stream = fs.createWriteStream(`./SavedBinaryFile.${type}`);
      stream.write(data, 'binary');
      stream.close();
      resolve(true);
    });
  });
};

const getBoundary = (contentType: string) => {
  const parts = contentType.split('boundary=');
  return parts[parts.length - 1];
};

const getMatching = (item: string, regex: RegExp) => {
  const match = item.match(regex);
  if (match) {
    return match[1];
  }
  return null;
};

type DataObject = {
  files: FileObject[];
  [key: string]: string | FileObject[];
};

type FileObject = { filename?: string; contentType?: string; data: string };

const parseMultipartFormData = (data: string[]) => {
  let dataObj: DataObject = { files: [] };

  for (let item of data) {
    const name = getMatching(item, /(?:name=")(.+?)(?:")/);
    if (!name) continue;
    const value = getMatching(item, /(?:\r\n\r\n)([\S\s]*)(?:\r\n--$)/);
    if (!value) continue;
    // possible files
    let filename = getMatching(item, /(?:filename=")(.*?)(?:")/);
    let contentType = getMatching(item, /(?:Content-Type:)(.*?)(?:\r\n)/);
    let fileObj: FileObject = { filename: '', contentType: '', data: '' };
    if (filename) {
      fileObj.filename = filename;
    }
    if (contentType) {
      fileObj.contentType = contentType;
    }
    if (filename || contentType) {
      fileObj.data = value;
      dataObj.files.push(fileObj);
      continue;
    }

    dataObj[name] = value;
  }

  return dataObj;
};

const parseFormURLEncodedData = (data: string) => {
  const dataObj: DataObject = { files: [] };
  const keyValuePairs = data.split('&');
  for (let pair of keyValuePairs) {
    const [key, value] = pair.split('=');
    dataObj[key] = value;
  }
  return dataObj;
};

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

      res.writeHead(200, { 'Content-Type': 'application/json' });
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

      res.writeHead(200, { 'Content-Type': 'application/json' });
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

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data: 'binary data received' }));
      return;
    }

    // working with other raw data (text, json, js, html, xml)

    const rawData = createBufferFromRequestBody(req);
    console.log((await rawData).toString());
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        data: 'other raw data like text, json, js, html or xml received',
      })
    );
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Hello!</h1>');
    return;
  }

  res.writeHead(405, { 'Content-Type': 'text/html' });
  res.end(`<h1>Server doesn\'t support method ${req.method}</h1>`);
  return;
});

const PORT = '12345';
server.listen(PORT);
server.on('listening', () => {
  console.log(`HTTPS server (http 1.1) is listening on port ${PORT}`);
});

import fs from 'fs';
import { IncomingMessage } from 'http';
import { Http2Stream } from 'http2';

import { DataObject, FileObject } from './types';

export const createBufferFromRequestBody = (
  request: IncomingMessage | Http2Stream
) => {
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

export const saveFileToTheServer = (
  request: IncomingMessage | Http2Stream,
  type: string
) => {
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

export const getBoundary = (contentType: string) => {
  const parts = contentType.split('boundary=');
  return parts[parts.length - 1];
};

export const getMatching = (item: string, regex: RegExp) => {
  const match = item.match(regex);
  if (match) {
    return match[1];
  }
  return null;
};

export const parseMultipartFormData = (data: string[]) => {
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

export const parseFormURLEncodedData = (data: string) => {
  const dataObj: DataObject = { files: [] };
  const keyValuePairs = data.split('&');
  for (let pair of keyValuePairs) {
    const [key, value] = pair.split('=');
    dataObj[key] = value;
  }
  return dataObj;
};

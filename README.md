# HTTPS servers (http 1.1, http 2) based on nodejs

Simple https server (http 1.1) nodejs setup to practice some frontend <-> backend interactions (server.ts):

- get and post requests with different headers and payload data
- responses with different headers and payload
- identification and authentication
- etc

Simple https server (http 2) nodejs setup to practice some frontend <-> backend interactions (server-http2.ts):

- get and post requests with different headers and payload data
- responses with different headers and payload
- identification and authentication
- etc

## openssl key and cert were created with the following command

```bash
openssl req -x509 -newkey rsa:4096 -keyout ./keys/test-key.pem -out ./keys/test-cert.pem -sha256 -days 36500 -nodes -subj '/CN=localhost'
```

## To start http 1.1 server

```bash
    npm run start-http1
```

## To start http 2 server

```bash
    npm run start-http2
```

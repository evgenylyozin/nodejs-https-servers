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

## To query http 2 server with curl

```bash
curl --location --request GET 'https://localhost:54321' --http2 --insecure
```

## If Postman is used to tinker with the servers

Postman currently doesn't support http2, use curl:

- create a request in postman
- click "</>" to see the curl command
- add --http2 --insecure to the end of it and execute via terminal

const https = require('https');

// No "runtime: edge" config here — this runs as a standard Node.js
// Serverless Function, which allows full control over request headers
// (including Host) and TLS servername, unlike the Edge Runtime's
// fetch() implementation (which forbids overriding the Host header).

const SENDGRID_HOST = 'sendgrid.net';
const YOUR_DOMAIN = 'url3059.bequesta.ca'; // <-- update if your branded subdomain differs

module.exports = (req, res) => {
  const options = {
    hostname: SENDGRID_HOST,
    servername: SENDGRID_HOST, // forces TLS to validate the cert against sendgrid.net,
                                // independent of the Host header we send below
    port: 443,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: YOUR_DOMAIN, // explicitly set so SendGrid recognizes the branded domain
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    res.statusCode = 502;
    res.end('Proxy error: ' + err.message);
  });
};

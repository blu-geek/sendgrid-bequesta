const https = require('https');

// No "runtime: edge" config here — this runs as a standard Node.js
// Serverless Function, which allows full control over request headers
// (including Host) and TLS servername, unlike the Edge Runtime's
// fetch() implementation (which forbids overriding the Host header).

const SENDGRID_HOST = 'sendgrid.net';
const YOUR_DOMAIN = 'url3059.bequesta.ca'; // <-- update if your branded subdomain differs

// Headers that must NOT be blindly forwarded to the outbound request —
// these are either connection-specific, will be recalculated automatically,
// or can contain values that cause Node to throw on the new request.
const STRIP_HEADERS = [
  'host',
  'connection',
  'content-length',
  'content-encoding',
  'transfer-encoding',
  'x-vercel-id',
  'x-vercel-deployment-url',
  'x-forwarded-host',
  'x-forwarded-proto',
];

module.exports = (req, res) => {
  try {
    const cleanHeaders = {};
    for (const [key, value] of Object.entries(req.headers || {})) {
      const lowerKey = key.toLowerCase();
      // Drop anything in the strip list, and any HTTP/2 pseudo-headers
      // (e.g. ":authority", ":path") which are invalid on outbound
      // Node http/https requests and will cause a crash if forwarded.
      if (STRIP_HEADERS.includes(lowerKey) || lowerKey.startsWith(':')) {
        continue;
      }
      cleanHeaders[key] = value;
    }
    cleanHeaders['host'] = YOUR_DOMAIN;

    const options = {
      hostname: SENDGRID_HOST,
      servername: SENDGRID_HOST, // forces TLS to validate the cert against sendgrid.net,
                                  // independent of the Host header we send below
      port: 443,
      path: req.url,
      method: req.method,
      headers: cleanHeaders,
    };

    const proxyReq = https.request(options, (proxyRes) => {
      try {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      } catch (err) {
        console.error('Error writing proxied response:', err);
        if (!res.headersSent) {
          res.statusCode = 502;
        }
        res.end('Proxy response error: ' + err.message);
      }
    });

    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      if (!res.headersSent) {
        res.statusCode = 502;
      }
      res.end('Proxy error: ' + err.message);
    });

    if (req.method === 'GET' || req.method === 'HEAD') {
      proxyReq.end();
    } else {
      req.pipe(proxyReq, { end: true });
    }
  } catch (err) {
    console.error('Unhandled proxy error:', err);
    res.statusCode = 500;
    res.end('Unhandled proxy error: ' + err.message);
  }
};

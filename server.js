const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const detect = require('detect-port');

const app = express();
const DEFAULT_PORT = process.env.PORT || 3002;

// Serve static files from the "cmd" directory
app.use(express.static(path.join(__dirname, 'cmd')));

// Middleware to modify the response
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === 'string') {
      // Inject CSS to rotate the page
      body = body.replace('</head>', `
        <style>
          body {
            transform: rotate(90deg);
            transform-origin: top left;
            width: 100vh;
            overflow-x: hidden;
          }
        </style>
        </head>
      `);
    }
    originalSend.call(this, body);
  };
  next();
});

// Proxy middleware to handle requests to tiktok.com
app.use('/en', createProxyMiddleware({
  target: 'https://www.tiktok.com',
  changeOrigin: true,
  pathRewrite: {
    '^/en': '/en', // Rewrite the path
  },
  onProxyReq: (proxyReq, req, res) => {
    // Modify headers
    proxyReq.setHeader('Content-Security-Policy', "script-src 'self'");
    proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
  }
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'cmd', 'index.html'));
});

// Add a route to handle requests to /explore
app.get('/explore', (req, res) => {
  res.sendFile(path.join(__dirname, 'cmd', 'explore.html'));
});

// Example of using Object.assign
const obj1 = { a: 1 };
const obj2 = { b: 2 };
const result = Object.assign(obj1, obj2);
console.log(result); // Output: { a: 1, b: 2 }

// Detect an open port and start the server
detect(DEFAULT_PORT, (err, openPort) => {
  if (err) {
    console.error(err);
    return;
  }
  if (DEFAULT_PORT !== openPort) {
    console.log(`Port ${DEFAULT_PORT} is in use, switching to port ${openPort}`);
  }
  app.listen(openPort, () => {
    console.log(`Server is running on port ${openPort}`);
  });
});
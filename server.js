const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
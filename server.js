const http = require('http');
const fs = require('fs');
const path = require('path');
const contactHandler = require('./api/contact');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // 1. Handle API Route /api/contact
  if (pathname === '/api/contact' || pathname === '/api/contact/') {
    // Collect body
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
      if (bodyData.length > 1e6) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (err) {
        req.body = bodyData;
      }

      // Polyfill res.status and res.json for Vercel handler compatibility
      res.status = function(code) {
        res.statusCode = code;
        return res;
      };
      res.json = function(data) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
      };

      try {
        await contactHandler(req, res);
      } catch (apiError) {
        console.error('[API Error]:', apiError);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: 'Internal Server Error' }));
        }
      }
    });
    return;
  }

  // 2. Static File Resolution
  let targetPath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);

  // Clean URLs: check if target exists without extension or as .html
  if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
    if (fs.existsSync(targetPath + '.html')) {
      targetPath = targetPath + '.html';
    } else if (fs.existsSync(path.join(targetPath, 'index.html'))) {
      targetPath = path.join(targetPath, 'index.html');
    }
  }

  // Prevent directory traversal
  if (!targetPath.startsWith(ROOT_DIR)) {
    res.statusCode = 403;
    res.end('403 Forbidden');
    return;
  }

  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    const stream = fs.createReadStream(targetPath);
    stream.pipe(res);
  } else {
    // 404 Fallback to index.html or 404
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h1>404 Not Found</h1><p>The page <code>${pathname}</code> was not found.</p><p><a href="/">Return Home</a></p></body></html>`);
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Sincerely You Are Significant, Inc. - Local Web Server`);
  console.log(` Local preview: http://localhost:${PORT}`);
  console.log(` Network preview: http://127.0.0.1:${PORT}`);
  console.log(`=======================================================`);
});

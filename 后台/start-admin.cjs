const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = __dirname;
const host = '127.0.0.1';
const startPort = Number(process.env.CAMP_ADMIN_PORT || 19098);
const maxPort = startPort + 80;
const API_TARGET = 'http://localhost:8080';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4'
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const relative = clean === '/' ? 'admin/index.html' : clean.replace(/^\/+/, '');
  const full = path.resolve(root, relative);
  if (!full.startsWith(root)) return null;
  return full;
}

function proxyRequest(request, response) {
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: request.url,
    method: request.method,
    headers: {
      ...request.headers,
      host: 'localhost:8080'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Forward CORS headers for cross-origin requests
    response.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(response);
  });

  proxyReq.on('error', () => {
    response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ code: 502, msg: '后端服务未启动' }));
  });

  request.pipe(proxyReq);
}

function createServer() {
  return http.createServer((request, response) => {
    // Proxy API requests to Spring Boot
    if (request.url.startsWith('/api/')) {
      proxyRequest(request, response);
      return;
    }

    const filePath = safePath(request.url || '/');
    if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
      response.end('404 Not Found');
      return;
    }

    const stat = fs.statSync(filePath);
    response.writeHead(200, {
      'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  });
}

function listen(port) {
  const server = createServer();
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && port < maxPort) listen(port + 1);
    else {
      console.error(`后台服务启动失败：${error.message}`);
      process.exit(1);
    }
  });
  server.listen(port, host, () => {
    const url = `http://${host}:${port}/admin/index.html?v=final`;
    console.log(`最终版后台已启动：${url}`);
    console.log(`API 代理指向：${API_TARGET}`);
    spawn('cmd', ['/c', 'start', 'Camp Admin Final', url], { detached: true, stdio: 'ignore' }).unref();
  });
}

listen(startPort);

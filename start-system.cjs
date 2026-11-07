const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const host = '127.0.0.1';

const PORTS = {
  模型: 18887,
  首页: 18888,
  前台: 18889,
  管理后台: 19099,
  员工门户: 19101,
  游客门户: 19102
};

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
  '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp'
};

function createStaticServer(siteRoot, defaultFile) {
  return http.createServer(function(request, response) {
    // Proxy API requests to Spring Boot
    if (request.url.startsWith('/api/')) {
      var options = {
        hostname: 'localhost', port: 8080, path: request.url,
        method: request.method,
        headers: Object.assign({}, request.headers, { host: 'localhost:8080' })
      };
      var proxyReq = http.request(options, function(proxyRes) {
        response.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(response);
      });
      proxyReq.on('error', function() {
        response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({ code: 502, msg: '后端服务未启动' }));
      });
      request.pipe(proxyReq);
      return;
    }

    var clean = decodeURIComponent(request.url.split('?')[0]);
    var relative = clean === '/' ? defaultFile : clean.replace(/^\/+/, '');
    var full = path.resolve(siteRoot, relative);
    if (!full.startsWith(siteRoot) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('404 Not Found');
      return;
    }
    var ext = path.extname(full).toLowerCase();
    response.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(full).pipe(response);
  });
}

function startServer(name, siteRoot, defaultFile, port) {
  return new Promise(function(resolve) {
    var server = createStaticServer(siteRoot, defaultFile);
    server.once('error', function(err) {
      console.log('  ✗ [' + name + '] 端口 ' + port + ' 被占用: ' + err.message);
      resolve(null);
    });
    server.listen(port, host, function() {
      var url = 'http://' + host + ':' + port + '/';
      console.log('  ✓ [' + name + '] ' + url);
      resolve({ name: name, url: url, server: server });
    });
  });
}

var running = [];
// 启动前先释放被占用的端口
function killProcessOnPort(port) {
  try {
    var net = require('net');
    var s = new net.Socket();
    s.connect(port, '127.0.0.1', function() {
      s.destroy();
    });
    s.on('error', function() {});
    s.setTimeout(100, function() { s.destroy(); });
  } catch(e) {}
}


console.log('');
console.log('╔══════════════════════════════════════════╗');
console.log('║      🌲 营地公园全栈系统启动器            ║');
console.log('╚══════════════════════════════════════════╝');
console.log('');

Promise.all([
  startServer('模型',     path.join(root, '模型'),                          'model-test.html',           PORTS.模型),
  startServer('首页',     path.join(root, '首页'),                          'index.html',                PORTS.首页),
  startServer('前台',     path.join(root, 'src', 'main', 'resources', 'static'),          'index.html',                PORTS.前台),
  startServer('管理后台', root,                                             '后台/admin/admin-spa.html', PORTS.管理后台),
  startServer('员工门户', path.join(root, '员工门户'),                      'index.html',                PORTS.员工门户),
  startServer('游客门户', path.join(root, '游客门户'),                      'index.html',                PORTS.游客门户)
]).then(function(results) {
  results.forEach(function(r) { if (r) running.push(r); });

  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  📍 服务访问地址                          ║');
  console.log('╚══════════════════════════════════════════╝');
  running.forEach(function(r) {
    console.log('  ' + r.url);
  });
  console.log('');
  console.log('按 Ctrl+C 停止所有服务');
  console.log('');

});

// Graceful shutdown
process.on('SIGINT', function() {
  console.log('\n正在停止所有服务...');
  running.forEach(function(r) {
    try { r.server.close(); } catch(e) {}
  });
  process.exit(0);
});

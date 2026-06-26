const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const dataFile = path.join(root, 'data', 'db.json');
const port = Number(process.env.PORT || 8787);
const host = '127.0.0.1';
const sessions = new Map();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.wasm': 'application/wasm',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.skp': 'application/octet-stream'
};

function readDb() {
  return JSON.parse(fs.readFileSync(dataFile, 'utf8').replace(/^\uFEFF/, ''));
}

function writeDb(db) {
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2), 'utf8');
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-cache'
  });
  response.end(body);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) reject(new Error('请求体过大'));
    });
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('JSON 格式错误'));
      }
    });
  });
}

function getCookie(request, name) {
  const cookie = request.headers.cookie || '';
  return cookie.split(';').map(item => item.trim()).find(item => item.startsWith(`${name}=`))?.split('=')[1];
}

function isAuthed(request) {
  const token = getCookie(request, 'camp_session');
  return token && sessions.has(token);
}

function requireAuth(request, response) {
  if (isAuthed(request)) return true;
  sendJson(response, 401, { error: '未登录或会话已过期' });
  return false;
}

function makeId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const fullPath = path.resolve(root, relative);
  if (!fullPath.startsWith(root)) return null;
  return fullPath;
}

async function handleApi(request, response, pathname) {
  try {
    const db = readDb();

    if (request.method === 'GET' && pathname === '/api/public') {
      sendJson(response, 200, db);
      return;
    }

    if (request.method === 'POST' && pathname === '/api/login') {
      const body = await readBody(request);
      if (body.username === 'admin' && body.password === 'camp2026') {
        const token = crypto.randomBytes(24).toString('hex');
        sessions.set(token, { username: 'admin', createdAt: Date.now() });
        response.setHeader('Set-Cookie', `camp_session=${token}; HttpOnly; SameSite=Lax; Path=/`);
        sendJson(response, 200, { ok: true, username: 'admin' });
      } else {
        sendJson(response, 403, { error: '账号或密码错误' });
      }
      return;
    }

    if (request.method === 'POST' && pathname === '/api/logout') {
      const token = getCookie(request, 'camp_session');
      if (token) sessions.delete(token);
      response.setHeader('Set-Cookie', 'camp_session=; Max-Age=0; Path=/');
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === 'GET' && pathname === '/api/admin') {
      if (!requireAuth(request, response)) return;
      sendJson(response, 200, db);
      return;
    }

    if (request.method === 'POST' && pathname === '/api/bookings') {
      const body = await readBody(request);
      const booking = {
        id: makeId('b'),
        name: String(body.name || '').trim(),
        phone: String(body.phone || '').trim(),
        zone: String(body.zone || '').trim(),
        date: String(body.date || '').trim(),
        people: Number(body.people || 1),
        status: '待确认',
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
      };
      if (!booking.name || !booking.phone || !booking.zone || !booking.date) {
        sendJson(response, 400, { error: '请完整填写预约信息' });
        return;
      }
      db.bookings.unshift(booking);
      writeDb(db);
      sendJson(response, 201, booking);
      return;
    }

    if (request.method === 'POST' && pathname === '/api/feedback') {
      const body = await readBody(request);
      const feedback = {
        id: makeId('f'),
        name: String(body.name || '匿名游客').trim(),
        content: String(body.content || '').trim(),
        status: '待处理',
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
      };
      if (!feedback.content) {
        sendJson(response, 400, { error: '请填写反馈内容' });
        return;
      }
      db.feedback.unshift(feedback);
      writeDb(db);
      sendJson(response, 201, feedback);
      return;
    }

    if (request.method === 'PUT' && pathname.startsWith('/api/admin/')) {
      if (!requireAuth(request, response)) return;
      const [, , , collection, id] = pathname.split('/');
      const body = await readBody(request);
      if (!Array.isArray(db[collection])) {
        sendJson(response, 404, { error: '数据集合不存在' });
        return;
      }
      const index = db[collection].findIndex(item => item.id === id);
      if (index < 0) {
        sendJson(response, 404, { error: '记录不存在' });
        return;
      }
      db[collection][index] = { ...db[collection][index], ...body, id };
      writeDb(db);
      sendJson(response, 200, db[collection][index]);
      return;
    }

    if (request.method === 'POST' && pathname.startsWith('/api/admin/')) {
      if (!requireAuth(request, response)) return;
      const collection = pathname.split('/')[3];
      const body = await readBody(request);
      if (!Array.isArray(db[collection])) {
        sendJson(response, 404, { error: '数据集合不存在' });
        return;
      }
      const item = { id: makeId(collection[0] || 'i'), ...body };
      db[collection].unshift(item);
      writeDb(db);
      sendJson(response, 201, item);
      return;
    }

    if (request.method === 'DELETE' && pathname.startsWith('/api/admin/')) {
      if (!requireAuth(request, response)) return;
      const [, , , collection, id] = pathname.split('/');
      if (!Array.isArray(db[collection])) {
        sendJson(response, 404, { error: '数据集合不存在' });
        return;
      }
      db[collection] = db[collection].filter(item => item.id !== id);
      writeDb(db);
      sendJson(response, 200, { ok: true });
      return;
    }

    sendJson(response, 404, { error: '接口不存在' });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${host}:${port}`);
  if (url.pathname.startsWith('/api/')) {
    handleApi(request, response, url.pathname);
    return;
  }

  const filePath = safePath(request.url);
  if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('404 Not Found');
    return;
  }

  const stat = fs.statSync(filePath);
  response.writeHead(200, {
    'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache'
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Camp 3D platform running at http://${host}:${port}/index.html`);
});

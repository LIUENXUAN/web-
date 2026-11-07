// CampOS Admin SPA v2 - Part 1 + Part 2 Complete
// Uses React.createElement (no JSX), runs without Babel
var useState = React.useState, useEffect = React.useEffect, useCallback = React.useCallback, useRef = React.useRef;
var HashRouter = ReactRouterDOM.HashRouter, Routes = ReactRouterDOM.Routes, Route = ReactRouterDOM.Route;
var useNavigate = ReactRouterDOM.useNavigate, useLocation = ReactRouterDOM.useLocation;
var h = React.createElement;

var API = '';
function api(path, opts) {
  opts = opts || {};
  var headers = { 'Content-Type': 'application/json' };
  return fetch(API + path, { headers: headers, credentials: 'include', method: opts.method, body: opts.body })
    .then(function(r) { if (r.status === 204) return null; return r.json().then(function(d) { if (!r.ok) throw new Error(d.msg || d.error || '请求失败'); return d; }); });
}

var AuthContext = React.createContext(null);
function AuthProvider(props) {
  var children = props.children;
  var _u = useState(null), user = _u[0], setUser = _u[1];
  var _l = useState(true), loading = _l[0], setLoading = _l[1];
  useEffect(function() {
    api('/api/admin').then(function() { setUser({ name: 'admin', role: 'ADMIN' }); setLoading(false); })
      .catch(function() { setLoading(false); });
  }, []);
  var login = function(u, p) {
    return api('/api/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) })
      .then(function() { setUser({ name: u, role: 'ADMIN' }); });
  };
  var logout = function() { return api('/api/logout', { method: 'POST' }).finally(function() { setUser(null); }); };
  return h(AuthContext.Provider, { value: { user: user, login: login, logout: logout, loading: loading } }, children);
}
function useAuth() { return React.useContext(AuthContext); }

function fmtDate(d) { return d ? d.substring(0, 10) : '-'; }
function fmtDateTime(d) { return d ? d.substring(0, 16).replace('T', ' ') : '-'; }
function fmtMoney(n) { return '¥' + (n || 0).toLocaleString(); }
function statusTag(s) {
  var colors = {
    '待确认':'#d4952a','已确认':'#6b8f5e','已完成':'#4a9e5e','已取消':'#c0392b',
    '开放':'#4a9e5e','可预订':'#6b8f5e','维护中':'#d4952a',
    '报名中':'#4a9e5e','已满员':'#c0392b','已结束':'#8a9a8a',
    '待处理':'#c0392b','已处理':'#4a9e5e','处理中':'#d4952a',
    '正常':'#4a9e5e','故障':'#c0392b',
    '待执行':'#d4952a','进行中':'#6b8f5e','已关闭':'#8a9a8a',
    'ACTIVE':'#4a9e5e','INACTIVE':'#c0392b','LOCKED':'#d4952a',
    'ADMIN':'#6b8f5e','OPERATOR':'#d4952a','VIEWER':'#8a9a8a',
    '高':'#c0392b','中':'#d4952a','低':'#6b8f5e'
  };
  var c = colors[s] || '#8a9a8a';
  return h('span', { className: 'status-tag', style: { background: c + '20', color: c, border: '1px solid ' + c + '40' } }, s);
}

function healthBar(val) {
  var color = val >= 80 ? '#4a9e5e' : val >= 50 ? '#d4952a' : '#c0392b';
  return h('div', { className: 'health-bar' },
    h('div', { className: 'health-bar-track' }, h('div', { className: 'health-bar-fill', style: { width: val + '%', background: color } })),
    h('span', { className: 'health-bar-val', style: { color: color } }, val + '%'));
}

function alertLevelTag(level) {
  var cls = level === '高' || level === '紧急' ? 'alert-level-critical' : level === '中' || level === '警告' ? 'alert-level-warning' : 'alert-level-info';
  return h('span', { className: cls }, level || '-');
}

function exportCSV(data, filename) {
  if (!data || !data.length) return;
  var headers = Object.keys(data[0]);
  var rows = [headers.join(',')];
  data.forEach(function(row) {
    rows.push(headers.map(function(h) {
      var v = row[h] != null ? String(row[h]) : '';
      if (v.indexOf(',') >= 0 || v.indexOf('"') >= 0 || v.indexOf('\n') >= 0) return '"' + v.replace(/"/g, '""') + '"';
      return v;
    }).join(','));
  });
  var csv = '\uFEFF' + rows.join('\n');
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = filename + '.csv'; a.click();
  URL.revokeObjectURL(url);
}


// ===== LoginPage =====
function LoginPage() {
  var _login = useAuth(), login = _login.login;
  var _un = useState('admin'), username = _un[0], setUsername = _un[1];
  var _pw = useState('camp2026'), password = _pw[0], setPassword = _pw[1];
  var _err = useState(''), error = _err[0], setError = _err[1];
  var _ld = useState(false), loading = _ld[0], setLoading = _ld[1];
  var _ref = useRef(null);
  var _typing = useRef(false);
  var _pwFocused = useRef(false);
  var _showPw = useState(false), showPw = _showPw[0], setShowPw = _showPw[1];
  var handleSubmit = function(e) {
    e.preventDefault(); setLoading(true); setError('');
    login(username, password).catch(function(err) { setError(err.message); setLoading(false); });
  };
  // Character animation effect
  useEffect(function() {
    var cx = window.innerWidth * 0.32, cy = window.innerHeight * 0.52;
    var isTyping = false, isBlurred = false, isPasswordFocused = false;
    var isShaking = false, isSleepy = false, isBlinking = false; var blurTimer = null;
    var isCrying = false, isLove = false;
    var blinkTimer = null, cryTimer = null, sleepyTimer = null;
    var loveTimer = null, shakeTimer = null, blinkCycle = null;
    var cryCycle = null, sleepyCycle = null;
    var g = function(id) { return document.getElementById(id); };
    var ss = function(el, prop, val) { if (el) el.style[prop] = typeof val === 'number' ? val + 'px' : val; };
    var st = function(el, t) { if (el) el.style.transform = t; };
    var getFace = function(el) {
      if (!el) return { faceX: 0, faceY: 0, bodySkew: 0 };
      var r = el.getBoundingClientRect();
      var ix = r.left + r.width / 2, iy = r.top + r.height / 3;
      var dx = cx - ix, dy = cy - iy;
      return { faceX: Math.max(-30, Math.min(30, dx / 12)), faceY: Math.max(-18, Math.min(18, dy / 18)), bodySkew: Math.max(-14, Math.min(14, -dx / 70)) };
    };
    var pupilPos = function(el, maxR) {
      if (!el) return { x: 0, y: 0 };
      var r = el.getBoundingClientRect();
      var ix = r.left + r.width / 2, iy = r.top + r.height / 2;
      var dx = cx - ix, dy = cy - iy;
      var dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxR);
      var ang = Math.atan2(dy, dx);
      return { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist };
    };
    var update = function() {
      var p = g('char-purple'), b = g('char-black'), o = g('char-orange'), y = g('char-yellow');
      if (!p || !b || !o || !y) return;
      var pf = getFace(p), bf = getFace(b), of = getFace(o), yf = getFace(y);
      var hasVal = _ref.current && _ref.current.length > 0;
      var isLoveActive = hasVal && showPw;
      var isCryActive = isPasswordFocused && !showPw;
      // Purple
      if (isLoveActive) { p.style.transform = 'skewX(0deg)'; p.style.height = '370px'; }
      else if (isCryActive) { p.style.transform = 'skewX(-24deg) translateX(-42px) rotate(-2deg)'; p.style.height = '428px'; }
      else if (isBlurred) { p.style.transform = 'skewX(' + (pf.bodySkew - 20) + 'deg) translateX(68px) rotate(2deg)'; p.style.height = '430px'; }
      else { p.style.transform = 'skewX(' + pf.bodySkew + 'deg)'; p.style.height = '370px'; }
      var pe = g('purple-eyes'), pel = g('purple-eye-l'), per = g('purple-eye-r');
      var ppl = g('purple-pupil-l'), ppr = g('purple-pupil-r');
      if (pel) pel.style.height = isSleepy ? '2px' : '18px';
      if (per) per.style.height = isSleepy ? '2px' : '18px';
      if (isShaking) { ss(pe, 'left', 30); ss(pe, 'top', 55); st(ppl, 'translate(-3px, 4px)'); st(ppr, 'translate(-3px, 4px)'); }
      else if (isCryActive) { ss(pe, 'left', 20); ss(pe, 'top', 25); st(ppl, 'translate(-5px, -5px)'); st(ppr, 'translate(-5px, -5px)'); }
      else if (isLoveActive) { ss(pe, 'left', 20); ss(pe, 'top', 35); var lx = isBlinking ? 4 : -4, ly = isBlinking ? 5 : -4; st(ppl, 'translate(' + lx + 'px, ' + ly + 'px)'); st(ppr, 'translate(' + lx + 'px, ' + ly + 'px)'); }
      else if (isBlurred) { ss(pe, 'left', 55); ss(pe, 'top', 65); st(ppl, 'translate(3px, 4px)'); st(ppr, 'translate(3px, 4px)'); }
      else { ss(pe, 'left', 45 + pf.faceX); ss(pe, 'top', 40 + pf.faceY); var pp = pupilPos(pel, 8); st(ppl, 'translate(' + pp.x + 'px, ' + pp.y + 'px)'); st(ppr, 'translate(' + pp.x + 'px, ' + pp.y + 'px)'); }
      // Black
      if (isLoveActive) b.style.transform = 'skewX(0deg)';
      else if (isCryActive) b.style.transform = 'skewX(22deg) translateX(-34px) rotate(2deg)';
      else if (isBlurred) b.style.transform = 'skewX(' + (bf.bodySkew * 2 + 18) + 'deg) translateX(44px) rotate(-2deg)';
      else if (isTyping) b.style.transform = 'skewX(' + (bf.bodySkew * 2) + 'deg) translateX(10px)';
      else b.style.transform = 'skewX(' + bf.bodySkew + 'deg)';
      var be = g('black-eyes'), bel = g('black-eye-l'), ber = g('black-eye-r');
      var bpl = g('black-pupil-l'), bpr = g('black-pupil-r');
      if (bel) bel.style.height = isSleepy ? '2px' : '16px';
      if (ber) ber.style.height = isSleepy ? '2px' : '16px';
      if (isShaking) { ss(be, 'left', 15); ss(be, 'top', 40); st(bpl, 'translate(-3px, 4px)'); st(bpr, 'translate(-3px, 4px)'); }
      else if (isCryActive) { ss(be, 'left', 10); ss(be, 'top', 20); st(bpl, 'translate(-4px, -5px)'); st(bpr, 'translate(-4px, -5px)'); }
      else if (isLoveActive) { ss(be, 'left', 10); ss(be, 'top', 28); st(bpl, 'translate(-4px, -4px)'); st(bpr, 'translate(-4px, -4px)'); }
      else if (isBlurred) { ss(be, 'left', 32); ss(be, 'top', 12); st(bpl, 'translate(0px, -4px)'); st(bpr, 'translate(0px, -4px)'); }
      else { ss(be, 'left', 26 + bf.faceX); ss(be, 'top', 32 + bf.faceY); var bp = pupilPos(bel, 7); st(bpl, 'translate(' + bp.x + 'px, ' + bp.y + 'px)'); st(bpr, 'translate(' + bp.x + 'px, ' + bp.y + 'px)'); }
      // Orange
      var om = g('orange-mouth');
      if (isShaking) { ss(om, 'left', 80 + of.faceX); ss(om, 'top', 130); }
      o.style.transform = isLoveActive ? 'skewX(0deg)' : 'skewX(' + of.bodySkew + 'deg) translateX(' + (of.faceX * 0.35) + 'px)';
      var oe = g('orange-eyes'), opl = g('orange-pupil-l'), opr = g('orange-pupil-r');
      if (isShaking) { ss(oe, 'left', 60); ss(oe, 'top', 95); st(opl, 'translate(-3px, 4px)'); st(opr, 'translate(-3px, 4px)'); }
      else if (isCryActive) { ss(oe, 'left', 50); ss(oe, 'top', 75); st(opl, 'translate(-5px, -5px)'); st(opr, 'translate(-5px, -5px)'); }
      else if (isLoveActive) { ss(oe, 'left', 50); ss(oe, 'top', 85); st(opl, 'translate(-5px, -4px)'); st(opr, 'translate(-5px, -4px)'); }
      else { ss(oe, 'left', 82 + of.faceX); ss(oe, 'top', 90 + of.faceY); var op = pupilPos(opl, 8); st(opl, 'translate(' + op.x + 'px, ' + op.y + 'px)'); st(opr, 'translate(' + op.x + 'px, ' + op.y + 'px)'); }
      // Yellow
      y.style.transform = isLoveActive ? 'skewX(0deg)' : 'skewX(' + yf.bodySkew + 'deg) translateX(' + (yf.faceX * 0.35) + 'px)';
      var ye = g('yellow-eyes'), ypl = g('yellow-pupil-l'), ypr = g('yellow-pupil-r'), ym = g('yellow-mouth');
      if (isShaking) { ss(ye, 'left', 35); ss(ye, 'top', 45); st(ypl, 'translate(-3px, 4px)'); st(ypr, 'translate(-3px, 4px)'); ss(ym, 'left', 30); ss(ym, 'top', 92); st(ym, 'rotate(-8deg)'); }
      else if (isCryActive) { ss(ye, 'left', 20); ss(ye, 'top', 30); st(ypl, 'translate(-5px, -5px)'); st(ypr, 'translate(-5px, -5px)'); ss(ym, 'left', 15); ss(ym, 'top', 78); st(ym, 'rotate(0deg)'); }
      else if (isLoveActive) { ss(ye, 'left', 20); ss(ye, 'top', 35); st(ypl, 'translate(-5px, -4px)'); st(ypr, 'translate(-5px, -4px)'); ss(ym, 'left', 10); ss(ym, 'top', 88); st(ym, 'rotate(0deg)'); }
      else { ss(ye, 'left', 52 + yf.faceX); ss(ye, 'top', 40 + yf.faceY); var yp = pupilPos(ypl, 8); st(ypl, 'translate(' + yp.x + 'px, ' + yp.y + 'px)'); st(ypr, 'translate(' + yp.x + 'px, ' + yp.y + 'px)'); ss(ym, 'left', 40 + yf.faceX); ss(ym, 'top', 88 + yf.faceY); st(ym, 'rotate(0deg)'); }
    };
    var startBlinkCycle = function() {
      if (blinkCycle) window.clearTimeout(blinkCycle);
      blinkCycle = window.setTimeout(function() {
        isBlinking = true; update();
        blinkTimer = window.setTimeout(function() { isBlinking = false; update(); startBlinkCycle(); }, 150);
      }, Math.random() * 4000 + 3000);
    };
    var startCryCycle = function() {
      cryCycle = window.setTimeout(function() {
        isSleepy = true; update();
        cryTimer = window.setTimeout(function() { isSleepy = false; update(); startCryCycle(); }, 150);
      }, Math.random() * 4000 + 3000);
    };
    _ref.current = { update: update, setTyping: function(v) { isTyping = v; if (v) { isBlurred = true; if (blurTimer) window.clearTimeout(blurTimer); blurTimer = window.setTimeout(function() { isBlurred = false; update(); }, 800); } else { isBlurred = false; } update(); }, setPasswordFocused: function(v) { isPasswordFocused = v; update(); } };
    var onMouse = function(e) { cx = e.clientX; cy = e.clientY; if (!isTyping && !isShaking) update(); };
    document.addEventListener('mousemove', onMouse);
    startBlinkCycle();
    startCryCycle();
    window.setTimeout(update, 0);
    return function() {
      document.removeEventListener('mousemove', onMouse);
      [blinkTimer, cryTimer, sleepyTimer, loveTimer, shakeTimer, blinkCycle, cryCycle, sleepyCycle, blurTimer].forEach(function(t) { if (t) window.clearTimeout(t); });
      _ref.current = null;
    };
  }, [showPw]);
  return h('main', { className: 'bloom-admin' },
    
    h('section', { className: 'reference-login login-screen' },
      h('section', { className: 'reference-visual' },
        h('a', { className: 'reference-brand', href: '#', 'aria-label': 'CampOS' }, '⛰ CampOS'),
        h('div', { className: 'characters-wrapper' },
          h('div', { className: 'characters-scene', id: 'characters-scene' },
            h('div', { className: 'character char-purple', id: 'char-purple' },
              h('div', { className: 'eyes', id: 'purple-eyes', style: { left: 45, top: 40, gap: 28 } },
                h('div', { className: 'eyeball', id: 'purple-eye-l', style: { width: 18, height: 18 } },
                  h('div', { className: 'pupil', id: 'purple-pupil-l', style: { width: 7, height: 7 } })),
                h('div', { className: 'eyeball', id: 'purple-eye-r', style: { width: 18, height: 18 } },
                  h('div', { className: 'pupil', id: 'purple-pupil-r', style: { width: 7, height: 7 } })))),
            h('div', { className: 'character char-black', id: 'char-black' },
              h('div', { className: 'eyes', id: 'black-eyes', style: { left: 26, top: 32, gap: 20 } },
                h('div', { className: 'eyeball', id: 'black-eye-l', style: { width: 16, height: 16 } },
                  h('div', { className: 'pupil', id: 'black-pupil-l', style: { width: 6, height: 6 } })),
                h('div', { className: 'eyeball', id: 'black-eye-r', style: { width: 16, height: 16 } },
                  h('div', { className: 'pupil', id: 'black-pupil-r', style: { width: 6, height: 6 } })))),
            h('div', { className: 'character char-orange', id: 'char-orange' },
              h('div', { className: 'eyes', id: 'orange-eyes', style: { left: 82, top: 90, gap: 28 } },
                h('div', { className: 'bare-pupil', id: 'orange-pupil-l' }),
                h('div', { className: 'bare-pupil', id: 'orange-pupil-r' })),
              h('div', { className: 'orange-mouth', id: 'orange-mouth', style: { left: 90, top: 120 } })),
            h('div', { className: 'character char-yellow', id: 'char-yellow' },
              h('div', { className: 'eyes', id: 'yellow-eyes', style: { left: 52, top: 40, gap: 20 } },
                h('div', { className: 'bare-pupil', id: 'yellow-pupil-l' }),
                h('div', { className: 'bare-pupil', id: 'yellow-pupil-r' })),
              h('div', { className: 'yellow-mouth', id: 'yellow-mouth', style: { left: 40, top: 88 } })))),
        h('footer', { className: 'reference-links' },
          h('a', { href: '#' }, 'Privacy Policy'),
          h('a', { href: '#' }, 'Terms of Service'),
          h('a', { href: '#' }, 'Contact'))),
      h('section', { className: 'reference-panel' },
        h('form', { className: 'reference-form', onSubmit: handleSubmit },
          h('div', { className: 'form-star' }, '★'),
          h('h1', null, 'Welcome back!'),
          h('p', { className: 'form-subtitle' }, 'Please enter your details'),
          h('label', { id: 'email-label' },
            h('span', null, '用户名'),
            h('input', { id: 'email', type: 'text', value: username, onFocus: function() { if (_ref.current) _ref.current.setTyping(true); }, onBlur: function() { if (_ref.current) _ref.current.setTyping(false); }, onChange: function(e) { setUsername(e.target.value); }, placeholder: 'admin', autoComplete: 'off' })),
          h('label', { id: 'password-label' },
            h('span', null, '密码'),
            h('div', { className: 'reference-password' },
              h('input', { id: 'password', type: showPw ? 'text' : 'password', value: password, onFocus: function() { if (_ref.current) _ref.current.setPasswordFocused(true); }, onBlur: function() { if (_ref.current) _ref.current.setPasswordFocused(false); }, onChange: function(e) { setPassword(e.target.value); }, placeholder: '••••••••', autoComplete: 'current-password' }),
              h('button', { type: 'button', className: 'toggle-password', onClick: function() { setShowPw(function(v) { return !v; }); }, 'aria-label': '显示密码' }, showPw ? '○' : '◎'))),
          error && h('div', { className: 'error-msg visible-error', id: 'error-msg' }, error),
          h('button', { className: 'btn-login reference-submit', type: 'submit', id: 'btn-login', disabled: loading },
            h('span', { className: 'btn-text' }, loading ? '登录中...' : 'Log In'),
            h('div', { className: 'btn-hover-content' },
              h('span', null, 'Log In')))))));
}
// ===== AppLayout =====
var NAV_ITEMS = [
  { path: '/dashboard', icon: '◉', label: '仪表盘' },
  { path: '/orders', icon: '☰', label: '订单管理' },
  { path: '/zones', icon: '⛺', label: '营地区域' },
  { path: '/activities', icon: '✦', label: '活动课程' },
  { path: '/feedback', icon: '✉', label: '游客反馈' },
  { path: '/assets', icon: '⚙', label: '资产管理' },
  { path: '/inspections', icon: '✓', label: '巡检管理' },
  { path: '/alerts', icon: '⚠', label: '告警管理' },
  { path: '/users', icon: '👤', label: '用户管理' },
  { path: 'http://localhost:8080/model-test.html', icon: '🌐', label: '3D 孪生', external: true }
];

var PAGE_TITLES = {
  '/dashboard': '仪表盘', '/orders': '订单管理', '/zones': '营地区域',
  '/activities': '活动课程', '/feedback': '游客反馈', '/assets': '资产管理',
  '/inspections': '巡检管理', '/alerts': '告警管理', '/users': '用户管理'
};

function AppLayout(props) {
  var children = props.children;
  var _auth = useAuth(), user = _auth.user, logout = _auth.logout;
  var navigate = useNavigate();
  var location = useLocation();
  var currentPath = '/' + ((location.hash.replace('#','').split('/')[1]) || 'dashboard');
  var title = PAGE_TITLES[currentPath] || '仪表盘';
  var bgRef = useRef(null);
  useEffect(function() {
    // Background video handled by HTML video element
  }, []);
  return h('div', { className: 'app-layout' },
    h('video', { className: 'background-video', src: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4', autoPlay: true, loop: true, muted: true, playsInline: true, style: { pointerEvents: 'none' } }),
    h('div', { className: 'video-veil', style: { pointerEvents: 'none' } }),
    h('aside', { className: 'sidebar liquid-glass-strong' },
      h('div', { className: 'sidebar-brand' },
        h('div', { className: 'brand-mark' }, '⛰'),
        h('strong', null, 'CampOS')),
      h('nav', { className: 'sidebar-nav' },
        NAV_ITEMS.map(function(item) {
          return h('button', {
            key: item.path,
            className: 'nav-item-sb' + (currentPath === item.path ? ' active' : ''),
            onClick: function() { if (item.external) { window.open(item.path, '_blank'); } else { navigate(item.path); } }
          }, h('span', null, item.icon), ' ', item.label);
        })),
      h('div', { className: 'sidebar-footer' },
        h('div', { className: 'avatar' }, (user ? user.name : 'A')[0].toUpperCase()),
        h('div', { className: 'user-info' },
          h('div', { className: 'user-name' }, user ? user.name : 'admin'),
          h('div', { className: 'user-role' }, user ? user.role : 'ADMIN')),
        h('button', { className: 'logout-btn', onClick: logout, title: '退出登录' }, '⏻'))),
    h('div', { className: 'main-area' },
      h('div', { className: 'top-bar' }, h('h2', null, title)),
      h('div', { className: 'page-content' }, children)));
}

// ===== Pagination =====
function Pagination(props) {
  var page = props.page, totalPages = props.totalPages, totalElements = props.totalElements, onPage = props.onPage;
  if (totalPages <= 1) return null;
  var pages = [];
  var start = Math.max(0, page - 2);
  var end = Math.min(totalPages, page + 3);
  for (var i = start; i < end; i++) pages.push(i);
  return h('div', { className: 'pagination' },
    h('span', { className: 'pagination-info' }, '共 ' + totalElements + ' 条，第 ' + (page + 1) + '/' + totalPages + ' 页'),
    h('div', { className: 'pagination-btns' },
      h('button', { disabled: page === 0, onClick: function() { onPage(0); } }, '«'),
      h('button', { disabled: page === 0, onClick: function() { onPage(page - 1); } }, '‹'),
      pages.map(function(p) { return h('button', { key: p, className: p === page ? 'active' : '', onClick: function() { onPage(p); } }, p + 1); }),
      h('button', { disabled: page >= totalPages - 1, onClick: function() { onPage(page + 1); } }, '›'),
      h('button', { disabled: page >= totalPages - 1, onClick: function() { onPage(totalPages - 1); } }, '»')));
}

// ===== BatchBar =====
function BatchBar(props) {
  var selected = props.selected, onClear = props.onClear, onBatchDelete = props.onBatchDelete, onBatchStatus = props.onBatchStatus, statusOptions = props.statusOptions;
  if (!selected || selected.length === 0) return null;
  return h('div', { className: 'batch-bar' },
    h('span', null, '已选 ' + selected.length + ' 项'),
    statusOptions && statusOptions.map(function(s) { return h('button', { key: s.value, className: 'btn btn-xs btn-primary', style: { marginLeft: 4 }, onClick: function() { onBatchStatus(s.value); } }, s.label); }),
    h('button', { className: 'btn btn-xs btn-danger', onClick: onBatchDelete }, '批量删除'),
    h('button', { className: 'btn btn-xs btn-ghost', onClick: onClear }, '取消选择'));
}

function SelAll(props) {
  var data = props.data, selected = props.selected, onToggleAll = props.onToggleAll;
  var allSelected = data && data.length > 0 && selected.length === data.length;
  return h('th', { className: 'cb-cell' }, h('input', { type: 'checkbox', checked: allSelected, onChange: onToggleAll }));
}
function SelRow(props) {
  var id = props.id, selected = props.selected, onToggle = props.onToggle;
  return h('td', { className: 'cb-cell' }, h('input', { type: 'checkbox', checked: selected.indexOf(id) >= 0, onChange: function() { onToggle(id); } }));
}


// ===== DashboardPage =====
function DashboardPage() {
  var _m = useState(null), metrics = _m[0], setMetrics = _m[1];
  var _rb = useState([]), recentBookings = _rb[0], setRecentBookings = _rb[1];
  var _rf = useState([]), recentFeedback = _rf[0], setRecentFeedback = _rf[1];
  var chartRefs = useRef({});
  useEffect(function() {
    api('/api/admin').then(function(data) {
      setMetrics(data.metrics || {});
      setRecentBookings((data.bookings || []).slice(0, 5));
      setRecentFeedback((data.feedback || []).slice(0, 5));
    });
  }, []);
  useEffect(function() {
    if (!metrics) return;
    Object.values(chartRefs.current).forEach(function(c) { if (c) c.destroy(); });
    chartRefs.current = {};
    var opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8a9a8a', font: { size: 11 } } } }, scales: { x: { ticks: { color: '#5a6a82', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }, y: { ticks: { color: '#5a6a82', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } } } };
    var tCtx = document.getElementById('chart-trend');
    if (tCtx) chartRefs.current.trend = new Chart(tCtx, { type: 'line', data: { labels: ['周一','周二','周三','周四','周五','周六','周日'], datasets: [{ label: '订单数', data: [12,19,15,22,28,35,30], borderColor: '#6b8f5e', backgroundColor: 'rgba(91,141,239,0.1)', fill: true, tension: 0.4 }, { label: '访客数', data: [80,120,95,150,180,240,210], borderColor: '#4a9e5e', backgroundColor: 'rgba(46,204,113,0.1)', fill: true, tension: 0.4 }] }, options: opts });
    var pCtx = document.getElementById('chart-pie');
    if (pCtx) chartRefs.current.pie = new Chart(pCtx, { type: 'doughnut', data: { labels: ['帐篷区','木屋区','房车区','公共区'], datasets: [{ data: [4,3,2,1], backgroundColor: ['#6b8f5e','#4a9e5e','#d4952a','#c0392b'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8a9a8a', font: { size: 11 }, padding: 16 } } } } });
    var bCtx = document.getElementById('chart-bar');
    if (bCtx) chartRefs.current.bar = new Chart(bCtx, { type: 'bar', data: { labels: ['1月','2月','3月','4月','5月','6月'], datasets: [{ label: '营收 (k)', data: [28,32,45,52,68,85], backgroundColor: 'rgba(91,141,239,0.6)', borderRadius: 4 }] }, options: opts });
    return function() { Object.values(chartRefs.current).forEach(function(c) { if (c) c.destroy(); }); };
  }, [metrics]);
  if (!metrics) return h('div', { className: 'loading-state' }, '加载中...');
  return h('div', null,
    h('div', { className: 'kpi-grid-6' },
      h('div', { className: 'kpi-card' }, h('span', null, '今日访客'), h('strong', null, (metrics.visitors || 0).toLocaleString()), h('div', { className: 'sub' }, '↑12% 较昨日')),
      h('div', { className: 'kpi-card' }, h('span', null, '预订率'), h('strong', null, (metrics.bookingRate || 0) + '%'), h('div', { className: 'sub' }, '营地占用率')),
      h('div', { className: 'kpi-card' }, h('span', null, '营收'), h('strong', null, fmtMoney(metrics.revenue)), h('div', { className: 'sub' }, '本月累计')),
      h('div', { className: 'kpi-card' }, h('span', null, '资产健康度'), h('strong', null, (metrics.assetHealth || 0) + '%'), h('div', { className: 'sub' }, '正常运转')),
      h('div', { className: 'kpi-card' }, h('span', null, '告警关闭率'), h('strong', null, (metrics.alertCloseRate || 0) + '%'), h('div', { className: 'sub' }, '及时处理')),
      h('div', { className: 'kpi-card' }, h('span', null, '待办事项'), h('strong', null, metrics.pendingItems || 0), h('div', { className: 'sub' }, '需处理'))),
    h('div', { className: 'chart-row-3' },
      h('div', { className: 'chart-box' }, h('h4', null, '本周趋势'), h('canvas', { id: 'chart-trend', className: 'chart-canvas', style: { height: 220 } })),
      h('div', { className: 'chart-box' }, h('h4', null, '区域分布'), h('canvas', { id: 'chart-pie', className: 'chart-canvas', style: { height: 220 } })),
      h('div', { className: 'chart-box' }, h('h4', null, '月度营收'), h('canvas', { id: 'chart-bar', className: 'chart-canvas', style: { height: 220 } }))),
    h('div', { className: 'two-col' },
      h('div', { className: 'card-panel liquid-glass-strong' },
        h('h3', null, '最近订单'),
        recentBookings.map(function(b) { return h('div', { key: b.id, className: 'todo-item', style: { display: 'flex', justifyContent: 'space-between' } }, h('span', null, b.customerName || b.name || '-'), h('span', { style: { color: '#5a6a82', fontSize: 11 } }, fmtDate(b.createdAt))); })),
      h('div', { className: 'card-panel liquid-glass-strong' },
        h('h3', null, '待处理反馈'),
        recentFeedback.filter(function(f) { return f.status === '待处理'; }).slice(0, 5).map(function(f) { return h('div', { key: f.id, className: 'todo-item', style: { display: 'flex', justifyContent: 'space-between' } }, h('span', null, (f.content || '').substring(0, 20) + '...'), h('span', { style: { color: '#c0392b', fontSize: 11 } }, '待处理')); }),
        recentFeedback.filter(function(f) { return f.status === '待处理'; }).length === 0 && h('div', { className: 'todo-item', style: { color: '#5a6a82' } }, '暂无待处理反馈'))));
}

// ===== OrdersPage =====
function OrdersPage() {
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _p = useState(0), page = _p[0], setPage = _p[1];
  var _s = useState(''), search = _s[0], setSearch = _s[1];
  var _sf = useState(''), statusFilter = _sf[0], setStatusFilter = _sf[1];
  var _dt = useState(null), detail = _dt[0], setDetail = _dt[1];
  var _sel = useState([]), selected = _sel[0], setSelected = _sel[1];
  var load = useCallback(function() {
    var params = '?page=' + page + '&size=10' + (search ? '&search=' + encodeURIComponent(search) : '') + (statusFilter ? '&status=' + encodeURIComponent(statusFilter) : '');
    api('/api/admin/bookings' + params).then(setData);
  }, [page, search, statusFilter]);
  useEffect(function() { load(); }, [load]);
  var del = function(id) { if (confirm('确认删除？')) api('/api/admin/bookings/' + id, { method: 'DELETE' }).then(load); };
  var updateStatus = function(id, status) { api('/api/admin/bookings/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: status }) }).then(load); };
  var toggleSel = function(id) { setSelected(function(s) { return s.indexOf(id) >= 0 ? s.filter(function(x) { return x !== id; }) : s.concat([id]); }); };
  var toggleAll = function() { setSelected(data && data.content && selected.length === data.content.length ? [] : (data ? data.content : []).map(function(r) { return r.id; })); };
  var batchDelete = function() { if (confirm('确认删除选中的 ' + selected.length + ' 条？')) Promise.all(selected.map(function(id) { return api('/api/admin/bookings/' + id, { method: 'DELETE' }); })).then(function() { setSelected([]); load(); }); };
  var batchStatus = function(status) { Promise.all(selected.map(function(id) { return api('/api/admin/bookings/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: status }) }); })).then(function() { setSelected([]); load(); }); };
  if (!data) return h('div', { className: 'loading-state' }, '加载中...');
  return h('div', null,
    h('div', { className: 'filter-bar' },
      h('input', { placeholder: '搜索客户/订单号...', value: search, onChange: function(e) { setSearch(e.target.value); setPage(0); } }),
      h('select', { value: statusFilter, onChange: function(e) { setStatusFilter(e.target.value); setPage(0); } },
        h('option', { value: '' }, '全部状态'), h('option', { value: '待确认' }, '待确认'), h('option', { value: '已确认' }, '已确认'), h('option', { value: '已完成' }, '已完成'), h('option', { value: '已取消' }, '已取消')),
      h('button', { className: 'btn btn-primary btn-sm', onClick: load }, '刷新'),
      h('div', { className: 'export-bar' }, h('button', { className: 'export-btn', onClick: function() { exportCSV(data.content || [], '订单导出'); } }, '📥 CSV'))),
    h(BatchBar, { selected: selected, onClear: function() { setSelected([]); }, onBatchDelete: batchDelete, onBatchStatus: batchStatus, statusOptions: [{ value: '已确认', label: '批量确认' }, { value: '已完成', label: '批量完成' }] }),
    h('div', { className: 'page-header-bar' }, h('span', { className: 'count' }, '共 ' + (data.totalElements || 0) + ' 条订单')),
    h('table', { className: 'data-table' },
      h('thead', null, h('tr', null, h(SelAll, { data: data.content, selected: selected, onToggleAll: toggleAll }), h('th', null, '客户'), h('th', null, '手机号'), h('th', null, '区域'), h('th', null, '人数'), h('th', null, '金额'), h('th', null, '日期'), h('th', null, '状态'), h('th', null, '操作'))),
      h('tbody', null, (data.content || []).map(function(o) { return h('tr', { key: o.id },
        h(SelRow, { id: o.id, selected: selected, onToggle: toggleSel }),
        h('td', null, o.customerName || o.name || '-'), h('td', null, o.phone || '-'), h('td', null, o.zoneName || o.zone || '-'), h('td', null, (o.people || 0) + '人'), h('td', null, fmtMoney(o.totalPrice || o.amount)),
        h('td', null, fmtDate(o.createdAt)), h('td', null, statusTag(o.status)),
        h('td', { style: { whiteSpace: 'nowrap' } },
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(107,143,94,0.2)', color: '#6b8f5e', border: '1px solid rgba(107,143,94,0.3)', marginRight: 4 }, onClick: function() { setDetail(o); } }, '详情'),
          o.status === '待确认' && h('button', { className: 'btn btn-xs btn-success', style: { marginRight: 4 }, onClick: function() { updateStatus(o.id, '已确认'); } }, '确认'),
          o.status === '已确认' && h('button', { className: 'btn btn-xs btn-primary', style: { marginRight: 4 }, onClick: function() { updateStatus(o.id, '已完成'); } }, '完成'),
          h('button', { className: 'btn btn-xs btn-danger', onClick: function() { del(o.id); } }, '删除'))); }))),
    h(Pagination, { page: page, totalPages: data.totalPages, totalElements: data.totalElements, onPage: setPage }),
    detail && h('div', null,
      h('div', { className: 'drawer-overlay', onClick: function() { setDetail(null); } }),
      h('div', { className: 'drawer-panel liquid-glass-strong', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'drawer-header' }, h('h3', null, '订单详情'), h('button', { className: 'modal-close', onClick: function() { setDetail(null); } }, '✕')),
        [['id','订单号'],['customerName','客户'],['phone','手机号'],['zoneName','区域'],['people','人数'],['totalPrice','金额'],['status','状态'],['date','入住日期'],['remark','备注'],['createdAt','创建时间']].map(function(pair) {
          var k = pair[0], label = pair[1];
          return h('div', { key: k, className: 'detail-row' },
            h('span', { className: 'detail-label' }, label),
            h('span', { className: 'detail-value' }, k === 'status' ? statusTag(detail[k]) : k === 'totalPrice' ? fmtMoney(detail[k]) : (detail[k] || '-')));
        }),
        h('div', { style: { marginTop: 20, display: 'flex', gap: 10 } },
          h('button', { className: 'btn btn-ghost', onClick: function() { setDetail(null); } }, '关闭'),
          detail.status === '待确认' && h('button', { className: 'btn btn-success', onClick: function() { updateStatus(detail.id, '已确认'); setDetail(null); } }, '确认订单'),
          detail.status === '已确认' && h('button', { className: 'btn btn-primary', onClick: function() { updateStatus(detail.id, '已完成'); setDetail(null); } }, '标记完成')))));
}


// ===== ZonesPage =====
function ZonesPage() {
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _p = useState(0), page = _p[0], setPage = _p[1];
  var _md = useState(null), modal = _md[0], setModal = _md[1];
  var _fm = useState({}), form = _fm[0], setForm = _fm[1];
  var _sel = useState([]), selected = _sel[0], setSelected = _sel[1];
  var load = useCallback(function() { api('/api/admin/zones?page=' + page + '&size=10').then(setData); }, [page]);
  useEffect(function() { load(); }, [load]);
  var openNew = function() { setForm({ name: '', type: '帐篷', capacity: 4, status: '开放', price: 0, description: '' }); setModal('new'); };
  var openEdit = function(z) { setForm(Object.assign({}, z)); setModal('edit'); };
  var save = function() {
    var url = modal === 'new' ? '/api/admin/zones' : '/api/admin/zones/' + form.id;
    var method = modal === 'new' ? 'POST' : 'PUT';
    api(url, { method: method, body: JSON.stringify(form) }).then(function() { setModal(null); load(); });
  };
  var del = function(id) { if (confirm('确认删除？')) api('/api/admin/zones/' + id, { method: 'DELETE' }).then(load); };
  var updateStatus = function(id, status) { api('/api/admin/zones/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: status }) }).then(load); };
  var toggleSel = function(id) { setSelected(function(s) { return s.indexOf(id) >= 0 ? s.filter(function(x) { return x !== id; }) : s.concat([id]); }); };
  var toggleAll = function() { setSelected(data && data.content && selected.length === data.content.length ? [] : (data ? data.content : []).map(function(r) { return r.id; })); };
  var batchDelete = function() { if (confirm('确认删除？')) Promise.all(selected.map(function(id) { return api('/api/admin/zones/' + id, { method: 'DELETE' }); })).then(function() { setSelected([]); load(); }); };
  if (!data) return h('div', { className: 'loading-state' }, '加载中...');
  return h('div', null,
    h('div', { className: 'filter-bar' },
      h('button', { className: 'btn btn-primary btn-sm', onClick: openNew }, '+ 新增区域'),
      h('div', { className: 'export-bar' }, h('button', { className: 'export-btn', onClick: function() { exportCSV(data.content || [], '营地区域导出'); } }, '📥 CSV'))),
    h(BatchBar, { selected: selected, onClear: function() { setSelected([]); }, onBatchDelete: batchDelete }),
    h('div', { className: 'page-header-bar' }, h('span', { className: 'count' }, '共 ' + (data.totalElements || 0) + ' 个区域')),
    h('table', { className: 'data-table' },
      h('thead', null, h('tr', null, h(SelAll, { data: data.content, selected: selected, onToggleAll: toggleAll }), h('th', null, '名称'), h('th', null, '类型'), h('th', null, '容量'), h('th', null, '价格'), h('th', null, '状态'), h('th', null, '操作'))),
      h('tbody', null, (data.content || []).map(function(z) { return h('tr', { key: z.id },
        h(SelRow, { id: z.id, selected: selected, onToggle: toggleSel }),
        h('td', null, z.name), h('td', null, z.type), h('td', null, z.capacity), h('td', null, fmtMoney(z.price)), h('td', null, statusTag(z.status)),
        h('td', { style: { whiteSpace: 'nowrap' } },
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(107,143,94,0.2)', color: '#6b8f5e', border: '1px solid rgba(107,143,94,0.3)', marginRight: 4 }, onClick: function() { openEdit(z); } }, '编辑'),
          z.status === '开放' ? h('button', { className: 'btn btn-xs btn-warning', style: { marginRight: 4 }, onClick: function() { updateStatus(z.id, '维护中'); } }, '维护') : h('button', { className: 'btn btn-xs btn-success', style: { marginRight: 4 }, onClick: function() { updateStatus(z.id, '开放'); } }, '开放'),
          h('button', { className: 'btn btn-xs btn-danger', onClick: function() { del(z.id); } }, '删除'))); }))),
    h(Pagination, { page: page, totalPages: data.totalPages, totalElements: data.totalElements, onPage: setPage }),
    modal && h('div', { className: 'modal-overlay', onClick: function() { setModal(null); } },
      h('div', { className: 'modal-box liquid-glass-strong', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'modal-header' }, h('h3', null, modal === 'new' ? '新增区域' : '编辑区域'), h('button', { className: 'modal-close', onClick: function() { setModal(null); } }, '✕')),
        h('div', { className: 'modal-body' },
          h('div', { className: 'form-group' }, h('label', null, '名称'), h('input', { value: form.name || '', onChange: function(e) { setForm(Object.assign({}, form, { name: e.target.value })); } })),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '类型'), h('select', { value: form.type || '', onChange: function(e) { setForm(Object.assign({}, form, { type: e.target.value })); } }, h('option', { value: '帐篷' }, '帐篷'), h('option', { value: '木屋' }, '木屋'), h('option', { value: '房车' }, '房车'), h('option', { value: '公共' }, '公共'))),
            h('div', { className: 'form-group' }, h('label', null, '容量'), h('input', { type: 'number', value: form.capacity || 0, onChange: function(e) { setForm(Object.assign({}, form, { capacity: parseInt(e.target.value) || 0 })); } }))),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '区域'), h('input', { value: form.zone || '', onChange: function(e) { setForm(Object.assign({}, form, { zone: e.target.value })); } })),
            h('div', { className: 'form-group' }, h('label', null, '状态'), h('select', { value: form.status || '', onChange: function(e) { setForm(Object.assign({}, form, { status: e.target.value })); } }, h('option', { value: '开放' }, '开放'), h('option', { value: '可预订' }, '可预订'), h('option', { value: '维护中' }, '维护中')))),
          h('div', { className: 'form-group' }, h('label', null, '描述'), h('textarea', { rows: 3, value: form.description || '', onChange: function(e) { setForm(Object.assign({}, form, { description: e.target.value })); } }))),
        h('div', { className: 'modal-footer' },
          h('button', { className: 'btn btn-ghost', onClick: function() { setModal(null); } }, '取消'),
          h('button', { className: 'btn btn-primary', onClick: save }, '保存')))));
}

// ===== ActivitiesPage =====
function ActivitiesPage() {
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _p = useState(0), page = _p[0], setPage = _p[1];
  var _md = useState(null), modal = _md[0], setModal = _md[1];
  var _fm = useState({}), form = _fm[0], setForm = _fm[1];
  var _sel = useState([]), selected = _sel[0], setSelected = _sel[1];
  var _slist = useState(null), signupList = _slist[0], setSignupList = _slist[1];
  var _sloading = useState(false), signupLoading = _sloading[0], setSignupLoading = _sloading[1];
  var load = useCallback(function() { api('/api/admin/activities?page=' + page + '&size=10').then(setData); }, [page]);
  useEffect(function() { load(); }, [load]);
  var openNew = function() { setForm({ title: '', date: '', zone: '', quota: 20, joined: 0, status: '报名中', description: '' }); setModal('new'); };
  var openEdit = function(a) { setForm(Object.assign({}, a)); setModal('edit'); };
  var save = function() {
    var url = modal === 'new' ? '/api/admin/activities' : '/api/admin/activities/' + form.id;
    var method = modal === 'new' ? 'POST' : 'PUT';
    api(url, { method: method, body: JSON.stringify(form) }).then(function() { setModal(null); load(); });
  };
  var del = function(id) { if (confirm('确认删除？')) api('/api/admin/activities/' + id, { method: 'DELETE' }).then(load); };
  var updateStatus = function(id, status) { api('/api/admin/activities/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: status }) }).then(load); };
  var toggleSel = function(id) { setSelected(function(s) { return s.indexOf(id) >= 0 ? s.filter(function(x) { return x !== id; }) : s.concat([id]); }); };
  var toggleAll = function() { setSelected(data && data.content && selected.length === data.content.length ? [] : (data ? data.content : []).map(function(r) { return r.id; })); };
  var batchDelete = function() { if (confirm('确认删除？')) Promise.all(selected.map(function(id) { return api('/api/admin/activities/' + id, { method: 'DELETE' }); })).then(function() { setSelected([]); load(); }); };
  var showSignups = function(id) {
    setSignupLoading(true);
    setSignupList(null);
    api('/api/admin/activities/' + id + '/signups').then(function(r) { var arr = r && r.data ? r.data : []; setSignupList(arr); setSignupLoading(false); }).catch(function() { setSignupLoading(false); });
  };
  if (!data) return h('div', { className: 'loading-state' }, '加载中...');
  return h('div', null,
    h('div', { className: 'filter-bar' },
      h('button', { className: 'btn btn-primary btn-sm', onClick: openNew }, '+ 新增活动'),
      h('button', { className: 'btn btn-ghost btn-sm', onClick: load }, '↻ 刷新'),
      h('div', { className: 'export-bar' }, h('button', { className: 'export-btn', onClick: function() { exportCSV(data.content || [], '活动课程导出'); } }, '📥 CSV'))),
    h(BatchBar, { selected: selected, onClear: function() { setSelected([]); }, onBatchDelete: batchDelete }),
    h('div', { className: 'page-header-bar' }, h('span', { className: 'count' }, '共 ' + (data.totalElements || 0) + ' 个活动')),
    h('table', { className: 'data-table' },
      h('thead', null, h('tr', null, h(SelAll, { data: data.content, selected: selected, onToggleAll: toggleAll }), h('th', null, '标题'), h('th', null, '日期'), h('th', null, '区域'), h('th', null, '名额'), h('th', null, '已报名'), h('th', null, '状态'), h('th', null, '操作'))),
      h('tbody', null, (data.content || []).map(function(a) { return h('tr', { key: a.id },
        h(SelRow, { id: a.id, selected: selected, onToggle: toggleSel }),
        h('td', null, a.title), h('td', null, fmtDate(a.date)), h('td', null, a.zone || '-'), h('td', null, a.quota), h('td', null, a.joined + '/' + a.quota), h('td', null, statusTag(a.status)),
        h('td', { style: { whiteSpace: 'nowrap' } },
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(107,143,94,0.2)', color: '#6b8f5e', border: '1px solid rgba(107,143,94,0.3)', marginRight: 4 }, onClick: function() { openEdit(a); } }, '编辑'),
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(91,141,239,0.15)', color: '#5b8def', border: '1px solid rgba(91,141,239,0.25)', marginRight: 4 }, onClick: function() { showSignups(a.id); } }, '报名名单'),
          a.status === '报名中' && h('button', { className: 'btn btn-xs btn-warning', style: { marginRight: 4 }, onClick: function() { updateStatus(a.id, '已满员'); } }, '满员'),
          a.status === '已满员' && h('button', { className: 'btn btn-xs btn-success', style: { marginRight: 4 }, onClick: function() { updateStatus(a.id, '报名中'); } }, '开放'),
          a.status !== '已结束' && h('button', { className: 'btn btn-xs', style: { background: 'rgba(138,154,138,0.2)', color: '#8a9a8a', border: '1px solid rgba(138,154,138,0.3)', marginRight: 4 }, onClick: function() { updateStatus(a.id, '已结束'); } }, '结束'),
          h('button', { className: 'btn btn-xs btn-danger', onClick: function() { del(a.id); } }, '删除'))); }))),
    h(Pagination, { page: page, totalPages: data.totalPages, totalElements: data.totalElements, onPage: setPage }),
    signupList !== null && h('div', { className: 'modal-overlay', onClick: function() { setSignupList(null); } },
      h('div', { className: 'modal-box liquid-glass-strong', onClick: function(e) { e.stopPropagation(); }, style: { width: '520px' } },
        h('div', { className: 'modal-header' }, h('h3', null, '报名名单'), h('button', { className: 'modal-close', onClick: function() { setSignupList(null); } }, '✕')),
        h('div', { className: 'modal-body' },
          signupList.length === 0 ? h('div', { className: 'empty-state', style: { textAlign: 'center', padding: '30px 0', color: '#80a898' } }, '暂无报名记录')
          : h('table', { className: 'data-table' },
            h('thead', null, h('tr', null, h('th', null, '姓名'), h('th', null, '手机号'), h('th', null, '用户名'), h('th', null, '报名时间'))),
            h('tbody', null, signupList.map(function(s) {
              return h('tr', { key: s.id },
                h('td', null, s.name),
                h('td', null, s.phone),
                h('td', null, s.username || '-'),
                h('td', null, s.createdAt ? s.createdAt.substring(0, 16).replace('T', ' ') : '-'));
            }))
          )
        ),
        h('div', { className: 'modal-footer' },
          h('button', { className: 'btn btn-ghost', onClick: function() { setSignupList(null); } }, '关闭'))
      )
    ),

    modal && h('div', { className: 'modal-overlay', onClick: function() { setModal(null); } },
      h('div', { className: 'modal-box liquid-glass-strong', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'modal-header' }, h('h3', null, modal === 'new' ? '新增活动' : '编辑活动'), h('button', { className: 'modal-close', onClick: function() { setModal(null); } }, '✕')),
        h('div', { className: 'modal-body' },
          h('div', { className: 'form-group' }, h('label', null, '标题'), h('input', { value: form.title || '', onChange: function(e) { setForm(Object.assign({}, form, { title: e.target.value })); } })),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '日期'), h('input', { type: 'date', value: form.date || '', onChange: function(e) { setForm(Object.assign({}, form, { date: e.target.value })); } })),
            h('div', { className: 'form-group' }, h('label', null, '名额上限'), h('input', { type: 'number', value: form.quota || 0, onChange: function(e) { setForm(Object.assign({}, form, { quota: parseInt(e.target.value) || 0 })); } }))),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '区域'), h('input', { value: form.zone || '', onChange: function(e) { setForm(Object.assign({}, form, { zone: e.target.value })); } })),
            h('div', { className: 'form-group' }, h('label', null, '已报名数'), h('input', { type: 'number', value: form.joined || 0, onChange: function(e) { setForm(Object.assign({}, form, { joined: parseInt(e.target.value) || 0 })); } })),
            h('div', { className: 'form-group' }, h('label', null, '状态'), h('select', { value: form.status || '', onChange: function(e) { setForm(Object.assign({}, form, { status: e.target.value })); } }, h('option', { value: '报名中' }, '报名中'), h('option', { value: '已满员' }, '已满员'), h('option', { value: '已结束' }, '已结束')))),
          h('div', { className: 'form-group' }, h('label', null, '描述'), h('textarea', { rows: 3, value: form.description || '', onChange: function(e) { setForm(Object.assign({}, form, { description: e.target.value })); } }))),
        h('div', { className: 'modal-footer' },
          h('button', { className: 'btn btn-ghost', onClick: function() { setModal(null); } }, '取消'),
          h('button', { className: 'btn btn-primary', onClick: save }, '保存')))));
}

// ===== FeedbackPage =====
function FeedbackPage() {
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _p = useState(0), page = _p[0], setPage = _p[1];
  var _dt = useState(null), detail = _dt[0], setDetail = _dt[1];
  var _sel = useState([]), selected = _sel[0], setSelected = _sel[1];
  var load = useCallback(function() { api('/api/admin/feedback?page=' + page + '&size=10').then(setData); }, [page]);
  useEffect(function() { load(); }, [load]);
  var del = function(id) { if (confirm('确认删除？')) api('/api/admin/feedback/' + id, { method: 'DELETE' }).then(load); };
  var markDone = function(id) { api('/api/admin/feedback/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: '已处理' }) }).then(load); };
  var toggleSel = function(id) { setSelected(function(s) { return s.indexOf(id) >= 0 ? s.filter(function(x) { return x !== id; }) : s.concat([id]); }); };
  var toggleAll = function() { setSelected(data && data.content && selected.length === data.content.length ? [] : (data ? data.content : []).map(function(r) { return r.id; })); };
  var batchDelete = function() { if (confirm('确认删除？')) Promise.all(selected.map(function(id) { return api('/api/admin/feedback/' + id, { method: 'DELETE' }); })).then(function() { setSelected([]); load(); }); };
  var batchDone = function() { Promise.all(selected.map(function(id) { return api('/api/admin/feedback/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: '已处理' }) }); })).then(function() { setSelected([]); load(); }); };
  if (!data) return h('div', { className: 'loading-state' }, '加载中...');
  return h('div', null,
    h('div', { className: 'filter-bar' },
      h('div', { className: 'export-bar' }, h('button', { className: 'export-btn', onClick: function() { exportCSV(data.content || [], '游客反馈导出'); } }, '📥 CSV'))),
    h(BatchBar, { selected: selected, onClear: function() { setSelected([]); }, onBatchDelete: batchDelete, onBatchStatus: batchDone, statusOptions: [{ value: '已处理', label: '批量标记已处理' }] }),
    h('div', { className: 'page-header-bar' }, h('span', { className: 'count' }, '共 ' + (data.totalElements || 0) + ' 条反馈')),
    h('table', { className: 'data-table' },
      h('thead', null, h('tr', null, h(SelAll, { data: data.content, selected: selected, onToggleAll: toggleAll }), h('th', null, '游客'), h('th', null, '内容'), h('th', null, '时间'), h('th', null, '状态'), h('th', null, '操作'))),
      h('tbody', null, (data.content || []).map(function(f) { return h('tr', { key: f.id },
        h(SelRow, { id: f.id, selected: selected, onToggle: toggleSel }),
        h('td', null, f.name), h('td', null, (f.content || '').substring(0, 30) + '...'),
        h('td', null, fmtDate(f.createdAt)), h('td', null, statusTag(f.status)),
        h('td', { style: { whiteSpace: 'nowrap' } },
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(107,143,94,0.2)', color: '#6b8f5e', border: '1px solid rgba(107,143,94,0.3)', marginRight: 4 }, onClick: function() { setDetail(f); } }, '查看'),
          f.status === '待处理' && h('button', { className: 'btn btn-xs btn-success', style: { marginRight: 4 }, onClick: function() { markDone(f.id); } }, '标记已处理'),
          h('button', { className: 'btn btn-xs btn-danger', onClick: function() { del(f.id); } }, '删除'))); }))),
    h(Pagination, { page: page, totalPages: data.totalPages, totalElements: data.totalElements, onPage: setPage }),
    detail && h('div', null,
      h('div', { className: 'drawer-overlay', onClick: function() { setDetail(null); } }),
      h('div', { className: 'drawer-panel liquid-glass-strong', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'drawer-header' }, h('h3', null, '反馈详情'), h('button', { className: 'modal-close', onClick: function() { setDetail(null); } }, '✕')),
        [['name','游客'],['content','内容'],['status','状态'],['createdAt','时间']].map(function(pair) {
          var k = pair[0], label = pair[1];
          return h('div', { key: k, className: 'detail-row' },
            h('span', { className: 'detail-label' }, label),
            h('span', { className: 'detail-value' }, k === 'status' ? statusTag(detail[k]) : k === 'createdAt' ? fmtDate(detail[k]) : (detail[k] || '-')));
        }),
        h('div', { style: { marginTop: 20, display: 'flex', gap: 10 } },
          h('button', { className: 'btn btn-ghost', onClick: function() { setDetail(null); } }, '关闭'),
          detail.status === '待处理' && h('button', { className: 'btn btn-success', onClick: function() { markDone(detail.id); setDetail(null); } }, '标记已处理')))));
}


// ===== AssetsPage =====
function AssetsPage() {
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _p = useState(0), page = _p[0], setPage = _p[1];
  var _md = useState(null), modal = _md[0], setModal = _md[1];
  var _fm = useState({}), form = _fm[0], setForm = _fm[1];
  var _sel = useState([]), selected = _sel[0], setSelected = _sel[1];
  var load = useCallback(function() { api('/api/admin/assets?page=' + page + '&size=10').then(setData); }, [page]);
  useEffect(function() { load(); }, [load]);
  var openNew = function() { setForm({ name: '', zone: '', type: '设备', status: '正常', priority: '中', health: 100, owner: '' }); setModal('new'); };
  var openEdit = function(a) { setForm(Object.assign({}, a)); setModal('edit'); };
  var save = function() {
    var url = modal === 'new' ? '/api/admin/assets' : '/api/admin/assets/' + form.id;
    var method = modal === 'new' ? 'POST' : 'PUT';
    api(url, { method: method, body: JSON.stringify(form) }).then(function() { setModal(null); load(); });
  };
  var del = function(id) { if (confirm('确认删除？')) api('/api/admin/assets/' + id, { method: 'DELETE' }).then(load); };
  var updateStatus = function(id, status) { api('/api/admin/assets/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: status }) }).then(load); };
  var toggleSel = function(id) { setSelected(function(s) { return s.indexOf(id) >= 0 ? s.filter(function(x) { return x !== id; }) : s.concat([id]); }); };
  var toggleAll = function() { setSelected(data && data.content && selected.length === data.content.length ? [] : (data ? data.content : []).map(function(r) { return r.id; })); };
  var batchDelete = function() { if (confirm('确认删除？')) Promise.all(selected.map(function(id) { return api('/api/admin/assets/' + id, { method: 'DELETE' }); })).then(function() { setSelected([]); load(); }); };
  if (!data) return h('div', { className: 'loading-state' }, '加载中...');
  return h('div', null,
    h('div', { className: 'filter-bar' },
      h('button', { className: 'btn btn-primary btn-sm', onClick: openNew }, '+ 新增资产'),
      h('div', { className: 'export-bar' }, h('button', { className: 'export-btn', onClick: function() { exportCSV(data.content || [], '资产管理导出'); } }, '📥 CSV'))),
    h(BatchBar, { selected: selected, onClear: function() { setSelected([]); }, onBatchDelete: batchDelete }),
    h('div', { className: 'page-header-bar' }, h('span', { className: 'count' }, '共 ' + (data.totalElements || 0) + ' 项资产')),
    h('table', { className: 'data-table' },
      h('thead', null, h('tr', null, h(SelAll, { data: data.content, selected: selected, onToggleAll: toggleAll }), h('th', null, '名称'), h('th', null, '区域'), h('th', null, '类型'), h('th', null, '优先级'), h('th', null, '健康度'), h('th', null, '状态'), h('th', null, '操作'))),
      h('tbody', null, (data.content || []).map(function(a) { return h('tr', { key: a.id },
        h(SelRow, { id: a.id, selected: selected, onToggle: toggleSel }),
        h('td', null, a.name), h('td', null, a.zone || '-'), h('td', null, a.type || '-'), h('td', null, alertLevelTag(a.priority)),
        h('td', null, healthBar(a.health || 0)), h('td', null, statusTag(a.status)),
        h('td', { style: { whiteSpace: 'nowrap' } },
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(107,143,94,0.2)', color: '#6b8f5e', border: '1px solid rgba(107,143,94,0.3)', marginRight: 4 }, onClick: function() { openEdit(a); } }, '编辑'),
          a.status === '正常' ? h('button', { className: 'btn btn-xs btn-warning', style: { marginRight: 4 }, onClick: function() { updateStatus(a.id, '故障'); } }, '报故障') : h('button', { className: 'btn btn-xs btn-success', style: { marginRight: 4 }, onClick: function() { updateStatus(a.id, '正常'); } }, '恢复'),
          h('button', { className: 'btn btn-xs btn-danger', onClick: function() { del(a.id); } }, '删除'))); }))),
    h(Pagination, { page: page, totalPages: data.totalPages, totalElements: data.totalElements, onPage: setPage }),
    modal && h('div', { className: 'modal-overlay', onClick: function() { setModal(null); } },
      h('div', { className: 'modal-box liquid-glass-strong', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'modal-header' }, h('h3', null, modal === 'new' ? '新增资产' : '编辑资产'), h('button', { className: 'modal-close', onClick: function() { setModal(null); } }, '✕')),
        h('div', { className: 'modal-body' },
          h('div', { className: 'form-group' }, h('label', null, '名称'), h('input', { value: form.name || '', onChange: function(e) { setForm(Object.assign({}, form, { name: e.target.value })); } })),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '所属区域'), h('input', { value: form.zone || '', onChange: function(e) { setForm(Object.assign({}, form, { zone: e.target.value })); }, placeholder: '如: 星空营地' })),
            h('div', { className: 'form-group' }, h('label', null, '类型'), h('select', { value: form.type || '', onChange: function(e) { setForm(Object.assign({}, form, { type: e.target.value })); } }, h('option', { value: '设备' }, '设备'), h('option', { value: '设施' }, '设施'), h('option', { value: '车辆' }, '车辆'), h('option', { value: '器材' }, '器材'), h('option', { value: '其他' }, '其他')))),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '优先级'), h('select', { value: form.priority || '', onChange: function(e) { setForm(Object.assign({}, form, { priority: e.target.value })); } }, h('option', { value: '高' }, '高'), h('option', { value: '中' }, '中'), h('option', { value: '低' }, '低'))),
            h('div', { className: 'form-group' }, h('label', null, '状态'), h('select', { value: form.status || '', onChange: function(e) { setForm(Object.assign({}, form, { status: e.target.value })); } }, h('option', { value: '正常' }, '正常'), h('option', { value: '故障' }, '故障')))),
          h('div', { className: 'form-group' }, h('label', null, '健康度: ' + (form.health || 0) + '%'), h('input', { type: 'range', className: 'range-slider', min: 0, max: 100, value: form.health || 0, onChange: function(e) { setForm(Object.assign({}, form, { health: parseInt(e.target.value) || 0 })); } })),
          h('div', { className: 'form-group' }, h('label', null, '负责人'), h('input', { value: form.owner || '', onChange: function(e) { setForm(Object.assign({}, form, { owner: e.target.value })); } }))),
        h('div', { className: 'modal-footer' },
          h('button', { className: 'btn btn-ghost', onClick: function() { setModal(null); } }, '取消'),
          h('button', { className: 'btn btn-primary', onClick: save }, '保存')))));
}

// ===== InspectionsPage =====
function InspectionsPage() {
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _p = useState(0), page = _p[0], setPage = _p[1];
  var _md = useState(null), modal = _md[0], setModal = _md[1];
  var _fm = useState({}), form = _fm[0], setForm = _fm[1];
  var _sel = useState([]), selected = _sel[0], setSelected = _sel[1];
  var load = useCallback(function() { api('/api/admin/inspections?page=' + page + '&size=10').then(setData); }, [page]);
  useEffect(function() { load(); }, [load]);
  var openNew = function() { setForm({ title: '', zone: '', owner: '', frequency: '每日', dueDate: '', status: '待执行', result: '' }); setModal('new'); };
  var openEdit = function(i) { setForm(Object.assign({}, i, { dueDate: i.dueDate || '' })); setModal('edit'); };
  var save = function() {
    var url = modal === 'new' ? '/api/admin/inspections' : '/api/admin/inspections/' + form.id;
    var method = modal === 'new' ? 'POST' : 'PUT';
    api(url, { method: method, body: JSON.stringify(form) }).then(function() { setModal(null); load(); });
  };
  var del = function(id) { if (confirm('确认删除？')) api('/api/admin/inspections/' + id, { method: 'DELETE' }).then(load); };
  var updateStatus = function(id, status) { api('/api/admin/inspections/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: status }) }).then(load); };
  var execute = function(id) { api('/api/admin/inspections/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: '进行中' }) }).then(load); };
  var toggleSel = function(id) { setSelected(function(s) { return s.indexOf(id) >= 0 ? s.filter(function(x) { return x !== id; }) : s.concat([id]); }); };
  var toggleAll = function() { setSelected(data && data.content && selected.length === data.content.length ? [] : (data ? data.content : []).map(function(r) { return r.id; })); };
  var batchDelete = function() { if (confirm('确认删除？')) Promise.all(selected.map(function(id) { return api('/api/admin/inspections/' + id, { method: 'DELETE' }); })).then(function() { setSelected([]); load(); }); };
  if (!data) return h('div', { className: 'loading-state' }, '加载中...');
  return h('div', null,
    h('div', { className: 'filter-bar' },
      h('button', { className: 'btn btn-primary btn-sm', onClick: openNew }, '+ 新增巡检'),
      h('div', { className: 'export-bar' }, h('button', { className: 'export-btn', onClick: function() { exportCSV(data.content || [], '巡检管理导出'); } }, '📥 CSV'))),
    h(BatchBar, { selected: selected, onClear: function() { setSelected([]); }, onBatchDelete: batchDelete }),
    h('div', { className: 'page-header-bar' }, h('span', { className: 'count' }, '共 ' + (data.totalElements || 0) + ' 条巡检')),
    h('table', { className: 'data-table' },
      h('thead', null, h('tr', null, h(SelAll, { data: data.content, selected: selected, onToggleAll: toggleAll }), h('th', null, '标题'), h('th', null, '区域'), h('th', null, '负责人'), h('th', null, '频率'), h('th', null, '截止日期'), h('th', null, '状态'), h('th', null, '操作'))),
      h('tbody', null, (data.content || []).map(function(i) { return h('tr', { key: i.id },
        h(SelRow, { id: i.id, selected: selected, onToggle: toggleSel }),
        h('td', null, i.title), h('td', null, i.zone || '-'), h('td', null, i.owner || '-'), h('td', null, i.frequency || '-'),
        h('td', null, fmtDate(i.dueDate)), h('td', null, statusTag(i.status)),
        h('td', { style: { whiteSpace: 'nowrap' } },
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(107,143,94,0.2)', color: '#6b8f5e', border: '1px solid rgba(107,143,94,0.3)', marginRight: 4 }, onClick: function() { openEdit(i); } }, '编辑'),
          i.status === '待执行' && h('button', { className: 'btn btn-xs btn-primary', style: { marginRight: 4 }, onClick: function() { execute(i.id); } }, '执行'),
          i.status === '进行中' && h('button', { className: 'btn btn-xs btn-success', style: { marginRight: 4 }, onClick: function() { updateStatus(i.id, '已关闭'); } }, '完成'),
          h('button', { className: 'btn btn-xs btn-danger', onClick: function() { del(i.id); } }, '删除'))); }))),
    h(Pagination, { page: page, totalPages: data.totalPages, totalElements: data.totalElements, onPage: setPage }),
    modal && h('div', { className: 'modal-overlay', onClick: function() { setModal(null); } },
      h('div', { className: 'modal-box liquid-glass-strong', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'modal-header' }, h('h3', null, modal === 'new' ? '新增巡检' : '编辑巡检'), h('button', { className: 'modal-close', onClick: function() { setModal(null); } }, '✕')),
        h('div', { className: 'modal-body' },
          h('div', { className: 'form-group' }, h('label', null, '标题'), h('input', { value: form.title || '', onChange: function(e) { setForm(Object.assign({}, form, { title: e.target.value })); } })),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '区域'), h('input', { value: form.zone || '', onChange: function(e) { setForm(Object.assign({}, form, { zone: e.target.value })); } })),
            h('div', { className: 'form-group' }, h('label', null, '负责人'), h('input', { value: form.owner || '', onChange: function(e) { setForm(Object.assign({}, form, { owner: e.target.value })); } }))),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '频率'), h('select', { value: form.frequency || '', onChange: function(e) { setForm(Object.assign({}, form, { frequency: e.target.value })); } }, h('option', { value: '每日' }, '每日'), h('option', { value: '每周' }, '每周'), h('option', { value: '每月' }, '每月'), h('option', { value: '每季' }, '每季'))),
            h('div', { className: 'form-group' }, h('label', null, '截止日期'), h('input', { type: 'date', value: form.dueDate || '', onChange: function(e) { setForm(Object.assign({}, form, { dueDate: e.target.value })); } }))),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '状态'), h('select', { value: form.status || '', onChange: function(e) { setForm(Object.assign({}, form, { status: e.target.value })); } }, h('option', { value: '待执行' }, '待执行'), h('option', { value: '进行中' }, '进行中'), h('option', { value: '已关闭' }, '已关闭'))),
            h('div', { className: 'form-group' })),
          h('div', { className: 'form-group' }, h('label', null, '结果备注'), h('textarea', { rows: 3, value: form.result || '', onChange: function(e) { setForm(Object.assign({}, form, { result: e.target.value })); } }))),
        h('div', { className: 'modal-footer' },
          h('button', { className: 'btn btn-ghost', onClick: function() { setModal(null); } }, '取消'),
          h('button', { className: 'btn btn-primary', onClick: save }, '保存')))));
}


// ===== AlertsPage =====
function AlertsPage() {
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _p = useState(0), page = _p[0], setPage = _p[1];
  var _md = useState(null), modal = _md[0], setModal = _md[1];
  var _fm = useState({}), form = _fm[0], setForm = _fm[1];
  var _dt = useState(null), detail = _dt[0], setDetail = _dt[1];
  var _sel = useState([]), selected = _sel[0], setSelected = _sel[1];
  var load = useCallback(function() { api('/api/admin/alerts?page=' + page + '&size=10').then(setData); }, [page]);
  useEffect(function() { load(); }, [load]);
  var openNew = function() { setForm({ title: '', zone: '', level: '中', type: '设备告警', status: '待处理', owner: '' }); setModal('new'); };
  var openEdit = function(a) { setForm(Object.assign({}, a)); setModal('edit'); };
  var save = function() {
    var url = modal === 'new' ? '/api/admin/alerts' : '/api/admin/alerts/' + form.id;
    var method = modal === 'new' ? 'POST' : 'PUT';
    api(url, { method: method, body: JSON.stringify(form) }).then(function() { setModal(null); load(); });
  };
  var del = function(id) { if (confirm('确认删除？')) api('/api/admin/alerts/' + id, { method: 'DELETE' }).then(load); };
  var updateStatus = function(id, status) { api('/api/admin/alerts/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: status }) }).then(load); };
  var assignOwner = function(id, owner) { api('/api/admin/alerts/' + id, { method: 'PUT', body: JSON.stringify(Object.assign({}, detail, { owner: owner })) }).then(function() { setDetail(null); load(); }); };
  var toggleSel = function(id) { setSelected(function(s) { return s.indexOf(id) >= 0 ? s.filter(function(x) { return x !== id; }) : s.concat([id]); }); };
  var toggleAll = function() { setSelected(data && data.content && selected.length === data.content.length ? [] : (data ? data.content : []).map(function(r) { return r.id; })); };
  var batchDelete = function() { if (confirm('确认删除？')) Promise.all(selected.map(function(id) { return api('/api/admin/alerts/' + id, { method: 'DELETE' }); })).then(function() { setSelected([]); load(); }); };
  var batchClose = function() { Promise.all(selected.map(function(id) { return api('/api/admin/alerts/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: '已关闭' }) }); })).then(function() { setSelected([]); load(); }); };
  if (!data) return h('div', { className: 'loading-state' }, '加载中...');
  return h('div', null,
    h('div', { className: 'filter-bar' },
      h('button', { className: 'btn btn-primary btn-sm', onClick: openNew }, '+ 新增告警'),
      h('div', { className: 'export-bar' }, h('button', { className: 'export-btn', onClick: function() { exportCSV(data.content || [], '告警管理导出'); } }, '📥 CSV'))),
    h(BatchBar, { selected: selected, onClear: function() { setSelected([]); }, onBatchDelete: batchDelete, onBatchStatus: batchClose, statusOptions: [{ value: '已关闭', label: '批量关闭' }] }),
    h('div', { className: 'page-header-bar' }, h('span', { className: 'count' }, '共 ' + (data.totalElements || 0) + ' 条告警')),
    h('table', { className: 'data-table' },
      h('thead', null, h('tr', null, h(SelAll, { data: data.content, selected: selected, onToggleAll: toggleAll }), h('th', null, '标题'), h('th', null, '区域'), h('th', null, '级别'), h('th', null, '类型'), h('th', null, '时间'), h('th', null, '状态'), h('th', null, '操作'))),
      h('tbody', null, (data.content || []).map(function(a) { return h('tr', { key: a.id },
        h(SelRow, { id: a.id, selected: selected, onToggle: toggleSel }),
        h('td', null, a.title), h('td', null, a.zone || '-'), h('td', null, alertLevelTag(a.level)), h('td', null, a.type || '-'),
        h('td', null, fmtDateTime(a.createdAt)), h('td', null, statusTag(a.status)),
        h('td', { style: { whiteSpace: 'nowrap' } },
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(107,143,94,0.2)', color: '#6b8f5e', border: '1px solid rgba(107,143,94,0.3)', marginRight: 4 }, onClick: function() { setDetail(a); } }, '处理'),
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(107,143,94,0.2)', color: '#6b8f5e', border: '1px solid rgba(107,143,94,0.3)', marginRight: 4 }, onClick: function() { openEdit(a); } }, '编辑'),
          a.status === '待处理' && h('button', { className: 'btn btn-xs btn-success', style: { marginRight: 4 }, onClick: function() { updateStatus(a.id, '已关闭'); } }, '关闭'),
          h('button', { className: 'btn btn-xs btn-danger', onClick: function() { del(a.id); } }, '删除'))); }))),
    h(Pagination, { page: page, totalPages: data.totalPages, totalElements: data.totalElements, onPage: setPage }),
    detail && h('div', null,
      h('div', { className: 'drawer-overlay', onClick: function() { setDetail(null); } }),
      h('div', { className: 'drawer-panel liquid-glass-strong', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'drawer-header' }, h('h3', null, '处理告警'), h('button', { className: 'modal-close', onClick: function() { setDetail(null); } }, '✕')),
        [['title','标题'],['zone','区域'],['level','级别'],['type','类型'],['status','状态'],['createdAt','时间'],['owner','负责人']].map(function(pair) {
          var k = pair[0], label = pair[1];
          return h('div', { key: k, className: 'detail-row' },
            h('span', { className: 'detail-label' }, label),
            h('span', { className: 'detail-value' }, k === 'status' ? statusTag(detail[k]) : k === 'level' ? alertLevelTag(detail[k]) : k === 'createdAt' ? fmtDateTime(detail[k]) : (detail[k] || '-')));
        }),
        h('div', { style: { marginTop: 16 } },
          h('label', { style: { fontSize: 11, color: '#5a6a82', display: 'block', marginBottom: 4 } }, '分配负责人'),
          h('div', { style: { display: 'flex', gap: 8 } },
            h('input', { id: 'alert-owner-input', defaultValue: detail.owner || '', style: { flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#e8edf5', fontSize: 13 } }),
            h('button', { className: 'btn btn-primary btn-sm', onClick: function() { var v = document.getElementById('alert-owner-input').value; assignOwner(detail.id, v); } }, '分配'))),
        h('div', { style: { marginTop: 20, display: 'flex', gap: 10 } },
          h('button', { className: 'btn btn-ghost', onClick: function() { setDetail(null); } }, '关闭'),
          detail.status === '待处理' && h('button', { className: 'btn btn-success', onClick: function() { updateStatus(detail.id, '已关闭'); setDetail(null); } }, '关闭告警')))),
    modal && h('div', { className: 'modal-overlay', onClick: function() { setModal(null); } },
      h('div', { className: 'modal-box liquid-glass-strong', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'modal-header' }, h('h3', null, modal === 'new' ? '新增告警' : '编辑告警'), h('button', { className: 'modal-close', onClick: function() { setModal(null); } }, '✕')),
        h('div', { className: 'modal-body' },
          h('div', { className: 'form-group' }, h('label', null, '标题'), h('input', { value: form.title || '', onChange: function(e) { setForm(Object.assign({}, form, { title: e.target.value })); } })),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '区域'), h('input', { value: form.zone || '', onChange: function(e) { setForm(Object.assign({}, form, { zone: e.target.value })); } })),
            h('div', { className: 'form-group' }, h('label', null, '级别'), h('select', { value: form.level || '', onChange: function(e) { setForm(Object.assign({}, form, { level: e.target.value })); } }, h('option', { value: '高' }, '高'), h('option', { value: '中' }, '中'), h('option', { value: '低' }, '低')))),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '类型'), h('select', { value: form.type || '', onChange: function(e) { setForm(Object.assign({}, form, { type: e.target.value })); } }, h('option', { value: '设备告警' }, '设备告警'), h('option', { value: '安全告警' }, '安全告警'), h('option', { value: '环境告警' }, '环境告警'), h('option', { value: '系统告警' }, '系统告警'))),
            h('div', { className: 'form-group' }, h('label', null, '状态'), h('select', { value: form.status || '', onChange: function(e) { setForm(Object.assign({}, form, { status: e.target.value })); } }, h('option', { value: '待处理' }, '待处理'), h('option', { value: '处理中' }, '处理中'), h('option', { value: '已关闭' }, '已关闭')))),
          h('div', { className: 'form-group' }, h('label', null, '负责人'), h('input', { value: form.owner || '', onChange: function(e) { setForm(Object.assign({}, form, { owner: e.target.value })); } }))),
        h('div', { className: 'modal-footer' },
          h('button', { className: 'btn btn-ghost', onClick: function() { setModal(null); } }, '取消'),
          h('button', { className: 'btn btn-primary', onClick: save }, '保存')))));
}

// ===== UsersPage =====
function UsersPage() {
  var _d = useState(null), data = _d[0], setData = _d[1];
  var _p = useState(0), page = _p[0], setPage = _p[1];
  var _md = useState(null), modal = _md[0], setModal = _md[1];
  var _fm = useState({}), form = _fm[0], setForm = _fm[1];
  var _sel = useState([]), selected = _sel[0], setSelected = _sel[1];
  var load = useCallback(function() { api('/api/admin/users?page=' + page + '&size=10').then(setData); }, [page]);
  useEffect(function() { load(); }, [load]);
  var openNew = function() { setForm({ username: '', password: '', role: 'OPERATOR', status: 'ACTIVE', displayName: '', email: '' }); setModal('new'); };
  var openEdit = function(u) { setForm(Object.assign({}, u, { password: '' })); setModal('edit'); };
  var save = function() {
    var url = modal === 'new' ? '/api/admin/users' : '/api/admin/users/' + form.id;
    var method = modal === 'new' ? 'POST' : 'PUT';
    var body = Object.assign({}, form);
    if (modal === 'edit' && !body.password) delete body.password;
    api(url, { method: method, body: JSON.stringify(body) }).then(function() { setModal(null); load(); }).catch(function(err) { alert(err.message); });
  };
  var del = function(id) { if (confirm('确认删除该用户？')) api('/api/admin/users/' + id, { method: 'DELETE' }).then(load); };
  var toggleSel = function(id) { setSelected(function(s) { return s.indexOf(id) >= 0 ? s.filter(function(x) { return x !== id; }) : s.concat([id]); }); };
  var toggleAll = function() { setSelected(data && data.content && selected.length === data.content.length ? [] : (data ? data.content : []).map(function(r) { return r.id; })); };
  var batchDelete = function() { if (confirm('确认删除选中的 ' + selected.length + ' 个用户？')) Promise.all(selected.map(function(id) { return api('/api/admin/users/' + id, { method: 'DELETE' }); })).then(function() { setSelected([]); load(); }); };
  if (!data) return h('div', { className: 'loading-state' }, '加载中...');
  return h('div', null,
    h('div', { className: 'filter-bar' },
      h('button', { className: 'btn btn-primary btn-sm', onClick: openNew }, '+ 新增用户'),
      h('div', { className: 'export-bar' }, h('button', { className: 'export-btn', onClick: function() { exportCSV(data.content || [], '用户管理导出'); } }, '📥 CSV'))),
    h(BatchBar, { selected: selected, onClear: function() { setSelected([]); }, onBatchDelete: batchDelete }),
    h('div', { className: 'page-header-bar' }, h('span', { className: 'count' }, '共 ' + (data.totalElements || 0) + ' 个用户')),
    h('table', { className: 'data-table' },
      h('thead', null, h('tr', null, h(SelAll, { data: data.content, selected: selected, onToggleAll: toggleAll }), h('th', null, '用户名'), h('th', null, '显示名'), h('th', null, '邮箱'), h('th', null, '角色'), h('th', null, '状态'), h('th', null, '操作'))),
      h('tbody', null, (data.content || []).map(function(u) { return h('tr', { key: u.id },
        h(SelRow, { id: u.id, selected: selected, onToggle: toggleSel }),
        h('td', null, u.username), h('td', null, u.displayName || '-'), h('td', null, u.email || '-'),
        h('td', null, statusTag(u.role)), h('td', null, statusTag(u.status)),
        h('td', { style: { whiteSpace: 'nowrap' } },
          h('button', { className: 'btn btn-xs', style: { background: 'rgba(107,143,94,0.2)', color: '#6b8f5e', border: '1px solid rgba(107,143,94,0.3)', marginRight: 4 }, onClick: function() { openEdit(u); } }, '编辑'),
          h('button', { className: 'btn btn-xs btn-danger', onClick: function() { del(u.id); } }, '删除'))); }))),
    h(Pagination, { page: page, totalPages: data.totalPages, totalElements: data.totalElements, onPage: setPage }),
    modal && h('div', { className: 'modal-overlay', onClick: function() { setModal(null); } },
      h('div', { className: 'modal-box liquid-glass-strong', onClick: function(e) { e.stopPropagation(); } },
        h('div', { className: 'modal-header' }, h('h3', null, modal === 'new' ? '新增用户' : '编辑用户'), h('button', { className: 'modal-close', onClick: function() { setModal(null); } }, '✕')),
        h('div', { className: 'modal-body' },
          h('div', { className: 'form-group' }, h('label', null, '用户名'), h('input', { value: form.username || '', onChange: function(e) { setForm(Object.assign({}, form, { username: e.target.value })); }, disabled: modal === 'edit' })),
          h('div', { className: 'form-group' }, h('label', null, modal === 'edit' ? '新密码 (留空不修改)' : '密码'), h('input', { type: 'password', value: form.password || '', onChange: function(e) { setForm(Object.assign({}, form, { password: e.target.value })); }, placeholder: modal === 'edit' ? '留空则不修改密码' : '' })),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '显示名'), h('input', { value: form.displayName || '', onChange: function(e) { setForm(Object.assign({}, form, { displayName: e.target.value })); } })),
            h('div', { className: 'form-group' }, h('label', null, '邮箱'), h('input', { type: 'email', value: form.email || '', onChange: function(e) { setForm(Object.assign({}, form, { email: e.target.value })); } }))),
          h('div', { className: 'form-row' },
            h('div', { className: 'form-group' }, h('label', null, '角色'), h('select', { value: form.role || '', onChange: function(e) { setForm(Object.assign({}, form, { role: e.target.value })); } }, h('option', { value: 'ADMIN' }, '管理员'), h('option', { value: 'OPERATOR' }, '运营员'), h('option', { value: 'VIEWER' }, '观察者'))),
            h('div', { className: 'form-group' }, h('label', null, '状态'), h('select', { value: form.status || '', onChange: function(e) { setForm(Object.assign({}, form, { status: e.target.value })); } }, h('option', { value: 'ACTIVE' }, '活跃'), h('option', { value: 'INACTIVE' }, '停用'), h('option', { value: 'LOCKED' }, '锁定'))))),
        h('div', { className: 'modal-footer' },
          h('button', { className: 'btn btn-ghost', onClick: function() { setModal(null); } }, '取消'),
          h('button', { className: 'btn btn-primary', onClick: save }, '保存')))));
}

// ===== App =====
function App() {
  var _auth = useAuth(), user = _auth.user, loading = _auth.loading;
  if (loading) return h('div', { className: 'loading-state', style: { height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, '加载中...');
  if (!user) return h(LoginPage);
  return h(HashRouter, null,
    h(Routes, null,
      h(Route, { path: '/*', element: h(AppLayout, null,
          h(Routes, null,
            h(Route, { path: '/', element: h(DashboardPage) }),
            h(Route, { path: '/dashboard', element: h(DashboardPage) }),
            h(Route, { path: '/orders', element: h(OrdersPage) }),
            h(Route, { path: '/zones', element: h(ZonesPage) }),
            h(Route, { path: '/activities', element: h(ActivitiesPage) }),
            h(Route, { path: '/feedback', element: h(FeedbackPage) }),
            h(Route, { path: '/assets', element: h(AssetsPage) }),
            h(Route, { path: '/inspections', element: h(InspectionsPage) }),
            h(Route, { path: '/alerts', element: h(AlertsPage) }),
            h(Route, { path: '/users', element: h(UsersPage) })
          ))
      })
    ));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  h(AuthProvider, null, h(App))
);





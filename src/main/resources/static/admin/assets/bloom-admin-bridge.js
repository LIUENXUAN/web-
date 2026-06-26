// CampOS Bloom Admin - API Bridge v6
// No reload: on login success, trigger React's own onSuccess via form submit
// On page load, check session and auto-enter if authenticated
(function() {
  'use strict';

  function api(path, opts) {
    var headers = { 'Content-Type': 'application/json' };
    var options = { headers: headers, credentials: 'include' };
    if (opts) {
      if (opts.method) options.method = opts.method;
      if (opts.body) options.body = opts.body;
    }
    return fetch(path, options).then(function(resp) {
      return resp.json().then(function(data) {
        if (!resp.ok) throw new Error(data.msg || data.error || '请求失败');
        return data;
      });
    });
  }

  // ===== Check existing session on load =====
  function checkSession() {
    api('/api/admin', {}).then(function() {
      // Already authenticated — trigger React's onSuccess via form submit
      var form = document.querySelector('.reference-form');
      if (form) {
        form.requestSubmit();
      }
    }).catch(function() {
      // Not authenticated — normal login flow
    });
  }

  // ===== Intercept login button =====
  var checkBtn = setInterval(function() {
    var btn = document.querySelector('#btn-login');
    if (!btn) return;
    clearInterval(checkBtn);

    // Clone and replace to remove React handlers from button
    var parent = btn.parentNode;
    var newBtn = btn.cloneNode(true);
    parent.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', function(e) {
      e.preventDefault();

      var form = this.closest('form') || document.querySelector('.reference-form');
      var email = form ? (form.querySelector('#email')?.value || 'admin') : 'admin';
      var password = form ? (form.querySelector('#password')?.value || 'camp2026') : 'camp2026';
      var errorMsg = form ? form.querySelector('#error-msg') : null;
      var btnText = this.querySelector('.btn-text');

      if (btnText) btnText.textContent = '验证中…';

      api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password: password })
      }).then(function() {
        if (btnText) btnText.textContent = '登录成功！';
        // Trigger React's own onSuccess via form submit (no reload!)
        setTimeout(function() {
          if (form) form.requestSubmit();
        }, 300);
      }).catch(function() {
        if (errorMsg) {
          errorMsg.textContent = '用户名或密码错误';
          errorMsg.classList.add('visible-error');
        }
        if (btnText) btnText.textContent = 'Log In';
      });
    });
  }, 100);

  // ===== Patch dashboard =====
  function patchDashboard() {
    api('/api/admin', {}).then(function(data) {
      var statCards = document.querySelectorAll('.stat-card');
      if (statCards.length >= 3 && data.metrics) {
        var m = data.metrics;
        var items = [
          { label: '累计游客', value: (m.visitors || 0).toLocaleString() },
          { label: '预订转化率', value: m.bookingRate + '%' },
          { label: '营收估算', value: '¥' + (m.revenue || 0).toLocaleString() }
        ];
        statCards.forEach(function(c, i) {
          if (i < 3) {
            var s = c.querySelector('strong');
            var sp = c.querySelector('span');
            if (s) s.textContent = items[i].value;
            if (sp) sp.textContent = items[i].label;
          }
        });
      }
      var eco = document.querySelector('.ecosystem');
      if (eco && data.zones) {
        var h2 = eco.querySelector('h2');
        if (h2) {
          var open = data.zones.filter(function(z) { return z.status === '开放'; }).length;
          h2.textContent = open + '/' + data.zones.length + ' 营地开放中';
        }
      }
      var tiles = document.querySelectorAll('.feature-tile');
      if (tiles.length >= 3) {
        var feat = [
          { label: '营地区域', value: (data.zones || []).length + ' 个' },
          { label: '预订总数', value: (data.bookings || []).length + ' 单' },
          { label: '游客反馈', value: (data.feedback || []).length + ' 条' }
        ];
        tiles.forEach(function(t, i) {
          if (i < 3) {
            var s = t.querySelector('span');
            var st = t.querySelector('strong');
            if (s) s.textContent = feat[i].label;
            if (st) st.textContent = feat[i].value;
          }
        });
      }
      var cards = document.querySelectorAll('.data-card');
      if (cards.length >= 3) {
        var al = (data.alerts || []).filter(function(a) { return a.status === '待处理'; }).length;
        var ins = (data.inspections || []).filter(function(i) { return i.status === '待执行'; }).length;
        var fb = (data.feedback || []).filter(function(f) { return f.status === '待处理'; }).length;
        var tasks = [al + ' 条待处理告警', ins + ' 项待执行巡检', fb + ' 条待处理反馈'];
        cards.forEach(function(c, i) {
          if (i < 3) {
            var el = c.querySelector('p') || c.querySelector('strong') || c.querySelector('div');
            if (el) el.textContent = tasks[i];
          }
        });
      }
    }).catch(function() {});
  }

  var t;
  var obs = new MutationObserver(function() {
    if (t) clearTimeout(t);
    t = setTimeout(patchDashboard, 200);
  });
  obs.observe(document.body, { childList: true, subtree: true });

  // Check session first, then start patching
  setTimeout(checkSession, 500);
  patchDashboard();
  setInterval(patchDashboard, 15000);
  console.log('[CampOS Bridge] v6 active — no reload, session-aware');
})();

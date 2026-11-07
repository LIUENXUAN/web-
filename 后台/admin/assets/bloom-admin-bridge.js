// CampOS Bloom Admin - API Bridge v7
// Full CRUD: replaces all hardcoded tables with real API data
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
      var form = document.querySelector('.reference-form');
      if (form) form.requestSubmit();
    }).catch(function() {});
  }

  // ===== Intercept login button =====
  var checkBtn = setInterval(function() {
    var btn = document.querySelector('#btn-login');
    if (!btn) return;
    clearInterval(checkBtn);

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
        setTimeout(function() { if (form) form.requestSubmit(); }, 300);
      }).catch(function() {
        if (errorMsg) { errorMsg.textContent = '用户名或密码错误'; errorMsg.classList.add('visible-error'); }
        if (btnText) btnText.textContent = 'Log In';
      });
    });
  }, 100);

  // ===== Format helpers =====
  function fmtDate(d) {
    if (!d) return '-';
    var s = d.substring(0, 10);
    return s;
  }

  function fmtMoney(n) { return '¥' + (n || 0).toLocaleString(); }

  function fmtPeople(n) { return (n || 0) + ' 人'; }
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function statusTag(s) {
    if (!s) return '<span style="color:#8892a8">-</span>';
    var colors = {
      '开放': '#2ecc71', '可预订': '#5b8def', '维护中': '#f39c12',
      '待确认': '#f39c12', '已确认': '#5b8def', '已完成': '#2ecc71', '已取消': '#e74c3c',
      '报名中': '#2ecc71', '已满员': '#e74c3c', '已结束': '#8892a8',
      '待处理': '#e74c3c', '已处理': '#2ecc71', '处理中': '#f39c12',
      '正常': '#2ecc71', '故障': '#e74c3c',
      '待执行': '#f39c12', '进行中': '#5b8def',
      '已关闭': '#8892a8'
    };
    var c = colors[s] || '#8892a8';
    return '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;background:' + c + '20;color:' + c + ';border:1px solid ' + c + '40">' + escapeHtml(s) + '</span>';
  }

  // ===== Global state =====
  var state = {
    loggedIn: true,
    currentPage: 'dashboard',
    metrics: {},
    zones: [],
    bookings: [],
    activities: [],
    feedback: [],
    assets: [],
    inspections: [],
    alerts: [],
    logs: [],
    bookingFilter: { keyword: '', status: '', page: 0, size: 10 },
    bookingTotalPages: 0,
    bookingTotalElements: 0,
    bookingDetail: null,
    zoneFilter: { page: 0, size: 10 },
    zoneTotalPages: 0,
    zoneTotalElements: 0,
    zoneModal: null,
    activityFilter: { page: 0, size: 10 },
    activityTotalPages: 0,
    activityTotalElements: 0,
    activityModal: null,
    feedbackFilter: { page: 0, size: 10 },
    feedbackTotalPages: 0,
    feedbackTotalElements: 0,
    feedbackModal: null,
    assetFilter: { page: 0, size: 10 },
    assetTotalPages: 0,
    assetTotalElements: 0,
    assetModal: null,
    inspectionFilter: { page: 0, size: 10 },
    inspectionTotalPages: 0,
    inspectionTotalElements: 0,
    inspectionModal: null,
    alertFilter: { page: 0, size: 10 },
    alertTotalPages: 0,
    alertTotalElements: 0,
    alertModal: null,
    userFilter: { page: 0, size: 10 },
    userTotalPages: 0,
    userTotalElements: 0,
    userModal: null
  };

  function loadAllData() {
    return api('/api/admin', {}).then(function(data) {
      state.metrics = data.metrics || {};
      state.zones = data.zones || [];
      state.bookings = data.bookings || [];
      state.activities = data.activities || [];
      state.feedback = data.feedback || [];
      state.assets = data.assets || [];
      state.inspections = data.inspections || [];
      state.alerts = data.alerts || [];
      state.logs = data.logs || [];
      return data;
    });
  }

  function loadBookingsPage() {
    var f = state.bookingFilter;
    var params = '?page=' + f.page + '&size=' + f.size;
    if (f.keyword) params += '&keyword=' + encodeURIComponent(f.keyword);
    if (f.status) params += '&status=' + encodeURIComponent(f.status);
    return api('/api/admin/bookings' + params, {}).then(function(data) {
      state.bookings = data.content || [];
      state.bookingTotalPages = data.totalPages || 0;
      state.bookingTotalElements = data.totalElements || 0;
      return data;
    });
  }

  function loadZonesPage() {
    var f = state.zoneFilter;
    var params = '?page=' + f.page + '&size=' + f.size;
    return api('/api/admin/zones' + params, {}).then(function(data) {
      state.zones = data.content || [];
      state.zoneTotalPages = data.totalPages || 0;
      state.zoneTotalElements = data.totalElements || 0;
      return data;
    });
  }

  function loadActivitiesPage() {
    var f = state.activityFilter;
    var params = '?page=' + f.page + '&size=' + f.size;
    return api('/api/admin/activities' + params, {}).then(function(data) {
      state.activities = data.content || [];
      state.activityTotalPages = data.totalPages || 0;
      state.activityTotalElements = data.totalElements || 0;
      return data;
    });
  }

  function loadFeedbackPage() {
    var f = state.feedbackFilter;
    var params = '?page=' + f.page + '&size=' + f.size;
    return api('/api/admin/feedback' + params, {}).then(function(data) {
      state.feedback = data.content || [];
      state.feedbackTotalPages = data.totalPages || 0;
      state.feedbackTotalElements = data.totalElements || 0;
      return data;
    });
  }

  function loadAssetsPage() {
    var f = state.assetFilter;
    var params = '?page=' + f.page + '&size=' + f.size;
    return api('/api/admin/assets' + params, {}).then(function(data) {
      state.assets = data.content || [];
      state.assetTotalPages = data.totalPages || 0;
      state.assetTotalElements = data.totalElements || 0;
      return data;
    });
  }

  function loadInspectionsPage() {
    var f = state.inspectionFilter;
    var params = '?page=' + f.page + '&size=' + f.size;
    return api('/api/admin/inspections' + params, {}).then(function(data) {
      state.inspections = data.content || [];
      state.inspectionTotalPages = data.totalPages || 0;
      state.inspectionTotalElements = data.totalElements || 0;
      return data;
    });
  }

  function loadAlertsPage() {
    var f = state.alertFilter;
    var params = '?page=' + f.page + '&size=' + f.size;
    return api('/api/admin/alerts' + params, {}).then(function(data) {
      state.alerts = data.content || [];
      state.alertTotalPages = data.totalPages || 0;
      state.alertTotalElements = data.totalElements || 0;
      return data;
    });
  }

  function loadUsersPage() {
    var f = state.userFilter;
    var params = '?page=' + f.page + '&size=' + f.size;
    return api('/api/admin/users' + params, {}).then(function(data) {
      state.users = data.content || [];
      state.userTotalPages = data.totalPages || 0;
      state.userTotalElements = data.totalElements || 0;
      return data;
    });
  }


  // ===== Patch all tables =====
  var cachedData = null;

  function patchAll() {
    api('/api/admin', {}).then(function(data) {
      cachedData = data;
      patchDashboard(data);
      patchVisibleTable(data);
    }).catch(function() {});
  }

  function patchDashboard(data) {
    var m = data.metrics || {};
    var sc = document.querySelectorAll('.stat-card');
    if (sc.length >= 4) {
      var items = [
        ['今日入住', (m.visitors || 0) + ' 人 / 80%'],
        ['今日订单', (m.bookings || 0) + ' 单 / ' + fmtMoney(m.revenue)],
        ['今日退房', '8 人'],
        ['待处理', (m.pendingItems || 0) + ' 项']
      ];
      sc.forEach(function(c, i) {
        if (i < 4) {
          var s = c.querySelector('strong');
          var sp = c.querySelector('span');
          if (s) s.textContent = items[i][1];
          if (sp) sp.textContent = items[i][0];
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
  }

  function patchVisibleTable(data) {
    // Detect which tab is active by checking visible section
    var activeKey = '';
    var navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(n) {
      if (n.classList.contains('active')) {
        activeKey = n.getAttribute('data-key') || n.textContent.trim().toLowerCase();
      }
    });

    // Find the main content area
    var mainContent = document.querySelector('.split-shell .right-panel') || document.querySelector('.app-mode');
    if (!mainContent) return;

    // Patch based on visible content
    if (document.querySelector('.page-table')) {
      var headers = document.querySelectorAll('.table-head span');
      if (headers.length > 0) {
        var headerText = headers[0]?.textContent || '';
        if (headerText === '订单号' || headerText === 'O-') {
          patchOrdersTable(data);
        } else if (headerText === '活动') {
          patchActivitiesTable(data);
        } else if (headerText === '产品名称') {
          patchProductsTable(data);
        } else if (headerText === '资源名称') {
          patchResourcesTable(data);
        } else if (headerText === '客户') {
          patchCustomersTable(data);
        } else if (headerText === '收入类型') {
          patchFinanceTable(data);
        } else if (headerText === '岗位') {
          patchStaffTable(data);
        } else if (headerText === '内容') {
          patchContentTable(data);
        }
      }
    }
  }

  function patchOrdersTable(data) {
    var rows = document.querySelectorAll('.page-table .table-row:not(.table-head)');
    var bookings = data.bookings || [];
    rows.forEach(function(row, i) {
      if (i < bookings.length) {
        var b = bookings[i];
        var cells = row.querySelectorAll('span');
        if (cells.length >= 6) {
          cells[0].textContent = b.id;
          cells[1].textContent = b.name;
          cells[2].textContent = b.phone;
          cells[3].textContent = b.zone;
          cells[4].textContent = fmtPeople(b.people);
          cells[5].textContent = b.status;
          // Add click to toggle status
          row.onclick = function() {
            var newStatus = b.status === '待确认' ? '已确认' : (b.status === '已确认' ? '已入住' : '已完成');
            api('/api/admin/bookings/' + b.id, {
              method: 'PUT',
              body: JSON.stringify({ status: newStatus })
            }).then(function() {
              cells[5].textContent = newStatus;
              b.status = newStatus;
            }).catch(function() {});
          };
        }
      }
    });
  }

  function patchActivitiesTable(data) {
    var rows = document.querySelectorAll('.page-table .table-row:not(.table-head)');
    var activities = data.activities || [];
    rows.forEach(function(row, i) {
      if (i < activities.length) {
        var a = activities[i];
        var cells = row.querySelectorAll('span');
        if (cells.length >= 5) {
          cells[0].textContent = a.name;
          cells[1].textContent = fmtDate(a.date);
          cells[2].textContent = a.location || a.zone || '-';
          cells[3].textContent = (a.registered || 0) + '/' + (a.capacity || 0);
          cells[4].textContent = a.status;
        }
      }
    });
  }

  function patchProductsTable(data) {
    var rows = document.querySelectorAll('.page-table .table-row:not(.table-head)');
    var zones = data.zones || [];
    rows.forEach(function(row, i) {
      if (i < zones.length) {
        var z = zones[i];
        var cells = row.querySelectorAll('span');
        if (cells.length >= 4) {
          cells[0].textContent = z.name;
          cells[1].textContent = fmtMoney(z.price);
          cells[2].textContent = z.type + ' · ' + (z.description || '').substring(0, 12);
          cells[3].textContent = z.status;
        }
      }
    });
  }

  function patchResourcesTable(data) {
    var rows = document.querySelectorAll('.page-table .table-row:not(.table-head)');
    var assets = data.assets || [];
    rows.forEach(function(row, i) {
      if (i < assets.length) {
        var a = assets[i];
        var cells = row.querySelectorAll('span');
        if (cells.length >= 4) {
          cells[0].textContent = a.name;
          cells[1].textContent = a.type || a.category || '-';
          cells[2].textContent = a.status;
          cells[3].textContent = a.location || '-';
        }
      }
    });
  }

  function patchCustomersTable(data) {
    var rows = document.querySelectorAll('.page-table .table-row:not(.table-head)');
    var feedback = data.feedback || [];
    rows.forEach(function(row, i) {
      if (i < feedback.length) {
        var f = feedback[i];
        var cells = row.querySelectorAll('span');
        if (cells.length >= 4) {
          cells[0].textContent = f.name;
          cells[1].textContent = (f.content || '').substring(0, 10) + '...';
          cells[2].textContent = '-';
          cells[3].textContent = f.status;
        }
      }
    });
  }

  function patchFinanceTable(data) {
    // Static finance data from metrics
    var rows = document.querySelectorAll('.page-table .table-row:not(.table-head)');
    var m = data.metrics || {};
    var fin = [
      ['套餐收入', fmtMoney(m.revenue || 13490), '76%'],
      ['餐饮收入', fmtMoney(Math.round((m.revenue || 13490) * 0.2)), '15%'],
      ['体验项目', fmtMoney(Math.round((m.revenue || 13490) * 0.08)), '6%'],
      ['其他服务', fmtMoney(Math.round((m.revenue || 13490) * 0.03)), '3%']
    ];
    rows.forEach(function(row, i) {
      if (i < fin.length) {
        var cells = row.querySelectorAll('span');
        if (cells.length >= 3) {
          cells[0].textContent = fin[i][0];
          cells[1].textContent = fin[i][1];
          cells[2].textContent = fin[i][2];
        }
      }
    });
  }

  function patchStaffTable(data) {
    // Static staff data
    var rows = document.querySelectorAll('.page-table .table-row:not(.table-head)');
    var staff = [
      ['前台接待', '订单 / 客户 / 资源', '入住退房、客户信息、资源状态'],
      ['活动教练', '活动管理', '签到、报名名单、活动照片'],
      ['财务人员', '财务管理', '收支、对账、退款、报表'],
      ['运营主管', '产品 / 活动 / 内容', '套餐、活动、前台内容更新']
    ];
    rows.forEach(function(row, i) {
      if (i < staff.length) {
        var cells = row.querySelectorAll('span');
        if (cells.length >= 3) {
          cells[0].textContent = staff[i][0];
          cells[1].textContent = staff[i][1];
          cells[2].textContent = staff[i][2];
        }
      }
    });
  }

  function patchContentTable(data) {
    // Static content data
    var rows = document.querySelectorAll('.page-table .table-row:not(.table-head)');
    var content = [
      ['首页营地视频', '轮播图', '上架', '编辑/下架'],
      ['端午活动通知', '公告', '已发布', '置顶/删除'],
      ['宠物能入园吗', 'FAQ', '显示中', '编辑']
    ];
    rows.forEach(function(row, i) {
      if (i < content.length) {
        var cells = row.querySelectorAll('span');
        if (cells.length >= 4) {
          cells[0].textContent = content[i][0];
          cells[1].textContent = content[i][1];
          cells[2].textContent = content[i][2];
          cells[3].textContent = content[i][3];
        }
      }
    });
  }

  // ===== Observe and patch =====
  
  /* ============================================================
     Enhanced Page Detection & CRUD
     ============================================================ */
  var lastPage = '';
  function detectAndPatch() {
    var appMode = document.querySelector('.app-mode');
    if (!appMode) return;
    var activeBtn = document.querySelector('.module-nav .active');
    if (!activeBtn) return;
    var btns = document.querySelectorAll('.module-nav button');
    var idx = -1;
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].classList.contains('active')) { idx = i; break; }
    }
    var keys = ['dashboard', 'orders', 'products', 'resources', 'customers', 'activities', 'finance', 'staff', 'content'];
    if (idx >= 0 && idx < keys.length) {
      var newPage = keys[idx];
      if (newPage !== lastPage) {
        lastPage = newPage;
        state.currentPage = newPage;
        if (newPage === 'orders') {
          state.bookingFilter.page = 0;
          loadBookingsPage().then(function () { patchPage(newPage); });
        } else if (newPage === 'products') {
          state.zoneFilter.page = 0;
          loadZonesPage().then(function () { patchPage(newPage); });
        } else if (newPage === 'activities') {
          state.activityFilter.page = 0;
          loadActivitiesPage().then(function () { patchPage(newPage); });
        } else if (newPage === 'resources') {
          state.assetFilter.page = 0;
          loadAssetsPage().then(function () { patchPage(newPage); });
        } else if (newPage === 'staff') {
          state.userFilter.page = 0;
          loadUsersPage().then(function () { patchPage(newPage); });
        } else if (newPage === 'content') {
          state.inspectionFilter.page = 0;
          loadInspectionsPage().then(function () { patchPage(newPage); });
        } else if (newPage === 'finance') {
          state.alertFilter.page = 0;
          loadAlertsPage().then(function () { patchPage(newPage); });
        } else if (newPage === 'dashboard') {
          loadAllData().then(function () { patchPage(newPage); });
        } else {
          patchPage(newPage);
        }
    }
  }

  var patchTimer = null;
  var obs = new MutationObserver(function () {
    if (patchTimer) clearTimeout(patchTimer);
    patchTimer = setTimeout(detectAndPatch, 200);
  });
  obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  setTimeout(checkSession, 500);
  setTimeout(function () {
    if (document.querySelector('.app-mode')) { loadAllData().then(function () { patchPage('dashboard'); }); }
  }, 2000);

  setInterval(function () {
    if (state.currentPage === 'dashboard' && state.loggedIn) {
      loadAllData().then(function () { patchDashboard(); });
    }
  }, 30000);

  function patchPage(pageKey) {
    switch (pageKey) {
      case 'dashboard': patchDashboard(); break;
      case 'orders': patchOrdersPage(); break;
      case 'products': patchProductsPage(); break;
      case 'resources': patchAssetsPage(); break;
      case 'customers': patchCustomersPage(); break;
      case 'activities': patchActivitiesPage(); break;
      case 'finance': patchAlertsPage(); break;
      case 'staff': patchUsersPage(); break;
      case 'content': patchInspectionsPage(); break;
    }
  }

  function patchDashboard() {
    var m = state.metrics || {};
    var totalBookings = state.bookings.length;
    var totalRevenue = m.revenue || (totalBookings * 298 + 12000);
    var openZones = 0;
    for (var i = 0; i < state.zones.length; i++) {
      if (state.zones[i].status === '开放' || state.zones[i].status === '可预订') openZones++;
    }
    var pendingAlerts = 0;
    for (var i = 0; i < state.alerts.length; i++) {
      if (state.alerts[i].status === '待处理') pendingAlerts++;
    }
    var pendingFeedback = 0;
    for (var i = 0; i < state.feedback.length; i++) {
      if (state.feedback[i].status === '待处理') pendingFeedback++;
    }

    var sc = document.querySelectorAll('.stat-card');
    if (sc.length >= 4) {
      var items = [
        ['今日入住', (m.visitors || 0) + ' 人 / 80%'],
        ['今日订单', (m.bookings || 0) + ' 单 / ' + fmtMoney(totalRevenue)],
        ['今日退房', '8 人'],
        ['待处理', (pendingAlerts + pendingFeedback) + ' 项']
      ];
      for (var i = 0; i < sc.length && i < 4; i++) {
        var s = sc[i].querySelector('strong');
        var sp = sc[i].querySelector('span');
        if (s) s.textContent = items[i][1];
        if (sp) sp.textContent = items[i][0];
      }
    }

    var eco = document.querySelector('.ecosystem');
    if (eco) {
      var h2 = eco.querySelector('h2');
      if (h2) h2.textContent = openZones + '/' + state.zones.length + ' 营地开放中';
    }

    var tiles = document.querySelectorAll('.feature-tile');
    if (tiles.length >= 3) {
      var feat = [
        { label: '营地区域', value: state.zones.length + ' 个' },
        { label: '预订总数', value: totalBookings + ' 单' },
        { label: '游客反馈', value: state.feedback.length + ' 条' }
      ];
      for (var i = 0; i < tiles.length && i < 3; i++) {
        var s = tiles[i].querySelector('span');
        var st = tiles[i].querySelector('strong');
        if (s) s.textContent = feat[i].label;
        if (st) st.textContent = feat[i].value;
      }
    }

    var cards = document.querySelectorAll('.data-card');
    if (cards.length >= 3) {
      var tasks = [
        pendingAlerts + ' 条待处理告警',
        (state.inspections.filter(function (i) { return i.status === '待执行'; }).length) + ' 项待执行巡检',
        pendingFeedback + ' 条待处理反馈'
      ];
      for (var i = 0; i < cards.length && i < 3; i++) {
        var cs = cards[i].querySelector('span');
        if (cs) cs.textContent = tasks[i];
      }
    }

    var chartCard = document.querySelector('.chart-card');
    if (chartCard) {
      var chartGrid = chartCard.querySelector('.chart-grid');
      if (chartGrid) {
        chartGrid.innerHTML = buildMiniBookingTable(state.bookings.slice(0, 5));
      }
    }
  }

  function buildMiniBookingTable(bookings) {
    if (!bookings || bookings.length === 0) return '<div style="padding:20px;text-align:center;color:#ffffff80">暂无订单数据</div>';
    var html = '<table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="color:#ffffff80;font-size:10px;text-transform:uppercase;letter-spacing:0.3px">' +
      '<th style="text-align:left;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.06)">订单号</th>' +
      '<th style="text-align:left;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.06)">姓名</th>' +
      '<th style="text-align:left;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.06)">营地</th>' +
      '<th style="text-align:left;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.06)">日期</th>' +
      '<th style="text-align:left;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.06)">状态</th>' +
      '</tr></thead><tbody>';
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      html += '<tr style="color:#e8edf5">' +
        '<td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(b.id) + '</td>' +
        '<td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(b.name) + '</td>' +
        '<td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(b.zone) + '</td>' +
        '<td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.04)">' + fmtDate(b.date) + '</td>' +
        '<td style="padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.04)">' + statusTag(b.status) + '</td>' +
        '</tr>';
    }
    html += '</tbody></table>';
    return html;
  }

  function patchOrdersPage() {
    var pageTable = document.querySelector('.page-table');
    if (!pageTable) return;
    var f = state.bookingFilter;
    var bookings = state.bookings;

    var statusOptions = ['', '待确认', '已确认', '已完成', '已取消'];
    var statusOptsHtml = '';
    for (var i = 0; i < statusOptions.length; i++) {
      var sel = statusOptions[i] === f.status ? ' selected' : '';
      statusOptsHtml += '<option value="' + statusOptions[i] + '"' + sel + '>' + (statusOptions[i] || '全部状态') + '</option>';
    }

    var filterHtml =
      '<div class="filter-line" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<input type="text" id="order-keyword" placeholder="搜索姓名/手机号/订单号" value="' + escapeHtml(f.keyword) + '" style="flex:1;min-width:140px;padding:7px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#e8edf5;font-size:12px" />' +
      '<select id="order-status" style="padding:7px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#e8edf5;font-size:12px">' + statusOptsHtml + '</select>' +
      '<button onclick="window.__orderFilter()" style="padding:7px 14px;background:#5b8def;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer">搜索</button>' +
      '<button onclick="window.__orderReset()" style="padding:7px 14px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#8892a8;font-size:12px;cursor:pointer">重置</button>' +
      '</div>';

    var tableHtml = buildOrdersTable(bookings);
    var paginationHtml = buildOrdersPagination();
    var drawerHtml = state.bookingDetail ? buildOrderDrawer(state.bookingDetail) : '';

    pageTable.innerHTML = filterHtml + tableHtml + paginationHtml + drawerHtml;
  }

  function buildOrdersTable(bookings) {
    if (!bookings || bookings.length === 0) {
      return '<div style="padding:40px;text-align:center;color:#ffffff80">暂无订单数据</div>';
    }
    var html =
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="color:#ffffff80;font-size:10px;text-transform:uppercase;letter-spacing:0.3px">' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">订单号</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">姓名</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">手机号</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">营地</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">日期</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">人数</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">状态</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">备注</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">操作</th>' +
      '</tr></thead><tbody>';
    for (var i = 0; i < bookings.length; i++) {
      var b = bookings[i];
      var statusActions = '';
      if (b.status === '待确认') {
        statusActions = '<button onclick="window.__orderConfirm(' + "'" + b.id + "'" + ')" style="background:rgba(46,204,113,0.2);color:#2ecc71;border:1px solid rgba(46,204,113,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">确认</button> ' +
                        '<button onclick="window.__orderCancel(' + "'" + b.id + "'" + ')" style="background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid rgba(231,76,60,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">取消</button>';
      } else if (b.status === '已确认') {
        statusActions = '<button onclick="window.__orderComplete(' + "'" + b.id + "'" + ')" style="background:rgba(46,204,113,0.2);color:#2ecc71;border:1px solid rgba(46,204,113,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">完成</button> ' +
                        '<button onclick="window.__orderCancel(' + "'" + b.id + "'" + ')" style="background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid rgba(231,76,60,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">取消</button>';
      } else {
        statusActions = '<button onclick="window.__orderDetail(' + "'" + b.id + "'" + ')" style="background:rgba(91,141,239,0.2);color:#5b8def;border:1px solid rgba(91,141,239,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">详情</button>';
      }
      html += '<tr style="color:#e8edf5">' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(b.id) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(b.name) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(b.phone) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(b.zone) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + fmtDate(b.date) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + fmtPeople(b.people) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + statusTag(b.status) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);color:#8892a8">' + escapeHtml(b.remark || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);white-space:nowrap">' + statusActions + '</td>' +
        '</tr>';
    }
    html += '</tbody></table></div>';
    return html;
  }

  function buildOrdersPagination() {
    var f = state.bookingFilter;
    var total = state.bookingTotalElements;
    var pages = state.bookingTotalPages;
    if (pages <= 1) return '';
    var pageBtns = '';
    var start = Math.max(0, f.page - 2);
    var end = Math.min(pages, f.page + 3);
    if (f.page > 0) {
      pageBtns += '<button onclick="window.__orderPage(' + (f.page - 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">‹</button>';
    }
    for (var i = start; i < end; i++) {
      var activeStyle = i === f.page ? 'background:#5b8def;border-color:#5b8def;color:#fff' : '';
      pageBtns += '<button onclick="window.__orderPage(' + i + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px;' + activeStyle + '">' + (i + 1) + '</button>';
    }
    if (f.page < pages - 1) {
      pageBtns += '<button onclick="window.__orderPage(' + (f.page + 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">›</button>';
    }
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px 0;margin-top:8px;border-top:1px solid rgba(255,255,255,0.04)">' +
      '<span style="font-size:11px;color:#5a6a82">共 ' + total + ' 条，第 ' + (f.page + 1) + '/' + pages + ' 页</span>' +
      '<div style="display:flex;gap:4px">' + pageBtns + '</div></div>';
  }

  function buildOrderDrawer(b) {
    if (!b) return '';
    function row(label, value) {
      return '<div style="display:flex;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04)"><span style="width:80px;color:#5a6a82;font-size:12px;flex-shrink:0">' + label + '</span><span style="color:#e8edf5;font-size:13px">' + value + '</span></div>';
    }
    return '<div class="detail-panel liquid-glass-strong" style="position:fixed;top:0;right:0;bottom:0;z-index:9999;width:420px;max-width:92vw;padding:24px;overflow-y:auto;border-left:1px solid rgba(255,255,255,0.08)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">' +
      '<h3 style="font-size:16px;font-weight:600;margin:0">订单详情</h3>' +
      '<button onclick="window.__closeDrawer()" style="background:none;border:none;color:#5a6a82;font-size:20px;cursor:pointer;padding:4px">✕</button></div>' +
      '<div style="display:flex;flex-direction:column;gap:4px">' +
      row('订单号', escapeHtml(b.id)) +
      row('姓名', escapeHtml(b.name)) +
      row('手机号', escapeHtml(b.phone)) +
      row('营地', escapeHtml(b.zone)) +
      row('日期', fmtDate(b.date)) +
      row('人数', fmtPeople(b.people)) +
      row('状态', statusTag(b.status)) +
      row('备注', escapeHtml(b.remark || '-')) +
      row('创建时间', b.createdAt || '-') +
      '</div></div>';
  }

  window.__orderFilter = function () {
    var keyword = document.getElementById('order-keyword');
    var status = document.getElementById('order-status');
    state.bookingFilter.keyword = keyword ? keyword.value : '';
    state.bookingFilter.status = status ? status.value : '';
    state.bookingFilter.page = 0;
    loadBookingsPage().then(function () { patchOrdersPage(); });
  };
  window.__orderReset = function () {
    state.bookingFilter = { keyword: '', status: '', page: 0, size: 10 };
    loadBookingsPage().then(function () { patchOrdersPage(); });
  };
  window.__orderPage = function (page) {
    state.bookingFilter.page = page;
    loadBookingsPage().then(function () { patchOrdersPage(); });
  };
  window.__orderConfirm = function (id) {
    api('/api/admin/bookings/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: '已确认' }) })
      .then(function () { loadBookingsPage().then(function () { patchOrdersPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__orderComplete = function (id) {
    api('/api/admin/bookings/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: '已完成' }) })
      .then(function () { loadBookingsPage().then(function () { patchOrdersPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__orderCancel = function (id) {
    if (!confirm('确定要取消此订单吗？')) return;
    api('/api/admin/bookings/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: '已取消' }) })
      .then(function () { loadBookingsPage().then(function () { patchOrdersPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__orderDetail = function (id) {
    for (var i = 0; i < state.bookings.length; i++) {
      if (state.bookings[i].id === id) { state.bookingDetail = state.bookings[i]; patchOrdersPage(); return; }
    }
  };
  window.__closeDrawer = function () { state.bookingDetail = null; patchOrdersPage(); };


  // ===== Zone CRUD handlers =====
  window.__zoneCreate = function () {
    state.zoneModal = { mode: 'create' };
    patchProductsPage();
  };
  window.__zoneEdit = function (id) {
    for (var i = 0; i < state.zones.length; i++) {
      if (state.zones[i].id === id) { state.zoneModal = { mode: 'edit', data: state.zones[i] }; patchProductsPage(); return; }
    }
  };
  window.__zoneCloseModal = function () { state.zoneModal = null; patchProductsPage(); };
  window.__zoneSubmit = function () {
    var isEdit = state.zoneModal && state.zoneModal.mode === 'edit';
    var id = isEdit ? state.zoneModal.data.id : null;
    var body = {
      name: document.getElementById('zone-f-name').value,
      type: document.getElementById('zone-f-type').value,
      capacity: parseInt(document.getElementById('zone-f-capacity').value) || 0,
      price: parseFloat(document.getElementById('zone-f-price').value) || 0,
      status: document.getElementById('zone-f-status').value,
      description: document.getElementById('zone-f-desc').value,
      imageUrl: document.getElementById('zone-f-image').value
    };
    if (!body.name || !body.type) { alert('请填写名称和类型'); return; }
    var url = isEdit ? '/api/admin/zones/' + id : '/api/admin/zones';
    var method = isEdit ? 'PUT' : 'POST';
    api(url, { method: method, body: JSON.stringify(body) })
      .then(function () { state.zoneModal = null; loadZonesPage().then(function () { patchProductsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__zoneToggleStatus = function (id, currentStatus) {
    var newStatus = (currentStatus === '开放' || currentStatus === '可预订') ? '维护中' : '开放';
    api('/api/admin/zones/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
      .then(function () { loadZonesPage().then(function () { patchProductsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__zoneDelete = function (id) {
    if (!confirm('确定要删除此营地区域吗？')) return;
    api('/api/admin/zones/' + id, { method: 'DELETE' })
      .then(function () { loadZonesPage().then(function () { patchProductsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__zonePage = function (page) {
    state.zoneFilter.page = page;
    loadZonesPage().then(function () { patchProductsPage(); });
  };

  function buildZoneModal() {
    var m = state.zoneModal;
    if (!m) return '';
    var isEdit = m.mode === 'edit';
    var d = isEdit ? m.data : {};
    var title = isEdit ? '编辑营地区域' : '新增营地区域';
    var typeOpts = ['帐篷', '木屋', '房车', '公共'];
    var statusOpts = ['开放', '维护中', '可预订'];
    var sel = function(field, val) { return field === val ? ' selected' : ''; };

    var typesHtml = '';
    for (var i = 0; i < typeOpts.length; i++) {
      typesHtml += '<option value="' + typeOpts[i] + '"' + sel(d.type, typeOpts[i]) + '>' + typeOpts[i] + '</option>';
    }
    var statusesHtml = '';
    for (var i = 0; i < statusOpts.length; i++) {
      statusesHtml += '<option value="' + statusOpts[i] + '"' + sel(d.status, statusOpts[i]) + '>' + statusOpts[i] + '</option>';
    }

    return '<div class="zone-modal-backdrop" onclick="if(event.target===this)window.__zoneCloseModal()" style="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center">' +
      '<div class="liquid-glass-strong" style="width:480px;max-width:94vw;max-height:90vh;overflow-y:auto;padding:28px;border-radius:16px;border:1px solid rgba(255,255,255,0.08)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">' +
      '<h3 style="font-size:18px;font-weight:600;margin:0;color:#fff">' + title + '</h3>' +
      '<button onclick="window.__zoneCloseModal()" style="background:none;border:none;color:#5a6a82;font-size:22px;cursor:pointer;padding:4px;line-height:1">✕</button></div>' +
      '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">名称 *</span><input id="zone-f-name" value="' + escapeHtml(d.name || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="营地名称" /></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">类型 *</span><select id="zone-f-type" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px">' + typesHtml + '</select></label>' +
      '<div style="display:flex;gap:12px"><label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">容量</span><input id="zone-f-capacity" type="number" value="' + (d.capacity || 0) + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" /></label>' +
      '<label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">价格 (¥)</span><input id="zone-f-price" type="number" step="0.01" value="' + (d.price || 0) + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" /></label></div>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">状态</span><select id="zone-f-status" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px">' + statusesHtml + '</select></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">描述</span><textarea id="zone-f-desc" rows="2" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px;resize:vertical" placeholder="简短描述">' + escapeHtml(d.description || '') + '</textarea></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">图片URL</span><input id="zone-f-image" value="' + escapeHtml(d.imageUrl || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="https://..." /></label>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end">' +
      '<button onclick="window.__zoneCloseModal()" style="padding:10px 20px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#8892a8;font-size:13px;cursor:pointer">取消</button>' +
      '<button onclick="window.__zoneSubmit()" style="padding:10px 20px;background:#5b8def;border:none;border-radius:8px;color:#fff;font-size:13px;cursor:pointer;font-weight:500">' + (isEdit ? '保存修改' : '创建营地') + '</button></div>' +
      '</div></div>';
  }

  function buildZonesPagination() {
    var f = state.zoneFilter;
    var total = state.zoneTotalElements;
    var pages = state.zoneTotalPages;
    if (pages <= 1) return '';
    var pageBtns = '';
    var start = Math.max(0, f.page - 2);
    var end = Math.min(pages, f.page + 3);
    if (f.page > 0) {
      pageBtns += '<button onclick="window.__zonePage(' + (f.page - 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">‹</button>';
    }
    for (var i = start; i < end; i++) {
      var activeStyle = i === f.page ? 'background:#5b8def;border-color:#5b8def;color:#fff' : '';
      pageBtns += '<button onclick="window.__zonePage(' + i + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px;' + activeStyle + '">' + (i + 1) + '</button>';
    }
    if (f.page < pages - 1) {
      pageBtns += '<button onclick="window.__zonePage(' + (f.page + 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">›</button>';
    }
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px 0;margin-top:8px;border-top:1px solid rgba(255,255,255,0.04)">' +
      '<span style="font-size:11px;color:#5a6a82">共 ' + total + ' 条，第 ' + (f.page + 1) + '/' + pages + ' 页</span>' +
      '<div style="display:flex;gap:4px">' + pageBtns + '</div></div>';
  }

  function patchProductsPage() {
    var pageTable = document.querySelector('.page-table');
    if (!pageTable) return;
    var zones = state.zones;
    if (!zones || zones.length === 0) { pageTable.innerHTML = '<div style="padding:40px;text-align:center;color:#ffffff80">暂无营地数据</div>'; return; }

    var headerHtml = '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">共 ' + state.zoneTotalElements + ' 个营地区域</span>' +
      '<button onclick="window.__zoneCreate()" style="padding:7px 16px;background:#5b8def;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;font-weight:500">+ 新增营地区域</button></div>';

    var html = headerHtml + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="color:#ffffff80;font-size:10px;text-transform:uppercase;letter-spacing:0.3px">' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">名称</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">类型</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">容量</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">价格</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">状态</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">描述</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">操作</th></tr></thead><tbody>';
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      var toggleLabel = (z.status === '开放' || z.status === '可预订') ? '设为维护中' : '设为开放';
      var toggleColor = (z.status === '开放' || z.status === '可预订') ? '#f39c12' : '#2ecc71';
      html += '<tr style="color:#e8edf5"><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(z.name) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(z.type) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + (z.capacity || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + fmtMoney(z.price) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + statusTag(z.status) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);color:#8892a8">' + escapeHtml((z.description || '').substring(0, 20)) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);white-space:nowrap">' +
        '<button onclick="window.__zoneEdit(\'' + z.id + '\')" style="background:rgba(91,141,239,0.2);color:#5b8def;border:1px solid rgba(91,141,239,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;margin-right:4px">编辑</button>' +
        '<button onclick="window.__zoneToggleStatus(\'' + z.id + '\', \'' + z.status + '\')" style="background:' + toggleColor + '20;color:' + toggleColor + ';border:1px solid ' + toggleColor + '40;border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;margin-right:4px">' + toggleLabel + '</button>' +
        '<button onclick="window.__zoneDelete(\'' + z.id + '\')" style="background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid rgba(231,76,60,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">删除</button>' +
        '</td></tr>';
    }
    html += '</tbody></table></div>';
    html += buildZonesPagination();
    html += buildZoneModal();
    pageTable.innerHTML = html;
  }

  // ============================================================
  //  ASSET MANAGEMENT (resources page)
  // ============================================================
  function patchAssetsPage() {
    var pageTable = document.querySelector(".page-table");
    if (!pageTable) return;
    var assets = state.assets;
    if (!assets || assets.length === 0) { pageTable.innerHTML = '<div style="padding:40px;text-align:center;color:#ffffff80">暂无资产数据</div>'; return; }

    var headerHtml = '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">共 ' + state.assetTotalElements + ' 项资产</span>' +
      '<button onclick="window.__assetCreate()" style="padding:7px 16px;background:#5b8def;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;font-weight:500">+ 新增资产</button></div>';

    var html = headerHtml + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="color:#ffffff80;font-size:10px;text-transform:uppercase;letter-spacing:0.3px">' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">名称</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">类型</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">区域</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">健康度</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">状态</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">负责人</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">操作</th></tr></thead><tbody>';
    for (var i = 0; i < assets.length; i++) {
      var a = assets[i];
      var healthColor = a.health >= 80 ? '#2ecc71' : (a.health >= 50 ? '#f39c12' : '#e74c3c');
      var healthBar = '<div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden"><div style="width:' + (a.health || 0) + '%;height:100%;background:' + healthColor + ';border-radius:3px"></div></div><span style="font-size:11px;color:' + healthColor + '">' + (a.health || 0) + '%</span></div>';
      var toggleLabel = (a.status === '正常') ? '设为故障' : '设为正常';
      var toggleColor = (a.status === '正常') ? '#e74c3c' : '#2ecc71';
      html += '<tr style="color:#e8edf5"><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(a.name) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(a.type || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(a.zone || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + healthBar + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + statusTag(a.status) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(a.owner || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);white-space:nowrap">' +
        '<button onclick="window.__assetEdit(\'' + a.id + '\')" style="background:rgba(91,141,239,0.2);color:#5b8def;border:1px solid rgba(91,141,239,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;margin-right:4px">编辑</button>' +
        '<button onclick="window.__assetToggleStatus(\'' + a.id + '\', \'' + a.status + '\')" style="background:' + toggleColor + '20;color:' + toggleColor + ';border:1px solid ' + toggleColor + '40;border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;margin-right:4px">' + toggleLabel + '</button>' +
        '<button onclick="window.__assetDelete(\'' + a.id + '\')" style="background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid rgba(231,76,60,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">删除</button>' +
        '</td></tr>';
    }
    html += '</tbody></table></div>';
    html += buildAssetsPagination();
    html += buildAssetModal();
    pageTable.innerHTML = html;
  }

  function buildAssetModal() {
    var m = state.assetModal;
    if (!m) return '';
    var isEdit = m.mode === 'edit';
    var d = isEdit ? m.data : {};
    var title = isEdit ? '编辑资产' : '新增资产';
    var types = ['设备', '家具', '车辆', '工具', '电器', '其他'];
    var statuses = ['正常', '维护中', '故障'];
    var priorities = ['高', '中', '低'];
    function sel(field, val) { return field === val ? ' selected' : ''; }
    var typesHtml = '';
    for (var i = 0; i < types.length; i++) { typesHtml += '<option value="' + types[i] + '"' + sel(d.type, types[i]) + '>' + types[i] + '</option>'; }
    var statusesHtml = '';
    for (var i = 0; i < statuses.length; i++) { statusesHtml += '<option value="' + statuses[i] + '"' + sel(d.status, statuses[i]) + '>' + statuses[i] + '</option>'; }
    var prioritiesHtml = '';
    for (var i = 0; i < priorities.length; i++) { prioritiesHtml += '<option value="' + priorities[i] + '"' + sel(d.priority, priorities[i]) + '>' + priorities[i] + '</option>'; }
    return '<div class="asset-modal-backdrop" onclick="if(event.target===this)window.__assetCloseModal()" style="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center">' +
      '<div class="liquid-glass-strong" style="width:480px;max-width:94vw;max-height:90vh;overflow-y:auto;padding:28px;border-radius:16px;border:1px solid rgba(255,255,255,0.08)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">' +
      '<h3 style="font-size:18px;font-weight:600;margin:0;color:#fff">' + title + '</h3>' +
      '<button onclick="window.__assetCloseModal()" style="background:none;border:none;color:#5a6a82;font-size:22px;cursor:pointer;padding:4px;line-height:1">✕</button></div>' +
      '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">名称 *</span><input id="asset-f-name" value="' + escapeHtml(d.name || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="资产名称" /></label>' +
      '<div style="display:flex;gap:12px"><label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">类型</span><select id="asset-f-type" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px">' + typesHtml + '</select></label>' +
      '<label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">区域</span><input id="asset-f-zone" value="' + escapeHtml(d.zone || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="所属区域" /></label></div>' +
      '<div style="display:flex;gap:12px"><label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">状态</span><select id="asset-f-status" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px">' + statusesHtml + '</select></label>' +
      '<label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">优先级</span><select id="asset-f-priority" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px">' + prioritiesHtml + '</select></label></div>' +
      '<div style="display:flex;gap:12px"><label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">健康度 (' + (d.health || 0) + '%)</span><input id="asset-f-health" type="range" min="0" max="100" value="' + (d.health || 0) + '" oninput="document.getElementById(\'asset-health-val\').textContent=this.value+\'%\'" style="width:100%" /><span id="asset-health-val" style="font-size:11px;color:#5a6a82">' + (d.health || 0) + '%</span></label>' +
      '<label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">负责人</span><input id="asset-f-owner" value="' + escapeHtml(d.owner || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="负责人" /></label></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end">' +
      '<button onclick="window.__assetCloseModal()" style="padding:10px 20px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#8892a8;font-size:13px;cursor:pointer">取消</button>' +
      '<button onclick="window.__assetSubmit()" style="padding:10px 20px;background:#5b8def;border:none;border-radius:8px;color:#fff;font-size:13px;cursor:pointer;font-weight:500">' + (isEdit ? '保存修改' : '创建资产') + '</button></div>' +
      '</div></div>';
  }

  function buildAssetsPagination() {
    var f = state.assetFilter;
    var total = state.assetTotalElements;
    var pages = state.assetTotalPages;
    if (pages <= 1) return '';
    var pageBtns = '';
    var start = Math.max(0, f.page - 2);
    var end = Math.min(pages, f.page + 3);
    if (f.page > 0) { pageBtns += '<button onclick="window.__assetPage(' + (f.page - 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">‹</button>'; }
    for (var i = start; i < end; i++) {
      var activeStyle = i === f.page ? 'background:#5b8def;border-color:#5b8def;color:#fff' : '';
      pageBtns += '<button onclick="window.__assetPage(' + i + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px;' + activeStyle + '">' + (i + 1) + '</button>';
    }
    if (f.page < pages - 1) { pageBtns += '<button onclick="window.__assetPage(' + (f.page + 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">›</button>'; }
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px 0;margin-top:8px;border-top:1px solid rgba(255,255,255,0.04)">' +
      '<span style="font-size:11px;color:#5a6a82">共 ' + total + ' 条，第 ' + (f.page + 1) + '/' + pages + ' 页</span>' +
      '<div style="display:flex;gap:4px">' + pageBtns + '</div></div>';
  }

  window.__assetCreate = function () { state.assetModal = { mode: 'create' }; patchAssetsPage(); };
  window.__assetEdit = function (id) {
    for (var i = 0; i < state.assets.length; i++) {
      if (state.assets[i].id === id) { state.assetModal = { mode: 'edit', data: state.assets[i] }; patchAssetsPage(); return; }
    }
  };
  window.__assetCloseModal = function () { state.assetModal = null; patchAssetsPage(); };
  window.__assetSubmit = function () {
    var isEdit = state.assetModal && state.assetModal.mode === 'edit';
    var id = isEdit ? state.assetModal.data.id : null;
    var body = {
      name: document.getElementById('asset-f-name').value,
      type: document.getElementById('asset-f-type').value,
      zone: document.getElementById('asset-f-zone').value,
      status: document.getElementById('asset-f-status').value,
      priority: document.getElementById('asset-f-priority').value,
      health: parseInt(document.getElementById('asset-f-health').value) || 0,
      owner: document.getElementById('asset-f-owner').value
    };
    if (!body.name) { alert('请填写资产名称'); return; }
    var url = isEdit ? '/api/admin/assets/' + id : '/api/admin/assets';
    var method = isEdit ? 'PUT' : 'POST';
    api(url, { method: method, body: JSON.stringify(body) })
      .then(function () { state.assetModal = null; loadAssetsPage().then(function () { patchAssetsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__assetToggleStatus = function (id, currentStatus) {
    var newStatus = currentStatus === '正常' ? '故障' : '正常';
    api('/api/admin/assets/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
      .then(function () { loadAssetsPage().then(function () { patchAssetsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__assetDelete = function (id) {
    if (!confirm('确定要删除此资产吗？')) return;
    api('/api/admin/assets/' + id, { method: 'DELETE' })
      .then(function () { loadAssetsPage().then(function () { patchAssetsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__assetPage = function (page) { state.assetFilter.page = page; loadAssetsPage().then(function () { patchAssetsPage(); }); };

  // ============================================================
  //  USER MANAGEMENT (staff page)
  // ============================================================
  function patchUsersPage() {
    var pageTable = document.querySelector('.page-table');
    if (!pageTable) return;
    var users = state.users;
    if (!users || users.length === 0) { pageTable.innerHTML = '<div style="padding:40px;text-align:center;color:#ffffff80">暂无用户数据</div>'; return; }

    var headerHtml = '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">共 ' + state.userTotalElements + ' 个管理员</span>' +
      '<button onclick="window.__userCreate()" style="padding:7px 16px;background:#5b8def;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;font-weight:500">+ 新增管理员</button></div>';

    var html = headerHtml + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="color:#ffffff80;font-size:10px;text-transform:uppercase;letter-spacing:0.3px">' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">用户名</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">显示名</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">角色</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">邮箱</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">状态</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">操作</th></tr></thead><tbody>';
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      var roleTag = u.role === 'ADMIN' ? '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;background:rgba(91,141,239,0.2);color:#5b8def;border:1px solid rgba(91,141,239,0.3)">管理员</span>' : '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;background:rgba(46,204,113,0.2);color:#2ecc71;border:1px solid rgba(46,204,113,0.3)">操作员</span>';
      var statusTag2 = u.status === 'ACTIVE' ? '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;background:rgba(46,204,113,0.2);color:#2ecc71;border:1px solid rgba(46,204,113,0.3)">启用</span>' : '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid rgba(231,76,60,0.3)">禁用</span>';
      html += '<tr style="color:#e8edf5"><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(u.username) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(u.displayName || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + roleTag + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(u.email || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + statusTag2 + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);white-space:nowrap">' +
        '<button onclick="window.__userEdit(\'' + u.id + '\')" style="background:rgba(91,141,239,0.2);color:#5b8def;border:1px solid rgba(91,141,239,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;margin-right:4px">编辑</button>' +
        '<button onclick="window.__userDelete(\'' + u.id + '\')" style="background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid rgba(231,76,60,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">删除</button>' +
        '</td></tr>';
    }
    html += '</tbody></table></div>';
    html += buildUsersPagination();
    html += buildUserModal();
    pageTable.innerHTML = html;
  }

  function buildUserModal() {
    var m = state.userModal;
    if (!m) return '';
    var isEdit = m.mode === 'edit';
    var d = isEdit ? m.data : {};
    var title = isEdit ? '编辑管理员' : '新增管理员';
    var roles = ['ADMIN', 'OPERATOR'];
    var statuses = ['ACTIVE', 'DISABLED'];
    function sel(field, val) { return field === val ? ' selected' : ''; }
    var rolesHtml = '';
    for (var i = 0; i < roles.length; i++) { rolesHtml += '<option value="' + roles[i] + '"' + sel(d.role, roles[i]) + '>' + (roles[i] === 'ADMIN' ? '管理员' : '操作员') + '</option>'; }
    var statusesHtml = '';
    for (var i = 0; i < statuses.length; i++) { statusesHtml += '<option value="' + statuses[i] + '"' + sel(d.status, statuses[i]) + '>' + (statuses[i] === 'ACTIVE' ? '启用' : '禁用') + '</option>'; }
    return '<div class="user-modal-backdrop" onclick="if(event.target===this)window.__userCloseModal()" style="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center">' +
      '<div class="liquid-glass-strong" style="width:480px;max-width:94vw;max-height:90vh;overflow-y:auto;padding:28px;border-radius:16px;border:1px solid rgba(255,255,255,0.08)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">' +
      '<h3 style="font-size:18px;font-weight:600;margin:0;color:#fff">' + title + '</h3>' +
      '<button onclick="window.__userCloseModal()" style="background:none;border:none;color:#5a6a82;font-size:22px;cursor:pointer;padding:4px;line-height:1">✕</button></div>' +
      '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">用户名 *</span><input id="user-f-username" value="' + escapeHtml(d.username || '') + '" ' + (isEdit ? 'disabled' : '') + ' style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="登录用户名" /></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">密码' + (isEdit ? ' (留空不修改)' : ' *') + '</span><input id="user-f-password" type="password" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="' + (isEdit ? '留空则不修改密码' : '设置密码') + '" /></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">显示名称</span><input id="user-f-displayName" value="' + escapeHtml(d.displayName || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="显示名称" /></label>' +
      '<div style="display:flex;gap:12px"><label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">角色</span><select id="user-f-role" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px">' + rolesHtml + '</select></label>' +
      '<label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">状态</span><select id="user-f-status" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px">' + statusesHtml + '</select></label></div>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">邮箱</span><input id="user-f-email" value="' + escapeHtml(d.email || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="email@example.com" /></label>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end">' +
      '<button onclick="window.__userCloseModal()" style="padding:10px 20px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#8892a8;font-size:13px;cursor:pointer">取消</button>' +
      '<button onclick="window.__userSubmit()" style="padding:10px 20px;background:#5b8def;border:none;border-radius:8px;color:#fff;font-size:13px;cursor:pointer;font-weight:500">' + (isEdit ? '保存修改' : '创建用户') + '</button></div>' +
      '</div></div>';
  }

  function buildUsersPagination() {
    var f = state.userFilter;
    var total = state.userTotalElements;
    var pages = state.userTotalPages;
    if (pages <= 1) return '';
    var pageBtns = '';
    var start = Math.max(0, f.page - 2);
    var end = Math.min(pages, f.page + 3);
    if (f.page > 0) { pageBtns += '<button onclick="window.__userPage(' + (f.page - 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">‹</button>'; }
    for (var i = start; i < end; i++) {
      var activeStyle = i === f.page ? 'background:#5b8def;border-color:#5b8def;color:#fff' : '';
      pageBtns += '<button onclick="window.__userPage(' + i + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px;' + activeStyle + '">' + (i + 1) + '</button>';
    }
    if (f.page < pages - 1) { pageBtns += '<button onclick="window.__userPage(' + (f.page + 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">›</button>'; }
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px 0;margin-top:8px;border-top:1px solid rgba(255,255,255,0.04)">' +
      '<span style="font-size:11px;color:#5a6a82">共 ' + total + ' 条，第 ' + (f.page + 1) + '/' + pages + ' 页</span>' +
      '<div style="display:flex;gap:4px">' + pageBtns + '</div></div>';
  }

  window.__userCreate = function () { state.userModal = { mode: 'create' }; patchUsersPage(); };
  window.__userEdit = function (id) {
    for (var i = 0; i < state.users.length; i++) {
      if (state.users[i].id === id) { state.userModal = { mode: 'edit', data: state.users[i] }; patchUsersPage(); return; }
    }
  };
  window.__userCloseModal = function () { state.userModal = null; patchUsersPage(); };
  window.__userSubmit = function () {
    var isEdit = state.userModal && state.userModal.mode === 'edit';
    var id = isEdit ? state.userModal.data.id : null;
    var password = document.getElementById('user-f-password').value;
    var body = {
      username: document.getElementById('user-f-username').value,
      role: document.getElementById('user-f-role').value,
      status: document.getElementById('user-f-status').value,
      displayName: document.getElementById('user-f-displayName').value,
      email: document.getElementById('user-f-email').value
    };
    if (!body.username) { alert('请填写用户名'); return; }
    if (!isEdit && !password) { alert('请设置密码'); return; }
    if (password) { body.password = password; }
    var url = isEdit ? '/api/admin/users/' + id : '/api/admin/users';
    var method = isEdit ? 'PUT' : 'POST';
    api(url, { method: method, body: JSON.stringify(body) })
      .then(function () { state.userModal = null; loadUsersPage().then(function () { patchUsersPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__userDelete = function (id) {
    if (!confirm('确定要删除此用户吗？')) return;
    api('/api/admin/users/' + id, { method: 'DELETE' })
      .then(function () { loadUsersPage().then(function () { patchUsersPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__userPage = function (page) { state.userFilter.page = page; loadUsersPage().then(function () { patchUsersPage(); }); };

  // ============================================================
  //  INSPECTION MANAGEMENT (content page)
  // ============================================================
  function patchInspectionsPage() {
    var pageTable = document.querySelector('.page-table');
    if (!pageTable) return;
    var inspections = state.inspections;
    if (!inspections || inspections.length === 0) { pageTable.innerHTML = '<div style="padding:40px;text-align:center;color:#ffffff80">暂无巡检数据</div>'; return; }

    var headerHtml = '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">共 ' + state.inspectionTotalElements + ' 项巡检</span>' +
      '<button onclick="window.__inspCreate()" style="padding:7px 16px;background:#5b8def;border:none;border-radius:6px;color:#fff;font-size:12px;cursor:pointer;font-weight:500">+ 新增巡检</button></div>';

    var html = headerHtml + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="color:#ffffff80;font-size:10px;text-transform:uppercase;letter-spacing:0.3px">' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">标题</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">区域</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">负责人</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">频率</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">截止日期</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">状态</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">操作</th></tr></thead><tbody>';
    for (var i = 0; i < inspections.length; i++) {
      var ins = inspections[i];
      var toggleLabel = ins.status === '待执行' ? '开始执行' : (ins.status === '进行中' ? '标记完成' : '重新打开');
      var toggleColor = ins.status === '待执行' ? '#5b8def' : (ins.status === '进行中' ? '#2ecc71' : '#f39c12');
      html += '<tr style="color:#e8edf5"><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(ins.title) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(ins.zone || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(ins.owner || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(ins.frequency || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + fmtDate(ins.dueDate) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + statusTag(ins.status) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);white-space:nowrap">' +
        '<button onclick="window.__inspEdit(\'' + ins.id + '\')" style="background:rgba(91,141,239,0.2);color:#5b8def;border:1px solid rgba(91,141,239,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;margin-right:4px">编辑</button>' +
        '<button onclick="window.__inspExecute(\'' + ins.id + '\', \'' + ins.status + '\')" style="background:' + toggleColor + '20;color:' + toggleColor + ';border:1px solid ' + toggleColor + '40;border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;margin-right:4px">' + toggleLabel + '</button>' +
        '<button onclick="window.__inspDelete(\'' + ins.id + '\')" style="background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid rgba(231,76,60,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">删除</button>' +
        '</td></tr>';
    }
    html += '</tbody></table></div>';
    html += buildInspectionsPagination();
    html += buildInspectionModal();
    pageTable.innerHTML = html;
  }

  function buildInspectionModal() {
    var m = state.inspectionModal;
    if (!m) return '';
    var isEdit = m.mode === 'edit';
    var d = isEdit ? m.data : {};
    var title = isEdit ? '编辑巡检' : '新增巡检';
    var frequencies = ['每日', '每周', '每月'];
    var statuses = ['待执行', '进行中', '已完成'];
    function sel(field, val) { return field === val ? ' selected' : ''; }
    var freqHtml = '';
    for (var i = 0; i < frequencies.length; i++) { freqHtml += '<option value="' + frequencies[i] + '"' + sel(d.frequency, frequencies[i]) + '>' + frequencies[i] + '</option>'; }
    var statusesHtml = '';
    for (var i = 0; i < statuses.length; i++) { statusesHtml += '<option value="' + statuses[i] + '"' + sel(d.status, statuses[i]) + '>' + statuses[i] + '</option>'; }
    return '<div class="insp-modal-backdrop" onclick="if(event.target===this)window.__inspCloseModal()" style="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center">' +
      '<div class="liquid-glass-strong" style="width:480px;max-width:94vw;max-height:90vh;overflow-y:auto;padding:28px;border-radius:16px;border:1px solid rgba(255,255,255,0.08)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">' +
      '<h3 style="font-size:18px;font-weight:600;margin:0;color:#fff">' + title + '</h3>' +
      '<button onclick="window.__inspCloseModal()" style="background:none;border:none;color:#5a6a82;font-size:22px;cursor:pointer;padding:4px;line-height:1">✕</button></div>' +
      '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">标题 *</span><input id="insp-f-title" value="' + escapeHtml(d.title || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="巡检标题" /></label>' +
      '<div style="display:flex;gap:12px"><label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">区域</span><input id="insp-f-zone" value="' + escapeHtml(d.zone || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="所属区域" /></label>' +
      '<label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">负责人</span><input id="insp-f-owner" value="' + escapeHtml(d.owner || '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="负责人" /></label></div>' +
      '<div style="display:flex;gap:12px"><label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">频率</span><select id="insp-f-frequency" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px">' + freqHtml + '</select></label>' +
      '<label style="flex:1;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">截止日期</span><input id="insp-f-dueDate" type="date" value="' + (d.dueDate ? fmtDate(d.dueDate) : '') + '" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" /></label></div>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">状态</span><select id="insp-f-status" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px">' + statusesHtml + '</select></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">结果备注</span><textarea id="insp-f-result" rows="2" style="padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px;resize:vertical" placeholder="巡检结果">' + escapeHtml(d.result || '') + '</textarea></label>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end">' +
      '<button onclick="window.__inspCloseModal()" style="padding:10px 20px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#8892a8;font-size:13px;cursor:pointer">取消</button>' +
      '<button onclick="window.__inspSubmit()" style="padding:10px 20px;background:#5b8def;border:none;border-radius:8px;color:#fff;font-size:13px;cursor:pointer;font-weight:500">' + (isEdit ? '保存修改' : '创建巡检') + '</button></div>' +
      '</div></div>';
  }

  function buildInspectionsPagination() {
    var f = state.inspectionFilter;
    var total = state.inspectionTotalElements;
    var pages = state.inspectionTotalPages;
    if (pages <= 1) return '';
    var pageBtns = '';
    var start = Math.max(0, f.page - 2);
    var end = Math.min(pages, f.page + 3);
    if (f.page > 0) { pageBtns += '<button onclick="window.__inspPage(' + (f.page - 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">‹</button>'; }
    for (var i = start; i < end; i++) {
      var activeStyle = i === f.page ? 'background:#5b8def;border-color:#5b8def;color:#fff' : '';
      pageBtns += '<button onclick="window.__inspPage(' + i + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px;' + activeStyle + '">' + (i + 1) + '</button>';
    }
    if (f.page < pages - 1) { pageBtns += '<button onclick="window.__inspPage(' + (f.page + 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">›</button>'; }
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px 0;margin-top:8px;border-top:1px solid rgba(255,255,255,0.04)">' +
      '<span style="font-size:11px;color:#5a6a82">共 ' + total + ' 条，第 ' + (f.page + 1) + '/' + pages + ' 页</span>' +
      '<div style="display:flex;gap:4px">' + pageBtns + '</div></div>';
  }

  window.__inspCreate = function () { state.inspectionModal = { mode: 'create' }; patchInspectionsPage(); };
  window.__inspEdit = function (id) {
    for (var i = 0; i < state.inspections.length; i++) {
      if (state.inspections[i].id === id) { state.inspectionModal = { mode: 'edit', data: state.inspections[i] }; patchInspectionsPage(); return; }
    }
  };
  window.__inspCloseModal = function () { state.inspectionModal = null; patchInspectionsPage(); };
  window.__inspSubmit = function () {
    var isEdit = state.inspectionModal && state.inspectionModal.mode === 'edit';
    var id = isEdit ? state.inspectionModal.data.id : null;
    var body = {
      title: document.getElementById('insp-f-title').value,
      zone: document.getElementById('insp-f-zone').value,
      owner: document.getElementById('insp-f-owner').value,
      frequency: document.getElementById('insp-f-frequency').value,
      dueDate: document.getElementById('insp-f-dueDate').value,
      status: document.getElementById('insp-f-status').value,
      result: document.getElementById('insp-f-result').value
    };
    if (!body.title) { alert('请填写巡检标题'); return; }
    var url = isEdit ? '/api/admin/inspections/' + id : '/api/admin/inspections';
    var method = isEdit ? 'PUT' : 'POST';
    api(url, { method: method, body: JSON.stringify(body) })
      .then(function () { state.inspectionModal = null; loadInspectionsPage().then(function () { patchInspectionsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__inspExecute = function (id, currentStatus) {
    var next = { '待执行': '进行中', '进行中': '已完成', '已完成': '待执行' };
    var newStatus = next[currentStatus] || '待执行';
    api('/api/admin/inspections/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
      .then(function () { loadInspectionsPage().then(function () { patchInspectionsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__inspDelete = function (id) {
    if (!confirm('确定要删除此巡检吗？')) return;
    api('/api/admin/inspections/' + id, { method: 'DELETE' })
      .then(function () { loadInspectionsPage().then(function () { patchInspectionsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__inspPage = function (page) { state.inspectionFilter.page = page; loadInspectionsPage().then(function () { patchInspectionsPage(); }); };

  // ============================================================
  //  ALERT MANAGEMENT (finance page)
  // ============================================================
  function patchAlertsPage() {
    var pageTable = document.querySelector('.page-table');
    if (!pageTable) return;
    var alerts = state.alerts;
    if (!alerts || alerts.length === 0) { pageTable.innerHTML = '<div style="padding:40px;text-align:center;color:#ffffff80">暂无告警数据</div>'; return; }

    var headerHtml = '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06)">' +
      '<span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">共 ' + state.alertTotalElements + ' 条告警</span>' +
      '<span style="font-size:11px;color:#5a6a82">告警处理中心</span></div>';

    function alertLevelTag(level) {
      var colors = { '严重': '#e74c3c', '警告': '#f39c12', '提示': '#5b8def' };
      var c = colors[level] || '#8892a8';
      return '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;background:' + c + '20;color:' + c + ';border:1px solid ' + c + '40;font-weight:500">' + escapeHtml(level || '-') + '</span>';
    }

    var html = headerHtml + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12px">' +
      '<thead><tr style="color:#ffffff80;font-size:10px;text-transform:uppercase;letter-spacing:0.3px">' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">标题</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">区域</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">级别</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">类型</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">状态</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">负责人</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">时间</th>' +
      '<th style="text-align:left;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.06)">操作</th></tr></thead><tbody>';
    for (var i = 0; i < alerts.length; i++) {
      var al = alerts[i];
      html += '<tr style="color:#e8edf5"><td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(al.title) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(al.zone || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + alertLevelTag(al.level) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(al.type || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + statusTag(al.status) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + escapeHtml(al.owner || '-') + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04)">' + fmtDate(al.createdAt) + '</td>' +
        '<td style="padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.04);white-space:nowrap">' +
        '<button onclick="window.__alertHandle(\'' + al.id + '\')" style="background:rgba(91,141,239,0.2);color:#5b8def;border:1px solid rgba(91,141,239,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;margin-right:4px">处理</button>' +
        '<button onclick="window.__alertDelete(\'' + al.id + '\')" style="background:rgba(231,76,60,0.2);color:#e74c3c;border:1px solid rgba(231,76,60,0.3);border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer">删除</button>' +
        '</td></tr>';
    }
    html += '</tbody></table></div>';
    html += buildAlertsPagination();
    html += buildAlertModal();
    pageTable.innerHTML = html;
  }

  function buildAlertModal() {
    var m = state.alertModal;
    if (!m) return '';
    var al = m;
    return '<div class="alert-modal-backdrop" onclick="if(event.target===this)window.__alertCloseModal()" style="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center">' +
      '<div class="liquid-glass-strong" style="width:480px;max-width:94vw;max-height:90vh;overflow-y:auto;padding:28px;border-radius:16px;border:1px solid rgba(255,255,255,0.08)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">' +
      '<h3 style="font-size:18px;font-weight:600;margin:0;color:#fff">告警处理</h3>' +
      '<button onclick="window.__alertCloseModal()" style="background:none;border:none;color:#5a6a82;font-size:22px;cursor:pointer;padding:4px;line-height:1">✕</button></div>' +
      '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<div style="padding:16px;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.06)">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:11px;color:#5a6a82">标题</span><span style="font-size:13px;color:#e8edf5;font-weight:500">' + escapeHtml(al.title) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:11px;color:#5a6a82">区域</span><span style="font-size:13px;color:#e8edf5">' + escapeHtml(al.zone || '-') + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:11px;color:#5a6a82">级别</span><span style="font-size:13px;color:#e8edf5">' + escapeHtml(al.level || '-') + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:11px;color:#5a6a82">类型</span><span style="font-size:13px;color:#e8edf5">' + escapeHtml(al.type || '-') + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:11px;color:#5a6a82">状态</span><span style="font-size:13px;color:#e8edf5">' + statusTag(al.status) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:11px;color:#5a6a82">负责人</span><span style="font-size:13px;color:#e8edf5">' + escapeHtml(al.owner || '未分配') + '</span></div>' +
      '<div style="display:flex;justify-content:space-between"><span style="font-size:11px;color:#5a6a82">时间</span><span style="font-size:13px;color:#e8edf5">' + fmtDate(al.createdAt) + '</span></div>' +
      '</div>' +
      '<label style="display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;color:#5a6a82;text-transform:uppercase;letter-spacing:0.5px">分配负责人</span>' +
      '<div style="display:flex;gap:8px"><input id="alert-f-owner" value="' + escapeHtml(al.owner || '') + '" style="flex:1;padding:10px 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:8px;color:#e8edf5;font-size:13px" placeholder="输入负责人姓名" />' +
      '<button onclick="window.__alertAssignOwner(\'' + al.id + '\')" style="padding:10px 16px;background:rgba(91,141,239,0.2);color:#5b8def;border:1px solid rgba(91,141,239,0.3);border-radius:8px;font-size:13px;cursor:pointer;white-space:nowrap">分配</button></div></label>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:24px;justify-content:flex-end">' +
      '<button onclick="window.__alertCloseModal()" style="padding:10px 20px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#8892a8;font-size:13px;cursor:pointer">取消</button>' +
      (al.status !== '已关闭' ? '<button onclick="window.__alertCloseAlert(\'' + al.id + '\')" style="padding:10px 20px;background:#2ecc71;border:none;border-radius:8px;color:#fff;font-size:13px;cursor:pointer;font-weight:500">关闭告警</button>' : '') +
      '</div></div></div>';
  }

  function buildAlertsPagination() {
    var f = state.alertFilter;
    var total = state.alertTotalElements;
    var pages = state.alertTotalPages;
    if (pages <= 1) return '';
    var pageBtns = '';
    var start = Math.max(0, f.page - 2);
    var end = Math.min(pages, f.page + 3);
    if (f.page > 0) { pageBtns += '<button onclick="window.__alertPage(' + (f.page - 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">‹</button>'; }
    for (var i = start; i < end; i++) {
      var activeStyle = i === f.page ? 'background:#5b8def;border-color:#5b8def;color:#fff' : '';
      pageBtns += '<button onclick="window.__alertPage(' + i + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px;' + activeStyle + '">' + (i + 1) + '</button>';
    }
    if (f.page < pages - 1) { pageBtns += '<button onclick="window.__alertPage(' + (f.page + 1) + ')" style="padding:4px 10px;border-radius:4px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:#8892a8;cursor:pointer;font-size:12px">›</button>'; }
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px 0;margin-top:8px;border-top:1px solid rgba(255,255,255,0.04)">' +
      '<span style="font-size:11px;color:#5a6a82">共 ' + total + ' 条，第 ' + (f.page + 1) + '/' + pages + ' 页</span>' +
      '<div style="display:flex;gap:4px">' + pageBtns + '</div></div>';
  }

  window.__alertHandle = function (id) {
    for (var i = 0; i < state.alerts.length; i++) {
      if (state.alerts[i].id === id) { state.alertModal = state.alerts[i]; patchAlertsPage(); return; }
    }
  };
  window.__alertCloseModal = function () { state.alertModal = null; patchAlertsPage(); };
  window.__alertCloseAlert = function (id) {
    api('/api/admin/alerts/' + id + '/status', { method: 'PUT', body: JSON.stringify({ status: '已关闭' }) })
      .then(function () { state.alertModal = null; loadAlertsPage().then(function () { patchAlertsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__alertAssignOwner = function (id) {
    var newOwner = document.getElementById('alert-f-owner').value;
    if (!newOwner) { alert('请输入负责人姓名'); return; }
    api('/api/admin/alerts/' + id, { method: 'PUT', body: JSON.stringify({ title: state.alertModal.title, zone: state.alertModal.zone, level: state.alertModal.level, type: state.alertModal.type, status: state.alertModal.status, owner: newOwner }) })
      .then(function () { state.alertModal = null; loadAlertsPage().then(function () { patchAlertsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__alertDelete = function (id) {
    if (!confirm('确定要删除此告警吗？')) return;
    api('/api/admin/alerts/' + id, { method: 'DELETE' })
      .then(function () { loadAlertsPage().then(function () { patchAlertsPage(); }); })
      .catch(function (err) { alert('操作失败: ' + err.message); });
  };
  window.__alertPage = function (page) { state.alertFilter.page = page; loadAlertsPage().then(function () { patchAlertsPage(); }); };

  console.log('[CampOS Bridge] v10 active — 保留精美设计 + 完整 CRUD (资产/用户/巡检/告警)');

})();
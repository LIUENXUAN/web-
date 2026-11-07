// CampOS Bloom Admin - API Bridge v8
// 保留精美设计 + 完整 CRUD 后台功能
(function () {
  'use strict';

  /* ============================================================
     API Layer
     ============================================================ */
  function api(path, opts) {
    var headers = { 'Content-Type': 'application/json' };
    var options = { headers: headers, credentials: 'include' };
    if (opts) {
      if (opts.method) options.method = opts.method;
      if (opts.body) options.body = opts.body;
    }
    return fetch(path, options).then(function (resp) {
      return resp.json().then(function (data) {
        if (!resp.ok) throw new Error(data.msg || data.error || '请求失败');
        return data;
      });
    });
  }

  /* ============================================================
     State
     ============================================================ */
  var state = {
    loggedIn: false,
    currentPage: 'dashboard',
    metrics: null,
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
    refreshTimer: null
  };

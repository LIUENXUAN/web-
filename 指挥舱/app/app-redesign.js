const state = { data: null, zoneFilter: 'all' };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const fallbackNames = {
  rv: '房车营地', tent: '帐篷草坪', waterfront: '亲水平台', tower: '中心塔架'
};
const clean = (value, fallback = '营地运营') => {
  const text = String(value ?? '').trim();
  return !text || /�|鏋|鎴|甯|浜|涓|缁|寮|宸|寰|楂|浣|钀|瀹|杩|瑗|鍛|浼|绔|杞|浣|姝|鐞|淇|璁|妗/.test(text) ? fallback : text;
};
const zoneName = id => clean(state.data?.zones?.find(zone => zone.id === id)?.name, fallbackNames[id] || id);
const zoneStatus = zone => clean(zone.status, zone.id === 'rv' || zone.id === 'tower' ? '维护中' : '开放');
const zoneType = zone => clean(zone.type, ({ rv:'驻留住宿', tent:'轻露营', waterfront:'休闲观景', tower:'核心节点' })[zone.id] || '营地资源');
const zoneDescription = zone => clean(zone.description, ({ rv:'适合自驾家庭与周末短住游客，配套停车、补给与夜间照明。', tent:'承载帐篷露营、亲子活动、户外课堂与周末市集。', waterfront:'提供水岸观景、摄影打卡与安静停留空间。', tower:'作为营地视觉焦点，承担观景、灯光装置与自然教育功能。' })[zone.id] || '可运营、可预约、可联动的数据化空间资源。');

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || '请求失败');
  return payload;
}

function bootMotion() {
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9, touchMultiplier: 1.1 });
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  if (!window.gsap) return;
  gsap.registerPlugin(window.ScrollTrigger);
  splitText();
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('[data-loader]', { delay: .25, duration: .1, className: 'loader is-out' })
    .to('[data-loader]', { duration: .01, autoAlpha: 0, display: 'none' }, '+=.72')
    .from('.site-nav', { y: -40, opacity: 0, duration: .75 }, '-=.25')
    .from('.side-rail a', { x: -18, opacity: 0, stagger: .045, duration: .55 }, '-=.45')
    .from('.hero-title .char', { yPercent: 120, rotate: 8, opacity: 0, stagger: .012, duration: .9 }, '-=.55')
    .from('.hero-lead,.hero-actions,.hero-strip .metric', { y: 24, opacity: 0, stagger: .06, duration: .72 }, '-=.35')
    .from('.hero__console', { x: 40, rotate: 3, opacity: 0, duration: .9 }, '-=.65');

  gsap.utils.toArray('.reveal-clip').forEach(el => {
    gsap.from(el, { clipPath: 'inset(18% 10% 18% 10% round 42px)', y: 34, opacity: .4, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: el, start: 'top 82%' } });
  });
  gsap.utils.toArray('.reveal-slide').forEach((el, index) => {
    gsap.from(el, { x: innerWidth > 760 ? (index % 2 ? 44 : -44) : 0, y: innerWidth > 760 ? 18 : 32, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 84%' } });
  });
  gsap.utils.toArray('.reveal-tilt').forEach((el, index) => {
    gsap.from(el, { y: 54, rotate: index % 2 ? -2 : 2, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
  });
  gsap.to('.hero__media img', { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.product-marquee span', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.products', start: 'top bottom', end: 'bottom top', scrub: true } });
}

function splitText() {
  $$('.split-text').forEach(el => {
    if (el.dataset.split) return;
    el.dataset.split = 'true';
    const html = el.innerHTML;
    el.innerHTML = html.replace(/([^<>&\s])/g, '<span class="char">$1</span>');
  });
}

function renderMetrics(metrics) {
  const items = [
    ['累计游客', `${Number(metrics.visitors || 12860).toLocaleString()}`],
    ['预约转化', `${metrics.bookingRate || 76}%`],
    ['营收估算', `¥${Number(metrics.revenue || 426660).toLocaleString()}`],
    ['资产健康', `${metrics.assetHealth || 85}%`]
  ];
  $('#metrics').innerHTML = items.map(([label, value]) => `<div class="metric interactive"><strong>${value}</strong><span>${label}</span></div>`).join('');
  $('#liveCapacity').textContent = `${Math.min(99, Number(metrics.assetHealth || 85) + 1)}%`;
}

function renderBusinessCards(data) {
  const paidOrders = (data.orders || []).filter(order => clean(order.status, '').includes('支付')).length || 1;
  const openZones = (data.zones || []).filter(zone => zoneStatus(zone) === '开放').length || 2;
  const highAlerts = (data.alerts || []).filter(alert => clean(alert.level, '').includes('高')).length || 1;
  const pendingInspections = (data.inspections || []).filter(item => !clean(item.status, '').includes('完成')).length || 2;
  const cards = [
    ['01', '营收闭环', `已支付订单 ${paidOrders} 笔`, '预约、确认、支付状态和客单价形成营收链路。'],
    ['02', '容量运营', `开放区域 ${openZones}/${data.zones.length}`, '根据区域容量和开放状态控制游客接待能力。'],
    ['03', '安全风控', `高风险告警 ${highAlerts} 条`, '风险点分级处置，支持巡检、告警与 SLA 跟踪。'],
    ['04', '巡检履约', `待处理巡检 ${pendingInspections} 项`, '资产责任人、截止日期、健康度进入运营闭环。']
  ];
  $('#businessCards').innerHTML = cards.map(([num, title, value, desc]) => `<article class="value-card interactive reveal-tilt"><span>${num} · ${value}</span><h3>${title}</h3><p>${desc}</p></article>`).join('');
}

function renderZones(zones) {
  const filtered = state.zoneFilter === 'all' ? zones : zones.filter(zone => zoneStatus(zone) === state.zoneFilter || zoneType(zone) === state.zoneFilter);
  $('#zoneCards').innerHTML = filtered.map(zone => `<article class="zone-card interactive"><span class="tag">${zoneType(zone)} · ${zoneStatus(zone)}</span><h3>${zoneName(zone.id)}</h3><p>${zoneDescription(zone)}</p><p><strong>容量：</strong>${zone.capacity} 人 / <strong>价格：</strong>${zone.price ? `¥${zone.price}` : '免费'}</p></article>`).join('');
  $('#zoneSelect').innerHTML = zones.filter(zone => zoneStatus(zone) === '开放').map(zone => `<option value="${zone.id}">${zoneName(zone.id)} · ¥${zone.price || 0}</option>`).join('') || zones.map(zone => `<option value="${zone.id}">${zoneName(zone.id)}</option>`).join('');
  bindInteractiveCards();
}

function renderBookings(bookings = []) {
  const fallback = [
    { name: '张同学', zone: 'tent', date: '2026-07-06', people: 4, status: '已确认' },
    { name: '李老师', zone: 'waterfront', date: '2026-07-13', people: 6, status: '待确认' }
  ];
  $('#bookingList').innerHTML = (bookings.length ? bookings : fallback).slice(0, 5).map(booking => `<article><h4>${clean(booking.name, '游客')} · ${zoneName(booking.zone)}</h4><p>${booking.date} / ${booking.people} 人 / ${clean(booking.status, '待确认')}</p></article>`).join('');
}

function renderAssets(assets = []) {
  const fallback = [
    { name: '星空帐篷组', zone: 'tent', type: '住宿设施', owner: '营位组', status: '正常', health: 96 },
    { name: '房车补给桩', zone: 'rv', type: '能源设备', owner: '设备组', status: '正常', health: 92 },
    { name: '亲水平台护栏', zone: 'waterfront', type: '安全设施', owner: '安全组', status: '待维修', health: 68 }
  ];
  $('#assetList').innerHTML = (assets.length ? assets : fallback).slice(0, 5).map(asset => `<article class="ops-item interactive"><strong>${clean(asset.name, '营地资产')}</strong><span>${zoneName(asset.zone)} · ${clean(asset.type, '运营设施')} · ${clean(asset.owner, '运营组')}</span><em class="${clean(asset.status, '').includes('维修') ? 'danger' : ''}">${clean(asset.status, '正常')} · 健康 ${asset.health || 88}%</em></article>`).join('');
}

function renderAlerts(alerts = []) {
  const fallback = [
    { title: '亲水平台护栏风险', zone: 'waterfront', type: '安全隐患', owner: '安全组', level: '高', status: '处理中' },
    { title: '帐篷草坪容量接近上限', zone: 'tent', type: '容量预警', owner: '运营组', level: '中', status: '待处理' },
    { title: '中心塔架维护提示', zone: 'tower', type: '维护提示', owner: '工程组', level: '低', status: '已处理' }
  ];
  $('#alertList').innerHTML = (alerts.length ? alerts : fallback).slice(0, 5).map(alert => `<article class="ops-item interactive"><strong>${clean(alert.title, '运营告警')}</strong><span>${zoneName(alert.zone)} · ${clean(alert.type, '风险事件')} · ${clean(alert.owner, '运营组')}</span><em class="${clean(alert.level, '').includes('高') ? 'danger' : ''}">${clean(alert.level, '中')} · ${clean(alert.status, '处理中')}</em></article>`).join('');
}

function renderFeedback(feedback = []) {
  const fallback = [
    { name: '游客 A', content: '希望增加夜间导视灯和洗手间指引。', status: '待处理' },
    { name: '运营组', content: '建议周末增加帐篷区保洁巡检频次。', status: '已处理' }
  ];
  $('#feedbackList').innerHTML = (feedback.length ? feedback : fallback).slice(0, 4).map(item => `<article><h4>${clean(item.name, '游客')} · ${clean(item.status, '待处理')}</h4><p>${clean(item.content, '体验反馈已收到，运营团队将继续优化服务。')}</p></article>`).join('');
}

function bindZoneTabs() {
  $$('.zone-tabs button').forEach(button => {
    button.addEventListener('click', () => {
      $$('.zone-tabs button').forEach(item => item.classList.toggle('active', item === button));
      state.zoneFilter = button.dataset.filter;
      renderZones(state.data.zones);
    });
  });
}

function bindForms() {
  $('#bookingForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const message = $('#bookingMessage');
    try {
      await api('/api/bookings', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      message.textContent = '预约已提交，后台将尽快确认。';
      event.currentTarget.reset();
      await loadData();
    } catch (error) { message.textContent = error.message; }
  });
  $('#feedbackForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const message = $('#feedbackMessage');
    try {
      await api('/api/feedback', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      message.textContent = '反馈已提交，感谢你的建议。';
      event.currentTarget.reset();
      await loadData();
    } catch (error) { message.textContent = error.message; }
  });
}

function bindInteractiveCards() {
  $$('.interactive,.product-card,.analytics-card,.booking-panel,.booking-feed,.ops-list').forEach(card => {
    card.onpointermove = event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    };
  });
  $$('.product-card,.reveal-tilt').forEach(card => {
    card.onpointermove = event => {
      if (innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - .5) * -4;
      const ry = ((event.clientX - rect.left) / rect.width - .5) * 5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    card.onpointerleave = () => { card.style.transform = ''; };
  });
}

function smartNav() {
  const nav = $('[data-nav]');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const goingDown = scrollY > lastY && scrollY > 180;
    nav.classList.toggle('is-hidden', goingDown);
    nav.classList.toggle('is-scrolled', scrollY > 40);
    lastY = Math.max(0, scrollY);
    updateRail();
  }, { passive: true });
}

function updateRail() {
  const sections = ['top','system','experience','products','operations','booking'];
  const current = sections.findLast(id => (($(`#${id}`)?.getBoundingClientRect().top ?? 9999) < innerHeight * .42)) || 'top';
  $$('.side-rail a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
}

function cursorOrb() {
  const orb = $('.cursor-orb');
  if (!orb || matchMedia('(pointer: coarse)').matches) return;
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener('pointermove', event => { tx = event.clientX; ty = event.clientY; }, { passive: true });
  const tick = () => {
    x += (tx - x) * .18; y += (ty - y) * .18;
    orb.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  };
  tick();
}

function drawRadar() {
  const canvas = $('#radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let frame = 0;
  const draw = () => {
    const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
    bg.addColorStop(0, 'rgba(84,198,142,.12)'); bg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);
    ctx.strokeStyle = 'rgba(244,240,223,.15)'; ctx.lineWidth = 1;
    for (let radius = 48; radius < 180; radius += 36) { ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke(); }
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a)*180, cy + Math.sin(a)*180); ctx.stroke(); }
    const sweep = frame * 0.022;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 185);
    grad.addColorStop(0, 'rgba(216,255,90,.48)'); grad.addColorStop(1, 'rgba(216,255,90,0)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 180, sweep, sweep + .58); ctx.closePath(); ctx.fill();
    [[-80,-44],[72,-72],[98,44],[-52,86],[12,18]].forEach(([px,py], i) => {
      ctx.fillStyle = i === 2 ? '#d8ff5a' : i === 4 ? '#88e7ff' : '#96ffd0';
      ctx.shadowBlur = 16; ctx.shadowColor = ctx.fillStyle;
      ctx.beginPath(); ctx.arc(cx+px, cy+py, 5 + Math.sin(frame*.04+i)*1.6, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    });
    frame += 1; requestAnimationFrame(draw);
  };
  draw();
}

async function loadData() {
  state.data = await api('/api/public');
  state.data.zones = state.data.zones || [];
  renderMetrics(state.data.metrics || {});
  renderBusinessCards(state.data);
  renderZones(state.data.zones);
  renderBookings(state.data.bookings);
  renderAssets(state.data.assets);
  renderAlerts(state.data.alerts);
  renderFeedback(state.data.feedback);
  bindInteractiveCards();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
}

bindZoneTabs();
bindForms();
smartNav();
cursorOrb();
drawRadar();
bootMotion();
loadData().catch(error => document.body.insertAdjacentHTML('afterbegin', `<div style="position:fixed;left:16px;right:16px;top:86px;z-index:999;padding:14px;border-radius:16px;background:#9b1c1c;color:#fff">数据加载失败：${error.message}</div>`));


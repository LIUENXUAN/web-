let deferredInstall = null;
let currentData = null;
let zoneFilter = "all";
const zoneName = (data, id) => data.zones.find(zone => zone.id === id)?.name || id;
const money = value => `￥${Number(value || 0).toLocaleString()}`;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function forceRemoveTransitionVeil() {
  const veil = document.querySelector('#transitionVeil');
  if (!veil) return;
  veil.classList.add('is-done');
  veil.style.opacity = '0';
  veil.style.pointerEvents = 'none';
  veil.style.display = 'none';
  veil.remove();
}
window.addEventListener('load', () => setTimeout(forceRemoveTransitionVeil, 2200));
setTimeout(forceRemoveTransitionVeil, 4200);
let demoTimer = null;

async function api(path) {
  const response = await fetch(path);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || '请求失败');
  return payload;
}

function renderKpis(metrics) {
  const items = [
    ['累计游客', metrics.visitors.toLocaleString(), 'VISITORS', '从游客端预约、入园与活动签到聚合', metrics.occupancyRate],
    ['预约转化', `${metrics.bookingRate}%`, 'CONVERSION', '订单漏斗健康度与支付阻塞监控', metrics.bookingRate],
    ['营收估算', money(metrics.revenue), 'REVENUE', '周末预测与套餐销售动态修正', 88],
    ['资产健康', `${metrics.assetHealth}%`, 'ASSET', '营地设施巡检、寿命和维修优先级', metrics.assetHealth],
    ['告警闭环', `${metrics.alertCloseRate}%`, 'RISK', '安全事件处理完成率与 SLA 压力', metrics.alertCloseRate],
    ['客单价', money(metrics.avgOrderValue), 'ARPU', '亲子课程、露营夜与团建套餐贡献', 72]
  ];
  document.querySelector('#kpis').innerHTML = items.map(([label, value, code, desc, score], index) => `<article class="kpi metric-tile" style="--metric:${Math.min(100, score)};--i:${index}"><span>${code}</span><strong data-final="${value}">${prefersReducedMotion ? value : '0'}</strong><p>${label}</p><em>${desc}</em><i aria-hidden="true"></i></article>`).join('');
  animateNumbers();
}

function animateNumbers() {
  if (prefersReducedMotion) return;
  document.querySelectorAll('[data-final]').forEach(element => {
    const finalText = element.dataset.final;
    const numeric = Number(finalText.replace(/[￥,%]/g, '').replace(/,/g, ''));
    if (!Number.isFinite(numeric)) {
      element.textContent = finalText;
      return;
    }
    const prefix = finalText.startsWith('￥') ? '￥' : '';
    const suffix = finalText.endsWith('%') ? '%' : '';
    const start = performance.now();
    const duration = 850;
    const tick = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${prefix}${Math.round(numeric * eased).toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
      else element.textContent = finalText;
    };
    requestAnimationFrame(tick);
  });
}

function buildRecommendations(data) {
  const recommendations = [];
  const highAlerts = data.alerts.filter(alert => alert.level === '高' && alert.status !== '已处理');
  const maintenanceZones = data.zones.filter(zone => zone.status !== '开放');
  const weakAssets = data.assets.filter(asset => asset.health < 80 || asset.status === '待维修');
  const unpaidOrders = data.orders.filter(order => order.status !== '已支付');

  if (highAlerts.length) recommendations.push(['安全优先', `存在 ${highAlerts.length} 条高风险告警`, '建议优先处理亲水平台/护栏/塔架等高风险点，避免现场运营事故。', 'danger']);
  if (maintenanceZones.length) recommendations.push(['容量恢复', `${maintenanceZones.length} 个区域非开放`, '建议评估维护原因，若风险解除可恢复开放，提高周末承载能力。', 'warn']);
  if (weakAssets.length) recommendations.push(['资产维护', `${weakAssets.length} 个资产健康偏低`, '建议生成维修工单并绑定巡检责任人，形成资产运维闭环。', 'warn']);
  if (unpaidOrders.length) recommendations.push(['营收转化', `${unpaidOrders.length} 笔订单待支付`, '建议在游客端增加支付提醒和限时保留策略，提升转化率。', '']);
  if (data.metrics.bookingRate >= 70) recommendations.push(['增长策略', `预约转化率 ${data.metrics.bookingRate}%`, '当前转化良好，可推出露营夜/亲子课堂组合套餐提升客单价。', '']);

  return recommendations.slice(0, 5);
}

function renderRecommendations(data) {
  const cards = buildRecommendations(data);
  document.querySelector('#decisionGrid').innerHTML = cards.map(([title, value, desc, level], index) => `<article class="decision ${level}" style="--i:${index}"><span>${String(index + 1).padStart(2, '0')}</span><div><em>${value}</em><h3>${title}</h3><p>${desc}</p></div><strong>${level === 'danger' ? '立即处理' : level === 'warn' ? '本周推进' : '增长机会'}</strong><b aria-hidden="true"></b></article>`).join('');
}

function renderHero(data) {
  const maxLoad = Math.max(...data.capacitySignals.map(item => item.forecastLoad));
  document.querySelector('#heroRisk').textContent = data.forecast.riskIndex;
  document.querySelector('#heroLoad').textContent = `${maxLoad}%`;
  document.querySelector('#heroSla').textContent = `${data.serviceLevels.targetCloseRate}%`;
}

function renderIncidents(data) {
  const priorityClass = severity => severity === 'P1' ? 'danger' : severity === 'P2' ? 'warn' : '';
  document.querySelector('#incidentBoard').innerHTML = data.incidents.map((incident, index) => `<article class="incident ${priorityClass(incident.severity)}" style="--i:${index}"><div class="incident-top"><span>0${index + 1}</span><strong>${incident.title}</strong><em class="badge ${priorityClass(incident.severity)}">${incident.severity}</em></div><p>${incident.action}</p><div class="incident-route"><i>发现</i><i>派单</i><i>处置</i><i>复盘</i></div><div class="incident-meta"><span>${zoneName(data, incident.zone)}</span><span>${incident.owner}</span><span>${incident.status}</span><span>SLA ${incident.slaDue}</span></div><small>来源：${incident.source}</small></article>`).join('');
}

function renderForecast(data) {
  const forecast = data.forecast;
  const service = data.serviceLevels;
  document.querySelector('#forecastCard').innerHTML = `<div class="forecast-orbit"><strong>${forecast.peakWindow}</strong><span>${forecast.riskIndex}</span></div><p>${forecast.summary}</p><div class="forecast-metrics"><span>预测客流 <b>${forecast.weekendVisitors}</b></span><span>预测营收 <b>${money(forecast.weekendRevenue)}</b></span><span>风险指数 <b>${forecast.riskIndex}</b></span><span>建议排班 <b>${forecast.staffNeeded}人</b></span></div><div class="sla-note">闭环目标 ${service.targetCloseRate}% · ${service.owner}</div>`;
}

function renderCapacitySignals(data) {
  document.querySelector('#capacitySignals').innerHTML = data.capacitySignals.map(signal => {
    const level = signal.forecastLoad >= 85 ? 'danger' : signal.forecastLoad >= 70 ? 'warn' : '';
    return `<article class="signal ${level}" style="--load:${signal.forecastLoad}"><div><strong>${zoneName(data, signal.zone)}</strong><em>${signal.trend}</em></div><div class="signal-gauge"><b>${signal.forecastLoad}%</b><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50"></circle><circle cx="60" cy="60" r="50" pathLength="100"></circle></svg></div><span>预测负载 ${signal.forecastLoad}%</span><p>${signal.recommendation}</p></article>`;
  }).join('');
}

function renderAuditTimeline(data) {
  document.querySelector('#auditTimeline').innerHTML = data.auditLogs.map(log => `<article class="timeline-item"><time>${log.time}</time><div><strong>${log.actor}</strong><p>${log.event}</p><span>${log.result}</span></div></article>`).join('');
}

function renderBusinessChart(metrics) {
  const items = [
    ['预约率', metrics.bookingRate],
    ['入住率', metrics.occupancyRate],
    ['活动参与', metrics.activityRate],
    ['满意度', metrics.satisfaction],
    ['资产健康', metrics.assetHealth]
  ];
  document.querySelector('#businessChart').innerHTML = items.map(([label, value], index) => `<article class="bar-card metric-rail" style="--value:${value};--i:${index}"><div class="bar-card-top"><span>${label}</span><strong>${value}%</strong></div><div class="metric-copy"><em>${value >= 90 ? '优秀' : value >= 82 ? '稳定' : '关注'}</em><small>${value >= 90 ? '可作为路演亮点' : value >= 82 ? '维持当前节奏' : '建议进入待办池'}</small></div><div class="bar"><i style="width:${value}%"></i></div></article>`).join('');
}

function renderTasks(data) {
  const tasks = [
    ...data.inspections.filter(item => item.status !== '已完成').map(item => ({ title: item.title, desc: `${zoneName(data, item.zone)} · ${item.owner} · ${item.dueDate}`, level: item.status === '待处理' ? 'warn' : '' })),
    ...data.alerts.filter(item => item.status !== '已处理').map(item => ({ title: item.title, desc: `${zoneName(data, item.zone)} · ${item.type} · ${item.owner}`, level: item.level === '高' ? 'danger' : 'warn' }))
  ].slice(0, 6);
  document.querySelector('#taskList').innerHTML = tasks.map((task, index) => `<article class="task ${task.level}" style="--i:${index}"><div><strong>${task.title}</strong><span>${task.desc}</span></div><em class="badge ${task.level}">待办</em></article>`).join('');
}

function renderZones(data) {
  const zones = zoneFilter === 'all' ? data.zones : data.zones.filter(zone => zone.status === zoneFilter);
  document.querySelector('#zoneStack').innerHTML = zones.map(zone => {
    const occupancy = Math.min(100, Math.round((data.bookings.filter(item => item.zone === zone.id).reduce((sum, item) => sum + item.people, 0) / zone.capacity) * 100));
    return `<article class="zone" style="--occ:${occupancy}"><strong>${zone.name}</strong><span>${zone.status} · 容量 ${zone.capacity} · ${zone.price ? money(zone.price) : '免费'}</span><div class="meter"><i style="width:${occupancy}%"></i></div></article>`;
  }).join('');
}

function renderOrders(data) {
  const paid = data.orders.filter(order => order.status === '已支付');
  const pending = Math.max(0, data.bookings.length - paid.length);
  const revenue = paid.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const summary = document.querySelector('#commerceSummary');
  if (summary) summary.innerHTML = `<article><span>已支付营收</span><strong>${money(revenue)}</strong></article><article><span>订单转化</span><strong>${Math.round((paid.length / Math.max(1, data.bookings.length)) * 100)}%</strong></article><article><span>待跟进</span><strong>${pending}</strong></article>`;
  document.querySelector('#orderTable').innerHTML = `<article class="row"><strong>游客/订单</strong><strong>区域日期</strong><strong>金额</strong><strong>状态</strong></article>` + data.bookings.map(booking => {
    const order = data.orders.find(item => item.bookingId === booking.id);
    return `<article class="row"><span>${booking.name}<br>${booking.phone}</span><span>${zoneName(data, booking.zone)}<br>${booking.date} · ${booking.people}人</span><span>${order ? money(order.amount) : '待生成'}</span><span>${order?.status || booking.status}</span></article>`;
  }).join('');
}

function renderAssets(data) {
  document.querySelector('#assetBoard').innerHTML = data.assets.map(asset => {
    const level = asset.health < 80 || asset.status === '待维修' ? 'danger' : asset.health < 86 || asset.status === '巡检中' ? 'warn' : '';
    const advice = asset.health < 80 ? '建议 24 小时内生成维修工单' : asset.health < 86 ? '建议纳入本周复核清单' : '维持常规巡检频次';
    return `<article class="asset ${level}"><div><strong>${asset.name}</strong><span>${zoneName(data, asset.zone)} · ${asset.type} · ${asset.owner}</span><small>${advice}</small></div><div><span>健康度 ${asset.health}%</span><div class="meter"><i style="width:${asset.health}%"></i></div></div><em class="badge ${level}">${asset.status}</em></article>`;
  }).join('');
}

function renderSla(data) {
  const total = data.alerts.length + data.inspections.length;
  const closed = data.alerts.filter(item => item.status === '已处理').length + data.inspections.filter(item => item.status === '已完成').length;
  const rate = total ? Math.round((closed / total) * 100) : 100;
  const highOpen = data.alerts.filter(item => item.level === '高' && item.status !== '已处理').length;
  const strip = document.querySelector('#riskControlStrip');
  if (strip) strip.innerHTML = `<span>高风险 ${highOpen}</span><span>闭环 ${closed}/${total}</span><span>责任组 ${data.serviceLevels.owner}</span>`;
  document.querySelector('#slaCard').innerHTML = `<strong>SLA 闭环率 ${rate}%</strong><span>未闭环高风险 ${highOpen} 条 · 巡检/告警总数 ${total}</span><div class="meter"><i style="width:${rate}%"></i></div>`;
}
function renderRisks(data) {
  document.querySelector('#riskBoard').innerHTML = data.alerts.map(alert => `<article class="risk"><div><strong>${alert.title}</strong><span>${alert.createdAt}</span></div><span>${zoneName(data, alert.zone)} · ${alert.type}</span><em class="badge ${alert.level === '高' ? 'danger' : alert.level === '中' ? 'warn' : ''}">${alert.level}</em><span>${alert.status}</span></article>`).join('');
}

async function boot() {
  let data;
  try {
    data = await api('/api/public');
  } catch (error) {
    data = await api('../data/db.json');
  }
  currentData = data;
  renderKpis(data.metrics);
  renderHero(data);
  renderRecommendations(data);
  renderIncidents(data);
  renderForecast(data);
  renderCapacitySignals(data);
  renderAuditTimeline(data);
  renderBusinessChart(data.metrics);
  renderTasks(data);
  renderZones(data);
  renderOrders(data);
  renderAssets(data);
  renderSla(data);
  renderRisks(data);
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstall = event;
  document.querySelector('#installBtn').hidden = false;
});

function exportDailyReport() {
  if (!currentData) return;
  const lines = [
    '# 林间律动营地运营日报',
    '',
    `生成时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`,
    '',
    '## 核心指标',
    `- 累计游客：${currentData.metrics.visitors}`,
    `- 预约转化：${currentData.metrics.bookingRate}%`,
    `- 营收估算：${money(currentData.metrics.revenue)}`,
    `- 资产健康：${currentData.metrics.assetHealth}%`,
    `- 告警闭环：${currentData.metrics.alertCloseRate}%`,
    '',
    '## 决策建议',
    ...buildRecommendations(currentData).map(([title, value, desc]) => `- ${title}：${value}。${desc}`),
    '',
    '## 事件指挥',
    ...currentData.incidents.map(item => `- ${item.severity}｜${item.title}｜${zoneName(currentData, item.zone)}｜${item.owner}｜${item.status}｜SLA ${item.slaDue}`),
    '',
    '## 容量调度',
    ...currentData.capacitySignals.map(item => `- ${zoneName(currentData, item.zone)}：预测负载 ${item.forecastLoad}%｜${item.recommendation}`),
    '',
    '## 周末预测',
    `- 客流：${currentData.forecast.weekendVisitors}`,
    `- 营收：${money(currentData.forecast.weekendRevenue)}`,
    `- 高峰窗口：${currentData.forecast.peakWindow}`,
    '',
    '## 待处理告警',
    ...currentData.alerts.filter(item => item.status !== '已处理').map(item => `- ${item.level}｜${item.title}｜${zoneName(currentData, item.zone)}｜${item.owner}`),
    '',
    '## 待处理巡检',
    ...currentData.inspections.filter(item => item.status !== '已完成').map(item => `- ${item.title}｜${zoneName(currentData, item.zone)}｜${item.owner}｜${item.dueDate}`)
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `营地运营日报-${new Date().toISOString().slice(0, 10)}.md`;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector('#refreshBtn').addEventListener('click', boot);
document.querySelector('#exportBtn').addEventListener('click', exportDailyReport);
document.querySelector('#demoBtn').addEventListener('click', toggleDemoMode);
document.querySelector('#commandBtn').addEventListener('click', openPalette);
document.querySelector('#closePalette').addEventListener('click', closePalette);
document.querySelector('#commandPalette').addEventListener('click', event => {
  if (event.target.id === 'commandPalette') closePalette();
});
document.querySelectorAll('[data-jump]').forEach(button => {
  button.addEventListener('click', () => {
    closePalette();
    document.querySelector(button.dataset.jump)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});

document.querySelectorAll('.floating-dock [data-jump]').forEach(button => {
  button.addEventListener('click', () => document.querySelector(button.dataset.jump)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' }));
});
document.querySelector('[data-action="export"]').addEventListener('click', () => {
  closePalette();
  exportDailyReport();
});
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openPalette();
  }
  if (event.key === 'Escape') closePalette();
});
document.querySelectorAll('[data-zone-filter]').forEach(button => {
  button.addEventListener('click', () => {
    zoneFilter = button.dataset.zoneFilter;
    document.querySelectorAll('[data-zone-filter]').forEach(item => item.classList.toggle('active', item === button));
    if (currentData) renderZones(currentData);
  });
});

function openPalette() {
  document.querySelector('#commandPalette').hidden = false;
  document.querySelector('#commandPalette button[data-jump]')?.focus();
}

function closePalette() {
  document.querySelector('#commandPalette').hidden = true;
}

function toggleDemoMode() {
  const button = document.querySelector('#demoBtn');
  document.body.classList.toggle('demo-mode');
  const running = document.body.classList.contains('demo-mode');
  button.textContent = running ? '停止路演模式' : '启动路演模式';
  clearInterval(demoTimer);
  if (!running) return;
  const targets = ['#mission', '#command', '#dispatch', '#twin', '#risk', '#timeline'];
  let index = 0;
  demoTimer = setInterval(() => {
    document.querySelector(targets[index % targets.length])?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    index += 1;
  }, 4200);
}

function bootParticles() {
  if (document.body.classList.contains('performance-mode')) return;
  const canvas = document.querySelector('#particleField');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  const resize = () => {
    width = canvas.width = window.innerWidth * devicePixelRatio;
    height = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    particles = Array.from({ length: Math.min(110, Math.floor(window.innerWidth / 14)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: (0.25 + Math.random() * 0.75) * devicePixelRatio,
      size: (0.7 + Math.random() * 2.4) * devicePixelRatio,
      alpha: 0.16 + Math.random() * 0.52
    }));
  };
  const draw = () => {
    context.clearRect(0, 0, width, height);
    particles.forEach(point => {
      point.y -= point.speed;
      point.x += Math.sin(point.y * 0.004) * 0.55;
      if (point.y < -20) {
        point.y = height + 20;
        point.x = Math.random() * width;
      }
      context.globalAlpha = point.alpha;
      context.fillStyle = '#74e0a7';
      context.beginPath();
      context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
      context.fill();
    });
    context.globalAlpha = 0.12;
    context.strokeStyle = '#77d9ef';
    for (let index = 0; index < particles.length - 1; index += 3) {
      const a = particles[index];
      const b = particles[index + 1];
      if (Math.abs(a.x - b.x) < 180 * devicePixelRatio && Math.abs(a.y - b.y) < 130 * devicePixelRatio) {
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
    context.globalAlpha = 1;
    if (!prefersReducedMotion) requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener('resize', resize);
  draw();
}

function bootInteractionFX() {
  if (prefersReducedMotion || document.body.classList.contains('performance-mode')) return;
  const sparkCanvas = document.querySelector('#sparkField');
  const sparkContext = sparkCanvas.getContext('2d');
  let sparks = [];
  const resize = () => {
    sparkCanvas.width = window.innerWidth * devicePixelRatio;
    sparkCanvas.height = window.innerHeight * devicePixelRatio;
    sparkCanvas.style.width = `${window.innerWidth}px`;
    sparkCanvas.style.height = `${window.innerHeight}px`;
  };
  const animate = () => {
    sparkContext.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
    sparks = sparks.filter(spark => spark.life > 0);
    sparks.forEach(spark => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vy += 0.04 * devicePixelRatio;
      spark.life -= 0.028;
      sparkContext.globalAlpha = Math.max(0, spark.life);
      sparkContext.strokeStyle = spark.color;
      sparkContext.lineWidth = 2 * devicePixelRatio;
      sparkContext.beginPath();
      sparkContext.moveTo(spark.x, spark.y);
      sparkContext.lineTo(spark.x - spark.vx * 5, spark.y - spark.vy * 5);
      sparkContext.stroke();
    });
    sparkContext.globalAlpha = 1;
    requestAnimationFrame(animate);
  };
  window.addEventListener('resize', resize);
  document.addEventListener('pointerdown', event => {
    const colors = ['#74e0a7', '#77d9ef', '#f4d06f', '#ff6b6b'];
    for (let index = 0; index < 20; index += 1) {
      const angle = (Math.PI * 2 * index) / 20;
      const speed = (2 + Math.random() * 4) * devicePixelRatio;
      sparks.push({
        x: event.clientX * devicePixelRatio,
        y: event.clientY * devicePixelRatio,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[index % colors.length]
      });
    }
  });
  document.addEventListener('pointermove', event => {
    document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    updateSoftCursor(event.clientX, event.clientY);
  });
  document.querySelectorAll('.panel,.hero-stage,.kpi').forEach(card => {
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--tilt-x', `${(0.5 - y) * 8}deg`);
      card.style.setProperty('--tilt-y', `${(x - 0.5) * 10}deg`);
      card.style.setProperty('--glow-x', `${x * 100}%`);
      card.style.setProperty('--glow-y', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
  resize();
  animate();
}

function updateSoftCursor(x, y) {
  const cursor = document.querySelector('#softCursor');
  if (!cursor) return;
  if (window.gsap) gsap.to(cursor, { x, y, duration: 0.45, ease: 'power3.out' });
  else cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function bootOperationalCards() {
  if (prefersReducedMotion || matchMedia('(pointer: coarse)').matches) return;
  const selector = [
    '.panel',
    '.metric-tile',
    '.decision',
    '.incident',
    '.signal',
    '.bar-card',
    '.forecast-card',
    '.task',
    '.zone',
    '.row',
    '.asset',
    '.risk',
    '.sla-card'
  ].join(',');

  document.addEventListener('pointermove', event => {
    const card = event.target.closest(selector);
    if (!card || !document.body.contains(card)) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    const rotateX = ((y / rect.height) - 0.5) * -5;

    card.style.setProperty('--card-x', `${x}px`);
    card.style.setProperty('--card-y', `${y}px`);
    card.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
  }, { passive: true });

  document.addEventListener('pointerout', event => {
    const card = event.target.closest(selector);
    if (!card || card.contains(event.relatedTarget)) return;
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
  }, { passive: true });
}
function bootAwwwardsMotion() {
  const veil = document.querySelector('#transitionVeil');
  if (prefersReducedMotion || !window.gsap) {
    forceRemoveTransitionVeil();
    return;
  }
  if (window.SplitText) gsap.registerPlugin(SplitText);
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);
  const title = document.querySelector('.hero-copy h2');
  const split = window.SplitText && title ? new SplitText(title, { type: 'chars,words,lines', charsClass: 'char', wordsClass: 'word', linesClass: 'line' }) : null;
  const chars = split ? split.chars : document.querySelectorAll('.hero-copy h2 .char');
  const timeline = gsap.timeline({ defaults: { ease: 'expo.out' } });
  timeline
    .set(chars, { yPercent: 120, rotate: 4, opacity: 0 })
    .set('.app-nav', { y: -28, opacity: 0 })
    .set(['.topline p', '.topline h1', '.toolbar button', '.status-strip'], { y: -34, opacity: 0, filter: 'blur(10px)' })
    .set('.panel-wipe', { scaleX: 0, transformOrigin: 'left center' })
    .set('.image-shutters i', { scaleY: 1, transformOrigin: 'top center' })
    .set(['.hero-copy p', '.hero-copy span', '.hero-meta', '.hero-hud article', '.case-strip article', '.vertical-index span', '.motion-marquee', '.philosophy-block'], { y: 34, opacity: 0 })
    .to('#transitionVeil span', { scaleX: 1, duration: 0.85, transformOrigin: 'left center', ease: 'expo.inOut' })
    .to('#transitionVeil', { yPercent: -100, duration: 1.05, ease: 'expo.inOut' })
    .to('.app-nav .panel-wipe', { scaleX: 1, duration: 0.42, ease: 'power4.inOut' }, '-=.9')
    .to('.app-nav .panel-wipe', { xPercent: 102, duration: 0.72, ease: 'power4.inOut' }, '-=.48')
    .to('.app-nav .logo, .app-nav nav a, .app-nav button', { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.86, stagger: 0.055 }, '-=.72')
    .to('.app-nav', { y: 0, opacity: 1, duration: 0.82 }, '-=.95')
    .to('.topline .panel-wipe', { scaleX: 1, duration: 0.38, ease: 'power4.inOut' }, '-=.9')
    .to('.topline .panel-wipe', { xPercent: 102, duration: 0.68, ease: 'power4.inOut' }, '-=.48')
    .to(['.topline p', '.topline h1', '.toolbar button', '.status-strip'], { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.82, stagger: 0.045 }, '-=.78')
    .to('.topline p', window.ScrambleTextPlugin ? { duration: 0.75, scrambleText: { text: 'SMART CAMP OPERATION SYSTEM', chars: 'upperCase', speed: 0.65 } } : { opacity: 1 }, '-=.72')
    .to('.image-shutters i', { scaleY: 0, duration: 1.08, stagger: { each: 0.07, from: 'random' }, ease: 'expo.inOut' }, '-=.88')
    .to('.hero-cover', { scale: 1.015, duration: 1.6 }, '-=.85')
    .to(chars, { yPercent: 0, rotate: 0, opacity: 1, duration: 1.08, stagger: { each: 0.012, from: 'random' } }, '-=.9')
    .to(['.hero-copy p', '.hero-copy span', '.hero-meta'], { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, '-=.75')
    .to('.hero-hud article', { y: 0, opacity: 1, duration: 0.8, stagger: 0.08 }, '-=.55')
    .to('.vertical-index span', { y: 0, opacity: 1, duration: 0.7, stagger: 0.05 }, '-=.62')
    .to('.case-strip article', { y: 0, opacity: 1, duration: 0.7, stagger: 0.06 }, '-=.35')
    .to(['.motion-marquee', '.philosophy-block'], { y: 0, opacity: 1, duration: 0.75, stagger: 0.08 }, '-=.55')
    .add(() => veil?.remove());

  if (window.ScrollTrigger) {
    const lightMode = document.body.classList.contains('performance-mode');
    if (!lightMode) {
      gsap.to('.hero-cover', { yPercent: 10, scale: 1.12, rotate: -2, ease: 'none', scrollTrigger: { trigger: '#mission', start: 'top top', end: 'bottom top', scrub: 0.35 } });
      gsap.to('.sakazuki-title', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '#mission', start: 'top top', end: 'bottom top', scrub: 0.35 } });
      gsap.to('.hero-hud article', { y: -56, opacity: 0.45, stagger: 0.06, ease: 'none', scrollTrigger: { trigger: '#mission', start: 'top top', end: 'bottom top', scrub: 0.35 } });
      gsap.to('.motion-marquee div', { xPercent: -26, ease: 'none', scrollTrigger: { trigger: '.motion-marquee', start: 'top bottom', end: 'bottom top', scrub: 0.45 } });
    }
    const motions = [
      { from: { x: -42, rotate: -1.8, opacity: 0.26 }, to: { x: 0, rotate: 0, opacity: 1 } },
      { from: { x: 42, rotate: 1.8, opacity: 0.26 }, to: { x: 0, rotate: 0, opacity: 1 } },
      { from: { scale: 0.94, opacity: 0.32 }, to: { scale: 1, opacity: 1 } },
      { from: { y: 42, opacity: 0.28 }, to: { y: 0, opacity: 1 } }
    ];
    gsap.utils.toArray('.panel,.case-strip article,.kpi,.philosophy-block,.motion-marquee').slice(0, lightMode ? 10 : 18).forEach((element, index) => {
      const motion = motions[index % motions.length];
      gsap.fromTo(element, motion.from, { ...motion.to, duration: 0.72, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
    });
    bootTextReveals();
  }

  document.querySelectorAll('button,a,.panel,.case-strip article').forEach(element => {
    element.addEventListener('pointerenter', () => gsap.to('#softCursor', { scale: 1.8, opacity: 0.34, duration: 0.25 }));
    element.addEventListener('pointerleave', () => gsap.to('#softCursor', { scale: 1, opacity: 0.18, duration: 0.25 }));
  });
}

function bootTextReveals() {
  if (!window.SplitText || !window.ScrollTrigger || prefersReducedMotion) return;
  document.querySelectorAll('.panel-head h2,.philosophy-block p,.bar-card strong,.task strong,.zone strong,.asset strong,.risk strong').forEach(element => {
    if (element.dataset.textReveal) return;
    element.dataset.textReveal = 'true';
    const split = new SplitText(element, { type: 'lines', linesClass: 'reveal-line' });
    gsap.from(split.lines, {
      yPercent: 110,
      opacity: 0,
      rotate: 1.2,
      duration: 0.9,
      stagger: 0.065,
      ease: 'expo.out',
      scrollTrigger: { trigger: element, start: 'top 88%', once: true }
    });
  });
}

function bootSmoothScroll() {
  if (prefersReducedMotion || document.body.classList.contains('performance-mode') || !window.Lenis) return;
  const lenis = new Lenis({ duration: 0.72, easing: t => 1 - Math.pow(1 - t, 3), smoothWheel: true, wheelMultiplier: 0.85, touchMultiplier: 1 });
  if (window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(500, 33);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }
}

function bootScrollReveals() {
  const sections = document.querySelectorAll('.layout,.case-strip,.kpi-grid');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
  }, { threshold: 0.18 });
  sections.forEach(section => observer.observe(section));
  const progress = document.querySelector('#scrollProgress');
  const oracle = document.querySelector('#scrollOracle');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const value = max ? (scrollY / max) * 100 : 0;
    progress.style.width = `${value}%`;
    if (oracle) oracle.textContent = String(Math.round(value)).padStart(2, '0');
  }, { passive: true });
}

function bootAutoHideNav() {
  const nav = document.querySelector('.app-nav');
  const hero = document.querySelector('.hero-stage');
  if (!nav) return;
  let lastY = scrollY;
  let hidden = false;
  let ticking = false;
  const threshold = 12;

  document.body.classList.add('nav-ready');

  const setHidden = value => {
    if (hidden === value) return;
    hidden = value;
    document.body.classList.toggle('nav-hidden', hidden);
  };

  const update = () => {
    ticking = false;
    const currentY = Math.max(0, scrollY);
    const delta = currentY - lastY;
    const paletteOpen = document.querySelector('#commandPalette')?.hidden === false;
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 0;
    const insideOpeningHero = heroBottom > innerHeight * 0.28;
    const nearTop = currentY < 72;

    if (paletteOpen) {
      setHidden(false);
    } else if (nearTop || insideOpeningHero) {
      setHidden(true);
    } else if (delta > threshold) {
      setHidden(true);
    } else if (delta < -threshold) {
      setHidden(false);
    }

    lastY = currentY;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  nav.addEventListener('pointerenter', () => setHidden(false));
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
}

function bootRailSync() {
  const rail = document.querySelector('.app-nav') || document.querySelector('.rail');
  const links = [...document.querySelectorAll('.app-nav nav a[data-section], .rail nav a[data-section]')];
  const progress = document.querySelector('#railProgress');
  const marker = document.querySelector('#railMarker');
  if (!rail || !links.length) return;
  const sectionPairs = links
    .map(link => ({ link, section: document.getElementById(link.dataset.section) }))
    .filter(pair => pair.section);
  let ticking = false;
  let activeId = '';

  const update = () => {
    ticking = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const ratio = Math.min(1, Math.max(0, scrollY / max));
    if (progress) progress.style.transform = `scaleY(${ratio})`;
    if (marker) marker.style.top = `${ratio * 100}%`;
    rail.style.setProperty('--rail-progress', ratio.toFixed(3));

    let current = sectionPairs[0];
    sectionPairs.forEach(pair => {
      if (pair.section.getBoundingClientRect().top <= innerHeight * 0.42) current = pair;
    });
    if (!current || current.section.id === activeId) return;
    activeId = current.section.id;
    sectionPairs.forEach(pair => {
      const isActive = pair.section.id === activeId;
      pair.link.classList.toggle('active', isActive);
      pair.link.toggleAttribute('aria-current', isActive);
    });
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  links.forEach(link => {
    link.addEventListener('click', event => {
      const target = document.getElementById(link.dataset.section);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
}

function bootFinaleWall() {
  const finale = document.querySelector('.finale-wall');
  const stage = document.querySelector('#physicsStage');
  if (!finale || !stage) return;

  if (!window.Matter || prefersReducedMotion) {
    finale.classList.add('is-visible');
    return;
  }

  const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = window.Matter;
  const engine = Engine.create({ enableSleeping: false });
  engine.gravity.y = 1.05;
  const runner = Runner.create();
  const bodies = [];
  const walls = [];
  const names = ['刘恩轩', '韩帅强', '徐鹏'];
  const seededRandom = seed => {
    const value = Math.sin(seed * 9301 + 49297) * 233280;
    return value - Math.floor(value);
  };
  const buildBlockSpecs = () => Array.from({ length: 18 }, (_, index) => {
    const name = names[index % names.length];
    const randomA = seededRandom(index + 3);
    const randomB = seededRandom(index + 17);
    const randomC = seededRandom(index + 41);
    const wide = name.length <= 2;
    const width = Math.round((wide ? 170 : 210) + randomA * (wide ? 42 : 58));
    const height = Math.round(66 + randomB * 24);
    const angle = (randomC - 0.5) * 1.7;
    const className = `name-block shape-${['a', 'b', 'c'][index % 3]} size-${index % 4}`;
    return [name, className, width, height, angle, randomA];
  });

  const clearStage = () => {
    stage.innerHTML = '';
    bodies.forEach(body => Composite.remove(engine.world, body));
    walls.forEach(wall => Composite.remove(engine.world, wall));
    bodies.length = 0;
    walls.length = 0;
  };

  const makeBlock = (spec, index, width, totalBlocks) => {
    const [label, className, baseWidth, baseHeight, angle, variance = 0.5] = spec;
    const scale = Math.max(0.78, Math.min(1, width / 1440));
    const blockWidth = Math.round(baseWidth * scale);
    const blockHeight = Math.round(baseHeight * scale);
    const element = document.createElement('div');
    element.className = `physics-block ${className}`;
    element.innerHTML = `<span>${label}</span>`;
    element.style.width = `${blockWidth}px`;
    element.style.height = `${blockHeight}px`;
    element.dataset.physicsBlock = 'true';
    stage.appendChild(element);
    const columns = Math.max(6, Math.ceil(Math.sqrt(totalBlocks + 10)));
    const x = ((index % columns) + 0.56) * (width / (columns + 0.08));
    const y = 90 + Math.floor(index / columns) * 96 + (index % 3) * 10;
    const body = Bodies.rectangle(x, y, blockWidth, blockHeight, {
      restitution: 0.06 + variance * 0.04,
      friction: 0.9,
      frictionStatic: 0.72,
      frictionAir: 0.04 + variance * 0.012,
      density: 0.0018 + variance * 0.0012,
      chamfer: { radius: 4 },
      render: { visible: false }
    });
    Body.rotate(body, angle);
    body.plugin = { element };
    bodies.push(body);
    return body;
  };

  const layoutWorld = () => {
    const rect = finale.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width));
    const height = Math.max(520, Math.round(rect.height));
    clearStage();
    walls.push(
      Bodies.rectangle(width / 2, height - 28, width + 220, 56, { isStatic: true }),
      Bodies.rectangle(-54, height / 2, 108, height + 220, { isStatic: true }),
      Bodies.rectangle(width + 54, height / 2, 108, height + 220, { isStatic: true })
    );
    Composite.add(engine.world, walls);
    const blockSpecs = buildBlockSpecs();
    Composite.add(engine.world, blockSpecs.map((spec, index) => makeBlock(spec, index, width, blockSpecs.length)));
  };

  const syncDom = () => {
    bodies.forEach(body => {
      const element = body.plugin?.element;
      if (!element) return;
      element.style.transform = `translate3d(${body.position.x - element.offsetWidth / 2}px, ${body.position.y - element.offsetHeight / 2}px, 0) rotate(${body.angle}rad)`;
    });
  };

  const mouse = Mouse.create(finale);
  mouse.pixelRatio = window.devicePixelRatio || 1;
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: { stiffness: 0.2, damping: 0.08, render: { visible: false } }
  });
  Composite.add(engine.world, mouseConstraint);
  Events.on(mouseConstraint, 'startdrag', event => event.body?.plugin?.element?.classList.add('is-dragging'));
  Events.on(mouseConstraint, 'enddrag', event => event.body?.plugin?.element?.classList.remove('is-dragging'));
  Events.on(engine, 'afterUpdate', syncDom);

  let draggedBody = null;
  let lastPointer = null;
  const pointerPoint = event => {
    const rect = finale.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const startDrag = event => {
    const clientX = event.clientX ?? event.touches?.[0]?.clientX;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;
    const element = event.target.closest('.physics-block');
    if (!element) return;
    const body = bodies.find(item => item.plugin?.element === element);
    if (!body) return;
    event.preventDefault();
    if (event.pointerId != null) element.setPointerCapture?.(event.pointerId);
    draggedBody = body;
    lastPointer = pointerPoint({ clientX, clientY });
    element.classList.add('is-dragging');
    Body.setAngularVelocity(body, 0);
  };
  const moveDrag = event => {
    if (!draggedBody || !lastPointer) return;
    const clientX = event.clientX ?? event.touches?.[0]?.clientX;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY;
    if (clientX == null || clientY == null) return;
    const point = pointerPoint({ clientX, clientY });
    const velocity = { x: (point.x - lastPointer.x) * 0.22, y: (point.y - lastPointer.y) * 0.22 };
    Body.setPosition(draggedBody, point);
    Body.setVelocity(draggedBody, velocity);
    lastPointer = point;
  };
  const endDrag = () => {
    if (!draggedBody) return;
    draggedBody.plugin?.element?.classList.remove('is-dragging');
    draggedBody = null;
    lastPointer = null;
  };
  stage.addEventListener('pointerdown', startDrag);
  stage.addEventListener('mousedown', startDrag);
  window.addEventListener('pointermove', moveDrag, { passive: true });
  window.addEventListener('mousemove', moveDrag, { passive: true });
  window.addEventListener('pointerup', endDrag, { passive: true });
  window.addEventListener('mouseup', endDrag, { passive: true });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      finale.classList.toggle('is-visible', entry.isIntersecting);
      document.body.classList.toggle('finale-mode', entry.isIntersecting);
      if (entry.isIntersecting) Runner.run(runner, engine);
    });
  }, { threshold: 0.12 });
  observer.observe(finale);
  window.addEventListener('scroll', () => {
    const rect = finale.getBoundingClientRect();
    document.body.classList.toggle('finale-mode', rect.top < innerHeight * 0.28 && rect.bottom > innerHeight * 0.35);
  }, { passive: true });

  document.querySelector('#resetFinale')?.addEventListener('click', () => {
    layoutWorld();
    syncDom();
  });

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      layoutWorld();
      syncDom();
    }, 180);
  }, { passive: true });

  layoutWorld();
  Runner.run(runner, engine);
  syncDom();
}
function bootHoldScan() {
  const button = document.querySelector('#holdScan');
  if (!button) return;
  let timer = null;
  const start = () => {
    button.classList.add('is-scanning');
    document.body.classList.add('scan-active');
    timer = setTimeout(() => {
      document.querySelector('#command')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      button.classList.remove('is-scanning');
      document.body.classList.remove('scan-active');
    }, 1150);
  };
  const stop = () => {
    clearTimeout(timer);
    button.classList.remove('is-scanning');
    document.body.classList.remove('scan-active');
  };
  button.addEventListener('pointerdown', start);
  button.addEventListener('pointerup', stop);
  button.addEventListener('pointerleave', stop);
}
document.querySelector('#installBtn').addEventListener('click', async () => {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  await deferredInstall.userChoice;
  deferredInstall = null;
  document.querySelector('#installBtn').hidden = true;
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('../sw.js').catch(() => {});
}

document.body.classList.add('awwwards-mode', 'sakazuki-mode', 'performance-mode');
boot().catch(error => {
  document.body.insertAdjacentHTML('afterbegin', `<div style="padding:14px;background:#9b1c1c;color:#fff">控制台加载失败：${error.message}</div>`);
});
bootParticles();
bootInteractionFX();
bootOperationalCards();
bootSmoothScroll();
bootAwwwardsMotion();
bootScrollReveals();
bootRailSync();
bootAutoHideNav();
bootFinaleWall();
bootHoldScan();


























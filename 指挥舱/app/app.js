const state = { data: null };
const zoneName = id => state.data?.zones.find(zone => zone.id === id)?.name || id;

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || '请求失败');
  return payload;
}

function renderMetrics(metrics) {
  const items = [
    ['累计游客', metrics.visitors.toLocaleString()],
    ['预约转化', `${metrics.bookingRate}%`],
    ['营收估算', `¥${metrics.revenue.toLocaleString()}`],
    ['资产健康', `${metrics.assetHealth}%`],
    ['告警闭环', `${metrics.alertCloseRate}%`],
    ['客单价', `¥${metrics.avgOrderValue}`]
  ];
  document.querySelector('#metrics').innerHTML = items.map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join('');
}

function renderBusinessCards(data) {
  const paidOrders = data.orders.filter(order => order.status === '已支付').length;
  const openZones = data.zones.filter(zone => zone.status === '开放').length;
  const highAlerts = data.alerts.filter(alert => alert.level === '高').length;
  const pendingInspections = data.inspections.filter(item => item.status !== '已完成').length;
  const cards = [
    ['营收闭环', `已支付订单 ${paidOrders} 笔`, '预约、确认、支付状态和客单价形成营收链路。'],
    ['容量运营', `开放区域 ${openZones}/${data.zones.length}`, '基于区域容量和开放状态控制游客接待能力。'],
    ['安全风控', `高风险告警 ${highAlerts} 条`, '对亲水平台、塔架、照明等风险点进行分级处置。'],
    ['巡检履约', `待处理巡检 ${pendingInspections} 项`, '将巡检任务、责任人、截止日期纳入运营闭环。']
  ];
  document.querySelector('#businessCards').innerHTML = cards.map(([title, value, desc]) => `<article class="value-card"><span>${value}</span><h3>${title}</h3><p>${desc}</p></article>`).join('');
}

function renderZones(zones) {
  document.querySelector('#zoneCards').innerHTML = zones.map(zone => `
    <article class="card">
      <span class="tag ${zone.status !== '开放' ? 'warn' : ''}">${zone.type} · ${zone.status}</span>
      <h3>${zone.name}</h3>
      <p>${zone.description}</p>
      <p><strong>容量：</strong>${zone.capacity} 人 / <strong>价格：</strong>${zone.price ? `¥${zone.price}` : '免费'}</p>
    </article>`).join('');
  document.querySelector('#zoneSelect').innerHTML = zones.filter(zone => zone.status === '开放').map(zone => `<option value="${zone.id}">${zone.name} · ¥${zone.price}</option>`).join('');
}

function renderActivities(activities) {
  document.querySelector('#activityCards').innerHTML = activities.map(activity => {
    const percent = Math.round((activity.joined / activity.quota) * 100);
    return `<article class="card"><span class="tag">${activity.status}</span><h3>${activity.title}</h3><p>${activity.date} · ${zoneName(activity.zone)}</p><p>${activity.joined}/${activity.quota} 人已报名</p><div class="progress"><i style="width:${percent}%"></i></div></article>`;
  }).join('');
}

function renderBookings(bookings) {
  document.querySelector('#bookingList').innerHTML = bookings.slice(0, 6).map(booking => `<article><h4>${booking.name} · ${zoneName(booking.zone)}</h4><p>${booking.date} / ${booking.people} 人 / ${booking.status}</p></article>`).join('');
}

function renderAssets(assets) {
  document.querySelector('#assetList').innerHTML = assets.map(asset => `<article class="ops-item"><div><strong>${asset.name}</strong><span>${zoneName(asset.zone)} · ${asset.type} · ${asset.owner}</span></div><em class="${asset.status === '待维修' ? 'danger' : ''}">${asset.status}</em><div class="health"><i style="width:${asset.health}%"></i></div></article>`).join('');
}

function renderAlerts(alerts) {
  document.querySelector('#alertList').innerHTML = alerts.map(alert => `<article class="ops-item"><div><strong>${alert.title}</strong><span>${zoneName(alert.zone)} · ${alert.type} · ${alert.owner}</span></div><em class="${alert.level === '高' ? 'danger' : alert.level === '中' ? 'warn' : ''}">${alert.level} · ${alert.status}</em></article>`).join('');
}

function renderFeedback(feedback) {
  document.querySelector('#feedbackList').innerHTML = feedback.slice(0, 6).map(item => `<article><h4>${item.name} · ${item.status}</h4><p>${item.content}</p></article>`).join('');
}

async function loadData() {
  state.data = await api('/api/public');
  renderMetrics(state.data.metrics);
  renderBusinessCards(state.data);
  renderZones(state.data.zones);
  renderActivities(state.data.activities);
  renderBookings(state.data.bookings);
  renderAssets(state.data.assets || []);
  renderAlerts(state.data.alerts || []);
  renderFeedback(state.data.feedback);
}

document.querySelector('#bookingForm').addEventListener('submit', async event => {
  event.preventDefault();
  const message = document.querySelector('#bookingMessage');
  const data = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await api('/api/bookings', { method: 'POST', body: JSON.stringify(data) });
    message.textContent = '预约已提交，后台将尽快确认。';
    event.currentTarget.reset();
    await loadData();
  } catch (error) {
    message.textContent = error.message;
  }
});

document.querySelector('#feedbackForm').addEventListener('submit', async event => {
  event.preventDefault();
  const message = document.querySelector('#feedbackMessage');
  const data = Object.fromEntries(new FormData(event.currentTarget));
  try {
    await api('/api/feedback', { method: 'POST', body: JSON.stringify(data) });
    message.textContent = '反馈已提交，感谢你的建议。';
    event.currentTarget.reset();
    await loadData();
  } catch (error) {
    message.textContent = error.message;
  }
});

loadData().catch(error => {
  document.body.insertAdjacentHTML('afterbegin', `<div style="padding:14px;background:#9b1c1c;color:#fff">数据加载失败：${error.message}</div>`);
});
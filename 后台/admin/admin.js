let db = null;

const zoneName = id => db?.zones.find(zone => zone.id === id)?.name || id;
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const delay = index => `style="animation-delay:${index * 45}ms"`;
const text = value => value;

const CN = {
  requestFailed: '\u8bf7\u6c42\u5931\u8d25',
  visitors: '\u7d2f\u8ba1\u6e38\u5ba2',
  bookingRate: '\u9884\u7ea6\u8f6c\u5316',
  revenue: '\u8425\u6536\u4f30\u7b97',
  assetHealth: '\u8d44\u4ea7\u5065\u5eb7',
  alertClose: '\u544a\u8b66\u95ed\u73af',
  avgOrder: '\u5ba2\u5355\u4ef7',
  zone: '\u8425\u5730\u533a\u57df',
  people: '\u5165\u8425\u4eba\u6570',
  person: '\u4eba',
  expand: '\u5c55\u5f00',
  collapse: '\u6536\u8d77',
  focus: '\u805a\u7126',
  focused: '\u5df2\u805a\u7126',
  confirm: '\u786e\u8ba4',
  cancel: '\u53d6\u6d88',
  confirmed: '\u5df2\u786e\u8ba4',
  canceled: '\u5df2\u53d6\u6d88',
  open: '\u5f00\u653e',
  maintenance: '\u7ef4\u62a4\u4e2d',
  closed: '\u5173\u95ed',
  saveStatus: '\u4fdd\u5b58\u72b6\u6001',
  capacity: '\u5bb9\u91cf',
  progress: '\u62a5\u540d\u8fdb\u5ea6',
  registering: '\u62a5\u540d\u4e2d',
  full: '\u5df2\u6ee1\u5458',
  ended: '\u5df2\u7ed3\u675f',
  markHandled: '\u6807\u8bb0\u5904\u7406',
  delete: '\u5220\u9664',
  handled: '\u5df2\u5904\u7406',
  normal: '\u6b63\u5e38',
  inspecting: '\u5de1\u68c0\u4e2d',
  repair: '\u5f85\u7ef4\u4fee',
  disabled: '\u505c\u7528',
  priority: '\u4f18\u5148\u7ea7',
  pending: '\u5f85\u5904\u7406',
  doing: '\u8fdb\u884c\u4e2d',
  done: '\u5df2\u5b8c\u6210',
  processing: '\u5904\u7406\u4e2d',
  deleting: '\u5220\u9664\u4e2d',
  syncing: '\u540c\u6b65\u4e2d',
  saved: '\u5df2\u4fdd\u5b58',
  yuan: '\u00a5',
  dot: ' ? '
};

const statusClass = value => {
  const valueText = String(value);
  const dangerWords = [CN.cancel, CN.canceled, CN.closed, CN.disabled, CN.repair, '\u9ad8', '\u544a\u8b66', '\u5f02\u5e38', CN.pending];
  const warningWords = [CN.maintenance, CN.doing, CN.processing, CN.registering, CN.inspecting, '\u4e2d'];
  const mutedWords = [CN.ended, CN.handled, CN.done, CN.full];
  if (dangerWords.some(word => valueText.includes(word))) return 'is-danger';
  if (warningWords.some(word => valueText.includes(word))) return 'is-warning';
  if (mutedWords.some(word => valueText.includes(word))) return 'is-muted';
  return '';
};
const statusPill = value => `<span class="status ${statusClass(value)}">${value}</span>`;

const API_BASE = 'http://localhost:8080';

async function api(path, options = {}) {
  const headers = {};
  if (options.method && options.method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(API_BASE + path, { headers, credentials: 'include', ...options });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || payload.msg || CN.requestFailed);
  return payload;
}

function markNumberLength(element, value) {
  const numericText = String(value).replace(/[^\d.]/g, '');
  element.classList.toggle('is-long-number', numericText.length >= 7);
  element.classList.toggle('is-extra-long-number', numericText.length >= 10);
}

function animateNumber(element, rawValue) {
  const finalText = String(rawValue);
  markNumberLength(element, finalText);
  const numeric = Number(finalText.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numeric) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = finalText;
    return;
  }
  const prefix = finalText.match(/^\D+/)?.[0] || '';
  const suffix = finalText.match(/[^\d,.]+$/)?.[0] || '';
  const start = performance.now();
  const duration = 720;
  const tick = now => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${prefix}${Math.round(numeric * eased).toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
    else element.textContent = finalText;
  };
  requestAnimationFrame(tick);
}

function renderMetrics() {
  const metrics = db.metrics;
  const items = [
    [CN.visitors, metrics.visitors.toLocaleString(), 'Visitor Flow'],
    [CN.bookingRate, `${metrics.bookingRate}%`, 'Conversion'],
    [CN.revenue, `${CN.yuan}${metrics.revenue.toLocaleString()}`, 'Revenue'],
    [CN.assetHealth, `${metrics.assetHealth}%`, 'Asset Health'],
    [CN.alertClose, `${metrics.alertCloseRate}%`, 'Safety SLA'],
    [CN.avgOrder, `${CN.yuan}${metrics.avgOrderValue}`, 'Avg Order']
  ];
  $('#metrics').innerHTML = items.map(([label, value, code], index) => `
    <article class="metric" ${delay(index)}>
      <span>${code}</span>
      <strong data-count="${value}">${value}</strong>
      <span>${label}</span>
    </article>
  `).join('');
  $$('[data-count]').forEach(item => animateNumber(item, item.dataset.count));
}

function renderBookings() {
  $('#bookingTable').innerHTML = `<div class="booking-grid">${db.bookings.map((item, index) => `
    <article class="panel-card booking-card" data-row-id="${item.id}" ${delay(index)}>
      <div class="card-top"><div><h3>${item.name}</h3><p>${item.phone}</p></div>${statusPill(item.status)}</div>
      <div class="booking-meta"><div class="mini-stat"><span>${CN.zone}</span><strong>${zoneName(item.zone)}</strong></div><div class="mini-stat"><span>${CN.people}</span><strong>${item.people} ${CN.person}</strong></div></div>
      <p>${item.date}</p>
      <div class="interaction-toolbar"><button class="micro-button" type="button" data-expand-card>${CN.expand}</button><button class="micro-button" type="button" data-pin-card>${CN.focus}</button></div><div class="booking-actions"><button data-booking="${item.id}" data-status="${CN.confirmed}">${CN.confirm}</button><button data-booking="${item.id}" data-status="${CN.canceled}">${CN.cancel}</button></div>
    </article>`).join('')}</div>`;
}

function renderZones() {
  const positions = [[18, 22, 70], [55, 18, 84], [70, 52, 62], [34, 62, 76], [15, 70, 58], [78, 28, 54]];
  const points = db.zones.map((item, index) => {
    const [x, y, size] = positions[index % positions.length];
    return `<div class="zone-point" style="--x:${x}%;--y:${y}%;--size:${size}px;animation-delay:${index * 120}ms"><strong>${item.capacity}</strong></div>`;
  }).join('');
  const list = db.zones.map((item, index) => `
    <article class="panel-card zone-item" data-row-id="${item.id}" ${delay(index)}>
      <strong>${item.name}</strong><br><small>${item.type}${CN.dot}${item.capacity}${CN.person} / ${CN.yuan}${item.price}</small>
      <div class="interaction-toolbar"><button class="micro-button" type="button" data-expand-card>${CN.expand}</button><button class="micro-button" type="button" data-pin-card>${CN.focus}</button></div><div class="control-row"><select data-zone-status="${item.id}"><option ${item.status === CN.open ? 'selected' : ''}>${CN.open}</option><option ${item.status === CN.maintenance ? 'selected' : ''}>${CN.maintenance}</option><option ${item.status === CN.closed ? 'selected' : ''}>${CN.closed}</option></select><button data-zone-save="${item.id}">${CN.saveStatus}</button></div>
    </article>`).join('');
  $('#zoneTable').innerHTML = `<div class="zone-map"><div class="panel-card zone-orbit">${points}</div><div class="zone-list">${list}</div></div>`;
}

function renderActivities() {
  $('#activityTable').innerHTML = `<div class="activity-lanes">${db.activities.map((item, index) => {
    const progress = Math.min(Math.round(item.joined / item.quota * 100), 100);
    return `<article class="panel-card activity-card" data-row-id="${item.id}" ${delay(index)}>
      <strong>${item.title}</strong><p>${item.date}${CN.dot}${zoneName(item.zone)}</p>
      <div class="activity-progress" aria-label="${CN.progress}"><span style="--progress:${progress}%"></span></div>
      <small>${item.joined}/${item.quota}${CN.dot}${progress}% ${CN.capacity}</small>
      <div class="interaction-toolbar"><button class="micro-button" type="button" data-expand-card>${CN.expand}</button><button class="micro-button" type="button" data-pin-card>${CN.focus}</button></div><div class="control-row"><select data-activity-status="${item.id}"><option ${item.status === CN.registering ? 'selected' : ''}>${CN.registering}</option><option ${item.status === CN.full ? 'selected' : ''}>${CN.full}</option><option ${item.status === CN.ended ? 'selected' : ''}>${CN.ended}</option></select><button data-activity-save="${item.id}">${CN.saveStatus}</button></div>
    </article>`;
  }).join('')}</div>`;
}

function renderFeedback() {
  $('#feedbackTable').innerHTML = `<div class="feedback-stack">${db.feedback.map((item, index) => `
    <article class="panel-card feedback-item" data-row-id="${item.id}" ${delay(index)}>
      <strong>${item.name}<br><small>${item.createdAt}</small></strong>
      <span>${item.content}</span>
      <div>${statusPill(item.status)}<div class="interaction-toolbar"><button class="micro-button" type="button" data-expand-card>${CN.expand}</button><button class="micro-button" type="button" data-pin-card>${CN.focus}</button></div><div class="control-row"><button data-feedback="${item.id}" data-status="${CN.handled}">${CN.markHandled}</button><button data-delete-feedback="${item.id}">${CN.delete}</button></div></div>
    </article>`).join('')}</div>`;
}

function renderAssets() {
  $('#assetTable').innerHTML = `<div class="asset-grid">${db.assets.map((item, index) => `
    <article class="panel-card asset-card" data-row-id="${item.id}" ${delay(index)}>
      <div class="health-ring" style="--pct:${item.health}"><span>${item.health}%</span></div>
      <strong>${item.name}</strong><p>${zoneName(item.zone)}${CN.dot}${item.type}</p><small>${item.owner}${CN.dot}${item.priority}${CN.priority}${CN.dot}${item.lastCheck}</small>
      <div class="interaction-toolbar"><button class="micro-button" type="button" data-expand-card>${CN.expand}</button><button class="micro-button" type="button" data-pin-card>${CN.focus}</button></div><div class="control-row"><select data-asset-status="${item.id}"><option ${item.status === CN.normal ? 'selected' : ''}>${CN.normal}</option><option ${item.status === CN.inspecting ? 'selected' : ''}>${CN.inspecting}</option><option ${item.status === CN.repair ? 'selected' : ''}>${CN.repair}</option><option ${item.status === CN.disabled ? 'selected' : ''}>${CN.disabled}</option></select><button data-asset-save="${item.id}">${CN.saveStatus}</button></div>
    </article>`).join('')}</div>`;
}

function renderInspections() {
  $('#inspectionTable').innerHTML = `<div class="inspection-list">${db.inspections.map((item, index) => `
    <article class="panel-card inspection-item" data-row-id="${item.id}" ${delay(index)}>
      <span class="inspection-dot"></span>
      <div><strong>${item.title}</strong><p>${item.result}</p><small>${zoneName(item.zone)}${CN.dot}${item.owner}${CN.dot}${item.frequency}${CN.dot}${item.dueDate}</small></div>
      <div class="interaction-toolbar"><button class="micro-button" type="button" data-expand-card>${CN.expand}</button><button class="micro-button" type="button" data-pin-card>${CN.focus}</button></div><div class="control-row"><select data-inspection-status="${item.id}"><option ${item.status === CN.pending ? 'selected' : ''}>${CN.pending}</option><option ${item.status === CN.doing ? 'selected' : ''}>${CN.doing}</option><option ${item.status === CN.done ? 'selected' : ''}>${CN.done}</option></select><button data-inspection-save="${item.id}">${CN.saveStatus}</button></div>
    </article>`).join('')}</div>`;
}

function renderAlerts() {
  $('#alertTable').innerHTML = `<div class="alert-grid">${db.alerts.map((item, index) => `
    <article class="panel-card alert-card" data-row-id="${item.id}" ${delay(index)}>
      <div class="card-top"><strong>${item.title}</strong>${statusPill(item.level)}</div>
      <p>${zoneName(item.zone)}${CN.dot}${item.type}</p><small>${item.owner}${CN.dot}${item.createdAt}</small>
      <div class="interaction-toolbar"><button class="micro-button" type="button" data-expand-card>${CN.expand}</button><button class="micro-button" type="button" data-pin-card>${CN.focus}</button></div><div class="control-row"><select data-alert-status="${item.id}"><option ${item.status === CN.pending ? 'selected' : ''}>${CN.pending}</option><option ${item.status === CN.processing ? 'selected' : ''}>${CN.processing}</option><option ${item.status === CN.handled ? 'selected' : ''}>${CN.handled}</option></select><button data-alert-save="${item.id}">${CN.saveStatus}</button></div>
    </article>`).join('')}</div>`;
}

function replayDataAnimations() {
  document.body.classList.remove('data-ready');
  $$('.panel-card, .metric').forEach(item => {
    item.classList.remove('is-armed');
    void item.offsetWidth;
  });
  requestAnimationFrame(() => {
    document.body.classList.add('data-ready');
    $$('.panel-card, .metric').forEach((item, index) => {
      window.setTimeout(() => item.classList.add('is-armed'), Math.min(index, 24) * 32);
    });
  });
}

function renderAll() {
  document.body.classList.remove('data-ready');
  renderMetrics();
  renderBookings();
  renderZones();
  renderActivities();
  renderFeedback();
  renderAssets();
  renderInspections();
  renderAlerts();
  bindActions();
  bindActiveNav();
  replayDataAnimations();
}

async function loadAdmin() {
  db = await api('/api/admin');
  renderAll();
}

async function withRowFeedback(button, action, remove = false) {
  const row = button.closest('[data-row-id]');
  button.disabled = true;
  button.dataset.idleText = button.textContent;
  button.textContent = remove ? CN.deleting : CN.syncing;
  if (remove && row) row.classList.add('is-removing');
  await action();
  if (!remove && row) row.classList.add('is-saved');
  if (!remove) button.textContent = CN.saved;
  await new Promise(resolve => setTimeout(resolve, remove ? 180 : 360));
  await loadAdmin();
}

function bindActions() {
  $$('[data-booking]').forEach(button => button.onclick = () => withRowFeedback(button, () => api(`/api/admin/bookings/${button.dataset.booking}`, { method: 'PUT', body: JSON.stringify({ status: button.dataset.status }) })));
  $$('[data-feedback]').forEach(button => button.onclick = () => withRowFeedback(button, () => api(`/api/admin/feedback/${button.dataset.feedback}`, { method: 'PUT', body: JSON.stringify({ status: button.dataset.status }) })));
  $$('[data-delete-feedback]').forEach(button => button.onclick = () => withRowFeedback(button, () => api(`/api/admin/feedback/${button.dataset.deleteFeedback}`, { method: 'DELETE' }), true));
  $$('[data-zone-save]').forEach(button => button.onclick = () => withRowFeedback(button, () => api(`/api/admin/zones/${button.dataset.zoneSave}`, { method: 'PUT', body: JSON.stringify({ status: $(`[data-zone-status="${button.dataset.zoneSave}"]`).value }) })));
  $$('[data-activity-save]').forEach(button => button.onclick = () => withRowFeedback(button, () => api(`/api/admin/activities/${button.dataset.activitySave}`, { method: 'PUT', body: JSON.stringify({ status: $(`[data-activity-status="${button.dataset.activitySave}"]`).value }) })));
  $$('[data-asset-save]').forEach(button => button.onclick = () => withRowFeedback(button, () => api(`/api/admin/assets/${button.dataset.assetSave}`, { method: 'PUT', body: JSON.stringify({ status: $(`[data-asset-status="${button.dataset.assetSave}"]`).value }) })));
  $$('[data-inspection-save]').forEach(button => button.onclick = () => withRowFeedback(button, () => api(`/api/admin/inspections/${button.dataset.inspectionSave}`, { method: 'PUT', body: JSON.stringify({ status: $(`[data-inspection-status="${button.dataset.inspectionSave}"]`).value }) })));
  $$('[data-alert-save]').forEach(button => button.onclick = () => withRowFeedback(button, () => api(`/api/admin/alerts/${button.dataset.alertSave}`, { method: 'PUT', body: JSON.stringify({ status: $(`[data-alert-status="${button.dataset.alertSave}"]`).value }) })));
}

async function enterWorkspace(skipTransition = false) {
  const login = $('#login');
  const workspace = $('#workspace');
  if (!skipTransition) {
    document.body.classList.add('workspace-entering');
    await new Promise(resolve => setTimeout(resolve, 180));
  }
  login.hidden = true;
  workspace.hidden = false;
  if (!db) await loadAdmin();
  requestAnimationFrame(() => {
    document.body.classList.remove('is-auth-view');
    document.body.classList.add('workspace-ready');
    document.body.classList.remove('workspace-entering');
  });
}

function setupSmartNav() {
  let lastY = window.scrollY;
  let ticking = false;
  const topbar = $('#topbar');
  const update = () => {
    const currentY = window.scrollY;
    const delta = currentY - lastY;
    const shouldHide = currentY > 120 && delta > 6;
    const shouldShow = delta < -6 || currentY < 80;
    if (shouldHide) document.body.classList.add('nav-hidden');
    if (shouldShow) document.body.classList.remove('nav-hidden');
    if (topbar) topbar.dataset.scroll = String(Math.round(currentY));
    lastY = currentY;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('wheel', event => {
    if (window.scrollY > 120 && event.deltaY > 0) document.body.classList.add('nav-hidden');
    if (event.deltaY < 0) document.body.classList.remove('nav-hidden');
  }, { passive: true });
  topbar?.addEventListener('pointerenter', () => document.body.classList.remove('nav-hidden'));
}

async function setupCampModel3d() {
  const canvas = $('#campModel3d');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const THREE = await import('../vendor/three/three.module.js');
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(4.8, 5.4, 7.8);
  camera.lookAt(0, 0, 0);

  const ambient = new THREE.HemisphereLight(0xdffdf3, 0x0b1b13, 2.2);
  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(3.8, 7, 4.5);
  scene.add(ambient, key);

  const root = new THREE.Group();
  scene.add(root);
  const terrainGeometry = new THREE.PlaneGeometry(5.8, 3.8, 42, 28);
  terrainGeometry.rotateX(-Math.PI / 2);
  const positions = terrainGeometry.attributes.position;
  for (let index = 0; index < positions.count; index++) {
    const x = positions.getX(index);
    const z = positions.getZ(index);
    positions.setY(index, Math.sin(x * 1.8) * .08 + Math.cos(z * 2.2) * .06 + Math.random() * .025);
  }
  terrainGeometry.computeVertexNormals();
  root.add(new THREE.Mesh(terrainGeometry, new THREE.MeshStandardMaterial({ color: 0x7ea35a, roughness: .82, metalness: .04 })));

  const water = new THREE.Mesh(new THREE.PlaneGeometry(2.15, .78, 10, 4), new THREE.MeshStandardMaterial({ color: 0x4bd8cf, transparent: true, opacity: .42, roughness: .34, metalness: .12 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(1.45, .045, -1.02);
  root.add(water);

  const platformMaterial = new THREE.MeshStandardMaterial({ color: 0xf1d494, roughness: .65 });
  [[-1.35, .2, .72, .32], [-.35, -.55, .56, .28], [.88, .55, .86, .36], [1.75, -.18, .52, .3]].forEach(([x, z, w, d]) => {
    const platform = new THREE.Mesh(new THREE.BoxGeometry(w, .09, d), platformMaterial);
    platform.position.set(x, .17, z);
    root.add(platform);
  });

  const pathPoints = [[-2.2, .08, .9], [-1.15, .12, .2], [-.3, .14, -.45], [.7, .13, .45], [1.9, .12, -.2]].map(point => new THREE.Vector3(...point));
  root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pathPoints), new THREE.LineBasicMaterial({ color: 0xfff4c5, transparent: true, opacity: .84 })));

  const treeGroup = new THREE.Group();
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5d3f27, roughness: .8 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x1f6b42, roughness: .7 });
  [[-2.25, -1.1], [-2.05, .55], [-1.7, 1.25], [.35, 1.25], [1.4, 1.18], [2.3, .62], [2.25, -1.35], [-.85, -1.35]].forEach(([x, z]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.025, .04, .34, 8), trunkMaterial);
    trunk.position.set(x, .34, z);
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.16, .48, 14), leafMaterial);
    leaf.position.set(x, .65, z);
    treeGroup.add(trunk, leaf);
  });
  root.add(treeGroup);

  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x6fe4d2, transparent: true, opacity: .9 });
  [[-1.65, -.75], [.15, .35], [1.65, .82], [2.05, -1.1]].forEach(([x, z]) => {
    const node = new THREE.Mesh(new THREE.SphereGeometry(.06, 16, 16), nodeMaterial);
    node.position.set(x, .55, z);
    root.add(node);
  });

  let pointerX = 0;
  let pointerY = 0;
  canvas.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - .5) * .38;
    pointerY = ((event.clientY - rect.top) / rect.height - .5) * .26;
  });
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
  };
  resize();
  window.addEventListener('resize', resize);
  const clock = new THREE.Clock();
  const animate = () => {
    const elapsed = clock.getElapsedTime();
    root.rotation.y = -0.48 + pointerX + Math.sin(elapsed * .22) * .035;
    root.rotation.x = -0.18 + pointerY;
    water.material.opacity = .42 + Math.sin(elapsed * 1.8) * .06;
    treeGroup.children.forEach((child, index) => {
      if (child.geometry?.type === 'ConeGeometry') child.rotation.z = Math.sin(elapsed * 1.4 + index) * .025;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
}

function setupOpeningSequence() {
  const opening = $('#openingSequence');
  if (!opening) return;
  setTimeout(() => document.body.classList.add('opening-done'), 3300);
}

function setupLoginCardCraft() {
  const card = $('#loginCard');
  if (!card) return;
  card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
}

function setupPointerCraft() {
  const cursor = $('#ambientCursor');
  if (cursor) {
    window.addEventListener('pointermove', event => {
      document.body.classList.add('pointer-active');
      cursor.style.transform = `translate3d(${event.clientX - 210}px, ${event.clientY - 210}px, 0)`;
    }, { passive: true });
    window.addEventListener('pointerleave', () => document.body.classList.remove('pointer-active'));
  }
  document.addEventListener('pointermove', event => {
    const card = event.target.closest('.panel-card, .metric');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    card.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }, { passive: true });
  document.addEventListener('click', event => {
    const card = event.target.closest('.panel-card, .metric');
    if (!card || event.target.closest('button, select, a, input')) return;
    $$('.panel-card.is-selected, .metric.is-selected').forEach(item => item.classList.remove('is-selected'));
    card.classList.add('is-selected');
  });
}

function setupCardInteractions() {
  document.addEventListener('click', event => {
    const expandButton = event.target.closest('[data-expand-card]');
    if (expandButton) {
      const card = expandButton.closest('.panel-card');
      card?.classList.toggle('is-expanded');
      expandButton.textContent = card?.classList.contains('is-expanded') ? CN.collapse : CN.expand;
      return;
    }
    const pinButton = event.target.closest('[data-pin-card]');
    if (pinButton) {
      const card = pinButton.closest('.panel-card');
      const willPin = !card?.classList.contains('is-pinned');
      $$('.panel-card.is-pinned').forEach(item => item.classList.remove('is-pinned'));
      if (willPin) card?.classList.add('is-pinned');
      pinButton.textContent = willPin ? CN.focused : CN.focus;
    }
  });
}

function bindActiveNav() {
  const links = $$('.topnav a');
  const sections = links.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-28% 0px -58% 0px', threshold: 0.01 });
  sections.forEach(section => observer.observe(section));
}

$('#loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const card = $('.login-card');
  const submit = event.currentTarget.querySelector('.login-submit');
  $('#loginMessage').textContent = '';
  try {
    submit?.classList.add('is-loading');
    await api('/api/login', { method: 'POST', body: JSON.stringify(data) });
    card.classList.add('is-success');
    await new Promise(resolve => setTimeout(resolve, 260));
    await enterWorkspace();
  } catch (error) {
    submit?.classList.remove('is-loading');
    $('#loginMessage').textContent = error.message;
    card.classList.remove('is-error');
    void card.offsetWidth;
    card.classList.add('is-error');
  }
});

$('#logoutBtn').onclick = async () => {
  await api('/api/logout', { method: 'POST' });
  location.reload();
};

setupSmartNav();
setupOpeningSequence();
setupPointerCraft();
setupCardInteractions();
setupLoginCardCraft();
setupCampModel3d();
loadAdmin().then(() => enterWorkspace(true)).catch(() => {});

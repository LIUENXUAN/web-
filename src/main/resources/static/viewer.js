import * as THREE from './vendor/three/three.module.js';
import { OrbitControls } from './vendor/three/OrbitControls.js';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';
import { DRACOLoader } from './vendor/three/DRACOLoader.js';

const canvas = document.querySelector('#threeViewer');
const progress = document.querySelector('.three-progress span, .model-progress span');
const progressBox = document.querySelector('.three-progress, .model-progress');
const progressBoxes = document.querySelectorAll('.three-progress, .model-progress');
const stats = document.querySelector('.model-stats');
const errorBox = document.querySelector('.model-error');

const MODEL_BUILD = '2026-06-19-reliable-loader';
const modelFiles = {
  web: { url: 'assets/model/camp-real-web-nodraco.glb', label: '高清网页模型', size: '61.5MB' },
  lite: { url: 'assets/model/camp-real-web.glb', label: '极速轻量模型', size: '5MB' },
  full: { url: 'assets/model/camp-real.glb', label: '完整真实模型', size: '547MB' }
};

if (!canvas) throw new Error('未找到 threeViewer 画布');
canvas.tabIndex = 0;

function showMessage(message, isError = false) {
  if (isError) {
    errorBox.textContent = message;
    errorBox.classList.add('is-visible');
    console.error(message);
  } else if (progress) {
    progress.textContent = message;
  }
}

function hideProgress() {
  progressBoxes.forEach((node) => {
    node.classList.add('is-hidden');
    node.setAttribute('aria-hidden', 'true');
  });
}

function showProgress() {
  progressBoxes.forEach((node) => {
    node.classList.remove('is-hidden');
    node.removeAttribute('aria-hidden');
  });
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.remove('is-visible');
}

window.addEventListener('error', (event) => showMessage(`页面脚本错误：${event.message}`, true));
window.addEventListener('unhandledrejection', (event) => showMessage(`模型加载异常：${event.reason?.message || event.reason}`, true));

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setClearColor(0x10231d, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10231d);
scene.fog = new THREE.Fog(0x10231d, 110, 760);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100000);
camera.position.set(16, 14, 18);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.28;
controls.target.set(0, 0, 0);
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.panSpeed = 1.7;
controls.zoomToCursor = true;
controls.keyPanSpeed = 42;

scene.add(new THREE.HemisphereLight(0xffffff, 0x24452c, 2.1));
const keyLight = new THREE.DirectionalLight(0xfff0cf, 3.1);
keyLight.position.set(100, 180, 120);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x80e8ff, 1.15);
rimLight.position.set(-120, 90, -80);
scene.add(rimLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(1000, 96),
  new THREE.MeshStandardMaterial({ color: 0x315b35, roughness: 0.9 })
);
floor.rotation.x = -Math.PI / 2;
floor.visible = false;
scene.add(floor);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./vendor/three/');
dracoLoader.setDecoderConfig({ type: 'wasm' });
loader.setDRACOLoader(dracoLoader);
let activeModel = null;
let activeSphere = null;
let activeKind = 'web';
let helperGroup = null;
let modelBox = null;
let coreBox = null;
let loadRequestId = 0;
const focusState = { core: true, ratio: 0.38 };
const pressedKeys = new Set();
let renderMode = 'enhanced';

function setActiveButton(selector, activeValue) {
  document.querySelectorAll(selector).forEach((button) => {
    const datasetKey = selector.match(/data-([a-z]+)/)?.[1];
    button.classList.toggle('is-active', datasetKey ? button.dataset[datasetKey] === activeValue : false);
  });
}

function refreshModeButtons() {
  setActiveButton('[data-crop]', focusState.core ? 'core' : 'all');
  setActiveButton('[data-load]', activeKind);
  setActiveButton('[data-render]', renderMode);
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  if (canvas.width !== Math.floor(width * renderer.getPixelRatio()) || canvas.height !== Math.floor(height * renderer.getPixelRatio())) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function beautifyModel(root) {
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.frustumCulled = false;
    node.renderOrder = 1;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((material) => {
      if (!material) return;
      material.side = THREE.DoubleSide;
      material.transparent = false;
      material.opacity = 1;
      material.depthWrite = true;
      material.depthTest = true;
      material.roughness = Math.max(material.roughness ?? 0.8, 0.72);
      material.needsUpdate = true;
    });
  });
}

function applyRenderMode(mode = renderMode) {
  renderMode = mode;
  if (!activeModel) return;
  activeModel.traverse((node) => {
    if (!node.isMesh) return;
    if (!node.userData.originalMaterial) node.userData.originalMaterial = node.material;
    if (mode === 'material') {
      node.material = node.userData.originalMaterial;
    } else if (mode === 'clay') {
      node.material = new THREE.MeshStandardMaterial({ color: 0xe7dfc7, roughness: 0.86, metalness: 0.02, side: THREE.DoubleSide });
    } else {
      const source = Array.isArray(node.userData.originalMaterial) ? node.userData.originalMaterial[0] : node.userData.originalMaterial;
      const color = source?.color?.clone?.() || new THREE.Color(0xf1f5dc);
      node.material = new THREE.MeshStandardMaterial({
        color: color.lerp(new THREE.Color(0xbff0cc), 0.16),
        roughness: 0.68,
        metalness: 0.02,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(0x10231d),
        emissiveIntensity: 0.05
      });
    }
  });
  refreshModeButtons();
}

function expandFlatBox(box, padding = 2.5) {
  return box.clone().expandByVector(new THREE.Vector3(padding, padding * 0.25, padding));
}

function computeCoreBox(box, root = activeModel) {
  if (!root) {
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    return new THREE.Box3().setFromCenterAndSize(center, new THREE.Vector3(Math.max(size.x * focusState.ratio, 18), Math.max(size.y * 1.2, 8), Math.max(size.z * focusState.ratio, 18)));
  }

  const modelSize = box.getSize(new THREE.Vector3());
  const candidates = [];
  root.updateMatrixWorld(true);
  root.traverse((node) => {
    if (!node.isMesh || !node.geometry) return;
    const meshBox = new THREE.Box3().setFromObject(node);
    if (meshBox.isEmpty()) return;
    const size = meshBox.getSize(new THREE.Vector3());
    const footprint = size.x * size.z;
    const isWholeTerrain = size.x > modelSize.x * 0.32 || size.z > modelSize.z * 0.32;
    const isTinyNoise = footprint < 0.01;
    if (!isWholeTerrain && !isTinyNoise) candidates.push(meshBox);
  });

  if (!candidates.length) {
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    return new THREE.Box3().setFromCenterAndSize(center, new THREE.Vector3(Math.max(size.x * focusState.ratio, 18), Math.max(size.y * 1.2, 8), Math.max(size.z * focusState.ratio, 18)));
  }

  const seed = candidates.reduce((best, current) => {
    const bestSize = best.getSize(new THREE.Vector3());
    const currentSize = current.getSize(new THREE.Vector3());
    return currentSize.x * currentSize.z > bestSize.x * bestSize.z ? current : best;
  }, candidates[0]);
  const seedCenter = seed.getCenter(new THREE.Vector3());
  const clusterRadius = Math.max(Math.min(modelSize.x, modelSize.z) * 0.16, 7);
  const cluster = new THREE.Box3().makeEmpty();

  candidates.forEach((candidate) => {
    const center = candidate.getCenter(new THREE.Vector3());
    const distance = Math.hypot(center.x - seedCenter.x, center.z - seedCenter.z);
    if (distance <= clusterRadius || seed.intersectsBox(expandFlatBox(candidate, 3))) cluster.union(candidate);
  });

  return expandFlatBox(cluster, Math.max(clusterRadius * 0.12, 1.4));
}

function updateFocusArea(root) {
  if (!modelBox) return;
  root.traverse((node) => {
    if (node.isMesh) node.visible = true;
  });
  coreBox = computeCoreBox(modelBox, root);
  activeSphere = (focusState.core ? coreBox : modelBox).getBoundingSphere(new THREE.Sphere());
}

function addVisibilityHelpers(root) {
  if (helperGroup) scene.remove(helperGroup);
  helperGroup = new THREE.Group();
  helperGroup.name = 'camp_visual_helpers';

  const box = getVisibleMeshBox(root);
  if (!box.isEmpty()) {
    const helper = new THREE.Box3Helper(box, 0x70e1b4);
    helper.material.transparent = true;
    helper.material.opacity = 0.35;
    helperGroup.add(helper);
  }

  scene.add(helperGroup);
}

function getVisibleMeshBox(root) {
  const box = new THREE.Box3().makeEmpty();
  root.updateMatrixWorld(true);
  root.traverse((node) => {
    if (!node.isMesh || !node.geometry || !node.visible) return;
    box.union(new THREE.Box3().setFromObject(node));
  });
  return box;
}

function centerAndFrame(root, view = 'overview') {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) throw new Error('模型为空，无法展示');

  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  if (maxSize > 0) {
    const scale = 80 / maxSize;
    root.scale.setScalar(scale);
    root.position.copy(center).multiplyScalar(-scale);
  }
  root.updateMatrixWorld(true);

  modelBox = new THREE.Box3().setFromObject(root).clone();
  updateFocusArea(root);

  floor.visible = true;
  floor.position.y = (modelBox || coreBox).min.y - 0.05;
  floor.scale.setScalar(Math.max(120, activeSphere.radius * 4) / 900);

  addVisibilityHelpers(root);
  frameView(view);
}

function frameView(view = 'overview') {
  if (!activeSphere) return;
  const radius = Math.max(activeSphere.radius, 1);
  const target = activeSphere.center;
  const distance = Math.max(radius * 2.15, 26);
  const positions = {
    overview: [distance * 0.78, distance * 0.72, distance * 0.92],
    bird: [distance * 0.34, distance * 1.18, distance * 0.48],
    front: [0, distance * 0.34, distance * 1.05],
    top: [0, distance * 1.65, distance * 0.001],
    low: [distance * 0.92, radius * 0.28, distance * 0.56],
    reset: [distance * 0.78, distance * 0.72, distance * 0.92]
  };
  const [x, y, z] = positions[view] || positions.overview;
  camera.position.set(target.x + x, target.y + y, target.z + z);
  camera.near = Math.max(radius / 1000, 0.05);
  camera.far = Math.max(radius * 28, 10000);
  camera.updateProjectionMatrix();
  controls.target.copy(target);
  controls.minDistance = radius * 0.12;
  controls.maxDistance = radius * 10;
  controls.update();
}

function countModel(root) {
  let meshes = 0;
  let triangles = 0;
  root.traverse((node) => {
    if (!node.isMesh || !node.geometry) return;
    meshes += 1;
    triangles += node.geometry.index ? node.geometry.index.count / 3 : node.geometry.attributes.position.count / 3;
  });
  return { meshes, triangles: Math.round(triangles) };
}

async function loadModel(kind = 'web') {
  const requestId = ++loadRequestId;
  const fallbackKind = kind === 'full' ? 'web' : 'lite';
  const file = modelFiles[kind] || modelFiles.web;
  activeKind = kind;
  clearError();
  showProgress();
  showMessage(`正在加载${file.label}（${file.size}）...`);

  try {
    await loadModelFile(kind, file, requestId);
  } catch (error) {
    if (requestId !== loadRequestId) return;
    if (kind !== 'lite' && modelFiles[fallbackKind]) {
      console.warn(`${file.label}加载失败，自动切换到${modelFiles[fallbackKind].label}`, error);
      showMessage(`${file.label}加载较慢或失败，正在自动切换到${modelFiles[fallbackKind].label}...`);
      try {
        await loadModel(fallbackKind);
        return;
      } catch (fallbackError) {
        showMessage(`备用模型加载失败：${fallbackError.message || fallbackError}`, true);
      }
    } else {
      showMessage(`模型加载失败：${error.message || error}. 请确认通过“启动网站.bat”打开，不要直接双击 HTML 文件。`, true);
    }
    showMessage('模型加载失败，请点击“极速轻量版”重试。');
  }
}

async function loadModelFile(kind, file, requestId) {
  if (window.location.protocol === 'file:') {
    throw new Error('当前是 file:// 打开，浏览器会拦截 3D 模型。请使用“启动网站.bat”或 http://127.0.0.1:8787/model-test.html');
  }

  const url = `${file.url}?v=${MODEL_BUILD}`;
  await checkModelAsset(url, file);

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(`${file.label}超过 25 秒仍未完成加载`));
    }, kind === 'full' ? 90000 : 25000);

    loader.load(
      url,
      (gltf) => {
        window.clearTimeout(timeout);
        if (requestId !== loadRequestId) {
          resolve(gltf);
          return;
        }
        if (activeModel) scene.remove(activeModel);
        activeModel = gltf.scene;
        activeKind = kind;
        beautifyModel(activeModel);
        scene.add(activeModel);
        centerAndFrame(activeModel);
        applyRenderMode(renderMode);
        const { meshes, triangles } = countModel(activeModel);
        stats.textContent = `${file.label} · ${meshes} 个网格 · 约 ${triangles.toLocaleString()} 个三角面 · 鼠标旋转/滚轮缩放/右键平移，WASD/QE 可微调视角`;
        hideProgress();
        refreshModeButtons();
        resolve(gltf);
      },
      (xhr) => {
        if (xhr.total) {
          showMessage(`${file.label}加载中 ${Math.round((xhr.loaded / xhr.total) * 100)}% · ${(xhr.loaded / 1024 / 1024).toFixed(1)}MB / ${(xhr.total / 1024 / 1024).toFixed(1)}MB`);
        } else {
          showMessage(`${file.label}加载中 ${(xhr.loaded / 1024 / 1024).toFixed(1)}MB`);
        }
      },
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

async function checkModelAsset(url, file) {
  const response = await fetch(url, { method: 'HEAD', cache: 'no-store' });
  if (!response.ok) throw new Error(`${file.label}文件访问失败：HTTP ${response.status}`);
  const bytes = Number(response.headers.get('content-length') || 0);
  if (bytes > 0) showMessage(`已找到${file.label} ${(bytes / 1024 / 1024).toFixed(1)}MB，开始解析...`);
}

function moveCameraByKeys() {
  if (!activeSphere || pressedKeys.size === 0) return;
  const speed = Math.max(activeSphere.radius * 0.016, 0.08);
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  right.crossVectors(forward, camera.up).normalize();

  const movement = new THREE.Vector3();
  if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) movement.add(forward);
  if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) movement.sub(forward);
  if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft')) movement.sub(right);
  if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) movement.add(right);
  if (pressedKeys.has('KeyQ')) movement.y -= 1;
  if (pressedKeys.has('KeyE')) movement.y += 1;
  if (movement.lengthSq() === 0) return;
  movement.normalize().multiplyScalar(speed);
  camera.position.add(movement);
  controls.target.add(movement);
}

function animate() {
  resize();
  moveCameraByKeys();
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function normalizeCameraKey(event) {
  const key = `${event.code || event.key || ''}`.toLowerCase();
  const map = {
    keyw: 'KeyW', w: 'KeyW', arrowup: 'ArrowUp',
    keys: 'KeyS', s: 'KeyS', arrowdown: 'ArrowDown',
    keya: 'KeyA', a: 'KeyA', arrowleft: 'ArrowLeft',
    keyd: 'KeyD', d: 'KeyD', arrowright: 'ArrowRight',
    keyq: 'KeyQ', q: 'KeyQ', keye: 'KeyE', e: 'KeyE'
  };
  return map[key] || event.code;
}

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    controls.autoRotate = false;
    frameView(button.dataset.view);
  });
});

document.querySelectorAll('[data-load]').forEach((button) => {
  button.addEventListener('click', () => loadModel(button.dataset.load));
});

document.querySelectorAll('[data-render]').forEach((button) => {
  button.addEventListener('click', () => applyRenderMode(button.dataset.render));
});

document.querySelectorAll('[data-crop]').forEach((button) => {
  button.addEventListener('click', () => {
    focusState.core = button.dataset.crop === 'core';
    if (activeModel) {
      updateFocusArea(activeModel);
      addVisibilityHelpers(activeModel);
      frameView('overview');
    }
    refreshModeButtons();
  });
});

canvas.addEventListener('click', () => canvas.focus());
window.addEventListener('keydown', (event) => {
  const code = normalizeCameraKey(event);
  const movementCodes = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (!movementCodes.includes(code)) return;
  pressedKeys.add(code);
  controls.autoRotate = false;
  event.preventDefault();
  event.stopPropagation();
}, { capture: true });

window.addEventListener('keyup', (event) => {
  pressedKeys.delete(normalizeCameraKey(event));
}, { capture: true });
window.addEventListener('blur', () => pressedKeys.clear());

refreshModeButtons();
window.__camp3d = {
  camera,
  controls,
  get coreBox() { return coreBox; },
  get modelBox() { return modelBox; },
  get activeSphere() { return activeSphere; },
  countVisibleMeshes() {
    let total = 0;
    let visible = 0;
    activeModel?.traverse((node) => {
      if (node.isMesh) {
        total += 1;
        if (node.visible) visible += 1;
      }
    });
    return { total, visible };
  },
  getBounds() {
    const coreSize = coreBox?.getSize(new THREE.Vector3()).toArray() || null;
    const coreCenter = coreBox?.getCenter(new THREE.Vector3()).toArray() || null;
    const modelSize = modelBox?.getSize(new THREE.Vector3()).toArray() || null;
    return { coreSize, coreCenter, modelSize };
  },
  frameView
};

loadModel('web');
animate();


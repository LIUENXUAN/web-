(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('is-booting');
  const rotations = [-4, 2, -1, 5, -3, 1];

  function makeLoader() {
    if (reduce) return null;
    const loader = document.createElement('div');
    loader.className = 'campos-loader';
    loader.innerHTML = '<div class="camp-loader-map" aria-hidden="true"><svg viewBox="0 0 900 520"><path class="camp-loader-terrain t1" d="M-20 360 C120 280 205 380 330 310 C470 230 570 280 700 198 C790 145 850 168 930 112 L930 560 L-20 560Z"/><path class="camp-loader-terrain t2" d="M-20 420 C130 350 245 455 390 368 C525 288 650 365 770 282 C840 234 885 248 930 214 L930 560 L-20 560Z"/><path class="camp-loader-route" d="M105 300 C210 238 298 306 405 248 C530 180 618 225 735 160"/><g class="camp-loader-nodes"><circle cx="192" cy="263" r="9"/><circle cx="406" cy="248" r="9"/><circle cx="612" cy="220" r="9"/><circle cx="735" cy="160" r="9"/></g></svg></div><div class="campos-loader__stack"><div class="campos-loader__code"><span>\u8425\u5730\u6570\u5b57\u5b6a\u751f\u7cfb\u7edf</span><span>\u6b63\u5728\u751f\u6210\u8fd0\u8425\u5730\u5f62</span></div><h1 class="campos-loader__title">\u6797\u95f4\u5f8b\u52a8</h1><p class="campos-loader__sub">Digital camp operating system</p><div class="campos-loader__bar"><i></i></div></div><div class="campos-loader__tiles"></div>';
    const tiles = loader.querySelector('.campos-loader__tiles');
    for (let i = 0; i < 12; i += 1) {
      const tile = document.createElement('span');
      tile.style.setProperty('--i', i);
      tile.style.setProperty('--r', rotations[i % rotations.length] + 'deg');
      tiles.appendChild(tile);
    }
    document.body.prepend(loader);
    return loader;
  }

  function addWipe() {
    if (reduce) return null;
    const wipe = document.createElement('div');
    wipe.className = 'campos-page-wipe';
    for (let i = 0; i < 6; i += 1) {
      const panel = document.createElement('span');
      panel.style.setProperty('--i', i);
      wipe.appendChild(panel);
    }
    document.body.appendChild(wipe);
    return wipe;
  }

  function splitText(target) {
    if (!target || target.dataset.camposSplit === 'done') return;
    const text = target.textContent.trim();
    if (!text || text.length > 90) return;
    target.dataset.camposSplit = 'done';
    target.setAttribute('aria-label', text);
    target.textContent = '';
    Array.from(text).forEach((letter, index) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.style.setProperty('--char-index', index);
      span.textContent = letter === ' ' ? '\u00A0' : letter;
      target.appendChild(span);
    });
  }

  function prepareMotion(rootNode = document) {
    rootNode.querySelectorAll('.campos-loader__title').forEach(splitText);
    const selector = '.hero > div, .dashboard-card, .section, .card, .value-card, .panel, .form, .download-card, .feature-card, .stats article, .timeline article, .login-card, .row, .metric, .ops-item, .three-viewer-shell';
    rootNode.querySelectorAll(selector).forEach((element, index) => {
      if (element.classList.contains('campos-reveal')) return;
      element.classList.add('campos-reveal');
      element.style.transitionDelay = Math.min(index % 7, 6) * 45 + 'ms';
      const modes = ['clip', 'left', 'right', 'slam', 'leaf', 'water'];
      element.dataset.motion = modes[index % modes.length];
    });
    rootNode.querySelectorAll('a, button').forEach(el => el.classList.add('campos-magnetic'));
    rootNode.querySelectorAll('.card,.value-card,.download-card,.dashboard-card,.panel,.metric').forEach(el => el.classList.add('campos-tilt'));
  }

  function observeReveals() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -9% 0px' });
    document.querySelectorAll('.campos-reveal, [data-campos-split]').forEach(el => observer.observe(el));
    return observer;
  }

  function addProgress() {
    const progress = document.createElement('div');
    progress.className = 'campos-progress';
    progress.innerHTML = '<i></i>';
    document.body.appendChild(progress);
    const bar = progress.querySelector('i');
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      bar.style.transform = 'scaleX(' + Math.min(scrollY / max, 1) + ')';
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  function addCursor() {
    if (reduce || matchMedia('(pointer: coarse)').matches) return;
    const cursor = document.createElement('div');
    cursor.className = 'campos-kinetic';
    document.body.appendChild(cursor);
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
    addEventListener('pointermove', event => { tx = event.clientX; ty = event.clientY; cursor.style.opacity = '1'; }, { passive: true });
    document.addEventListener('pointerover', event => { if (event.target.closest('a,button,.campos-tilt')) cursor.classList.add('is-hot'); });
    document.addEventListener('pointerout', event => { if (event.target.closest('a,button,.campos-tilt')) cursor.classList.remove('is-hot'); });
    const loop = () => { x += (tx - x) * .18; y += (ty - y) * .18; cursor.style.transform = 'translate(' + (x - 9) + 'px,' + (y - 9) + 'px) rotate(45deg)'; requestAnimationFrame(loop); };
    loop();
  }

  function bindMagnetic() {
    if (reduce || matchMedia('(pointer: coarse)').matches) return;
    document.addEventListener('pointermove', event => {
      const target = event.target.closest('.campos-magnetic');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      target.style.transform = 'translate(' + (dx * .12) + 'px,' + (dy * .16) + 'px)';
    }, { passive: true });
    document.addEventListener('pointerout', event => {
      const target = event.target.closest('.campos-magnetic');
      if (target) target.style.transform = '';
    });
  }

  function bindTilt() {
    if (reduce || matchMedia('(pointer: coarse)').matches) return;
    document.addEventListener('pointermove', event => {
      const card = event.target.closest('.campos-tilt');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - .5;
      const py = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = 'perspective(900px) rotateX(' + (py * -4) + 'deg) rotateY(' + (px * 5) + 'deg) translateY(-3px)';
    }, { passive: true });
    document.addEventListener('pointerout', event => {
      const card = event.target.closest('.campos-tilt');
      if (card) card.style.transform = '';
    });
  }

  function addOrbit() {
    const hero = document.querySelector('.hero, main, body');
    if (hero && !document.querySelector('.campos-orbit')) {
      const orbit = document.createElement('div');
      orbit.className = 'campos-orbit';
      hero.appendChild(orbit);
    }
  }

  function animateLinks(wipe) {
    if (!wipe) return;
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || link.target || link.hasAttribute('download')) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      event.preventDefault();
      wipe.classList.remove('is-active');
      void wipe.offsetWidth;
      wipe.classList.add('is-active');
      setTimeout(() => { location.href = link.href; }, 360);
    });
  }



  function addForestMotion() {
    let lastRipple = 0;
    document.addEventListener('pointerdown', event => {
      if (Date.now() - lastRipple < 180) return;
      lastRipple = Date.now();
      const ripple = document.createElement('span');
      ripple.className = 'forest-ripple';
      ripple.style.left = event.clientX + 'px';
      ripple.style.top = event.clientY + 'px';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1300);
    });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setInterval(() => {
        if (document.hidden || Math.random() > .72) return;
        const leaf = document.createElement('span');
        leaf.className = 'forest-leaf';
        leaf.style.setProperty('--x', Math.round(Math.random() * innerWidth) + 'px');
        leaf.style.setProperty('--drift', Math.round((Math.random() - .5) * 220) + 'px');
        leaf.style.left = '0';
        leaf.style.top = '0';
        document.body.appendChild(leaf);
        setTimeout(() => leaf.remove(), 6200);
      }, 1300);
    }
    document.querySelectorAll('video').forEach(video => {
      video.addEventListener('play', () => { video.classList.add('is-playing'); video.closest('.video-shell')?.classList.add('is-cinematic'); });
      video.addEventListener('pause', () => video.closest('.video-shell')?.classList.remove('is-cinematic'));
      video.addEventListener('ended', () => video.closest('.video-shell')?.classList.remove('is-cinematic'));
    });
    document.querySelectorAll('[data-video-play]').forEach(button => {
      button.addEventListener('click', () => {
        const video = document.querySelector('.tour-video, video');
        if (!video) return;
        video.scrollIntoView({ behavior: 'smooth', block: 'center' });
        video.play().catch(() => { video.controls = true; });
      });
    });
    const parallaxItems = document.querySelectorAll('.panel-image,.video-shell,.three-viewer-shell,.hero-card');
    const update = () => {
      parallaxItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - innerHeight / 2) / innerHeight;
        item.style.setProperty('--forest-parallax', offset.toFixed(3));
        if (!item.matches(':hover')) item.style.transform = 'translateY(' + (offset * -18 * (index % 2 ? .65 : 1)) + 'px) rotate(' + (offset * (index % 2 ? -1 : 1)) + 'deg)';
      });
    };
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }



  function hardenDynamicVisibility() {
    const markReady = () => {
      if (location.pathname.includes('/admin/')) document.documentElement.classList.add('admin-ready');
      if (location.pathname.includes('/app/')) document.documentElement.classList.add('app-ready');
      document.querySelectorAll('#workspace .campos-reveal, main .metric, main .card, main .value-card, main .ops-item, .table .row').forEach((element, index) => {
        if (!element.classList.contains('campos-reveal')) element.classList.add('campos-reveal');
        window.setTimeout(() => element.classList.add('is-in'), Math.min(index, 18) * 24);
      });
    };
    markReady();
    window.setTimeout(markReady, 500);
    window.setTimeout(markReady, 1400);
    window.setTimeout(markReady, 2600);
  }

  function boot() {
    const loader = makeLoader();
    const wipe = addWipe();
    prepareMotion();
    const revealObserver = observeReveals();
    addProgress();
    addCursor();
    bindMagnetic();
    bindTilt();
    addOrbit();
    // forest motion disabled in final black clarity mode
    animateLinks(wipe);
    hardenDynamicVisibility();

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (!(node instanceof Element)) return;
          prepareMotion(node);
          node.querySelectorAll && node.querySelectorAll('.campos-reveal, [data-campos-split]').forEach(el => { revealObserver.observe(el); setTimeout(() => el.classList.add('is-in'), 80); });
          if (node.matches && node.matches('.campos-reveal, [data-campos-split]')) { revealObserver.observe(node); setTimeout(() => node.classList.add('is-in'), 80); }
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      root.classList.remove('is-booting');
      root.classList.add('is-ready');
      document.querySelectorAll('[data-campos-split]').forEach(el => el.classList.add('is-in'));
      document.querySelectorAll('.hero .campos-reveal, .login-card.campos-reveal, .panel.campos-reveal').forEach(el => el.classList.add('is-in'));
      if (loader) {
        loader.classList.add('is-exiting');
        setTimeout(() => loader.remove(), 850);
      }
    }, reduce ? 0 : 1550);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();



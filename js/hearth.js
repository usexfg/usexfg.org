(function () {
  const canvas = document.querySelector('.hearth-canvas');
  if (!canvas) return;

  const host = canvas.parentElement;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMBER = [232, 98, 44];
  const DEEP_EMBER = [140, 59, 20];
  const CHAMPAGNE = [197, 160, 89];

  let w = 0;
  let h = 0;
  let dpr = 1;
  let motes = [];
  let raf = 0;
  let running = false;
  let t0 = performance.now();

  function rgba(c, a) {
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }

  function reset(spread) {
    return {
      x: Math.random() * w,
      y: spread ? Math.random() * h : h + 8,
      r: 0.6 + Math.random() * 1.7,
      vy: 5 + Math.random() * 16,
      drift: (Math.random() - 0.5) * 7,
      life: 0,
      span: 2.6 + Math.random() * 3.4,
      warm: Math.random() < 0.62
    };
  }

  function seed() {
    const count = Math.max(18, Math.min(38, Math.round((w * h) / 26000)));
    motes = [];
    for (let i = 0; i < count; i++) {
      const m = reset(true);
      if (reduceMotion) m.life = 0.2 + Math.random() * 0.6;
      motes.push(m);
    }
  }

  function resize() {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width;
    h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reduceMotion) draw(0);
  }

  function drawPlanks(t) {
    const rows = 7;
    const breathe = 1 + Math.sin(t / 2600) * 0.012;
    ctx.save();
    ctx.translate(w / 2, h);
    ctx.scale(breathe, 1);
    ctx.translate(-w / 2, -h);
    for (let i = 1; i <= rows; i++) {
      const z = i / rows;
      const y = h - h * 0.06 - h * 0.62 * Math.pow(z, 1.7);
      const alpha = 0.055 * (1 - z * 0.72);
      ctx.strokeStyle = rgba(CHAMPAGNE, alpha);
      ctx.lineWidth = Math.max(0.6, 1.15 * (1 - z * 0.55));
      ctx.beginPath();
      ctx.moveTo(-4, y);
      for (let x = 0; x <= w + 8; x += 18) {
        ctx.lineTo(x, y + Math.sin((x + t / 34) / 46) * (0.9 + z * 0.6));
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGlow(t) {
    const pulse = 0.5 + 0.5 * Math.sin(t / 1900);
    const cx = w * 0.5;
    const cy = h * 1.02;
    const r = Math.max(w, h) * (0.78 + pulse * 0.05);

    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, rgba(EMBER, 0.3 + pulse * 0.07));
    g.addColorStop(0.34, rgba(EMBER, 0.12 + pulse * 0.04));
    g.addColorStop(0.68, rgba(DEEP_EMBER, 0.05));
    g.addColorStop(1, rgba(DEEP_EMBER, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.42);
    g.addColorStop(0, rgba(CHAMPAGNE, 0.09 + pulse * 0.03));
    g.addColorStop(1, rgba(CHAMPAGNE, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawMotes(dt, t) {
    for (let i = 0; i < motes.length; i++) {
      const m = motes[i];
      m.life += dt / m.span;
      if (m.life >= 1) {
        motes[i] = reset(false);
        continue;
      }
      const p = m.life;
      m.y -= m.vy * dt;
      m.x += m.drift * dt;

      const fade = Math.sin(p * Math.PI);
      const flick = 0.72 + 0.28 * Math.sin(t / 90 + i * 1.7);
      const col = m.warm ? EMBER : CHAMPAGNE;
      const alpha = fade * flick * (p < 0.12 ? p / 0.12 : 1) * 0.62;
      const size = m.r * (1 - p * 0.45);

      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, size * 4.2);
      g.addColorStop(0, rgba(col, alpha));
      g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(m.x, m.y, size * 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rgba(col, Math.min(1, alpha * 1.5));
      ctx.beginPath();
      ctx.arc(m.x, m.y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    drawGlow(t);
    drawPlanks(t);
    drawMotes(0, t);
  }

  function frame(now) {
    const dt = Math.min(48, now - t0) / 1000;
    t0 = now;
    ctx.clearRect(0, 0, w, h);
    drawGlow(now);
    drawPlanks(now);
    drawMotes(dt, now);
    raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    t0 = performance.now();
    raf = window.requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) window.cancelAnimationFrame(raf);
    raf = 0;
  }

  resize();

  if (typeof window.ResizeObserver === 'function') {
    new window.ResizeObserver(resize).observe(host);
  } else {
    window.addEventListener('resize', resize);
  }

  if (typeof window.IntersectionObserver === 'function') {
    new window.IntersectionObserver(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) start();
        else stop();
      }
    }, { threshold: 0.01 }).observe(host);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else start();
  });
})();
document.addEventListener("DOMContentLoaded", () => {
  const galaxy = document.getElementById("xfg-galaxy");
  if (!galaxy) return;

  const coins = [
    { id: "btc", name: "Bitcoin" },
    { id: "eth", name: "Ethereum" },
    { id: "sol", name: "Solana" },
    { id: "bnb", name: "BNB Chain" },
    { id: "monero", name: "Monero" },
    { id: "doge", name: "Dogecoin" },
    { id: "avax", name: "Avalanche" },
    { id: "bch", name: "Bitcoin Cash" },
    { id: "matic", name: "Polygon" },
    { id: "ltc", name: "Litecoin" },
    { id: "dash", name: "Dash" },
    { id: "zec", name: "Zcash" },
    { id: "arb", name: "Arbitrum" },
    { id: "base", name: "Base" },
    { id: "cro", name: "Cronos" },
    { id: "kmd", name: "Komodo" },
    { id: "dcr", name: "Decred" },
    { id: "gleec", name: "Gleec" },
    { id: "robinhood", name: "Robinhood" },
    { id: "bob", name: "BOB" },
    { id: "unichain", name: "Unichain" },
    { id: "plasma", name: "Plasma" },
    { id: "pls", name: "PulseChain" },
    { id: "monad", name: "Monad" },
    { id: "linea", name: "Linea" },
    { id: "zksync", name: "ZKsync" },
    { id: "hyperevm", name: "HyperEVM" },
    { id: "ink", name: "Ink" },
    { id: "rootstock", name: "Rootstock" },
    { id: "gnosis", name: "Gnosis" },
    { id: "flare", name: "Flare" },
    { id: "kaia", name: "Kaia" },
    { id: "scroll", name: "Scroll" },
    { id: "abstract", name: "Abstract" },
    { id: "plume", name: "Plume" },
    { id: "soneium", name: "Soneium" },
    { id: "doma", name: "Doma" },
    { id: "beam", name: "Beam" },
    { id: "moonriver", name: "Moonriver" },
    { id: "peaq", name: "peaq" },
    { id: "sei", name: "Sei" },
    { id: "ton", name: "TON" }
  ];

  const ringsConfig = [
    { radius: 20, count: 6, dur: 45, dir: 1 },
    { radius: 32, count: 10, dur: 70, dir: -1 },
    { radius: 44, count: 12, dur: 100, dir: 1 },
    { radius: 56, count: 14, dur: 140, dir: -1 }
  ];

  let coinIdx = 0;

  ringsConfig.forEach((ring) => {
    const ringEl = document.createElement("div");
    ringEl.className = "orbit-ring";
    ringEl.style.width = `${ring.radius * 2}%`;
    ringEl.style.height = `${ring.radius * 2}%`;
    ringEl.style.animationDuration = `${ring.dur}s`;
    ringEl.style.animationDirection = ring.dir === 1 ? 'normal' : 'reverse';

    for (let i = 0; i < ring.count; i++) {
      if (coinIdx >= coins.length) break;
      const coin = coins[coinIdx++];

      const angle = (i / ring.count) * 360;

      const placement = document.createElement("div");
      placement.className = "orbit-node-placement";
      placement.style.transform = `rotate(${angle}deg)`;

      const offset = document.createElement("div");
      offset.className = "orbit-node-offset";

      const counterSpin = document.createElement("div");
      counterSpin.className = "orbit-node-counter-spin";
      counterSpin.style.animationDuration = `${ring.dur}s`;
      counterSpin.style.animationDirection = ring.dir === 1 ? 'reverse' : 'normal';

      const upright = document.createElement("div");
      upright.className = "orbit-node-upright";
      upright.style.transform = `rotate(-${angle}deg)`;

      const hitTarget = document.createElement("div");
      hitTarget.className = "orbit-node-hit";

      const mono = document.createElement("img");
      mono.className = "coin-mono";
      mono.src = `coins/mono/${coin.id}.png?v=3`;
      mono.alt = coin.name;
      mono.draggable = false;

      const color = document.createElement("img");
      color.className = "coin-color";
      color.src = `coins/${coin.id}.png?v=4`;
      color.alt = "";
      color.setAttribute("aria-hidden", "true");
      color.draggable = false;

      const tooltip = document.createElement("div");
      tooltip.className = "orbit-tooltip";
      tooltip.innerText = coin.name;

      mono.onerror = () => {
        if (mono.dataset.fallback) {
          placement.remove();
          return;
        }
        mono.dataset.fallback = "1";
        mono.src = `coins/${coin.id}.png?v=4`;
      };
      color.onerror = () => color.remove();

      hitTarget.appendChild(mono);
      hitTarget.appendChild(color);
      hitTarget.appendChild(tooltip);

      upright.appendChild(hitTarget);
      counterSpin.appendChild(upright);
      offset.appendChild(counterSpin);
      placement.appendChild(offset);
      ringEl.appendChild(placement);
    }

    galaxy.appendChild(ringEl);
  });

  initCoreDust();

  function initCoreDust() {
    const core = galaxy.querySelector(".xfg-galaxy-core");
    if (!core) return;
    const base = core.querySelector(".core-base");
    const flame = core.querySelector(".core-flame");
    if (!base || !flame) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const canvas = document.createElement("canvas");
    canvas.className = "core-dust";
    canvas.setAttribute("aria-hidden", "true");
    core.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let run = 0;
    let hovering = false;

    const ease = (t) => t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function sizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const s = core.clientWidth || 116;
      canvas.width = Math.round(s * dpr);
      canvas.height = Math.round(s * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return s;
    }

    function sample(img, scale, offsetY, s, dpr) {
      const off = document.createElement("canvas");
      off.width = Math.round(s * dpr);
      off.height = Math.round(s * dpr);
      const octx = off.getContext("2d");
      if (!octx) return [];
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dw = s * scale;
      const dh = s * scale;
      octx.drawImage(img, (s - dw) / 2, (s - dh) / 2 + offsetY, dw, dh);

      const data = octx.getImageData(0, 0, off.width, off.height).data;
      const points = [];
      const step = Math.max(2, Math.round(2 * dpr));
      const cx = s / 2;
      const cy = s / 2;

      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          const i = (y * off.width + x) * 4;
          if (data[i + 3] < 70) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b) / 255;
          const min = Math.min(r, g, b) / 255;
          const sat = max ? (max - min) / max : 0;
          if (max < 0.22 || sat < 0.12) continue;
          const px = x / dpr;
          const py = y / dpr;
          const dx = px - cx;
          const dy = py - cy;
          const radius = Math.hypot(dx, dy);
          if (radius < 1.5) continue;
          points.push({
            x: px,
            y: py,
            r: radius,
            a: Math.atan2(dy, dx),
            cr: r,
            cg: g,
            cb: b
          });
        }
      }
      return points;
    }

    function resample(points, count) {
      if (!points.length) return [];
      if (points.length === count) return points.slice();
      if (points.length > count) {
        const out = [];
        const stride = points.length / count;
        for (let i = 0; i < count; i++) {
          out.push(points[Math.floor(i * stride)]);
        }
        return out;
      }
      const out = points.slice();
      while (out.length < count) {
        out.push(points[Math.floor(Math.random() * points.length)]);
      }
      return out;
    }

    function dust(outImg, outScale, outOffset, inImg, inScale, inOffset) {
      if (!outImg || !outImg.complete || !outImg.naturalWidth) return;
      if (!inImg || !inImg.complete || !inImg.naturalWidth) return;

      const s = sizeCanvas();
      const dpr = canvas.width / s;
      const source = sample(outImg, outScale, outOffset, s, dpr);
      const target = sample(inImg, inScale, inOffset, s, dpr);
      if (!source.length || !target.length) return;

      const count = Math.min(1400, Math.max(1000, source.length, target.length));
      const src = resample(source, count);
      const tgt = resample(target, count);
      const cx = s / 2;
      const cy = s / 2;

      // Shuffle the sources so the nearest-target pass stays balanced.
      for (let i = src.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [src[i], src[j]] = [src[j], src[i]];
      }

      const used = new Uint8Array(tgt.length);
      const particles = [];

      for (const p of src) {
        let best = -1;
        let bestDist = Infinity;
        for (let i = 0; i < tgt.length; i++) {
          if (used[i]) continue;
          const q = tgt[i];
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const d = dx * dx + dy * dy;
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
        if (best < 0) break;
        used[best] = 1;
        const q = tgt[best];
        const tx = q.x + (Math.random() - 0.5) * 0.8;
        const ty = q.y + (Math.random() - 0.5) * 0.8;
        const tr = Math.hypot(tx - cx, ty - cy);
        const ta = Math.atan2(ty - cy, tx - cx);
        const da = ((ta - p.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        particles.push({
          r0: p.r,
          a0: p.a,
          r1: tr,
          a1: p.a + da,
          cr0: p.cr,
          cg0: p.cg,
          cb0: p.cb,
          cr1: q.cr,
          cg1: q.cg,
          cb1: q.cb,
          size: 0.45 + Math.random() * 0.85,
          spin: Math.PI * 2,
          bulge: 1 + Math.random() * 3,
          delay: Math.random() * 0.14,
          drift: (Math.random() - 0.5) * 5
        });
      }

      if (!particles.length) return;

      const myRun = ++run;
      const duration = 1450;
      const start = performance.now();
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, s, s);

      function frame(now) {
        if (myRun !== run) return;
        const t = Math.min(1, (now - start) / duration);
        ctx.clearRect(0, 0, s, s);
        for (const p of particles) {
          const local = Math.max(0, Math.min(1, (t - p.delay) / (1 - p.delay)));
          if (local <= 0) continue;
          const spinT = Math.min(1, local / 0.68);
          const spinE = ease(spinT);
          const drainT = Math.max(0, Math.min(1, (spinE - 0.5) / 0.5));
          const drainE = drainT * drainT * (3 - 2 * drainT);
          const morphT = Math.max(0, Math.min(1, (local - 0.6) / 0.4));
          const morphE = ease(morphT);
          const arc = Math.sin(Math.PI * morphE);
          const angle = p.a0 + p.spin * spinE + (p.a1 - p.a0) * morphE;
          const rSpin = p.r0 * (1 - 0.7 * drainE);
          const radius = rSpin + (p.r1 - rSpin) * morphE + p.bulge * arc;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius + p.drift * arc;
          const fade = local < 0.9 ? 1 : (1 - local) / 0.1;
          const drainFade = 1 - 0.18 * drainE * (1 - morphE);
          const r = Math.round(p.cr0 + (p.cr1 - p.cr0) * morphE);
          const g = Math.round(p.cg0 + (p.cg1 - p.cg0) * morphE);
          const b = Math.round(p.cb0 + (p.cb1 - p.cb0) * morphE);
          ctx.globalAlpha = Math.max(0, fade) * 0.92 * drainFade;
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.arc(x, y, p.size * (1 - 0.15 * drainE * (1 - morphE)), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        if (t < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          ctx.clearRect(0, 0, s, s);
          raf = 0;
        }
      }
      raf = requestAnimationFrame(frame);
    }

    core.addEventListener("pointerenter", () => {
      if (hovering) return;
      hovering = true;
      const h = core.clientHeight;
      dust(base, 0.79, h * 0.01, flame, 0.85, h * -0.03);
    });
    core.addEventListener("pointerleave", () => {
      if (!hovering) return;
      hovering = false;
      const h = core.clientHeight;
      dust(flame, 0.85, h * -0.03, base, 0.79, h * 0.01);
    });
  }
});

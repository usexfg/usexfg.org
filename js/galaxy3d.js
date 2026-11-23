/* Private Exchange — deep-space floor.
   Three.js r128. WebGL failure leaves the 2D orbits in place. */
(function () {
  'use strict';

  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var orbitUi = null;
  var orbitFloater = null;
  var orbitOverlay = null;
  var selected = { node: null };
  var planets = [];
  var gliding = false;
  var activeAutoFly = false;
  var hover = { node: null, cameraPoint: new THREE.Vector2(), lastX: 0, lastY: 0 };
  var camera = null;
  var scene = null;

  var HOLD_MS = 780;
  var RETRACT_S = 2.65;
  var RETURN_S = 2.15;
  var COINS = [
    { id: 'btc', name: 'Bitcoin' },
    { id: 'eth', name: 'Ethereum' },
    { id: 'sol', name: 'Solana' },
    { id: 'bnb', name: 'BNB Chain' },
    { id: 'monero', name: 'Monero' },
    { id: 'doge', name: 'Dogecoin' },
    { id: 'avax', name: 'Avalanche' },
    { id: 'bch', name: 'Bitcoin Cash' },
    { id: 'matic', name: 'Polygon' },
    { id: 'ltc', name: 'Litecoin' },
    { id: 'dash', name: 'Dash' },
    { id: 'zec', name: 'Zcash' },
    { id: 'arb', name: 'Arbitrum' },
    { id: 'base', name: 'Base' },
    { id: 'cro', name: 'Cronos' },
    { id: 'kmd', name: 'Komodo' },
    { id: 'dcr', name: 'Decred' },
    { id: 'gleec', name: 'Gleec' },
    { id: 'robinhood', name: 'Robinhood' },
    { id: 'bob', name: 'BOB' },
    { id: 'unichain', name: 'Unichain' },
    { id: 'plasma', name: 'Plasma' },
    { id: 'pls', name: 'PulseChain' },
    { id: 'monad', name: 'Monad' },
    { id: 'linea', name: 'Linea' },
    { id: 'zksync', name: 'ZKsync' },
    { id: 'hyperevm', name: 'HyperEVM' },
    { id: 'ink', name: 'Ink' },
    { id: 'rootstock', name: 'Rootstock' },
    { id: 'gnosis', name: 'Gnosis' },
    { id: 'flare', name: 'Flare' },
    { id: 'kaia', name: 'Kaia' },
    { id: 'scroll', name: 'Scroll' },
    { id: 'abstract', name: 'Abstract' },
    { id: 'plume', name: 'Plume' },
    { id: 'soneium', name: 'Soneium' },
    { id: 'doma', name: 'Doma' },
    { id: 'beam', name: 'Beam' },
    { id: 'moonriver', name: 'Moonriver' },
    { id: 'peaq', name: 'peaq' },
    { id: 'sei', name: 'Sei' },
    { id: 'ton', name: 'TON' }
  ];

  var CAPITAL = { btc: 1.42, eth: 1.26, sol: 1.16, bnb: 1.08, monero: 1.1 };
  var SHELLS = [
    { radius: 16.5, count: 6, speed: 0.105, incline: 0.22, tilt: 0.12 },
    { radius: 27, count: 10, speed: -0.068, incline: -0.46, tilt: 0.62 },
    { radius: 39, count: 12, speed: 0.044, incline: 0.58, tilt: -0.28 },
    { radius: 52, count: 14, speed: -0.028, incline: -0.2, tilt: 0.9 }
  ];

  function mount() {
    if (typeof THREE === 'undefined') return false;
    var galaxy = document.getElementById('xfg-galaxy');
    if (!galaxy || galaxy.dataset.galaxyReady) return false;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, 1, 0.08, 640);

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mobile = coarse || window.matchMedia('(max-width: 860px)').matches;
    var dprCap = mobile ? 1.5 : 2;

    var canvas = document.createElement('canvas');
    canvas.className = 'xfg-galaxy-canvas';
    canvas.setAttribute('role', 'application');
    canvas.setAttribute('aria-label', 'Private exchange galaxy. Hold to enter. Drag to look, and fly. Escape withdraws.');
    canvas.tabIndex = 0;

    var glAttrs = {
      alpha: false,
      antialias: !mobile,
      depth: true,
      stencil: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    };
    var gl = canvas.getContext('webgl', glAttrs) || canvas.getContext('experimental-webgl', glAttrs);
    if (!gl) return false;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, context: gl, antialias: !mobile });
    } catch (err) {
      return false;
    }
    renderer.setClearColor(0x070605, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));

    camera.position.set(0.4, 8.2, 88);
    camera.lookAt(0, 0, 0);

    var Y = new THREE.Vector3(0, 1, 0);
    var forward = new THREE.Vector3();
    var right = new THREE.Vector3();
    var wish = new THREE.Vector3();
    var world = new THREE.Vector3();
    var local = new THREE.Vector3();
    var center = new THREE.Vector3();
    var lookFrom = new THREE.Vector3(0, 0, 0);
    var lookTo = new THREE.Vector3(0, 12, 0);
    var lookNow = new THREE.Vector3();
    var camFrom = new THREE.Vector3();
    var camTo = new THREE.Vector3(1.4, 70, 48);
    var dwellPos = new THREE.Vector3();
    var dwellLook = new THREE.Vector3(0, 0.4, 0);
    var introFrom = new THREE.Vector3(0.4, 8.2, 88);
    var introLook = new THREE.Vector3(0, 0.2, 0);
    var introEnd = new THREE.Vector3();
    var flyVel = new THREE.Vector3();
    var dummy = new THREE.Object3D();
    var flightQuat = new THREE.Quaternion();
    var yawQ = new THREE.Quaternion();
    var pitchQ = new THREE.Quaternion();
    var localX = new THREE.Vector3();

    var key = new THREE.DirectionalLight(0xfff1d2, 1.25);
    key.position.set(16, 22, 12);
    scene.add(key);
    scene.add(new THREE.AmbientLight(0x1c2430, 0.55));
    var rim = new THREE.DirectionalLight(0x5a7a9c, 0.55);
    rim.position.set(-22, 4, -16);
    scene.add(rim);
    var coreLight = new THREE.PointLight(0xe8622c, 1.6, 36, 2);
    scene.add(coreLight);

    buildStars(scene, mobile);
    buildNebula(scene);

    var system = new THREE.Group();
    scene.add(system);
    var ship = buildShip(system, renderer, mobile);
    ship.dataCoin = 'xfg';
    ship.dataName = 'Fuego Reserve';
    ship.dataSize = 5.2;
    coreLight.position.set(0, 0, 0);
    ship.add(coreLight);

    var coinIndex = 0;
    SHELLS.forEach(function (shell) {
      var group = new THREE.Group();
      group.rotation.x = shell.incline;
      group.rotation.z = shell.tilt;
      system.add(group);
      group.add(orbitRing(shell.radius));
      for (var i = 0; i < shell.count && coinIndex < COINS.length; i++) {
        var coin = COINS[coinIndex++];
        var node = new THREE.Group();
        var size = CAPITAL[coin.id] || (0.74 + (coinIndex % 5) * 0.055);
        var body = planetBody(size, mobile);
        node.add(body.mesh);
        node.add(body.atmos);
        node.dataCoin = coin.id;
        node.dataName = coin.name;
        node.dataSize = size;
        group.add(node);
        node.position.set(Math.cos((i / shell.count) * Math.PI * 2) * shell.radius, 0, Math.sin((i / shell.count) * Math.PI * 2) * shell.radius);
        planets.push({
          id: coin.id,
          name: coin.name,
          node: node,
          mesh: body.mesh,
          atmos: body.atmos,
          mat: body.mat,
          atmosMat: body.atmosMat,
          orbit: shell.radius,
          speed: shell.speed,
          angle0: (i / shell.count) * Math.PI * 2 + shell.tilt,
          group: group,
          size: size
        });
        loadBrand(coin.id, body, renderer);
      }
    });

    var tetherMat = new THREE.MeshBasicMaterial({
      color: 0xc5a059,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    var tetherGeo = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true);
    var tethers = new THREE.InstancedMesh(tetherGeo, tetherMat, planets.length);
    tethers.frustumCulled = false;
    system.add(tethers);

    var hud = buildHud(galaxy, coarse);
    galaxy.appendChild(canvas);
    galaxy.classList.add('is-3d');
    galaxy.dataset.galaxyReady = '1';
    var core = galaxy.querySelector('.xfg-galaxy-core');
    if (core) {
      core.hidden = true;
      core.setAttribute('aria-hidden', 'true');
    }
    var badge = galaxy.querySelector('.galaxy-badge');
    if (badge) galaxy.appendChild(badge);
    document.documentElement.classList.add('galaxy-ready');
    if (badge) badge.textContent = 'Hold to enter.';

    var phase = 'idle';
    var elapsed = 0;
    var introT = 0;
    var introArmed = false;
    var retractT = 0;
    var retractDir = 1;
    var holding = false;
    var holdT = 0;
    var holdOrigin = { x: 0, y: 0 };
    var holdFromKey = false;
    var pointerId = null;
    var flightDrag = 0;
    var followNode = null;
    var orbitReady = false;
    var overviewRadius = 40;
    var overviewPhi = 1;
    var orbitView = { theta: 0, phi: 1, radius: 40, look: new THREE.Vector3() };
    var orbitTgt = { theta: 0, phi: 1, radius: 40, look: new THREE.Vector3() };
    var lastX = 0;
    var lastY = 0;
    var pitch = -0.35;
    var keys = {};
    var readoutName = '';
    var keysTimer = 0;
    var raf = 0;
    var looping = false;
    var clock = new THREE.Clock();
    var statsOverlay = null;
    var hoverRaycaster = new THREE.Raycaster();

    function dom(tag, className, parent, attrs) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (parent) parent.appendChild(el);
      if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
      return el;
    }

    var statsLabels = { type: 'Type', nativeCoin: 'Native Coin', privacy: 'Outward Swap', status: 'Status', tvl: 'Current TVL', circulatingSupply: 'Circulating Supply', maxSupply: 'Max Supply' };
    var chainMeta = {
      btc: ['BTC', 'Proof-of-work reserve'], eth: ['ETH', 'Proof-of-stake settlement'], sol: ['SOL', 'High-throughput L1'],
      bnb: ['BNB', 'EVM L1'], monero: ['XMR', 'Privacy — CryptoNote'], doge: ['DOGE', 'Proof-of-work UTXO'],
      avax: ['AVAX', 'Subnet L1'], bch: ['BCH', 'Proof-of-work UTXO'], matic: ['POL', 'Ethereum L2 / sidechain'],
      ltc: ['LTC', 'Proof-of-work UTXO'], dash: ['DASH', 'Proof-of-work'], zec: ['ZEC', 'Proof-of-work shielded pool'],
      arb: ['ETH', 'Ethereum L2'], base: ['ETH', 'Ethereum L2'], cro: ['CRO', 'EVM L1'], kmd: ['KMD', 'PoW multichain'],
      dcr: ['DCR', 'PoW/PoS hybrid'], gleec: ['GLEEC', 'EVM ecosystem'], robinhood: ['—', 'Listed network'],
      bob: ['ETH', 'EVM L2'], unichain: ['ETH', 'Ethereum L2'], plasma: ['—', 'Stable-focused L1'],
      pls: ['PLS', 'Proof-of-stake L1'], monad: ['MON', 'Parallel EVM L1'], linea: ['ETH', 'zkEVM L2'],
      zksync: ['ETH', 'zkEVM L2'], hyperevm: ['HYPE', 'EVM over L1'], ink: ['INK', 'Ethereum L2'],
      rootstock: ['RBTC', 'Bitcoin L2'], gnosis: ['xDAI', 'Ethereum sidechain'], flare: ['FLR', 'Data L1'],
      kaia: ['KAIA', 'L1'], scroll: ['ETH', 'zkEVM L2'], abstract: ['ABSTRACT', 'Ethereum L2'],
      plume: ['PLUME', 'RWA L2'], soneium: ['ETH', 'Ethereum L2'], doma: ['ETH', 'Domain-focused EVM'],
      beam: ['BEAM', 'Gaming L1'], moonriver: ['MOVR', 'Kusama L1'], peaq: ['PEAQ', 'DePIN L1'],
      sei: ['SEI', 'Parallel L1'], ton: ['TON', 'L1'], xfg: ['XFG', 'Private reserve']
    };
    statsOverlay = buildStatsOverlay(galaxy);
    window.refreshStatsOverlay = refreshStatsOverlay;

    function statsText(value) {
      return value == null ? '\u2014' : value;
    }

    function buildStatsOverlay(galaxyEl) {
      var overlay = dom('div', 'galaxy-stats-overlay', galaxyEl, { role: 'status', 'aria-live': 'polite' });
      overlay.style.display = 'none';
      var head = dom('div', 'galaxy-stats-head', overlay);
      dom('h3', 'galaxy-stats-name', head).textContent = '';
      var close = dom('button', 'galaxy-stats-close', head, { type: 'button', 'aria-label': 'Close stats' });
      close.textContent = '\u00d7';
      dom('dl', 'galaxy-stats-body', overlay);
      ['type', 'nativeCoin', 'privacy', 'status', 'tvl', 'circulatingSupply', 'maxSupply'].forEach(function (key) {
        var row = dom('div', 'galaxy-stat', overlay);
        row.setAttribute('data-stat', key);
        dom('span', 'galaxy-stat-key', row).textContent = statsLabels[key];
        dom('span', 'galaxy-stat-val', row).textContent = '\u2014';
      });
      close.addEventListener('click', function (ev) {
        ev.stopPropagation();
        goOverview();
      });
      return overlay;
    }

    function populateStatsOverlay(coinId, fallbackName) {
      var info = null;
      if (window.orbitData) {
        info = window.orbitData.find ? window.orbitData.find(function (n) { return n.id === coinId; }) : null;
      }
      var meta = chainMeta[coinId] || null;
      var privacy = coinId === 'monero' || coinId === 'xfg' ? 'Private' : (coinId ? 'Public' : '\u2014');
      var values = {
        type: (info && info.type) || (meta && meta[1]) || null,
        nativeCoin: (info && info.nativeCoin) || (meta && meta[0]) || null,
        privacy: privacy,
        status: (info && info.status) || (coinId ? 'Arriving with v11' : null),
        tvl: info ? info.tvl : null,
        circulatingSupply: info ? info.circulatingSupply : null,
        maxSupply: info ? info.maxSupply : null
      };
      statsOverlay.querySelectorAll('.galaxy-stat').forEach(function (row) {
        var key = row.getAttribute('data-stat');
        row.querySelector('.galaxy-stat-val').textContent = statsText(values[key]);
      });
      statsOverlay.querySelector('.galaxy-stats-name').textContent = (info && info.name) || fallbackName || '';
    }

    function refreshStatsOverlay() {
      if (!statsOverlay) return;
      var inFlight = phase === 'flight' || phase === 'retract' || phase === 'withdraw';
      if (selected.node && inFlight) {
        statsOverlay.style.display = 'block';
        populateStatsOverlay(selected.node.dataCoin, selected.node.dataName);
      } else {
        statsOverlay.style.display = 'none';
      }
    }

    function setPhase(next) {
      phase = next;
      galaxy.dataset.galaxyPhase = next;
      var open = next === 'retract' || next === 'flight' || next === 'withdraw';
      document.documentElement.classList.toggle('galaxy-flight', open);
      galaxy.classList.toggle('is-flight', next === 'flight');
      galaxy.classList.toggle('is-open', open);
      if (galaxy.classList.contains('is-3d')) galaxy.classList.toggle('galaxy-open', open);
      hud.withdraw.hidden = next !== 'flight';
      if (next !== 'flight') {
        galaxy.style.cursor = '';
        canvas.style.cursor = '';
        hover.node = null;
        galaxy.classList.remove('galaxy-over');
      } else {
        galaxy.style.cursor = 'crosshair';
        canvas.style.cursor = 'crosshair';
      }
      if (next === 'flight') {
        keysTimer = 0;
        galaxy.classList.add('is-briefing');
        hud.keys.hidden = false;
      }
      if (!open) hud.keys.hidden = true;
    }

    function sectionOn() {
      var section = galaxy.closest('.page-section');
      if (!section) return true;
      if (document.documentElement.classList.contains('galaxy-flight')) return true;
      var pager = window.matchMedia('(min-width: 861px) and (pointer: fine)').matches;
      if (pager) return section.classList.contains('active');
      var rect = galaxy.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    }

    function resize() {
      var w = galaxy.clientWidth || 1;
      var h = galaxy.clientHeight || 1;
      if (w < 2 || h < 2) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
      renderer.setSize(w, h, false);
    }

    function easeInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function applyDwell(t) {
      var a = t * 0.065;
      dwellPos.set(Math.sin(a) * 1.6 + 3.2, 5.2 + Math.sin(t * 0.11) * 0.18, 38 + Math.cos(a) * 0.4);
      camera.position.copy(dwellPos);
      camera.lookAt(dwellLook);
      camera.fov = 38;
      camera.updateProjectionMatrix();
    }

    function applyIntro(t, time) {
      var e = 1 - Math.pow(1 - t, 3);
      applyDwell(time);
      introEnd.copy(dwellPos);
      camera.position.lerpVectors(introFrom, introEnd, e);
      lookNow.lerpVectors(introLook, dwellLook, e);
      camera.lookAt(lookNow);
      camera.fov = 38;
      camera.updateProjectionMatrix();
    }

    function retractAmount() {
      if (phase === 'dwell' || phase === 'intro' || phase === 'idle') return 0;
      var cap = 0.5;
      if (phase === 'flight') return cap;
      var u = RETRACT_S <= 0 ? 1 : Math.min(1, retractT / (phase === 'withdraw' ? RETURN_S : RETRACT_S));
      var e = reduce ? 1 : easeInOut(u);
      return (retractDir > 0 ? e : 1 - e) * cap;
    }

    function layoutPlanets(motionT) {
      planets.forEach(function (p) {
        var ang = p.angle0 + motionT * p.speed;
        p.node.position.set(Math.cos(ang) * p.orbit, 0, Math.sin(ang) * p.orbit);
      });
    }

    function layoutTethers() {
      system.updateMatrixWorld(true);
      planets.forEach(function (p, i) {
        p.node.getWorldPosition(world);
        local.copy(world);
        system.worldToLocal(local);
        var len = local.length();
        if (len < 0.001) return;
        dummy.position.copy(local).multiplyScalar(0.5);
        dummy.scale.set(0.011, len, 0.011);
        dummy.quaternion.setFromUnitVectors(Y, local.multiplyScalar(1 / len));
        dummy.updateMatrix();
        tethers.setMatrixAt(i, dummy.matrix);
      });
      tethers.instanceMatrix.needsUpdate = true;
    }

    function placeHold(clientX, clientY) {
      var rect = galaxy.getBoundingClientRect();
      hud.hold.style.left = (clientX - rect.left) + 'px';
      hud.hold.style.top = (clientY - rect.top) + 'px';
    }

    function setHoldVisual(amount) {
      var offset = 176 * (1 - amount);
      hud.arc.style.strokeDashoffset = String(offset);
      canvas.setAttribute('aria-valuenow', String(Math.round(amount * 100)));
      if (ship.userData.hull) ship.userData.hull.material.uniforms.hold.value = amount;
      if (ship.userData.trench) ship.userData.trench.material.opacity = 0.7 + amount * 0.3;
    }

    function startHold(clientX, clientY, fromKey) {
      if (phase === 'flight' || phase === 'retract' || phase === 'withdraw') return;
      if ((gliding || activeAutoFly) && !fromKey) return;
      if (phase !== 'dwell' && phase !== 'intro') return;
      holding = true;
      holdFromKey = !!fromKey;
      holdT = 0;
      holdOrigin.x = clientX;
      holdOrigin.y = clientY;
      placeHold(clientX, clientY);
      hud.hold.hidden = false;
      setHoldVisual(0);
      hud.hint.textContent = 'Entering.';
      galaxy.classList.add('is-holding');
    }

    function cancelHold() {
      if (!holding) return;
      holding = false;
      holdFromKey = false;
      hud.hold.hidden = true;
      setHoldVisual(0);
      hud.hint.textContent = 'Hold to enter.';
      galaxy.classList.remove('is-holding');
    }

    function beginRetract() {
      cancelHold();
      camFrom.copy(camera.position);
      camera.getWorldDirection(forward);
      lookFrom.copy(camera.position).add(forward.multiplyScalar(12));
      camTo.set(1.4, 70, 48);
      camTo.lerp(camFrom, 0.5);
      lookTo.set(0, 12, 0);
      lookTo.lerp(lookFrom, 0.5);
      retractT = 0;
      retractDir = 1;
      setPhase('retract');
      resize();
      requestAnimationFrame(resize);
      if (navigator.vibrate) navigator.vibrate(16);
    }

    function beginWithdraw() {
      if (phase !== 'flight') {
        if (orbitUi) { orbitUi.style.display = 'none'; orbitOverlay && orbitOverlay.classList.add('orbit-backdrop-gone'); }
        return;
      }
      releaseFocus();
      camFrom.copy(camera.position);
      camera.getWorldDirection(forward);
      lookFrom.copy(camera.position).add(forward);
      applyDwell(elapsed);
      camTo.copy(camera.position);
      lookTo.copy(dwellLook);
      camera.position.copy(camFrom);
      retractT = 0;
      retractDir = -1;
      gliding = false;
      flyVel.set(0, 0, 0);
      setPhase('withdraw');
    }

    function seedFlight() {
      captureOrbit();
      flyVel.set(0, 0, 0);
      followNode = null;
      setPhase('flight');
      canvas.focus({ preventScroll: true });
    }

    function captureOrbit() {
      system.getWorldPosition(center);
      world.copy(camera.position).sub(center);
      var radius = Math.max(world.length(), 8);
      var phi = Math.acos(Math.max(-1, Math.min(1, world.y / radius)));
      var theta = Math.atan2(world.x, world.z);
      orbitView.theta = orbitTgt.theta = theta;
      orbitView.phi = orbitTgt.phi = phi;
      orbitView.radius = orbitTgt.radius = radius;
      overviewRadius = radius;
      overviewPhi = phi;
      orbitView.look.copy(center);
      orbitTgt.look.copy(center);
      orbitReady = true;
    }

    function clampOrbit() {
      if (orbitTgt.phi < 0.3) orbitTgt.phi = 0.3;
      if (orbitTgt.phi > 1.46) orbitTgt.phi = 1.46;
      var minR = followNode ? Math.max((followNode.dataSize || 1) * 3.4, 3.2) : 8;
      var maxR = overviewRadius * 1.9;
      if (orbitTgt.radius < minR) orbitTgt.radius = minR;
      if (orbitTgt.radius > maxR) orbitTgt.radius = maxR;
    }

    function applyOrbit(dt) {
      if (followNode) followNode.getWorldPosition(orbitTgt.look);
      var damp = 1 - Math.exp(-dt * 4.6);
      var spin = orbitTgt.theta - orbitView.theta;
      if (spin > Math.PI) orbitView.theta += Math.PI * 2;
      if (spin < -Math.PI) orbitView.theta -= Math.PI * 2;
      orbitView.theta += (orbitTgt.theta - orbitView.theta) * damp;
      orbitView.phi += (orbitTgt.phi - orbitView.phi) * damp;
      orbitView.radius += (orbitTgt.radius - orbitView.radius) * damp;
      orbitView.look.lerp(orbitTgt.look, damp);
      var r = orbitView.radius;
      var cp = Math.sin(orbitView.phi);
      var sp = Math.cos(orbitView.phi);
      camera.position.set(
        orbitView.look.x + r * cp * Math.sin(orbitView.theta),
        orbitView.look.y + r * sp,
        orbitView.look.z + r * cp * Math.cos(orbitView.theta)
      );
      camera.lookAt(orbitView.look);
    }

    function releaseFocus() {
      followNode = null;
      if (selected.node && selected.node.classList && selected.node.classList.remove) selected.node.classList.remove('orbit-planet--selected');
      selected.node = null;
      gliding = false;
      activeAutoFly = false;
      refreshStatsOverlay();
    }

    function goOverview() {
      releaseFocus();
      if (!orbitReady) return;
      system.getWorldPosition(orbitTgt.look);
      orbitTgt.radius = overviewRadius;
      orbitTgt.phi = overviewPhi;
      clampOrbit();
    }

    function focusNode(node) {
      if (!node || phase !== 'flight') return;
      if (selected.node && selected.node !== node && selected.node.classList && selected.node.classList.remove) selected.node.classList.remove('orbit-planet--selected');
      selected.node = node;
      followNode = node;
      if (node.classList && node.classList.add) node.classList.add('orbit-planet--selected');
      var size = node.dataSize || 1;
      orbitTgt.radius = Math.max(size * 5.6, 4.2);
      node.getWorldPosition(orbitTgt.look);
      clampOrbit();
      galaxyOver(node);
      hud.readout.textContent = node.dataName || '';
      refreshStatsOverlay();
    }

    function applyFlightLook(dx, dy) {
      var sens = coarse ? 0.0052 : 0.0031;
      var next = pitch - dy * sens;
      if (next > 1.15) dy = (pitch - 1.15) / sens;
      if (next < -1.15) dy = (pitch + 1.15) / sens;
      pitch -= dy * sens;
      yawQ.setFromAxisAngle(Y, -dx * sens);
      localX.set(1, 0, 0).applyQuaternion(flightQuat);
      pitchQ.setFromAxisAngle(localX, -dy * sens);
      flightQuat.premultiply(yawQ);
      flightQuat.multiply(pitchQ);
      camera.quaternion.copy(flightQuat);
    }

    function galaxyOver(hovered) {
      galaxy.classList.toggle('galaxy-over', !!hovered);
      window.dispatchEvent(new CustomEvent('orbit.hover', { detail: { planet: hovered, selected: null } }));
    }

    function selectPlanet(node) {
      focusNode(node);
    }

    function pickCoin(object) {
      var node = object;
      while (node && node !== scene) {
        if (node.dataCoin) return node;
        node = node.parent;
      }
      return null;
    }

    function syncHover() {
      if (phase !== 'flight') {
        galaxy.style.cursor = '';
        if (hover.node) {
          hover.node = null;
          galaxyOver(null);
        }
        return;
      }
      hoverRaycaster.setFromCamera(hover.cameraPoint, camera);
      var pickList = planets.map(function (p) { return p.node; });
      pickList.push(ship);
      var hits = hoverRaycaster.intersectObjects(pickList, true);
      var node = null;
      if (hits.length) node = pickCoin(hits[0].object);
      if (!node && galaxy.clientWidth > 0) {
        var gw = galaxy.clientWidth, gh = galaxy.clientHeight;
        var px = (hover.cameraPoint.x + 1) / 2 * gw;
        var py = (1 - hover.cameraPoint.y) / 2 * gh;
        var proj = new THREE.Vector3();
        var best = null, bestD = 28;
        planets.forEach(function (p) {
          p.node.getWorldPosition(proj);
          proj.project(camera);
          if (proj.z < -1 || proj.z > 1) return;
          var sx = (proj.x + 1) / 2 * gw;
          var sy = (1 - proj.y) / 2 * gh;
          var d = Math.hypot(sx - px, sy - py);
          if (d < bestD) { bestD = d; best = p.node; }
        });
        if (best) node = best;
      }
      if (node !== hover.node) {
        galaxyOver(node);
        hover.node = node;
      }
      var cursor = node ? 'pointer' : 'crosshair';
      galaxy.style.cursor = cursor;
      canvas.style.cursor = cursor;
    }

    function aimAt(clientX, clientY) {
      var rect = galaxy.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      hover.cameraPoint.set(
        2 * (clientX - rect.left) / rect.width - 1,
        1 - 2 * (clientY - rect.top) / rect.height
      );
      if (hud.reticle) {
        hud.reticle.style.left = (clientX - rect.left) + 'px';
        hud.reticle.style.top = (clientY - rect.top) + 'px';
      }
      syncHover();
    }

    function updateReadout() {
      var best = null;
      var bestD = 7.2;
      system.getWorldPosition(center);
      if (selected.node) {
        var sel = planets.find(function (p) { return p.node === selected.node; });
        var selName = sel ? sel.name : '';
        if (selName !== readoutName) {
          readoutName = selName;
          hud.readout.textContent = selName;
        }
        return;
      }
      if (camera.position.distanceTo(center) < 14) {
        best = { name: 'Fuego Reserve' };
        bestD = camera.position.distanceTo(center);
      }
      planets.forEach(function (p) {
        p.node.getWorldPosition(world);
        var d = world.distanceTo(camera.position);
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      });
      var name = best ? best.name : '';
      if (name !== readoutName) {
        readoutName = name;
        hud.readout.textContent = name;
      }
    }

    function beginAutoFly() {
      if (phase !== 'flight') return;
      if (reduce) return;
      activeAutoFly = true;
      gliding = true;
      keys = { w: true, s: false, a: false, d: false };
      var target = selected.node ? planets.find(function (p) { return p.node === selected.node; }) : null;
      window.dispatchEvent(new CustomEvent('orbit.fly', {
        detail: { planet: target ? target.name : null }
      }));
      setTimeout(function () { activeAutoFly = false; gliding = false; keys = { w: false, s: false, a: false, d: false }; }, 60000);
    }
    function update(dt) {
      var motion = reduce ? 0 : dt;
      elapsed += motion;

      if (!introArmed && sectionOn()) {
        introArmed = true;
        if (reduce) {
          setPhase('dwell');
          applyDwell(0);
        } else {
          setPhase('intro');
          introT = 0;
        }
      }

      if (holding && !gliding && !selected.node) {
        holdT += dt * 1000;
        var amount = Math.min(1, holdT / HOLD_MS);
        setHoldVisual(amount);
        if (amount >= 1) beginRetract();
      }

      var k = retractAmount();
      system.scale.setScalar(1 - 0.42 * k);
      system.position.y = 12 * k;
      if (ship.userData.hull) ship.userData.hull.material.uniforms.time.value = elapsed;
      if (ship.userData.core) ship.userData.core.material.uniforms.time.value = elapsed;
      if (!reduce) {
        ship.rotation.y = elapsed * 0.04;
        if (ship.userData.rings) ship.userData.rings.rotation.y = -elapsed * 0.09;
        if (ship.userData.halo) ship.userData.halo.rotation.y = elapsed * 0.05;
      }

      layoutPlanets(reduce ? 0 : elapsed);
      layoutTethers();
      tetherMat.opacity = 0.1 + 0.06 * (0.5 + 0.5 * Math.sin(elapsed * 0.7));

      if (phase === 'intro') {
        introT += dt / 8.4;
        if (introT >= 1) {
          introT = 1;
          setPhase('dwell');
          applyDwell(elapsed);
        } else {
          applyIntro(introT, elapsed);
        }
      } else if (phase === 'dwell') {
        if (!reduce) applyDwell(elapsed);
        if (!gliding && keysTimer <= 5.5) {
          keysTimer += dt;
          if (keysTimer > 5.5) galaxy.classList.remove('is-briefing');
        }
      } else if (phase === 'retract' || phase === 'withdraw') {
        retractT += dt;
        var dur = phase === 'withdraw' ? RETURN_S : RETRACT_S;
        var u = dur <= 0 || reduce ? 1 : Math.min(1, retractT / dur);
        var e = reduce ? 1 : easeInOut(u);
        camera.position.lerpVectors(camFrom, camTo, e);
        lookNow.lerpVectors(lookFrom, lookTo, e);
        camera.lookAt(lookNow);
        camera.fov = 38 + (52 - 38) * k;
        camera.updateProjectionMatrix();
        if (u >= 1) {
          if (phase === 'retract') seedFlight();
          else {
            setPhase('dwell');
            applyDwell(elapsed);
            resize();
            requestAnimationFrame(resize);
          }
        }
      } else if (phase === 'flight') {
        if (orbitReady) applyOrbit(dt);
        if (keysTimer <= 5.5) {
          keysTimer += dt;
          if (keysTimer > 5.5) galaxy.classList.remove('is-briefing');
        }
        updateReadout();
      }
    }

    function frame() {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      if (!sectionOn() && phase !== 'flight' && phase !== 'retract' && phase !== 'withdraw') return;
      var dt = Math.min(clock.getDelta(), 0.05);
      update(dt);
      renderer.render(scene, camera);
      if (orbitUi) {
        var label = (selected.node && planets.find(function (p) { return p.node === selected.node; })
          ? planets.find(function (p) { return p.node === selected.node; }).name : '') ||
          (orbitFloater && orbitFloater.textContent) ||
          'Select a world.';
        orbitFloater && (orbitFloater.textContent = label);
        orbitUi.style.display = (gliding || phase === 'flight' || phase === 'retract' || phase === 'withdraw') ? 'block' : 'none';
      }
    }

    function startLoop() {
      if (looping) return;
      looping = true;
      clock.getDelta();
      raf = requestAnimationFrame(frame);
    }

    function stopLoop() {
      looping = false;
      cancelAnimationFrame(raf);
    }

    function syncLoop() {
      var need = sectionOn() || phase === 'flight' || phase === 'retract' || phase === 'withdraw';
      if (need) startLoop();
      else stopLoop();
    }

    galaxy.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.galaxy-withdraw')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      var actionBtn = e.target.closest && e.target.closest('.galaxy-orb-btn[data-action]');
      if (actionBtn) {
        if (phase !== 'flight') return;
        actionBtn.blur();
        var kind = actionBtn.dataset.action;
        if ((kind === 'home' || kind === 'reset') && selected.node) selected.node = null;
        if (kind === 'plan') window.location.assign('plan.html');
        if (kind === 'activity') window.location.assign('activity.html');
        refreshStatsOverlay();
        return;
      }
      if (phase === 'flight') {
        pointerId = e.pointerId;
        lastX = e.clientX;
        lastY = e.clientY;
        flightDrag = 0;
        aimAt(e.clientX, e.clientY);
        try { galaxy.setPointerCapture(e.pointerId); } catch (err) { /* already captured */ }
        return;
      }
      if (phase !== 'dwell' && phase !== 'intro') return;
      pointerId = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      startHold(e.clientX, e.clientY, false);
    });

    galaxy.addEventListener('pointermove', function (e) {
      if (pointerId !== null && e.pointerId !== pointerId) return;
      if (phase === 'flight') {
        aimAt(e.clientX, e.clientY);
        if (pointerId !== null) {
          var mx = e.clientX - lastX;
          var my = e.clientY - lastY;
          flightDrag += Math.abs(mx) + Math.abs(my);
          if (flightDrag > 8 && orbitReady) {
            if (followNode) releaseFocus();
            orbitTgt.theta -= mx * 0.0052;
            orbitTgt.phi -= my * 0.0052;
            clampOrbit();
          }
          lastX = e.clientX;
          lastY = e.clientY;
        }
        return;
      }
      if (!holding) return;
      placeHold(e.clientX, e.clientY);
      var dx = e.clientX - holdOrigin.x;
      var dy = e.clientY - holdOrigin.y;
      if (dx * dx + dy * dy > 28 * 28) cancelHold();
    });

    function endPointer(e) {
      if (pointerId !== null && e.pointerId !== pointerId) return;
      var tapped = phase === 'flight' && flightDrag < 8;
      pointerId = null;
      flightDrag = 0;
      if (tapped) {
        aimAt(e.clientX, e.clientY);
        if (hover.node) focusNode(hover.node);
        else if (followNode) goOverview();
      }
      if (gliding && !activeAutoFly) {
        gliding = false;
        flyVel.set(0, 0, 0);
      }
      if (holding && !holdFromKey && !selected.node) cancelHold();
    }
    galaxy.addEventListener('pointerup', endPointer);
    galaxy.addEventListener('pointercancel', endPointer);
    galaxy.addEventListener('pointerleave', function () {
      if (holding && phase !== 'flight') cancelHold();
    });
    galaxy.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    ['touchstart', 'touchend', 'touchcancel'].forEach(function (type) {
      galaxy.addEventListener(type, function (e) { e.stopPropagation(); }, { passive: true });
    });
    galaxy.addEventListener('touchmove', function (e) {
      if (phase === 'flight') {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });
    galaxy.addEventListener('wheel', function (e) {
      if (phase === 'flight' || phase === 'retract' || phase === 'withdraw') {
        e.preventDefault();
        e.stopPropagation();
        if (phase === 'flight' && orbitReady) {
          if (followNode && Math.abs(e.deltaY) > 2) releaseFocus();
          orbitTgt.radius *= 1 + e.deltaY * 0.0009;
          clampOrbit();
        }
        return;
      }
      if (holding) cancelHold();
    }, { passive: false });
    window.addEventListener('scroll', function () {
      if (holding && phase !== 'flight') cancelHold();
    }, true);

    window.addEventListener('keydown', function (e) {
      var k = e.key.toLowerCase();
      if (phase === 'flight') {
        if (k === 'escape' && !e.repeat) {
          e.preventDefault();
          e.stopPropagation();
          if (followNode) goOverview();
          else beginWithdraw();
          return;
        }
        var step = 0.12;
        if (k === 'arrowleft') orbitTgt.theta -= step;
        if (k === 'arrowright') orbitTgt.theta += step;
        if (k === 'arrowup') orbitTgt.phi -= step * 0.6;
        if (k === 'arrowdown') orbitTgt.phi += step * 0.6;
        if (k === 'arrowleft' || k === 'arrowright' || k === 'arrowup' || k === 'arrowdown') {
          clampOrbit();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (pageKey(e)) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }
      if ((k === ' ' || e.code === 'Space') && galaxy.contains(document.activeElement) && (phase === 'dwell' || phase === 'intro')) {
        e.preventDefault();
        e.stopPropagation();
        if (!holding) startHold(galaxy.clientWidth * 0.5 + galaxy.getBoundingClientRect().left, galaxy.clientHeight * 0.5 + galaxy.getBoundingClientRect().top, true);
      }
    }, true);

    window.addEventListener('keyup', function (e) {
      var k = e.key.toLowerCase();
      keys[k] = false;
      if (e.key === 'Shift') keys.shift = false;
      if ((k === ' ' || e.code === 'Space') && holdFromKey) cancelHold();
    }, true);

    hud.withdraw.addEventListener('click', function (e) {
      e.stopPropagation();
      beginWithdraw();
    });

    window.addEventListener('resize', function () {
      resize();
      if (!looping) renderer.render(scene, camera);
    }, { passive: true });

    if (window.ResizeObserver) new ResizeObserver(resize).observe(galaxy);

    var section = galaxy.closest('.page-section');
    if (section) {
      section.addEventListener('scroll', function () {
        if (holding && phase !== 'flight') cancelHold();
      }, { passive: true });
    }
    if (section && window.MutationObserver) {
      new MutationObserver(syncLoop).observe(section, { attributes: true, attributeFilter: ['class'] });
    }
    if (window.IntersectionObserver) {
      new IntersectionObserver(syncLoop, { threshold: 0.05 }).observe(galaxy);
    }
    document.addEventListener('visibilitychange', syncLoop);

    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      stopLoop();
    }, false);
    canvas.addEventListener('webglcontextrestored', function () {
      resize();
      syncLoop();
    }, false);

    resize();
    layoutPlanets(0);
    layoutTethers();
    camera.lookAt(0, 0.2, 0);
    renderer.render(scene, camera);
    syncLoop();
    window.addEventListener('focus', syncLoop);
    window.addEventListener('pageshow', syncLoop);
    onMobileReady();
    return true;
  }

  function onMobileReady() {
    if (orbitUi) orbitUi.style.display = coarse ? 'flex' : 'none';
  }

  function dom(tag, className, parent, attrs) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (parent) parent.appendChild(el);
    if (attrs) Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function pageKey(e) {
    var k = e.key.toLowerCase();
    return k === 'arrowdown' || k === 'arrowup' || k === 'arrowleft' || k === 'arrowright' ||
      k === 'pagedown' || k === 'pageup' || k === 'home' || k === 'end' || k === ' ';
  }

  function buildHud(galaxy, coarse) {
    var hud = document.createElement('div');
    hud.className = 'galaxy-hud';
    var buttons = [
      { action: 'home', label: 'Home' },
      { action: 'plan', label: 'Plan' },
      { action: 'activity', label: 'Activity' },
      { action: 'reset', label: 'Reset' }
    ];
    var menuRoot = dom('div', 'galaxy-orb', hud);
    buttons.forEach(function (b) {
      var btn = dom('button', 'galaxy-orb-btn', menuRoot, { type: 'button', 'data-action': b.action });
      btn.textContent = b.label;
      btn.setAttribute('aria-label', 'Galaxy menu: ' + b.label);
    });
    var badges = dom('div', 'galaxy-orbit-badges', hud);
    badges.setAttribute('role', 'status');
    badges.setAttribute('aria-live', 'polite');
    var hint = document.createElement('p');
    hint.className = 'galaxy-hint';
    hint.textContent = 'Hold to enter.';
    var readout = document.createElement('p');
    readout.className = 'galaxy-readout';
    readout.setAttribute('aria-live', 'polite');
    var keys = document.createElement('p');
    keys.className = 'galaxy-keys';
    keys.hidden = true;
    keys.textContent = coarse
      ? 'Drag to orbit. Tap a planet.'
      : 'Drag to orbit. Scroll to zoom. Select a planet.';
    var withdraw = document.createElement('button');
    withdraw.type = 'button';
    withdraw.className = 'galaxy-withdraw';
    withdraw.textContent = 'Withdraw';
    hud.appendChild(hint);
    hud.appendChild(readout);
    hud.appendChild(keys);
    hud.appendChild(withdraw);

    var hold = document.createElement('div');
    hold.className = 'galaxy-hold';
    hold.hidden = true;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 72 72');
    svg.setAttribute('aria-hidden', 'true');
    var track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    track.setAttribute('cx', '36');
    track.setAttribute('cy', '36');
    track.setAttribute('r', '28');
    track.setAttribute('class', 'galaxy-hold-track');
    var arc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    arc.setAttribute('cx', '36');
    arc.setAttribute('cy', '36');
    arc.setAttribute('r', '28');
    arc.setAttribute('class', 'galaxy-hold-arc');
    svg.appendChild(track);
    svg.appendChild(arc);
    hold.appendChild(svg);

    var reticle = document.createElement('div');
    reticle.className = 'galaxy-reticle';
    reticle.setAttribute('aria-hidden', 'true');

    galaxy.appendChild(hud);
    galaxy.appendChild(hold);
    galaxy.appendChild(reticle);
    return { hint: hint, readout: readout, keys: keys, withdraw: withdraw, hold: hold, arc: arc, reticle: reticle };
  }

  function buildStars(scene, mobile) {
    var sprite = starSprite();
    addStarLayer(scene, sprite, mobile ? 1100 : 2100, 90, 210, mobile ? 1.15 : 1.35, 0.62, 0.86);
    addStarLayer(scene, sprite, mobile ? 180 : 380, 28, 70, 2.1, 0.28, 0.2);
    addStarLayer(scene, sprite, mobile ? 45 : 70, 18, 46, 2.8, 0.45, 1);
  }

  function starSprite() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(234,246,249,1)');
    g.addColorStop(0.35, 'rgba(234,246,249,0.55)');
    g.addColorStop(1, 'rgba(234,246,249,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    var tex = new THREE.CanvasTexture(c);
    return tex;
  }

  function addStarLayer(scene, sprite, count, inner, outer, size, opacity, goldBias) {
    var pos = new Float32Array(count * 3);
    var col = new Float32Array(count * 3);
    var gold = new THREE.Color(0xc5a059);
    var white = new THREE.Color(0xeaf6f9);
    var ember = new THREE.Color(0xe8622c);
    for (var i = 0; i < count; i++) {
      var r = inner + Math.random() * (outer - inner);
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.78;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      var roll = Math.random();
      var c = roll < goldBias ? gold : roll > 0.97 ? ember : white;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
      size: size,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending
    })));
  }

  function buildNebula(scene) {
    var specs = [
      { color: '61,90,128', x: -28, y: 10, z: -62, s: 96, o: 0.055 },
      { color: '197,160,89', x: 34, y: -6, z: -48, s: 74, o: 0.04 },
      { color: '232,98,44', x: 6, y: 18, z: -80, s: 50, o: 0.03 }
    ];
    specs.forEach(function (spec) {
      var c = document.createElement('canvas');
      c.width = c.height = 256;
      var ctx = c.getContext('2d');
      var g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
      g.addColorStop(0, 'rgba(' + spec.color + ',0.9)');
      g.addColorStop(1, 'rgba(' + spec.color + ',0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);
      var mat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c),
        transparent: true,
        opacity: spec.o,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      var sprite = new THREE.Sprite(mat);
      sprite.position.set(spec.x, spec.y, spec.z);
      sprite.scale.set(spec.s, spec.s * 0.62, 1);
      scene.add(sprite);
    });
  }

  function buildShip(system, renderer, mobile) {
    var ship = new THREE.Group();
    system.add(ship);
    var segs = mobile ? 48 : 80;

    var hull = new THREE.Mesh(new THREE.SphereGeometry(5.2, segs, segs), hullMaterial());
    ship.add(hull);

    var core = new THREE.Mesh(new THREE.SphereGeometry(4.55, mobile ? 32 : 48, mobile ? 24 : 36), coreMaterial());
    ship.add(core);

    var trench = new THREE.Mesh(
      new THREE.TorusGeometry(5.18, 0.045, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0xc5a059, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    trench.rotation.x = Math.PI / 2;
    ship.add(trench);

    var rings = new THREE.Group();
    ship.add(rings);
    rings.add(metalTorus(7.2, 0.12, 0xc5a059, 0.34));
    rings.add(metalTorus(9.45, 0.045, 0x8c734b, 0.2));

    var spokeGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 6);
    var spokeMat = new THREE.MeshStandardMaterial({ color: 0x3a3428, metalness: 0.84, roughness: 0.3, emissive: 0x8c734b, emissiveIntensity: 0.15 });
    for (var s = 0; s < 8; s++) {
      var spoke = new THREE.Mesh(spokeGeo, spokeMat);
      var ang = (s / 8) * Math.PI * 2;
      var inner = new THREE.Vector3(Math.cos(ang) * 5.35, 0, Math.sin(ang) * 5.35);
      var outer = new THREE.Vector3(Math.cos(ang) * 9.45, 0, Math.sin(ang) * 9.45);
      var dir = outer.clone().sub(inner);
      spoke.position.copy(inner).add(outer).multiplyScalar(0.5);
      spoke.scale.set(1, dir.length(), 1);
      spoke.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      rings.add(spoke);
    }

    var bayGeo = new THREE.BoxGeometry(0.62, 0.26, 0.95);
    var bayMat = new THREE.MeshStandardMaterial({ color: 0x1a1814, metalness: 0.74, roughness: 0.36, emissive: 0x2a2116, emissiveIntensity: 0.2 });
    var bays = new THREE.InstancedMesh(bayGeo, bayMat, 16);
    bays.frustumCulled = false;
    var bay = new THREE.Object3D();
    for (var b = 0; b < 16; b++) {
      var a = (b / 16) * Math.PI * 2;
      bay.position.set(Math.cos(a) * 9.45, Math.sin(a * 2) * 0.08, Math.sin(a) * 9.45);
      bay.lookAt(0, 0, 0);
      bay.updateMatrix();
      bays.setMatrixAt(b, bay.matrix);
    }
    rings.add(bays);

    var halo = metalTorus(11.4, 0.028, 0xc5a059, 0.45);
    halo.rotation.x = 1.05;
    halo.rotation.z = 0.22;
    ship.add(halo);

    var spireMat = new THREE.MeshStandardMaterial({ color: 0x221e18, metalness: 0.7, roughness: 0.34, emissive: 0xc5a059, emissiveIntensity: 0.12 });
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 1.7, 12), spireMat);
    mast.position.y = 6.05;
    ship.add(mast);
    var cap = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.85, 14), spireMat);
    cap.position.y = 7.25;
    ship.add(cap);
    var beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xe8622c })
    );
    beacon.position.y = 7.72;
    ship.add(beacon);

    var ensign = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
    ensign.position.y = 8.45;
    ensign.scale.set(1.7, 1.7, 1);
    ship.add(ensign);
    new THREE.TextureLoader().load('coins/xfg-mark.png', function (tex) {
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      ensign.material.map = tex;
      ensign.material.needsUpdate = true;
    });

    var lights = windowLights(mobile ? 70 : 140);
    ship.add(lights);

    ship.userData.hull = hull;
    ship.userData.core = core;
    ship.userData.rings = rings;
    ship.userData.halo = halo;
    ship.userData.trench = trench;
    return ship;
  }

  function metalTorus(radius, tube, color, glow) {
    var mesh = new THREE.Mesh(
      new THREE.TorusGeometry(radius, tube, 10, 80),
      new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.88,
        roughness: 0.22,
        emissive: color,
        emissiveIntensity: glow
      })
    );
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }

  function hullMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        hold: { value: 0 },
        keyDir: { value: new THREE.Vector3(0.45, 0.72, 0.42).normalize() }
      },
      vertexShader: [
        'varying vec3 vN;',
        'varying vec3 vP;',
        'varying vec3 vW;',
        'void main() {',
        '  vN = normalize(normalMatrix * normal);',
        '  vP = position;',
        '  vec4 w = modelMatrix * vec4(position, 1.0);',
        '  vW = w.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * w;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float time;',
        'uniform float hold;',
        'uniform vec3 keyDir;',
        'varying vec3 vN;',
        'varying vec3 vP;',
        'varying vec3 vW;',
        'float hash(vec3 p) {',
        '  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);',
        '}',
        'void main() {',
        '  float lat = vP.y / 5.2;',
        '  if (abs(lat) < 0.055) discard;',
        '  vec3 n = normalize(vN);',
        '  vec3 viewDir = normalize(cameraPosition - vW);',
        '  float ndl = clamp(dot(n, keyDir), 0.0, 1.0);',
        '  float fres = pow(1.0 - abs(dot(n, viewDir)), 2.6);',
        '  float lon = atan(vP.z, vP.x);',
        '  float seam = smoothstep(0.455, 0.5, abs(fract(lon * 5.2) - 0.5));',
        '  seam += smoothstep(0.455, 0.5, abs(fract(lat * 8.0) - 0.5));',
        '  float city = step(0.82, hash(floor(vP * 6.5))) * (1.0 - ndl);',
        '  float band = exp(-pow(lat * 8.0, 2.0));',
        '  vec3 gold = vec3(0.773, 0.627, 0.349);',
        '  vec3 ember = vec3(0.910, 0.384, 0.173);',
        '  vec3 rim = vec3(0.353, 0.478, 0.612);',
        '  vec3 col = vec3(0.07, 0.062, 0.05) * (0.42 + ndl * 1.35);',
        '  col += gold * seam * 0.72;',
        '  col += gold * band * 0.28;',
        '  col += ember * city * (0.85 + 0.4 * fract(sin(time * 0.7 + lat * 18.0)));',
        '  col += rim * fres * 0.62;',
        '  col += ember * fres * hold * 0.45;',
        '  col += gold * hold * band * 0.35;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n')
    });
  }

  function coreMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: [
        'varying vec3 vN;',
        'varying vec3 vW;',
        'void main() {',
        '  vN = normalize(normalMatrix * normal);',
        '  vec4 w = modelMatrix * vec4(position, 1.0);',
        '  vW = w.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * w;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float time;',
        'varying vec3 vN;',
        'varying vec3 vW;',
        'void main() {',
        '  float fres = pow(1.0 - abs(dot(normalize(vN), normalize(cameraPosition - vW))), 1.6);',
        '  float pulse = 0.82 + 0.18 * sin(time * 1.3);',
        '  vec3 ember = vec3(0.910, 0.384, 0.173);',
        '  vec3 gold = vec3(0.773, 0.627, 0.349);',
        '  vec3 col = mix(ember, gold, fres) * pulse;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n')
    });
  }

  function windowLights(count) {
    var pos = [];
    var i = 0;
    var guard = 0;
    while (pos.length / 3 < count && guard < count * 8) {
      guard++;
      var y = 1 - (i / (count * 2)) * 2;
      i++;
      if (Math.abs(y) < 0.08) continue;
      var rad = Math.sqrt(Math.max(0, 1 - y * y));
      var phi = i * 2.399963;
      var p = new THREE.Vector3(Math.cos(phi) * rad, y, Math.sin(phi) * rad).multiplyScalar(5.28);
      pos.push(p.x, p.y, p.z);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xe7c98a,
      size: 0.28,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true
    }));
  }

  function orbitRing(radius) {
    var mesh = new THREE.Mesh(
      new THREE.RingGeometry(radius - 0.035, radius + 0.035, 128),
      new THREE.MeshBasicMaterial({
        color: 0xc5a059,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }

  function planetBody(size, mobile) {
    var segs = mobile ? 28 : 40;
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        logo: { value: placeholderTex() },
        hasLogo: { value: 0 },
        tint: { value: new THREE.Color(0x8c734b) },
        keyDir: { value: new THREE.Vector3(0.45, 0.72, 0.42).normalize() }
      },
      vertexShader: [
        'varying vec3 vN;',
        'varying vec3 vP;',
        'varying vec3 vW;',
        'void main() {',
        '  vN = normalize(normalMatrix * normal);',
        '  vP = position;',
        '  vec4 w = modelMatrix * vec4(position, 1.0);',
        '  vW = w.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * w;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D logo;',
        'uniform float hasLogo;',
        'uniform vec3 tint;',
        'uniform vec3 keyDir;',
        'varying vec3 vN;',
        'varying vec3 vP;',
        'varying vec3 vW;',
        'void main() {',
        '  vec3 n = normalize(vN);',
        '  vec3 viewDir = normalize(cameraPosition - vW);',
        '  float ndl = clamp(dot(n, keyDir), 0.0, 1.0);',
        '  float fres = pow(1.0 - max(dot(n, viewDir), 0.0), 2.3);',
        '  float lat = normalize(vP).y;',
        '  vec3 alb = mix(vec3(0.03, 0.027, 0.022), tint, 0.28);',
        '  alb += tint * exp(-pow(lat * 3.2, 2.0)) * 0.16;',
        '  vec3 col = alb * (0.16 + ndl * 1.05);',
        '  vec3 halfv = normalize(keyDir + viewDir);',
        '  col += vec3(1.0, 0.94, 0.84) * pow(max(dot(n, halfv), 0.0), 42.0) * 0.28;',
        '  col += tint * fres * 0.22;',
        '  vec3 up = abs(viewDir.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);',
        '  vec3 r = normalize(cross(up, viewDir));',
        '  vec3 u = cross(viewDir, r);',
        '  vec3 lp = normalize(vP);',
        '  vec2 q = vec2(dot(lp, r), dot(lp, u));',
        '  float facing = dot(n, viewDir);',
        '  float disc = smoothstep(0.50, 0.30, length(q)) * smoothstep(0.0, 0.28, facing);',
        '  vec4 mark = texture2D(logo, q * 1.05 + 0.5);',
        '  col = mix(col, mark.rgb, disc * mark.a * hasLogo);',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n')
    });
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(size, segs, segs), mat);
    var atmosMat = new THREE.ShaderMaterial({
      uniforms: { tint: { value: mat.uniforms.tint.value } },
      vertexShader: [
        'varying vec3 vN;',
        'varying vec3 vW;',
        'void main() {',
        '  vN = normalize(normalMatrix * normal);',
        '  vec4 w = modelMatrix * vec4(position, 1.0);',
        '  vW = w.xyz;',
        '  gl_Position = projectionMatrix * viewMatrix * w;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 tint;',
        'varying vec3 vN;',
        'varying vec3 vW;',
        'void main() {',
        '  float fres = pow(0.62 - dot(normalize(vN), normalize(cameraPosition - vW)), 3.0);',
        '  gl_FragColor = vec4(tint, clamp(fres, 0.0, 1.0) * 0.8);',
        '}'
      ].join('\n'),
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var atmos = new THREE.Mesh(new THREE.SphereGeometry(size * 1.08, segs, segs), atmosMat);
    atmos.renderOrder = 2;
    return { mesh: mesh, atmos: atmos, mat: mat, atmosMat: atmosMat };
  }

  function placeholderTex() {
    var data = new Uint8Array([18, 16, 14, 255]);
    var tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return tex;
  }

  function loadBrand(id, body, renderer) {
    var loader = new THREE.TextureLoader();
    loader.load('coins/' + id + '.png?v=4', function (tex) {
      tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      body.mat.uniforms.logo.value = tex;
      body.mat.uniforms.hasLogo.value = 1;
      sampleTint(tex.image, body);
    }, undefined, function () {
      body.mat.uniforms.hasLogo.value = 0;
    });
  }

  function sampleTint(image, body) {
    if (!image || !image.width) return;
    var c = document.createElement('canvas');
    c.width = c.height = 8;
    var ctx = c.getContext('2d');
    try {
      ctx.drawImage(image, 0, 0, 8, 8);
    } catch (err) {
      return;
    }
    var data = ctx.getImageData(0, 0, 8, 8).data;
    var r = 0;
    var g = 0;
    var b = 0;
    var n = 0;
    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 40) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
    if (!n) return;
    r /= n * 255;
    g /= n * 255;
    b /= n * 255;
    var max = Math.max(r, g, b, 0.08);
    var scale = 0.78 / max;
    body.mat.uniforms.tint.value.setRGB(r * scale, g * scale, b * scale);
    body.atmosMat.uniforms.tint.value.copy(body.mat.uniforms.tint.value);
  }

  function boot() {
    var mounted = false;
    try {
      mounted = mount();
    } catch (err) {
      mounted = false;
    }
    window.FuegoGalaxy = { mounted: mounted, stats: window.orbitData || null };
    window.FuegoGalaxy.debug = function () {
      var g = document.getElementById('xfg-galaxy');
      return {
        phase: g ? g.dataset.galaxyPhase : null,
        holding: holding,
        gliding: gliding,
        activeAutoFly: activeAutoFly,
        selected: selected.node ? selected.node.dataCoin : null,
        isHoldingClass: !!(g && g.classList.contains('is-holding')),
        rafAlive: (typeof window.__rafTest) === 'undefined' ? 'unknown' : window.__rafTest
      };
    };
    fetch('/data/networks.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.networks) window.orbitData = data.networks;
        if (window.refreshStatsOverlay) window.refreshStatsOverlay();
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

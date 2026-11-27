/*  deXFG Private Exchange — Galaxy
    Maison de XFG: one gargantuan mothership, forty-one branded worlds,
    gold in candlelight. Press and hold to retract overhead into flight mode.
    Restraint over spectacle. Fails quiet: the DOM orbit fallback stays if
    WebGL or Three.js is unavailable.
*/
(function () {
  'use strict';

  var wrapper = document.getElementById('xfg-galaxy');
  if (!wrapper || typeof THREE === 'undefined') return;

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* --- Renderer: decoration, never content. Fail quietly. --- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) { return; }
  if (!renderer.getContext()) return;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.domElement.className = 'galaxy-canvas';
  wrapper.appendChild(renderer.domElement);
  wrapper.classList.add('galaxy-3d');
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('role', 'button');
  wrapper.setAttribute('aria-label', 'Private exchange galaxy. Press and hold, or press Enter, to open the flight overview.');

  /* --- Palette --- */
  var GOLD   = 0xC5A059;
  var GOLD_D = 0x8C734B;
  var WHITE  = 0xEAF6F9;
  var EMBER  = 0xE8622C;

  /* --- The 41 systems deXFG bridges --- */
  var COINS = [
    ['btc','Bitcoin'],['eth','Ethereum'],['sol','Solana'],['bnb','BNB Chain'],
    ['monero','Monero'],['doge','Dogecoin'],['avax','Avalanche'],['bch','Bitcoin Cash'],
    ['matic','Polygon'],['ltc','Litecoin'],['dash','Dash'],['zec','Zcash'],
    ['arb','Arbitrum'],['base','Base'],['cro','Cronos'],['kmd','Komodo'],
    ['dcr','Decred'],['gleec','Gleec'],['robinhood','Robinhood'],['bob','BOB'],
    ['unichain','Unichain'],['plasma','Plasma'],['pls','PulseChain'],['monad','Monad'],
    ['linea','Linea'],['zksync','ZKsync'],['hyperevm','HyperEVM'],['ink','Ink'],
    ['rootstock','Rootstock'],['gnosis','Gnosis'],['flare','Flare'],['kaia','Kaia'],
    ['scroll','Scroll'],['abstract','Abstract'],['plume','Plume'],['soneium','Soneium'],
    ['doma','Doma'],['beam','Beam'],['moonriver','Moonriver'],['peaq','peaq'],
    ['sei','Sei'],['ton','TON']
  ];
  var RINGS = [
    { radius: 9,  count: 6,  speed: Math.PI * 2 / 45,  dir:  1, size: 1.00, incl:  0.055 },
    { radius: 14, count: 10, speed: Math.PI * 2 / 70,  dir: -1, size: 1.15, incl: -0.045 },
    { radius: 19, count: 12, speed: Math.PI * 2 / 100, dir:  1, size: 1.30, incl:  0.075 },
    { radius: 24, count: 14, speed: Math.PI * 2 / 140, dir: -1, size: 1.45, incl: -0.065 }
  ];

  /* --- Scene --- */
  var scene = new THREE.Scene();
  var FOV = 42;
  var camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 600);

  var galaxy = new THREE.Group();
  scene.add(galaxy);

  scene.add(new THREE.AmbientLight(0x50463a, 1.15));
  var key = new THREE.DirectionalLight(WHITE, 0.8); key.position.set(-30, 42, 24); scene.add(key);
  var coreLight = new THREE.PointLight(GOLD, 1.6, 140, 1.6); scene.add(coreLight);
  var emberLight = new THREE.PointLight(EMBER, 0.55, 90, 2); emberLight.position.set(0, -20, 12); scene.add(emberLight);

  /* --- Canvas textures: brand the spheres --- */
  function brandedTexture(img, logoSize, glow) {
    var c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(512, 256, 30, 512, 256, 560);
    g.addColorStop(0, '#241c11');
    g.addColorStop(1, '#0b0908');
    x.fillStyle = g;
    x.fillRect(0, 0, 1024, 512);

    /* faint graticule — a charted world, not a sticker */
    x.strokeStyle = 'rgba(197,160,89,0.12)';
    x.lineWidth = 1;
    for (var lon = 1; lon < 12; lon++) {
      x.beginPath(); x.moveTo(lon * 1024 / 12, 0); x.lineTo(lon * 1024 / 12, 512); x.stroke();
    }
    for (var lat = 1; lat < 6; lat++) {
      var yy = lat * 512 / 6;
      x.beginPath(); x.moveTo(0, yy); x.lineTo(1024, yy); x.stroke();
    }
    x.strokeStyle = 'rgba(197,160,89,0.3)';
    x.beginPath(); x.moveTo(0, 256); x.lineTo(1024, 256); x.stroke();

    /* dim copy on the far side so the world reads branded from every angle */
    x.save();
    x.globalAlpha = 0.3;
    x.shadowColor = 'rgba(197,160,89,0.5)';
    x.shadowBlur = glow;
    x.drawImage(img, -logoSize / 2, 256 - logoSize / 2, logoSize, logoSize);
    x.drawImage(img, 1024 - logoSize / 2, 256 - logoSize / 2, logoSize, logoSize);
    x.restore();

    x.save();
    x.shadowColor = 'rgba(197,160,89,0.85)';
    x.shadowBlur = glow;
    x.drawImage(img, 512 - logoSize / 2, 256 - logoSize / 2, logoSize, logoSize);
    x.restore();

    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  function glowSpriteTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(234,246,249,1)');
    g.addColorStop(0.35, 'rgba(234,246,249,0.45)');
    g.addColorStop(1, 'rgba(234,246,249,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  var spriteTex = glowSpriteTexture();

  /* --- Mothership: the Fuego Reserve as a gold mirror-ball ---
     The Reserve's face is the disco-ball hull from the private-exchange
     galaxy: longitude/latitude seams of gold leaf, a cut equator with the
     ember core showing through, and a slow specular roll. The halo and
     station rings around it stay with this galaxy. */
  var shipGroup = new THREE.Group();
  galaxy.add(shipGroup);

  var SHIP_RADIUS = 6.2;
  var SHIP_LOCAL_RADIUS = 5.2;
  var shipBall = buildFuegoMothership(shipGroup, SHIP_RADIUS / SHIP_LOCAL_RADIUS);
  var ship = shipBall.hull;
  ship.userData = { coin: ['fuego', 'Fuego Reserve'], size: SHIP_RADIUS };

  var loader = new THREE.TextureLoader();

  /* halo sprite */
  var halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: spriteTex, color: GOLD, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  halo.scale.set(21, 21, 1);
  shipGroup.add(halo);

  /* station rings */
  var ringA = new THREE.Mesh(
    new THREE.TorusGeometry(7.9, 0.06, 12, 128),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 })
  );
  ringA.rotation.x = Math.PI / 2 + 0.22;
  var ringB = new THREE.Mesh(
    new THREE.TorusGeometry(9.2, 0.035, 12, 128),
    new THREE.MeshBasicMaterial({ color: GOLD_D, transparent: true, opacity: 0.4 })
  );
  ringB.rotation.x = Math.PI / 2 - 0.3;
  ringB.rotation.y = 0.4;
  shipGroup.add(ringA, ringB);

  function buildFuegoMothership(parent, scale) {
    var group = new THREE.Group();
    group.scale.setScalar(scale);
    parent.add(group);

    var hullMat = fuegoHullMaterial();
    var hull = new THREE.Mesh(new THREE.SphereGeometry(SHIP_LOCAL_RADIUS, 64, 40), hullMat);
    group.add(hull);

    var coreMat = fuegoCoreMaterial();
    var core = new THREE.Mesh(new THREE.SphereGeometry(4.55, 48, 32), coreMat);
    group.add(core);

    var trench = new THREE.Mesh(
      new THREE.TorusGeometry(5.18, 0.045, 8, 96),
      new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    trench.rotation.x = Math.PI / 2;
    group.add(trench);

    /* window lights: the small lit edges of the mirror-ball panels */
    group.add(fuegoWindowLights(window.innerWidth < 720 ? 70 : 140));

    /* the staff is the Reserve's G itself — a gold letter standard.
       The flame is not painted on: it burns up through the open throat of
       the G, exactly as it does in the house mark. */
    var stemMat = new THREE.MeshStandardMaterial({
      color: 0x8c734b, metalness: 0.85, roughness: 0.32,
      emissive: 0x3a2410, emissiveIntensity: 0.2
    });
    var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.17, 0.72, 12), stemMat);
    stem.position.y = 5.44;
    group.add(stem);

    var gEmblem = fuegoGEmblem(group);
    var flame = fuegoFlame(group);

    return {
      group: group, hull: hull, core: core, trench: trench,
      hullMat: hullMat, coreMat: coreMat,
      gEmblem: gEmblem, flame: flame
    };
  }

  /* One solid G, cut from a single outline with a single void — no facets,
     no raster, no stuck-on bar. Generous bevels and a darker edge give it
     the feel of cast gold bullion. */
  function fuegoGEmblem(parent) {
    var group = new THREE.Group();
    group.position.y = 7.15;
    parent.add(group);

    var outer = new THREE.Shape();
    outer.moveTo(1.25, 0.78);
    outer.lineTo(0.62, 1.45);
    outer.lineTo(-0.62, 1.45);
    outer.lineTo(-1.25, 0.75);
    outer.lineTo(-1.25, -0.75);
    outer.lineTo(-0.62, -1.45);
    outer.lineTo(0.62, -1.45);
    outer.lineTo(1.25, -0.78);
    outer.lineTo(1.25, 0.78);

    /* the void wraps around the crossbar, leaving it part of the same mass */
    var hole = new THREE.Path();
    hole.moveTo(0.88, 0.60);
    hole.lineTo(0.45, 1.08);
    hole.lineTo(-0.45, 1.08);
    hole.lineTo(-0.90, 0.62);
    hole.lineTo(-0.90, -0.62);
    hole.lineTo(-0.45, -1.08);
    hole.lineTo(0.45, -1.08);
    hole.lineTo(0.88, -0.60);
    hole.lineTo(1.20, -0.30);
    hole.lineTo(0.18, -0.30);
    hole.lineTo(0.18, 0.02);
    hole.lineTo(1.20, 0.02);
    hole.lineTo(0.88, 0.60);
    outer.holes.push(hole);

    var geo = new THREE.ExtrudeGeometry(outer, {
      depth: 0.34, bevelEnabled: true, bevelThickness: 0.06,
      bevelSize: 0.045, bevelSegments: 3, curveSegments: 6
    });
    geo.center();
    var face = new THREE.MeshStandardMaterial({
      color: 0xd9b571, metalness: 0.62, roughness: 0.24,
      emissive: 0x8a5a22, emissiveIntensity: 0.3
    });
    var edge = new THREE.MeshStandardMaterial({
      color: 0x8c734b, metalness: 0.7, roughness: 0.3,
      emissive: 0x3a2410, emissiveIntensity: 0.2
    });
    var mesh = new THREE.Mesh(geo, [face, edge]);
    mesh.renderOrder = 3;
    group.add(mesh);
    return group;
  }

  /* Living flame: buoyancy-scrolled FBM, a slow/mid/high flicker stack,
     and a hot core that cools to ember at the edges and tip. Two offset
     cards give the plume volume without a fluid sim. */
  function fuegoFlameMaterial() {
    /* Physical parameters live here, not sprinkled through the shader:
       rise = buoyancy, swayLow/Mid = large-vortex and licking bands,
       flickMid/Fast/Crackle = the three luminance bands of real fire. */
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        rise: { value: 0.62 },
        swayLow: { value: 0.37 },
        swayMid: { value: 1.31 },
        flickMid: { value: 2.7 },
        flickFast: { value: 6.3 },
        flickCrackle: { value: 11.7 }
      },
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform float time;',
        'uniform float rise;',
        'uniform float swayLow;',
        'uniform float swayMid;',
        'uniform float flickMid;',
        'uniform float flickFast;',
        'uniform float flickCrackle;',
        'varying vec2 vUv;',
        'float hash(vec2 p) {',
        '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
        '}',
        'float noise(vec2 p) {',
        '  vec2 i = floor(p), f = fract(p);',
        '  f = f * f * (3.0 - 2.0 * f);',
        '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),',
        '             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);',
        '}',
        'float fbm(vec2 p) {',
        '  float v = 0.0, a = 0.5;',
        '  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }',
        '  return v;',
        '}',
        'void main() {',
        '  float h = clamp(vUv.y, 0.0, 1.0);',
        '  vec2 np = vec2(vUv.x * 2.6, vUv.y * 2.1 - time * rise);',
        /* domain warp: the eddies that detach and curl back into the plume */
        '  vec2 warp = vec2(fbm(np + vec2(0.0, -time * 0.11)),',
        '                    fbm(np + vec2(5.2, 1.3) - vec2(0.0, time * 0.09)));',
        '  vec2 wp = np + (warp - 0.5) * 0.85;',
        '  float n = fbm(wp);',
        '  float n2 = fbm(wp * 1.7 + vec2(4.7, -time * 0.35));',
        /* large vortices sway the whole column; small eddies lick the edges */
        '  float sway = sin(time * swayLow) * 0.10 + sin(time * swayMid + h * 2.6) * 0.05 + (n - 0.5) * 0.18;',
        /* the XFG flame is sinuous: two slow bends and a hooked tip, not
           a straight column. The bends drift but never flatten out. */
        '  float curve = sin(h * 5.4 + time * 0.28) * 0.19 * smoothstep(0.02, 0.55, h);',
        '  curve += sin(h * 9.2 + time * 0.17 + 1.4) * 0.055 * smoothstep(0.25, 1.0, h);',
        '  curve += smoothstep(0.72, 1.0, h) * 0.10;',
        '  float x = (vUv.x - 0.5) - curve - sway * pow(h, 1.2);',
        '  float w = 0.10 + 0.16 * sin(3.14159265 * pow(h, 0.8));',
        '  w *= 1.0 - smoothstep(0.66, 1.0, h) * 0.9;',
        '  w *= 0.55 + 0.45 * smoothstep(0.0, 0.10, h);',
        '  float d = abs(x) / w + (n2 - 0.5) * 0.5 * (0.35 + h);',
        '  float body = 1.0 - smoothstep(0.68, 1.02, d);',
        '  float core = (1.0 - smoothstep(0.0, 0.55, d)) * smoothstep(0.0, 0.10, h);',
        /* three independent luminance bands — no single sine wave */
        '  float flick = 0.88 + 0.07 * sin(time * flickMid)',
        '              + 0.04 * sin(time * flickFast + 1.1)',
        '              + 0.03 * sin(time * flickCrackle + 2.2);',
        '  vec3 col = mix(vec3(0.55, 0.06, 0.01), vec3(1.0, 0.31, 0.03), smoothstep(0.0, 0.55, h));',
        '  col = mix(col, vec3(1.0, 0.70, 0.16), core * 0.9);',
        '  col = mix(col, vec3(1.0, 0.95, 0.74), core * core * (1.0 - smoothstep(0.0, 0.32, h)) * 0.8);',
        '  col = mix(col, vec3(0.48, 0.05, 0.01), smoothstep(0.80, 1.0, h) * 0.8);',
        '  float soot = smoothstep(0.35, 0.75, n2) * smoothstep(0.20, 0.70, h) * 0.14;',
        '  col *= 1.0 - soot;',
        '  float a = body * flick * (1.0 - smoothstep(0.88, 1.0, h) * 0.6) * 0.95;',
        '  gl_FragColor = vec4(col, a);',
        '}'
      ].join('\n'),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
  }

  function fuegoFlame(parent) {
    var mat = fuegoFlameMaterial();
    var cards = [];
    var sizes = [[1.15, 4.0, 7.95], [0.6, 2.8, 7.5]];
    for (var i = 0; i < sizes.length; i++) {
      var card = new THREE.Mesh(new THREE.PlaneGeometry(sizes[i][0], sizes[i][1]), mat);
      card.position.y = sizes[i][2];
      card.renderOrder = 5 + i;
      parent.add(card);
      cards.push(card);
    }

    var glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: spriteTex, color: 0xff5a1e, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false
    }));
    glow.position.y = 7.9;
    glow.scale.set(4.4, 6.4, 1);
    glow.renderOrder = 4;
    parent.add(glow);

    var n = 42;
    var pos = new Float32Array(n * 3);
    var seeds = [];
    for (var e = 0; e < n; e++) {
      seeds.push({ a: Math.random() * 6.2832, r: 0.08 + Math.random() * 0.4, y: Math.random(), s: 0.5 + Math.random() * 0.8 });
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var embers = new THREE.Points(geo, new THREE.PointsMaterial({
      map: spriteTex, color: 0xff8a3d, size: 0.18, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, sizeAttenuation: true
    }));
    embers.renderOrder = 7;
    parent.add(embers);

    /* fire light: warm, never neutral. The upper source throws the
       moving shadows; the lower one is the bounce on the gold hull. */
    var light = new THREE.PointLight(0xff6a24, 2.6, 26, 2);
    light.position.y = 7.0;
    parent.add(light);

    var bounce = new THREE.PointLight(0xff3d0d, 1.1, 13, 2);
    bounce.position.y = 5.7;
    parent.add(bounce);

    return {
      mat: mat, cards: cards, glow: glow,
      pos: pos, attr: geo.attributes.position, seeds: seeds,
      light: light, bounce: bounce
    };
  }

  function fuegoWindowLights(count) {
    var pos = [];
    var i = 0, guard = 0;
    while (pos.length / 3 < count && guard < count * 8) {
      guard++;
      var y = 1 - (i / (count * 2)) * 2;
      i++;
      if (Math.abs(y) < 0.08) continue;
      var rad = Math.sqrt(Math.max(0, 1 - y * y));
      var phi = i * 2.399963;
      pos.push(
        Math.cos(phi) * rad * 5.28,
        y * 5.28,
        Math.sin(phi) * rad * 5.28
      );
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xe7c98a,
      size: 0.26,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true
    }));
  }

  function fuegoHullMaterial() {
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

  function fuegoCoreMaterial() {
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

  /* --- Planets --- */
  var planets = [];
  var loaded = 0;

  var loadChip = document.createElement('div');
  loadChip.className = 'galaxy-loading';
  loadChip.textContent = 'Charting ' + COINS.length + ' systems';
  wrapper.appendChild(loadChip);
  var chipDone = false;
  function chipUpdate() {
    if (chipDone) return;
    if (loaded >= COINS.length) {
      chipDone = true;
      loadChip.classList.add('off');
      setTimeout(function () { loadChip.remove(); }, 700);
    } else {
      loadChip.textContent = 'Charting ' + loaded + ' / ' + COINS.length;
    }
  }
  setTimeout(function () { chipDone = true; loadChip.classList.add('off'); }, 6000);

  function removePlanet(mesh) {
    if (mesh.parent) mesh.parent.remove(mesh);
    var i = planets.indexOf(mesh);
    if (i !== -1) planets.splice(i, 1);
    if (mesh.userData.label) mesh.userData.label.remove();
  }

  function makePlanet(coin, size) {
    var geo = new THREE.SphereGeometry(1, 28, 20);
    var mat = new THREE.MeshStandardMaterial({
      color: 0x4a443c, roughness: 0.45, metalness: 0.2,
      emissive: 0xffffff, emissiveIntensity: 0
    });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(0.0001);
    mesh.userData = { coin: coin, size: size, pop: 0 };
    loader.load(
      'coins/' + coin[0] + '.png?v=4',
      function (img) { applyTex(img, false); },
      undefined,
      function () {
        loader.load('coins/mono/' + coin[0] + '.png?v=3',
          function (img) { applyTex(img, true); },
          undefined,
          function () { removePlanet(mesh); });
      }
    );
    function applyTex(texIn, mono) {
      var tex = brandedTexture(texIn.image || texIn, mono ? 300 : 340, mono ? 10 : 26);
      mesh.material.map = tex;
      mesh.material.emissiveMap = tex;
      mesh.material.emissiveIntensity = mono ? 0.5 : 0.65;
      mesh.material.color.setHex(mono ? 0x8f8578 : 0xffffff);
      mesh.material.needsUpdate = true;
      loaded++; chipUpdate();
    }
    return mesh;
  }

  var ringGroups = [];
  RINGS.forEach(function (cfg) {
    var rg = new THREE.Group();
    rg.rotation.x = cfg.incl;
    rg.rotation.z = cfg.incl * 0.6;
    galaxy.add(rg);
    ringGroups.push(rg);

    /* the orbit line itself */
    var pts = [];
    for (var i = 0; i <= 128; i++) {
      var a = i / 128 * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * cfg.radius, 0, Math.sin(a) * cfg.radius));
    }
    var ringLine = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.14 })
    );
    rg.add(ringLine);

    for (var j = 0; j < cfg.count; j++) {
      if (planets.length >= COINS.length) break;
      var coin = COINS[planets.length];
      var mesh = makePlanet(coin, cfg.size);
      mesh.userData.ring = rg;
      mesh.userData.angle = (j / cfg.count) * Math.PI * 2;
      mesh.userData.speed = cfg.speed * cfg.dir;
      mesh.userData.spin = 0.12 + (j % 5) * 0.03;
      rg.add(mesh);
      planets.push(mesh);
    }
  });

  /* labels track planets by reference */
  planets.forEach(function (m) {
    var d = document.createElement('div');
    d.className = 'planet-label';
    d.textContent = m.userData.coin[1];
    d.style.display = 'none';
    m.userData.label = d;
  });

  /* --- Spokes: mothership to each world --- */
  var spokeGeo = new THREE.BufferGeometry();
  var spokePos = new Float32Array(COINS.length * 2 * 3);
  spokeGeo.setAttribute('position', new THREE.BufferAttribute(spokePos, 3));
  var spokes = new THREE.LineSegments(spokeGeo, new THREE.LineBasicMaterial({
    color: GOLD, transparent: true, opacity: 0.16,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(spokes);

  /* --- Gold dust belt + far stars --- */
  function makeDust(count, rMin, rMax, ySpread, size, opacity, color) {
    var p = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      var r = rMin + Math.random() * (rMax - rMin);
      var a = Math.random() * Math.PI * 2;
      p[i*3]   = Math.cos(a) * r;
      p[i*3+1] = (Math.random() - 0.5) * ySpread;
      p[i*3+2] = Math.sin(a) * r;
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({
      size: size, map: spriteTex, color: color,
      transparent: true, opacity: opacity, alphaTest: 0.01,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
  }
  var dust = makeDust(420, 6.5, 27, 2.2, 0.42, 0.5, GOLD);
  scene.add(dust);
  var stars = makeDust(340, 70, 160, 90, 0.9, 0.55, WHITE);
  scene.add(stars);

  /* --- Camera rig: damped spherical flight --- */
  var mode = 'hero';           /* 'hero' | 'flight' */
  var view  = { theta: -0.9, phi: 1.05, radius: 120, look: new THREE.Vector3(0, 2, 0) };
  var tgt   = { theta: -0.9, phi: 1.05, radius: 120, look: new THREE.Vector3(0, 2, 0) };
  var scaleTarget = 1;
  var follow = null;           /* focused planet */

  var clock = new THREE.Clock();
  var clockTime = 0;
  var prevPos = new THREE.Vector3();

  function fitDistance(R, aspect, margin) {
    var vf = FOV * Math.PI / 360;
    var hf = Math.atan(Math.tan(vf) * aspect);
    return R / Math.tan(Math.min(vf, hf)) * margin;
  }
  function heroFit() {
    var w = wrapper.clientWidth || 540;
    var h = wrapper.clientHeight || 540;
    return fitDistance(26.5, w / h, 1.14);
  }
  function flightFit() {
    return fitDistance(28.5, window.innerWidth / window.innerHeight, 1.1);
  }

  function clampView() {
    if (mode === 'hero') {
      tgt.phi = Math.max(0.95, Math.min(1.42, tgt.phi));
      tgt.radius = Math.max(heroFit() * 0.7, Math.min(heroFit() * 1.12, tgt.radius));
    } else {
      tgt.phi = Math.max(0.30, Math.min(1.46, tgt.phi));
      var rMin = follow ? follow.userData.size * 3.4 : 7;
      tgt.radius = Math.max(rMin, Math.min(flightFit() * 1.9, tgt.radius));
    }
  }

  /* --- Flight overlay --- */
  var overlay = document.createElement('div');
  overlay.id = 'galaxy-flight';
  overlay.innerHTML =
    '<div class="gf-bar top"></div><div class="gf-bar bottom"></div>' +
    '<div class="gf-stage"></div>' +
    '<div class="gf-labels"></div>' +
    '<div class="gf-dossier">' +
      '<div class="gf-dossier-inner">' +
        '<div class="gf-dossier-head">' +
          '<span class="gf-dossier-crest" aria-hidden="true"><img src="assets/logo/fuego-nav.png" alt=""></span>' +
          '<h2 class="gf-dossier-name"></h2>' +
        '</div>' +
        '<p class="gf-dossier-blurb"></p>' +
        '<div class="gf-dossier-grid">' +
          '<div class="gf-dossier-row"><span class="gd-label">Network Type</span><span class="gd-val">—</span></div>' +
          '<div class="gf-dossier-row"><span class="gd-label">Status in deXFG</span><span class="gd-val">—</span></div>' +
          '<div class="gf-dossier-row"><span class="gd-label">Inward Swap Privacy</span><span class="gd-val">—</span></div>' +
          '<div class="gf-dossier-row"><span class="gd-label">Gas Asset</span><span class="gd-val">—</span></div>' +
          '<div class="gf-dossier-row"><span class="gd-label">TVL</span><span class="gd-val">—</span></div>' +
          '<div class="gf-dossier-row"><span class="gd-label">Circulating Supply</span><span class="gd-val">—</span></div>' +
          '<div class="gf-dossier-row"><span class="gd-label">Max Supply</span><span class="gd-val">—</span></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="gf-hud">' +
      '<div class="gf-title"><span class="gf-eyebrow">deXFG — Private Exchange</span></div>' +
      '<button class="gf-close" type="button" aria-label="Collapse galaxy overview">Collapse</button>' +
      '<button class="gf-overview" type="button">Overview</button>' +
      '<button class="gf-freefly" type="button">Free Fly</button>' +
      '<div class="gf-hint">Drag to fly &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Select a planet</div>' +
    '</div>';
  document.body.appendChild(overlay);
  var stage = overlay.querySelector('.gf-stage');
  var labelsLayer = overlay.querySelector('.gf-labels');
  var overviewBtn = overlay.querySelector('.gf-overview');
  planets.forEach(function (m) { labelsLayer.appendChild(m.userData.label); });

  var live = document.createElement('div');
  live.className = 'visually-hidden';
  live.setAttribute('aria-live', 'polite');
  document.body.appendChild(live);

  /* --- Dossier: network detail panel, prints on focus --- */
  var dossierEl = overlay.querySelector('.gf-dossier');
  var dNameEl = dossierEl.querySelector('.gf-dossier-name');
  var dBlurbEl = dossierEl.querySelector('.gf-dossier-blurb');
  var dRows = Array.prototype.slice.call(dossierEl.querySelectorAll('.gf-dossier-row')).map(function (r) {
    return { label: r.querySelector('.gd-label'), val: r.querySelector('.gd-val') };
  });
  var dCurrent = null, dStatsId = null, dPrintLen = 0, dNameDone = false, dRowsIn = 0;
  var dInAt = 0, dText = '';
  var dPrivacyAns = 'Public';
  var dRowVisible = [true, true, true, true, false, false, false];

  var dossierStash = ['—', '—', '—'];
  function dossierSet(rowIdx, val) {
    if (rowIdx < dRows.length) dRows[rowIdx].val.textContent = val;
  }
  function revealRow(i) {
    if (dRowVisible[i] || !dRows[i]) return;
    dRowVisible[i] = true;
    dRows[i].val.classList.add('visible');
    dRows[i].val.style.transitionDelay = Math.max(0, i - 3) * 0.09 + 's';
  }
  function resetDossierRows() {
    dRowVisible = [true, true, true, true, false, false, false];
    dRows.forEach(function (r) { r.val.classList.remove('visible'); });
  }
  function dossierStaticInfo(mesh) {
    var info = DEXXFG_CHAINS && DEXXFG_CHAINS.get(mesh.userData.coin[0]);
    return {
      type: info && info.type || '—',
      status: info && info.status || '—',
      symbol: info && info.symbol || '—',
      blurb: info && info.blurb || ''
    };
  }
  function closeDossier() {
    follow = null;
    dCurrent = null; dStatsId = null; dPrintLen = 0; dNameDone = false; dRowsIn = 0; dInAt = 0;
    dNameEl.textContent = ''; dBlurbEl.textContent = '';
    dRows.forEach(function (r) { r.val.textContent = '—'; r.val.classList.remove('private', 'gold-liquid'); });
    resetDossierRows();
    dossierEl.classList.remove('on', 'has-name', 'has-blurb', 'has-rows', 'fuego');
    overlay.classList.remove('fuego-focus');
  }
  function showDossier(mesh) {
    closeDossier();
    dossierEl.classList.add('on');
    follow = mesh;
    dCurrent = mesh;
    dStatsId = mesh.userData.coin[0];
    dossierEl.classList.toggle('fuego', dStatsId === 'fuego');
    overlay.classList.toggle('fuego-focus', dStatsId === 'fuego');
    dText = mesh.userData.coin[1];
    dPrintLen = 0; dNameDone = false; dRowsIn = 0; dInAt = 0;
    var info = dossierStaticInfo(mesh);
    dossierStash = [info.type, info.status, info.symbol];
    if (dStatsId === 'fuego') dossierStash[1] = 'Mothership';
    dRows[0].val.classList.add('visible');
    dRows[1].val.classList.add('visible');
    dPrivacyAns = (DEXXFG_CHAINS && DEXXFG_CHAINS.swapPrivacy) ? DEXXFG_CHAINS.swapPrivacy(dStatsId) : 'Public';
    if (dStatsId === 'fuego') dPrivacyAns = 'ALL';
    dossierSet(2, dPrivacyAns);
    var isPrivate = dPrivacyAns === 'Private' || dStatsId === 'fuego';
    dRows[2].val.classList.toggle('private', isPrivate);
    dRows[2].val.classList.toggle('gold-liquid', isPrivate);
    dRows[2].val.classList.add('visible');
    dRows[3].val.classList.add('visible');
    dossierSet(3, dossierStash[2]);
    DEXXFG_CHAINS && DEXXFG_CHAINS.stats(applyStats);
  }
  function applyStats(statsById) {
    if (!dStatsId || !statsById) return;
    var s = statsById[dStatsId];
    if (dStatsId === 'fuego') {
      /* The Fuego Reserve is the native network of facilitation, not a
         supported listing — and its supply figures are the reserve's own. */
      dossierSet(1, 'Mothership');
      dossierSet(5, '8,000,008');
      dossierSet(6, '8,000,008');
      if (s && s.tvl != null) { dossierSet(4, DEXXFG_CHAINS.fmtUsd(s.tvl)); revealRow(4); }
      revealRow(5);
      revealRow(6);
      return;
    }
    if (!s) return;
    if (s.tvl != null) dossierSet(4, DEXXFG_CHAINS.fmtUsd(s.tvl));
    if (s.circulating != null) dossierSet(5, DEXXFG_CHAINS.fmtCount(s.circulating));
    if (s.max != null) dossierSet(6, DEXXFG_CHAINS.fmtCount(s.max));
    if (s.tvl != null) revealRow(4);
    if (s.circulating != null) revealRow(5);
    if (s.max != null) revealRow(6);
  }

  /* --- Free Fly --- */
  var freeFlyBtn = overlay.querySelector('.gf-freefly');
  var visor = document.createElement('div');
  visor.id = 'gf-visor';
  overlay.insertBefore(visor, overlay.querySelector('.gf-hud'));
  var freeFly = false;
  var keyDir = new THREE.Vector3();
  var KEYV = {
    'w': [0, 0, 1], 's': [0, 0, -1], 'a': [-1, 0, 0], 'd': [1, 0, 0],
    ' ': [0, 1, 0], 'shift': [0, 1, 0], 'e': [0, -1, 0]
  };
  var FFLY = 22;
  function setFreeFly(on) {
    freeFly = !!on;
    freeFlyBtn.classList.toggle('on', on);
    visor.classList.toggle('on', on);
    goOverview();
  }
  function toggleFreeFly() { setFreeFly(!freeFly); }
  function flyFrame(dt) {
    if (!freeFly) { keyDir.set(0, 0, 0); return; }
    var up = new THREE.Vector3(0, 1, 0);
    var fwd = new THREE.Vector3().subVectors(tgt.look, galaxy.position);
    if (fwd.length() > 1e-6) fwd.normalize(); else fwd.set(0, 0, 1);
    var right = new THREE.Vector3().crossVectors(fwd, up).normalize();
    if (right.length() < 0.1) right.set(1, 0, 0);
    var upV = new THREE.Vector3().crossVectors(right, fwd).normalize();
    tgt.look.addScaledVector(right, keyDir.x * FFLY * dt);
    tgt.look.addScaledVector(upV, keyDir.y * FFLY * dt);
    tgt.look.addScaledVector(fwd, keyDir.z * FFLY * dt);
    if (tgt.look.y < -15) tgt.look.y = -15;
    if (tgt.look.y > 30) tgt.look.y = 30;
  }

  /* --- Hint chip + hold progress ring + tooltip --- */
  var hint = document.createElement('div');
  hint.className = 'galaxy-hint';
  hint.textContent = 'Hold to open the galaxy';
  wrapper.appendChild(hint);

  var holdRing = document.createElement('div');
  holdRing.className = 'hold-ring';
  holdRing.innerHTML = '<svg viewBox="0 0 64 64"><circle class="hr-bg" cx="32" cy="32" r="24"/><circle class="hr-fg" cx="32" cy="32" r="24"/></svg>';
  var hrFg = holdRing.querySelector('.hr-fg');
  var HR_C = 2 * Math.PI * 24;
  hrFg.style.strokeDasharray = HR_C;
  document.body.appendChild(holdRing);

  var tooltip = document.createElement('div');
  tooltip.className = 'galaxy-tooltip';
  document.body.appendChild(tooltip);

  /* --- Hold-to-open gesture (touch + mouse) --- */
  var HOLD_MS = 500;
  var hold = { active: false, start: 0, x: 0, y: 0 };

  wrapper.addEventListener('pointerdown', function (e) {
    if (mode !== 'hero' || e.target.closest('button')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    hold.active = true;
    hold.start = performance.now();
    hold.x = e.clientX; hold.y = e.clientY;
    holdRing.style.left = e.clientX + 'px';
    holdRing.style.top = e.clientY + 'px';
    holdRing.classList.add('on');
    hrFg.style.strokeDashoffset = HR_C;
  });
  wrapper.addEventListener('pointermove', function (e) {
    if (!hold.active) return;
    if (Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 10) cancelHold();
  });
  function cancelHold() {
    hold.active = false;
    holdRing.classList.remove('on');
  }
  wrapper.addEventListener('pointerup', cancelHold);
  wrapper.addEventListener('pointercancel', cancelHold);
  wrapper.addEventListener('pointerleave', cancelHold);
  wrapper.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  wrapper.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      if (mode === 'hero') { e.preventDefault(); enterFlight(); }
    }
  });

  /* --- Flight mode --- */
  function enterFlight() {
    if (mode !== 'hero') return;
    cancelHold();
    closeDossier();
    mode = 'flight';
    document.body.classList.add('galaxy-flight');
    overlay.classList.add('on');
    stage.appendChild(renderer.domElement);
    sizeTo(window.innerWidth, window.innerHeight);
    scaleTarget = 0.84;                       /* the model retracts inward */
    tgt.phi = 0.60;                           /* steep high angle — cinematic, never top-down */
    tgt.radius = flightFit();
    tgt.look.set(0, 1.5, 0);
    clampView();
    hint.classList.add('dim');
    setTimeout(function () { overlay.querySelector('.gf-close').focus(); }, 350);
    live.textContent = 'Galaxy overview opened. Drag to fly.';
  }
  function exitFlight() {
    if (mode !== 'flight') return;
    follow = null;
    overviewBtn.classList.remove('on');
    closeDossier();
    freeFlyBtn.classList.remove('on');
    visor.classList.remove('on');
    freeFly = false;
    mode = 'hero';
    overlay.classList.remove('on');
    document.body.classList.remove('galaxy-flight');
    wrapper.appendChild(renderer.domElement);
    sizeTo(wrapper.clientWidth, wrapper.clientHeight);
    scaleTarget = 1;
    tgt.phi = 1.22;
    tgt.radius = heroFit();
    tgt.look.set(0, 2, 0);
    clampView();
    wrapper.focus({ preventScroll: true });
    live.textContent = 'Galaxy overview closed.';
  }

  overlay.querySelector('.gf-close').addEventListener('click', exitFlight);
  overviewBtn.addEventListener('click', function () { goOverview(); });

  function goOverview() {
    if (dCurrent) closeDossier();
    follow = null;
    overviewBtn.classList.remove('on');
    tgt.look.set(0, 1.5, 0);
    tgt.phi = 0.60;
    tgt.radius = flightFit();
    clampView();
  }

  document.addEventListener('keydown', function (e) {
    if (mode !== 'flight') return;
    if (e.key === 'Escape') { if (dCurrent) closeDossier(); else exitFlight(); return; }
    if (e.key === 'f' && !freeFly) { toggleFreeFly(); return; }
    if (freeFly) {
      var v = KEYV[e.key.toLowerCase()];
      if (v) { keyDir.set(v[0], v[1], v[2]); e.preventDefault(); }
    } else {
      hideDossierOnMove();
      var step = 0.12;
      if (e.key === 'ArrowLeft')  { tgt.theta -= step; e.preventDefault(); }
      if (e.key === 'ArrowRight') { tgt.theta += step; e.preventDefault(); }
      if (e.key === 'ArrowUp')    { tgt.phi = Math.max(0.30, tgt.phi - step * 0.6); e.preventDefault(); }
      if (e.key === 'ArrowDown')  { tgt.phi = Math.min(1.46, tgt.phi + step * 0.6); e.preventDefault(); }
    }
  });
  document.addEventListener('keyup', function (e) {
    if (freeFly) keyDir.set(0, 0, 0);
  });
  overlay.querySelector('.gf-freefly').addEventListener('click', function () { toggleFreeFly(); });

  /* --- Pointer flight controls --- */
  var drag = { on: false, x: 0, y: 0, id: null, moved: 0, downT: 0 };
  var pointers = new Map();
  var pinchDist = 0;

  var cv = renderer.domElement;
  cv.addEventListener('pointerdown', function (e) {
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      drag.on = true; drag.x = e.clientX; drag.y = e.clientY;
      drag.id = e.pointerId; drag.moved = 0; drag.downT = performance.now();
      if (mode === 'flight') hideDossierOnMove();
    } else if (pointers.size === 2) {
      var p = Array.from(pointers.values());
      pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    }
  });
  cv.addEventListener('pointermove', function (e) {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      var q = Array.from(pointers.values());
      var d = Math.hypot(q[0].x - q[1].x, q[0].y - q[1].y);
      if (pinchDist > 0) {
        tgt.radius /= d / pinchDist;
        clampView();
        drag.moved += Math.abs(d - pinchDist);
      }
      if (Math.abs(pinchDist - d) > 3) hideDossierOnMove();
      pinchDist = d;
      return;
    }
    if (!drag.on || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    tgt.theta -= dx * 0.0052;
    tgt.phi   -= dy * 0.0052;
    clampView();
    if (drag.moved > 6) hideDossierOnMove();
  });
  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
    if (e.pointerId !== drag.id) return;
    var wasTap = drag.moved < 7 && performance.now() - drag.downT < 500;
    drag.on = false;
    if (wasTap && mode === 'flight') handleTap(e);
  }
  cv.addEventListener('pointerup', endPointer);
  cv.addEventListener('pointercancel', endPointer);

  cv.addEventListener('wheel', function (e) {
    e.preventDefault();
    tgt.radius *= 1 + e.deltaY * 0.0009;
    clampView();
    hideDossierOnMove();
  }, { passive: false });

  /* --- Raycast: tooltip in hero, fly-to in flight --- */
  var ray = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  var hovered = null;

  function pick(e) {
    var r = cv.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects([ship].concat(planets), false);
    return hits.length ? hits[0].object : null;
  }

  cv.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var hit = pick(e);
    if (hit !== hovered) {
      hovered = hit;
      cv.style.cursor = hit ? 'pointer' : '';
    }
    if (hit) {
      tooltip.textContent = hit.userData.coin[1] + (mode === 'flight' ? ' — select to fly' : '');
      tooltip.style.left = e.clientX + 'px';
      tooltip.style.top = e.clientY + 'px';
      tooltip.classList.add('on');
    } else {
      tooltip.classList.remove('on');
    }
  });
  cv.addEventListener('pointerleave', function () {
    hovered = null;
    tooltip.classList.remove('on');
  });

  function hideDossierOnMove() {
    if (dCurrent) closeDossier();
  }
  function handleTap(e) {
    var hit = pick(e);
    if (hit) {
      showDossier(hit);
      tgt.radius = hit.userData.size * 5.6;
      overviewBtn.classList.add('on');
      live.textContent = 'Focused on ' + hit.userData.coin[1] + '.';
    } else if (follow) {
      goOverview();
    }
  }

  /* --- Sizing --- */
  function sizeTo(w, h) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  sizeTo(wrapper.clientWidth, wrapper.clientHeight);

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () {
      if (mode === 'hero') sizeTo(wrapper.clientWidth, wrapper.clientHeight);
    }).observe(wrapper);
  }
  window.addEventListener('resize', function () {
    if (mode === 'flight') sizeTo(window.innerWidth, window.innerHeight);
  }, { passive: true });

  /* --- Intro: only when the section is actually seen --- */
  var introDone = reduceMotion;
  var introT = 0;
  function beginIntro() {
    if (introDone) return;
    introDone = true;
    introT = clockTime;
    tgt.theta = 0.35;
    tgt.phi = 1.22;
    tgt.radius = heroFit();
    tgt.look.set(0, 2, 0);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { beginIntro(); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(wrapper);
  } else {
    beginIntro();
  }

  /* --- Render loop --- */
  var tmpV = new THREE.Vector3();

  function frame(forceDt) {
    loopStats.frames++;
    /* requestAnimationFrame passes a timestamp as the first argument — never
       let it reach dt. (It used to spin the galaxy ~1000x too fast.) */
    requestAnimationFrame(function () { frame(); });
    var dt = forceDt !== undefined ? forceDt : Math.min(clock.getDelta(), 0.05);
    if (dt <= 0) loopStats.skipped++;
    loopStats.lastDt = dt;
    clockTime += dt;
    var t = clockTime;

    var inView = mode === 'flight' || wrapper.getBoundingClientRect().bottom > 0;
    if (!inView || document.hidden) { loopStats.skippedHidden++; return; }

    /* hold progress */
    var holdAmt = 0;
    if (hold.active) {
      var p = (performance.now() - hold.start) / HOLD_MS;
      holdAmt = Math.min(1, p);
      if (p >= 1) {
        cancelHold();
        enterFlight();
      } else {
        hrFg.style.strokeDashoffset = HR_C * (1 - p);
      }
    }
    shipBall.hullMat.uniforms.hold.value += (holdAmt - shipBall.hullMat.uniforms.hold.value) * (1 - Math.exp(-dt * 9));

    /* camera damping */
    var k = 1 - Math.exp(-dt * 4.6);
    view.theta += (tgt.theta - view.theta) * k;
    view.phi   += (tgt.phi   - view.phi)   * k;
    view.radius+= (tgt.radius- view.radius)* k;
    view.look.lerp(tgt.look, k);
    if (mode === 'hero' && !reduceMotion && !follow) tgt.theta += dt * 0.045;

    /* focus tracking */
    if (follow) {
      follow.getWorldPosition(tmpV);
      tgt.look.copy(tmpV);
      /* the Reserve carries a tall standard — give it headroom */
      if (follow === ship) tgt.look.y += 2.6;
    }

    var r = view.radius, cp = Math.sin(view.phi), sp = Math.cos(view.phi);
    camera.position.set(
      view.look.x + r * cp * Math.sin(view.theta),
      view.look.y + r * sp,
      view.look.z + r * cp * Math.cos(view.theta)
    );
    camera.lookAt(view.look);

    /* moving HUD detection: labels/hint fade while camera travels */
    var camSpeed = camera.position.distanceTo(prevPos) / dt;
    prevPos.copy(camera.position);
    if (camSpeed > 0.002) overlay.classList.add('moving');
    else if (camSpeed < 0.0005) overlay.classList.remove('moving');

    /* galaxy retract */
    var sk = 1 - Math.exp(-dt * 3);
    galaxy.scale.setScalar(galaxy.scale.x + (scaleTarget - galaxy.scale.x) * sk);

    /* mothership motion */
    ship.rotation.y += dt * 0.05;
    shipBall.hullMat.uniforms.time.value = t;
    shipBall.coreMat.uniforms.time.value = t;
    halo.material.opacity = 0.26 + Math.sin(t * 0.8) * 0.05;
    coreLight.intensity = 1.4 + Math.sin(t * 1.1) * 0.18;

    /* the G standard and its flame face the traveller without tipping over */
    var yaw = Math.atan2(camera.position.x, camera.position.z);
    shipBall.gEmblem.rotation.y = yaw;
    var fl = shipBall.flame;
    var fu = fl.mat.uniforms;
    fu.time.value = t;
    var camLen = Math.hypot(camera.position.x, camera.position.z) || 1;
    var offX = camera.position.x / camLen * 0.36;
    var offZ = camera.position.z / camLen * 0.36;
    for (var c = 0; c < fl.cards.length; c++) {
      fl.cards[c].rotation.y = yaw;
      fl.cards[c].position.x = offX;
      fl.cards[c].position.z = offZ;
    }
    /* warm light breathes at the same three frequencies as the fire */
    fl.glow.material.opacity = 0.18 + 0.05 * Math.sin(t * fu.flickMid.value + 0.7);
    fl.light.intensity = 2.35 + 0.22 * Math.sin(t * fu.flickMid.value)
      + 0.12 * Math.sin(t * fu.flickFast.value + 1.1);
    fl.bounce.intensity = 0.95 + 0.18 * Math.sin(t * fu.swayMid.value + 1.9);
    /* embers: advected upward, slowing with drag, curling as they cool */
    for (var e = 0; e < fl.seeds.length; e++) {
      var sd = fl.seeds[e];
      sd.y += dt * sd.s * (0.34 - 0.12 * sd.y);
      if (sd.y > 1) sd.y -= 1;
      var spread = sd.r * (0.38 + sd.y * 1.55);
      var ph = sd.a + sd.y * 2.2 + Math.sin(t * 0.6 + sd.a) * 0.12;
      fl.pos[e * 3]     = Math.cos(ph) * spread;
      fl.pos[e * 3 + 1] = 5.45 + sd.y * 5.25;
      fl.pos[e * 3 + 2] = Math.sin(ph) * spread;
    }
    fl.attr.needsUpdate = true;

    /* planets: orbit, spin, intro pop */
    for (var i = 0; i < planets.length; i++) {
      var m = planets[i];
      var u = m.userData;
      if (!u.R) u.R = ringRadius(m);
      var ang = u.angle + u.speed * t;
      m.position.set(Math.cos(ang) * u.R, 0, Math.sin(ang) * u.R);
      m.rotation.y = t * u.spin + u.angle;

      var delay = 0.2 + i * 0.035;
      var pop = introDone ? 1 : Math.max(0, Math.min(1, (t - introT - delay) / 0.7));
      pop = pop * pop * (3 - 2 * pop);
      var target = u.size * Math.max(0.0001, pop);
      m.scale.setScalar(m.scale.x + (target - m.scale.x) * (1 - Math.exp(-dt * 7)));

      /* hover glow */
      var hT = (m === hovered) ? 1.15 : (m.material.emissiveMap ? 0.65 : 0);
      m.material.emissiveIntensity += (hT - m.material.emissiveIntensity) * (1 - Math.exp(-dt * 8));
    }

    /* spokes */
    for (var s = 0; s < planets.length; s++) {
      planets[s].getWorldPosition(tmpV);
      spokePos[s*6]   = tmpV.x * 0.06;
      spokePos[s*6+1] = tmpV.y * 0.06;
      spokePos[s*6+2] = tmpV.z * 0.06;
      spokePos[s*6+3] = tmpV.x;
      spokePos[s*6+4] = tmpV.y;
      spokePos[s*6+5] = tmpV.z;
    }
    spokeGeo.attributes.position.needsUpdate = true;
    spokes.material.opacity = 0.14 + Math.sin(t * 0.8) * 0.04;

    dust.rotation.y += dt * 0.008;
    stars.rotation.y += dt * 0.002;

    /* free fly */
    flyFrame(dt);

    /* dossier: typewriter while focused */
    if (dCurrent && follow) {
      dPrintLen += dt * 8.5;
      if (dPrintLen > dText.length) dPrintLen = dText.length;
      dNameEl.textContent = dText.slice(0, Math.floor(dPrintLen));
      if (!dNameDone && dPrintLen >= dText.length) {
        dNameDone = true;
        dossierSet(0, dossierStash[0]); dossierSet(1, dossierStash[1]); dossierSet(2, dPrivacyAns); dossierSet(3, dossierStash[2]);
        var info = dossierStaticInfo(dCurrent);
        dBlurbEl.textContent = info.blurb;
        dossierEl.classList.add('has-name');
        dInAt = t + 0.5;
      }
      if (dInAt && t >= dInAt) {
        var n = Math.min(dRows.length, (t - dInAt) / 0.07);
        for (var ri = 0; ri < n; ri++) revealRow(3 + ri);
      }
    }

    /* labels in flight mode, overview only */
    var showLabels = mode === 'flight' && !follow && view.radius > flightFit() * 0.8;
    var w = window.innerWidth, h = window.innerHeight;
    for (var li = 0; li < planets.length; li++) {
      var el = planets[li].userData.label;
      if (!showLabels) { el.style.display = 'none'; continue; }
      planets[li].getWorldPosition(tmpV);
      tmpV.project(camera);
      if (tmpV.z > 1 || tmpV.z < -1) { el.style.display = 'none'; continue; }
      el.style.display = 'block';
      el.style.left = ((tmpV.x * 0.5 + 0.5) * w) + 'px';
      el.style.top = ((-tmpV.y * 0.5 + 0.5) * h) + 'px';
    }

    renderer.render(scene, camera);
  }

  /* ring radius lookup — planets are children of tilted ring groups */
  function ringRadius(mesh) {
    for (var g = 0; g < ringGroups.length; g++) {
      if (ringGroups[g].children.indexOf(mesh) !== -1) return RINGS[g].radius;
    }
    return 14;
  }

  /* tuning + test handle */
  var loopStats = { skipped: 0, skippedHidden: 0, lastDt: 0, frames: 0 };
  window.__galaxy = {
    planets: planets,
    camera: camera,
    mode: function () { return mode; },
    loop: function () { return loopStats; },
    follow: function () { return follow; },
    dossier: function () { return {
      dCurrent: !!dCurrent,
      dText: dText,
      dPrintLen: dPrintLen,
      dNameDone: dNameDone,
      nameText: dNameEl ? dNameEl.textContent : null,
      blurbText: dBlurbEl ? dBlurbEl.textContent.slice(0, 40) : null,
      rows: dRows ? dRows.map(function (r) { return r.val.textContent; }) : null
    }; },
    enterFlight: enterFlight,
    exitFlight: exitFlight,
    tick: function (dt) { frame(typeof dt === 'number' && dt > 0 && dt <= 0.05 ? dt : undefined); },
    view: function () { return { theta: view.theta, phi: view.phi, radius: view.radius, look: view.look.toArray() }; },
    tgt: function () { return { theta: tgt.theta, phi: tgt.phi, radius: tgt.radius, look: tgt.look.toArray() }; },
    scale: function () { return galaxy.scale.x; }
  };

  frame();
})();

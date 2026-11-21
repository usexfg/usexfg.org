/*  Fuego Reserve — HEAT 3D Wood Relief
    Maison de XFG: the HΞΔŦ copy logo on the Heat page, turned into a
    high-detail dark-wood relief. Bronze-gold letters, stucco-ruled walls,
    a stained-wood slab — the wordmark as a 3D furniture-grade model.
    Reuses the vendored Three.js (js/vendor/three.min.js). Falls quiet if
    WebGL is unavailable: the original SVG stays as the plain-text version.
*/
(function () {
  'use strict';

  var host = document.querySelector('.heat-title-svg');
  if (!host) return;
  var legacySvg = host.querySelector('svg');
  if (legacySvg) legacySvg.style.display = 'none';

  var canvas = document.createElement('canvas');
  canvas.className = 'heat-wood-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'HEAT');
  host.appendChild(canvas);

  var ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!ctx) { canvas.remove(); return; }

  var W;
  function resize() {
    W = Math.max(100, Math.min(canvas.offsetWidth || 460, 920));
    var H = W * 0.1956;
    canvas.width = W * 2;
    canvas.height = Math.round(H * 2);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }
  resize();

  /* ---------- procedural dark-wood panel + stucco wall ---------- */
  function makeWoodTexture(w, h, seed) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    var rnd = (function (s) {
      return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    })(seed || 7);
    var g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#7D614A');
    g.addColorStop(0.4, '#5C4A32');
    g.addColorStop(0.6, '#544026');
    g.addColorStop(1, '#44331E');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data;
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.round((rnd() - 0.5) * 42);
      var s = Math.round((rnd() - 0.5) * 6);
      d[i]   = Math.min(255, Math.max(0, d[i] + v + s));
      d[i+1] = Math.min(255, Math.max(0, d[i+1] + v * 0.9 + s));
      d[i+2] = Math.min(255, Math.max(0, d[i+2] + v * 0.7 + s * 0.5));
      d[i+3] = 255;
    }
    x.putImageData(x.getImageData(0, 0, w, h), 0, 0);
    return new THREE.CanvasTexture(c);
  }

  function makeStuccoPanelTexture() {
    var c = document.createElement('canvas');
    c.width = 128; c.height = 64;
    var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, 64);
    g.addColorStop(0, '#1C140D');
    g.addColorStop(1, '#3D2F1F');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 64);
    var d = x.getImageData(0, 0, 128, 64).data;
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.round((Math.sin(d[i / 4] * 0.37 + d[i / 4 + 1] * 0.21) * 0.5 + 0.5) * 30 - 15);
      d[i] += v; d[i + 1] += v * 0.85; d[i + 2] += v * 0.7;
      d[i + 3] = 255;
    }
    x.putImageData(x.getImageData(0, 0, 128, 64), 0, 0);
    return new THREE.CanvasTexture(c);
  }

  /* ---------- letters: exact geometry from the SVG wordmark ---------- */
  /* viewBox is 460x100, the letters read at height 90 (y 5..95). */
  function rectShape(r) {
    var s = new THREE.Shape();
    s.moveTo(r[0], r[1]);
    s.lineTo(r[0] + r[2], r[1]);
    s.lineTo(r[0] + r[2], r[1] + r[3]);
    s.lineTo(r[0], r[1] + r[3]);
    s.closePath();
    return s;
  }
  function triShape(pts) {
    var s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    s.lineTo(pts[1][0], pts[1][1]);
    s.lineTo(pts[2][0], pts[2][1]);
    s.closePath();
    s.holes = [holeTriangle()];
    return s;
  }
  /* the SVG draws Δ with an inner triangle — letter with a v-swallow */
  function holeTriangle() {
    var p = new THREE.Path();
    p.moveTo(268, 83);
    p.lineTo(289, 35);
    p.lineTo(310, 83);
    p.closePath();
    return p;
  }

  var LETTER_SHAPES = [
    [ rectShape([15, 5, 14, 90]),  rectShape([75, 5, 14, 90]), rectShape([29, 43, 46, 14]) ],  /* H */
    [ rectShape([139, 5, 60, 14]), rectShape([147, 43, 44, 14]), rectShape([139, 81, 60, 14]) ], /* Ξ */
    [ triShape([[249, 95], [289, 5], [329, 95]]) ],                                             /* Δ */
    [ rectShape([379, 5, 66, 14]), rectShape([405, 19, 14, 76]), rectShape([381, 41, 62, 13]) ]  /* Ŧ */
  ];

  var LETTER_SCALE = 1.9 / 90;        /* 90 units of SVG height -> 1.9 units of world height */

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(62, 1, 0.05, 60);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputEncoding = THREE.sRGBEncoding;

  var GOLD = new THREE.Color(0xD4A66F);
  var GOLD_DARK = new THREE.Color(0xB3761A);

  var wood = makeWoodTexture(1024, 256, 7);
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;

  var woodSlab = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.42, 1.6),
    new THREE.MeshPhysicalMaterial({
      map: wood, roughness: 0.86, metalness: 0.1, color: 0x5C4A32, side: THREE.DoubleSide
    })
  );
  woodSlab.position.set(0.32, -0.26, 0);
  scene.add(woodSlab);

  var stucco = makeStuccoPanelTexture();
  var wall = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 1.2, 1),
    new THREE.MeshPhysicalMaterial({
      map: stucco, roughness: 1.0, metalness: 0, color: 0x3D2F1F,
      transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide
    })
  );
  wall.rotation.x = -Math.PI / 8;
  wall.position.set(0.2, 0.62, -0.9);
  scene.add(wall);

  var goldMat = new THREE.MeshPhysicalMaterial({
    color: GOLD, roughness: 0.18, metalness: 0.3, emissive: GOLD_DARK, emissiveIntensity: 0.45,
    side: THREE.DoubleSide
  });

  var group = new THREE.Group();
  scene.add(group);
  group.scale.setScalar(LETTER_SCALE);

  var meshes = [];
  LETTER_SHAPES.forEach(function (shapes) {
    shapes.forEach(function (shape) {
      var geom = new THREE.ExtrudeGeometry(shape, { depth: 0.42, bevelEnabled: false, curveSegments: 8 });
      var m = new THREE.Mesh(geom, goldMat);
      /* place each stroke at its own center so strokes spread like the SVG */
      geom.computeBoundingBox();
      var b = geom.boundingBox;
      m.position.set((b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2, 0);
      group.add(m);
      meshes.push(m);
    });
  });

  /* union bbox in SVG units, then center the whole wordmark at the origin */
  var bmin = new THREE.Vector3(Infinity, Infinity, Infinity);
  var bmax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  meshes.forEach(function (m) {
    bmin.min(m.geometry.boundingBox.min);
    bmax.max(m.geometry.boundingBox.max);
  });
  group.position.x = -(bmin.x + (bmax.x - bmin.x) / 2);
  group.position.y = -(bmin.y + (bmax.y - bmin.y) / 2);

  /* Drop the letters so their bottom edge rests on the slab top. */
  var worldMinY = (group.position.y + bmin.y) * LETTER_SCALE;
  woodSlab.geometry.computeBoundingBox();
  var slabTop = woodSlab.position.y + woodSlab.geometry.boundingBox.max.y;
  group.position.y += slabTop - worldMinY + 0.10;

  var light = new THREE.AmbientLight(0xFFF3E0, 1.5);
  scene.add(light);
  var key = new THREE.DirectionalLight(0xFFF3E0, 2.2);
  key.position.set(2.4, 5, 3.2);
  scene.add(key);
  var back = new THREE.DirectionalLight(0xB88648, 0.35);
  back.position.set(-1, 0.5, -1);
  scene.add(back);

  /* frame the letters: geometry bb + group transform = world bb */
  var wMin = bmin.clone().multiplyScalar(LETTER_SCALE).add(group.position);
  var wMax = bmax.clone().multiplyScalar(LETTER_SCALE).add(group.position);
  var center = wMin.add(wMax).multiplyScalar(0.5);
  var bs = wMax.clone().sub(wMin);
  camera.aspect = 1;
  camera.fov = 78;
  camera.position.copy(center).add(new THREE.Vector3(0, bs.y * 0.5 + 0.35, 7));
  camera.lookAt(center);

  resize();
  var lastSize = { w: -1, h: -1 };
  var clock = new THREE.Clock();
  function frame() {
    var w = Math.round(canvas.offsetWidth);
    var h = Math.round(w * 0.1956);
    if (Math.abs(w - W) > 0.5 || Math.abs(h - lastSize.h) > 1) {
      resize();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    renderer.setSize(w, h, false);
    renderer.render(scene, camera);
    lastSize = { w: w, h: h };
    requestAnimationFrame(frame);
  }
  frame();

  /* expose handle for future tuning */
  window.__heatWood = {
    scene: scene, group: group, meshes: meshes, renderer: renderer, resize: resize,
    camera: camera, goldMat: goldMat, bbMin: bmin, bbMax: bmax
  };
})();

/*  Fuego Reserve — HEAT 3D Wood Relief
    The HΞΔŦ copy logo as a 3D furniture-grade wood plaque: the original SVG
    wordmark rendered at high resolution and set into a mahogany slab, with a
    stucco-ruled wall behind for depth. If WebGL fails, the original SVG stays.
*/
(function () {
  'use strict';

  var host = document.querySelector('.heat-title-svg');
  if (!host) return;
  var legacySvg = host.querySelector('svg');
  if (!legacySvg) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'heat-wood-canvas';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'HEAT');
  host.appendChild(canvas);

  var ctx = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!ctx) { canvas.remove(); return; }  /* SVG remains visible as fallback */

  var W;
  function resize() {
    W = Math.max(100, Math.min(canvas.offsetWidth || 460, 920));
    var H = W * 0.1956;
    canvas.width = Math.round(W * 2);
    canvas.height = Math.round(H * 2);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }
  resize();

  /* ---------- procedural dark-wood + stucco textures ---------- */
  function makeWoodTexture(w, h, seed) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var x = c.getContext('2d');
    var rnd = (function (s) {
      return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    })(seed || 7);
    var g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#5C4630');
    g.addColorStop(0.45, '#3A2A1A');
    g.addColorStop(0.55, '#2E2013');
    g.addColorStop(1, '#1B130C');
    x.fillStyle = g;
    x.fillRect(0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data;
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.round((rnd() - 0.5) * 46);
      d[i]   = Math.min(255, Math.max(0, d[i] + v));
      d[i+1] = Math.min(255, Math.max(0, d[i+1] + v * 0.85));
      d[i+2] = Math.min(255, Math.max(0, d[i+2] + v * 0.65));
      d[i+3] = 255;
    }
    x.putImageData(x.getImageData(0, 0, w, h), 0, 0);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function makeStuccoTexture() {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    var x = c.getContext('2d');
    var g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, '#1A120C');
    g.addColorStop(1, '#302114');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 128);
    var d = x.getImageData(0, 0, 256, 128).data;
    for (var i = 0; i < d.length; i += 4) {
      var n = Math.round((Math.sin(d[i / 4] * 0.37 + d[i / 4 + 1] * 0.21) * 0.5 + 0.5) * 26 - 13);
      d[i] += n; d[i + 1] += n * 0.8; d[i + 2] += n * 0.6; d[i + 3] = 255;
    }
    x.putImageData(x.getImageData(0, 0, 256, 128), 0, 0);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.05, 60);
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  /* ---------- the plaque ---------- */
  var wood = makeWoodTexture(1024, 256, 7);
  var plaque = new THREE.Mesh(
    new THREE.BoxGeometry(4.8, 1.12, 0.22),
    new THREE.MeshStandardMaterial({ map: wood, color: 0x6A5238, roughness: 0.78, metalness: 0.06 })
  );
  scene.add(plaque);

  /* thin darker back lip — furniture-grade edge */
  var lip = new THREE.Mesh(
    new THREE.BoxGeometry(4.94, 1.26, 0.10),
    new THREE.MeshStandardMaterial({ color: 0x24190F, roughness: 0.85, metalness: 0.05 })
  );
  lip.position.z = -0.13;
  scene.add(lip);

  var wall = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 2.2),
    new THREE.MeshStandardMaterial({
      map: makeStuccoTexture(), color: 0x4A3724, roughness: 1, metalness: 0,
      transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false
    })
  );
  wall.position.z = -0.85;
  scene.add(wall);

  scene.add(new THREE.AmbientLight(0xFFF3E0, 0.9));
  var key = new THREE.DirectionalLight(0xFFF3E0, 1.25);
  key.position.set(2, 3, 4);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0xC08A45, 0.3);
  rim.position.set(-2, -1, -2);
  scene.add(rim);

  /* ---------- the wordmark: original SVG, high-res, upright ---------- */
  var svgString = new XMLSerializer().serializeToString(legacySvg);
  if (svgString.indexOf('xmlns=') === -1) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  var img = new Image();
  img.onload = function () {
    var c = document.createElement('canvas');
    c.width = 1840; c.height = 400;
    var x = c.getContext('2d');
    x.drawImage(img, 0, 0, c.width, c.height);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var face = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 1.0),
      new THREE.MeshStandardMaterial({
        map: tex, transparent: true, alphaTest: 0.02, roughness: 0.3,
        metalness: 0.25, side: THREE.DoubleSide, depthWrite: false
      })
    );
    face.position.z = 0.12;
    scene.add(face);
    legacySvg.style.display = 'none';  /* only hide once the 3D version is ready */
  };
  img.onerror = function () { /* leave the original SVG visible */ };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

  camera.position.set(0, 0, 1.62);
  camera.lookAt(0, 0, 0);
  resize();

  function frame() {
    requestAnimationFrame(function () { frame(); });
    var w = Math.round(canvas.offsetWidth);
    var h = Math.round(w * 0.1956);
    if (Math.abs(w - W) > 0.5) resize();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.render(scene, camera);
  }
  frame();

  window.__heatWood = { scene: scene, camera: camera, renderer: renderer, resize: resize };
})();

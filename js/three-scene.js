/*  Fuego Reserve — Particle Engine
    Maison de XFG: restrained. Golden dust in candlelight.
    Fewer, slower, quieter. Presence not performance.
*/
(function () {
  'use strict';

  var canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.z = 70;

  /* Soft circular sprite */
  function makeSprite() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0,    'rgba(255,255,255,1)');
    g.addColorStop(0.4,  'rgba(255,255,255,0.6)');
    g.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  var sprite = makeSprite();

  /* Palette — gold dominant, almost nothing else */
  var GOLD   = new THREE.Color(0xC8A96E);
  var GOLD_L = new THREE.Color(0xDFC28E);
  var GOLD_D = new THREE.Color(0x9A7E52);
  var WHITE  = new THREE.Color(0xFFFDF5);
  var EMBER  = new THREE.Color(0xC8703A);

  /* 180 primary drifters */
  var COUNT = 180;
  var pos = new Float32Array(COUNT * 3);
  var col = new Float32Array(COUNT * 3);
  var vel = [];

  function rng(a, b) { return a + Math.random() * (b - a); }

  for (var i = 0; i < COUNT; i++) {
    pos[i*3]   = rng(-110, 110);
    pos[i*3+1] = rng(-75, 75);
    pos[i*3+2] = rng(-25, 15);

    var r = Math.random();
    var c = r < 0.45 ? GOLD : r < 0.70 ? GOLD_L : r < 0.86 ? GOLD_D : r < 0.96 ? WHITE : EMBER;
    col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;

    vel.push({
      x: rng(-0.007, 0.007),
      y: rng(-0.005, 0.005),
    });
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  var mat = new THREE.PointsMaterial({
    size: 2.4,
    map: sprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.28,
    alphaTest: 0.01,
    depthWrite: false,
    sizeAttenuation: true,
  });

  scene.add(new THREE.Points(geo, mat));

  /* 80 distant dust motes */
  var DUST = 80;
  var dp = new Float32Array(DUST * 3);
  var dc = new Float32Array(DUST * 3);
  var dv = [];
  for (var j = 0; j < DUST; j++) {
    dp[j*3]   = rng(-130, 130);
    dp[j*3+1] = rng(-90, 90);
    dp[j*3+2] = rng(-60, -15);
    dc[j*3] = GOLD.r; dc[j*3+1] = GOLD.g; dc[j*3+2] = GOLD.b;
    dv.push({ x: rng(-0.003, 0.003), y: rng(-0.002, 0.002) });
  }
  var dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  dg.setAttribute('color',    new THREE.BufferAttribute(dc, 3));
  scene.add(new THREE.Points(dg, new THREE.PointsMaterial({
    size: 1.1, map: sprite, vertexColors: true, transparent: true,
    opacity: 0.10, alphaTest: 0.01, depthWrite: false, sizeAttenuation: true,
  })));

  /* Mouse — very gentle */
  var mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', function(e) {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });

  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    for (var i = 0; i < COUNT; i++) {
      pos[i*3]   += vel[i].x;
      pos[i*3+1] += vel[i].y;
      if (pos[i*3]   >  112) pos[i*3]   = -112;
      if (pos[i*3]   < -112) pos[i*3]   =  112;
      if (pos[i*3+1] >  77)  pos[i*3+1] = -77;
      if (pos[i*3+1] < -77)  pos[i*3+1] =  77;
    }
    geo.attributes.position.needsUpdate = true;

    for (var j = 0; j < DUST; j++) {
      dp[j*3]   += dv[j].x;
      dp[j*3+1] += dv[j].y;
      if (dp[j*3]   >  132) dp[j*3]   = -132;
      if (dp[j*3]   < -132) dp[j*3]   =  132;
      if (dp[j*3+1] >  92)  dp[j*3+1] = -92;
      if (dp[j*3+1] < -92)  dp[j*3+1] =  92;
    }
    dg.attributes.position.needsUpdate = true;

    /* Barely perceptible parallax */
    tx += (mx * 2 - tx) * 0.025;
    ty += (my * 1.5 - ty) * 0.025;
    camera.position.x += (tx - camera.position.x) * 0.03;
    camera.position.y += (-ty - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
})();

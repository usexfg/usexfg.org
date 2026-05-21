(function () {
  'use strict';

  if (!window.WebGLRenderingContext) return;

  var reduceMotion = false;
  if (typeof window.matchMedia === 'function') {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  var isMobile = window.innerWidth < 768;
  var particleCount = isMobile ? 60 : 160;

  var canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  var vertexShader = [
    'attribute float size;',
    'attribute vec3 customColor;',
    'varying vec3 vColor;',
    'void main() {',
    '  vColor = customColor;',
    '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
    '  gl_PointSize = size * (180.0 / -mvPosition.z);',
    '  gl_Position = projectionMatrix * mvPosition;',
    '}'
  ].join('\n');

  var fragmentShader = [
    'varying vec3 vColor;',
    'void main() {',
    '  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;',
    '  if (d > 1.0) discard;',
    '  float alpha = exp(-d * 3.4) * 0.72;',
    '  gl_FragColor = vec4(vColor, alpha);',
    '}'
  ].join('\n');

  var particles = null;

  function initParticles() {
    var geometry = new THREE.BufferGeometry();

    var positions = new Float32Array(particleCount * 3);
    var velocities = new Float32Array(particleCount * 3);
    var sizes = new Float32Array(particleCount);
    var colors = new Float32Array(particleCount * 3);

    for (var i = 0; i < particleCount; i++) {
      var i3 = i * 3;

      positions[i3]     = (Math.random() - 0.5) * 4;
      positions[i3 + 1] = (Math.random() - 0.5) * 14 - 2;
      positions[i3 + 2] = (Math.random() - 0.5) * 3;

      velocities[i3]     = (Math.random() - 0.5) * 0.03;
      velocities[i3 + 1] = Math.random() * 0.07 + 0.04;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.03;

      sizes[i] = Math.random() * 0.09 + 0.04;

      var warmth = Math.random();
      colors[i3]     = 1.0;
      colors[i3 + 1] = 0.22 + warmth * 0.38;
      colors[i3 + 2] = warmth * 0.10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));

    var material = new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    particles = new THREE.Points(geometry, material);
    particles.userData = { velocities: velocities };
    scene.add(particles);
  }

  var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

  if (!reduceMotion && !isMobile) {
    document.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  var time = 0;
  var isVisible = true;

  document.addEventListener('visibilitychange', function () {
    isVisible = !document.hidden;
  });

  function animate() {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    time += 0.016;

    if (particles) {
      var positions = particles.geometry.attributes.position.array;
      var velocities = particles.userData.velocities;
      var spd = reduceMotion ? 0.05 : 0.8;

      for (var i = 0; i < particleCount; i++) {
        var i3 = i * 3;

        var gust = Math.floor(i / 10);
        var g = gust * 2.7;
        var windX = Math.sin(time * 2.5 + g) * 0.006
                  + Math.sin(time * 3.7 + g * 1.3) * 0.004;
        var windZ = Math.cos(time * 2.5 + g) * 0.006
                  + Math.cos(time * 1.9 + g * 1.7) * 0.004;

        positions[i3]     += (velocities[i3] + windX) * spd;
        positions[i3 + 1] += velocities[i3 + 1] * spd;
        positions[i3 + 2] += (velocities[i3 + 2] + windZ) * spd;

        if (!reduceMotion && Math.random() < 0.002) {
          positions[i3]     += (Math.random() - 0.5) * 0.6;
          positions[i3 + 1] += Math.random() * 0.5;
          positions[i3 + 2] += (Math.random() - 0.5) * 0.6;
        }

        if (positions[i3 + 1] > 4) {
          positions[i3]     = (Math.random() - 0.5) * 4;
          positions[i3 + 1] = -6;
          positions[i3 + 2] = (Math.random() - 0.5) * 3;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;

      if (!reduceMotion) {
        particles.rotation.y = Math.sin(time * 0.3) * 0.04;
      }
    }

    if (!reduceMotion && !isMobile) {
      targetX += (mouseX - targetX) * 0.02;
      targetY += (mouseY - targetY) * 0.02;
      camera.position.x = targetX * 0.3;
      camera.position.y = targetY * 0.3;
      camera.lookAt(scene.position);
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }

  window.addEventListener('resize', onResize);

  initParticles();
  animate();
})();

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  constructor(containerElement) {
    this.container = containerElement;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x080914, 0.008);

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 30, 70);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 500;

    this.autoRotate = false;

    this.initLights();
    this.initEnvironment();
    this.initResizeListener();

    this.renderCallbacks = [];
    this.animate();
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 1.8);
    dirLight1.position.set(50, 80, 50);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight2.position.set(-50, -30, -50);
    this.scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xff5e7e, 2, 100);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);
    this.trackingLight = pointLight;
  }

  initEnvironment() {
    // Glowing Grid floor
    const gridHelper = new THREE.GridHelper(200, 50, 0x6366f1, 0x1e293b);
    gridHelper.position.y = -0.5;
    gridHelper.material.opacity = 0.35;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    // Starfield Particle Background
    const starCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const colorOptions = [
      new THREE.Color(0x6366f1),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xffffff)
    ];

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = Math.random() * 400 - 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;

      const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.7
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  initResizeListener() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  addRenderCallback(cb) {
    this.renderCallbacks.push(cb);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.autoRotate) {
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1.0;
    } else {
      this.controls.autoRotate = false;
    }

    this.controls.update();

    if (this.starfield) {
      this.starfield.rotation.y += 0.0002;
    }

    const delta = 0.016;
    for (const cb of this.renderCallbacks) {
      cb(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  resetCamera(targetPos = new THREE.Vector3(0, 0, 0), camPos = new THREE.Vector3(0, 30, 70)) {
    this.controls.target.copy(targetPos);
    this.camera.position.copy(camPos);
    this.controls.update();
  }
}

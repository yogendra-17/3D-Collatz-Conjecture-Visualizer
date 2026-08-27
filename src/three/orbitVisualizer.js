import * as THREE from 'three';

export class OrbitVisualizer {
  constructor(sceneManager) {
    this.sm = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.nodes = [];
    this.points = [];
    this.sequenceData = null;
    this.currentStep = 0;
    this.isLogScale = false;

    // Glowing Pulse Particle
    this.pulseMesh = this.createPulseParticle();
    this.group.add(this.pulseMesh);
    this.pulseMesh.visible = false;
  }

  createPulseParticle() {
    const geo = new THREE.SphereGeometry(1.2, 16, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const mesh = new THREE.Mesh(geo, mat);

    // Inner glow halo
    const haloGeo = new THREE.SphereGeometry(2.4, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    mesh.add(halo);

    return mesh;
  }

  build(sequenceData, isLogScale = false) {
    this.clear();
    this.sequenceData = sequenceData;
    this.isLogScale = isLogScale;

    if (!sequenceData || !sequenceData.steps || sequenceData.steps.length === 0) return;

    const steps = sequenceData.steps;
    const totalSteps = steps.length;
    const maxVal = sequenceData.maxVal;

    // Scaling factors
    const xSpacing = Math.max(1.2, Math.min(4.0, 150 / Math.max(totalSteps, 1)));
    const yMaxHeight = 45;

    this.points = [];
    this.nodes = [];

    // Create 3D points
    steps.forEach((stepObj, idx) => {
      const x = (idx - totalSteps / 2) * xSpacing;
      let rawY = stepObj.value;

      let y;
      if (isLogScale) {
        y = (Math.log10(Math.max(1, rawY)) / Math.log10(Math.max(10, maxVal))) * yMaxHeight + 1;
      } else {
        y = (rawY / Math.max(1, maxVal)) * yMaxHeight + 1;
      }

      // Parity Z-displacement to form a 3D ribbon dynamics
      const z = stepObj.isOdd ? 3 : -1;

      const pt = new THREE.Vector3(x, y, z);
      this.points.push(pt);

      // Node Mesh
      const nodeRadius = stepObj.step === 0 || rawY === maxVal || stepObj.step === totalSteps - 1 ? 0.9 : 0.45;
      const geo = new THREE.SphereGeometry(nodeRadius, 16, 16);
      
      const nodeColor = stepObj.isOdd ? 0xff5e7e : 0x06b6d4; // Coral for Odd, Cyan for Even
      const mat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8
      });

      const nodeMesh = new THREE.Mesh(geo, mat);
      nodeMesh.position.copy(pt);
      nodeMesh.userData = { stepData: stepObj, index: idx };
      this.group.add(nodeMesh);
      this.nodes.push(nodeMesh);
    });

    // Create Glowing 3D Tube Curve
    if (this.points.length > 1) {
      const curve = new THREE.CatmullRomCurve3(this.points, false, 'catmullrom', 0.2);
      const tubeGeo = new THREE.TubeGeometry(curve, totalSteps * 4, 0.25, 8, false);

      // Gradient vertex colors for Tube
      const count = tubeGeo.attributes.position.count;
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const progress = i / count;
        const color = new THREE.Color();
        if (progress > 0.9) color.setHex(0x22c55e); // Green ending at 1
        else if (progress < 0.1) color.setHex(0x6366f1); // Indigo start
        else color.setHSL(0.6 + progress * 0.3, 0.9, 0.6);

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      tubeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const tubeMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.3,
        metalness: 0.5,
        emissive: 0x1e1b4b,
        emissiveIntensity: 0.2
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      this.group.add(tubeMesh);
    }

    // Set pulse particle at start
    if (this.points.length > 0) {
      this.pulseMesh.position.copy(this.points[0]);
      this.pulseMesh.visible = true;
    }

    // Focus camera on center of orbit
    const midPoint = this.points[Math.floor(this.points.length / 2)] || new THREE.Vector3(0, 15, 0);
    this.sm.controls.target.copy(midPoint);
    this.sm.camera.position.set(midPoint.x, midPoint.y + 25, midPoint.z + 65);
    this.sm.controls.update();
  }

  setStep(stepIndex) {
    if (!this.points || this.points.length === 0) return;
    const clampedIndex = Math.max(0, Math.min(stepIndex, this.points.length - 1));
    this.currentStep = clampedIndex;

    const targetPos = this.points[clampedIndex];
    this.pulseMesh.position.copy(targetPos);
    this.pulseMesh.visible = true;

    // Highlight node
    this.nodes.forEach((node, idx) => {
      if (idx === clampedIndex) {
        node.scale.set(1.8, 1.8, 1.8);
        node.material.emissiveIntensity = 1.0;
      } else {
        node.scale.set(1, 1, 1);
        node.material.emissiveIntensity = 0.4;
      }
    });

    // Move light
    this.sm.trackingLight.position.copy(targetPos);
  }

  clear() {
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      if (obj === this.pulseMesh) {
        this.group.remove(obj);
        continue;
      }
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      this.group.remove(obj);
    }
    this.group.add(this.pulseMesh);
    this.nodes = [];
    this.points = [];
  }

  setVisible(visible) {
    this.group.visible = visible;
  }
}

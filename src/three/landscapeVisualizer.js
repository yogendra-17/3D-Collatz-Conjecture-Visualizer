import * as THREE from 'three';
import { generateRangeData } from '../math/collatz.js';

export class LandscapeVisualizer {
  constructor(sceneManager) {
    this.sm = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.group.visible = false;
  }

  build(rangeCount = 200, activeN = null) {
    this.clear();

    const rangeData = generateRangeData(rangeCount);
    const cols = Math.ceil(Math.sqrt(rangeCount));

    const maxStoppingTime = Math.max(...rangeData.map(d => d.stoppingTime), 1);

    rangeData.forEach((item, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      const x = (col - cols / 2) * 2.2;
      const z = (row - cols / 2) * 2.2;

      const height = (item.stoppingTime / maxStoppingTime) * 35 + 0.5;

      const geo = new THREE.BoxGeometry(1.6, height, 1.6);
      
      const isActive = activeN === item.n;
      const colorProgress = item.stoppingTime / maxStoppingTime;

      const color = isActive
        ? new THREE.Color(0xff5e7e)
        : new THREE.Color().setHSL(0.6 - colorProgress * 0.5, 0.85, 0.55);

      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: isActive ? 0xff5e7e : color,
        emissiveIntensity: isActive ? 0.8 : 0.2,
        roughness: 0.3,
        metalness: 0.6
      });

      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(x, height / 2, z);
      bar.userData = item;
      this.group.add(bar);
    });

    // Center camera on landscape
    this.sm.controls.target.set(0, 10, 0);
    this.sm.camera.position.set(25, 35, 45);
    this.sm.controls.update();
  }

  clear() {
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      this.group.remove(obj);
    }
  }

  setVisible(visible) {
    this.group.visible = visible;
  }
}

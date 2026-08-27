import * as THREE from 'three';
import { generateCollatzTree } from '../math/collatz.js';

export class TreeVisualizer {
  constructor(sceneManager) {
    this.sm = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.group.visible = false;
  }

  build(activeSequenceSteps = []) {
    this.clear();

    const highlightSet = new Set(activeSequenceSteps.map(s => s.value));
    const treeData = generateCollatzTree(8, highlightSet);

    const nodeMap = new Map();

    // Render Tree Nodes
    treeData.nodes.forEach(node => {
      const isHighlighted = node.isHighlighted;
      const radius = isHighlighted ? 0.8 : 0.4;
      const geo = new THREE.SphereGeometry(radius, 16, 16);

      const color = isHighlighted
        ? 0xff5e7e // Coral highlight for target sequence
        : (node.isEven ? 0x06b6d4 : 0xa855f7); // Cyan / Purple

      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: isHighlighted ? 0.8 : 0.3,
        roughness: 0.3
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(node.x, node.y, node.z);
      mesh.userData = node;
      this.group.add(mesh);
      nodeMap.set(node.id, mesh.position);
    });

    // Render Tree Edges / Connections
    treeData.edges.forEach(edge => {
      const p1 = nodeMap.get(edge.from);
      const p2 = nodeMap.get(edge.to);

      if (p1 && p2) {
        const points = [p1, p2];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const color = edge.isHighlighted ? 0xff5e7e : 0x475569;

        const mat = new THREE.LineBasicMaterial({
          color,
          linewidth: edge.isHighlighted ? 3 : 1,
          transparent: true,
          opacity: edge.isHighlighted ? 0.95 : 0.4
        });

        const line = new THREE.Line(geo, mat);
        this.group.add(line);
      }
    });

    // Target Camera to Root 1
    this.sm.controls.target.set(0, 15, 0);
    this.sm.camera.position.set(0, 20, 45);
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

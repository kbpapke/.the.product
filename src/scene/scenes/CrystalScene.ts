import * as THREE from 'three';

export class CrystalScene {
  scene: THREE.Scene;
  private crystals: THREE.Mesh[] = [];
  private time: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Create crystal geometry
    const crystalGeometry = new THREE.OctahedronGeometry(1, 0);
    const crystalMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffcc,
      shininess: 100,
      specular: 0x666666,
      transparent: true,
      opacity: 0.7
    });

    // Create multiple crystals with better positioning
    for (let i = 0; i < 20; i++) {
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial.clone());
      const radius = 5 + Math.random() * 3;
      const angle = (i / 20) * Math.PI * 2;
      const height = (Math.random() - 0.5) * 8;
      
      crystal.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      crystal.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      crystal.scale.setScalar(0.3 + Math.random() * 0.7);
      this.crystals.push(crystal);
      this.scene.add(crystal);
    }

    // Add lights
    const pointLight = new THREE.PointLight(0x00ffff, 1);
    pointLight.position.set(0, 5, 5);
    this.scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x111111);
    this.scene.add(ambientLight);

    camera.position.z = 10;
  }

  update(time: number) {
    this.time = time;
    this.crystals.forEach((crystal, i) => {
      crystal.rotation.x = time * 0.2 + i * 0.1;
      crystal.rotation.y = time * 0.3 + i * 0.1;
      crystal.position.y = Math.sin(time + i) * 0.5;
      crystal.material.opacity = 0.5 + Math.sin(time * 0.5 + i) * 0.2;
    });
  }

  onResize() {
    // Handle resize if needed
  }
} 
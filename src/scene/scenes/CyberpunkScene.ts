import * as THREE from 'three';

export class CyberpunkScene {
  scene: THREE.Scene;
  private buildings: THREE.Group;
  private neonLights: THREE.Group;
  private particles: THREE.Points;
  private time: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0015);
    this.scene.background = new THREE.Color(0x000000);

    // Create buildings group
    this.buildings = new THREE.Group();
    this.neonLights = new THREE.Group();

    // Generate city buildings
    for (let i = 0; i < 100; i++) {
      const height = 5 + Math.random() * 15;
      const width = 1 + Math.random() * 2;
      const depth = 1 + Math.random() * 2;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshPhongMaterial({
        color: 0x202020,
        emissive: 0x000000,
        specular: 0x111111,
        shininess: 30
      });

      const building = new THREE.Mesh(geometry, material);
      
      // Position buildings in a grid
      const gridSize = 50;
      building.position.set(
        (Math.random() - 0.5) * gridSize,
        height / 2,
        (Math.random() - 0.5) * gridSize
      );

      this.buildings.add(building);

      // Add neon lights to some buildings
      if (Math.random() > 0.7) {
        const neonGeometry = new THREE.BoxGeometry(width + 0.1, 0.1, depth + 0.1);
        const neonMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
          transparent: true,
          opacity: 0.8
        });
        
        const neonLight = new THREE.Mesh(neonGeometry, neonMaterial);
        neonLight.position.copy(building.position);
        neonLight.position.y = Math.random() * height;
        this.neonLights.add(neonLight);
      }
    }

    this.scene.add(this.buildings);
    this.scene.add(this.neonLights);

    // Add rain particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = Math.random() * 50;
      positions[i + 2] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x55aaff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x111111);
    this.scene.add(ambientLight);

    // Add spotlights for dramatic lighting
    const colors = [0xff00ff, 0x00ffff, 0xff0066];
    colors.forEach((color, i) => {
      const spotlight = new THREE.SpotLight(color, 2);
      const angle = (i / colors.length) * Math.PI * 2;
      spotlight.position.set(
        Math.cos(angle) * 30,
        20,
        Math.sin(angle) * 30
      );
      spotlight.angle = 0.5;
      spotlight.penumbra = 0.5;
      spotlight.decay = 1;
      spotlight.distance = 100;
      this.scene.add(spotlight);
    });

    // Position camera
    camera.position.set(20, 15, 20);
  }

  update(time: number) {
    this.time = time;

    // Animate neon lights
    this.neonLights.children.forEach((light, i) => {
      if (light.material instanceof THREE.MeshBasicMaterial) {
        light.material.opacity = 0.5 + Math.sin(time * 2 + i) * 0.3;
      }
    });

    // Animate rain
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= 0.1; // Rain falling speed
      if (positions[i + 1] < 0) {
        positions[i + 1] = 50; // Reset to top when particles reach bottom
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;

    // Rotate scene slightly
    this.buildings.rotation.y = Math.sin(time * 0.1) * 0.1;
    this.neonLights.rotation.y = this.buildings.rotation.y;
  }

  onResize() {
    // Handle resize if needed
  }
} 
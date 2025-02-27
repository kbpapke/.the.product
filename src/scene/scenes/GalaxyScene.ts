import * as THREE from 'three';

export class GalaxyScene {
  scene: THREE.Scene;
  private stars: THREE.Points;
  private galaxyCore: THREE.Points;
  private time: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.001);
    this.scene.background = new THREE.Color(0x000000);

    // Create stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 10000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      
      starPositions[i] = radius * Math.sin(theta) * Math.cos(phi);
      starPositions[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
      starPositions[i + 2] = radius * Math.cos(theta);
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.7, 0.5 + Math.random() * 0.5);
      starColors[i] = color.r;
      starColors[i + 1] = color.g;
      starColors[i + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);

    // Create galaxy core
    const coreGeometry = new THREE.BufferGeometry();
    const coreCount = 5000;
    const corePositions = new Float32Array(coreCount * 3);
    const coreColors = new Float32Array(coreCount * 3);

    for (let i = 0; i < coreCount * 3; i += 3) {
      const radius = Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      
      corePositions[i] = radius * Math.cos(theta);
      corePositions[i + 1] = (Math.random() - 0.5) * 2;
      corePositions[i + 2] = radius * Math.sin(theta);
      
      const color = new THREE.Color();
      color.setHSL(0.6, 0.8, 0.6 + Math.random() * 0.4);
      coreColors[i] = color.r;
      coreColors[i + 1] = color.g;
      coreColors[i + 2] = color.b;
    }

    coreGeometry.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
    coreGeometry.setAttribute('color', new THREE.BufferAttribute(coreColors, 3));

    const coreMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.galaxyCore = new THREE.Points(coreGeometry, coreMaterial);
    this.scene.add(this.galaxyCore);

    camera.position.set(0, 20, 50);
  }

  update(time: number) {
    this.time = time;
    
    // Rotate galaxy
    this.stars.rotation.y = time * 0.05;
    this.galaxyCore.rotation.y = time * 0.1;
    
    // Pulse core
    if (this.galaxyCore.material instanceof THREE.PointsMaterial) {
      this.galaxyCore.material.size = 0.2 + Math.sin(time) * 0.1;
    }
  }
} 
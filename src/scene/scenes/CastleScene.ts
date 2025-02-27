import * as THREE from 'three';
import { castleVertexShader, castleFragmentShader } from '../../shaders/castleShader';

export class CastleScene {
  scene: THREE.Scene;
  private material: THREE.ShaderMaterial;
  private pillars: THREE.Mesh[] = [];
  private particles: THREE.Points;

  constructor(camera: THREE.PerspectiveCamera) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.02);
    
    // Create gothic pillars
    const pillarGeometry = new THREE.CylinderGeometry(0.5, 0.5, 20, 8);
    const pillarMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(0x1a0f30) }
      },
      vertexShader: castleVertexShader,
      fragmentShader: castleFragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 12; i++) {
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial.clone());
      const angle = (i / 12) * Math.PI * 2;
      const radius = 8;
      pillar.position.set(
        Math.cos(angle) * radius,
        -5,
        Math.sin(angle) * radius
      );
      pillar.scale.set(0.8, 1, 0.8);
      this.pillars.push(pillar);
      this.scene.add(pillar);
    }

    // Add floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20;
      positions[i + 1] = Math.random() * 15 - 5;
      positions[i + 2] = (Math.random() - 0.5) * 20;
      
      colors[i] = 0.5 + Math.random() * 0.5;
      colors[i + 1] = 0.2 + Math.random() * 0.3;
      colors[i + 2] = 0.8;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x222244);
    this.scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0x4444ff, 1.5);
    spotLight.position.set(0, 15, 0);
    this.scene.add(spotLight);

    camera.position.z = 10;
  }

  update(time: number) {
    this.pillars.forEach((pillar, i) => {
      pillar.rotation.y = time * 0.2 + i;
      pillar.material.uniforms.time.value = time;
    });

    this.particles.rotation.y = time * 0.05;
    
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + i) * 0.01;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  onResize() {
    // Handle resize if needed
  }
} 
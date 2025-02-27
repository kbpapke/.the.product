import * as THREE from 'three';
import { tunnelVertexShader, tunnelFragmentShader } from '../../shaders/tunnelShader';

export class TunnelScene {
  scene: THREE.Scene;
  private material: THREE.ShaderMaterial;
  private tunnelMesh: THREE.Mesh;
  private particles: THREE.Points;

  constructor(camera: THREE.PerspectiveCamera) {
    this.scene = new THREE.Scene();
    
    // Create tunnel effect
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: tunnelVertexShader,
      fragmentShader: tunnelFragmentShader,
      side: THREE.DoubleSide
    });

    const tunnelGeometry = new THREE.PlaneGeometry(2, 2);
    this.tunnelMesh = new THREE.Mesh(tunnelGeometry, this.material);
    this.tunnelMesh.position.z = -1;
    this.scene.add(this.tunnelMesh);

    // Add particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x00ff88,
      transparent: true,
      opacity: 0.6
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);

    camera.position.z = 1;
  }

  update(time: number) {
    // Update tunnel shader
    this.material.uniforms.time.value = time;

    // Animate particles
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += 0.01;
      if (positions[i + 2] > 5) positions[i + 2] = -5;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.rotation.z += 0.001;
  }

  onResize() {
    this.material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }
} 
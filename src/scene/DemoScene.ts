import * as THREE from 'three';
import { tunnelVertexShader, tunnelFragmentShader } from '../shaders/tunnelShader';

export class DemoScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private tunnelMaterial: THREE.ShaderMaterial;
  private tunnelMesh: THREE.Mesh;
  private particles: THREE.Points;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // Create tunnel effect
    this.tunnelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: tunnelVertexShader,
      fragmentShader: tunnelFragmentShader,
      side: THREE.DoubleSide
    });

    const tunnelGeometry = new THREE.PlaneGeometry(2, 2);
    this.tunnelMesh = new THREE.Mesh(tunnelGeometry, this.tunnelMaterial);
    this.tunnelMesh.position.z = -1;
    this.scene.add(this.tunnelMesh);

    // Add particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
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
      opacity: 0.8
    });

    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);

    this.camera.position.z = 1;

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.tunnelMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const elapsed = this.clock.getElapsedTime();

    // Update tunnel shader
    this.tunnelMaterial.uniforms.time.value = elapsed;

    // Animate particles
    const positions = this.particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += 0.01;
      if (positions[i + 2] > 5) positions[i + 2] = -5;
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.rotation.z += 0.001;

    this.renderer.render(this.scene, this.camera);
  }
} 
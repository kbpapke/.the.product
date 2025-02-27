import * as THREE from 'three';
import { beachVertexShader, beachFragmentShader } from '../../shaders/beachShader';

export class BeachScene {
  scene: THREE.Scene;
  private ocean: THREE.Mesh;
  private clouds: THREE.Points;
  private time: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x88ccff, 0.01);
    this.scene.background = new THREE.Color(0x88ccff);

    // Create ocean
    const oceanGeometry = new THREE.PlaneGeometry(100, 100, 128, 128);
    const oceanMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        sunDirection: { value: new THREE.Vector3(0.5, 0.5, 1.0) }
      },
      vertexShader: beachVertexShader,
      fragmentShader: beachFragmentShader,
      side: THREE.DoubleSide
    });

    this.ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    this.ocean.rotation.x = -Math.PI / 2;
    this.ocean.position.y = -2;
    this.scene.add(this.ocean);

    // Add clouds
    const cloudGeometry = new THREE.BufferGeometry();
    const cloudCount = 1000;
    const positions = new Float32Array(cloudCount * 3);
    const sizes = new Float32Array(cloudCount);

    for (let i = 0; i < cloudCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = 10 + Math.random() * 5;
      positions[i + 2] = (Math.random() - 0.5) * 100;
      sizes[i / 3] = Math.random() * 2;
    }

    cloudGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    cloudGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const cloudMaterial = new THREE.PointsMaterial({
      size: 1,
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.clouds = new THREE.Points(cloudGeometry, cloudMaterial);
    this.scene.add(this.clouds);

    // Add lighting
    const sunLight = new THREE.DirectionalLight(0xffdd88, 1);
    sunLight.position.set(5, 5, 10);
    this.scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x88ccff, 0.5);
    this.scene.add(ambientLight);
  }

  update(time: number) {
    this.time = time;
    
    // Animate ocean waves
    if (this.ocean.material instanceof THREE.ShaderMaterial) {
      this.ocean.material.uniforms.time.value = time;
    }

    // Move clouds
    this.clouds.position.x = Math.sin(time * 0.1) * 2;
    this.clouds.rotation.y = time * 0.02;
  }
} 
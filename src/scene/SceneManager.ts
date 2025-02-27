import * as THREE from 'three';
import { TunnelScene } from './scenes/TunnelScene';
import { CastleScene } from './scenes/CastleScene';
import { CrystalScene } from './scenes/CrystalScene';

export class SceneManager {
  private currentScene: any;
  private scenes: Map<string, any>;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  constructor(container: HTMLElement) {
    this.clock = new THREE.Clock();
    this.setupRenderer(container);
    this.initScenes();
    
    // Set initial camera position
    this.camera.position.set(0, 0, 1);
  }

  private setupRenderer(container: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
  }

  private initScenes() {
    this.scenes = new Map();
    
    // Initialize each scene
    const tunnelScene = new TunnelScene(this.camera);
    const castleScene = new CastleScene(this.camera);
    const crystalScene = new CrystalScene(this.camera);
    
    this.scenes.set('tunnel', tunnelScene);
    this.scenes.set('castle', castleScene);
    this.scenes.set('crystal', crystalScene);
    
    this.currentScene = tunnelScene;
  }

  switchScene(sceneName: string) {
    if (!this.scenes.has(sceneName)) return;
    
    // Smoothly move camera to new position
    const targetPosition = new THREE.Vector3();
    switch(sceneName) {
      case 'tunnel':
        targetPosition.set(0, 0, 1);
        break;
      case 'castle':
        targetPosition.set(0, 2, 12);
        break;
      case 'crystal':
        targetPosition.set(0, 0, 8);
        break;
    }

    // Smooth camera transition
    const startPosition = this.camera.position.clone();
    const duration = 1000; // 1 second transition
    const startTime = Date.now();

    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing
      const t = progress < .5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      
      this.camera.position.lerpVectors(startPosition, targetPosition, t);
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };

    animateCamera();
    this.currentScene = this.scenes.get(sceneName);
  }

  reset() {
    this.initScenes();
    this.clock = new THREE.Clock();
    this.camera.position.set(0, 0, 1);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const elapsed = this.clock.getElapsedTime();
    
    if (this.currentScene?.update) {
      this.currentScene.update(elapsed);
    }
    
    if (this.currentScene?.scene) {
      this.renderer.render(this.currentScene.scene, this.camera);
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (this.currentScene?.onResize) {
      this.currentScene.onResize();
    }
  }
} 
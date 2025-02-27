import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createAudioSystem } from '../utils/audioSystem';
import { generateProceduralTexture } from '../utils/textureGenerator';
import { VolumeX, Volume2 } from 'lucide-react';

const DemoScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioStarted = useRef(false);
  const audioSystemRef = useRef<ReturnType<typeof createAudioSystem> | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x202040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x4080ff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create procedural texture
    const texture = generateProceduralTexture();
    
    // Create a group to hold our objects
    const group = new THREE.Group();
    scene.add(group);
    
    // Create tunnel effect (more like .the .product)
    const tunnelGeometry = new THREE.CylinderGeometry(2, 2, 20, 32, 20, true);
    const tunnelMaterial = new THREE.MeshPhongMaterial({ 
      map: texture,
      side: THREE.BackSide,
      wireframe: false,
      emissive: new THREE.Color(0x101030),
      specular: new THREE.Color(0x3060ff),
      shininess: 30
    });
    
    const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
    tunnel.rotation.x = Math.PI / 2;
    scene.add(tunnel);
    
    // Create flying objects (like in .the .product)
    const objectsCount = 15;
    const objects: THREE.Mesh[] = [];
    
    // Create different geometries for variety
    const geometries = [
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.TetrahedronGeometry(0.3),
      new THREE.OctahedronGeometry(0.3),
      new THREE.TorusGeometry(0.2, 0.1, 8, 16)
    ];
    
    // Create materials with the Farbrausch blue aesthetic
    const materials = [
      new THREE.MeshPhongMaterial({ 
        color: 0x0040ff,
        emissive: 0x001030,
        specular: 0x80a0ff,
        shininess: 100,
        wireframe: Math.random() > 0.7
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x2060ff,
        emissive: 0x001030,
        specular: 0x80a0ff,
        shininess: 80,
        wireframe: Math.random() > 0.7
      }),
      new THREE.MeshPhongMaterial({ 
        color: 0x4080ff,
        emissive: 0x001030,
        specular: 0x80a0ff,
        shininess: 60,
        wireframe: Math.random() > 0.7
      })
    ];
    
    // Create objects and position them in the tunnel
    for (let i = 0; i < objectsCount; i++) {
      const geometryIndex = Math.floor(Math.random() * geometries.length);
      const materialIndex = Math.floor(Math.random() * materials.length);
      
      const mesh = new THREE.Mesh(geometries[geometryIndex], materials[materialIndex]);
      
      // Position objects along the tunnel
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.5;
      const zPos = Math.random() * 20 - 10;
      
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        zPos
      );
      
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );
      
      objects.push(mesh);
      group.add(mesh);
    }
    
    // Add some particle effects (like the dots in .the .product)
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Position particles in a tunnel-like formation
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 0.5;
      const zPos = Math.random() * 20 - 10;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = zPos;
      
      // Blue-white color palette like in .the .product
      const blueIntensity = Math.random() * 0.5 + 0.5;
      colors[i * 3] = 0.5 + Math.random() * 0.5; // R (more white)
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3; // G (more white)
      colors[i * 3 + 2] = blueIntensity; // B (blue tint)
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Audio system
    audioSystemRef.current = createAudioSystem();
    const { startAudio, stopAudio, updateAudio } = audioSystemRef.current;
    
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start audio on first user interaction
    const startAudioOnInteraction = () => {
      if (!audioStarted.current) {
        startAudio();
        setAudioEnabled(true);
        audioStarted.current = true;
        window.removeEventListener('click', startAudioOnInteraction);
        window.removeEventListener('touchstart', startAudioOnInteraction);
        window.removeEventListener('keydown', startAudioOnInteraction);
      }
    };
    
    window.addEventListener('click', startAudioOnInteraction);
    window.addEventListener('touchstart', startAudioOnInteraction);
    window.addEventListener('keydown', startAudioOnInteraction);
    
    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      
      time += 0.01;
      
      // Rotate the tunnel
      tunnel.rotation.z = time * 0.1;
      
      // Move objects through the tunnel
      objects.forEach((obj, i) => {
        // Move objects along the z-axis
        obj.position.z += 0.05;
        
        // If object passes the end of the tunnel, reset to the beginning
        if (obj.position.z > 10) {
          obj.position.z = -10;
          
          // Randomize position within the tunnel
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 1.5;
          
          obj.position.x = Math.cos(angle) * radius;
          obj.position.y = Math.sin(angle) * radius;
          
          // Randomize rotation
          obj.rotation.x = Math.random() * Math.PI * 2;
          obj.rotation.y = Math.random() * Math.PI * 2;
          obj.rotation.z = Math.random() * Math.PI * 2;
        }
        
        // Rotate objects
        obj.rotation.x += 0.01 * (i % 3 + 1);
        obj.rotation.y += 0.02 * (i % 3 + 1);
      });
      
      // Camera movement (subtle)
      camera.position.x = Math.sin(time * 0.2) * 0.5;
      camera.position.y = Math.cos(time * 0.3) * 0.3;
      
      // Update audio parameters based on visuals
      if (audioEnabled) {
        updateAudio(time);
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
      window.removeEventListener('keydown', startAudioOnInteraction);
      
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      particleGeometry.dispose();
      particleMaterial.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [audioEnabled]);
  
  const toggleAudio = () => {
    if (audioSystemRef.current) {
      if (audioEnabled) {
        audioSystemRef.current.stopAudio();
      } else {
        audioSystemRef.current.startAudio();
      }
      setAudioEnabled(!audioEnabled);
    }
  };
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-pointer"
      title="Click to start audio"
    >
      {!audioStarted.current && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center text-white opacity-70 text-lg font-light">
          <p className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded">Click anywhere to start audio</p>
        </div>
      )}
      
      {/* Audio toggle button */}
      {audioStarted.current && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleAudio();
          }}
          className="absolute top-4 left-4 z-20 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
        >
          {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      )}
    </div>
  );
};

export default DemoScene;
import * as THREE from 'three';

/**
 * Generates a procedural texture inspired by Farbrausch's .the .product
 */
export function generateProceduralTexture(): THREE.Texture {
  const size = 512;
  const data = new Uint8Array(size * size * 4);
  
  // Create canvas and context
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  
  // Fill with black
  context.fillStyle = 'black';
  context.fillRect(0, 0, size, size);
  
  // Create gradient patterns more like .the .product's blue tunnel
  const createGradient = () => {
    const gradient = context.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, 'hsl(220, 100%, 5%)');
    gradient.addColorStop(0.3, 'hsl(225, 100%, 10%)');
    gradient.addColorStop(0.7, 'hsl(230, 100%, 15%)');
    gradient.addColorStop(1, 'hsl(235, 100%, 5%)');
    return gradient;
  };
  
  // Draw base gradient
  context.fillStyle = createGradient();
  context.fillRect(0, 0, size, size);
  
  // Add noise (subtle, like in .the .product)
  const imageData = context.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    // Add some noise
    const noise = (Math.random() - 0.5) * 15;
    imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
    imageData.data[i+1] = Math.max(0, Math.min(255, imageData.data[i+1] + noise));
    imageData.data[i+2] = Math.max(0, Math.min(255, imageData.data[i+2] + noise * 2)); // More blue noise
  }
  context.putImageData(imageData, 0, 0);
  
  // Add grid pattern (more like .the .product's tunnel grid)
  context.strokeStyle = 'rgba(40, 80, 255, 0.4)';
  context.lineWidth = 1;
  
  // Horizontal lines
  for (let y = 0; y < size; y += 16) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(size, y);
    context.stroke();
  }
  
  // Vertical lines
  for (let x = 0; x < size; x += 16) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, size);
    context.stroke();
  }
  
  // Add some glowing circles (like the light effects in .the .product)
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random() * 80 + 40;
    
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(100, 150, 255, 0.7)');
    gradient.addColorStop(0.5, 'rgba(50, 100, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(20, 40, 150, 0)');
    
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }
  
  // Add some horizontal light streaks (like in .the .product)
  for (let i = 0; i < 5; i++) {
    const y = Math.random() * size;
    const height = Math.random() * 10 + 5;
    
    const gradient = context.createLinearGradient(0, y - height/2, 0, y + height/2);
    gradient.addColorStop(0, 'rgba(40, 80, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(60, 120, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(40, 80, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, y - height/2, size, height);
  }
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  return texture;
}
export const castleVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
uniform float time;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Add some vertex animation
    vec3 pos = position;
    float wave = sin(pos.y * 0.2 + time) * 0.1;
    pos.x += wave;
    pos.z += wave;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const castleFragmentShader = `
uniform float time;
uniform vec3 baseColor;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Create a pulsing glow effect
    float pulse = 0.5 + 0.5 * sin(time * 0.5);
    
    // Add vertical gradient
    float gradient = smoothstep(-10.0, 10.0, vPosition.y);
    
    // Create gothic-style patterns
    float pattern = sin(vUv.y * 40.0) * sin(vUv.x * 20.0);
    pattern = smoothstep(0.0, 0.1, abs(pattern));
    
    // Rim lighting effect
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
    rim = pow(rim, 3.0);
    
    // Combine effects
    vec3 color = baseColor;
    color += vec3(0.2, 0.0, 0.4) * pattern;
    color += vec3(0.0, 0.2, 0.4) * rim * pulse;
    color *= 0.8 + 0.4 * gradient;
    
    // Add subtle color variations
    color += vec3(0.1, 0.0, 0.2) * sin(time + vPosition.y * 0.2);
    
    gl_FragColor = vec4(color, 0.8 + 0.2 * rim);
}
`; 
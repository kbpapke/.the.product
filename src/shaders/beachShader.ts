export const beachVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
uniform float time;

void main() {
    vUv = uv;
    vPosition = position;
    
    // Add wave motion
    vec3 pos = position;
    float wave1 = sin(pos.x * 0.2 + time) * 0.5;
    float wave2 = cos(pos.z * 0.3 - time * 0.5) * 0.3;
    pos.y += wave1 + wave2;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

export const beachFragmentShader = `
uniform float time;
uniform vec3 sunDirection;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    // Ocean color gradient
    vec3 shallowColor = vec3(0.0, 0.6, 0.8);
    vec3 deepColor = vec3(0.0, 0.2, 0.4);
    
    // Wave pattern
    float wave = sin(vUv.x * 20.0 + time) * sin(vUv.y * 20.0 - time);
    wave = smoothstep(-1.0, 1.0, wave) * 0.1;
    
    // Fresnel effect for water shine
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDirection, vec3(0.0, 1.0, 0.0)), 0.0), 3.0);
    
    // Sun reflection
    float sunReflection = pow(max(dot(reflect(-sunDirection, vec3(0.0, 1.0, 0.0)), viewDirection), 0.0), 32.0);
    
    // Combine effects
    vec3 color = mix(deepColor, shallowColor, wave + fresnel);
    color += vec3(1.0) * sunReflection * 0.5;
    
    gl_FragColor = vec4(color, 0.9);
}
`; 
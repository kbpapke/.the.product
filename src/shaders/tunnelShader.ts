export const tunnelVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const tunnelFragmentShader = `
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;

#define PI 3.14159265359

float pattern(vec2 p, float t) {
    float a = atan(p.y, p.x);
    float r = length(p);
    float v = sin(50.0 * (a * 0.5 + 0.5 * sin(r + t)));
    return smoothstep(0.0, 0.1, abs(v));
}

void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    
    float t = time * 0.5;
    
    // Create the tunnel effect similar to .the .product
    vec2 uv = p;
    float r = length(uv);
    float a = atan(uv.y, uv.x);
    
    // Distort space with a more aggressive twist
    vec2 st = vec2(a / PI, 1.0/r);
    st.x += sin(st.y * 8.0 + t) * 0.2;
    st.y += cos(st.x * 6.0 + t * 1.5) * 0.2;
    
    // Create the characteristic blue-green color scheme
    vec3 color = vec3(0.0);
    float pat = pattern(uv * 2.0, t);
    color += vec3(0.0, 0.8 + 0.2 * sin(t), 1.0) * pat;
    
    // Add scanlines
    float scanline = sin(gl_FragCoord.y * 0.1 + time * 2.0) * 0.1 + 0.9;
    
    // Add distance fog
    float fog = 1.0 - smoothstep(0.0, 2.0, r);
    color *= fog * scanline;
    
    gl_FragColor = vec4(color, 1.0);
}
`; 
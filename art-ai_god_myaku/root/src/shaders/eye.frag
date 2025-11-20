
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;

uniform vec3 uColorRed;
uniform vec3 uColorBlue;
uniform vec3 uColorGold;
uniform float uTime;
uniform vec2 uMouse;

// Random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec2 uv = vUv * 2.0 - 1.0;

    // --- Gaze & Eye Shape ---
    // Make gaze slower and more wandering if no mouse input
    vec2 gaze = uMouse;
    if (length(uMouse) < 0.01) {
        gaze = vec2(
            sin(uTime * 0.3) * 0.4 + sin(uTime * 1.1) * 0.1, 
            cos(uTime * 0.25) * 0.4 + cos(uTime * 0.9) * 0.1
        );
    }
    
    vec2 eyeUv = uv - gaze * 0.6; 
    float r = length(eyeUv);

    // --- Colors (Myaku-Myaku Style) ---
    // Red: Body/Sclera (Vivid)
    // Blue: Iris (Vivid)
    
    // 1. Pupil (Black)
    float pupilSize = 0.25 + sin(uTime * 2.0) * 0.02; // Dilating pupil
    float pupilMask = smoothstep(pupilSize, pupilSize + 0.01, r);

    // 2. Iris (Blue Ring)
    float irisSize = 0.55;
    float irisMask = smoothstep(irisSize, irisSize + 0.05, r);
    
    // Iris Texture (Striations)
    float angle = atan(eyeUv.y, eyeUv.x);
    float irisNoise = sin(angle * 20.0 + vDisplacement * 10.0);
    vec3 irisColor = uColorBlue * (0.8 + 0.4 * irisNoise);
    
    // 3. Sclera/Body (Red)
    // Use vDisplacement to create "fleshy" texture
    float fleshNoise = smoothstep(-0.2, 0.5, vDisplacement);
    vec3 fleshColor = mix(uColorRed * 0.5, uColorRed * 1.5, fleshNoise);
    
    // Veins
    float vein = smoothstep(0.45, 0.5, abs(sin(vDisplacement * 20.0 + angle * 5.0)));
    fleshColor = mix(fleshColor, vec3(0.3, 0.0, 0.0), vein * 0.3);

    // Combine Eye Layers
    vec3 color = vec3(0.0); // Pupil
    color = mix(color, irisColor, pupilMask);
    color = mix(color, fleshColor, irisMask);

    // --- Holy Glitter & Rim Light ---
    float fresnel = 1.0 - dot(viewDir, normal);
    fresnel = pow(fresnel, 2.5);

    // Glitter Noise
    float glitter = step(0.95, random(uv * 10.0 + uTime)); // Sparkles
    float glitter2 = step(0.98, random(uv * 20.0 - uTime));
    
    vec3 goldLight = uColorGold * 4.0; // Boost for bloom
    
    // Add glitter to the rim
    vec3 rimColor = goldLight * fresnel;
    rimColor += uColorGold * 10.0 * glitter * fresnel; // Sparkles on edges
    
    color += rimColor;

    gl_FragColor = vec4(color, 1.0);
}

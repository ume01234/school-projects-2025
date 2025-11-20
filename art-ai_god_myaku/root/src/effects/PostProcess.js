
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

// Kaleidoscope Shader (Unchanged)
const KaleidoscopeShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'uSegments': { value: 12.0 },
        'uTime': { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uSegments;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv - 0.5;
            float r = length(uv);
            float a = atan(uv.y, uv.x);
            
            float segmentAngle = 3.14159 * 2.0 / uSegments;
            a = mod(a, segmentAngle);
            a = abs(a - segmentAngle/2.0);
            
            a += uTime * 0.05;

            vec2 newUv = r * vec2(cos(a), sin(a)) + 0.5;
            
            float vignette = smoothstep(0.8, 0.4, r);

            vec4 color = texture2D(tDiffuse, newUv);
            gl_FragColor = color * vignette;
        }
    `
};

// Chromatic Aberration (Unchanged)
const ChromaticAberrationShader = {
    uniforms: {
        'tDiffuse': { value: null },
        'uDistortion': { value: 0.003 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uDistortion;
        varying vec2 vUv;

        void main() {
            vec2 p = vUv;
            float dist = distance(p, vec2(0.5));
            float offset = uDistortion * dist * 3.0;

            vec4 cr = texture2D(tDiffuse, p + vec2(offset, 0.0));
            vec4 cg = texture2D(tDiffuse, p);
            vec4 cb = texture2D(tDiffuse, p - vec2(offset, 0.0));

            gl_FragColor = vec4(cr.r, cg.g, cb.b, 1.0);
        }
    `
};

export class PostProcess {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.composer = new EffectComposer(renderer);
        this.kaleidoscopePass = null;

        this.init();
    }

    init() {
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        this.kaleidoscopePass = new ShaderPass(KaleidoscopeShader);
        this.composer.addPass(this.kaleidoscopePass);

        // Tuned Bloom for Clarity
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.8,  // Strength (Reduced from 2.0)
            0.3,  // Radius (Reduced from 0.5)
            0.85  // Threshold (Increased from 0.6)
        );
        this.composer.addPass(bloomPass);

        const chromaticAberrationPass = new ShaderPass(ChromaticAberrationShader);
        this.composer.addPass(chromaticAberrationPass);
    }

    setSize(width, height) {
        this.composer.setSize(width, height);
    }

    render(time) {
        if (this.kaleidoscopePass) {
            this.kaleidoscopePass.uniforms.uTime.value = time;
        }
        this.composer.render();
    }
}

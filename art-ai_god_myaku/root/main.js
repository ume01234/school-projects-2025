
import * as THREE from 'three';
import { EyeMandala } from './src/components/EyeMandala.js';
import { PostProcess } from './src/effects/PostProcess.js';

// --- Setup ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050000);
scene.fog = new THREE.FogExp2(0x050000, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 8; // Closer (was 12)

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// --- Components ---
const eyeMandala = new EyeMandala(scene, 800);
await eyeMandala.init();

const postProcess = new PostProcess(renderer, scene, camera);

// --- Interaction ---
const mouse = new THREE.Vector2();
const targetMouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    postProcess.setSize(window.innerWidth, window.innerHeight);
});

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    mouse.lerp(targetMouse, 0.05);

    eyeMandala.update(time, mouse);

    postProcess.render(time);
}

animate();

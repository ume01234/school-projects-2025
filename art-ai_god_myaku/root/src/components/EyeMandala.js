
import * as THREE from 'three';

export class EyeMandala {
    constructor(scene, count = 800) {
        this.scene = scene;
        this.count = count;
        this.mesh = null;
        this.dummy = new THREE.Object3D();
        this.uniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2(0, 0) },
            uColorRed: { value: new THREE.Color(0xE60012) },
            uColorBlue: { value: new THREE.Color(0x0099FF) },
            uColorGold: { value: new THREE.Color(0xFFD700) }
        };
    }

    async init() {
        const [vert, frag] = await Promise.all([
            fetch('./src/shaders/eye.vert').then(r => r.text()),
            fetch('./src/shaders/eye.frag').then(r => r.text())
        ]);

        const geometry = new THREE.SphereGeometry(0.8, 64, 64); // Larger base size (was 0.6)
        const material = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: this.uniforms,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.InstancedMesh(geometry, material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        this.arrangeMandala();

        this.scene.add(this.mesh);
    }

    arrangeMandala() {
        let index = 0;
        const layers = 18; // More layers (was 15)

        for (let i = 0; i < layers; i++) {
            // Wider spread
            const radius = 1.5 + i * 1.5; // (was 2.0 + i*1.0)
            const itemsInLayer = Math.floor(10 + i * 5);

            for (let j = 0; j < itemsInLayer; j++) {
                if (index >= this.count) break;

                const angle = (j / itemsInLayer) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                // More depth variation
                const z = (Math.random() - 0.5) * 6.0;

                this.dummy.position.set(x, y, z);

                this.dummy.rotation.z = angle;
                this.dummy.rotation.x = Math.random() * Math.PI;
                this.dummy.rotation.y = Math.random() * Math.PI;

                // Larger scales
                const scale = 0.6 + Math.random() * 0.8; // (was 0.4 + 0.6)
                this.dummy.scale.set(scale, scale, scale);

                this.dummy.updateMatrix();
                this.mesh.setMatrixAt(index++, this.dummy.matrix);
            }
        }
        this.mesh.instanceMatrix.needsUpdate = true;
    }

    update(time, mouse) {
        if (!this.mesh) return;

        this.uniforms.uTime.value = time;
        this.uniforms.uMouse.value.lerp(mouse, 0.1);

        this.mesh.rotation.z = time * 0.05;
        this.mesh.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
}

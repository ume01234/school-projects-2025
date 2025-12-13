/**
 * MIYAKU-MANDALA - Three.js メインシーン
 * p5.jsの曼荼羅+眼球をテクスチャとして配置し、
 * 眼球の周りを漂うブロブで「縁」を表現
 */

// ===== グローバル設定 =====
const CONFIG = {
    // ブロブ設定
    blobCount: 60,
    maxBlobs: 100,
    minBlobs: 20,
    blobBaseSize: 0.06,
    blobSizeVariance: 0.03,
    
    // 運動設定
    orbitSpeed: 0.4,
    verticalRange: 1.2,
    eyeOrbitRadius: 0.3,  // 眼球周りの軌道半径
    
    // 相互作用設定
    fusionDistance: 0.12,
    fusionProbability: 0.015,
    splitProbability: 0.003,
    
    // 音響フック（将来用）
    soundEnabled: false,
    onFusion: null,
    onSplit: null,
    onOrbitChange: null
};

// ===== カラーパレット（赤・青系のみ） =====
const COLOR_PALETTE = {
    // 青系
    deepBlue: new THREE.Color(0.08, 0.15, 0.5),
    blue: new THREE.Color(0.15, 0.25, 0.7),
    lightBlue: new THREE.Color(0.25, 0.4, 0.85),
    
    // 赤系
    deepRed: new THREE.Color(0.5, 0.08, 0.12),
    red: new THREE.Color(0.75, 0.15, 0.2),
    lightRed: new THREE.Color(0.9, 0.3, 0.25),
    
    // 紫（青と赤の中間）
    purple: new THREE.Color(0.4, 0.1, 0.5),
    deepPurple: new THREE.Color(0.25, 0.08, 0.4)
};

// ===== Three.js 変数 =====
let scene, camera, renderer;
let mandalaPlane, mandalaTexture;
let blobs = [];
let clock;
let frameCount = 0;
let debugMode = false;

// ===== シェーダー定義（ミャクミャク風の有機的な変形） =====
const blobVertexShader = `
    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vNoise;
    
    // Simplex 3D Noise
    vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        
        i = mod(i, 289.0);
        vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            
        float n_ = 1.0/7.0;
        vec3 ns = n_ * D.wyz - D.xzx;
        
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        
        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    // FBM for organic blob movement
    float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 5; i++) {
            value += amplitude * snoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        return value;
    }
    
    void main() {
        vNormal = normal;
        vPosition = position;
        
        // 有機的な変形（ミャクミャク風）
        float noise = fbm(position * uNoiseScale + uTime * 0.3);
        
        // 追加のうねり
        float wave = sin(position.x * 3.0 + uTime) * cos(position.y * 3.0 + uTime * 0.7) * 0.3;
        noise += wave;
        
        vNoise = noise;
        
        // 頂点を法線方向に変位
        vec3 displaced = position + normal * noise * uNoiseStrength;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
`;

const blobFragmentShader = `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uTime;
    uniform float uPulse;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vNoise;
    
    void main() {
        // フレネル効果（エッジを明るく）
        vec3 viewDir = normalize(cameraPosition - vPosition);
        float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);
        
        // ノイズに基づく色の混合
        float colorMix = vNoise * 0.5 + 0.5;
        colorMix = smoothstep(0.3, 0.7, colorMix);
        colorMix += sin(uTime * 1.5) * 0.15;
        
        vec3 color = mix(uColorA, uColorB, colorMix);
        
        // フレネルで明るさを追加
        color += fresnel * 0.4;
        
        // パルスによる発光
        color += uPulse * 0.15;
        
        // 内部発光効果
        float innerGlow = pow(1.0 - fresnel, 3.0) * 0.2;
        color += innerGlow * mix(uColorA, uColorB, 0.5);
        
        // 半透明効果
        float alpha = 0.88 + fresnel * 0.12;
        
        gl_FragColor = vec4(color, alpha);
    }
`;

// ===== ブロブクラス =====
class Blob {
    constructor(eyeIndex, orbitAngle) {
        this.eyeIndex = eyeIndex;  // 追従する眼球のインデックス
        this.orbitAngle = orbitAngle;  // 眼球周りの軌道角度
        this.orbitRadius = CONFIG.eyeOrbitRadius * (0.8 + Math.random() * 0.4);
        this.height = (Math.random() - 0.5) * CONFIG.verticalRange * 0.5;
        
        // サイズ
        this.baseSize = CONFIG.blobBaseSize + (Math.random() - 0.5) * CONFIG.blobSizeVariance;
        this.currentSize = this.baseSize;
        this.targetSize = this.baseSize;
        
        // 速度とオフセット
        this.orbitSpeedMultiplier = 0.6 + Math.random() * 0.8;
        this.verticalSpeed = (Math.random() - 0.5) * 0.015;
        this.noiseOffset = Math.random() * 1000;
        
        // 状態
        this.state = 'normal';
        this.fusionTarget = null;
        this.fusionProgress = 0;
        
        // 色タイプ（0: 青系、1: 赤系、2: 紫系）
        this.colorType = Math.floor(Math.random() * 3);
        
        // Three.js オブジェクト
        this.createMesh();
    }
    
    createMesh() {
        const geometry = new THREE.IcosahedronGeometry(1, 4);
        
        // 色の選択（赤・青・紫系のみ）
        let colorA, colorB;
        
        switch (this.colorType) {
            case 0: // 青系
                colorA = COLOR_PALETTE.deepBlue.clone();
                colorB = COLOR_PALETTE.lightBlue.clone();
                break;
            case 1: // 赤系
                colorA = COLOR_PALETTE.deepRed.clone();
                colorB = COLOR_PALETTE.lightRed.clone();
                break;
            case 2: // 紫系
                colorA = COLOR_PALETTE.deepPurple.clone();
                colorB = COLOR_PALETTE.purple.clone();
                break;
        }
        
        const material = new THREE.ShaderMaterial({
            vertexShader: blobVertexShader,
            fragmentShader: blobFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uNoiseScale: { value: 1.8 + Math.random() * 0.5 },
                uNoiseStrength: { value: 0.18 + Math.random() * 0.1 },
                uColorA: { value: colorA },
                uColorB: { value: colorB },
                uPulse: { value: 0 }
            },
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.scale.setScalar(this.baseSize);
    }
    
    update(time) {
        if (!window.mandalaMeta.ready) return;
        
        const eyes = window.mandalaMeta.eyes;
        if (!eyes || eyes.length === 0) return;
        
        // 眼球が存在しない場合はランダムに再割り当て
        if (this.eyeIndex >= eyes.length) {
            this.eyeIndex = Math.floor(Math.random() * eyes.length);
        }
        
        const eye = eyes[this.eyeIndex];
        if (!eye) return;
        
        // 眼球周りの軌道を更新
        this.orbitAngle += CONFIG.orbitSpeed * this.orbitSpeedMultiplier * 0.02;
        
        // 垂直方向の動き
        this.height += this.verticalSpeed;
        this.height += Math.sin(time * 1.5 + this.noiseOffset) * 0.003;
        
        // 垂直範囲の制限
        if (Math.abs(this.height) > CONFIG.verticalRange * 0.6) {
            this.verticalSpeed *= -0.8;
            this.height = Math.sign(this.height) * CONFIG.verticalRange * 0.6;
        }
        
        // 眼球の位置を基準に、その周りを周回
        const eyeX = eye.x * 2.5;  // スケール調整
        const eyeZ = eye.y * 2.5;
        
        // 軌道上の位置
        const orbitX = Math.cos(this.orbitAngle) * this.orbitRadius;
        const orbitZ = Math.sin(this.orbitAngle) * this.orbitRadius;
        
        const x = eyeX + orbitX;
        const z = eyeZ + orbitZ;
        
        this.mesh.position.set(x, this.height, z);
        
        // サイズの補間
        this.currentSize += (this.targetSize - this.currentSize) * 0.1;
        this.mesh.scale.setScalar(this.currentSize);
        
        // シェーダーのユニフォーム更新
        this.mesh.material.uniforms.uTime.value = time + this.noiseOffset;
        
        // 状態に応じた処理
        if (this.state === 'fusing' && this.fusionTarget) {
            this.processFusion();
        }
        
        // パルス効果
        const pulse = Math.sin(time * 2.5 + this.noiseOffset) * 0.5 + 0.5;
        this.mesh.material.uniforms.uPulse.value = pulse * 0.25;
    }
    
    processFusion() {
        this.fusionProgress += 0.025;
        
        if (this.fusionProgress >= 1) {
            this.state = 'normal';
            this.targetSize = this.baseSize * 1.4;
            this.fusionTarget = null;
            this.fusionProgress = 0;
            
            if (CONFIG.soundEnabled && CONFIG.onFusion) {
                CONFIG.onFusion(this);
            }
        } else {
            const target = this.fusionTarget;
            if (target) {
                this.orbitAngle += (target.orbitAngle - this.orbitAngle) * 0.08;
                this.height += (target.height - this.height) * 0.08;
                this.targetSize = this.baseSize * (1 - this.fusionProgress * 0.4);
            }
        }
    }
    
    distanceTo(other) {
        return this.mesh.position.distanceTo(other.mesh.position);
    }
    
    // 別の眼球に移動
    changeEye(newEyeIndex) {
        const eyes = window.mandalaMeta.eyes;
        if (newEyeIndex >= 0 && newEyeIndex < eyes.length) {
            this.eyeIndex = newEyeIndex;
            this.orbitSpeedMultiplier = 0.6 + Math.random() * 0.8;
            
            if (CONFIG.soundEnabled && CONFIG.onOrbitChange) {
                CONFIG.onOrbitChange(this);
            }
        }
    }
    
    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        scene.remove(this.mesh);
    }
}

// ===== 初期化 =====
function init() {
    console.log('Three.js init() started');
    
    try {
        // シーン
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x030308);
        
        // カメラ（45度の視点）
        camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        camera.position.set(0, 4.5, 4.5);
        camera.lookAt(0, 0, 0);
        
        // レンダラー
        const container = document.getElementById('three-container');
        if (!container) {
            console.error('three-container not found!');
            return;
        }
        
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        
        // 環境光（青み）
        const ambientLight = new THREE.AmbientLight(0x202040, 0.6);
        scene.add(ambientLight);
        
        // ポイントライト（赤）
        const pointLight1 = new THREE.PointLight(0xff3333, 0.8, 12);
        pointLight1.position.set(3, 4, 2);
        scene.add(pointLight1);
        
        // ポイントライト（青）
        const pointLight2 = new THREE.PointLight(0x3333ff, 0.8, 12);
        pointLight2.position.set(-3, 4, -2);
        scene.add(pointLight2);
        
        // ポイントライト（紫・中央上）
        const pointLight3 = new THREE.PointLight(0x8844aa, 0.5, 10);
        pointLight3.position.set(0, 5, 0);
        scene.add(pointLight3);
        
        // 時計
        clock = new THREE.Clock();
        
        // p5.jsの準備を待つ
        waitForMandala();
        
        // イベントリスナー
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('keydown', onKeyDown);
        
        // アニメーション開始
        animate();
        console.log('Animation started');
        
    } catch (error) {
        console.error('Init error:', error);
    }
}

function waitForMandala() {
    console.log('Waiting for mandala... ready:', window.mandalaMeta?.ready);
    if (window.mandalaMeta && window.mandalaMeta.ready) {
        console.log('Mandala ready! Setting up...');
        setupMandalaPlane();
        // 眼球の配置を待ってからブロブを生成
        setTimeout(setupBlobs, 500);
    } else {
        setTimeout(waitForMandala, 100);
    }
}

function setupMandalaPlane() {
    const p5Canvas = document.querySelector('#p5-container canvas');
    if (!p5Canvas) {
        console.error('p5.js canvas not found');
        return;
    }
    
    mandalaTexture = new THREE.CanvasTexture(p5Canvas);
    mandalaTexture.needsUpdate = true;
    
    const planeSize = 5.5;
    const geometry = new THREE.PlaneGeometry(planeSize, planeSize);
    
    const material = new THREE.MeshBasicMaterial({
        map: mandalaTexture,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
    });
    
    mandalaPlane = new THREE.Mesh(geometry, material);
    mandalaPlane.rotation.x = -Math.PI / 2;
    mandalaPlane.position.y = -0.5;
    
    scene.add(mandalaPlane);
    console.log('Mandala plane added to scene');
}

function setupBlobs() {
    const eyes = window.mandalaMeta.eyes;
    if (!eyes || eyes.length === 0) {
        console.log('No eyes found, retrying...');
        setTimeout(setupBlobs, 200);
        return;
    }
    
    console.log('Setting up blobs, eyes count:', eyes.length);
    
    // 各眼球の周りにブロブを配置
    const blobsPerEye = Math.ceil(CONFIG.blobCount / eyes.length);
    
    for (let i = 0; i < eyes.length; i++) {
        const numBlobs = Math.min(blobsPerEye, 4); // 各眼球に最大4個
        
        for (let j = 0; j < numBlobs; j++) {
            const angleOffset = (Math.PI * 2 / numBlobs) * j + Math.random() * 0.5;
            const blob = new Blob(i, angleOffset);
            blobs.push(blob);
            scene.add(blob.mesh);
        }
    }
    
    console.log('Blobs created:', blobs.length);
    updateDebugInfo();
}

// ===== アニメーションループ =====
function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    frameCount++;
    
    // テクスチャ更新
    if (mandalaTexture) {
        mandalaTexture.needsUpdate = true;
    }
    
    // ブロブ更新
    updateBlobs(time);
    
    // 相互作用チェック
    if (frameCount % 5 === 0) {
        checkInteractions();
    }
    
    // デバッグ情報更新
    if (frameCount % 30 === 0) {
        updateDebugInfo();
    }
    
    renderer.render(scene, camera);
}

function updateBlobs(time) {
    for (const blob of blobs) {
        blob.update(time);
    }
}

function checkInteractions() {
    for (let i = 0; i < blobs.length; i++) {
        const blobA = blobs[i];
        if (blobA.state !== 'normal') continue;
        
        for (let j = i + 1; j < blobs.length; j++) {
            const blobB = blobs[j];
            if (blobB.state !== 'normal') continue;
            
            const distance = blobA.distanceTo(blobB);
            
            if (distance < CONFIG.fusionDistance) {
                if (Math.random() < CONFIG.fusionProbability) {
                    triggerFusion(blobA, blobB);
                } else if (Math.random() < 0.08) {
                    // 眼球間の移動
                    triggerEyeChange(blobA, blobB);
                }
            }
        }
        
        // 分裂チェック
        if (Math.random() < CONFIG.splitProbability && blobs.length < CONFIG.maxBlobs) {
            triggerSplit(blobA);
        }
    }
}

function triggerFusion(blobA, blobB) {
    blobA.state = 'fusing';
    blobA.fusionTarget = blobB;
    blobB.state = 'fusing';
    blobB.fusionTarget = blobA;
    
    setTimeout(() => {
        const index = blobs.indexOf(blobB);
        if (index > -1) {
            blobB.dispose();
            blobs.splice(index, 1);
        }
        blobA.state = 'normal';
        blobA.fusionTarget = null;
    }, 800);
}

function triggerSplit(blob) {
    if (blobs.length >= CONFIG.maxBlobs) return;
    
    const newBlob = new Blob(
        blob.eyeIndex,
        blob.orbitAngle + (Math.random() - 0.5) * Math.PI
    );
    newBlob.height = blob.height + (Math.random() - 0.5) * 0.2;
    newBlob.baseSize = blob.baseSize * 0.75;
    newBlob.currentSize = 0.01;
    newBlob.targetSize = newBlob.baseSize;
    
    blobs.push(newBlob);
    scene.add(newBlob.mesh);
    
    blob.targetSize = blob.baseSize * 0.85;
    
    if (CONFIG.soundEnabled && CONFIG.onSplit) {
        CONFIG.onSplit(blob, newBlob);
    }
}

function triggerEyeChange(blobA, blobB) {
    const eyes = window.mandalaMeta.eyes;
    if (!eyes || eyes.length < 2) return;
    
    // 異なる眼球についているブロブ同士が出会ったとき
    if (blobA.eyeIndex !== blobB.eyeIndex) {
        const tempEye = blobA.eyeIndex;
        blobA.changeEye(blobB.eyeIndex);
        blobB.changeEye(tempEye);
    } else {
        // 同じ眼球の場合、ランダムに別の眼球へ
        const newEye = Math.floor(Math.random() * eyes.length);
        if (Math.random() > 0.5) {
            blobA.changeEye(newEye);
        } else {
            blobB.changeEye(newEye);
        }
    }
}

// ===== イベントハンドラ =====
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
    if (event.key === 'd' || event.key === 'D') {
        debugMode = !debugMode;
        document.getElementById('debug-info').classList.toggle('visible', debugMode);
    }
}

function updateDebugInfo() {
    if (!debugMode) return;
    
    document.getElementById('fps').textContent = Math.round(1 / clock.getDelta()) || 60;
    document.getElementById('blob-count').textContent = blobs.length;
}

// ===== 起動 =====
document.addEventListener('DOMContentLoaded', init);

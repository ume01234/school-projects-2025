/**
 * MIYAKU-MANDALA - p5.js 曼荼羅 + 眼球描画
 * 曼荼羅の各層に眼球を配置し、層情報をグローバルに出力する
 */

// グローバル変数
window.mandalaMeta = {
    layers: [],
    centerRadius: 0,
    canvasSize: 0,
    eyes: [],  // 眼球の位置情報をThree.jsに渡す
    ready: false
};

let mandalaCanvas;
const MANDALA_SIZE = 1024;
const LAYERS_COUNT = 5;
const TIME_SCALE = 0.003;  // 回転速度を上げた（0.001 → 0.003）

// 眼球配列
let eyes = [];
const CYCLE = 100;

// p5.js インスタンスモード
const mandalaSketch = (p) => {
    let centerGlow = 0;
    let rotationOffset = 0;
    
    // ===== 眼球クラス（sketch.jsから移植） =====
    class Eye {
        constructor(_pos, _radius, layerId, angleInLayer) {
            this.pos = _pos;
            this.radius = _radius;
            this.layerId = layerId;
            this.angleInLayer = angleInLayer;
            this.dMult = p.random(0.12, 0.2);
            this.currentTarget = p.createVector(0, 0, 1);
            this.target = p.createVector(0, 0, 1);
            this.tex = p.createGraphics(this.radius * 4, this.radius * 2);
            this.pulseOffset = p.random(p.TWO_PI);
        }

        setTarget(_targetPos) {
            this.target = _targetPos;
        }

        update() {
            this.currentTarget.add(
                p5.Vector.sub(this.target, this.currentTarget).mult(this.dMult)
            );
        }

        drawTex() {
            this.tex.ellipseMode(p.CENTER);
            this.tex.noStroke();
            
            // 白目（少し青みがかった白）
            this.tex.background("#E8F0F8");
            
            let diameter = this.tex.width * 0.22;
            let noiseMult = p.noise(this.pos.x * 0.01 + p.sin((p.frameCount / CYCLE) * p.TWO_PI));
            diameter += (noiseMult - 0.5) / 5 * diameter;
            
            // 虹彩の外側（深い青）
            this.tex.fill(20, 40, 120);
            this.tex.ellipse(this.tex.width / 2, this.tex.height / 2, diameter * 1.1, diameter * 1.1);

            // 虹彩の放射状パターン
            this.tex.push();
            this.tex.translate(this.tex.width / 2, this.tex.height / 2);
            for (let r = 0; r < p.TWO_PI; r += p.PI / 20) {
                // 深い青から赤へのグラデーション
                let colorT = (p.sin(r * 3 + p.frameCount * 0.02) + 1) / 2;
                let irisR = p.lerp(30, 150, colorT);
                let irisG = p.lerp(50, 30, colorT);
                let irisB = p.lerp(180, 80, colorT);
                this.tex.stroke(irisR, irisG, irisB, 200);
                this.tex.strokeWeight(1.5);
                
                this.tex.push();
                this.tex.rotate(r);
                this.tex.line(diameter * 0.2, 0, diameter * 0.5, 0);
                this.tex.pop();
            }
            this.tex.pop();
            this.tex.noStroke();

            // 瞳孔（深い赤〜黒）
            let pupilSize = diameter * 0.45;
            // パルス効果
            let pulse = p.sin(p.frameCount * 0.05 + this.pulseOffset) * 0.1 + 1;
            pupilSize *= pulse;
            
            // 瞳孔のグラデーション
            for (let i = 3; i >= 0; i--) {
                let t = i / 3;
                let pr = p.lerp(10, 80, t);
                let pg = p.lerp(5, 20, t);
                let pb = p.lerp(20, 60, t);
                this.tex.fill(pr, pg, pb);
                this.tex.ellipse(this.tex.width / 2, this.tex.height / 2, pupilSize * (1 + t * 0.3), pupilSize * (1 + t * 0.3));
            }
            
            // ハイライト（白い反射）
            this.tex.fill(255, 255, 255, 180);
            this.tex.ellipse(this.tex.width * 0.56, this.tex.height * 0.38, diameter * 0.2, diameter * 0.2);
            this.tex.fill(255, 255, 255, 100);
            this.tex.ellipse(this.tex.width * 0.42, this.tex.height * 0.55, diameter * 0.1, diameter * 0.1);
        }

        display() {
            // 眼球を描画（2D表示用）
            p.push();
            p.translate(this.pos.x, this.pos.y);
            
            this.drawTex();
            p.imageMode(p.CENTER);
            p.image(this.tex, 0, 0, this.radius * 2, this.radius);
            
            p.pop();
        }
        
        // Three.js用に位置情報を返す
        getWorldPosition(centerX, centerY, rotation, layerSpeed) {
            // 層ごとの回転を適用
            let rotatedAngle = this.angleInLayer + rotation * layerSpeed * (this.layerId % 2 === 0 ? 1 : -1);
            let layer = window.mandalaMeta.layers[this.layerId];
            if (!layer) return { x: 0, y: 0 };
            
            let x = centerX + p.cos(rotatedAngle) * layer.radius;
            let y = centerY + p.sin(rotatedAngle) * layer.radius;
            return { x, y, angle: rotatedAngle };
        }
    }
    
    p.setup = function() {
        console.log('p5.js setup() started');
        
        mandalaCanvas = p.createCanvas(MANDALA_SIZE, MANDALA_SIZE);
        mandalaCanvas.parent('p5-container');
        p.colorMode(p.RGB);
        p.noStroke();
        
        // 曼荼羅の層情報を生成
        generateMandalaMeta(p);
        
        // 各層に眼球を配置
        generateEyes(p);
        
        window.mandalaMeta.canvasSize = MANDALA_SIZE;
        window.mandalaMeta.ready = true;
        
        console.log('p5.js setup() completed, eyes:', eyes.length);
    };
    
    p.draw = function() {
        // 深い黒背景
        p.background(5, 5, 10);
        
        const cx = MANDALA_SIZE / 2;
        const cy = MANDALA_SIZE / 2;
        
        // 回転オフセットを更新（速度を上げた）
        rotationOffset += TIME_SCALE;
        
        // 中心光のパルス
        centerGlow = p.map(p.sin(p.frameCount * 0.02), -1, 1, 30, 80);
        
        // 層を外側から内側へ描画
        for (let i = window.mandalaMeta.layers.length - 1; i >= 0; i--) {
            drawLayer(p, cx, cy, window.mandalaMeta.layers[i], rotationOffset);
        }
        
        // 眼球を描画し、位置情報を更新
        window.mandalaMeta.eyes = [];
        for (let eye of eyes) {
            let layer = window.mandalaMeta.layers[eye.layerId];
            if (!layer) continue;
            
            // 層の回転に合わせて眼球の位置を更新
            let worldPos = eye.getWorldPosition(cx, cy, rotationOffset, layer.speed);
            eye.pos.x = worldPos.x;
            eye.pos.y = worldPos.y;
            
            // 視線のターゲット（中心を見つめる + 揺らぎ）
            let targetX = cx + p.sin(p.frameCount * 0.01 + eye.pulseOffset) * 50;
            let targetY = cy + p.cos(p.frameCount * 0.01 + eye.pulseOffset) * 50;
            eye.setTarget(p.createVector(targetX, targetY, 0));
            eye.update();
            eye.display();
            
            // Three.js用に正規化した位置情報を保存
            window.mandalaMeta.eyes.push({
                x: (worldPos.x - cx) / (MANDALA_SIZE / 2),
                y: (worldPos.y - cy) / (MANDALA_SIZE / 2),
                layerId: eye.layerId,
                radius: eye.radius / MANDALA_SIZE
            });
        }
        
        // 中心の光
        drawCenterGlow(p, cx, cy);
    };
    
    // 曼荼羅の層情報を生成
    function generateMandalaMeta(p) {
        const maxRadius = MANDALA_SIZE * 0.42;
        const minRadius = MANDALA_SIZE * 0.08;
        
        window.mandalaMeta.centerRadius = minRadius;
        window.mandalaMeta.layers = [];
        
        for (let i = 0; i < LAYERS_COUNT; i++) {
            const t = i / (LAYERS_COUNT - 1);
            const radius = p.lerp(minRadius * 1.5, maxRadius, t);
            const count = 6 + i * 2; // 眼球の数（内側6個、外側へいくほど増える）
            
            window.mandalaMeta.layers.push({
                id: i,
                radius: radius,
                count: count,
                // 色相: 内側=深い青、外側=深い赤
                colorR: p.lerp(30, 180, t),
                colorG: p.lerp(50, 30, t),
                colorB: p.lerp(180, 60, t),
                thickness: p.lerp(15, 30, t),
                speed: p.lerp(0.6, 0.25, t) // 内側は速く、外側は遅く
            });
        }
    }
    
    // 各層に眼球を配置
    function generateEyes(p) {
        eyes = [];
        const cx = MANDALA_SIZE / 2;
        const cy = MANDALA_SIZE / 2;
        
        for (let layer of window.mandalaMeta.layers) {
            for (let j = 0; j < layer.count; j++) {
                const angle = (p.TWO_PI / layer.count) * j;
                const x = cx + p.cos(angle) * layer.radius;
                const y = cy + p.sin(angle) * layer.radius;
                
                // 眼球のサイズは層によって変化
                const eyeRadius = p.lerp(25, 45, layer.id / (LAYERS_COUNT - 1));
                
                const eye = new Eye(
                    p.createVector(x, y, 0),
                    eyeRadius,
                    layer.id,
                    angle
                );
                eyes.push(eye);
            }
        }
    }
    
    // 層を描画（輪のグロー効果）
    function drawLayer(p, cx, cy, layer, rotation) {
        const { radius, colorR, colorG, colorB, thickness, speed, id } = layer;
        
        p.push();
        p.translate(cx, cy);
        p.rotate(rotation * speed * (id % 2 === 0 ? 1 : -1));
        
        // 輪のグロー効果
        p.noFill();
        for (let i = 3; i >= 0; i--) {
            let alpha = 20 + i * 10;
            let weight = thickness * (0.3 + i * 0.2);
            p.stroke(colorR, colorG, colorB, alpha);
            p.strokeWeight(weight);
            p.ellipse(0, 0, radius * 2, radius * 2);
        }
        
        // 内側の明るい輪
        p.stroke(colorR + 50, colorG + 30, colorB + 50, 60);
        p.strokeWeight(2);
        p.ellipse(0, 0, radius * 2, radius * 2);
        
        p.pop();
    }
    
    // 中心の光を描画
    function drawCenterGlow(p, cx, cy) {
        const r = window.mandalaMeta.centerRadius;
        
        // 多重のグロー（青〜紫〜赤のグラデーション）
        for (let i = 8; i >= 0; i--) {
            const size = r * (1 + i * 0.4);
            const alpha = 25 - i * 2.5;
            
            // 青から赤へのグラデーション
            let t = i / 8;
            let cr = p.lerp(60, 200, t);
            let cg = p.lerp(80, 50, t);
            let cb = p.lerp(200, 100, t);
            
            p.fill(cr, cg, cb, alpha);
            p.noStroke();
            p.ellipse(cx, cy, size, size);
        }
        
        // 中心の白い光
        p.fill(255, 255, 255, centerGlow);
        p.ellipse(cx, cy, r * 0.4, r * 0.4);
    }
};

// p5.js インスタンスを作成
new p5(mandalaSketch);

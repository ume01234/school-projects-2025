// =============================================
// 目と華 - メインスケッチ
// 2Dモードで描画（目と花は内部で別々にレンダリング）
// 状態管理: FAR / MIDDLE / NEAR
// =============================================

const STATE_FAR = 'FAR';
const STATE_MIDDLE = 'MIDDLE';
const STATE_NEAR = 'NEAR';

// 閾値（距離0.0〜1.0と仮定。小さいほど近い）
const THRESH_NEAR = 0.33;
const THRESH_MIDDLE = 0.66;

// デバッグ表示（距離と状態を表示）
const DEBUG_OVERLAY = true;

let eyeFlower;
let cornerEyes = [];
let currentState = STATE_FAR;
let targetState = STATE_FAR; // 将来の遷移アニメーション用
let mockDistance = 1.0; // センサー入力の代替

// NEAR状態用
let backgroundFlowers = [];
let redEyeCreatures = [];
let nearStateInitialized = false;

function setup() {
	// 2Dモードでキャンバス作成（合成用）
	createCanvas(windowWidth, windowHeight);
	
	// 目と華のセットを作成
	eyeFlower = new EyeFlower();
	eyeFlower.init({
		scale: 1.0
	});

	initCornerEyes();
	initNearState();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	// 再初期化
	if (eyeFlower) {
		eyeFlower.init({ scale: eyeFlower.scale });
	}
	initCornerEyes();
	initNearState();
}

function draw() {
	// 背景（ミャクミャクの赤）
	background('#CC0000');
	
	// 距離の擬似入力を更新し、状態を決定
	updateDistanceAndState();
	
	// 状態に応じて描画
	if (currentState === STATE_FAR) {
		drawFarState();
	} else if (currentState === STATE_MIDDLE) {
		drawMiddleState();
	} else if (currentState === STATE_NEAR) {
		drawNearState();
	}
	
	// デバッグ表示
	if (DEBUG_OVERLAY) {
		drawDebugOverlay();
	}
}

function keyPressed() {
	// 's'キーで画像を保存
	if (key === 's' || key === 'S') {
		save("eyeFlower_" + month() + '-' + day() + '_' + hour() + '-' + minute() + '-' + second() + ".jpg");
	}
}

// --------------------------------------------------
// 状態判定ロジック（1箇所に集約）
// --------------------------------------------------
function updateDistanceAndState() {
	// ダミー距離: サイン波で 0〜1 を行き来
	mockDistance = map(sin(frameCount * 0.01), -1, 1, 0, 1);
	
	targetState = getStateFromDistance(mockDistance);
	
	// 将来的に遷移アニメーションを入れられるよう、
	// currentState と targetState を分離しているが、
	// 今は即時反映する。
	currentState = targetState;
}

function getStateFromDistance(dist) {
	if (dist <= THRESH_NEAR) return STATE_NEAR;
	if (dist <= THRESH_MIDDLE) return STATE_MIDDLE;
	return STATE_FAR;
}

// --------------------------------------------------
// 描画ハンドラ
// --------------------------------------------------
function drawFarState() {
	if (!eyeFlower) return;
	const cx = width / 2;
	const cy = height / 2;
	eyeFlower.setFloatEnabled(false);
	eyeFlower.setOffsets({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
	eyeFlower.setPositionOverride(cx, cy);
	eyeFlower.draw();
}

function drawMiddleState() {
	if (!eyeFlower) return;
	const cx = width / 2;
	const cy = height / 2;
	const r = min(width, height) * 0.04; // 小さな円軌道
	const t = frameCount * 0.01;
	
	// 同じ円軌道だが周期をわずかにずらす
	const flowerOffset = {
		x: cos(t) * r,
		y: sin(t) * r,
		z: 0
	};
	const eyeOffset = {
		x: cos(t * 1.03 + 0.4) * r,
		y: sin(t * 1.03 + 0.4) * r,
		z: 0
	};

	eyeFlower.setFloatEnabled(false);
	eyeFlower.setOffsets(flowerOffset, eyeOffset);
	eyeFlower.setPositionOverride(cx, cy);
	eyeFlower.draw();

	// 四隅の目（視線のみ動かす）
	for (let eye of cornerEyes) {
		eye.update();
		eye.draw();
	}
}

// --------------------------------------------------
// 周囲の目（中央の目と同じモジュール・サイズを使用）
// --------------------------------------------------
class CornerEye {
	constructor(pos, eyeSize, phase = 0) {
		this.pos = pos;
		this.eyeSize = eyeSize; // 中央の目と同じeyeSize
		this.phase = phase;
		// 各目で異なるノイズオフセット（周期・タイミングをずらす）
		this.gazeNoiseOffsetX = random(1000) + phase * 100;
		this.gazeNoiseOffsetY = random(1000) + phase * 150;
		// 各目で異なる速度（同期を避ける）
		this.gazeSpeedX = 0.004 + phase * 0.001;
		this.gazeSpeedY = 0.003 + phase * 0.0008;
		this.initialized = false;
	}
	
	// setup後に呼び出す（createGraphicsはsetup後でないと動作しないため）
	init() {
		// 中央の目と同じサイズ構成
		const graphicsSize = this.eyeSize * 2;
		this.graphicsSize = graphicsSize;
		this.gfx = createGraphics(graphicsSize, graphicsSize, WEBGL);
		const dep = graphicsSize;
		this.gfx.ortho(-graphicsSize / 2, graphicsSize / 2, graphicsSize / 2, -graphicsSize / 2, -dep * 2, dep * 2);

		this.shader = this.gfx.createShader(vert, frag);
		this.gfx.shader(this.shader);
		this.shader.setUniform("u_resolution", [graphicsSize, graphicsSize]);
		this.shader.setUniform("u_lightDir", [1, -1, -1]);

		// 中央の目と同じeyeRadius（eyeSize * 0.4）
		const eyeRadius = this.eyeSize * 0.4;
		this.eye = new Eye(createVector(0, 0, 0), eyeRadius, this.shader);
		this.initialized = true;
	}

	update() {
		if (!this.initialized) return;
		// 各目で異なる速度・オフセットを使用（同期を避ける）
		const tx = frameCount * this.gazeSpeedX;
		const ty = frameCount * this.gazeSpeedY;
		// 視線を上下左右にゆっくり動かす（焦点が定まらない）
		const gx = (noise(this.gazeNoiseOffsetX + tx) - 0.5) * 600;
		const gy = (noise(this.gazeNoiseOffsetY + ty) - 0.5) * 600;
		this.eye.setTarget(createVector(gx, gy, 300));
		this.eye.update();
	}

	draw() {
		if (!this.initialized) return;
		const g = this.gfx;
		g.clear();
		g.noStroke();

		g.push();
		let angleY = atan2(this.eye.currentTarget.x - this.eye.pos.x, this.eye.currentTarget.z - this.eye.pos.z);
		let angleX = atan2(this.eye.currentTarget.z - this.eye.pos.z, this.eye.currentTarget.y - this.eye.pos.y);
		g.translate(this.eye.pos.x, this.eye.pos.y, this.eye.pos.z);
		g.rotateY(-angleY);
		g.rotateX(angleX + PI / 2);

		this.eye.drawTex();
		g.shader(this.shader);
		this.shader.setUniform("u_tex", this.eye.tex);
		g.sphere(this.eye.radius);
		g.pop();

		push();
		imageMode(CENTER);
		image(this.gfx, this.pos.x, this.pos.y);
		pop();
	}
}

function initCornerEyes() {
	cornerEyes = [];
	
	// 中央の目と同じサイズを使用
	const eyeSize = min(width, height) * 0.3; // eyeFlowerと同じ計算
	
	// 配置位置を中央に寄せる（蓮華との距離を近くする）
	const offsetX = width * 0.28;
	const offsetY = height * 0.28;
	const cx = width / 2;
	const cy = height / 2;
	
	const positions = [
		{ x: cx + offsetX, y: cy - offsetY },  // 右上
		{ x: cx + offsetX, y: cy + offsetY },  // 右下
		{ x: cx - offsetX, y: cy + offsetY },  // 左下
		{ x: cx - offsetX, y: cy - offsetY }   // 左上
	];
	
	positions.forEach((p, idx) => {
		const eye = new CornerEye(p, eyeSize, idx);
		eye.init();
		cornerEyes.push(eye);
	});
}

// --------------------------------------------------
// NEAR状態：背景の蓮華
// --------------------------------------------------
class BackgroundFlower {
	constructor(x, y, size, rotation) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.rotation = rotation;
		this.gfx = null;
		this.initialized = false;
		
		// 花のパラメータ（薄い色）
		this.flowerParams = {
			count: floor(random(30, 60)),
			groupSize: floor(random(3, 6)),
			groupsCount: 0,
			// 薄いピンク/薄い緑（背景用に彩度を下げた色）
			darks: ['#8B6B6B', '#7B8B8B'],
			lights: ['#D4A5A5', '#C5D4C5', '#E8D0D0', '#D0E0D0'],
			rotation: rotation,
			ranges: {
				cx: [-0.2, 1.2],
				cy: [0, 0.7],
				cy2: [0.3, 1.3],
				tx: [-0.2, 0.2],
				ty: [-0.2, 0.2]
			},
			angles: [],
			groups: [],
			c1: null,
			c2: null,
			maxRadius: size * 0.45
		};
	}
	
	init() {
		this.gfx = createGraphics(this.size * 2, this.size * 2);
		let fp = this.flowerParams;
		fp.groupsCount = Math.ceil(fp.count / fp.groupSize);
		
		fp.lights = shuffle([...fp.lights]);
		fp.darks = shuffle([...fp.darks]);
		let cs = shuffle([fp.lights[0], fp.darks[0]]);
		fp.c1 = color(cs[0]);
		fp.c2 = color(cs[1]);
		
		fp.angles = [];
		fp.groups = [];
		let group = -1;
		for (let i = 0; i < fp.count; i++) {
			if (i % fp.groupSize === 0) group++;
			fp.angles.push(i * goldenAngle);
			fp.groups.push(group);
		}
		
		// 静止状態で一度だけ描画
		this.drawToGraphics();
		this.initialized = true;
	}
	
	drawToGraphics() {
		let g = this.gfx;
		let fp = this.flowerParams;
		
		g.clear();
		g.push();
		g.translate(g.width / 2, g.height / 2);
		g.rotate(fp.rotation);
		g.noStroke();
		
		for (let i = fp.count - 1; i >= 0; i--) {
			let angle = fp.angles[i];
			let pct = i / fp.count;
			let sz = fp.maxRadius * pct;
			let alpha = pct > 0.9 ? map(pct, 0.9, 1, 1, 0) : 1;
			
			let c = lerpColor(fp.c1, fp.c2, pct);
			c.setAlpha(alpha * 100); // 薄くする
			
			g.push();
			g.rotate(angle);
			g.fill(c);
			
			// 花びらを描画
			let offset = 0.25;
			let a1 = [offset * -0.25, 0];
			let a2 = [offset * 0.25, 0];
			let top = [0, sz * 1.3];
			let cx1 = 0.5, cx2 = 0.7, cy1 = 0.4, cy2 = 0.7;
			let cpl1 = [sz * -cx1, sz * cy1];
			let cpl2 = [sz * -cx2, sz * cy2];
			let cpr1 = [sz * cx1, sz * cy1];
			let cpr2 = [sz * cx2, sz * cy2];
			
			g.beginShape();
			g.vertex(a1[0], a1[1]);
			g.bezierVertex(cpl1[0], cpl1[1], cpl2[0], cpl2[1], top[0], top[1]);
			g.bezierVertex(cpr2[0], cpr2[1], cpr1[0], cpr1[1], a2[0], a2[1]);
			g.endShape();
			
			g.pop();
		}
		g.pop();
	}
	
	display() {
		if (!this.initialized) return;
		push();
		imageMode(CENTER);
		image(this.gfx, this.x, this.y);
		pop();
	}
}

// --------------------------------------------------
// NEAR状態：青い目（虹彩も瞳孔と同じ青）
// --------------------------------------------------
class BlueEye {
	constructor(pos, radius, shader) {
		this.pos = pos;
		this.radius = radius;
		this.shader = shader;
		this.dMult = random(0.05, 0.1);
		this.currentTarget = createVector(0, 0, 1);
		this.target = createVector(0, 0, 1);
		this.tex = createGraphics(this.radius * 4, this.radius * 2);
	}
	
	setTarget(targetPos) {
		this.target = targetPos;
	}
	
	update() {
		this.currentTarget.add(p5.Vector.sub(this.target, this.currentTarget).mult(this.dMult));
	}
	
	drawTex() {
		this.tex.ellipseMode(CENTER);
		this.tex.noStroke();
		this.tex.background("#F4F8FB"); // 白い強膜
		let diameter = this.tex.width * 0.2;
		let noiseMult = noise(this.pos.x + sin((frameCount / 100) * TWO_PI));
		diameter += (noiseMult - 0.5) / 5 * diameter;
		
		// 虹彩全体を青に（瞳孔と同色）
		this.tex.fill("#0066DD");
		this.tex.ellipse(this.tex.width / 2, this.tex.height / 2, diameter, diameter);
		
		// 放射状パターンなし（全て青一色）
		
		// 瞳孔（同じ青）
		diameter *= 0.5;
		this.tex.fill("#0055CC");
		this.tex.ellipse(this.tex.width / 2, this.tex.height / 2, diameter, diameter);
		
		// ハイライト
		diameter *= 0.5;
		this.tex.fill(255, 100);
		this.tex.ellipse(this.tex.width * 0.55, this.tex.height * 0.4, diameter, diameter);
	}
}

// --------------------------------------------------
// NEAR状態：赤と目の融合体（生命体）
// --------------------------------------------------
class RedEyeCreature {
	constructor(x, y, eyeSize) {
		this.pos = createVector(x, y);
		this.eyeSize = eyeSize;
		this.id = random(100000);
		
		// 移動用ノイズオフセット（ゆっくり漂う）
		this.noiseOffsetX = random(1000);
		this.noiseOffsetY = random(1000);
		this.moveSpeed = 0.0008 + random(0.0005); // より遅く
		this.moveRange = min(width, height) * 0.35;
		
		// 視線用ノイズオフセット
		this.gazeNoiseX = random(1000);
		this.gazeNoiseY = random(1000);
		this.gazeSpeed = 0.004 + random(0.002);
		
		// スライムの形状用（うねうね感を強調）
		this.slimeNoiseOffset = random(1000);
		this.slimeVertices = 24; // 頂点数を増やして滑らかに
		this.slimeWaveSpeed = 0.015 + random(0.01); // うねりの速度
		this.slimeWaveAmplitude = 0.6; // うねりの振幅
		
		// 描画用グラフィックス
		this.gfx = null;
		this.shader = null;
		this.eye = null;
		this.initialized = false;
		
		// 融合用
		this.isAbsorbed = false;
		this.absorbTarget = null;
	}
	
	init() {
		const graphicsSize = this.eyeSize * 3;
		this.graphicsSize = graphicsSize;
		this.gfx = createGraphics(graphicsSize, graphicsSize, WEBGL);
		const dep = graphicsSize;
		this.gfx.ortho(-graphicsSize / 2, graphicsSize / 2, graphicsSize / 2, -graphicsSize / 2, -dep * 2, dep * 2);
		
		this.shader = this.gfx.createShader(vert, frag);
		this.gfx.shader(this.shader);
		this.shader.setUniform("u_resolution", [graphicsSize, graphicsSize]);
		this.shader.setUniform("u_lightDir", [1, -1, -1]);
		
		const eyeRadius = this.eyeSize * 0.4;
		this.eye = new BlueEye(createVector(0, 0, 0), eyeRadius, this.shader);
		this.eyeRadius = eyeRadius;
		
		this.initialized = true;
	}
	
	update() {
		if (!this.initialized || this.isAbsorbed) return;
		
		// 移動（ゆっくり漂うような動き）
		const t = frameCount * this.moveSpeed;
		const targetX = width / 2 + (noise(this.noiseOffsetX + t) - 0.5) * this.moveRange * 2;
		const targetY = height / 2 + (noise(this.noiseOffsetY + t) - 0.5) * this.moveRange * 2;
		
		// 非常にゆっくり目標に向かう
		this.pos.x += (targetX - this.pos.x) * 0.005;
		this.pos.y += (targetY - this.pos.y) * 0.005;
		
		// 視線（完全にランダム、焦点定まらず）
		const gt = frameCount * this.gazeSpeed;
		const gx = (noise(this.gazeNoiseX + gt) - 0.5) * 800;
		const gy = (noise(this.gazeNoiseY + gt * 0.8) - 0.5) * 800;
		this.eye.setTarget(createVector(gx, gy, 300));
		this.eye.update();
	}
	
	draw() {
		if (!this.initialized || this.isAbsorbed) return;
		
		const g = this.gfx;
		g.clear();
		g.noStroke();
		
		// スライム状の赤い物体を描画
		this.drawSlime(g);
		
		// 目を描画
		g.push();
		let angleY = atan2(this.eye.currentTarget.x - this.eye.pos.x, this.eye.currentTarget.z - this.eye.pos.z);
		let angleX = atan2(this.eye.currentTarget.z - this.eye.pos.z, this.eye.currentTarget.y - this.eye.pos.y);
		g.translate(this.eye.pos.x, this.eye.pos.y, this.eye.pos.z);
		g.rotateY(-angleY);
		g.rotateX(angleX + PI / 2);
		
		this.eye.drawTex();
		g.shader(this.shader);
		this.shader.setUniform("u_tex", this.eye.tex);
		g.sphere(this.eye.radius);
		g.pop();
		
		// メインキャンバスに描画
		push();
		imageMode(CENTER);
		image(this.gfx, this.pos.x, this.pos.y);
		pop();
	}
	
	drawSlime(g) {
		// スライム状の赤い物体（ビビッドな赤、腸・芋虫のようなうねうね感）
		g.push();
		g.resetShader();
		g.fill('#FF2222'); // ミャクミャクらしいビビッドな赤
		g.noStroke();
		
		const baseRadius = this.eyeRadius * 1.6;
		const t = frameCount * this.slimeWaveSpeed + this.slimeNoiseOffset;
		
		g.beginShape();
		for (let i = 0; i < this.slimeVertices; i++) {
			const angle = (TWO_PI / this.slimeVertices) * i;
			
			// 複数のノイズ層を重ねて腸のようなうねりを作る
			// 低周波のうねり（大きな波）
			const lowFreqNoise = noise(
				this.slimeNoiseOffset + cos(angle * 2) * 0.5 + t * 0.7,
				sin(angle * 2) * 0.5 + t * 0.5
			);
			// 高周波のうねり（細かい波、芋虫の節のような）
			const highFreqNoise = noise(
				this.slimeNoiseOffset * 2 + cos(angle * 5) + t * 1.5,
				sin(angle * 5) + t * 1.2
			);
			// 回転するうねり（腸が蠕動するような）
			const waveNoise = sin(angle * 3 + t * 2) * 0.15;
			
			// ノイズを組み合わせる
			const combinedNoise = lowFreqNoise * 0.5 + highFreqNoise * 0.3 + waveNoise;
			const r = baseRadius * (0.7 + combinedNoise * this.slimeWaveAmplitude);
			
			const x = cos(angle) * r;
			const y = sin(angle) * r;
			g.curveVertex(x, y);
		}
		// 閉じるために最初の数点を繰り返す
		for (let i = 0; i < 3; i++) {
			const angle = (TWO_PI / this.slimeVertices) * i;
			
			const lowFreqNoise = noise(
				this.slimeNoiseOffset + cos(angle * 2) * 0.5 + t * 0.7,
				sin(angle * 2) * 0.5 + t * 0.5
			);
			const highFreqNoise = noise(
				this.slimeNoiseOffset * 2 + cos(angle * 5) + t * 1.5,
				sin(angle * 5) + t * 1.2
			);
			const waveNoise = sin(angle * 3 + t * 2) * 0.15;
			
			const combinedNoise = lowFreqNoise * 0.5 + highFreqNoise * 0.3 + waveNoise;
			const r = baseRadius * (0.7 + combinedNoise * this.slimeWaveAmplitude);
			
			const x = cos(angle) * r;
			const y = sin(angle) * r;
			g.curveVertex(x, y);
		}
		g.endShape();
		g.pop();
	}
	
	// 他の融合体との衝突判定
	checkCollision(other) {
		if (this.isAbsorbed || other.isAbsorbed) return false;
		if (this.id === other.id) return false;
		
		const dist = p5.Vector.dist(this.pos, other.pos);
		const threshold = this.eyeRadius * 2;
		return dist < threshold;
	}
	
	// 吸収される
	absorb() {
		this.isAbsorbed = true;
	}
}

// --------------------------------------------------
// NEAR状態の初期化と描画
// --------------------------------------------------
function initNearState() {
	// 背景の蓮華を配置
	backgroundFlowers = [];
	const flowerSize = min(width, height) * 0.25;
	const cols = ceil(width / flowerSize) + 1;
	const rows = ceil(height / flowerSize) + 1;
	
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const x = col * flowerSize + (row % 2) * flowerSize * 0.5;
			const y = row * flowerSize * 0.8;
			const flower = new BackgroundFlower(x, y, flowerSize, random(TWO_PI));
			flower.init();
			backgroundFlowers.push(flower);
		}
	}
	
	// 赤と目の融合体を5体配置
	redEyeCreatures = [];
	const eyeSize = min(width, height) * 0.3;
	const margin = min(width, height) * 0.2;
	const positions = [
		{ x: margin, y: margin },                    // 左上
		{ x: margin, y: height - margin },           // 左下
		{ x: width - margin, y: margin },            // 右上
		{ x: width - margin, y: height - margin },   // 右下
		{ x: width / 2, y: height / 2 }              // 中央
	];
	
	positions.forEach(p => {
		const creature = new RedEyeCreature(p.x, p.y, eyeSize);
		creature.init();
		redEyeCreatures.push(creature);
	});
	
	nearStateInitialized = true;
}

function drawNearState() {
	if (!nearStateInitialized) return;
	
	// 背景の蓮華を描画
	for (let flower of backgroundFlowers) {
		flower.display();
	}
	
	// 融合チェックと新規生成
	checkCreatureFusions();
	
	// 赤と目の融合体を更新・描画
	for (let creature of redEyeCreatures) {
		creature.update();
		creature.draw();
	}
}

function checkCreatureFusions() {
	// 融合チェック
	for (let i = 0; i < redEyeCreatures.length; i++) {
		for (let j = i + 1; j < redEyeCreatures.length; j++) {
			const a = redEyeCreatures[i];
			const b = redEyeCreatures[j];
			
			if (a.checkCollision(b)) {
				// bをaに吸収
				b.absorb();
				
				// 新しい融合体を別の場所に生成
				spawnNewCreature();
				break;
			}
		}
	}
	
	// 吸収された融合体を削除
	redEyeCreatures = redEyeCreatures.filter(c => !c.isAbsorbed);
}

function spawnNewCreature() {
	const eyeSize = min(width, height) * 0.3;
	const margin = eyeSize;
	
	// ランダムな位置に生成（既存の融合体から離れた場所を試みる）
	let newX, newY;
	let attempts = 0;
	do {
		newX = random(margin, width - margin);
		newY = random(margin, height - margin);
		attempts++;
	} while (attempts < 10 && isNearExistingCreature(newX, newY));
	
	const creature = new RedEyeCreature(newX, newY, eyeSize);
	creature.init();
	redEyeCreatures.push(creature);
}

function isNearExistingCreature(x, y) {
	const threshold = min(width, height) * 0.2;
	for (let c of redEyeCreatures) {
		if (!c.isAbsorbed) {
			const d = dist(x, y, c.pos.x, c.pos.y);
			if (d < threshold) return true;
		}
	}
	return false;
}

// --------------------------------------------------
// デバッグ表示
// --------------------------------------------------
function drawDebugOverlay() {
	push();
	fill(255);
	noStroke();
	textSize(16);
	textAlign(LEFT, TOP);
	const lines = [
		`distance: ${mockDistance.toFixed(2)}`,
		`state: ${currentState}`
	];
	if (currentState === STATE_NEAR) {
		lines.push(`creatures: ${redEyeCreatures.filter(c => !c.isAbsorbed).length}`);
	}
	text(lines.join('\n'), 12, 12);
	pop();
}

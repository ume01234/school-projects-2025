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

function setup() {
	// 2Dモードでキャンバス作成（合成用）
	createCanvas(windowWidth, windowHeight);
	
	// 目と華のセットを作成
	eyeFlower = new EyeFlower();
	eyeFlower.init({
		scale: 1.0
	});

	initCornerEyes();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	// 再初期化
	if (eyeFlower) {
		eyeFlower.init({ scale: eyeFlower.scale });
	}
	initCornerEyes();
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
	}
	// MIDDLE / NEAR は仕様により何も描画しない（背景のみ）
	
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
	text(lines.join('\\n'), 12, 12);
	pop();
}

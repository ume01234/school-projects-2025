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
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	// 再初期化
	if (eyeFlower) {
		eyeFlower.init({ scale: eyeFlower.scale });
	}
}

function draw() {
	// 背景（ミャクミャクの赤）
	background('#CC0000');
	
	// 距離の擬似入力を更新し、状態を決定
	updateDistanceAndState();
	
	// 状態に応じて描画
	if (currentState === STATE_FAR) {
		eyeFlower.draw();
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

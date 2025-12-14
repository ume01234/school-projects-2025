// =============================================
// 目と華 - メインスケッチ
// 2Dモードで描画（目と花は内部で別々にレンダリング）
// =============================================

let eyeFlower;

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
	
	// 目と華を描画
	eyeFlower.draw();
}

function keyPressed() {
	// 's'キーで画像を保存
	if (key === 's' || key === 'S') {
		save("eyeFlower_" + month() + '-' + day() + '_' + hour() + '-' + minute() + '-' + second() + ".jpg");
	}
}

// ミャクミャク・カラーパレット定義
const MYAKU_RED = '#E60012';   // 鮮やかな赤（肉体）
const MYAKU_BLUE = '#009AD6';  // 鮮やかな青（瞳孔）
const MYAKU_WHITE = '#FFFFFF'; // 白（強膜/眼球）
const BG_COLOR = '#000000';    // 黒（宇宙/深淵）

function setup() {
	createCanvas(900, 900);
	rectMode(CENTER);
	background(BG_COLOR); // 背景を黒に変更

	translate(width / 2, height / 2);
	scale(0.9);
	translate(-width / 2, -height / 2);

	// 1. 下層：肉体と眼球のベースを描画
	drawMolecularPattern(12);

	let count = 12;
	let cellSize = width / count;
	noFill();
	
	// 2. 上層：瞳孔と装飾
	for (let i = 0; i < count; i++) {
		for (let j = 0; j < count; j++) {
			let x = i * cellSize + cellSize / 2;
			let y = j * cellSize + cellSize / 2;

			// 周囲の粒子（細胞のような装飾）
			stroke(MYAKU_RED); // 赤い粒子に
			strokeWeight(1);
			for (let a = 0; a < TAU; a += TAU / 80) {
				// 少しランダム感を出しても面白いですが、元の幾何学性を維持
				point(x + cellSize * 0.5 * cos(a), y + cellSize * 0.5 * sin(a));
			}
			noStroke();

			// 接続部の装飾
			fill(MYAKU_RED);
			if (i != 0 && j != 0) {
				if ((i + j) % 2 == 0) {
					circle(x - cellSize / 2, y - cellSize / 2, cellSize * 0.2);
				}
			}

			// ★瞳孔（青い目）
			fill(MYAKU_BLUE);
			noStroke();
			// 少し位置をずらして視線を感じさせる（元のコードの仕様）
			let pupilX = x + cellSize * 0.075;
			let pupilY = y - cellSize * 0.075;
			let pupilSize = cellSize * 0.4;
			circle(pupilX, pupilY, pupilSize);

			// ★追加要素：ハイライト（ヌメッとした光沢）
			// これがあるだけで「目」としての強度が上がります
			fill(255, 200); // 半透明の白
			circle(pupilX + pupilSize * 0.25, pupilY - pupilSize * 0.25, pupilSize * 0.25);
		}
	}
}

function drawMolecularPattern(count) {
	let cellSize = width / count;
	for (let i = 0; i < count; i++) {
		for (let j = 0; j < count; j++) {
			let x = i * cellSize + cellSize / 2;
			let y = j * cellSize + cellSize / 2;
			
			// 接続部分（肉体）の描画
			stroke(MYAKU_RED); // 枠線も赤
			if (((i + j) % 2 == 0)) {
				if ((i % 2 == 0) && (j != 0) && (i != (count - 1))) {
					noStroke();
					fill(MYAKU_RED); // ★ここを赤に変更
					beginShape();
					for (let a = 0; a < PI / 2; a += PI / 45) {
						let xx = x + ((cellSize * 1.25) / 2) * cos(a);
						let yy = y - cellSize + ((cellSize * 1.25) / 2) * sin(a);
						vertex(xx, yy);
					}
					for (let a = PI; a < PI * 1.5; a += PI / 45) {
						let xx = x + cellSize + ((cellSize * 1.25) / 2) * cos(a);
						let yy = y + ((cellSize * 1.25) / 2) * sin(a);
						vertex(xx, yy);
					}
					endShape();
				}
			} else {
				if (i % 2 != 0 && (i != (count - 1)) && (j != (count - 1))) {
					noStroke();
					fill(MYAKU_RED); // ★ここを赤に変更
					beginShape();
					for (let a = PI * 1.5; a < TAU; a += PI / 45) {
						let xx = x + ((cellSize * 1.25) / 2) * cos(a);
						let yy = y + cellSize + ((cellSize * 1.25) / 2) * sin(a);
						vertex(xx, yy);
					}

					for (let a = PI * 0.5; a < PI; a += PI / 45) {
						let xx = x + cellSize + ((cellSize * 1.25) / 2) * cos(a);
						let yy = y + ((cellSize * 1.25) / 2) * sin(a);
						vertex(xx, yy);
					}
					endShape();
				}
			}
			
			// 眼球（白目部分）の描画
			noStroke();
			fill(MYAKU_WHITE); // ★ここを白に変更
			circle(x, y, cellSize * 0.75);
		}
	}
}

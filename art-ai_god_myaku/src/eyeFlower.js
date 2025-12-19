// =============================================
// EyeFlower - 目と華のセットを描画するモジュール
// 2パスレンダリング方式：目と花を別々に描画して合成
// =============================================

class EyeFlower {
	constructor() {
		// 位置とスケール
		this.position = { x: 0, y: 0 };
		this.basePosition = { x: 0, y: 0 };
		this.scale = 1.0;
		this.useFloat = true;            // 浮遊アニメーションを使うか
		this.positionOverride = null;    // 外部から一時的に位置を指定
		this.flowerOffset = { x: 0, y: 0, z: 0 }; // 花のオフセット
		this.eyeOffset = { x: 0, y: 0, z: 0 };    // 目のオフセット
		
		// 浮遊アニメーション用
		this.noiseOffsetX = random(1000);
		this.noiseOffsetY = random(1000);
		this.noiseSpeed = 0.005;
		this.floatRangeX = 100;
		this.floatRangeY = 80;
		
		// 視線アニメーション用
		this.gazeNoiseOffsetX = random(1000);
		this.gazeNoiseOffsetY = random(1000);
		this.gazeNoiseSpeed = 0.008;
		this.gazeRange = 300;
		
		// 外部からの視線ターゲット（観客追従用）
		this.externalGazeTarget = null; // nullの場合はランダム視線を使用
		this.useExternalGaze = false;
		
		// 目専用のWEBGLグラフィックス
		this.eyeGraphics = null;
		this.eyeSize = 0;
		this.eyeShader = null;
		this.eye = null;
		this.wall = null;
		this.eyeZ = 0;
		
		// 花用のグラフィックス
		this.flowerGraphics = null;
		this.flowerSize = 0;
		
		// 花のパラメータ
		this.flowerParams = {
			count: 0,
			groupSize: 0,
			groupsCount: 0,
			darks: ['#C71585'],  // ピンク（濃い）
			lights: ['#FFB6C1', '#FF69B4'],  // ピンク（薄い）
			petalSpeed: 0.0005,
			rotation: 0,
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
			maxRadius: 0
		};
		
		this.initialized = false;
	}
	
	// 初期化
	init(options = {}) {
		this.scale = options.scale || 1.0;
		this.position = options.position || { x: width / 2, y: height / 2 };
		this.basePosition = { ...this.position };
		
		// サイズ設定
		this.eyeSize = min(width, height) * 0.3 * this.scale;
		this.flowerSize = this.eyeSize * 2.5; // 華を少し大きく
		
		// 目専用のWEBGLグラフィックスを作成
		let eyeGraphicsSize = this.eyeSize * 2;
		this.eyeGraphics = createGraphics(eyeGraphicsSize, eyeGraphicsSize, WEBGL);
		
		// 目のグラフィックス用の設定
		let eg = this.eyeGraphics;
		let dep = eyeGraphicsSize;
		eg.ortho(-eyeGraphicsSize / 2, eyeGraphicsSize / 2, eyeGraphicsSize / 2, -eyeGraphicsSize / 2, -dep * 2, dep * 2);
		
		this.eyeZ = eyeGraphicsSize / 2 / tan((30 * PI) / 180);
		this.wall = new IntersectPlane(0, 0, 1, 0, 0, 300);
		
		// シェーダー設定
		this.eyeShader = eg.createShader(vert, frag);
		eg.shader(this.eyeShader);
		this.eyeShader.setUniform("u_resolution", [eyeGraphicsSize, eyeGraphicsSize]);
		this.eyeShader.setUniform("u_lightDir", [1, -1, -1]);
		
		// 目を作成（グラフィックスの中央に配置）
		let eyeRadius = this.eyeSize * 0.4;
		this.eye = new Eye(createVector(0, 0, 0), eyeRadius, this.eyeShader);
		
		// 花のグラフィックスを作成
		this.flowerGraphics = createGraphics(this.flowerSize * 2, this.flowerSize * 2);
		this.initFlowerParams();
		
		// 浮遊範囲を設定
		this.floatRangeX = width * 0.3;
		this.floatRangeY = height * 0.25;
		this.useFloat = true;
		this.positionOverride = null;
		this.flowerOffset = { x: 0, y: 0, z: 0 };
		this.eyeOffset = { x: 0, y: 0, z: 0 };
		
		this.initialized = true;
	}
	
	// 花のパラメータを初期化
	initFlowerParams() {
		let fp = this.flowerParams;
		fp.count = floor(random(40, 100));
		fp.groupSize = floor(random(3, 8));
		fp.groupsCount = Math.ceil(fp.count / fp.groupSize);
		
		fp.lights = shuffle([...fp.lights]);
		fp.darks = shuffle([...fp.darks]);
		let cs = shuffle([fp.lights[0], fp.darks[0]]);
		fp.c1 = color(cs[0]);
		fp.c2 = color(cs[1]);
		
		fp.rotation = random(PI * 2);
		fp.maxRadius = this.flowerSize * 0.45;
		
		fp.angles = [];
		fp.groups = [];
		
		let group = -1;
		for (let i = 0; i < fp.count; i++) {
			if (i % fp.groupSize === 0) group++;
			fp.angles.push(i * goldenAngle);
			fp.groups.push(group);
		}
	}
	
	// ランダムな視線を計算（目のグラフィックス内のローカル座標）
	calculateRandomGaze() {
		let t = frameCount * this.gazeNoiseSpeed;
		let gx = (noise(this.gazeNoiseOffsetX + t) - 0.5) * this.gazeRange * 2;
		let gy = (noise(this.gazeNoiseOffsetY + t) - 0.5) * this.gazeRange * 2;
		
		return createVector(gx, gy, 300);
	}
	
	// 浮遊位置を計算
	calculateFloatPosition() {
		let t = frameCount * this.noiseSpeed;
		let nx = noise(this.noiseOffsetX + t) - 0.5;
		let ny = noise(this.noiseOffsetY + t) - 0.5;
		
		return {
			x: width / 2 + nx * this.floatRangeX * 2,
			y: height / 2 + ny * this.floatRangeY * 2
		};
	}
	
	// 目を専用グラフィックスに描画
	drawEyeToGraphics() {
		let eg = this.eyeGraphics;
		
		eg.clear();
		eg.background(0, 0, 0, 0); // 透明背景
		eg.noStroke();
		
		// 視線を更新（外部ターゲットがあればそれを使用、なければランダム）
		let gaze;
		if (this.useExternalGaze && this.externalGazeTarget) {
			gaze = this.externalGazeTarget;
		} else {
			gaze = this.calculateRandomGaze();
		}
		this.eye.setTarget(gaze);
		this.eye.update();
		
		// 目を描画
		eg.push();
		
		let angleY = atan2(this.eye.currentTarget.x - this.eye.pos.x, this.eye.currentTarget.z - this.eye.pos.z);
		let angleX = atan2(this.eye.currentTarget.z - this.eye.pos.z, this.eye.currentTarget.y - this.eye.pos.y);
		
		eg.translate(this.eye.pos.x, this.eye.pos.y, this.eye.pos.z);
		eg.rotateY(-angleY);
		eg.rotateX(angleX + PI / 2);
		
		// テクスチャを描画
		this.eye.drawTex();
		
		// シェーダーを適用
		eg.shader(this.eyeShader);
		this.eyeShader.setUniform("u_tex", this.eye.tex);
		eg.sphere(this.eye.radius);
		
		eg.pop();
	}
	
	// 花をグラフィックスに描画
	drawFlowerToGraphics() {
		let g = this.flowerGraphics;
		let fp = this.flowerParams;
		let ms = millis();
		
		g.clear();
		g.push();
		g.translate(g.width / 2, g.height / 2);
		g.rotate(fp.rotation);
		g.noStroke();
		
		let groupVals = [];
		for (let i = 0; i < fp.groupsCount; i++) {
			let vals = {
				cx1: map(noise(ms * fp.petalSpeed * 0.6, i * 2), 0, 1, fp.ranges.cx[0], fp.ranges.cx[1]),
				cx2: map(noise(ms * fp.petalSpeed * 0.9, i * 4), 0, 1, fp.ranges.cx[0], fp.ranges.cx[1]),
				cy1: map(noise(ms * fp.petalSpeed * 0.4, i * 1), 0, 1, fp.ranges.cy[0], fp.ranges.cy[1]),
				cy2: map(noise(ms * fp.petalSpeed * 0.7, i * 3), 0, 1, fp.ranges.cy2[0], fp.ranges.cy2[1]),
				tx: map(noise(ms * fp.petalSpeed * 0.5, i * 2), 0, 1, fp.ranges.tx[0], fp.ranges.tx[1]),
				ty: map(noise(ms * fp.petalSpeed * 1.2, i * 1), 0, 1, fp.ranges.ty[0], fp.ranges.ty[1]),
			};
			groupVals.push(vals);
		}
		
		for (let i = fp.count - 1; i >= 0; i--) {
			let angle = fp.angles[i];
			let group = fp.groups[i];
			let pct = i / fp.count;
			let sz = fp.maxRadius * pct;
			let alpha = pct > 0.9 ? map(pct, 0.9, 1, 1, 0) : 1;
			
			let c = lerpColor(fp.c1, fp.c2, pct);
			c.setAlpha(alpha * 255);
			
			let vals = groupVals[group];
			let { cx1, cx2, cy1, cy2, tx, ty } = vals;
			
			g.push();
			g.rotate(angle);
			g.fill(c);
			this.drawPetalOnGraphics(g, sz, 0.25, cx1, cx2, cy1, cy2, tx, ty);
			g.pop();
		}
		
		g.pop();
	}
	
	// createGraphics上に花びらを描画
	drawPetalOnGraphics(g, sz, offset, cx1, cx2, cy1, cy2, tx, ty) {
		let a1 = [offset * -0.25, 0];
		let a2 = [offset * 0.25, 0];
		let top = [0 + tx * sz, sz * 1.3 + ty * sz];
		let cpl1 = [sz * -cx1, sz * cy1];
		let cpl2 = [sz * -cx2, sz * cy2];
		let cpr1 = [sz * cx1, sz * cy1];
		let cpr2 = [sz * cx2, sz * cy2];
		
		g.beginShape();
		g.vertex(a1[0], a1[1]);
		g.bezierVertex(cpl1[0], cpl1[1], cpl2[0], cpl2[1], top[0], top[1]);
		g.bezierVertex(cpr2[0], cpr2[1], cpr1[0], cpr1[1], a2[0], a2[1]);
		g.endShape();
	}
	
	// 更新
	update() {
		if (!this.initialized) return;
		
		if (this.positionOverride) {
			this.position = { ...this.positionOverride };
			this.positionOverride = null; // 毎フレームリセット
		} else if (this.useFloat) {
			this.position = this.calculateFloatPosition();
		} else {
			this.position = { ...this.basePosition };
		}
	}
	
	// 描画
	display() {
		if (!this.initialized) return;
		
		// 花を描画
		this.drawFlowerToGraphics();
		
		// 目を描画
		this.drawEyeToGraphics();
		
		// メインキャンバスに合成（2Dモードで描画）
		push();
		imageMode(CENTER);
		
		// 花を描画
		image(this.flowerGraphics, this.position.x + this.flowerOffset.x, this.position.y + this.flowerOffset.y);
		
		// 目を上に重ねて描画
		image(this.eyeGraphics, this.position.x + this.eyeOffset.x, this.position.y + this.eyeOffset.y);
		
		pop();
	}
	
	// 更新と描画を一括
	draw() {
		this.update();
		this.display();
	}
	
	// 位置を設定
	setPosition(x, y) {
		this.position = { x, y };
		this.basePosition = { x, y };
	}
	
	// スケールを設定
	setScale(scale) {
		this.scale = scale;
		// 再初期化が必要
		this.init({ scale: scale, position: this.position });
	}
	
	// 浮遊速度を設定
	setFloatSpeed(speed) {
		this.noiseSpeed = speed;
	}
	
	// 視線の動きの速度を設定
	setGazeSpeed(speed) {
		this.gazeNoiseSpeed = speed;
	}

	// 浮遊オン/オフ
	setFloatEnabled(flag) {
		this.useFloat = flag;
	}

	// 浮遊範囲を調整
	setFloatRange(rx, ry) {
		this.floatRangeX = rx;
		this.floatRangeY = ry;
	}

	// ベース位置を設定
	setBasePosition(x, y) {
		this.basePosition = { x, y };
	}

	// 1フレーム限定で位置を上書き（更新後に自動クリア）
	setPositionOverride(x, y) {
		this.positionOverride = { x, y };
	}

	// 花・目それぞれのオフセットを設定
	setOffsets(flowerOffset, eyeOffset) {
		if (flowerOffset) this.flowerOffset = { ...flowerOffset };
		if (eyeOffset) this.eyeOffset = { ...eyeOffset };
	}
	
	// 外部から視線ターゲットを設定（観客追従用）
	setGazeTarget(target) {
		this.externalGazeTarget = target;
		this.useExternalGaze = true;
	}
	
	// 視線ターゲットをクリア（ランダム視線に戻す）
	clearGazeTarget() {
		this.externalGazeTarget = null;
		this.useExternalGaze = false;
	}
}

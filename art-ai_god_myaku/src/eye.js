// =============================================
// EyeRenderer - 目を描画するためのモジュール
// 外部から呼び出し可能
// =============================================

const CYCLE = 100;

class EyeRenderer {
	constructor() {
		this.wall = null;
		this.eyeZ = 0;
		this.shader = null;
		this.eye = null;
		this.initialized = false;
	}
	
	// 初期化（p5.jsのsetup内で呼び出す）
	// canvasは呼び出し側で作成済みであることを想定
	init(options = {}) {
		const radius = options.radius || min(width, height) * 0.35;
		const pos = options.pos || createVector(0, 0, 0);
		
		let dep = max(width, height);
		ortho(-width / 2, width / 2, height / 2, -height / 2, -dep * 2, dep * 2);
		
		this.eyeZ = height / 2 / tan((30 * PI) / 180);
		this.wall = new IntersectPlane(0, 0, 1, 0, 0, 300);
		
		noStroke();
		
		// シェーダー設定
		this.shader = createShader(vert, frag);
		shader(this.shader);
		this.shader.setUniform("u_resolution", [width, height]);
		this.shader.setUniform("u_lightDir", [1, -1, -1]);
		
		// 中央に1つの目を作成
		this.eye = new Eye(pos, radius, this.shader);
		
		this.initialized = true;
	}
	
	// マウス位置から3D空間上の座標を計算
	calculateMousePos(mx, my) {
		let x = mx - width / 2;
		let y = (my - height / 2) * -1;
		
		const Q = createVector(0, 0, this.eyeZ);
		const v = createVector(x, y, -this.eyeZ);
		let closestLambda = this.eyeZ * 10;
		let lambda = this.wall.getLambda(Q, v);
		
		if (lambda < closestLambda && lambda > 0) {
			let intersect = p5.Vector.add(Q, p5.Vector.mult(v, lambda));
			return createVector(intersect.x, intersect.y, intersect.z);
		}
		return createVector(0, 0, 300);
	}
	
	// 更新と描画（p5.jsのdraw内で呼び出す）
	update(targetPos = null) {
		if (!this.initialized || !this.eye) return;
		
		// ターゲット位置の設定（指定がなければマウス位置を使用）
		if (targetPos) {
			this.eye.setTarget(targetPos);
		} else {
			const mousePos = this.calculateMousePos(mouseX, mouseY);
			this.eye.setTarget(mousePos);
		}
		
		this.eye.update();
	}
	
	// 描画のみ
	display() {
		if (!this.initialized || !this.eye) return;
		shader(this.shader);
		this.eye.display();
	}
	
	// 更新と描画を一括で行う
	draw(targetPos = null) {
		this.update(targetPos);
		this.display();
	}
	
	// 目の位置を設定
	setPosition(pos) {
		if (this.eye) {
			this.eye.pos = pos;
		}
	}
	
	// 目のサイズを設定
	setRadius(radius) {
		if (this.eye) {
			this.eye.radius = radius;
			this.eye.tex = createGraphics(radius * 4, radius * 2);
		}
	}
	
	// シェーダーを取得（外部からuniformを設定する場合）
	getShader() {
		return this.shader;
	}
	
	// Eyeインスタンスを取得
	getEye() {
		return this.eye;
	}
}

// グローバルなEyeRendererインスタンス（シンプルな使用のため）
let eyeRenderer = null;

// =============================================
// スタンドアロンで使用する場合のsetup/draw
// 外部から呼び出す場合は使用しない
// EYE_STANDALONE を true に設定すると有効化
// =============================================
if (typeof EYE_STANDALONE !== 'undefined' && EYE_STANDALONE) {
	window.setup = function() {
		createCanvas(1112, 834, WEBGL);
		mouseX = width / 2;
		mouseY = height / 2;
		
		eyeRenderer = new EyeRenderer();
		eyeRenderer.init();
	};

	window.draw = function() {
		background('#002D52');
		eyeRenderer.draw();
	};
}



class Eye
{
	constructor(_pos, _radius, _shader)
	{
		this.pos = _pos;
		this.radius = _radius;
		this.shader = _shader;
		this.dMult = random(0.05, 0.1);
		this.currentTarget = createVector(0, 0, 1);
		this.target = createVector(0, 0, 1);
		this.tex = createGraphics(this.radius * 4, this.radius * 2);
	}
	
	setTarget(_targetPos)
	{
		this.target = _targetPos;
	}

	update()
	{
		this.currentTarget.add(p5.Vector.sub(this.target, this.currentTarget).mult(this.dMult));
	}
	
	drawTex()
	{
		this.tex.ellipseMode(CENTER);
		this.tex.noStroke();
		this.tex.background("#F4F8FB");  // 白い強膜
		let diameter = this.tex.width * 0.2;
		let noiseMult = noise(this.pos.x + sin((frameCount / CYCLE) * TWO_PI));
		diameter += (noiseMult - 0.5) / 5 * diameter;
		
		// 虹彩の外側（濃い青）
		this.tex.fill("#1A2A4D");
		this.tex.ellipse(this.tex.width / 2, this.tex.height / 2, diameter, diameter);
		
		// 放射状の虹彩パターン（明るい水色系の青でコントラストを出す）
		this.tex.push();
		this.tex.translate(this.tex.width / 2, this.tex.height / 2);
		for(let r = 0; r < TWO_PI; r += PI / 30)
		{
			this.tex.stroke("#5599DDCC");
			this.tex.push();
			this.tex.rotate(r);
			this.tex.line(0, 0, diameter / 2, 0);
			this.tex.pop();
		}
		this.tex.pop();
		this.tex.noStroke();
		
		// 瞳孔（ミャクミャクの青）
		diameter *= 0.5;
		this.tex.fill("#0066DD");
		this.tex.ellipse(this.tex.width / 2, this.tex.height / 2, diameter, diameter);
		
		// ハイライト
		diameter *= 0.5;
		this.tex.fill(255, 100);
		this.tex.ellipse(this.tex.width * 0.55, this.tex.height * 0.4, diameter, diameter);
	}

	
	display()
	{
		let angleY = atan2(this.currentTarget.x - this.pos.x, this.currentTarget.z - this.pos.z);
		let angleX = atan2(this.currentTarget.z - this.pos.z, this.currentTarget.y - this.pos.y);
		push();
		translate(this.pos);
		rotateY(-angleY);
		rotateX(angleX + PI / 2);
		
		this.drawTex();
		// シェーダーをpush()の後に設定（push/popでシェーダー状態がリセットされるため）
		shader(this.shader);
		this.shader.setUniform("u_tex", this.tex);
		sphere(this.radius);
		pop();
	}
}

// Class for a plane that extends to infinity.
class IntersectPlane
{
  constructor(n1, n2, n3, p1, p2, p3) {
    this.normal = createVector(n1, n2, n3); // The normal vector of the plane
    this.point = createVector(p1, p2, p3); // A point on the plane
    this.d = this.point.dot(this.normal);
  }

  getLambda(Q, v) {
    return (-this.d - this.normal.dot(Q)) / this.normal.dot(v);
  }
}

function keyPressed(){
  save("img_" + month() + '-' + day() + '_' + hour() + '-' + minute() + '-' + second() + ".jpg");
}
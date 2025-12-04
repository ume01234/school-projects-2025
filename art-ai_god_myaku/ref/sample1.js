// 虹彩（瞳の模様）の色：青系と白に変更
// 紫を白(#FFFFFF)に変えることで、ヌラッとした光沢感を出します
let irisColors = ['#005BAC', '#FFFFFF', '#2E29A6', '#0095D9'];

let ctx;
let circles = [];
let motions = [];
let noiseFilter;

function setup() {
	createCanvas(900, 900);
	rectMode(CENTER);
	ctx = drawingContext;
	
	// 円（目）の配置
	for (let i = 0; i < 2000; i++) {
		let d = width * random(0.06, 0.18);
		let x = (width/2) + (random(-0.4, 0.4) * (width - d/2));
		let y = (height/2) + (random(-0.4, 0.4) * (height - d/2));
		let newShape = { x: x, y: y, d: d };
		let overlap = false;
		for (let c of circles) {
			if (checkCircleCollision(newShape, c)) {
				overlap = true;
				break;
			}
		}
		if (!overlap) {
			circles.push({x:x, y:y, d:d});
		}
	}
	
	for(let c of circles){
		motions.push(new Motion(c.x, c.y, c.d));
	}

	// 質感用ノイズフィルター
	noiseFilter = createImage(width, height);
	noiseFilter.loadPixels();
	let pix = noiseFilter.width * noiseFilter.height * 4;
	for (let i = 0; i < pix; i += 4) {
		let x = (i / 4) % noiseFilter.width;
		let y = floor(map(i, 0, pix, 0, noiseFilter.height));
		let alph = random(30);
		let c = noise(y * 0.08, x * 0.08) * 240;
		noiseFilter.pixels[i] = c;
		noiseFilter.pixels[i + 1] = c;
		noiseFilter.pixels[i + 2] = c;
		noiseFilter.pixels[i + 3] = alph;
	}
	noiseFilter.updatePixels();
}

function draw() {
	background('#E60012'); // 背景：ミャクミャクの赤（体）
	
	for(let m of motions){
		m.show();
		m.move();
	}
	image(noiseFilter, 0, 0);
}

function checkCircleCollision(a, b) {
	let distSq = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
	let radiusSum = (a.d / 2) + (b.d / 2);
	return distSq < (radiusSum * 1.05) ** 2;
}

function easeOutCirc(x) {
	return sqrt(1 - Math.pow(x - 1, 2));
}

class Motion {
	constructor(x, y, d) {
		this.x = x;
		this.y = y;
		this.d = d;
		this.n = int(random(4, 15));
		this.sw = d / this.n;
		this.te = int(random(200, 400));
		this.t = 0;
		
		// 瞳孔の位置（視線）
		this.lookX = random(-d*0.1, d*0.1);
		this.lookY = random(-d*0.1, d*0.1);

		this.circles = [];
		this.cols = [];
		
		// 虹彩の色生成
		for (let i = 0; i < this.n; i++) {
			this.cols.push(random(irisColors));
			this.circles.push(new Circle(0, 0, this.d * 0.9, -((this.te / this.n) * i) + this.te, this.te, this.cols[i]));
		}
		this.count = 0;
	}

	show() {
		push();
		translate(this.x, this.y);
		
		// 1. 白目
		noStroke();
		fill(255);
		circle(0, 0, this.d);

		// クリップ開始
		drawingContext.save(); 
		drawingContext.beginPath();
		drawingContext.arc(0, 0, this.d / 2, 0, Math.PI * 2);
		drawingContext.clip();

		// 2. 虹彩のアニメーション（青と白の波紋）
		for (let i = 0; i < this.circles.length; i++) {
			let r = this.circles[i];
			r.show();
			r.move();
		}
		
		for (let i = 0; i < this.circles.length; i++) {
			let r = this.circles[i];
			if (r.isDead) {
				this.count++;
				this.circles.splice(i, 1);
				let nextColor = random(irisColors);
				this.circles.push(new Circle(0, 0, this.d * 0.9, 0, this.te, nextColor));
			}
		}
		drawingContext.restore(); // クリップ終了

		// 3. 黒目（瞳孔）
		fill('#020100');
		let pupilSize = this.d * 0.35;
		circle(this.lookX, this.lookY, pupilSize);

		// 4. ハイライト（固定の反射光）
		fill(255);
		circle(this.lookX + pupilSize * 0.3, this.lookY - pupilSize * 0.3, pupilSize * 0.25);
		
		pop();
	}
	move() {
		this.t++;
	}
}

class Circle {
	constructor(x, y, d, t0, t1, col) {
		let th = random(TAU);
		let r = random(0, 0.2) * d; 
		this.x0 = x + r * cos(th);
		this.x1 = x;
		this.y0 = y + r * sin(th);
		this.y1 = y;
		this.x = this.x0;
		this.y = this.y0;

		this.d = 0;
		this.d1 = d;
		this.t = t0;
		this.t1 = t1;
		this.isDead = false;
		this.col = col;
	}

	show() {
		noStroke();
		fill(this.col);
		circle(this.x, this.y, this.d);
	}

	move() {
		if (0 < this.t && this.t < this.t1) {
			let n = norm(this.t, 0, this.t1 - 1);
			this.d = lerp(0, this.d1, easeOutCirc(n));
			this.x = lerp(this.x0, this.x1, easeOutCirc(n));
			this.y = lerp(this.y0, this.y1, easeOutCirc(n));
		}
		if (this.t > this.t1) {
			this.isDead = true;
		}
		this.t++;
	}
}
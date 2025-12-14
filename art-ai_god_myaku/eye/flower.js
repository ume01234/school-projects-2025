// =============================================
// FlowerRenderer - 花を描画するためのモジュール
// 外部から呼び出し可能
// =============================================

const PHI = (1 + Math.sqrt(5)) / 2
const goldenAngle = Math.PI * 2 * (2 - PHI)

class FlowerRenderer {
	constructor() {
		this.count = 0
		this.groupSize = 0
		this.groupsCount = 0
		this.darks = ['#04996d', '#4467ab']
		this.lights = ['#99dfff', '#60ebca', '#c4f5ed', '#b8ccfc']
		this.duration = 300
		this.petalSpeed = 0.0005
		this.rotation = 0
		
		this.ranges = {
			cx: [-0.2, 1.2],
			cy: [0, 0.7],
			cy2: [0.3, 1.3],
			tx: [-0.2, 0.2],
			ty: [-0.2, 0.2]
		}
		
		this.angles = []
		this.groups = []
		this.lastAdd = 0
		this.c1 = null
		this.c2 = null
		this.maxRadius = 0
		this.bgImg = null
		
		this.position = { x: 0, y: 0 }
		this.scale = 1.0
		this.initialized = false
	}
	
	// 初期化（p5.jsのsetup内で呼び出す）
	// canvasは呼び出し側で作成済みであることを想定
	init(options = {}) {
		this.position = options.position || { x: width / 2, y: height / 2 }
		this.scale = options.scale || 1.0
		
		this.maxRadius = min(width, height) * 0.4 * this.scale
		this.count = floor(random(30, 150))
		this.groupSize = floor(random(3, 10))
		this.groupsCount = Math.ceil(this.count / this.groupSize)
		
		this.lights = shuffle([...this.lights])
		this.darks = shuffle([...this.darks])
		let cs = shuffle([this.lights[0], this.darks[0]])
		this.c1 = color(cs[0])
		this.c2 = color(cs[1])
		noiseSeed(random() * 10000)
		this.rotation = random(PI * 2)
		
		this.angles = []
		this.groups = []
		
		let group = -1
		for (let i = 0; i < this.count; i++) {
			if (i % this.groupSize === 0) group++
			this.angles.push(i * goldenAngle)
			this.groups.push(group)
		}
		
		this.bgImg = makeBackground()
		this.initialized = true
	}
	
	// 再初期化（色やパターンをリセット）
	reset() {
		this.init({
			position: this.position,
			scale: this.scale
		})
	}
	
	// 位置を設定
	setPosition(x, y) {
		this.position = { x, y }
	}
	
	// スケールを設定
	setScale(scale) {
		this.scale = scale
		this.maxRadius = min(width, height) * 0.4 * this.scale
	}
	
	// リサイズ時の処理
	resize() {
		this.maxRadius = min(width, height) * 0.4 * this.scale
	}
	
	// 更新処理
	update() {
		if (!this.initialized) return
		
		let ms = millis()
		if (ms - this.lastAdd > this.duration) {
			this.lastAdd = ms
			this.angles.pop()
			this.angles.unshift(this.angles[0] - goldenAngle)
			this.groups.unshift(this.groups.pop())
		}
	}
	
	// 描画処理
	display(drawBackground = true) {
		if (!this.initialized) return
		
		let ms = millis()
		let progress = (ms - this.lastAdd) / this.duration
		
		push()
		translate(this.position.x, this.position.y)
		rotate(this.rotation)
		
		let groupVals = []
		for (let i = 0; i < this.groupsCount; i++) {
			let vals = {
				cx1: map(noise(ms * this.petalSpeed * 0.6, i * 2), 0, 1, this.ranges.cx[0], this.ranges.cx[1]),
				cx2: map(noise(ms * this.petalSpeed * 0.9, i * 4), 0, 1, this.ranges.cx[0], this.ranges.cx[1]),
				cy1: map(noise(ms * this.petalSpeed * 0.4, i * 1), 0, 1, this.ranges.cy[0], this.ranges.cy[1]),
				cy2: map(noise(ms * this.petalSpeed * 0.7, i * 3), 0, 1, this.ranges.cy2[0], this.ranges.cy2[1]),
				tx: map(noise(ms * this.petalSpeed * 0.5, i * 2), 0, 1, this.ranges.tx[0], this.ranges.tx[1]),
				ty: map(noise(ms * this.petalSpeed * 1.2, i * 1), 0, 1, this.ranges.ty[0], this.ranges.ty[1]),
			}
			groupVals.push(vals)
		}
		
		for (let i = this.count - 1; i >= 0; i--) {
			let angle = this.angles[i]
			let group = this.groups[i]
			let pct = (i + progress) / this.count
			let sz = this.maxRadius * pct
			let alpha = pct > 0.9 ? map(pct, 0.9, 1, 1, 0) : 1
			
			let c = lerpColor(this.c1, this.c2, pct)
			c.setAlpha(alpha * 255)
			
			let vals = groupVals[group]
			let { cx1, cx2, cy1, cy2, tx, ty } = vals
			
			push()
			rotate(angle)
			fill(c)
			petal(sz, 0.25, cx1, cx2, cy1, cy2, tx, ty)
			pop()
		}
		pop()
		
		// 背景テクスチャの描画（オプション）
		if (drawBackground && this.bgImg) {
			blendMode(MULTIPLY)
			image(this.bgImg, 0, 0, width, height)
			blendMode(BLEND)
		}
	}
	
	// 更新と描画を一括で行う
	draw(drawBackground = true) {
		this.update()
		this.display(drawBackground)
	}
	
	// 背景画像を取得
	getBackgroundImage() {
		return this.bgImg
	}
}

// グローバルなFlowerRendererインスタンス（シンプルな使用のため）
let flowerRenderer = null

// =============================================
// スタンドアロンで使用する場合のsetup/draw
// 外部から呼び出す場合は使用しない
// =============================================
function setup() {
	createCanvas(windowWidth, windowHeight)
	
	flowerRenderer = new FlowerRenderer()
	flowerRenderer.init()
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight)
	if (flowerRenderer) {
		flowerRenderer.resize()
	}
}

function draw() {
	blendMode(BLEND)
	fill(255)
	noStroke()
	rect(0, 0, width, height)
	
	flowerRenderer.draw()
}

function mouseClicked() {
	if (flowerRenderer) {
		flowerRenderer.reset()
	}
}
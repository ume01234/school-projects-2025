function petal(sz, offset, cx1 = 0.3, cx2 = 0.5, cy1 = 0.3, cy2 = 0.8, tx = 0, ty = 0) {
	let a1 = [offset * -0.25, 0]
	let a2 = [offset * 0.25, 0]
	let top = [0 + tx * sz, sz * 1.3 + ty * sz]
	let cpl1 = [sz * -cx1, sz * cy1]
	let cpl2 = [sz * -cx2, sz * cy2]
	let cpr1 = [sz * cx1, sz * cy1]
	let cpr2 = [sz * cx2, sz * cy2]

	beginShape()
	vertex(a1[0], a1[1])
	bezierVertex(cpl1[0], cpl1[1], cpl2[0], cpl2[1], top[0], top[1])
	bezierVertex(cpr2[0], cpr2[1], cpr1[0], cpr1[1], a2[0], a2[1])
	endShape()
}

function makeBackground() {
	let g = createGraphics(width * 0.1, height * 0.1)
	g.fill(255)
	g.noStroke()
	g.rect(0, 0, g.width, g.height)
	for (let x = 0; x < g.width; x += 1) {
		for (let y = 0; y < g.height; y += 1) {
			let amt = noise(x * 0.1, y * 0.1)
			g.fill(255, 228, 214, amt * 200)
			g.circle(x, y, 2)

		}
	}
	return g
}

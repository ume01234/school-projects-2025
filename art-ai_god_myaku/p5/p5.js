function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
}
/**
 * Title: The Gaze of the Abyssal Mandala
 * Concept:
 * - Realistic Eyes: Detailed sclera with veins, complex iris, reflective pupil.
 * - Organic Integration: Eyes appearing to be embedded within the undulating flesh.
 * - Enhanced Life: Subtle movements and reflections to bring the creature to life.
 */

let cells = [];
let numCells = 20;
let baseRadius = 180;
let t = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();

  for (let i = 0; i < numCells; i++) {
    let angle = map(i, 0, numCells, 0, TWO_PI);
    cells.push(new Cell(angle));
  }
}

function draw() {
  background(260, 80, 5, 100);
  
  translate(width / 2, height / 2);

  drawSacredHalo();
  drawLuminousCore();
  drawDeepenedViscousRing();

  // 目は一番最後に描画し、他の要素に埋もれないようにする
  for (let cell of cells) {
    cell.update();
    cell.display();
  }
  
  t += 0.01;
}

// --- 描画関数群 (Halo, Core, Ringは前回のコードと同じなので省略) ---

function drawSacredHalo() {
  push();
  noFill();
  strokeWeight(1);
  
  stroke(45, 80, 90, 20);
  for(let i=0; i<36; i++){
    rotate(PI/18);
    line(200, 0, 1000, 0);
  }
  
  stroke(45, 60, 100, 30);
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.02) {
    let r = 300 + sin(a * 12 + t) * 20 + cos(a * 4 - t) * 50;
    vertex(r * cos(a), r * sin(a));
  }
  endShape(CLOSE);

  stroke(10, 80, 100, 40);
  for (let i = 0; i < 3; i++) {
    beginShape();
    for (let a = 0; a < TWO_PI; a += 0.05) {
      let noiseVal = noise(cos(a), sin(a), t * 0.5 + i);
      let r = 250 + noiseVal * 100;
      vertex(r * cos(a), r * sin(a));
    }
    endShape(CLOSE);
  }
  pop();
}

function drawLuminousCore() {
  push();
  let ctx = drawingContext;
  let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 150);
  grad.addColorStop(0, color(200, 20, 100, 100).toString());
  grad.addColorStop(0.4, color(210, 80, 80, 90).toString());
  grad.addColorStop(1, color(220, 90, 20, 0).toString());
  
  ctx.fillStyle = grad;
  
  beginShape();
  for (let a = 0; a < TWO_PI; a += 0.1) {
    let xoff = map(cos(a), -1, 1, 0, 2);
    let yoff = map(sin(a), -1, 1, 0, 2);
    let r = 120 + noise(xoff, yoff, t * 0.5) * 40;
    vertex(r * cos(a), r * sin(a));
  }
  endShape(CLOSE);
  pop();
}

function drawDeepenedViscousRing() {
  push();
  let ctx = drawingContext;

  drawingContext.shadowBlur = 40;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 1)';

  let baseGrad = ctx.createRadialGradient(0, 0, baseRadius * 0.7, 0, 0, baseRadius * 1.5);
  baseGrad.addColorStop(0, color(350, 100, 30).toString());
  baseGrad.addColorStop(0.5, color(350, 100, 50).toString());
  baseGrad.addColorStop(1, color(350, 100, 60).toString());
  ctx.fillStyle = baseGrad;
  
  beginShape();
  for (let i = 0; i < cells.length; i++) {
    let c = cells[i];
    let nextC = cells[(i + 1) % cells.length];
    for(let j=0; j<5; j++){
      let amt = j/5;
      let ang = lerp(c.angle, c.angle < nextC.angle ? nextC.angle : nextC.angle + TWO_PI, amt);
      let thickness = 60 + noise(i * 0.5, j * 0.5, t) * 30;
      let pulse = map(sin(t * 1.5 + i), -1, 1, 0.9, 1.1);
      let r = baseRadius * pulse + thickness;
      curveVertex(r * cos(ang), r * sin(ang));
    }
  }
  endShape(CLOSE);
  
  drawingContext.shadowBlur = 0;

  let detailNoiseScale = 0.02;
  let blobSize = 5;
  for(let i=0; i < 500; i++){
    let angle = random(TWO_PI);
    let r = random(baseRadius * 0.7, baseRadius * 1.3);
    let x = r * cos(angle);
    let y = r * sin(angle);

    let noiseVal = noise(x * detailNoiseScale, y * detailNoiseScale, t * 0.2);
    
    if(noiseVal > 0.6){
      fill(350, 100, 80, map(noiseVal, 0.6, 1, 20, 80));
    } else if (noiseVal < 0.4) {
      fill(350, 100, 20, map(noiseVal, 0, 0.4, 80, 20));
    } else {
      continue;
    }
    
    ellipse(x, y, blobSize * noiseVal, blobSize * noiseVal);
  }

  let highlightGrad = ctx.createRadialGradient(0, 0, baseRadius * 0.7, 0, 0, baseRadius * 1.2);
  highlightGrad.addColorStop(0, color(350, 80, 100, 50).toString());
  highlightGrad.addColorStop(1, color(350, 80, 80, 0).toString());
  ctx.fillStyle = highlightGrad;
  
  beginShape();
  for (let i = 0; i < cells.length; i++) {
    let c = cells[i];
    let nextC = cells[(i + 1) % cells.length];
    for(let j=0; j<5; j++){
      let amt = j/5;
      let ang = lerp(c.angle, c.angle < nextC.angle ? nextC.angle : nextC.angle + TWO_PI, amt);
      let thickness = 60 + noise(i * 0.5, j * 0.5, t) * 30;
      let pulse = map(sin(t * 1.5 + i), -1, 1, 0.9, 1.1);
      let r = (baseRadius * pulse + thickness) * 0.9;
      curveVertex(r * cos(ang), r * sin(ang));
    }
  }
  endShape(CLOSE);
  
  pop();
}

// --- クラス定義 ---

class Cell {
  constructor(angle) {
    this.baseAngle = angle;
    this.angle = angle;
    this.pos = createVector(0, 0);
  }

  update() {
    this.angle = this.baseAngle + sin(t * 0.5 + this.baseAngle) * 0.05;
    
    let pulse = map(sin(t * 1.5 + this.baseAngle * 2), -1, 1, 0.9, 1.1);
    let r = baseRadius * pulse;
    this.pos.x = cos(this.angle) * r;
    this.pos.y = sin(this.angle) * r;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);

    let size = 38; // 目のサイズを少し大きく
    let ctx = drawingContext;
    
    // まばたき（時々閉じる）
    let blinkFactor = noise(t * 2 + this.baseAngle * 10);
    let eyeHeightRatio = 1.0;
    if (blinkFactor > 0.7) eyeHeightRatio = map(blinkFactor, 0.7, 1, 1.0, 0.1);
    
    // 1. 白目（Sclera） - グラデーションと血管
    let scleraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size/2);
    scleraGrad.addColorStop(0, color(0, 0, 100).toString()); // 中央は明るい白
    scleraGrad.addColorStop(0.7, color(0, 0, 85).toString()); // 少し影
    scleraGrad.addColorStop(1, color(30, 10, 80).toString()); // 端は黄ばんだような色
    ctx.fillStyle = scleraGrad;
    ellipse(0, 0, size, size * eyeHeightRatio);

    // 白目の血管（ノイズで不規則な線）
    if(eyeHeightRatio > 0.3) { // 目が開ききっている時のみ描画
      for(let i=0; i<10; i++){
        let startAng = random(TWO_PI);
        let endAng = startAng + random(-0.5, 0.5);
        let startR = size * 0.2;
        let endR = size * 0.5;
        
        // 血管の色と透明度
        stroke(350, 80, 60, random(10, 40)); 
        strokeWeight(random(0.5, 1.5));
        
        line(startR * cos(startAng), startR * sin(startAng) * eyeHeightRatio,
             endR * cos(endAng), endR * sin(endAng) * eyeHeightRatio);
      }
    }
    
    // 2. 虹彩と瞳孔
    if (eyeHeightRatio > 0.1) { // 目が閉じすぎていない時
      let mx = mouseX - width / 2 - this.pos.x;
      let my = mouseY - height / 2 - this.pos.y;
      let ang = atan2(my, mx);
      let d = constrain(dist(0, 0, mx, my), 0, 8);
      
      let px = cos(ang) * d;
      let py = sin(ang) * d * eyeHeightRatio;

      // 虹彩（複数のリングとノイズで奥行き）
      let irisSize = 18;
      let irisColors = [
        color(350, 90, 80),  // 内側の明るい赤
        color(0, 100, 40),   // 中間の暗い赤
        color(0, 100, 20)    // 外側の非常に暗い赤
      ];
      
      // 複数のリングを描いて奥行きを出す
      for(let i = 0; i < 3; i++){
        let currentIrisSize = irisSize - i * 2;
        ctx.fillStyle = irisColors[i].toString();
        ellipse(px, py, currentIrisSize, currentIrisSize * eyeHeightRatio);
        
        // 虹彩にノイズを重ねて質感を出す
        if(i == 1){ // 中間レイヤーに特にノイズを
          let detailIrisNoiseScale = 0.1;
          for(let n=0; n<50; n++){
            let nx = px + random(-currentIrisSize/2, currentIrisSize/2);
            let ny = py + random(-currentIrisSize/2, currentIrisSize/2) * eyeHeightRatio;
            let noiseVal = noise(nx * detailIrisNoiseScale, ny * detailIrisNoiseScale, t);
            if(dist(nx,ny,px,py) < currentIrisSize/2){
              fill(0, 100, 50, map(noiseVal, 0, 1, 0, 60)); // 赤の濃淡
              ellipse(nx, ny, 2, 2 * eyeHeightRatio);
            }
          }
        }
      }

      // 瞳孔（反射と深い闇）
      fill(0, 0, 0); // 真っ黒
      ellipse(px, py, 8, 8 * eyeHeightRatio);

      // ハイライト（複数箇所に、光沢感を出す）
      fill(0, 0, 100, 90); // 強めの白
      ellipse(px + 4, py - 4, 3, 3 * eyeHeightRatio); // 主なハイライト
      fill(0, 0, 100, 60); // 少し薄い白
      ellipse(px - 2, py + 5, 2, 2 * eyeHeightRatio); // サブのハイライト
      
      // 背景の光の反射（長い筋）
      if (eyeHeightRatio > 0.5) {
        fill(0, 0, 100, 20); // 非常に薄い白
        rect(px - 1, py - irisSize/2 + 2, 2, irisSize - 4); // 縦方向の反射
      }

      // まぶたの影 (眼球の上部に影を落とす)
      let lidShadowGrad = ctx.createLinearGradient(0, -size/2, 0, -size/4);
      lidShadowGrad.addColorStop(0, 'rgba(0,0,0,0.5)'); // 上部は濃い影
      lidShadowGrad.addColorStop(1, 'rgba(0,0,0,0)');   // 下に行くほど薄く
      ctx.fillStyle = lidShadowGrad;
      ellipse(0, 0, size, size * eyeHeightRatio); // 全体に影を描いてからクリッピングするイメージ
    }

    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
// AI God - Mandala
// 動作確認用プロトタイプ: 赤い点が中央から四方に広がるアニメーション

let particles = [];
let centerX, centerY;

function setup() {
    // Canvasを画面いっぱいに作成
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    
    // 中央座標を取得
    centerX = width / 2;
    centerY = height / 2;
    
    // 初期パーティクルを中央に配置
    for (let i = 0; i < 4; i++) {
        particles.push({
            x: centerX,
            y: centerY,
            angle: (TWO_PI / 4) * i, // 0度、90度、180度、270度の方向
            speed: 0.5,
            radius: 8
        });
    }
}

function draw() {
    background(0); // 黒背景
    
    // パーティクルを更新・描画
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        // 角度に基づいて移動
        p.x += cos(p.angle) * p.speed;
        p.y += sin(p.angle) * p.speed;
        
        // 赤い点を描画
        fill(255, 0, 0);
        noStroke();
        ellipse(p.x, p.y, p.radius * 2, p.radius * 2);
        
        // 画面外に出たら中央に戻す
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            p.x = centerX;
            p.y = centerY;
        }
    }
    
    // 中央に小さな白い点を表示（起点がわかりやすいように）
    fill(255);
    ellipse(centerX, centerY, 4, 4);
}

// ウィンドウリサイズ時の処理
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    centerX = width / 2;
    centerY = height / 2;
}


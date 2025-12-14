// AI God - Mandala
// 機能プロトタイプ: 明るさ検知・顔認識・サウンド制御の骨組み

// ===== グローバル変数 =====
let video;
let faceDetector;
let currentState = 'CLOSED'; // 'CLOSED' or 'OPEN'
let brightness = 0;
let brightnessThreshold = 50; // 明るさの閾値（0-255）

// 顔検出関連
let faces = [];
let showDebugPoints = false; // デバッグ用：顔パーツの点を表示するか

// サウンド関連（音声ファイルがないためダミー処理）
let soundFile;
let soundLoaded = false;

// ===== 作品描画用の変数 =====
let wall;
let eyeZ;
let sh;
let es = [];
const CYCLE = 100;
let artworkInitialized = false;
let visibleEyeIndex = 0; // 表示される目のインデックス（中心から外側へ）
let lastEyeShowTime = 0; // 最後に目を表示した時刻
const EYE_SHOW_INTERVAL = 2; // 目を表示する間隔（フレーム数）

// ===== プリロード =====
function preload() {
    // 音声ファイルの読み込み
    soundFile = loadSound('assets/sounds/583831__septalium1__squelching-noises.mp3', 
        function() {
            // 読み込み成功時のコールバック
            soundLoaded = true;
            console.log('音声ファイルの読み込みが完了しました');
        },
        function(error) {
            // 読み込み失敗時のコールバック
            console.error('音声ファイルの読み込みに失敗しました:', error);
            soundLoaded = false;
        }
    );
}

// ===== セットアップ =====
function setup() {
    // Canvasを画面いっぱいに作成（WEBGLモード）
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('canvas-container');
    
    // WEBGL用の設定
    let dep = max(width, height);
    ortho(-width / 2, width / 2, height / 2, -height / 2, -dep * 2, dep * 2);
    eyeZ = height / 2 / tan((30 * PI) / 180);
    wall = new IntersectPlane(0, 0, 1, 0, 0, 300);
    noStroke();
    
    // カメラを起動
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide(); // カメラ映像は非表示（Canvasに描画するため）
    
    // ml5.jsでMediaPipe Face Meshを初期化
    faceDetector = ml5.faceMesh(video, modelReady);
    
    // 作品の初期化
    initArtwork();
}

// ===== モデル準備完了時のコールバック =====
function modelReady() {
    console.log('Face Mesh Model Ready!');
    // faceMeshはイベントリスナーで結果を受け取る
    faceDetector.on('face', gotFaces);
}

// ===== 顔検出結果のコールバック =====
function gotFaces(results) {
    faces = results;
}

// ===== メインループ =====
function draw() {
    // カメラ映像から明るさを計算
    if (video.loadedmetadata) {
        calculateBrightness();
        updateState();
    }
    
    // ステートに応じて描画
    if (currentState === 'CLOSED') {
        drawClosedState();
    } else {
        drawOpenState();
    }
    
    // デバッグ情報を表示
    drawDebugInfo();
}

// ===== 明るさ計算 =====
function calculateBrightness() {
    video.loadPixels();
    let sum = 0;
    let count = 0;
    
    // 画像の中央部分のピクセルをサンプリング（パフォーマンス向上のため）
    let step = 10; // 10ピクセルごとにサンプリング
    for (let y = 0; y < video.height; y += step) {
        for (let x = 0; x < video.width; x += step) {
            let index = (y * video.width + x) * 4;
            let r = video.pixels[index];
            let g = video.pixels[index + 1];
            let b = video.pixels[index + 2];
            // RGBから輝度を計算（標準的な輝度計算式）
            let pixelBrightness = (r * 0.299 + g * 0.587 + b * 0.114);
            sum += pixelBrightness;
            count++;
        }
    }
    
    brightness = sum / count;
}

// ===== ステート更新 =====
function updateState() {
    let previousState = currentState;
    
    if (brightness < brightnessThreshold) {
        currentState = 'CLOSED';
    } else {
        currentState = 'OPEN';
    }
    
    // ステートが変わった時の処理
    if (previousState !== currentState) {
        onStateChanged(currentState);
    }
}

// ===== ステート変更時の処理 =====
function onStateChanged(newState) {
    console.log(`State changed to: ${newState}`);
    
    if (newState === 'OPEN') {
        // OPENモード：音声再生開始
        playSound();
        // 目の表示をリセット（中心から順に表示）
        visibleEyeIndex = 0;
        lastEyeShowTime = frameCount;
        // 全ての目を非表示にリセット
        for (let eye of es) {
            eye.isVisible = false;
        }
    } else {
        // CLOSEDモード：音声停止
        stopSound();
        // 全ての目を非表示に
        visibleEyeIndex = 0;
        for (let eye of es) {
            eye.isVisible = false;
        }
    }
}

// ===== CLOSED状態の描画 =====
function drawClosedState() {
    background(0); // 黒背景
    
    // 中央に小さな点を表示
    fill(255);
    noStroke();
    ellipse(width / 2, height / 2, 4, 4);
}


// ===== 作品の初期化関数 =====
function initArtwork() {
    es = [];
    
    // 初期のサイズ決定（画面サイズの約35%）
    let initialSize = min(width, height) * 0.35;
    
    // 中心座標(0,0)から再帰配置を開始
    recursiveDesign(0, 0, initialSize, 0);
    
    artworkInitialized = true;
}

// ===== 再帰的円状配置関数 =====
function recursiveDesign(x, y, size, depth) {
    // ベースケース（停止条件）
    // サイズが小さすぎる、または再帰が深すぎる場合は停止
    if (size < 20 || depth > 2) return;
    
    // 現在の位置にオブジェクトを生成して配列に追加
    // 半径は配置サイズ(size)に基づいて決定
    let eyeRadius = size * 0.25;
    es.push(new Eye(createVector(x, y, 0), eyeRadius));
    
    // 周囲への円状配置ループ
    let count = 12; // 周囲に配置する個数
    let angleStep = TWO_PI / count; // 360度を個数で分割
    
    for (let i = 0; i < TWO_PI; i += angleStep) {
        // 親からの距離（重ならないように調整）
        let dist = size * 0.95;
        
        // 極座標から直交座標への変換（三角関数）
        // 親の位置(x,y)を基準に、角度i、距離distの位置を計算
        let nx = x + cos(i) * dist;
        let ny = y + sin(i) * dist;
        
        // 次の世代のサイズ計算（減衰させる）
        let nextSize = size * 0.45;
        
        // 再帰呼び出し
        // 計算した新しい座標とサイズ、深度+1 を渡す
        recursiveDesign(nx, ny, nextSize, depth + 1);
    }
}

// ===== OPEN状態の描画 =====
function drawOpenState() {
    // 背景を赤色に設定
    background('red'); 
    
    // =======作品の描画ここから==========
    
    // 中心から外側に向かって順に目を表示
    if (frameCount - lastEyeShowTime >= EYE_SHOW_INTERVAL && visibleEyeIndex < es.length) {
        es[visibleEyeIndex].isVisible = true;
        visibleEyeIndex++;
        lastEyeShowTime = frameCount;
    }
    
    // 画面全体を時計回りにゆっくり回転
    push();
    // 時計回りに回転（frameCountを使って時間に応じて回転）
    rotateZ(frameCount * 0.001); // ゆっくり回転（0.001は速度調整可能）
    
    // 顔の位置を取得（mouseX, mouseYの代わりに使用）
    let targetX, targetY;
    if (faces && faces.length > 0 && faces[0].annotations && faces[0].annotations.noseTip) {
        let noseTip = faces[0].annotations.noseTip[0];
        targetX = map(noseTip[0], 0, video.width, 0, width);
        targetY = map(noseTip[1], 0, video.height, 0, height);
    } else {
        // 顔が検出されていない場合は画面中央を使用
        targetX = width / 2;
        targetY = height / 2;
    }
    
    // マウス位置の計算（顔の位置を使用）
    let x = targetX - width / 2;
    let y = (targetY - height / 2) * -1;

    const Q = createVector(0, 0, eyeZ); // A point on the ray and the default position of the camera.
    const v = createVector(x, y, -eyeZ); // The direction vector of the ray.
    let intersect; // The point of intersection between the ray and a plane.
    let closestLambda = eyeZ * 10; // The draw distance.
    let lambda = wall.getLambda(Q, v); // The value of lambda where the ray intersects the object
    if (lambda < closestLambda && lambda > 0) {
        // Find the position of the intersection of the ray and the object.
        intersect = p5.Vector.add(Q, p5.Vector.mult(v, lambda));
        closestLambda = lambda;
    }
    
    let targetPos;
    if (intersect) {
        targetPos = createVector(intersect.x, intersect.y, intersect.z);
    } else {
        targetPos = createVector(0, 0, 0);
    }

    // 表示可能な目だけを更新・描画
    for (let item of es) {
        if (item.isVisible) {
            item.setTarget(targetPos);
            item.update();
            item.display();
        }
    }
    
    pop(); // 回転の適用を終了
    
    // =======作品の描画ここまで==========
    
    // デバッグ用：顔パーツの点を描画（Dキーで切り替え）
    if (showDebugPoints && faces && faces.length > 0) {
        drawFaceLandmarks(faces[0].annotations);
    }
}

// ===== 作品用のクラス定義 =====
class Eye {
    constructor(_pos, _radius) {
        this.pos = _pos;
        this.radius = _radius;
        this.dMult = random(0.12, 0.2); // 瞳孔の動きを大きく（0.05-0.1 → 0.12-0.2）
        this.currentTarget = createVector(0, 0, 1);
        this.target = createVector(0, 0, 1);
        this.tex = createGraphics(this.radius * 4, this.radius * 2);
        this.isVisible = false; // 表示フラグ（初期値は非表示）
    }

    setTarget(_targetPos) {
        this.target = _targetPos;
    }

    update() {
        this.currentTarget.add(p5.Vector.sub(this.target, this.currentTarget).mult(this.dMult));
    }

    drawTex() {
        this.tex.ellipseMode(CENTER);
        this.tex.noStroke();
        
        // 白目は元の色（白系）に戻す
        this.tex.background("#F4F8FB"); 
        
        let diameter = this.tex.width * 0.2;
        let noiseMult = noise(this.pos.x + sin((frameCount / CYCLE) * TWO_PI));
        diameter += (noiseMult - 0.5) / 5 * diameter;
        this.tex.fill(100);
        this.tex.ellipse(this.tex.width / 2, this.tex.height / 2, diameter, diameter);

        this.tex.push();
        this.tex.translate(this.tex.width / 2, this.tex.height / 2);
        for (let r = 0; r < TWO_PI; r += PI / 30) {
            // 虹彩の線の色（紫）
            this.tex.stroke("purple");
            
            this.tex.push();
            this.tex.rotate(r);
            this.tex.line(0, 0, diameter / 2, 0);
            this.tex.pop();
        }
        this.tex.pop();
        this.tex.noStroke();

        diameter *= 0.5;
        // 瞳孔の色（青）
        this.tex.fill("blue");
        
        this.tex.ellipse(this.tex.width / 2, this.tex.height / 2, diameter, diameter);
        diameter *= 0.5;
        this.tex.fill(255, 100);
        this.tex.ellipse(this.tex.width * 0.55, this.tex.height * 0.4, diameter, diameter);
    }

    display() {
        let angleY = atan2(this.currentTarget.x - this.pos.x, this.currentTarget.z - this.pos.z);
        let angleX = atan2(this.currentTarget.z - this.pos.z, this.currentTarget.y - this.pos.y);
        push();
        translate(this.pos);
        rotateY(-angleY);
        rotateX(angleX + PI / 2);

        this.drawTex();
        if (sh) {
            sh.setUniform("u_tex", this.tex);
        } else {
            texture(this.tex);
        }
        sphere(this.radius);
        pop();
    }
}

// Class for a plane that extends to infinity.
class IntersectPlane {
    constructor(n1, n2, n3, p1, p2, p3) {
        this.normal = createVector(n1, n2, n3); // The normal vector of the plane
        this.point = createVector(p1, p2, p3); // A point on the plane
        this.d = this.point.dot(this.normal);
    }

    getLambda(Q, v) {
        return (-this.d - this.normal.dot(Q)) / this.normal.dot(v);
    }
}

// ===== 顔のランドマークを描画（デバッグ用） =====
function drawFaceLandmarks(annotations) {
    fill(0, 255, 0);
    noStroke();
    
    // Face Meshのannotationsから各パーツを描画
    for (let key in annotations) {
        let points = annotations[key];
        if (Array.isArray(points)) {
            for (let i = 0; i < points.length; i++) {
                let point = points[i];
                if (Array.isArray(point) && point.length >= 2) {
                    let x = map(point[0], 0, video.width, 0, width);
                    let y = map(point[1], 0, video.height, 0, height);
                    ellipse(x, y, 4, 4);
                }
            }
        }
    }
}

// ===== デバッグ情報の描画 =====
function drawDebugInfo() {
    fill(255);
    textSize(16);
    textAlign(LEFT);
    text(`State: ${currentState}`, 20, 30);
    text(`Brightness: ${brightness.toFixed(1)}`, 20, 50);
    text(`Faces: ${faces ? faces.length : 0}`, 20, 70);
    
    // デバッグモードの切り替え方法を表示
    textSize(12);
    text(`Press 'D' to toggle debug points`, 20, height - 20);
}

// ===== サウンド制御 =====
function playSound() {
    if (soundLoaded && soundFile) {
        if (!soundFile.isPlaying()) {
            soundFile.setLoop(true); // ループ再生を設定
            soundFile.play();
            console.log('音声をループ再生開始');
        }
    } else {
        console.log('音声ファイルが読み込まれていません');
    }
}

function stopSound() {
    if (soundLoaded && soundFile && soundFile.isPlaying()) {
        soundFile.stop();
        console.log('音声を停止');
    }
}

// ===== キーボード入力 =====
function keyPressed() {
    // 'D'キーでデバッグポイントの表示を切り替え
    if (key === 'd' || key === 'D') {
        showDebugPoints = !showDebugPoints;
        console.log(`Debug points: ${showDebugPoints ? 'ON' : 'OFF'}`);
    }
    
    // 'T'キーで明るさの閾値を調整（デバッグ用）
    if (key === 't' || key === 'T') {
        brightnessThreshold = brightnessThreshold === 50 ? 100 : 50;
        console.log(`Brightness threshold: ${brightnessThreshold}`);
    }
    
    // 'S'キーで画像を保存
    if (key === 's' || key === 'S') {
        save("img_" + month() + '-' + day() + '_' + hour() + '-' + minute() + '-' + second() + ".jpg");
    }
}

// ===== ウィンドウリサイズ時の処理 =====
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // WEBGL用の設定を再設定
    let dep = max(width, height);
    ortho(-width / 2, width / 2, height / 2, -height / 2, -dep * 2, dep * 2);
    eyeZ = height / 2 / tan((30 * PI) / 180);
    wall = new IntersectPlane(0, 0, 1, 0, 0, 300);
    
    // 作品を再初期化
    if (artworkInitialized) {
        initArtwork();
    }
}

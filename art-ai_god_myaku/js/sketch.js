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

// 描画用の円（将来の曼荼羅）
let circleX, circleY; // 赤い円の位置（固定）
let pupilX, pupilY; // 黒い点（瞳孔）の位置（顔を追従）
let circleSize = 300; // 大幅に拡大（テスト用）
let pupilSize = 40; // 黒い点のサイズ（少し大きく）
let followSpeed = 0.7; // 追従速度（0.15 → 0.7に大幅アップ）

// ===== プリロード =====
function preload() {
    // 音声ファイルの読み込み（現在はファイルがないためコメントアウト）
    // soundFile = loadSound('assets/sounds/ambient.mp3');
    // soundLoaded = true;
    
    // ダミー処理：音声ファイルがない場合の処理
    console.log('Preload: 音声ファイルの読み込みは未実装（ダミー処理）');
}

// ===== セットアップ =====
function setup() {
    // Canvasを画面いっぱいに作成
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas-container');
    
    // カメラを起動
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide(); // カメラ映像は非表示（Canvasに描画するため）
    
    // ml5.jsでMediaPipe Face Meshを初期化
    faceDetector = ml5.faceMesh(video, modelReady);
    
    // 赤い円の初期位置（画面中央、固定）
    circleX = width / 2;
    circleY = height / 2;
    
    // 黒い点（瞳孔）の初期位置（赤い円の中心）
    pupilX = circleX;
    pupilY = circleY;
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
    } else {
        // CLOSEDモード：音声停止
        stopSound();
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

// ===== OPEN状態の描画 =====
function drawOpenState() {
    background(0, 20); // 少し透明にすることで軌跡が残る
    
    // 顔が検出されている場合、黒い点（瞳孔）を顔の位置に追従
    if (faces && faces.length > 0) {
        // 最初の顔の位置を使用
        let face = faces[0];
        
        // Face Meshの結果から鼻の位置を取得（顔の中心として使用）
        if (face.annotations && face.annotations.noseTip) {
            let noseTip = face.annotations.noseTip[0];
            // カメラの座標をCanvasの座標に変換
            let targetX = map(noseTip[0], 0, video.width, 0, width);
            let targetY = map(noseTip[1], 0, video.height, 0, height);
            
            // 黒い点を顔の位置に向かって移動（高速追従）
            pupilX = lerp(pupilX, targetX, followSpeed);
            pupilY = lerp(pupilY, targetY, followSpeed);
            
            // 黒い点が赤い円の範囲内に収まるように制限（範囲を広く）
            let maxDistance = (circleSize - pupilSize) / 2;
            let dx = pupilX - circleX;
            let dy = pupilY - circleY;
            let distance = sqrt(dx * dx + dy * dy);
            
            if (distance > maxDistance) {
                // 円の範囲内に制限
                let angle = atan2(dy, dx);
                pupilX = circleX + cos(angle) * maxDistance;
                pupilY = circleY + sin(angle) * maxDistance;
            }
        }
        
        // デバッグ用：顔パーツの点を描画
        if (showDebugPoints && face.annotations) {
            drawFaceLandmarks(face.annotations);
        }
    } else {
        // 顔が検出されていない場合、黒い点を中央（赤い円の中心）に戻す（高速）
        pupilX = lerp(pupilX, circleX, 0.3);
        pupilY = lerp(pupilY, circleY, 0.3);
    }
    
    // 赤い円を描画（固定位置、将来の曼荼羅のプレースホルダー）
    fill(255, 0, 0);
    noStroke();
    ellipse(circleX, circleY, circleSize, circleSize);
    
    // 黒い点（瞳孔）を描画（顔を追従）
    fill(0);
    noStroke();
    ellipse(pupilX, pupilY, pupilSize, pupilSize);
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

// ===== サウンド制御（ダミー処理） =====
function playSound() {
    // 音声ファイルがある場合の処理（現在はコメントアウト）
    // if (soundLoaded && soundFile) {
    //     if (!soundFile.isPlaying()) {
    //         soundFile.play();
    //     }
    // }
    
    // ダミー処理：コンソールに出力
    console.log('Sound Play');
}

function stopSound() {
    // 音声ファイルがある場合の処理（現在はコメントアウト）
    // if (soundLoaded && soundFile && soundFile.isPlaying()) {
    //     soundFile.stop();
    // }
    
    // ダミー処理：コンソールに出力
    console.log('Sound Stop');
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
}

// ===== ウィンドウリサイズ時の処理 =====
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    circleX = width / 2;
    circleY = height / 2;
    pupilX = circleX;
    pupilY = circleY;
}

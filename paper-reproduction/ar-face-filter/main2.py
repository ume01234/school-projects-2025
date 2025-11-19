import cv2
import mediapipe as mp
import numpy as np

# 各フィルター画像を読み込み
filters = {
    "1": cv2.imread("images/image.png", cv2.IMREAD_UNCHANGED),
    "2": cv2.imread("images/image2.png", cv2.IMREAD_UNCHANGED),
    "3": cv2.imread("images/image3.png", cv2.IMREAD_UNCHANGED),
    "4": cv2.imread("images/image4.png", cv2.IMREAD_UNCHANGED)
}

current_filter = "1"  # 初期値：猫

def overlay_transparent(background, overlay, x, y, overlay_size=None):
    bg = background.copy()
    if overlay is None:
        return bg
    if overlay_size:
        overlay = cv2.resize(overlay, overlay_size, interpolation=cv2.INTER_AREA)

    h, w = overlay.shape[:2]
    if x < 0 or y < 0 or x + w > bg.shape[1] or y + h > bg.shape[0]:
        return bg

    b, g, r, a = cv2.split(overlay)
    overlay_rgb = cv2.merge((b, g, r))
    mask = a / 255.0
    roi = bg[y:y+h, x:x+w]
    for c in range(3):
        roi[:, :, c] = roi[:, :, c] * (1.0 - mask) + overlay_rgb[:, :, c] * mask
    bg[y:y+h, x:x+w] = roi
    return bg

# FaceMesh 初期化（略）+ カメラ起動（略）
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# カメラ起動
cap = cv2.VideoCapture(0)



while True:
    ret, frame = cap.read()
    if not ret:
        break
    h, w, _ = frame.shape
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(frame_rgb)

    if results.multi_face_landmarks:
        for landmarks in results.multi_face_landmarks:
            left = landmarks.landmark[105]
            right = landmarks.landmark[334]
            cx = int((left.x + right.x) / 2 * w)
            cy = int((left.y + right.y) / 2 * h)
            face_width = int(abs(right.x - left.x) * w * 2.5)

            current_img = filters[current_filter]
            if current_img is not None:
                filter_height = int(current_img.shape[0] * face_width / current_img.shape[1])
                x1 = cx - face_width // 2
                y1 = cy - int(filter_height * 0.85)

                frame = overlay_transparent(frame, current_img, x1, y1, (face_width, filter_height))

    cv2.imshow("AR Filter Switcher", frame)
    
    key = cv2.waitKey(1) & 0xFF
    if key == 27:  # ESC
        break
    elif chr(key) in filters:
        current_filter = chr(key)  # '1', '2', '3'などで切り替え

cap.release()
cv2.destroyAllWindows()

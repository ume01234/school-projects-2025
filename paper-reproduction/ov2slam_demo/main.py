import cv2
import numpy as np

# パラメータ
lk_params = dict(winSize=(21,21), maxLevel=3,
                 criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))

# カメラ起動
cap = cv2.VideoCapture(0)
ret, old = cap.read()
old_gray = cv2.cvtColor(old, cv2.COLOR_BGR2GRAY)
p0 = cv2.goodFeaturesToTrack(old_gray, maxCorners=200, qualityLevel=0.3, minDistance=7)

# 軌跡用
mask = np.zeros_like(old)

while True:
    ret, frame = cap.read()
    frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    p1, st, err = cv2.calcOpticalFlowPyrLK(old_gray, frame_gray, p0, None, **lk_params)

    if p1 is not None:
        good_new = p1[st==1]
        good_old = p0[st==1]
        for i, (new, oldp) in enumerate(zip(good_new, good_old)):
            a,b = new.ravel()
            c,d = oldp.ravel()
            a, b, c, d = int(a), int(b), int(c), int(d) 
            mask = cv2.line(mask, (a,b),(c,d), (0,255,0), 2)
            frame = cv2.circle(frame, (a,b), 3, (0,0,255), -1)
        img = cv2.add(frame, mask)
        cv2.imshow('OV2SLAM-lite', img)

    k = cv2.waitKey(1)
    if k == 27: break

    old_gray = frame_gray.copy()
    p0 = good_new.reshape(-1,1,2)

cap.release()
cv2.destroyAllWindows()

# AR Face Filter
An AR app using Mediapipe and OpenCV to apply face filters.

## ✔︎ Overview

A product developed as part of a class on AR technology.  
This is a real-time AR application that automatically applies filters to the user's face.  
Users can switch between filters (cat, crown, hat, cat ears, etc.) using keyboard input.

---

## ✔︎ Execution

Run the following command：

```bash
% python main2.py
```

- The camera will automatically start  
- When a face is detected, a filter will automatically be displayed 
- Pressing the following number keys will switch the displayed filter
- Press `esc` to exit

| Number Key | Displayed Filter     |
|----------|----------------------|
| `1`      | Cat Ears　　　            |
| `2`      | Cat                   |
| `3`      | Crown　　　　　　       |
| `4`      | Hat                 |

---

## ✔︎ Technology Stack

- **Language**：Python 
- **Main Libraries**：
  - `mediapipe`（face detection and landmark detection）
  - `opencv-python`（image processing and camera control）
  - `numpy`（image computation）

---

## ✔︎ Development Method

- **Environment**：Local（Mac）
- **Development Time**：about 30minutes
- **Editor**：Visual Studio Code  
- **Use of AI**：
  - Code generation and refinement using OpenAI ChatGPT  
  - Background-transparent PNG images generated using ChatGPT's DALL·E function

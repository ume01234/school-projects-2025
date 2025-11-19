# OV²SLAM: A Fully Online and Versatile Visual SLAM for Real-Time Applications
Reimplementation based on a research paper on a visual SLAM framework.

## ✔︎ Paper Information

- **Title**: OV²SLAM: A Fully Online and Versatile Visual SLAM for Real-Time Applications  
- **Authors**: Axel Barrau, Pierre Gouton, Jean-Philippe Tardif, et al.  
- **Published**: 2021  
- **Link**: [arXiv:2102.04060](https://arxiv.org/abs/2102.04060)  

This paper presents OV²SLAM, a lightweight visual SLAM framework capable of real-time simultaneous localization and mapping.  
It supports monocular, stereo, and RGB-D cameras and features a flexible ROS-based architecture.

---

## ✔︎ Technical Overview

OV²SLAM simplifies traditional visual SLAM pipelines while maintaining real-time performance and high accuracy. The core components are:

### 1. Front-End (Feature Extraction and Tracking)
- Uses ORB features (or FAST + BRIEF) to extract keypoints from images  
- Tracks features using Lucas–Kanade optical flow  
- Selects keyframes to pass to the next stage  

### 2. Local Mapping
- Performs triangulation between keyframes to build a 3D point cloud  
- Optimizes the trajectory and map using Local Bundle Adjustment  

### 3. Loop Closing
- Detects loops using iBoW-LCD (an image BoW dictionary)  
- Refines the global map via Pose Graph Optimization  

### 4. Trajectory Estimation and Map Output
- Lightweight and thread-independent implementation enables real-time updates  
- Outputs: 6DoF camera trajectory and sparse 3D map  

### 5. Input/Output Formats
- **Input**: RGB video (monocular / stereo / RGB-D supported)  
- **Output**: Real-time trajectory, visualization map, and pose files (TUM/EuRoC format)

---

## ✔︎ Execution Commands
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install opencv-python numpy
pip install -r requirements.txt   
python main.py
```

---
## ✔︎ References
- Paper: [arXiv:2102.04060](https://arxiv.org/abs/2102.04060)  
- iBoW-LCD: Loop Closure Detection via Incremental Bag-of-Words
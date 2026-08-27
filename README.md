# 🪐 3D Collatz Conjecture Visualizer

An interactive, high-performance 3D web visualizer for the **Collatz Conjecture** ($3n + 1$ problem), powered by **Three.js**, **Vite**, and modern glassmorphic UI design.

![3D Collatz Visualizer](https://img.shields.io/badge/Three.js-r160-6366f1?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-v5.4-646cff?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📌 Overview

The **Collatz Conjecture** is one of mathematics' most famous unsolved problems, introduced by Lothar Collatz in 1937.

Given any positive integer $n$:
- If $n$ is **even**, divide it by 2: $$f(n) = \frac{n}{2}$$
- If $n$ is **odd**, multiply by 3 and add 1: $$f(n) = 3n + 1$$

The conjecture asserts that regardless of the initial starting number $n$, repeating this process will **always reach 1**.

This application allows you to explore the sequence dynamics in **interactive 3D space**, analyze hailstone ascents and descents, step through animations, and inspect detailed statistical breakdowns.

---

## ✨ Features

- 🌌 **3D Orbit Ribbon & Tube Trajectory**:
  - Renders the full sequence path as a glowing 3D Catmull-Rom tube.
  - Sphere nodes color-coded by parity: **Cyan** for even division ($n/2$), **Coral/Gold** for odd multiplication ($3n+1$).
  - Animated energy pulse following the active step during sequence playback.
  - **Logarithmic vs. Linear** height scale toggle.

- 🌿 **3D Collatz Tree Visualizer (Reverse Trajectories)**:
  - Generates the reverse 3D branching graph expanding backwards from 1 ($2n$ and $\frac{n-1}{3}$).
  - Highlights the exact trajectory of your target number within the broader tree in vibrant neon coral.

- 📊 **3D Range Landscape**:
  - 3D matrix bar chart displaying total stopping times for numbers in a range ($1 \dots N$).

- 📈 **Real-Time Analytics Dashboard**:
  - **Total Stopping Time**: Step count to reach 1.
  - **Peak Maximum Height**: Highest value reached and peak ratio relative to start ($\text{Peak} / N$).
  - **Odd vs. Even Step Ratio**: Visual breakdown and percentages of ascents vs. descents.

- ⏯️ **Playback & Interactive Controls**:
  - Play / Pause sequence animation with adjustable speed slider ($0.25\times \dots 3\times$).
  - Step forward/backward manual navigation.
  - Dynamic Web Audio API chime synthesis on step progression.

- 📑 **Data Table & Export**:
  - Slide-out step-by-step table displaying step number, value, parity operation, and formula.
  - One-click **CSV export** for data analysis.

- 🌟 **Famous Presets**:
  - Quick-select legendary high-step numbers: $n = 27$ (111 steps), $n = 97$ (118 steps), $n = 871$ (178 steps), $n = 6171$ (261 steps), $n = 77031$ (350 steps).

---

## 🛠️ Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ESM + BigInt arbitrary precision)
- **3D Graphics**: [Three.js](https://threejs.org/) (OrbitControls, TubeGeometry, BufferGeometry, custom lighting & starfield particle systems)
- **Styling**: Vanilla CSS3 (Custom properties, CSS Grid/Flexbox, Glassmorphism backdrop-blur, Dark Neon Theme)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Audio**: Web Audio API (real-time synthesized frequency chimes)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone git@github.com-personal:yogendra-17/3D-Collatz-Conjecture-Visualizer.git
   cd 3D-Collatz-Conjecture-Visualizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The built output will be generated in the `dist/` directory.

---

## 📜 Math Reference & Records

| Starting Number ($n$) | Total Stopping Time (Steps) | Maximum Peak Value |
| :--- | :--- | :--- |
| **9** | 19 | 52 |
| **12** | 9 | 16 |
| **19** | 20 | 88 |
| **27** | 111 | 9,232 |
| **97** | 118 | 9,232 |
| **871** | 178 | 190,996 |
| **6,171** | 261 | 25,602,576 |
| **77,031** | 350 | 21,807,172 |
| **837,799** | 524 | 2,974,984,576 |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

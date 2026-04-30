<div align="center">
  <img src="assets/favicon.png" alt="Logo" width="80" height="80" style="border-radius: 50%;">
  <h3 align="center">jayvarma.site - Personal Portfolio</h3>
  <p align="center">
    A personal portfolio blending Game Development, 3D Art, and Data Science.
    <br />
    <a href="https://jayvarma.site"><strong>View Live Site »</strong></a>
    <br />
    <br />
    <a href="#-features">Features</a>
    ·
    <a href="#-tech-stack">Tech Stack</a>
    ·
    <a href="#%EF%B8%8F-installation--local-setup">Installation</a>
  </p>
</div>

---

## 🚀 About The Project

This repository contains the source code for my personal portfolio website, [jayvarma.site](https://jayvarma.site). 

Designed to reflect my passions and professional journey, the portfolio is built with a unique, interactive, and terminal-inspired aesthetic. It serves as a comprehensive showcase of my work across various disciplines, including game development, 3D modeling, and data science/machine learning.

### 🎯 Features

* **Interactive Terminal UI:** A sleek, retro-modern interface that engages users right from the boot sequence (press `E` to continue).
* **Multi-Disciplinary Showcase:** Categorized project views filtering between Games, Web Projects, and Data Science models.
* **Integrated Notebook Viewer:** Custom parsing and rendering of computational notebooks (like Jupyter) using Marked and Prism.js natively in the browser.
* **3D & Cinematic Galleries:** Dedicated spaces to view 3D artwork and watch embedded cinematic short films (e.g., *Osaka no Urami*).
* **High Performance:** Built with pure HTML/CSS/JS without heavy frameworks for fast load times and smooth animations.
* **Fully Responsive:** Optimized for seamless viewing across all desktop and mobile devices.

## 💻 Tech Stack

The project relies on core web technologies, utilizing vanilla JavaScript and custom CSS to maintain complete control over the user experience.

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Typography & Icons:** [FontAwesome 6](https://fontawesome.com/), Google Fonts (JetBrains Mono)
* **Libraries:**
  * [TensorFlow.js](https://www.tensorflow.org/js) - For running browser-based machine learning demos.
  * [Marked.js](https://marked.js.org/) - For parsing Markdown content.
  * [Prism.js](https://prismjs.com/) - For syntax highlighting in code blocks.

## 📁 Project Structure

```text
/
├── assets/                  # Images, 3D models, and external project data files
├── index.html               # Main entry point and DOM structure
├── style.css                # Core styling, layouts, and animations
├── script.js                # Main application logic (navigation, filtering, UI)
├── notebook_viewer.js       # Custom logic for rendering notebook data formats
├── notebook_style.css       # Specific styling for the integrated notebook viewer
└── vercel.json              # Deployment configuration for Vercel
```

## 🛠️ Installation & Local Setup

To run this project locally, you will need a local HTTP server (running it directly via `file://` may restrict some functionality due to CORS policies on loading local files).

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jayyvarmaa/website.git
   cd website
   ```

2. **Start a local development server:**
   
   Using **Python** (if installed):
   ```bash
   python -m http.server 8000
   ```
   
   Using **Node.js**:
   ```bash
   npx http-server
   ```
   
   Using **VS Code**:
   * Install the "Live Server" extension.
   * Right-click `index.html` and select "Open with Live Server".

3. **View the site:**
   Open your browser and navigate to `http://localhost:8000` (or the port specified by your server).

## 📬 Contact & Links

**Jay Varma**
- 📧 [jaymayurvarma@gmail.com](mailto:jaymayurvarma@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/jayyvarmaa)
- 🐙 [GitHub](https://github.com/jayyvarmaa)

---
<div align="center">
  <i>"It's not a bug, it's a feature!" - Every Developer Ever</i>
</div>

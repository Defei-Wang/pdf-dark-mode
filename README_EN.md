<div align="center">

# PDF Dark Mode

### Lossless Vector PDF Dark Mode Web App · 100% Client-Side & Offline

**Crystal-Clear Typography · Scalable to 6400% without Blurriness · Text Selectable & Copyable · 100% Private**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy to GitHub Pages](https://github.com/Defei-Wang/pdf-dark-mode/actions/workflows/deploy.yml/badge.svg)](https://github.com/Defei-Wang/pdf-dark-mode/actions)
[![Live Demo](https://img.shields.io/badge/Online%20Demo-GitHub%20Pages-emerald.svg)](https://Defei-Wang.github.io/pdf-dark-mode/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF)](https://vitejs.dev/)

**[English Documentation](./README_EN.md)** · **[中文文档](./README.md)**

</div>

---

## 📌 Project Description

**PDF Dark Mode** is a high-performance, pure client-side web application engineered to convert PDF documents into crisp, aesthetic dark mode files while strictly preserving **100% of the underlying vector graphics and typography**.

Conventional tools achieve "dark mode" by rendering pages to an HTML5 Canvas and taking JPEG/PNG screenshots. This crude approach causes **catastrophic pixelation under zoom, destroys embedded text layers (disabling text selection and search), fractures LaTeX math equations, and bloats file size by 500% to 1000%**.

**PDF Dark Mode** completely eliminates rasterization. It operates directly at the PDF document object level by injecting an **ExtGState `/BM /Difference`** blend mode state along with complementary underlay and overlay operator streams into each page dictionary. All font glyphs, vector curves, bookmarks, and hyperlinks remain native vector entities, delivering instant, millisecond-fast dark mode transformation.

* 🌐 **Live Web Application**: [https://Defei-Wang.github.io/pdf-dark-mode/](https://Defei-Wang.github.io/pdf-dark-mode/)
* 📦 **GitHub Repository**: [https://github.com/Defei-Wang/pdf-dark-mode](https://github.com/Defei-Wang/pdf-dark-mode)

---

## 🆚 Why Vector Inversion? (Technical Comparison)

| Feature & Metric | Traditional Bitmap Approach (Canvas Rasterization) | PDF Dark Mode (Native Vector Operator Stream Injection) |
| :--- | :--- | :--- |
| **Typography & Fonts** | Replaced by raster pixels; blurs and degrades under zoom | **100% Vector Bezier Curves**; razor-sharp even at 6400% zoom |
| **Text Selection & Search** | ❌ Text layers destroyed; cannot select, copy, or search | ✅ **100% Intact**; OCR text layers and formulas remain selectable |
| **Output File Size** | Massively bloated by 5x ~ 10x (several MBs per page) | ✅ **Near-Zero Size Increase** (only tiny operator stream injected) |
| **LaTeX & Math Equations** | Low DPI leads to fractured integral signs, fractions & subscripts | ✅ Retains native font glyphs; flawless mathematical rendering |
| **Processing Speed** | Slow; requires rendering and encoding images page-by-page | ✅ Millisecond-level stream manipulation in memory |
| **Privacy & Security** | Many online tools upload user files to remote servers | ✅ **100% Local In-Browser Processing**; no server uploads |

---

## 🔬 Core Engineering & Underlying Architecture

PDF Dark Mode parses and manipulates PDF objects directly in memory using `@cantoo/pdf-lib`:

```
+-------------------------------------------------------------+
|                     PDF Page Dictionary                     |
|                                                             |
|  /Resources:                                                |
|    /ExtGState: << /GS_Dark << /BM /Difference >> >>         |
|                                                             |
|  /Contents: [                                               |
|    1. Underlay Stream:  q 1 1 1 rg x y w h re f Q q         |
|    2. Original Streams: [Original Typography & Vector Bezier Paths] |
|    3. Overlay Stream:   Q q /GS_Dark gs r g b rg x y w h re f Q |
|  ]                                                          |
+-------------------------------------------------------------+
```

### 1. Mathematical Formulation of Difference Blending

According to the PDF 1.4+ Reference Specification, the Difference blend mode is evaluated per color channel as:

$$C_{result} = | C_{backdrop} - C_{source} |$$

* **White Background Inversion**: $| 1.0 - 1.0 | = 0.0$ (Deep Black backdrop)
* **Black Typography Inversion**: $| 0.0 - 1.0 | = 1.0$ (Pure White font glyphs)
* **Color Figure Adaptation**: Chromatic diagrams and vector lines are smoothly mapped to their complementary hues without altering vector vertex coordinates.

### 2. Graphics State Isolation & Boundary Protection

* **Underlay Stream**: Prepends `q 1 1 1 rg ... re f Q q` to the page `/Contents`. This paints an opaque white canvas underneath, preventing inverted transparent backgrounds from miscomputing, and leaves an open `q` to isolate the original content.
* **Overlay Stream**: Appends `Q q /GS_Dark gs ... re f Q` to the page `/Contents`. The leading `Q` restores any unclosed Current Transformation Matrix (`cm`) or clip paths from the original document, ensuring the dark mask accurately covers the full page boundary.
* **Memory Buffer Guard**: Implements defensive `ArrayBuffer` slicing to prevent PDF.js Worker thread transfer collisions (`Transferable`), eliminating detached buffer errors and 0-byte download drops.

---

## ✨ Key Features

* 🛡️ **100% Offline Client-Side Privacy**: All processing runs in your browser's WebAssembly/JavaScript heap. No document ever leaves your device.
* 🎨 **Curated Dark Mode Tone Presets & Custom RGB**:
  * **Pure Black**: Difference `[1.0, 1.0, 1.0]` for OLED battery conservation and ultra-high contrast.
  * **Soft Charcoal**: Difference `[0.88, 0.88, 0.88]` for soothing, eye-friendly academic reading sessions.
  * **Cool Slate**: Difference `[0.84, 0.87, 0.92]` with a balanced modern blue-gray tone.
  * **Warm Amber**: Difference `[0.88, 0.85, 0.80]` to diminish blue light fatigue at night.
  * **Custom Vector Sliders**: Fine-tune R, G, B channels with precision down to 0.01 increments.
* 🔍 **HiDPI Real-Time PDF.js Preview**:
  * Multi-page navigation and continuous zoom (50% ~ 250%).
  * Instant side-by-side toggle between Dark Mode and the original document.
* 🌐 **Bilingual Interface (English & Chinese)**:
  * Full internationalization with auto-persisted language settings.
* 📄 **Built-in Sample Academic Paper**:
  * Experience the vector inversion of two-column layouts and LaTeX formulas with one click—no PDF file needed.

---

## 🚀 Local Development & Build

### Prerequisites
* Node.js >= 18.0.0
* npm >= 9.0.0

### Getting Started

```bash
# 1. Clone repository
git clone https://github.com/Defei-Wang/pdf-dark-mode.git
cd pdf-dark-mode

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build production bundle
npm run build
```

Production output will be generated in `dist/`. With `base: './'` configured in `vite.config.ts`, the bundle can be deployed to any subpath, static host, or run directly offline.

---

## 🤖 AI Search Engines & LLM Ingestion Guide

This project follows the **[llms.txt](https://llmstxt.org)** standard to enable AI search engines (ChatGPT Search, Perplexity, Claude, Gemini, Cursor) to quickly ingest, understand, and reference this repository:

* **Machine-Readable Summary**: `/llms.txt`
* **Search Engine Sitemap**: `/sitemap.xml`
* **Robots Policy**: `/robots.txt`
* **Structured Semantic Metadata**: `Schema.org WebApplication` JSON-LD embedded in `index.html`.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).  
Feedback, Issues, and Pull Requests are welcome!

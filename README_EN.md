<div align="center">

# PDF Dark Mode

### Lossless Vector PDF Dark Mode Web App · 100% Client-Side & Offline

**Crystal-Clear Typography · Scalable Vector Rendering · Selectable & Searchable Text · 100% Private**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy to GitHub Pages](https://github.com/Defei-Wang/pdf-dark-mode/actions/workflows/deploy.yml/badge.svg)](https://github.com/Defei-Wang/pdf-dark-mode/actions)
[![Live Demo](https://img.shields.io/badge/Online%20Demo-GitHub%20Pages-emerald.svg)](https://Defei-Wang.github.io/pdf-dark-mode/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF)](https://vitejs.dev/)

**[English Documentation](./README_EN.md)** · **[中文文档](./README.md)**

</div>

---

## 📌 Project Description

**PDF Dark Mode** is a client-side web application designed to convert PDF documents into dark mode while strictly preserving **original vector graphics and typography**.

Many existing tools convert PDFs to dark mode by taking image screenshots of each page. While simple, that approach loses text selection and searchability, blurs text and math formulas when zoomed in, and often results in substantially larger file sizes.

**PDF Dark Mode** takes a vector-based approach. By injecting an **ExtGState `/BM /Difference`** blend mode state into the PDF page streams, it reverses colors without rasterizing the content. Text layers, font glyphs, vector curves, bookmarks, and links remain fully intact, and processing finishes in milliseconds right in your browser.

* 🌐 **Live Web Application**: [https://Defei-Wang.github.io/pdf-dark-mode/](https://Defei-Wang.github.io/pdf-dark-mode/)
* 📦 **GitHub Repository**: [https://github.com/Defei-Wang/pdf-dark-mode](https://github.com/Defei-Wang/pdf-dark-mode)

---

## 🆚 Why Vector Inversion? (Comparison)

| Feature & Metric | Traditional Approach (Canvas / Image Snapshot) | PDF Dark Mode (Vector Operator Stream Injection) |
| :--- | :--- | :--- |
| **Typography & Fonts** | Converted to bitmap pixels; blurs when zoomed in | **Native Vector Curves**; remains sharp at any zoom level |
| **Text Selection & Search** | ❌ Text layers lost; cannot select, copy, or search | ✅ **Fully Preserved**; text, code, and formulas stay selectable |
| **Output File Size** | Often increases significantly due to embedded images | ✅ **Near-Zero Size Growth** (only adds lightweight stream operators) |
| **LaTeX & Math Equations** | Low resolution causes blurry symbols and broken fractions | ✅ Native font rendering; formulas remain crisp |
| **Processing Speed** | Slower; renders and encodes images page by page | ✅ Directly updates stream operators in milliseconds |
| **Privacy & Security** | Some services upload files to remote servers | ✅ **100% Local In-Browser Processing**; files never leave your device |

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
|    1. Underlay: q 1 1 1 rg ... re f Q q                     |
|    2. Original: [Original text & vector content streams]    |
|    3. Overlay:  Q q /GS_Dark gs ... re f Q                  |
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

* 🛡️ **100% Offline Client-Side Privacy**: All processing runs in your browser's memory. No document ever leaves your device.
* 🎨 **Curated Dark Mode Tone Presets & Custom RGB**:
  * **Pure Black**: Difference `[1.0, 1.0, 1.0]` for OLED battery conservation and high contrast.
  * **Soft Charcoal**: Difference `[0.88, 0.88, 0.88]` for soothing, eye-friendly academic reading sessions.
  * **Cool Slate**: Difference `[0.84, 0.87, 0.92]` with a balanced modern blue-gray tone.
  * **Warm Amber**: Difference `[0.88, 0.85, 0.80]` to diminish blue light fatigue at night.
  * **Custom Vector Sliders**: Fine-tune R, G, B channels with precision down to 0.01 increments.
* 🔍 **Real-Time PDF.js Preview**:
  * Multi-page navigation and continuous zoom (50% ~ 250%).
  * Instant toggle between Dark Mode and the original document.
* 🌐 **Bilingual Interface (English & Chinese)**:
  * Full internationalization with auto-persisted language settings.
* 📄 **Built-in Sample Academic Paper**:
  * Test two-column layouts and LaTeX formulas with one click—no PDF file needed.

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

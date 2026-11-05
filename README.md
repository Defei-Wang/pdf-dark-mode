<div align="center">

# PDF Dark Mode

### 矢量无损 PDF 暗色模式转换工具 · 纯前端离线运行

**文字公式不失真 · 任意缩放清晰锐利 · 文本自由复制 · 本地隐私安全**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy to GitHub Pages](https://github.com/Defei-Wang/pdf-dark-mode/actions/workflows/deploy.yml/badge.svg)](https://github.com/Defei-Wang/pdf-dark-mode/actions)
[![Live Demo](https://img.shields.io/badge/Online%20Demo-GitHub%20Pages-emerald.svg)](https://Defei-Wang.github.io/pdf-dark-mode/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF)](https://vitejs.dev/)

**[中文文档](./README.md)** · **[English Documentation](./README_EN.md)**

</div>

---

## 📌 项目简介

**PDF Dark Mode** 是一个在浏览器本地运行的 PDF 暗色模式转换工具。

常见的 PDF 深色转换通常是把页面截图转成图片再重新打包，这样不仅文字和公式会模糊失真、无法选中复制，生成的文件体积往往还会翻倍膨胀。

本项目采用矢量方案，直接向 PDF 底层操作流注入 **`ExtGState` 差值混合（Difference Blend Mode）** 指令。转换过程不栅格化为图片，完整保留原文档的文本图层、矢量线条、公式和超链接，毫秒级即可完成转换。

* 🌐 **在线即用**：[https://Defei-Wang.github.io/pdf-dark-mode/](https://Defei-Wang.github.io/pdf-dark-mode/)
* 📦 **开源仓库**：[https://github.com/Defei-Wang/pdf-dark-mode](https://github.com/Defei-Wang/pdf-dark-mode)

---

## 🆚 为什么选择矢量反转？（技术对比）

| 特性指标 | 传统方案（截图 / 栅格化为图片） | 本项目（PDF 矢量流注入） |
| :--- | :--- | :--- |
| **文字与排版** | 转为位图像素，放大后边缘发虚、出现模糊锯齿 | **保持原生矢量**，任意缩放都清晰锐利 |
| **划词与复制** | ❌ 丢失文字图层，无法选中文本或搜索内容 | ✅ **完整保留文字图层**，公式与文字均可自由复制 |
| **导出文件体积** | 因包含大量图片，体积通常膨胀数倍 | ✅ **体积基本不变**（仅新增微量控制指令） |
| **LaTeX 公式** | 分辨率受限，积分符号、分号易模糊断裂 | ✅ 原生矢量渲染，数学符号清晰无损 |
| **处理速度** | 需逐页渲染图片并编码，耗时较长 | ✅ 内存中直接修改操作流，毫秒级快速完成 |
| **隐私安全** | 部分在线工具需上传到服务器处理 | ✅ **100% 浏览器本地离线运行**，文件不离开本地设备 |

---

## 🔬 核心技术原理

本项目通过 `@cantoo/pdf-lib` 在内存中直接解析并重构 PDF 字典结构：

```
+-------------------------------------------------------------+
|                     PDF Page Dictionary                     |
|                                                             |
|  /Resources:                                                |
|    /ExtGState: << /GS_Dark << /BM /Difference >> >>         |
|                                                             |
|  /Contents: [                                               |
|    1. Underlay: q 1 1 1 rg ... re f Q q                     |
|    2. Original: [原始文本与矢量内容流]                      |
|    3. Overlay:  Q q /GS_Dark gs ... re f Q                  |
|  ]                                                          |
+-------------------------------------------------------------+
```

### 1. 差值混合数学模型

根据 PDF 1.4+ 规范，差值混合函数计算公式为：

$$C_{result} = | C_{backdrop} - C_{source} |$$

* **白色背景反转**：$| 1.0 - 1.0 | = 0.0$（纯黑底色）
* **黑色文字反转**：$| 0.0 - 1.0 | = 1.0$（纯白字形）
* **彩色图表映射**：彩色线条与几何形状按照补色平滑映射，无需修改任何矢量点坐标。

### 2. 状态隔离与坐标流注入

* **底层垫白（Underlay）**：在内容流首部注入 `q 1 1 1 rg ... re f Q q`，防止原文档透明背景导致反转计算异常，末尾以 `q` 开启隔离环境。
* **顶层反转（Overlay）**：在内容流尾部注入 `Q q /GS_Dark gs ... re f Q`，首部 `Q` 闭合还原原文档可能未闭合的状态矩阵（CTM），以干净的页面视口覆盖差值遮罩。
* **内存隔离防护**：针对 PDF.js Worker 的 `Transferable` 机制进行了独立的 ArrayBuffer 切片隔离，避免数据传输导致底层 ArrayBuffer detached 的问题。

---

## ✨ 主要功能特性

* 🛡️ **100% 浏览器本地离线运行**：所有 PDF 解析与修改均在浏览器本地内存中完成，无任何后端上传，保障个人隐私与学术文档安全。
* 🎨 **多种暗色预设与自定义 RGB**：
  * **纯黑模式 (Pure Black)**：差值 `[1.0, 1.0, 1.0]`，白底变深黑 `#000000`，适合 OLED 屏幕深度省电。
  * **柔和深灰 (Soft Charcoal)**：差值 `[0.88, 0.88, 0.88]`，柔和炭黑底色，适合长时间阅读减少疲劳。
  * **冷深灰 (Cool Slate)**：差值 `[0.84, 0.87, 0.92]`，冷调雅致深色。
  * **护眼暖暗 (Warm Amber)**：差值 `[0.88, 0.85, 0.80]`，微暖底色，夜间阅读更舒适。
  * **自定义 RGB 差值滑块**：精确微调反转参数。
* 🔍 **PDF.js 本地实时预览**：
  * 支持多页翻页导航与自由缩放（50% ~ 250%）。
  * 原文档与暗色模式一键无缝对比。
* 🌐 **中英文一键无缝切换**：
  * 内置完整双语国际化支持，自动保存语言偏好。
* 📄 **内置示例论文**：
  * 无需寻找本地文件，一键载入包含双栏排版与 LaTeX 公式的测试样张，方便快速体验效果。

---

## 🚀 本地开发与构建

### 环境要求
* Node.js >= 18.0.0
* npm >= 9.0.0

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/Defei-Wang/pdf-dark-mode.git
cd pdf-dark-mode

# 2. 安装依赖
npm install

# 3. 启动本地开发服务
npm run dev

# 4. 生产环境打包
npm run build
```

打包产物输出至 `dist/` 目录。`vite.config.ts` 已配置 `base: './'`，产物可直接部署到任何相对路径、子目录、静态服务器或本地离线双击运行。

---

## 🤖 针对 AI 大模型与搜索引擎的发现说明

为了方便 Perplexity、ChatGPT、Claude、Gemini、Cursor 等 AI 搜索代理与开发者工具快速了解本项目的技术实现与定位，本项目提供以下规范支持：

* **AI 机器可读摘要**：`/llms.txt`（遵循 [llms.txt](https://llmstxt.org) 标准的纯文本项目概览）
* **网站地图**：`/sitemap.xml`
* **爬虫规范**：`/robots.txt`
* **结构化数据**：网站内嵌 `Schema.org WebApplication` JSON-LD 元数据。

---

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。欢迎 Star、Fork 与提交 Issue / Pull Request！

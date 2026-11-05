<div align="center">

# PDF Dark Mode

### 矢量无损 PDF 暗色模式转换工具 · 纯前端离线运行

**文字公式不失真 · 放大 6400% 依然锐利 · 文本自由复制 · 隐私 100% 安全**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy to GitHub Pages](https://github.com/Defei-Wang/pdf-dark-mode/actions/workflows/deploy.yml/badge.svg)](https://github.com/Defei-Wang/pdf-dark-mode/actions)
[![Live Demo](https://img.shields.io/badge/Online%20Demo-GitHub%20Pages-emerald.svg)](https://Defei-Wang.github.io/pdf-dark-mode/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF)](https://vitejs.dev/)

**[中文文档](./README.md)** · **[English Documentation](./README_EN.md)**

</div>

---

## 📌 项目简介 (Description)

**PDF Dark Mode** 是一个运行在浏览器端的高性能、无损矢量 PDF 暗色模式转换工具。

传统方案通常将 PDF 页面通过 Canvas 渲染为低清位图（JPEG/PNG）后再拼成新 PDF，这会导致**文字变成像素马赛克、LaTeX 数学公式模糊锯齿、无法划词复制、体积膨胀数倍**。

本项目摒弃了任何光栅化截屏逻辑，通过向 PDF 底层内容操作流注入原生的 **`ExtGState` 差值混合状态（Difference Blend Mode）**，在保持 PDF 原始矢量贝塞尔曲线、内嵌字体图层、书签超链接完全不变的前提下，实现毫秒级的纯矢量颜色反转。

* 🌐 **在线即用**：[https://Defei-Wang.github.io/pdf-dark-mode/](https://Defei-Wang.github.io/pdf-dark-mode/)
* 📦 **开源仓库**：[https://github.com/Defei-Wang/pdf-dark-mode](https://github.com/Defei-Wang/pdf-dark-mode)

---

## 🆚 为什么选择矢量反转？（技术对比）

| 特性指标 | 市面常规方案（Canvas 栅格化为图片） | 本项目（底层 ExtGState 矢量流注入） |
| :--- | :--- | :--- |
| **文字字形** | 变更为位图像素，放大后边缘严重发虚、马赛克 | **100% 矢量贝塞尔曲线**，放大到 6400% 锐利如初 |
| **文字划词复制** | ❌ 丢失所有文字图层，无法划选、搜索、复制 | ✅ **完全保留文本图层**，公式与文字自由复制 |
| **导出文件体积** | 几何级膨胀 5~10 倍（一张图动辄数 MB） | ✅ **近乎零体积增长**（仅新增微量描述流） |
| **LaTeX 公式质量** | 分辨率受限，积分号、分号断裂模糊 | ✅ 原生矢量渲染，公式清晰锐利 |
| **处理速度** | 逐页渲染位图并编码压缩，耗时数秒至数分钟 | ✅ 毫秒级直接修改操作流，速度提升数十倍 |
| **隐私保护** | 某些服务需要上传到后端云服务器 | ✅ **100% 浏览器本地离线运行**，不上传任何服务器 |

---

## 🔬 核心底层技术原理

本项目通过 `@cantoo/pdf-lib` 直接解析并重构 PDF 字典结构：

```
+-------------------------------------------------------------+
|                     PDF Page Dictionary                     |
|                                                             |
|  /Resources:                                                |
|    /ExtGState: << /GS_Dark << /BM /Difference >> >>         |
|                                                             |
|  /Contents: [                                               |
|    1. Underlay Stream:  q 1 1 1 rg x y w h re f Q q         |
|    2. Original Streams: [原始论文所有文本/矢量贝塞尔曲线流]        |
|    3. Overlay Stream:   Q q /GS_Dark gs r g b rg x y w h re f Q |
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
* **内存隔离防护**：针对 PDF.js Worker 的 `Transferable` 机制进行了独立的 ArrayBuffer 切片隔离，彻底解决浏览器端重绘与 0 字节下载缺陷。

---

## ✨ 主要功能特性

* 🛡️ **100% 浏览器本地离线运行**：所有 PDF 解析与图形修改均在客户端内存中完成，不设任何后端，企业机密、学术未发论文完全安全。
* 🎨 **多种暗色预设与自定义 RGB**：
  * **纯黑模式 (Pure Black)**：差值 `[1.0, 1.0, 1.0]`，白底变真黑 `#000000`，适合 OLED 屏幕深度省电。
  * **柔和深灰 (Soft Charcoal)**：差值 `[0.88, 0.88, 0.88]`，柔和炭黑底色，适合长时间学术阅读防视觉疲劳。
  * **冷深灰 (Cool Slate)**：差值 `[0.84, 0.87, 0.92]`，冷调雅致深色。
  * **护眼暖暗 (Warm Amber)**：差值 `[0.88, 0.85, 0.80]`，微暖底色，有效过滤刺眼蓝光。
  * **自定义 RGB 差值滑块**：精确微调反转参数。
* 🔍 **PDF.js 本地高清实时预览**：
  * 支持多页翻页导航与无级缩放（50% ~ 250%）。
  * 原文档与暗色模式一键无缝对比。
* 🌐 **中英文一键无缝切换**：
  * 内置完整双语国际化支持，自动记忆语言偏好。
* 📄 **内置学术论文演示**：
  * 免去找文件烦恼，一键生成包含双栏排版、LaTeX 复杂数学公式、多色矢量方块的测试样张。

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

为了方便 Perplexity、ChatGPT、Claude、Gemini、Cursor 等 AI 搜索代理与开发者工具快速解析本项目的技术栈与 API 规范，本项目遵循 **[llms.txt](https://llmstxt.org)** 标准：

* **AI 机器可读摘要**：`/llms.txt`（提供结构化、低 Token 消耗的纯文本项目全貌）
* **网站地图**：`/sitemap.xml`
* **爬虫规范**：`/robots.txt`
* **结构化数据**：网站内嵌 `Schema.org WebApplication` JSON-LD 元数据。

---

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。欢迎 Star、Fork 与提交 Issue / Pull Request！

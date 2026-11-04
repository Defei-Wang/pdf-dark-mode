# PDF Dark Mode - 矢量无损暗色转换工具

> **纯前端运行的“矢量 PDF 无损暗色模式转换工具”（Lossless Vector PDF Dark Mode Web App）**  
> GitHub 仓库: [https://github.com/Defei-Wang/pdf-dark-mode](https://github.com/Defei-Wang/pdf-dark-mode)  
> GitHub Pages 访问地址: [https://Defei-Wang.github.io/pdf-dark-mode/](https://Defei-Wang.github.io/pdf-dark-mode/)

---

## 💡 技术背景与核心原理（拒绝栅格化）

市面上大多数 PDF 暗色模式工具采用的是**将页面渲染到 HTML5 Canvas 后截取为 JPEG/PNG 图片重新打包**的粗暴方案。这种方案具有严重弊端：
1. **失真与模糊**：文字和数学公式被固定为固定分辨率位图，稍微放大阅览即出现严重锯齿与马赛克。
2. **文字无法划词复制**：原文档的所有文本图层、OCR 编码信息全部丢失。
3. **体积严重膨胀**：几十页的原本几十 KB 或数 MB 的矢量论文，被光栅化为图片后膨胀至上百 MB。

### 🌟 本项目的真矢量反转机制

本项目完全通过修改 PDF 底层图形状态流（PDF Content Streams & ExtGState）实现无损反转：

1. **注册差值混合图形状态**：
   在 PDF 上下文中动态构建 `/Type /ExtGState`，并设置 `/BM /Difference`（差值混合模式），将其作为命名资源 `/GS_Dark` 注入每个页面的 `/Resources/ExtGState` 字典中。
2. **底层垫白流（Underlay Stream）**：
   在页面内容流（`/Contents`）最前端注入白色矩形操作流：
   ```pdf
   q
   1 1 1 rg
   [minX] [minY] [width] [height] re
   f
   Q
   ```
   防止原文档存在透明背景时导致反相计算异常。
3. **顶层差值遮罩流（Overlay Stream）**：
   在页面内容流（`/Contents`）最末端注入差值遮罩流：
   ```pdf
   q
   /GS_Dark gs
   [r] [g] [b] rg
   [minX] [minY] [width] [height] re
   f
   Q
   ```
   根据 PDF 规范中的差值计算公式：
   $$C_{result} = | C_{backdrop} - C_{source} |$$
   - 页面白底 $(1, 1, 1)$ 在差值反转下自动成为深黑底色。
   - 原黑色文字 $(0, 0, 0)$ 在差值反转下自动成为纯白文字。
   - 所有彩色图表按补色平滑映射，矢量几何线条、贝塞尔曲线与内嵌字体字形**100% 保持原生矢量状态**，可无级放大至 6400% 依旧锋利如初，文字与公式完全支持划词选中与复制！

---

## 🚀 功能特性

- 🛡️ **100% 纯前端离线运行**：数据完全在浏览器内存中处理，绝不上传任何服务器，保护论文与商业文件隐私。
- 🎨 **暗色偏好调节**：
  - **纯黑模式 (Pure Black)**：差值 `[1.0, 1.0, 1.0]`，白底变真黑 `#000000`，黑字变纯白 `#FFFFFF`，高对比度。
  - **柔和深灰 (Soft Charcoal)**：差值 `[0.88, 0.88, 0.88]`，白底变柔和炭黑 `#1F1F1F`，黑字变柔白 `#E0E0E0`，适合长时间沉浸阅读防刺眼。
  - **冷深灰 (Cool Slate)**：差值 `[0.84, 0.87, 0.92]`，白底呈现代冷调深灰/暗藏青，黑字呈冷银白。
  - **护眼暖暗 (Warm Amber)**：差值 `[0.88, 0.85, 0.80]`，白底呈温润暖暗色，夜间护眼。
  - **自定义矩阵 (Custom RGB)**：支持 RGB 矢量差值微调滑块。
- 🔍 **高清实时渲染预览**：
  - 使用 `pdfjs-dist` 本地打包的 Worker 渲染高清晰度 Canvas 供核验。
  - 支持多页切换、放大缩小（50% ~ 250%）、暗色效果与原版一键切换对比。
- 📄 **内置学术论文示例**：
  - 点击“一键载入学术论文示例”，即便本地无 PDF 也可立即体验双栏公式与几何矢量图的反转效果。
- 📦 **开箱即用打包**：
  - `vite.config.ts` 设置 `base: './'`，构建出的 `dist` 在任何相对子目录、GitHub Pages 或本地双击均可直接运行。

---

## 🛠️ 本地开发与构建

### 1. 安装依赖

```bash
npm install
```

### 2. 启动本地开发服务

```bash
npm run dev
```

### 3. 构建发布文件

```bash
npm run build
```
构建产物将输出在 `dist/` 目录下。

### 4. 本地预览产物

```bash
npm run preview
```

---

## 🌐 部署到 GitHub Pages

项目已内置 GitHub Actions 自动部署工作流 (`.github/workflows/deploy.yml`)：

1. 将代码推送到 GitHub 仓库 `https://github.com/Defei-Wang/pdf-dark-mode` 的 `main` 分支：
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of lossless vector pdf dark mode web app"
   git branch -M main
   git remote add origin https://github.com/Defei-Wang/pdf-dark-mode.git
   git push -u origin main
   ```
2. 进入 GitHub 仓库设置：`Settings` -> `Pages`。
3. 在 **Build and deployment** 下将 **Source** 选择为 **GitHub Actions**。
4. 工作流将自动构建并将 `dist/` 发布到 `https://Defei-Wang.github.io/pdf-dark-mode/`。

---

## 📜 许可证

MIT License © 2026 [Defei-Wang](https://github.com/Defei-Wang)

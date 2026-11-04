import { PDFDocument, PDFName, PDFDict, PDFArray, PDFRef } from 'pdf-lib';
import { ConversionResult } from '../types';

export interface ConvertOptions {
  diffColor: [number, number, number];
  onProgress?: (current: number, total: number) => void;
}

/**
 * 矢量 PDF 无损暗色模式转换引擎
 * 基于 PDF 底层图形状态 ExtGState 的 Difference 差值混合模式实现真矢量反转，
 * 严禁栅格化图片，文字、矢量线条与公式字形保持原生矢量状态。
 */
export async function convertPdfToDarkMode(
  pdfBuffer: ArrayBuffer,
  options: ConvertOptions
): Promise<ConversionResult> {
  const startTime = performance.now();
  const { diffColor, onProgress } = options;

  // 1. 使用 pdf-lib 解析 PDF
  const pdfDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: false,
    parseSpeed: 1,
  });

  const context = pdfDoc.context;

  // 2. 构造 ExtGState 字典并注册到 PDF 上下文
  // << /Type /ExtGState /BM /Difference >>
  const extGStateDict = context.obj({
    Type: 'ExtGState',
    BM: 'Difference',
  });
  const extGStateRef = context.register(extGStateDict);
  const gsDarkName = PDFName.of('GS_Dark');

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  const [r, g, b] = diffColor;
  // 保持浮点数简洁格式，避免膨胀体积
  const rStr = r.toFixed(4).replace(/\.?0+$/, '');
  const gStr = g.toFixed(4).replace(/\.?0+$/, '');
  const bStr = b.toFixed(4).replace(/\.?0+$/, '');

  // 3. 遍历每一页进行矢量流注入
  for (let i = 0; i < totalPages; i++) {
    const page = pages[i];
    if (onProgress) {
      onProgress(i + 1, totalPages);
    }

    // 获取页面坐标边界 (CropBox 或 MediaBox)
    const mediaBox = page.getMediaBox();
    const cropBox = page.node.CropBox() ? page.getCropBox() : mediaBox;

    const minX = Math.min(mediaBox.x, cropBox.x);
    const minY = Math.min(mediaBox.y, cropBox.y);
    const maxX = Math.max(mediaBox.x + mediaBox.width, cropBox.x + cropBox.width);
    const maxY = Math.max(mediaBox.y + mediaBox.height, cropBox.y + cropBox.height);
    const width = maxX - minX;
    const height = maxY - minY;

    const xStr = minX.toFixed(2).replace(/\.?0+$/, '');
    const yStr = minY.toFixed(2).replace(/\.?0+$/, '');
    const wStr = width.toFixed(2).replace(/\.?0+$/, '');
    const hStr = height.toFixed(2).replace(/\.?0+$/, '');

    // 确保页面拥有独立的 Resources 字典
    let pageResEntry = page.node.get(PDFName.of('Resources'));
    let resources: PDFDict;

    if (pageResEntry instanceof PDFRef) {
      resources = context.lookup(pageResEntry) as PDFDict;
    } else if (pageResEntry instanceof PDFDict) {
      resources = pageResEntry;
    } else {
      // 页面自身无 Resources，检查是否继承自父节点
      const inherited = page.node.Resources();
      resources = context.obj({});
      if (inherited instanceof PDFDict) {
        for (const [key, val] of inherited.entries()) {
          resources.set(key, val);
        }
      }
      page.node.set(PDFName.of('Resources'), resources);
    }

    // 确保 Resources 字典中包含 ExtGState 字典
    let extGStateEntry = resources.get(PDFName.of('ExtGState'));
    let extGState: PDFDict;

    if (!extGStateEntry) {
      extGState = context.obj({});
      resources.set(PDFName.of('ExtGState'), extGState);
    } else if (extGStateEntry instanceof PDFRef) {
      extGState = context.lookup(extGStateEntry) as PDFDict;
    } else if (extGStateEntry instanceof PDFDict) {
      extGState = extGStateEntry;
    } else {
      extGState = context.obj({});
      resources.set(PDFName.of('ExtGState'), extGState);
    }

    // 注入差值 ExtGState 引用
    extGState.set(gsDarkName, extGStateRef);

    // 4. 生成底层垫白操作流 (防止原文档透明背景导致反转异常)
    // q 1 1 1 rg x y w h re f Q
    const bgOps = `q\n1 1 1 rg\n${xStr} ${yStr} ${wStr} ${hStr} re\nf\nQ\n`;
    const bgStream = context.flateStream(bgOps);
    const bgRef = context.register(bgStream);

    // 5. 生成顶层差值遮罩流 (利用差值混合模式反转颜色)
    // q /GS_Dark gs r g b rg x y w h re f Q
    const darkOps = `q\n/GS_Dark gs\n${rStr} ${gStr} ${bStr} rg\n${xStr} ${yStr} ${wStr} ${hStr} re\nf\nQ\n`;
    const darkStream = context.flateStream(darkOps);
    const darkRef = context.register(darkStream);

    // 6. 将两个流分别拼接到原文档 Contents 流的最前面和最后面
    const contentsEntry = page.node.get(PDFName.of('Contents'));

    if (!contentsEntry) {
      page.node.set(PDFName.of('Contents'), context.obj([bgRef, darkRef]));
    } else if (contentsEntry instanceof PDFRef) {
      page.node.set(PDFName.of('Contents'), context.obj([bgRef, contentsEntry, darkRef]));
    } else if (contentsEntry instanceof PDFArray) {
      // 深度拷贝以避免对被共享数组引用的意外副作用
      const newArray = context.obj([bgRef]);
      for (let j = 0; j < contentsEntry.size(); j++) {
        newArray.push(contentsEntry.get(j));
      }
      newArray.push(darkRef);
      page.node.set(PDFName.of('Contents'), newArray);
    } else {
      page.node.set(PDFName.of('Contents'), context.obj([bgRef, darkRef]));
    }
  }

  // 7. 导出二进制数据
  const darkPdfBytes = await pdfDoc.save();
  const durationMs = Math.round(performance.now() - startTime);

  return {
    darkPdfBytes,
    durationMs,
    pageCount: totalPages,
  };
}

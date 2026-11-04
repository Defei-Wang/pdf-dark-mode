import { PDFDocument, PDFName, PDFArray } from 'pdf-lib';
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

  // 1. 使用 pdf-lib 解析 PDF，启用 ignoreEncryption: true 兼容带权限保护的常规学术/办公文档
  const pdfDoc = await PDFDocument.load(pdfBuffer.slice(0), {
    ignoreEncryption: true,
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

    // 使用 pdf-lib 原生标准化方法安全注入 ExtGState
    page.node.setExtGState(gsDarkName, extGStateRef);

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
    page.node.normalize();
    const contents = page.node.Contents();
    if (contents instanceof PDFArray) {
      page.node.wrapContentStreams(bgRef, darkRef);
    } else {
      page.node.set(PDFName.of('Contents'), context.obj([bgRef, darkRef]));
    }
  }

  // 7. 导出二进制数据
  const darkPdfBytes = await pdfDoc.save({ useObjectStreams: false });
  const durationMs = Math.round(performance.now() - startTime);

  return {
    darkPdfBytes,
    durationMs,
    pageCount: totalPages,
  };
}

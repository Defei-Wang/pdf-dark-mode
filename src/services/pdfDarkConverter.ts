import { PDFDocument, PDFName, PDFArray } from '@cantoo/pdf-lib';
import { ConversionResult } from '../types';

export interface ConvertOptions {
  diffColor: [number, number, number];
  password?: string;
  onProgress?: (current: number, total: number) => void;
}

/**
 * 矢量 PDF 无损暗色模式转换引擎
 * 基于 PDF 底层图形状态 ExtGState 的 Difference 差值混合模式实现真矢量反转，
 * 严禁栅格化图片，文字、矢量线条与公式字形保持原生矢量状态。
 *
 * 使用现代 @cantoo/pdf-lib 引擎，原生支持标准加密/权限限制文档的自动解密。
 */
export async function convertPdfToDarkMode(
  pdfBytes: Uint8Array,
  options: ConvertOptions
): Promise<ConversionResult> {
  const startTime = performance.now();
  const { diffColor, password = '', onProgress } = options;

  // 1. 安全拷贝字节，防止外部 ArrayBuffer 被 pdf-lib 内部 transfer 后 detached 导致
  //    "Cannot perform ArrayBuffer.prototype.slice on a detached ArrayBuffer"
  const safeBytes = new Uint8Array(pdfBytes);

  // 2. 使用支持解密的引擎解析 PDF，自动解除常规权限限制与空密码保护
  const pdfDoc = await PDFDocument.load(safeBytes, {
    password,
    ignoreEncryption: true,
    throwOnInvalidObject: false,
    updateMetadata: false,
  });

  const context = pdfDoc.context;

  // 2. 构造 ExtGState 字典并注册到 PDF 上下文
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

    // 安全获取页面坐标边界 (CropBox 或 MediaBox)
    let minX = 0;
    let minY = 0;
    let width = 595.28;
    let height = 841.89;

    try {
      const mediaBox = page.getMediaBox();
      const cropBox = page.getCropBox();
      minX = Math.min(mediaBox.x, cropBox.x);
      minY = Math.min(mediaBox.y, cropBox.y);
      const maxX = Math.max(mediaBox.x + mediaBox.width, cropBox.x + cropBox.width);
      const maxY = Math.max(mediaBox.y + mediaBox.height, cropBox.y + cropBox.height);
      width = maxX - minX;
      height = maxY - minY;
    } catch {
      try {
        const size = page.getSize();
        width = size.width;
        height = size.height;
      } catch {
        // 使用标准 A4 兜底
      }
    }

    // 稍微向外扩展 15pt 确保完全覆盖文档边角，无白边漏出
    const pad = 15;
    const xStr = (minX - pad).toFixed(2);
    const yStr = (minY - pad).toFixed(2);
    const wStr = (width + pad * 2).toFixed(2);
    const hStr = (height + pad * 2).toFixed(2);

    // 注册 ExtGState 到页面
    page.node.setExtGState(gsDarkName, extGStateRef);

    // 4. 生成底层垫白流 (防止原文档透明背景导致反转异常)
    // 包含 q 1 1 1 rg ... re f Q，并在尾部打开 q 隔离后续原文档的变换矩阵
    const bgOps = `q\n1 1 1 rg\n${xStr} ${yStr} ${wStr} ${hStr} re\nf\nQ\nq\n`;
    const bgStream = context.flateStream(bgOps);
    const bgRef = context.register(bgStream);

    // 5. 生成顶层差值遮罩流 (利用差值混合模式反转颜色)
    // 首部闭合 Q 还原隔离的原文档状态，随后应用 /GS_Dark 进行无损差值混色
    const darkOps = `\nQ\nq\n/GS_Dark gs\n${rStr} ${gStr} ${bStr} rg\n${xStr} ${yStr} ${wStr} ${hStr} re\nf\nQ\n`;
    const darkStream = context.flateStream(darkOps);
    const darkRef = context.register(darkStream);

    // 6. 安全注入到页面 Contents
    page.node.normalize();
    const contents = page.node.Contents();

    if (contents instanceof PDFArray) {
      page.node.wrapContentStreams(bgRef, darkRef);
    } else if (contents) {
      page.node.set(PDFName.of('Contents'), context.obj([bgRef, contents, darkRef]));
    } else {
      page.node.set(PDFName.of('Contents'), context.obj([bgRef, darkRef]));
    }
  }

  // 7. 导出二进制数据
  const rawBytes = await pdfDoc.save({ useObjectStreams: false });
  const darkPdfBytes = new Uint8Array(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);
  const durationMs = Math.round(performance.now() - startTime);

  return {
    darkPdfBytes,
    durationMs,
    pageCount: totalPages,
  };
}

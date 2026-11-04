import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Vite 兼容方式配置 PDF.js Worker，无需外部 CDN，构建时自动打包本地文件
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export type PdfJsDocument = pdfjsLib.PDFDocumentProxy;

/**
 * 加载 PDF 文档
 */
export async function loadPdfJsDocument(data: Uint8Array | ArrayBuffer): Promise<PdfJsDocument> {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    cMapUrl: undefined,
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

export interface RenderPageOptions {
  scale?: number;
  canvas: HTMLCanvasElement;
  pageNumber: number;
}

export interface RenderHandle {
  promise: Promise<void>;
  cancel: () => void;
}

/**
 * 将 PDF 指定页面渲染到 HTML5 Canvas（支持 High-DPI Retina 清晰度）
 */
export function renderPdfPage(
  pdfDoc: PdfJsDocument,
  options: RenderPageOptions
): RenderHandle {
  const { scale = 1.0, canvas, pageNumber } = options;
  let isCancelled = false;
  let renderTask: pdfjsLib.RenderTask | null = null;

  const promise = (async () => {
    const page = await pdfDoc.getPage(pageNumber);
    if (isCancelled) return;

    const dpr = window.devicePixelRatio || 1;
    // 获取当前比例下的原始视口
    const unscaledViewport = page.getViewport({ scale });
    // 为 Canvas 绘图提供的高分辨率视口
    const hiDpiViewport = page.getViewport({ scale: scale * dpr });

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');

    canvas.width = Math.floor(hiDpiViewport.width);
    canvas.height = Math.floor(hiDpiViewport.height);
    canvas.style.width = `${Math.floor(unscaledViewport.width)}px`;
    canvas.style.height = `${Math.floor(unscaledViewport.height)}px`;

    const renderContext = {
      canvasContext: ctx,
      viewport: hiDpiViewport,
    };

    renderTask = page.render(renderContext);
    try {
      await renderTask.promise;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException') {
        // 渲染被取消，正常退出
        return;
      }
      throw err;
    }
  })();

  return {
    promise,
    cancel: () => {
      isCancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // ignore
        }
      }
    },
  };
}

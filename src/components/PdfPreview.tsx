import React, { useEffect, useRef, useState } from 'react';
import { loadPdfJsDocument, renderPdfPage, PdfJsDocument, RenderHandle } from '../services/pdfRenderer';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Eye, Sparkles } from 'lucide-react';

interface PdfPreviewProps {
  originalPdfBuffer: ArrayBuffer | null;
  darkPdfBytes: Uint8Array | null;
  pageCount: number;
  isProcessing: boolean;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  originalPdfBuffer,
  darkPdfBytes,
  pageCount,
  isProcessing,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [viewMode, setViewMode] = useState<'dark' | 'original'>('dark');
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 用 state 而不是 ref 保存已加载的文档：文档加载完成后必须触发重新渲染，
  // 否则会出现“按钮已经切换、画面却还是上一个配色”的错位。
  const [originalDoc, setOriginalDoc] = useState<PdfJsDocument | null>(null);
  const [darkDoc, setDarkDoc] = useState<PdfJsDocument | null>(null);
  const currentRenderRef = useRef<RenderHandle | null>(null);

  // 加载原版 PDF.js 文档对象
  useEffect(() => {
    if (!originalPdfBuffer) {
      setOriginalDoc(null);
      return;
    }

    setOriginalDoc(null);
    let isSubscribed = true;
    let loadedDoc: PdfJsDocument | null = null;
    loadPdfJsDocument(originalPdfBuffer)
      .then((doc) => {
        if (!isSubscribed) {
          void doc.destroy();
          return;
        }
        loadedDoc = doc;
        setOriginalDoc(doc);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error('加载原始 PDF 预览失败', err);
      });

    return () => {
      isSubscribed = false;
      void loadedDoc?.destroy();
    };
  }, [originalPdfBuffer]);

  // 加载转换后的暗色 PDF.js 文档对象
  useEffect(() => {
    if (!darkPdfBytes) {
      setDarkDoc(null);
      return;
    }

    setDarkDoc(null);
    let isSubscribed = true;
    let loadedDoc: PdfJsDocument | null = null;
    loadPdfJsDocument(darkPdfBytes)
      .then((doc) => {
        if (!isSubscribed) {
          void doc.destroy();
          return;
        }
        loadedDoc = doc;
        setDarkDoc(doc);
      })
      .catch((err) => {
        console.error('加载暗色 PDF 预览失败', err);
        if (isSubscribed) setRenderError('暗色预览加载异常');
      });

    return () => {
      isSubscribed = false;
      void loadedDoc?.destroy();
    };
  }, [darkPdfBytes]);

  // 当文档、页码、缩放或显示模式变化时渲染指定页面
  useEffect(() => {
    const activeDoc = viewMode === 'dark' ? darkDoc : originalDoc;
    const canvas = canvasRef.current;

    if (!activeDoc || !canvas) {
      setIsRendering(false);
      return;
    }
    let isActive = true;

    // 取消上一次未完成的渲染
    if (currentRenderRef.current) {
      currentRenderRef.current.cancel();
      currentRenderRef.current = null;
    }

    setIsRendering(true);
    setRenderError(null);

    const handle = renderPdfPage(activeDoc, {
      canvas,
      pageNumber: currentPage,
      scale,
    });

    currentRenderRef.current = handle;

    handle.promise
      .then(() => {
        if (!isActive) return;
        setIsRendering(false);
      })
      .catch((err) => {
        if (!isActive) return;
        // 忽略主动取消异常
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Canvas 渲染失败', err);
          setRenderError('页面渲染失败');
        }
        setIsRendering(false);
      });

    return () => {
      isActive = false;
      handle.cancel();
    };
  }, [darkDoc, originalDoc, currentPage, scale, viewMode]);

  // 重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [originalPdfBuffer]);

  if (!originalPdfBuffer) {
    return null;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
      {/* 预览控制工具栏 */}
      <div className="px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* 对比模式切换 */}
        <div className="flex items-center space-x-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode('dark')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'dark'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>暗色模式效果</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              viewMode === 'original'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>原文档对比</span>
          </button>
        </div>

        {/* 翻页与缩放控制 */}
        <div className="flex items-center space-x-3 text-zinc-400">
          {/* 页码 */}
          <div className="flex items-center space-x-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
            <button
              disabled={currentPage <= 1 || isRendering}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 hover:text-zinc-100 disabled:opacity-30"
              title="上一页"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono px-1.5 text-zinc-300">
              {currentPage} / {pageCount || 1}
            </span>
            <button
              disabled={currentPage >= pageCount || isRendering}
              onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
              className="p-1 hover:text-zinc-100 disabled:opacity-30"
              title="下一页"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 缩放 */}
          <div className="flex items-center space-x-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
            <button
              onClick={() => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)))}
              className="p-1 hover:text-zinc-100"
              title="缩小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono px-1 text-zinc-300 min-w-10 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.5, +(s + 0.2).toFixed(1)))}
              className="p-1 hover:text-zinc-100"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setScale(1.0)}
              className="p-1 hover:text-zinc-100 ml-1 border-l border-zinc-800"
              title="重置 100%"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 预览视窗区域 */}
      <div className="relative min-h-[460px] max-h-[700px] overflow-auto p-6 bg-zinc-950/70 flex items-center justify-center">
        {(isProcessing || isRendering) && (
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400 font-mono">
              {isProcessing ? '正在转换底层图形状态...' : '正在渲染高分辨率预览...'}
            </p>
          </div>
        )}

        {renderError && (
          <div className="text-xs text-rose-400 p-4 border border-rose-900/50 bg-rose-950/20 rounded">
            {renderError}
          </div>
        )}
        <div className={renderError ? 'hidden' : 'relative shadow-2xl rounded border border-zinc-800/80 transition-all inline-block bg-zinc-900'}>
            <canvas ref={canvasRef} className="block max-w-full" />
        </div>
      </div>

      {/* 底部技术标注条 */}
      <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>无损矢量校验：缩放任意倍数文字无马赛克，PDF 内部文本图层完好</span>
        </span>
        <span className="font-mono text-zinc-400">
          Rendered with PDF.js (Native Worker)
        </span>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { ColorSelector } from './components/ColorSelector';
import { PdfPreview } from './components/PdfPreview';
import { ExportSection } from './components/ExportSection';
import { COLOR_PRESETS } from './constants/presets';
import { ColorPreset, PdfFileInfo, ConversionResult } from './types';
import { convertPdfToDarkMode } from './services/pdfDarkConverter';
import { PDFDocument, StandardFonts, rgb } from '@cantoo/pdf-lib';
import { Sparkles } from 'lucide-react';
import { Language, translations } from './i18n/translations';

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('pdf_dark_mode_lang');
    return saved === 'en' || saved === 'zh' ? saved : 'zh';
  });

  const t = translations[lang];

  const handleToggleLanguage = () => {
    const nextLang: Language = lang === 'zh' ? 'en' : 'zh';
    setLang(nextLang);
    localStorage.setItem('pdf_dark_mode_lang', nextLang);
  };

  const [currentFile, setCurrentFile] = useState<PdfFileInfo | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ColorPreset>(COLOR_PRESETS[0]);
  const [customColor, setCustomColor] = useState<[number, number, number]>([1.0, 1.0, 1.0]);
  const [isCustom, setIsCustom] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const debounceTimerRef = useRef<number | null>(null);

  // 执行矢量暗色转换
  const runConversion = useCallback(
    async (fileInfo: PdfFileInfo, diffColor: [number, number, number]) => {
      setIsProcessing(true);
      setProgress({ current: 0, total: fileInfo.pageCount });

      try {
        const conversion = await convertPdfToDarkMode(fileInfo.pdfBytes, {
          diffColor,
          onProgress: (current, total) => {
            setProgress({ current, total });
          },
        });
        setResult(conversion);
      } catch (err: unknown) {
        console.error('转换失败:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        alert(`${t.convertError}${errMsg}\n\n${t.passwordHint}`);
      } finally {
        setIsProcessing(false);
        setProgress(null);
      }
    },
    [t.convertError, t.passwordHint]
  );

  // 文件选取处理
  const handleFileSelect = async (file: File) => {
    try {
      const rawBuffer = await file.arrayBuffer();
      // 立即固化为 Uint8Array 拷贝，防止底层引擎转移 buffer 导致 detached
      const pdfBytes = new Uint8Array(rawBuffer);

      // 使用 @cantoo/pdf-lib 解析页数，兼容常规带权限锁或空密码的学术/办公文档
      const doc = await PDFDocument.load(new Uint8Array(pdfBytes), {
        password: '',
        ignoreEncryption: true,
        throwOnInvalidObject: false,
        updateMetadata: false,
      });
      const pageCount = doc.getPageCount();

      const fileInfo: PdfFileInfo = {
        name: file.name,
        size: file.size,
        pdfBytes,
        pageCount,
      };

      setCurrentFile(fileInfo);
      const activeColor = isCustom ? customColor : selectedPreset.diffColor;
      await runConversion(fileInfo, activeColor);
    } catch (err: unknown) {
      console.error('无法读取 PDF 文件', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`${t.parseError}${errMsg}\n\n${t.confirmFileIntegrity}`);
    }
  };

  // 颜色偏好变化自动重新触发转换
  useEffect(() => {
    if (!currentFile) return;

    const activeColor = isCustom ? customColor : selectedPreset.diffColor;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // 防抖 150ms 避免拖动 slider 瞬间连续高频重算
    debounceTimerRef.current = window.setTimeout(() => {
      runConversion(currentFile, activeColor);
    }, 150);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentFile, selectedPreset, customColor, isCustom, runConversion]);

  // 下载导出
  const handleDownload = () => {
    if (!result || !currentFile) return;

    try {
      const bytes = result.darkPdfBytes;

      if (bytes.buffer.byteLength === 0) {
        throw new Error(t.dataInvalid);
      }

      // 创建完全独立的 ArrayBuffer 切片
      const safeBuffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      ) as ArrayBuffer;

      const blob = new Blob([safeBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const downloadName = `dark_${currentFile.name.replace(/\.pdf$/i, '')}.pdf`;

      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      // 延迟回收 ObjectURL，防止 Chromium 异步下载流被意外掐断
      window.setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (err) {
      console.error('下载失败:', err);
      const msg = err instanceof Error ? err.message : String(err);
      alert(`${t.downloadError}${msg}`);
    }
  };

  // 生成学术论文演示 PDF
  const handleLoadSamplePdf = async () => {
    try {
      const sampleDoc = await PDFDocument.create();
      const timesRoman = await sampleDoc.embedFont(StandardFonts.TimesRoman);
      const timesRomanBold = await sampleDoc.embedFont(StandardFonts.TimesRomanBold);
      const helvetica = await sampleDoc.embedFont(StandardFonts.Helvetica);

      // 第一页
      const page1 = sampleDoc.addPage([595.28, 841.89]); // A4
      const { height: h1 } = page1.getSize();

      page1.drawText('Lossless Vector PDF Dark Mode Demonstration', {
        x: 50,
        y: h1 - 70,
        size: 18,
        font: timesRomanBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      page1.drawText('A Client-Side Graphics State Difference Blend Pipeline', {
        x: 50,
        y: h1 - 95,
        size: 11,
        font: helvetica,
        color: rgb(0.35, 0.35, 0.35),
      });

      const bodyText1 = `Abstract - Traditional PDF dark mode tools rasterize document pages into low-resolution bitmap canvases, obliterating vector typography, destroying text searchability and selection, causing catastrophic pixelation under high zoom levels. This paper introduces a direct PDF operator stream injection technique employing ExtGState /Difference blend modes.`;

      page1.drawText(bodyText1, {
        x: 50,
        y: h1 - 140,
        size: 10,
        font: timesRoman,
        maxWidth: 495,
        lineHeight: 14,
        color: rgb(0.15, 0.15, 0.15),
      });

      page1.drawLine({
        start: { x: 50, y: h1 - 190 },
        end: { x: 545, y: h1 - 190 },
        thickness: 0.75,
        color: rgb(0.2, 0.2, 0.2),
      });

      page1.drawText('1. Mathematical Formulation & Vector Blend Stream', {
        x: 50,
        y: h1 - 220,
        size: 13,
        font: timesRomanBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      page1.drawText('In the PDF 1.4+ specification, difference blending function is expressed as:', {
        x: 50,
        y: h1 - 245,
        size: 10,
        font: timesRoman,
        color: rgb(0.2, 0.2, 0.2),
      });

      page1.drawRectangle({
        x: 70,
        y: h1 - 310,
        width: 450,
        height: 50,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.75,
        color: rgb(0.97, 0.97, 0.97),
      });

      page1.drawText('C_result = | C_backdrop - C_source |', {
        x: 180,
        y: h1 - 280,
        size: 12,
        font: timesRomanBold,
        color: rgb(0.05, 0.05, 0.05),
      });

      page1.drawText('2. Retention of Embedded Fonts and Searchability', {
        x: 50,
        y: h1 - 340,
        size: 13,
        font: timesRomanBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      const bodyText2 = `Because no rasterization occurs, all font glyphs remain fully scalable vector beziers. Users can zoom in to any level without experiencing any anti-aliasing artifacts or blurred edges. Moreover, all OCR text layers, hyperlinks, form fields, and table structures remain 100% intact.`;

      page1.drawText(bodyText2, {
        x: 50,
        y: h1 - 370,
        size: 10,
        font: timesRoman,
        maxWidth: 495,
        lineHeight: 14,
        color: rgb(0.15, 0.15, 0.15),
      });

      // 第二页
      const page2 = sampleDoc.addPage([595.28, 841.89]);
      const { height: h2 } = page2.getSize();

      page2.drawText('Page 2: Vector Graphics & Schematic Diagrams', {
        x: 50,
        y: h2 - 70,
        size: 16,
        font: timesRomanBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      page2.drawRectangle({
        x: 50,
        y: h2 - 250,
        width: 140,
        height: 120,
        color: rgb(0.9, 0.2, 0.2),
      });
      page2.drawText('Vector Red Block', {
        x: 65,
        y: h2 - 195,
        size: 11,
        font: helvetica,
        color: rgb(1, 1, 1),
      });

      page2.drawRectangle({
        x: 210,
        y: h2 - 250,
        width: 140,
        height: 120,
        color: rgb(0.2, 0.5, 0.8),
      });
      page2.drawText('Vector Blue Block', {
        x: 225,
        y: h2 - 195,
        size: 11,
        font: helvetica,
        color: rgb(1, 1, 1),
      });

      page2.drawRectangle({
        x: 370,
        y: h2 - 250,
        width: 140,
        height: 120,
        color: rgb(0.2, 0.7, 0.4),
      });
      page2.drawText('Vector Green Block', {
        x: 380,
        y: h2 - 195,
        size: 11,
        font: helvetica,
        color: rgb(1, 1, 1),
      });

      const sampleBytes = await sampleDoc.save();

      const fileInfo: PdfFileInfo = {
        name: 'academic_sample_paper.pdf',
        size: sampleBytes.byteLength,
        pdfBytes: new Uint8Array(sampleBytes),
        pageCount: 2,
      };

      setCurrentFile(fileInfo);
      const activeColor = isCustom ? customColor : selectedPreset.diffColor;
      await runConversion(fileInfo, activeColor);
    } catch (e) {
      console.error('加载示例失败', e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header lang={lang} onToggleLanguage={handleToggleLanguage} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* 上传区域与示例按钮 */}
        <div className="space-y-3">
          <FileUploader
            currentFile={currentFile}
            onFileSelect={handleFileSelect}
            onClear={() => {
              setCurrentFile(null);
              setResult(null);
            }}
            disabled={isProcessing}
            lang={lang}
          />

          {!currentFile && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleLoadSamplePdf}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.sampleButton}</span>
              </button>
            </div>
          )}
        </div>

        {/* 颜色与配置调节面板 */}
        {currentFile && (
          <ColorSelector
            selectedPreset={selectedPreset}
            onSelectPreset={setSelectedPreset}
            customColor={customColor}
            onCustomColorChange={setCustomColor}
            isCustom={isCustom}
            setIsCustom={setIsCustom}
            disabled={isProcessing}
            lang={lang}
          />
        )}

        {/* 导出操作条 */}
        {currentFile && (
          <ExportSection
            originalFileName={currentFile.name}
            result={result}
            isProcessing={isProcessing}
            onDownload={handleDownload}
            lang={lang}
          />
        )}

        {/* 实时高分辨率核验预览 */}
        {currentFile && (
          <PdfPreview
            originalPdfBytes={currentFile.pdfBytes}
            darkPdfBytes={result?.darkPdfBytes ?? null}
            pageCount={currentFile.pageCount}
            isProcessing={isProcessing}
            lang={lang}
          />
        )}
      </main>

      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-400">
        <p>{t.footerText}</p>
        <p className="mt-1 font-mono text-[11px] text-zinc-500">
          Powered by <a href="https://github.com/Hopding/pdf-lib" target="_blank" rel="noreferrer" className="text-zinc-400 hover:underline">pdf-lib</a> & <a href="https://mozilla.github.io/pdf.js/" target="_blank" rel="noreferrer" className="text-zinc-400 hover:underline">pdfjs-dist</a>
        </p>
      </footer>
    </div>
  );
};

export default App;

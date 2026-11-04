import React from 'react';
import { Download, CheckCircle, Clock } from 'lucide-react';
import { ConversionResult } from '../types';

interface ExportSectionProps {
  originalFileName: string;
  result: ConversionResult | null;
  isProcessing: boolean;
  onDownload: () => void;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  originalFileName,
  result,
  isProcessing,
  onDownload,
}) => {
  if (!result) return null;

  const exportFileName = `dark_${originalFileName.replace(/\.pdf$/i, '')}.pdf`;

  const formatSize = (bytes: number): string => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-zinc-100">暗色模式转换完成</h3>
        </div>
        <p className="text-xs text-zinc-400 font-mono flex items-center gap-3">
          <span>文件大小: {formatSize(result.darkPdfBytes.byteLength)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            处理耗时: {result.durationMs}ms
          </span>
          <span>·</span>
          <span>共 {result.pageCount} 页</span>
        </p>
      </div>

      <button
        type="button"
        onClick={onDownload}
        disabled={isProcessing}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-semibold text-xs tracking-wide shadow-lg shadow-sky-500/10 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        <span>下载处理后的 PDF</span>
      </button>
    </div>
  );
};

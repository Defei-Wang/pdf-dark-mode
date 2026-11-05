import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X, CheckCircle2 } from 'lucide-react';
import { PdfFileInfo } from '../types';
import { Language, translations } from '../i18n/translations';

interface FileUploaderProps {
  currentFile: PdfFileInfo | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
  lang: Language;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  currentFile,
  onFileSelect,
  onClear,
  disabled = false,
  lang,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        onFileSelect(file);
      } else {
        alert(t.invalidFileType);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
      e.target.value = '';
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (currentFile) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between transition-all">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="p-2.5 rounded-lg bg-zinc-800 text-sky-400 border border-zinc-700/60 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-zinc-200 truncate">{currentFile.name}</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              {formatSize(currentFile.size)} · {t.totalPages.replace('{count}', String(currentFile.pageCount))}
            </p>
          </div>
        </div>

        <button
          onClick={onClear}
          disabled={disabled}
          title={t.removeFile}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors flex-shrink-0 disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragging
          ? 'border-sky-500 bg-sky-500/10'
          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
      <div className="max-w-md mx-auto flex flex-col items-center">
        <div className="p-3 rounded-full bg-zinc-800/80 text-sky-400 border border-zinc-700 mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-medium text-zinc-200">
          {t.uploadTitle}
        </p>
        <p className="text-xs text-zinc-400 mt-1">
          {t.uploadDesc}
        </p>
      </div>
    </div>
  );
};

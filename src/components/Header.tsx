import React from 'react';
import { Layers, Github, ShieldCheck, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/80 text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-100 tracking-tight">PDF Dark Mode</h1>
              <span className="text-xs px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono">
                真矢量无损
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              基于 PDF 底层 ExtGState 差值混合状态 · 拒绝图片栅格化
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-4 text-xs text-zinc-400 mr-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
              本地离线处理
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-zinc-300" />
              文字公式可复制
            </span>
          </div>

          <a
            href="https://github.com/Defei-Wang/pdf-dark-mode"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};

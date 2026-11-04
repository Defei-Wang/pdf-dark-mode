import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Cpu, CheckCircle } from 'lucide-react';

export const TechnicalNote: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <Terminal className="w-4 h-4 text-sky-400" />
          <span className="font-medium text-zinc-200">底层技术原理：真矢量 Difference 混合 vs 传统栅格化截屏</span>
        </div>
        <div className="flex items-center space-x-2 text-zinc-400">
          <span>{isOpen ? '收起详情' : '展开原理'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 pt-0 border-t border-zinc-800/60 space-y-4 text-zinc-400">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="bg-zinc-950/70 p-3.5 rounded-lg border border-red-950/40 space-y-1.5">
              <div className="text-rose-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>市面常规方案（栅格化图片）的缺陷</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                利用 Canvas 将每页光栅化为低分辨率位图（JPEG/PNG）后再拼成新 PDF。
                后果：文本无法划词复制、LaTeX 数学公式出现锯齿、放大阅览马赛克模糊、导出体积膨胀 5~10 倍。
              </p>
            </div>

            <div className="bg-zinc-950/70 p-3.5 rounded-lg border border-emerald-950/40 space-y-1.5">
              <div className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>本项目方案（底层图形状态流注入）的优势</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                修改 PDF 页面字典流，利用 PDF 1.4+ 规范原生支持的 <code>/ExtGState</code> 与 <code>/BM /Difference</code> 差值混合状态。
                原文字形、矢量线条、书签目录、超链接完全保留，无任何重采样，处理速度毫秒级。
              </p>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-lg font-mono text-[11px] text-zinc-300 border border-zinc-800 space-y-2 overflow-x-auto">
            <div className="text-zinc-400">// PDF 注入操作流伪代码</div>
            <div>
              <span className="text-sky-400">1. Resources/ExtGState:</span> &lt;&lt; /GS_Dark &lt;&lt; /Type /ExtGState /BM /Difference &gt;&gt; &gt;&gt;
            </div>
            <div>
              <span className="text-sky-400">2. Prepend Contents:</span> q 1 1 1 rg 0 0 width height re f Q <span className="text-zinc-400">// 垫白</span>
            </div>
            <div>
              <span className="text-sky-400">3. Original Contents:</span> ... (原文档文本与矢量几何流完全不破坏) ...
            </div>
            <div>
              <span className="text-sky-400">4. Append Contents:</span> q /GS_Dark gs r g b rg 0 0 width height re f Q <span className="text-zinc-400">// 差值反相</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

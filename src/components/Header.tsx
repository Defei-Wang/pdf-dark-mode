import React from 'react';
import { Layers, Github, ShieldCheck, Zap, Languages } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onToggleLanguage }) => {
  const t = translations[lang];

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/80 text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-100 tracking-tight">{t.title}</h1>
              <span className="text-xs px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono">
                {t.badge}
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="hidden md:flex items-center space-x-4 text-xs text-zinc-400 mr-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
              {t.offlineBadge}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-zinc-300" />
              {t.selectableBadge}
            </span>
          </div>

          {/* 语言切换按钮 */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
            title={lang === 'zh' ? 'Switch to English' : '切换为中文'}
          >
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono">{lang === 'zh' ? 'English' : '中文'}</span>
          </button>

          <a
            href="https://github.com/Defei-Wang/pdf-dark-mode"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  MoreVertical,
  RefreshCw,
  Share2,
  Copy,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  Settings as SettingsIcon,
  CheckCheck,
  Clock,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    settings,
    updateSettings,
    stats,
    setIsDrawerOpen,
    setIsSettingsOpen,
    addToast,
    refreshStats,
    isInstallable,
    isInstalled,
    installApp,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = async () => {
    setMenuOpen(false);
    await refreshStats();
    addToast('info', 'Data refreshed successfully');
  };

  const handleShare = async () => {
    setMenuOpen(false);
    const shareData = {
      title: 'EstechScoutier',
      text: 'EstechScoutier: Mobile-first bulk email outreach helper with one-tap client composing.',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('success', 'App link copied to clipboard!');
  };

  const handleCopyLink = () => {
    setMenuOpen(false);
    copyToClipboard();
  };

  const currentThemeIcon = () => {
    if (settings.theme === 'light') return <Sun className="w-4 h-4 text-amber-300" />;
    if (settings.theme === 'dark') return <Moon className="w-4 h-4 text-indigo-200" />;
    return <Monitor className="w-4 h-4 text-emerald-200" />;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#2F6B2F] text-white shadow-md select-none border-b border-emerald-800">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Hamburger & Brand Title */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 -ml-1 rounded-lg hover:bg-white/15 active:scale-95 transition-all text-white focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
              <span className="text-base leading-none">ES</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-lg text-white leading-tight">
                EstechScoutier
              </span>
              <span className="text-[10px] text-emerald-100/80 -mt-0.5 hidden xs:inline">
                Bulk Outreach Helper
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Live Summary Chips */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30">
            <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
            Pro
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white border border-white/20">
            <CheckCheck className="w-3 h-3 text-emerald-300" />
            {stats.sent} sent
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-black/20 text-emerald-100 border border-white/10">
            <Clock className="w-3 h-3 text-white/70" />
            {stats.remaining} pending
          </span>
        </div>

        {/* Right Actions: Theme Selector & 3-dot Menu */}
        <div className="flex items-center gap-1">
          {/* Mobile compact counters badge */}
          <div className="flex sm:hidden items-center gap-1 text-[11px] font-semibold bg-black/25 px-2 py-0.5 rounded-full text-white/90">
            <span className="text-emerald-300">{stats.sent}</span>
            <span className="text-white/40">/</span>
            <span className="text-amber-200">{stats.remaining}</span>
          </div>

          {/* Quick Install Button if installable */}
          {isInstallable && (
            <button
              onClick={installApp}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-sm transition-transform active:scale-95 animate-pulse"
              title="Install EScoutier App"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Theme switcher button */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-white/15 active:scale-95 transition-all text-white flex items-center gap-1"
              title={`Current theme: ${settings.theme}`}
              aria-label="Toggle Theme"
            >
              {currentThemeIcon()}
            </button>

            {themeMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-2xl py-1 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-sm z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    updateSettings({ theme: 'system' });
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-800 ${
                    settings.theme === 'system' ? 'font-bold text-emerald-700 dark:text-emerald-400' : ''
                  }`}
                >
                  <Monitor className="w-4 h-4" /> System
                </button>
                <button
                  onClick={() => {
                    updateSettings({ theme: 'light' });
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-800 ${
                    settings.theme === 'light' ? 'font-bold text-emerald-700 dark:text-emerald-400' : ''
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" /> Light
                </button>
                <button
                  onClick={() => {
                    updateSettings({ theme: 'dark' });
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 flex items-center gap-2 hover:bg-emerald-50 dark:hover:bg-slate-800 ${
                    settings.theme === 'dark' ? 'font-bold text-emerald-700 dark:text-emerald-400' : ''
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" /> Dark
                </button>
              </div>
            )}
          </div>

          {/* 3-dot (Vertical Ellipsis) Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg hover:bg-white/15 active:scale-95 transition-all text-white focus:outline-none"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl py-1 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-sm z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={handleRefresh}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Refresh App</span>
                </button>

                <button
                  onClick={handleShare}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Share App</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Copy Link</span>
                </button>

                {!isInstalled && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      installApp();
                    }}
                    className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors text-emerald-700 dark:text-emerald-400 font-semibold"
                  >
                    <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Install App</span>
                  </button>
                )}

                <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-emerald-700 dark:text-emerald-400 font-medium"
                >
                  <SettingsIcon className="w-4 h-4" />
                  <span>Preferences</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


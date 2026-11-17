import React from 'react';
import {
  X,
  Home,
  Info,
  BookOpen,
  ShoppingBag,
  Video,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Heart,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

export const SideDrawer: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isDrawerOpen,
    setIsDrawerOpen,
    settings,
    updateSettings,
    setIsSettingsOpen,
    setShowResponsibleUseModal,
  } = useApp();

  if (!isDrawerOpen) return null;

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" />, desc: 'Outreach Tool & Mail Generator' },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5" />, desc: 'How to use step-by-step & FAQs' },
    { id: 'blog', label: 'Blog', icon: <BookOpen className="w-5 h-5" />, desc: 'Deliverability & Outreach tips' },
    { id: 'shop', label: 'Shop', icon: <ShoppingBag className="w-5 h-5" />, desc: 'Plans, template packs & audits' },
    { id: 'videos', label: 'Videos', icon: <Video className="w-5 h-5" />, desc: 'Video tutorials & guides' },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer content */}
      <div className="relative w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250 border-r border-slate-200 dark:border-slate-800">
        <div>
          {/* Top header */}
          <div className="p-4 bg-[#2F6B2F] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-white text-lg">
                ES
              </div>
              <div>
                <h2 className="font-extrabold text-base leading-tight">EstechScoutier</h2>
                <p className="text-[11px] text-emerald-100">Outreach Accelerator</p>
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-white/15 transition-colors"
              aria-label="Close Drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#2F6B2F] dark:text-emerald-400 font-bold shadow-sm border border-emerald-200/60 dark:border-emerald-800/60'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-medium'
                  }`}
                >
                  <div className={`${isActive ? 'text-[#2F6B2F] dark:text-emerald-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm leading-snug">{item.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="px-4 py-2">
            <div className="border-t border-slate-200 dark:border-slate-800" />
          </div>

          {/* Settings & Policies */}
          <div className="px-3 space-y-1">
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setIsSettingsOpen(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-slate-400" />
              <span>App Settings & Data</span>
            </button>

            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setShowResponsibleUseModal(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Responsible Use Policy</span>
            </button>
          </div>
        </div>

        {/* Bottom Drawer Section: Theme Toggle & Developer Credit */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          {/* Theme Switcher Segmented Control */}
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Theme Mode
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  settings.theme === 'light'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light
              </button>
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark
              </button>
              <button
                onClick={() => updateSettings({ theme: 'system' })}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  settings.theme === 'system'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> System
              </button>
            </div>
          </div>

          {/* Developer credit */}
          <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
            <span>Developed with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>by Estech Team</span>
          </div>
          <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Client-Side Outreach Tool v1.0
          </div>
        </div>
      </div>
    </div>
  );
};


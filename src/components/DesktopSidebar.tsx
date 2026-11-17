import React from 'react';
import {
  Home,
  Info,
  BookOpen,
  ShoppingBag,
  Video,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

export const DesktopSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsSettingsOpen,
    setShowResponsibleUseModal,
    stats,
  } = useApp();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'home', label: 'Outreach Tool', icon: <Home className="w-5 h-5" />, badge: stats.totalGenerated > 0 ? `${stats.remaining}` : undefined },
    { id: 'about', label: 'About & Guide', icon: <Info className="w-5 h-5" /> },
    { id: 'blog', label: 'Outreach Blog', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'shop', label: 'Shop & Plans', icon: <ShoppingBag className="w-5 h-5" />, badge: 'Pro' },
    { id: 'videos', label: 'Video Guides', icon: <Video className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-emerald-900/90 dark:bg-slate-900 text-white shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-emerald-800/80 dark:border-slate-800 select-none overflow-y-auto">
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Quick status banner */}
          <div className="mb-6 p-3 rounded-xl bg-black/20 border border-white/10">
            <div className="flex items-center justify-between text-xs text-emerald-200 mb-1">
              <span>Outreach Campaign</span>
              <span className="font-bold text-white">{stats.completionRate}%</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-emerald-100/70 mt-2 font-medium">
              <span>{stats.sent} sent</span>
              <span>{stats.remaining} pending</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="text-xs uppercase tracking-wider text-emerald-300/70 dark:text-slate-400 font-bold px-2 mb-2">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-emerald-700 dark:bg-emerald-800 text-white shadow-sm font-semibold'
                      : 'text-emerald-100/90 dark:text-slate-300 hover:bg-emerald-800/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-emerald-200 dark:text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.badge === 'Pro'
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-black/30 text-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="my-5 border-t border-emerald-800/60 dark:border-slate-800" />

          {/* Configuration & Controls */}
          <div className="text-xs uppercase tracking-wider text-emerald-300/70 dark:text-slate-400 font-bold px-2 mb-2">
            Settings & Safety
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-100/90 dark:text-slate-300 hover:bg-emerald-800/50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-emerald-300 dark:text-slate-400" />
              <span>Preferences</span>
            </button>
            <button
              onClick={() => setShowResponsibleUseModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-100/90 dark:text-slate-300 hover:bg-emerald-800/50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-300 dark:text-emerald-400" />
              <span>Responsible Use</span>
            </button>
          </div>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="pt-4 border-t border-emerald-800/60 dark:border-slate-800 text-center">
          <div className="text-xs text-emerald-200/80 dark:text-slate-400">
            EstechScoutier Client v1.0
          </div>
          <div className="text-[11px] text-emerald-300/60 dark:text-slate-500 mt-0.5">
            100% In-Browser &bull; Zero Server Sends
          </div>
        </div>
      </div>
    </aside>
  );
};


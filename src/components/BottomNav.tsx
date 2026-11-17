import React from 'react';
import { Home, Info, BookOpen, ShoppingBag, Video } from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5" /> },
    { id: 'blog', label: 'Blog', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'shop', label: 'Shop', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'videos', label: 'Videos', icon: <Video className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2F6B2F] text-white shadow-[0_-4px_16px_rgba(0,0,0,0.15)] border-t border-emerald-800 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? 'text-white' : 'text-emerald-200/70 hover:text-white'
              }`}
            >
              {/* Active pill background effect */}
              {isActive && (
                <div className="absolute top-1 w-10 h-8 bg-white/20 rounded-xl -z-0 animate-in fade-in zoom-in-75 duration-150" />
              )}
              <div className="z-10 transition-transform active:scale-90">{tab.icon}</div>
              <span className={`text-[11px] font-medium mt-1 tracking-tight z-10 ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};


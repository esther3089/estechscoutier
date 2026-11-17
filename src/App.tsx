import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SideDrawer } from './components/SideDrawer';
import { BottomNav } from './components/BottomNav';
import { DesktopSidebar } from './components/DesktopSidebar';
import { ScrollToTop } from './components/ScrollToTop';
import { ToastContainer } from './components/ToastContainer';
import { ResponsibleUseModal } from './components/ResponsibleUseModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Blog } from './pages/Blog';
import { Shop } from './pages/Shop';
import { Videos } from './pages/Videos';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Header />
      <SideDrawer />

      {/* Main app shell */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Desktop left sidebar */}
        <DesktopSidebar />

        {/* Center column (max ~900px as required) */}
        <main className="flex-1 min-w-0 max-w-[900px] mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {activeTab === 'home' && <Home />}
          {activeTab === 'about' && <About />}
          {activeTab === 'blog' && <Blog />}
          {activeTab === 'shop' && <Shop />}
          {activeTab === 'videos' && <Videos />}

          <Footer />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Overlays & Modals */}
      <ScrollToTop />
      <ToastContainer />
      <ResponsibleUseModal />
      <SettingsModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;


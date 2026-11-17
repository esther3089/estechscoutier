import React, { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-40 w-12 h-12 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white shadow-lg flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 animate-in fade-in zoom-in-75"
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ChevronUp className="w-6 h-6 stroke-[2.5]" />
    </button>
  );
};


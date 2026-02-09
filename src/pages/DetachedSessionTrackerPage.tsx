import DetachedSessionTracker from '@/components/DetachedSessionTracker';
import { useEffect } from 'react';
import { useStorage } from '@/hooks/useStorage';

const DetachedSessionTrackerPage = () => {
  const { settings } = useStorage();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(settings.theme);
    
    // Make everything transparent except the container
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    
    // Remove default styling that might interfere
    const style = document.createElement('style');
    style.textContent = `
      * { 
        box-sizing: border-box; 
      }
      body, html {
        background: transparent !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }, [settings.theme]);

  return (
    <DetachedSessionTracker />
  );
};

export default DetachedSessionTrackerPage;
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MyBoxesPage from './pages/MyBoxesPage';
import CardViewerPage from './pages/CardViewerPage';
import './App.css';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detect if running as PWA
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSPWA = (window.navigator as any).standalone === true;
      setIsPWA(isStandalone || isIOSPWA);
    };

    checkPWA();

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${isPWA ? 'safe-area-inset' : ''}`}>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-yellow-500 text-black text-center py-2 text-sm">
          You're offline - showing downloaded content
        </div>
      )}

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MyBoxesPage isOnline={isOnline} isPWA={isPWA} />} />
          <Route path="/box/:boxId" element={<CardViewerPage isOnline={isOnline} isPWA={isPWA} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
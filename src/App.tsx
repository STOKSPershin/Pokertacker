import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import MainPage from './pages/MainPage';
import SettingsPage from './pages/SettingsPage';
import SessionPage from './pages/SessionPage';
import PlanningPage from './pages/PlanningPage';
import DataPage from './pages/DataPage';
import DetachedSessionTrackerPage from './pages/DetachedSessionTrackerPage';
import Navbar from './components/Navbar';
import { useStorage } from './hooks/useStorage';
import { SessionProvider } from './context/SessionContext';

function App() {
  return (
    <Router>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </Router>
  );
}

function AppContent() {
  const { settings } = useStorage();
  const location = useLocation();
  const isDetachedRoute = location.pathname === '/session-tracker-detached';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(settings.theme);
  }, [settings.theme]);

  if (isDetachedRoute) {
    return (
      <Routes>
        <Route path="/session-tracker-detached" element={<DetachedSessionTrackerPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<MainPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/planning" element={<PlanningPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/data" element={<DataPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

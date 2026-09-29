import { useEffect, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { getSettings } from '@/lib/game/storage';
import { applyTheme } from '@/lib/game/theme';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import SaveGate from './components/SaveGate';
// Add page imports here
const PageNotFound = lazy(() => import('./lib/PageNotFound'));
// Core game screens load up front so the whole game keeps working if the connection drops.
import Home from './pages/Home';
import Puzzle from './pages/Puzzle';
import Tutorial from './pages/Tutorial';
import Profile from './pages/Profile';
import Store from './pages/Store';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Support from './pages/Support';

// Leftover session keys from the old hosted-backend bootstrap (including a stored access token).
const LEGACY_KEYS = ['base44_app_id', 'base44_access_token', 'base44_from_url', 'base44_functions_version', 'base44_app_base_url', 'token'];

function clearLegacyKeys() {
  try { LEGACY_KEYS.forEach((k) => localStorage.removeItem(k)); } catch { /* storage unavailable */ }
}

const AppRoutes = () => (
  <SaveGate>
  <Suspense fallback={null}>
  <Routes>
    {/* Add your page Route elements here */}
    <Route path="/" element={<Home />} />
    <Route path="/play" element={<Puzzle />} />
    <Route path="/tutorial" element={<Tutorial />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Profile />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/store" element={<Store />} />
    <Route path="/support" element={<Support />} />
    <Route path="*" element={<PageNotFound />} />
  </Routes>
  </Suspense>
  </SaveGate>
);


function App() {
  useEffect(() => {
    clearLegacyKeys();
    applyTheme(getSettings().theme);
  }, []);

  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App

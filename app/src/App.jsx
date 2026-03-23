import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSession } from './contexts/AppSessionContext';
import { useTranslation } from 'react-i18next';

// Pages
import LoginPage from './pages/LoginPage';
import MainDashboard from './pages/MainDashboard';
// import ResultPage from './pages/ResultPage';
// import SynthesisRoom from './pages/SynthesisRoom';
// import VictoryPage from './pages/VictoryPage';

// Import levels
import Level1NinjaSort from './levels/Level1NinjaSort';
import Level2SafeLock from './levels/Level2SafeLock';
import Level3TapChallenge from './levels/Level3TapChallenge';
import Level4WaterBalloonSort from './levels/Level4WaterBalloonSort';
import Level5TimeInput from './levels/Level5TimeInput';
import Level6GorillaPhoto from './levels/Level6GorillaPhoto';
import Level7AntennaSync from './levels/Level7AntennaSync';

// Endgame Pages
import ResultPage from './pages/ResultPage';
import VictoryPage from './pages/VictoryPage';
import HiddenResetPage from './pages/HiddenResetPage';
import ScanProtectedIntroRoute from './components/ScanProtectedIntroRoute';
import ScanProtectedLevelRoute from './components/ScanProtectedLevelRoute';
import ScanProtectedSynthesisRoute from './components/ScanProtectedSynthesisRoute';

function RootRedirectRoute() {
  const { loading, teamId, teamName } = useAppSession();

  if (loading) {
    return null;
  }

  const hasLoginState = Boolean(teamId && teamName?.trim());
  return <Navigate to={hasLoginState ? '/dashboard' : '/login'} replace />;
}

function LoginRoute() {
  const { loading, teamId, teamName } = useAppSession();

  if (loading) {
    return null;
  }

  const hasLoginState = Boolean(teamId && teamName?.trim());
  if (hasLoginState) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}

function App() {
  const { t } = useTranslation();
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-[#0D0F1A] text-white relative mx-auto max-w-md shadow-2xl overflow-hidden">
        <Routes>
          <Route path="/" element={<RootRedirectRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/intro/:characterId" element={<ScanProtectedIntroRoute />} />
          <Route path="/level/level1" element={<ScanProtectedLevelRoute levelId="level1" levelTitle={t('level1.title')} characterColor="#7C5CFC"><Level1NinjaSort /></ScanProtectedLevelRoute>} />
          <Route path="/level/level2" element={<ScanProtectedLevelRoute levelId="level2" levelTitle={t('level2.title')} characterColor="#F472B6"><Level2SafeLock /></ScanProtectedLevelRoute>} />
          <Route path="/level/level3" element={<ScanProtectedLevelRoute levelId="level3" levelTitle={t('level3.title')} characterColor="#4ADE80"><Level3TapChallenge /></ScanProtectedLevelRoute>} />
          <Route path="/level/level4" element={<ScanProtectedLevelRoute levelId="level4" levelTitle={t('level4.title')} characterColor="#38BDF8"><Level4WaterBalloonSort /></ScanProtectedLevelRoute>} />
          <Route path="/level/level5" element={<ScanProtectedLevelRoute levelId="level5" levelTitle={t('level5.title')} characterColor="#FBBF24"><Level5TimeInput /></ScanProtectedLevelRoute>} />
          <Route path="/level/level6" element={<ScanProtectedLevelRoute levelId="level6" levelTitle={t('level6.title')} characterColor="#8B5CF6"><Level6GorillaPhoto /></ScanProtectedLevelRoute>} />
          <Route path="/level/level7" element={<ScanProtectedLevelRoute levelId="level7" levelTitle={t('level7.title')} characterColor="#EF4444"><Level7AntennaSync /></ScanProtectedLevelRoute>} />
          <Route path="/level/:levelId" element={<ScanProtectedLevelRoute />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/synthesis" element={<ScanProtectedSynthesisRoute />} />
          <Route path="/victory" element={<VictoryPage />} />
          <Route path="/_sync/health-check-9a7f" element={<HiddenResetPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

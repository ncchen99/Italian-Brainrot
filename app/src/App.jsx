import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
import ScanProtectedIntroRoute from './components/ScanProtectedIntroRoute';
import ScanProtectedLevelRoute from './components/ScanProtectedLevelRoute';
import ScanProtectedSynthesisRoute from './components/ScanProtectedSynthesisRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-[#0D0F1A] text-white relative mx-auto max-w-md shadow-2xl overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/intro/:characterId" element={<ScanProtectedIntroRoute />} />
          <Route path="/level/level1" element={<ScanProtectedLevelRoute levelTitle="忍者的修煉" characterColor="#7C5CFC"><Level1NinjaSort /></ScanProtectedLevelRoute>} />
          <Route path="/level/level2" element={<ScanProtectedLevelRoute levelTitle="舞鞋保險箱" characterColor="#F472B6"><Level2SafeLock /></ScanProtectedLevelRoute>} />
          <Route path="/level/level3" element={<ScanProtectedLevelRoute levelTitle="狂點青蛙氣球" characterColor="#4ADE80"><Level3TapChallenge /></ScanProtectedLevelRoute>} />
          <Route path="/level/level4" element={<ScanProtectedLevelRoute levelTitle="轟炸鱷鱷的水球" characterColor="#38BDF8"><Level4WaterBalloonSort /></ScanProtectedLevelRoute>} />
          <Route path="/level/level5" element={<ScanProtectedLevelRoute levelTitle="沙漠鬧鐘危機" characterColor="#FBBF24"><Level5TimeInput /></ScanProtectedLevelRoute>} />
          <Route path="/level/level6" element={<ScanProtectedLevelRoute levelTitle="大猩猩認證" characterColor="#8B5CF6"><Level6GorillaPhoto /></ScanProtectedLevelRoute>} />
          <Route path="/level/level7" element={<ScanProtectedLevelRoute levelTitle="潮鞋防衛戰" characterColor="#EF4444"><Level7AntennaSync /></ScanProtectedLevelRoute>} />
          <Route path="/level/:levelId" element={<ScanProtectedLevelRoute />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/synthesis" element={<ScanProtectedSynthesisRoute />} />
          <Route path="/victory" element={<VictoryPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

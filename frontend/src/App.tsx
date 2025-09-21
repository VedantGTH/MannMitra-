import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MannMitraLanding from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AIChatbot from './pages/AIChatbot';
import ReportUpload from './pages/ReportUpload';
import SecretDiary from './pages/SecretDiary';
import CrisisHelpline from './pages/CrisisHelpline';
import MoodToMusic from './pages/MoodToMusic';
import QuickStats from './pages/QuickStats';
import './App.css';

function App() {
  return (
    <div style={{ margin: 0, padding: 0, width: '100%', minHeight: '100vh' }}>
      <Router>
        <Routes>
          <Route path="/" element={<MannMitraLanding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-chatbot" element={<AIChatbot />} />
          <Route path="/report-upload" element={<ReportUpload />} />
          <Route path="/secret-diary" element={<SecretDiary />} />
          <Route path="/crisis-helpline" element={<CrisisHelpline />} />
          <Route path="/mood-to-music" element={<MoodToMusic />} />
          <Route path="/quick-stats" element={<QuickStats />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
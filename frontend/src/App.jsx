import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CodeEditorPage from './pages/CodeEditorPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetailPage from './pages/HistoryDetailPage';
import ProfilePage from './pages/ProfilePage';
import TranslationPage from './pages/TranslationPage';
import FlowchartPage from './pages/FlowchartPage';
import SettingsPage from './pages/SettingsPage';

const PR = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>;

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: 'var(--toast-bg, #333)', color: 'var(--toast-color, #fff)' },
            }}
          />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route path="/dashboard" element={<PR><DashboardPage /></PR>} />
            <Route path="/editor" element={<PR><CodeEditorPage /></PR>} />
            <Route path="/analysis" element={<PR><AnalysisResultPage /></PR>} />
            <Route path="/history" element={<PR><HistoryPage /></PR>} />
            <Route path="/history/:id" element={<PR><HistoryDetailPage /></PR>} />
            <Route path="/profile" element={<PR><ProfilePage /></PR>} />
            <Route path="/translate" element={<PR><TranslationPage /></PR>} />
            <Route path="/flowchart" element={<PR><FlowchartPage /></PR>} />
            <Route path="/settings" element={<PR><SettingsPage /></PR>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

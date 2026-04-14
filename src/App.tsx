import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ServiceProvider } from '@/contexts/ServiceContext';
import { AudioProvider } from '@/contexts/AudioContext';
import { ToastProvider } from '@/contexts/ToastContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import MiraAppPage from '@/pages/MiraAppPage';

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <ServiceProvider>
                <AudioProvider>
                  <MiraAppPage />
                </AudioProvider>
              </ServiceProvider>
            }
          />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

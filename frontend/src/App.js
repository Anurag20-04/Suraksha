import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EmergencyProvider } from './context/EmergencyContext';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import Profile from './pages/Profile';
import Alerts from './pages/Alerts';
import EmergencyScreen from './pages/EmergencyScreen';
import { Toaster } from 'react-hot-toast';
import './index.css';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <EmergencyProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1C2433',
              color: '#E2E8F0',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'Sora, sans-serif',
              maxWidth: '360px',
            },
          }}
        />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/map"       element={<MapPage />} />
          <Route path="/profile"   element={<Profile />} />
          <Route path="/alerts"    element={<Alerts />} />
          <Route path="/emergency" element={<EmergencyScreen />} />
          <Route path="*"          element={<Navigate to="/" />} />
        </Routes>
      </EmergencyProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;

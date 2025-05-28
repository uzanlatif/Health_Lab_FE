// App.tsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import MultiBiosignalView from './pages/MultiBiosignalView';
import ECGView from './pages/ECGView';
import EEGView from './pages/EEGView';
import WelcomeView from './pages/WelcomeView';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<WelcomeView />} />
          <Route path="mbs" element={<MultiBiosignalView />} />
          <Route path="ecg" element={<ECGView />} />
          <Route path="eeg" element={<EEGView />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;

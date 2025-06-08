import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { WebSocketConfigProvider } from './context/WebSocketConfigContext';  // ✅ Tambahkan ini

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <WebSocketConfigProvider>  {/* ✅ Bungkus App */}
        <App />
      </WebSocketConfigProvider>
    </HashRouter>
  </StrictMode>
);

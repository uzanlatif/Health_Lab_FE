import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import MultiBiosignalView from './pages/MultiBiosignalView';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MultiBiosignalView />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
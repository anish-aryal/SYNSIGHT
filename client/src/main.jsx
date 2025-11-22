import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/dashboard/Dashboard';
import Explore from './pages/Explore/Explore';
import Chat from './pages/Chat/Chat';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/projects" element={<div className="p-4">Projects Page</div>} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/reports" element={<div className="p-4">Reports Page</div>} />
          <Route path="/history" element={<div className="p-4">History Page</div>} />
          <Route path="/data-sources" element={<div className="p-4">Data Sources Page</div>} />
          <Route path="/model-analysis" element={<div className="p-4">Model & Analysis Page</div>} />
          <Route path="/settings" element={<div className="p-4">Settings Page</div>} />
        </Routes>
      </App>
    </Router>
  </React.StrictMode>
);
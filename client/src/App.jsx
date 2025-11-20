import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        <Sidebar />
        {/* Main content with responsive margin */}
        <div 
          className="flex-grow-1 bg-light"
          style={{ 
            marginLeft: '260px',
            marginTop: '0'
          }}
        >
          {/* Add top margin on mobile to account for fixed navbar */}
          <div className="d-lg-none" style={{ height: '56px' }} />
          
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<div className="p-4">Chat Page</div>} />
            <Route path="/projects" element={<div className="p-4">Projects Page</div>} />
            <Route path="/explore" element={<div className="p-4">Explore Page</div>} />
            <Route path="/reports" element={<div className="p-4">Reports Page</div>} />
            <Route path="/history" element={<div className="p-4">History Page</div>} />
            <Route path="/data-sources" element={<div className="p-4">Data Sources Page</div>} />
            <Route path="/model-analysis" element={<div className="p-4">Model & Analysis Page</div>} />
            <Route path="/settings" element={<div className="p-4">Settings Page</div>} />
          </Routes>
        </div>
      </div>

      {/* Add media query styles */}
      <style>{`
        @media (max-width: 991.98px) {
          .flex-grow-1 {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </Router>
  );
}

export default App;
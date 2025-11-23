import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/dashboard/Dashboard';
import Explore from './pages/Explore/Explore';
import Chat from './pages/Chat/Chat';
import Reports from './pages/Reports/Reports';
import Projects from './pages/Projects/Projects';
import Settings from './pages/Settings/Settings';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Landing from './pages/Landing/Landing';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/history" element={<div className="p-4">History Page</div>} />
          <Route path="/data-sources" element={<div className="p-4">Data Sources Page</div>} />
          <Route path="/model-analysis" element={<div className="p-4">Model & Analysis Page</div>} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />

        </Routes>
      </App>
    </Router>
  </React.StrictMode>
);
import React from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';

function App({ children }) {
  return (
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
        
        {children}
      </div>

      {/* Add media query styles */}
      <style>{`
        @media (max-width: 991.98px) {
          .flex-grow-1 {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
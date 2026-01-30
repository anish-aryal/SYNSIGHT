import React from 'react';
import { Button } from 'reactstrap';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Empty Reports UI block for Reports page.

export default function EmptyReports() {
  const navigate = useNavigate();

  // Layout and appearance
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div 
        className="mb-4 rounded-4 d-flex align-items-center justify-content-center"
        style={{ 
          width: '80px', 
          height: '80px', 
          background: 'linear-gradient(135deg, rgba(21, 93, 252, 0.1) 0%, rgba(152, 16, 250, 0.1) 100%)'
        }}
      >
        <Download size={40} style={{ color: '#6366f1' }} />
      </div>
      
      <h4 className="fw-semibold mb-2">No reports yet</h4>
      <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
        Start a chat or run a search to generate your first report
      </p>
      
      <Button 
        className="gradient-primary border-0 px-4 py-2 fw-medium"
        onClick={() => navigate('/chat')}
      >
        Generate Report
      </Button>
    </div>
  );
}

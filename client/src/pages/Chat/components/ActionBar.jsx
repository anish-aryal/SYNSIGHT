import React from 'react';
import { Button } from 'reactstrap';
import { 
  Download, 
  Share2, 
  FolderPlus, 
  RefreshCw,
  FileText
} from 'lucide-react';

export default function ActionBar({ query, onRefresh }) {
  
  const handleExport = () => {
    // Export functionality - can be implemented later
    console.log('Export analysis for:', query);
  };

  const handleShare = () => {
    // Share functionality - can be implemented later
    console.log('Share analysis');
  };

  const handleSaveToProject = () => {
    // Save to project functionality - can be implemented later
    console.log('Save to project');
  };

  const handleGenerateReport = () => {
    // Generate report functionality - can be implemented later
    console.log('Generate report for:', query);
  };

  return (
    <div className="action-bar d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
      <Button
        outline
        color="secondary"
        size="sm"
        className="d-flex align-items-center gap-2"
        onClick={onRefresh}
      >
        <RefreshCw size={14} />
        <span>Refresh</span>
      </Button>

      <Button
        outline
        color="secondary"
        size="sm"
        className="d-flex align-items-center gap-2"
        onClick={handleExport}
      >
        <Download size={14} />
        <span>Export</span>
      </Button>

      <Button
        outline
        color="secondary"
        size="sm"
        className="d-flex align-items-center gap-2"
        onClick={handleShare}
      >
        <Share2 size={14} />
        <span>Share</span>
      </Button>

      <Button
        outline
        color="secondary"
        size="sm"
        className="d-flex align-items-center gap-2"
        onClick={handleSaveToProject}
      >
        <FolderPlus size={14} />
        <span>Save to Project</span>
      </Button>

      <Button
        color="primary"
        size="sm"
        className="d-flex align-items-center gap-2 ms-auto"
        onClick={handleGenerateReport}
      >
        <FileText size={14} />
        <span>Generate Report</span>
      </Button>
    </div>
  );
}
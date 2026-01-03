import React, { useState } from 'react';
import { Row, Col, Button, Spinner } from 'reactstrap';
import { GitCompare, FileDown, FolderPlus, Share2 } from 'lucide-react';
import { useAnalysis } from '../../../api/context/AnalysisContext';
import { useApp } from '../../../api/context/AppContext';

export default function ActionBar({ analysisId, query, results }) {
  const { fetchAnalysisById } = useAnalysis();
  const { showSuccess, showError } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCompare = () => {
    showSuccess('Compare feature coming soon!');
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Report generated successfully!');
    } catch (error) {
      showError('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      showSuccess('Saved as project successfully!');
    } catch (error) {
      showError('Failed to save project');
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/analysis/${analysisId}`;
      await navigator.clipboard.writeText(shareUrl);
      showSuccess('Link copied to clipboard!');
    } catch (error) {
      showError('Failed to copy link');
    }
  };

  return (
    <Row className="justify-content-center">
      <Col xs={12}>
        <div className="action-bar">
          <Button outline color="secondary" size="sm" onClick={handleCompare} className="action-btn">
            <GitCompare size={16} />
            Compare Topic
          </Button>
          <Button 
            outline 
            color="secondary" 
            size="sm"
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="action-btn"
          >
            {isGenerating ? <Spinner size="sm" /> : <FileDown size={16} />}
            Generate Report
          </Button>
          <Button outline color="secondary" size="sm" onClick={handleSaveProject} className="action-btn">
            <FolderPlus size={16} />
            Save as Project
          </Button>
          <Button outline color="secondary" size="sm" onClick={handleShare} className="action-btn">
            <Share2 size={16} />
            Share
          </Button>
        </div>
      </Col>
    </Row>
  );
}
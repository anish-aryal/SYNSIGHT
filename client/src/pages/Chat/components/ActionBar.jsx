import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'reactstrap';
import { 
  Share2, 
  FolderPlus, 
  Download,
  FileText,
  Eye
} from 'lucide-react';
import { useApp } from '../../../api/context/AppContext';
import reportService from '../../../api/services/reportService';
import ReportModal from './ReportModal';

export default function ActionBar({ query, results, onCompare, onRefresh }) {
  const { showSuccess, showError } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingReport, setIsCheckingReport] = useState(false);
  const [report, setReport] = useState(null);
  const [existingReport, setExistingReport] = useState(null);
  const [error, setError] = useState(null);

  const analysisId = results?.analysisId || results?._id;

  // Check if report already exists for this analysis
  useEffect(() => {
    const checkExistingReport = async () => {
      if (!analysisId) return;

      setIsCheckingReport(true);
      try {
        const response = await reportService.getReportByAnalysisId(analysisId);
        if (response.success && response.data) {
          setExistingReport(response.data);
        } else {
          setExistingReport(null);
        }
      } catch (err) {
        console.error('Error checking existing report:', err);
        setExistingReport(null);
      } finally {
        setIsCheckingReport(false);
      }
    };

    checkExistingReport();
  }, [analysisId]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) {
      setError(null);
    }
  };

  const handleViewReport = () => {
    if (existingReport) {
      setReport(existingReport);
      setIsModalOpen(true);
    }
  };

  const handleGenerateReport = async () => {
    if (!results) {
      showError('No analysis data available');
      return;
    }

    setIsModalOpen(true);
    setIsGenerating(true);
    setError(null);
    setReport(null);

    try {
      const response = await reportService.generateReport(results);
      
      if (response.success) {
        setReport(response.data);
        setExistingReport(response.data);
        showSuccess('Report generated successfully');
      } else {
        setError(response.message || 'Failed to generate report');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!report?.content) return;

    const blob = new Blob([report.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentiment-report-${query?.replace(/\s+/g, '-') || 'analysis'}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Report downloaded');
  };

  const handleShare = () => {
    console.log('Share analysis');
  };

  const handleSaveToProject = () => {
    console.log('Save to project');
  };

  const handleCompare = () => {
    if (onCompare) {
      onCompare();
      return;
    }
    if (onRefresh) {
      onRefresh();
      return;
    }
    console.log('Compare topic');
  };

  const hasExistingReport = !!existingReport;

  return (
    <>
      <div className="action-bar d-flex gap-2 mt-4 pt-3 border-top">
        <Button
          outline
          color="secondary"
          size="sm"
          className="action-btn-outline d-flex align-items-center gap-2"
          onClick={handleCompare}
        >
          <Download size={14} />
          <span>Export</span>
        </Button>

        <Button
          outline
          color="secondary"
          size="sm"
          className="action-btn-outline d-flex align-items-center gap-2"
          onClick={handleSaveToProject}
        >
          <FolderPlus size={14} />
          <span>Save as Project</span>
        </Button>

        <Button
          outline
          color="secondary"
          size="sm"
          className="action-btn-outline d-flex align-items-center gap-2"
          onClick={handleShare}
        >
          <Share2 size={14} />
          <span>Share</span>
        </Button>

        {isCheckingReport ? (
          <Button
            size="sm"
            className="gradient-primary action-btn-primary d-flex align-items-center gap-2 ms-auto"
            disabled
          >
            <Spinner size="sm" />
            <span>Checking...</span>
          </Button>
        ) : hasExistingReport ? (
          <Button
            color="success"
            size="sm"
            className="action-btn-primary d-flex align-items-center gap-2 ms-auto"
            onClick={handleViewReport}
          >
            <Eye size={14} />
            <span>View Report</span>
          </Button>
        ) : (
          <Button
            size="sm"
            className="gradient-primary action-btn-primary d-flex align-items-center gap-2 ms-auto"
            onClick={handleGenerateReport}
          >
            <FileText size={14} />
            <span>Generate Report</span>
          </Button>
        )}
      </div>

      <ReportModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        isGenerating={isGenerating}
        report={report}
        error={error}
        onDownload={handleDownload}
      />
    </>
  );
}

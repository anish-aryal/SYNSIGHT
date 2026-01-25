import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';
import { 
  Share2, 
  FolderPlus, 
  Download,
  FileText,
  Eye
} from 'lucide-react';
import { useApp } from '../../../api/context/AppContext';
import * as analysisService from '../../../api/services/analysisService';
import reportService from '../../../api/services/reportService';
import projectService from '../../../api/services/projectService';
import ReportModal from './ReportModal';
import ProjectPickerModal from '../../../components/projects/ProjectPickerModal';

export default function ActionBar({ query, results, onCompare, onRefresh }) {
  const { showSuccess, showError } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingReport, setIsCheckingReport] = useState(false);
  const [report, setReport] = useState(null);
  const [existingReport, setExistingReport] = useState(null);
  const [error, setError] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsSaving, setProjectsSaving] = useState(false);

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
    if (!analysisId) {
      showError('No analysis available to save');
      return;
    }
    setIsProjectModalOpen(true);
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (!isProjectModalOpen) return;
      setProjectsLoading(true);
      try {
        const response = await projectService.getProjects();
        if (response?.success) {
          setProjects(Array.isArray(response.data) ? response.data : []);
        } else {
          showError(response?.message || 'Failed to load projects');
        }
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to load projects';
        showError(message);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, [isProjectModalOpen, showError]);

  const handleAssignProject = async (projectId) => {
    if (!analysisId) return;
    setProjectsSaving(true);
    try {
      const response = await analysisService.updateAnalysisProject(analysisId, projectId);
      if (response?.success) {
        showSuccess('Analysis saved to project');
        setIsProjectModalOpen(false);
      } else {
        showError(response?.message || 'Failed to save to project');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to save to project';
      showError(message);
    } finally {
      setProjectsSaving(false);
    }
  };

  const handleCreateAndAssign = async (payload) => {
    setProjectsSaving(true);
    try {
      const created = await projectService.createProject(payload);
      if (!created?.success || !created.data?._id) {
        throw new Error(created?.message || 'Failed to create project');
      }

      await handleAssignProject(created.data._id);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create project';
      showError(message);
      setProjectsSaving(false);
    }
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
            <span className="skeleton-line skeleton-inline" style={{ width: '70px', height: '12px' }} />
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

      <ProjectPickerModal
        isOpen={isProjectModalOpen}
        toggle={() => setIsProjectModalOpen(false)}
        projects={projects}
        isLoading={projectsLoading}
        isSaving={projectsSaving}
        onAssign={handleAssignProject}
        onCreateAndAssign={handleCreateAndAssign}
        title="Save analysis to project"
      />
    </>
  );
}

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AnalysisDetail from './AnalysisDetail';

// Analysis Detail Page page layout and interactions.

export default function AnalysisDetailPage() {
  const { projectId, analysisId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/projects');
    }
  };

  // Layout and appearance
  return (
    <AnalysisDetail
      analysisId={analysisId}
      projectId={projectId}
      onBack={handleBack}
    />
  );
}

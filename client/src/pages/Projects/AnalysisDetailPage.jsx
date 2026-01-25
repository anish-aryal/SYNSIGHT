import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AnalysisDetail from './AnalysisDetail';

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

  return (
    <AnalysisDetail
      analysisId={analysisId}
      projectId={projectId}
      onBack={handleBack}
    />
  );
}

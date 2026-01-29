import React from 'react';
import {
  ArrowLeft,
  LayoutDashboard,
  Layers,
  FileText,
  ChevronRight
} from 'lucide-react';

export default function ProjectBreadcrumbs({
  onBack,
  projectName,
  analysisLabel,
  onProjectClick,
  backAriaLabel = 'Back to projects',
  className = '',
  rootLabel = 'Projects',
  rootIcon: RootIcon = LayoutDashboard,
  showProjectCrumb = true
}) {
  const hasAnalysis = Boolean(analysisLabel);
  const resolvedProjectName = projectName || (hasAnalysis ? 'All Projects' : 'Project');
  const showProjectLink = Boolean(projectName && onProjectClick && hasAnalysis);

  return (
    <div className={`analysis-detail-breadcrumbs-wrap ${className}`.trim()}>
      <button
        type="button"
        className="analysis-detail-back"
        onClick={onBack}
        aria-label={backAriaLabel}
      >
        <ArrowLeft size={16} />
      </button>
      <div className="analysis-detail-breadcrumbs">
        <span className="analysis-detail-breadcrumb is-static" aria-disabled="true">
          <RootIcon size={14} className="analysis-detail-breadcrumb-icon" />
          {rootLabel}
        </span>
        {hasAnalysis ? (
          <>
            <ChevronRight size={16} className="analysis-detail-breadcrumb-separator" />
            {showProjectCrumb ? (
              showProjectLink ? (
                <>
                  <button
                    type="button"
                    className="analysis-detail-breadcrumb"
                    onClick={onProjectClick}
                  >
                    <Layers size={14} className="analysis-detail-breadcrumb-icon" />
                    {resolvedProjectName}
                  </button>
                  <ChevronRight size={16} className="analysis-detail-breadcrumb-separator" />
                </>
              ) : (
                <>
                  <span className="analysis-detail-breadcrumb is-static">
                    <Layers size={14} className="analysis-detail-breadcrumb-icon" />
                    {resolvedProjectName}
                  </span>
                  <ChevronRight size={16} className="analysis-detail-breadcrumb-separator" />
                </>
              )
            ) : null}
            <span className="analysis-detail-breadcrumb-current">
              <FileText size={14} className="analysis-detail-breadcrumb-icon" />
              {analysisLabel}
            </span>
          </>
        ) : (
          <>
            <ChevronRight size={16} className="analysis-detail-breadcrumb-separator" />
            <span className="analysis-detail-breadcrumb-current">
              <Layers size={14} className="analysis-detail-breadcrumb-icon" />
              {resolvedProjectName}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

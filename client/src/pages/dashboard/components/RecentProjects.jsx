import React from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import { Folder } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown date';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatRelativeTime = (value) => {
  if (!value) return 'Updated recently';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return `Updated ${formatDate(value)}`;
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 60000) return 'Updated just now';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `Updated ${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Updated ${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  return `Updated ${weeks} week${weeks === 1 ? '' : 's'} ago`;
};

const getStatusLabel = (status = 'active') => {
  const normalized = String(status || 'active').toLowerCase();
  if (normalized === 'archived') return 'archived';
  if (normalized === 'deleted') return 'deleted';
  return normalized === 'active' ? 'active' : normalized;
};

const getStatusClass = (status = 'active') => {
  const normalized = String(status || 'active').toLowerCase();
  if (normalized === 'active') return 'badge-active';
  return 'badge-completed';
};

export default function RecentProjects({
  projects = [],
  isLoading = false,
  error = null,
  onRetry,
  onViewAll,
  onOpen
}) {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const visibleProjects = safeProjects.slice(0, 3);

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="card-title mb-1">Recent Projects</h5>
            <p className="text-muted small mb-0">Your most recently accessed projects</p>
          </div>
          {onViewAll ? (
            <Button color="link" className="text-primary" onClick={onViewAll}>
              View All →
            </Button>
          ) : null}
        </div>
        
        <div className="projects-list">
          {isLoading ? (
            <div className="dashboard-skeleton">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={`recent-skeleton-${idx}`} className="project-item d-flex justify-content-between align-items-center p-3">
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="project-icon-placeholder" />
                    <div className="flex-grow-1">
                      <div className="skeleton-line" style={{ width: '55%' }} />
                      <div className="skeleton-line" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div className="skeleton-line skeleton-inline" style={{ width: '60px', height: '18px' }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="dashboard-empty">
              <p className="text-muted mb-3">{error}</p>
              {onRetry ? (
                <Button color="primary" size="sm" onClick={onRetry}>
                  Try Again
                </Button>
              ) : null}
            </div>
          ) : visibleProjects.length === 0 ? (
            <div className="dashboard-empty">
              <p className="text-muted mb-3">No projects yet. Start a workspace to see it here.</p>
              {onViewAll ? (
                <Button color="primary" size="sm" onClick={onViewAll}>
                  Create Project
                </Button>
              ) : null}
            </div>
          ) : (
            visibleProjects.map((project) => {
              const projectId = project?._id || project?.id;
              const statusLabel = getStatusLabel(project?.status);
              const statusClass = getStatusClass(project?.status);
              const updatedLabel = formatRelativeTime(project?.lastActivityAt || project?.updatedAt || project?.createdAt);
              return (
                <div
                  key={projectId || project?.name}
                  className="project-item d-flex justify-content-between align-items-center p-3"
                  role={onOpen ? 'button' : undefined}
                  tabIndex={onOpen ? 0 : undefined}
                  onClick={() => onOpen?.(project)}
                  onKeyDown={(event) => {
                    if (!onOpen) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onOpen(project);
                    }
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <Folder size={20} className="text-primary" />
                    <div>
                      <div className="fw-medium">{project?.name || 'Untitled project'}</div>
                      <small className="text-muted">{updatedLabel}</small>
                    </div>
                  </div>
                  <span className={`badge ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </CardBody>
    </Card>
  );
}

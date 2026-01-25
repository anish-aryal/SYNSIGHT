import React from 'react';
import { Card, CardBody, Button, Row, Col, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { BarChart2, Star, MoreVertical, FileText, Folder } from 'lucide-react';

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

export default function ProjectsGrid({ projects, onToggleStar, onEdit, onDelete, onOpen }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-semibold mb-0">All Projects</h5>
        <span className="text-muted" style={{ fontSize: '14px' }}>
          {projects.length} projects
        </span>
      </div>

      <Row className="g-3">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Col key={project._id || project.id} xs={12}>
              <Card
                className="project-card project-card-list"
                role={onOpen ? 'button' : undefined}
                onClick={() => onOpen?.(project)}
              >
                <CardBody>
                  <div className="project-card-row">
                    <div className="project-card-icon">
                      <Folder size={22} />
                    </div>

                    <div className="project-card-content">
                      <div className="project-card-header">
                        <h6 className="project-card-title">
                          {project.name || project.title || 'Untitled project'}
                        </h6>
                        <span className="project-card-updated">
                          {formatRelativeTime(project.lastActivityAt || project.updatedAt || project.createdAt)}
                        </span>
                      </div>

                      <p className="project-card-description">
                        {project.description || 'No description provided'}
                      </p>

                      <div className="project-card-meta">
                        <span className="project-card-meta-item">
                          <BarChart2 size={14} />
                          {project.analysisCount || 0} analyses
                        </span>
                        <span className="project-card-meta-item">
                          <FileText size={14} />
                          {project.reportCount || 0} reports
                        </span>
                      </div>
                    </div>

                    <div className="project-card-actions">
                      <button
                        type="button"
                        className="project-card-star"
                        aria-label={project.isStarred ? 'Unstar project' : 'Star project'}
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleStar?.(project);
                        }}
                      >
                        <Star
                          size={18}
                          fill={project.isStarred ? '#f59e0b' : 'none'}
                          color={project.isStarred ? '#f59e0b' : '#9ca3af'}
                        />
                      </button>

                      <Button
                        color="primary"
                        size="sm"
                        className="project-card-open-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpen?.(project);
                        }}
                      >
                        Open
                      </Button>

                      <UncontrolledDropdown direction="down">
                        <DropdownToggle
                          tag="button"
                          type="button"
                          className="btn btn-link p-0 text-muted"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={18} />
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(project);
                            }}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete?.(project);
                            }}
                            className="text-danger"
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <div className="text-center py-5">
              <p className="text-muted fs-5">No projects found</p>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
}

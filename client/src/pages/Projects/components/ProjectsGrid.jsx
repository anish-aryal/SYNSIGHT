import React, { useState } from 'react';
import { Card, CardBody, Button, Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { BarChart2, Star, MoreVertical, FileText, Folder } from 'lucide-react';

// Projects Grid UI block for Projects page.

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

export default function ProjectsGrid({
  projects,
  onToggleStar,
  onEdit,
  onDelete,
  onOpen,
  title = 'All Projects',
  emptyMessage = 'No projects found'
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  // Layout and appearance
  return (
    <div>
      <div className="projects-grid-header">
        <h5 className="projects-grid-title">{title}</h5>
        <span className="projects-grid-count">{projects.length} projects</span>
      </div>

      <Row className="projects-grid-row">
        {projects.length > 0 ? (
          projects.map((project) => {
            const projectId = project._id || project.id;
            return (
            <Col key={projectId} xs={12} sm={6} lg={4} xl={3} className="projects-grid-col">
              <Card
                className={`project-card project-card-gallery h-100 ${openMenuId === projectId ? 'is-menu-open' : ''}`}
                role={onOpen ? 'button' : undefined}
                onClick={() => onOpen?.(project)}
              >
                <CardBody className="project-card-body">
                  <div className="project-card-row">
                    <div className="project-card-top">
                      <div className="project-card-icon">
                        <Folder size={22} />
                      </div>
                      <div className="project-card-top-actions">
                        <Dropdown
                          direction="down"
                          isOpen={openMenuId === projectId}
                          toggle={(e) => {
                            if (e?.stopPropagation) e.stopPropagation();
                            setOpenMenuId((prev) => (prev === projectId ? null : projectId));
                          }}
                        >
                          <DropdownToggle
                            tag="button"
                            type="button"
                            className="project-card-more-btn"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={18} />
                          </DropdownToggle>
                        <DropdownMenu end>
                            <DropdownItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(project);
                                setOpenMenuId(null);
                              }}
                            >
                              Edit
                            </DropdownItem>
                          <DropdownItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete?.(project);
                              setOpenMenuId(null);
                            }}
                            className="project-card-delete"
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                    </div>

                    <div className="project-card-content">
                      <div className="project-card-header">
                        <div className="project-card-title-row">
                          <h6 className="project-card-title">
                            {project.name || project.title || 'Untitled project'}
                          </h6>
                          {project.category ? (
                            <span className="project-card-tag">{project.category}</span>
                          ) : null}
                        </div>
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
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          );
          })
        ) : (
          <Col xs={12}>
            <div className="projects-empty-state">
              <p className="projects-empty-text">{emptyMessage}</p>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
}

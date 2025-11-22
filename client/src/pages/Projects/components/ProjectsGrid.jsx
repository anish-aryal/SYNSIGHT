import React from 'react';
import { Card, CardBody, Badge, Row, Col } from 'reactstrap';
import { BarChart2, Clock, Star, MoreVertical } from 'lucide-react';

export default function ProjectsGrid({ projects, onToggleStar }) {
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
            <Col key={project.id} xs={12} lg={6}>
              <Card className="border-1 shadow-sm h-100 project-card">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-start gap-2">
                      <h6 className="fw-semibold mb-0">{project.title}</h6>
                      {project.isStarred && (
                        <Star 
                          size={18} 
                          fill="#f59e0b" 
                          color="#f59e0b"
                          style={{ cursor: 'pointer' }}
                          onClick={() => onToggleStar(project.id)}
                        />
                      )}
                    </div>
                    <MoreVertical 
                      size={18} 
                      className="text-muted" 
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <p className="text-muted mb-3" style={{ fontSize: '14px' }}>
                    {project.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-3">
                      <span 
                        className="d-flex align-items-center gap-1 text-muted" 
                        style={{ fontSize: '13px' }}
                      >
                        <BarChart2 size={14} />
                        {project.queries} queries
                      </span>
                      <Badge color="light" className="text-dark border px-2 py-1">
                        {project.category}
                      </Badge>
                    </div>
                    
                    <span 
                      className="d-flex align-items-center gap-1 text-muted" 
                      style={{ fontSize: '13px' }}
                    >
                      <Clock size={14} />
                      {project.lastUpdated}
                    </span>
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
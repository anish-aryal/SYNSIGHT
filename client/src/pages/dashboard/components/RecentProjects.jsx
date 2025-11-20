import React from 'react';
import { Card, CardBody, Button } from 'reactstrap';
import { Folder } from 'lucide-react';

export default function RecentProjects() {
  const projects = [
    { name: 'Brand Monitoring Q4', updated: 'Updated 2 hours ago', status: 'active' },
    { name: 'Competitor Analysis', updated: 'Updated 1 day ago', status: 'active' },
    { name: 'Product Launch', updated: 'Updated 3 days ago', status: 'completed' }
  ];

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="card-title mb-1">Recent Projects</h5>
            <p className="text-muted small mb-0">Your most recently accessed projects</p>
          </div>
          <Button color="link" className="text-primary">
            View All →
          </Button>
        </div>
        
        <div className="projects-list">
          {projects.map((project, idx) => (
            <div key={idx} className="project-item d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center gap-3">
                <Folder size={20} className="text-primary" />
                <div>
                  <div className="fw-medium">{project.name}</div>
                  <small className="text-muted">{project.updated}</small>
                </div>
              </div>
              <span className={`badge badge-${project.status}`}>
                {project.status}
              </span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
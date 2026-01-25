import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormGroup,
  Label
} from 'reactstrap';

export default function ProjectPickerModal({
  isOpen,
  toggle,
  projects = [],
  isLoading = false,
  isSaving = false,
  onAssign,
  onCreateAndAssign,
  title = 'Add to Project'
}) {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProjectId(projects[0]?._id || '');
    setNewProject({ name: '', description: '', category: '' });
  }, [isOpen, projects]);

  const handleAssign = async () => {
    if (!selectedProjectId || !onAssign) return;
    await onAssign(selectedProjectId);
  };

  const handleCreateAndAssign = async () => {
    if (!newProject.name.trim() || !onCreateAndAssign) return;
    await onCreateAndAssign({
      name: newProject.name.trim(),
      description: newProject.description.trim(),
      category: newProject.category.trim()
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>
        <div className="mb-4">
          <h6 className="fw-semibold mb-2">Choose an existing project</h6>
          {isLoading ? (
            <div className="d-flex align-items-center gap-2 text-muted">
              <span className="skeleton-line skeleton-inline" style={{ width: '100px', height: '12px' }} />
              <span>Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-muted mb-0">No projects yet. Create one below.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {projects.map((project) => (
                <Label key={project._id} className="d-flex align-items-center gap-2 mb-0">
                  <Input
                    type="radio"
                    name="project"
                    value={project._id}
                    checked={selectedProjectId === project._id}
                    onChange={() => setSelectedProjectId(project._id)}
                  />
                  <span className="fw-medium">{project.name || project.title || 'Untitled project'}</span>
                  {project.category ? (
                    <span className="text-muted" style={{ fontSize: '13px' }}>
                      · {project.category}
                    </span>
                  ) : null}
                </Label>
              ))}
            </div>
          )}
        </div>

        <hr />

        <div>
          <h6 className="fw-semibold mb-2">Create a new project</h6>
          <FormGroup>
            <Label for="project-name">Project name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Brand monitoring Q1"
              value={newProject.name}
              onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
            />
          </FormGroup>
          <FormGroup>
            <Label for="project-description">Description</Label>
            <Input
              id="project-description"
              type="textarea"
              rows="3"
              placeholder="Optional summary"
              value={newProject.description}
              onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
            />
          </FormGroup>
          <FormGroup>
            <Label for="project-category">Category</Label>
            <Input
              id="project-category"
              placeholder="Marketing, Product, Research..."
              value={newProject.category}
              onChange={(e) => setNewProject((prev) => ({ ...prev, category: e.target.value }))}
            />
          </FormGroup>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" outline onClick={toggle} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          color="primary"
          outline
          onClick={handleAssign}
          disabled={!selectedProjectId || isSaving || isLoading}
        >
          {isSaving ? (
            <span className="skeleton-line skeleton-inline" style={{ width: '48px', height: '12px' }} />
          ) : (
            'Assign'
          )}
        </Button>
        <Button
          color="primary"
          onClick={handleCreateAndAssign}
          disabled={!newProject.name.trim() || isSaving}
        >
          {isSaving ? (
            <span className="skeleton-line skeleton-inline" style={{ width: '90px', height: '12px' }} />
          ) : (
            'Create & Assign'
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

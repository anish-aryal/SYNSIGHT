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
  const categoryOptions = [
    'General',
    'Marketing',
    'Product',
    'Research',
    'Operations',
    'Sales',
    'Support',
    'Finance',
    'HR',
    'Engineering'
  ];
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState('choice');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    category: 'General'
  });

  useEffect(() => {
    if (!isOpen) return;
    setSelectedProjectId(projects[0]?._id || '');
    setSearchTerm('');
    setStep('choice');
    setNewProject({ name: '', description: '', category: 'General' });
  }, [isOpen, projects]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProjects = normalizedSearch
    ? projects.filter((project) => {
        const name = (project.name || project.title || '').toLowerCase();
        const category = (project.category || '').toLowerCase();
        return name.includes(normalizedSearch) || category.includes(normalizedSearch);
      })
    : projects;

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
    <Modal isOpen={isOpen} toggle={toggle} size="lg" className="project-picker-modal">
      <ModalHeader toggle={toggle} className="project-picker-header">
        {title}
      </ModalHeader>
      <ModalBody className="project-picker-body">
        {step === 'choice' ? (
          <div className="project-picker-choice">
            <h6 className="project-picker-section-title">How would you like to save?</h6>
            <p className="text-muted mb-0">
              Create a new project or add this analysis to one that already exists.
            </p>
            <div className="project-picker-choice-grid">
              <Button
                type="button"
                outline
                color="primary"
                className="project-picker-choice-card"
                onClick={() => setStep('existing')}
                disabled={isSaving || isLoading}
              >
                <span className="project-picker-choice-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3.5" y="4" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 9.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M7 13H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="project-picker-choice-title">Add to existing</span>
                <span className="project-picker-choice-text">Pick from your current projects.</span>
              </Button>
              <Button
                type="button"
                outline
                color="primary"
                className="project-picker-choice-card"
                onClick={() => setStep('new')}
                disabled={isSaving}
              >
                <span className="project-picker-choice-icon is-accent" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="3.5" y="4" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 8.5V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M9 11.5H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="project-picker-choice-title">Create new project</span>
                <span className="project-picker-choice-text">Start fresh with details.</span>
              </Button>
            </div>
          </div>
        ) : step === 'existing' ? (
          <div className="project-picker-section">
            <div className="project-picker-step-header">
              <button type="button" className="project-picker-back" onClick={() => setStep('choice')}>
                <span className="project-picker-back-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M11.75 5L7.25 9.5L11.75 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>Back</span>
              </button>
              <h6 className="project-picker-section-title">Choose an existing project</h6>
            </div>
            {isLoading ? (
              <div className="d-flex align-items-center gap-2 text-muted">
                <span className="skeleton-line skeleton-inline" style={{ width: '100px', height: '12px' }} />
                <span>Loading projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <p className="text-muted mb-0">No projects yet. Create one instead.</p>
            ) : (
              <>
                <div className="project-picker-search">
                  <span className="project-picker-search-icon" aria-hidden="true">
                    <svg viewBox="0 0 20 20" fill="none">
                      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M13.75 13.75L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <Input
                    type="text"
                    placeholder="Search projects"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search projects"
                    className="project-picker-search-input"
                  />
                </div>
                {filteredProjects.length === 0 ? (
                  <p className="text-muted mb-0">No projects match your search.</p>
                ) : (
                  <div className="project-picker-options">
                    {filteredProjects.map((project) => (
                      <Label key={project._id} className="project-picker-option">
                        <Input
                          type="radio"
                          name="project"
                          value={project._id}
                          checked={selectedProjectId === project._id}
                          onChange={() => setSelectedProjectId(project._id)}
                        />
                        <span className="project-picker-option-title">
                          {project.name || project.title || 'Untitled project'}
                        </span>
                        {project.category ? (
                          <span className="project-picker-option-meta">
                            · {project.category}
                          </span>
                        ) : null}
                      </Label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="project-picker-section">
            <div className="project-picker-step-header">
              <button type="button" className="project-picker-back" onClick={() => setStep('choice')}>
                <span className="project-picker-back-icon" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M11.75 5L7.25 9.5L11.75 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>Back</span>
              </button>
              <h6 className="project-picker-section-title">Create a new project</h6>
            </div>
            <FormGroup className="project-picker-field">
              <Label for="project-name">Project name</Label>
              <Input
                id="project-name"
                placeholder="e.g. Brand monitoring Q1"
                value={newProject.name}
                onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
              />
            </FormGroup>
            <FormGroup className="project-picker-field">
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
            <FormGroup className="project-picker-field">
              <Label for="project-category">Category</Label>
              <Input
                id="project-category"
                type="select"
                value={newProject.category}
                onChange={(e) => setNewProject((prev) => ({ ...prev, category: e.target.value }))}
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </div>
        )}
      </ModalBody>
      <ModalFooter className="project-picker-footer">
        <Button color="secondary" outline onClick={toggle} disabled={isSaving}>
          Cancel
        </Button>
        {step === 'existing' ? (
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
        ) : null}
        {step === 'new' ? (
          <Button
            color="primary"
            className="project-picker-save"
            onClick={handleCreateAndAssign}
            disabled={!newProject.name.trim() || isSaving}
          >
            {isSaving ? (
              <span className="skeleton-line skeleton-inline" style={{ width: '90px', height: '12px' }} />
            ) : (
              'Create & Assign'
            )}
          </Button>
        ) : null}
      </ModalFooter>
    </Modal>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Nav, NavItem, NavLink } from 'reactstrap';
import PageHeader from '../../components/PageHeader/PageHeader';
import ProjectsGrid from './components/ProjectsGrid';
import projectService from '../../api/services/projectService';
import { useApp } from '../../api/context/AppContext';
import ProjectDetail from './ProjectDetail';
import BadgeSelect, { CATEGORY_OPTIONS, STATUS_OPTIONS, getCategoryBadgeClass, getStatusBadgeClass } from '../../components/projects/BadgeSelect';

// Projects page layout and interactions.

export default function Projects() {
  const { showError, showSuccess } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('all');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    category: '',
    status: 'Active',
    isStarred: false
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    setListError(null);
    try {
      const response = await projectService.getProjects();
      if (response?.success) {
        setProjects(Array.isArray(response.data) ? response.data : []);
      } else {
        throw new Error(response?.message || 'Failed to load projects');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load projects';
      setListError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      setActiveProjectId(projectId);
    } else {
      setActiveProjectId(null);
    }
  }, [projectId]);

  const filteredProjects = useMemo(() => (
    projects.filter(project =>
      (project?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project?.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  ), [projects, searchQuery]);

  const starredProjects = useMemo(
    () => filteredProjects.filter((project) => project.isStarred),
    [filteredProjects]
  );
  const visibleProjects = activeView === 'favorites' ? starredProjects : filteredProjects;

  const openCreateModal = useCallback(() => {
    setActiveProject(null);
    setFormState({ name: '', description: '', category: '', status: 'Active', isStarred: false });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  useEffect(() => {
    if (location.state?.openCreate) {
      openCreateModal();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate, openCreateModal]);

  const openEditModal = (project) => {
    const normalizedCategory = typeof project?.category === 'string' ? project.category.trim().toLowerCase() : '';
    const normalizedStatus = typeof project?.status === 'string' ? project.status.trim().toLowerCase() : '';
    const nextCategory = CATEGORY_OPTIONS.find((option) => option.toLowerCase() === normalizedCategory) || '';
    const nextStatus = STATUS_OPTIONS.find((option) => option.toLowerCase() === normalizedStatus) || STATUS_OPTIONS[0];
    setActiveProject(project);
    setFormState({
      name: project?.name || '',
      description: project?.description || '',
      category: nextCategory,
      status: nextStatus,
      isStarred: Boolean(project?.isStarred)
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSaveProject = async () => {
    const nextErrors = {};
    if (!formState.name.trim()) nextErrors.name = 'Project name is required.';
    if (!formState.category) nextErrors.category = 'Please select a category.';
    if (!formState.status) nextErrors.status = 'Please select a status.';
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      if (activeProject?._id) {
        const response = await projectService.updateProject(activeProject._id, formState);
        if (response?.success) {
          setProjects((prev) =>
            prev.map((item) => (item._id === activeProject._id ? response.data : item))
          );
          showSuccess('Project updated');
        } else {
          throw new Error(response?.message || 'Failed to update project');
        }
      } else {
        const response = await projectService.createProject(formState);
        if (response?.success) {
          setProjects((prev) => [response.data, ...prev]);
          showSuccess('Project created');
        } else {
          throw new Error(response?.message || 'Failed to create project');
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to save project';
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStar = async (project) => {
    if (!project?._id) return;
    const nextValue = !project.isStarred;
    try {
      const response = await projectService.updateProject(project._id, { isStarred: nextValue });
      if (response?.success) {
        setProjects((prev) =>
          prev.map((item) => (item._id === project._id ? response.data : item))
        );
      } else {
        throw new Error(response?.message || 'Failed to update project');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update project';
      showError(message);
    }
  };

  const handleDeleteProject = async () => {
    if (!activeProject?._id) return;
    setIsSaving(true);
    try {
      const response = await projectService.deleteProject(activeProject._id);
      if (response?.success) {
        setProjects((prev) => prev.filter((item) => item._id !== activeProject._id));
        showSuccess('Project deleted');
      } else {
        throw new Error(response?.message || 'Failed to delete project');
      }
      setIsDeleteOpen(false);
      setActiveProject(null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete project';
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Layout and appearance
  return (
    <div className="syn-page projects-page">
      <Container className="syn-page-container">
        <Row>
          <Col>
            <div className="syn-page-hero">
              <PageHeader
                title="Projects"
                subtitle="Organize your queries and dashboards by workspace"
                showSearch={true}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search projects..."
                showButton={true}
                buttonText="New Project"
                onButtonClick={openCreateModal}
              />
              <div className="projects-hero-footer">
                <div className="projects-tabs-wrapper syn-pill-toggle">
                  <Nav className="projects-tabs syn-pill-toggle-nav">
                    <NavItem>
                      <NavLink
                        className={`projects-tab syn-pill-toggle-btn ${activeView === 'favorites' ? 'is-active' : ''}`}
                        onClick={() => setActiveView('favorites')}
                      >
                        <span className="projects-tab-label">Favorites</span>
                        <span className="projects-tab-count syn-pill-toggle-count">{starredProjects.length}</span>
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={`projects-tab syn-pill-toggle-btn ${activeView === 'all' ? 'is-active' : ''}`}
                        onClick={() => setActiveView('all')}
                      >
                        <span className="projects-tab-label">All</span>
                        <span className="projects-tab-count syn-pill-toggle-count">{filteredProjects.length}</span>
                      </NavLink>
                    </NavItem>
                  </Nav>
                </div>
              </div>
            </div>

            <div className="syn-page-content">
              {isLoading ? (
                <div className="projects-state projects-loading">
                  <div className="skeleton-wrapper">
                    <div className="skeleton-line" style={{ width: '40%' }} />
                    <div className="skeleton-line" style={{ width: '85%' }} />
                    <div className="skeleton-line" style={{ width: '70%' }} />
                  </div>
                </div>
              ) : listError ? (
                <div className="projects-state projects-error">
                  <p className="projects-error-text">{listError}</p>
                  <Button className="projects-retry-btn" color="primary" onClick={fetchProjects}>
                    Try Again
                  </Button>
                </div>
              ) : (
                <ProjectsGrid
                  projects={visibleProjects}
                  title={activeView === 'favorites' ? 'Favorite Projects' : 'All Projects'}
                  emptyMessage={
                    activeView === 'favorites'
                      ? 'No starred projects yet'
                      : 'No projects found'
                  }
                  onToggleStar={handleToggleStar}
                  onEdit={openEditModal}
                  onDelete={(project) => {
                    setActiveProject(project);
                    setIsDeleteOpen(true);
                  }}
                  onOpen={(project) => {
                    if (project?._id) {
                      setActiveProjectId(project._id);
                      navigate(`/projects/${project._id}`);
                    }
                  }}
                />
              )}
            </div>
          </Col>
        </Row>
      </Container>

      <div className={`project-form-modal ${isModalOpen ? 'is-open' : ''}`}>
        <div className="project-form-backdrop" onClick={() => setIsModalOpen(false)} />
        <div className="project-form-sheet">
          <div className="project-form-header">
            <h4 className="project-form-title">{activeProject ? 'Edit Project' : 'New Project'}</h4>
            <button
              type="button"
              className="project-form-close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="project-form-body">
            <div className="project-form-grid project-form-grid-top">
              <FormGroup>
                <Label for="project-name-input">Project name</Label>
                <Input
                  id="project-name-input"
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a project name"
                  invalid={Boolean(formErrors.name)}
                />
                {formErrors.name ? <div className="project-form-error">{formErrors.name}</div> : null}
              </FormGroup>
              <FormGroup>
                <Label for="project-starred-input">Add to favourite</Label>
                <Input
                  id="project-starred-input"
                  type="select"
                  value={formState.isStarred ? 'yes' : 'no'}
                  onChange={(e) => setFormState((prev) => ({ ...prev, isStarred: e.target.value === 'yes' }))}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Input>
              </FormGroup>
            </div>
            <div className="project-form-grid">
              <FormGroup>
                <div className="project-form-label-row">
                  <Label for="project-category-input">Category</Label>
                  <span
                    className={`project-form-badge ${formState.category ? getCategoryBadgeClass(formState.category) : 'is-empty'}`.trim()}
                  >
                    {formState.category || 'Uncategorized'}
                  </span>
                </div>
                <BadgeSelect
                  id="project-category-input"
                  value={formState.category}
                  options={CATEGORY_OPTIONS}
                  placeholder="Select a category"
                  hasError={Boolean(formErrors.category)}
                  getBadgeClass={getCategoryBadgeClass}
                  onChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}
                />
                {formErrors.category ? <div className="project-form-error">{formErrors.category}</div> : null}
              </FormGroup>
              <FormGroup>
                <div className="project-form-label-row">
                  <Label for="project-status-input">Status</Label>
                  <span
                    className={`project-form-badge ${formState.status ? getStatusBadgeClass(formState.status) : 'is-empty'}`.trim()}
                  >
                    {formState.status || 'Unset'}
                  </span>
                </div>
                <BadgeSelect
                  id="project-status-input"
                  value={formState.status}
                  options={STATUS_OPTIONS}
                  placeholder="Select a status"
                  hasError={Boolean(formErrors.status)}
                  getBadgeClass={getStatusBadgeClass}
                  onChange={(value) => setFormState((prev) => ({ ...prev, status: value }))}
                />
                {formErrors.status ? <div className="project-form-error">{formErrors.status}</div> : null}
              </FormGroup>
            </div>
            <FormGroup>
              <Label for="project-description-input">Description</Label>
              <Input
                id="project-description-input"
                type="textarea"
                rows="6"
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </FormGroup>
          </div>
          <div className="project-form-footer">
            <Button color="light" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button color="primary" className="project-form-save" onClick={handleSaveProject} disabled={isSaving}>
              {isSaving ? (
                <span className="skeleton-line skeleton-inline" style={{ width: '44px', height: '12px' }} />
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={isDeleteOpen} toggle={() => setIsDeleteOpen(false)} centered>
        <ModalHeader toggle={() => setIsDeleteOpen(false)}>Delete Project</ModalHeader>
        <ModalBody>
          <p className="mb-0">
            Are you sure you want to delete{' '}
            <strong>{activeProject?.name || 'this project'}</strong>?
          </p>
          <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.875rem' }}>
            Analyses and reports will be unassigned from this project.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setIsDeleteOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDeleteProject} disabled={isSaving}>
            {isSaving ? (
              <span className="skeleton-line skeleton-inline" style={{ width: '52px', height: '12px' }} />
            ) : (
              'Delete'
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {activeProjectId ? (
        <ProjectDetail
          projectId={activeProjectId}
          onClose={() => {
            setActiveProjectId(null);
            navigate('/projects');
          }}
        />
      ) : null}
    </div>
  );
}

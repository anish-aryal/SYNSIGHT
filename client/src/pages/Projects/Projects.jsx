import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap';
import PageHeader from '../../components/PageHeader/PageHeader';
import ProjectStats from './components/ProjectStats';
import ProjectsGrid from './components/ProjectsGrid';
import projectService from '../../api/services/projectService';
import { useApp } from '../../api/context/AppContext';
import ProjectDetail from './ProjectDetail';
import './Projects.css';

export default function Projects() {
  const { showError, showSuccess } = useApp();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    category: '',
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

  const totalProjects = projects.length;
  const totalQueries = projects.reduce((sum, project) => sum + (project.analysisCount || 0), 0);
  const totalReports = projects.reduce((sum, project) => sum + (project.reportCount || 0), 0);
  const totalStarred = projects.filter((project) => project.isStarred).length;

  const statsData = [
    {
      id: 1,
      label: 'Total Projects',
      value: totalProjects,
      icon: 'folder',
      iconColor: '#3b82f6'
    },
    {
      id: 2,
      label: 'Total Queries',
      value: totalQueries,
      icon: 'chart',
      iconColor: '#8b5cf6'
    },
    {
      id: 3,
      label: 'Starred',
      value: totalStarred,
      icon: 'star',
      iconColor: '#f59e0b'
    },
    {
      id: 4,
      label: 'Reports',
      value: totalReports,
      icon: 'workspace',
      iconColor: '#10b981'
    }
  ];

  const openCreateModal = () => {
    setActiveProject(null);
    setFormState({ name: '', description: '', category: '', isStarred: false });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setActiveProject(project);
    setFormState({
      name: project?.name || '',
      description: project?.description || '',
      category: project?.category || '',
      isStarred: Boolean(project?.isStarred)
    });
    setIsModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!formState.name.trim()) {
      showError('Project name is required');
      return;
    }

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

  return (
    <div className="projects-page">
      <Container className="mt-5">
        <Row>
          <Col>
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
            <ProjectStats stats={statsData} />

            {isLoading ? (
              <div className="text-center py-5">
                <div className="skeleton-wrapper">
                  <div className="skeleton-line" style={{ width: '40%' }} />
                  <div className="skeleton-line" style={{ width: '85%' }} />
                  <div className="skeleton-line" style={{ width: '70%' }} />
                </div>
              </div>
            ) : listError ? (
              <div className="text-center py-5">
                <p className="text-danger mb-3">{listError}</p>
                <Button color="primary" onClick={fetchProjects}>
                  Try Again
                </Button>
              </div>
            ) : (
              <ProjectsGrid
                projects={filteredProjects}
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
          </Col>
        </Row>
      </Container>

      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(false)} centered>
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          {activeProject ? 'Edit Project' : 'New Project'}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="project-name-input">Project name</Label>
            <Input
              id="project-name-input"
              value={formState.name}
              onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter a project name"
            />
          </FormGroup>
          <FormGroup>
            <Label for="project-description-input">Description</Label>
            <Input
              id="project-description-input"
              type="textarea"
              rows="3"
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
            />
          </FormGroup>
          <FormGroup>
            <Label for="project-category-input">Category</Label>
            <Input
              id="project-category-input"
              value={formState.category}
              onChange={(e) => setFormState((prev) => ({ ...prev, category: e.target.value }))}
              placeholder="Marketing, Research, Product..."
            />
          </FormGroup>
          <FormGroup check>
            <Input
              id="project-starred-input"
              type="checkbox"
              checked={formState.isStarred}
              onChange={(e) => setFormState((prev) => ({ ...prev, isStarred: e.target.checked }))}
            />
            <Label for="project-starred-input" check>
              Star this project
            </Label>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleSaveProject} disabled={isSaving}>
            {isSaving ? (
              <span className="skeleton-line skeleton-inline" style={{ width: '44px', height: '12px' }} />
            ) : (
              'Save'
            )}
          </Button>
        </ModalFooter>
      </Modal>

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

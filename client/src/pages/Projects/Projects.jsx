import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PageHeader from '../../components/PageHeader/PageHeader';
import ProjectStats from './components/ProjectStats';
import ProjectsGrid from './components/ProjectsGrid';
import './Projects.css';

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState('');

  const statsData = [
    {
      id: 1,
      label: 'Total Projects',
      value: 4,
      icon: 'folder',
      iconColor: '#3b82f6'
    },
    {
      id: 2,
      label: 'Total Queries',
      value: 41,
      icon: 'chart',
      iconColor: '#8b5cf6'
    },
    {
      id: 3,
      label: 'Starred',
      value: 2,
      icon: 'star',
      iconColor: '#f59e0b'
    },
    {
      id: 4,
      label: 'Workspaces',
      value: 4,
      icon: 'workspace',
      iconColor: '#10b981'
    }
  ];

  const projectsData = [
    {
      id: 1,
      title: 'Brand Monitoring Q4',
      description: 'Quarterly brand sentiment tracking across all platforms',
      queries: 12,
      category: 'Marketing',
      lastUpdated: '2 hours ago',
      isStarred: true
    },
    {
      id: 2,
      title: 'Competitor Analysis',
      description: 'Nike vs Adidas sentiment comparison',
      queries: 8,
      category: 'Research',
      lastUpdated: '1 day ago',
      isStarred: false
    },
    {
      id: 3,
      title: 'Product Launch Campaign',
      description: 'Sentiment tracking for new product release',
      queries: 15,
      category: 'Product',
      lastUpdated: '3 days ago',
      isStarred: true
    },
    {
      id: 4,
      title: 'Customer Feedback Analysis',
      description: 'Monthly customer sentiment review',
      queries: 6,
      category: 'Customer Success',
      lastUpdated: '5 days ago',
      isStarred: false
    }
  ];

  const filteredProjects = projectsData.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleStar = (projectId) => {
    console.log('Toggle star for project:', projectId);
    // Add star toggle logic here
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
              onButtonClick={() => console.log('New project clicked')}
            />
            <ProjectStats stats={statsData} />
            
            <ProjectsGrid 
              projects={filteredProjects}
              onToggleStar={handleToggleStar}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
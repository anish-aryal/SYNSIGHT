import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Container, Row } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, BarChart3 } from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import StatsCard from './components/StatsCard';
import RecentProjects from './components/RecentProjects';
import QuickActions from './components/QuickActions';
import SystemStatus from './components/SystemStatus';
import projectService from '../../api/services/projectService';
import reportService from '../../api/services/reportService';
import { getChatStats } from '../../api/services/chatService';
import { useApp } from '../../api/context/AppContext';
import { useAuth } from '../../api/context/AuthContext';

// Dashboard page layout and interactions.

const isWithinDays = (value, days) => {
  if (!value) return false;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const diffMs = Date.now() - parsed.getTime();
  return diffMs <= days * 24 * 60 * 60 * 1000;
};

const formatDate = (value) => {
  if (!value) return 'No expiry';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'No expiry';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDaysUntil = (value) => {
  if (!value) return 'No expiry';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'No expiry';
  const diffMs = parsed.getTime() - Date.now();
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return `Ended ${formatDate(parsed)}`;
  if (days === 1) return 'Ends in 1 day';
  if (days < 30) return `Ends in ${days} days`;
  return `Renews ${formatDate(parsed)}`;
};

const getFirstName = (name) => {
  if (!name) return 'there';
  const trimmed = name.trim();
  if (!trimmed) return 'there';
  return trimmed.split(' ')[0];
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useApp();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [chatStats, setChatStats] = useState({ totalAnalyses: 0, recentAnalyses: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [projectsError, setProjectsError] = useState(null);
  const [reportsError, setReportsError] = useState(null);
  const [chatStatsError, setChatStatsError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async (showToast = false) => {
    setIsLoading(true);
    setFetchError(null);
    setProjectsError(null);
    setReportsError(null);
    setChatStatsError(null);

    const results = await Promise.allSettled([
      projectService.getProjects(),
      reportService.getReports(),
      getChatStats()
    ]);

    const errors = [];

    const [projectsResult, reportsResult, chatStatsResult] = results;

    if (projectsResult.status === 'fulfilled' && projectsResult.value?.success) {
      setProjects(Array.isArray(projectsResult.value.data) ? projectsResult.value.data : []);
    } else {
      const message = projectsResult?.reason?.message || projectsResult?.value?.message || 'Failed to load projects';
      setProjectsError(message);
      errors.push(message);
    }

    if (reportsResult.status === 'fulfilled' && reportsResult.value?.success) {
      setReports(Array.isArray(reportsResult.value.data) ? reportsResult.value.data : []);
    } else {
      const message = reportsResult?.reason?.message || reportsResult?.value?.message || 'Failed to load reports';
      setReportsError(message);
      errors.push(message);
    }

    if (chatStatsResult.status === 'fulfilled' && chatStatsResult.value?.success) {
      const data = chatStatsResult.value?.data || {};
      setChatStats({
        totalAnalyses: Number(data.totalAnalyses) || 0,
        recentAnalyses: Number(data.recentAnalyses) || 0
      });
    } else {
      const message = chatStatsResult?.reason?.message || chatStatsResult?.value?.message || 'Failed to load chat stats';
      setChatStatsError(message);
      setChatStats({ totalAnalyses: 0, recentAnalyses: 0 });
      errors.push(message);
    }

    if (errors.length > 0) {
      setFetchError(errors[0]);
      showError(errors[0]);
    } else if (showToast) {
      showSuccess('Dashboard refreshed');
    }

    setLastUpdated(new Date());
    setIsLoading(false);
  }, [showError, showSuccess]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const activeProjectsCount = useMemo(() => (
    projects.filter((project) => String(project?.status || 'active').toLowerCase() === 'active').length
  ), [projects]);

  const recentProjects = useMemo(() => projects.slice(0, 3), [projects]);

  const reportsCount = reports.length;

  const analysesCount = chatStats?.totalAnalyses || 0;

  const newProjectsCount = useMemo(
    () => projects.filter((project) => isWithinDays(project?.createdAt, 7)).length,
    [projects]
  );

  const newReportsCount = useMemo(
    () => reports.filter((report) => isWithinDays(report?.createdAt, 7)).length,
    [reports]
  );

  const newAnalysesCount = chatStats?.recentAnalyses || 0;

  const stats = useMemo(() => ([
    {
      icon: Folder,
      label: 'Active Projects',
      value: activeProjectsCount,
      change: `+${newProjectsCount}`,
      color: 'primary'
    },
    {
      icon: FileText,
      label: 'Reports Generated',
      value: reportsCount,
      change: `+${newReportsCount}`,
      color: 'purple'
    },
    {
      icon: BarChart3,
      label: 'Analyses',
      value: analysesCount,
      change: `+${newAnalysesCount}`,
      color: 'warning'
    }
  ]), [activeProjectsCount, analysesCount, newAnalysesCount, newProjectsCount, newReportsCount, reportsCount]);

  const statusItems = useMemo(() => {
    const subscription = user?.subscription || {};
    const usageLimit = Number.isFinite(subscription?.queriesLimit) ? subscription.queriesLimit : null;
    const usageUsed = Number.isFinite(subscription?.queriesUsed) ? subscription.queriesUsed : 0;
    const usageLabel = usageLimit ? `${usageUsed} / ${usageLimit}` : `${usageUsed}`;
    const planLabel = subscription?.plan ? subscription.plan.toUpperCase() : 'FREE';
    const planExpiry = subscription?.validUntil ? formatDaysUntil(subscription.validUntil) : 'No expiry';
    const refreshLabel = lastUpdated
      ? `Updated ${lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
      : 'Updating...';
    const errorCount = [projectsError, reportsError, chatStatsError].filter(Boolean).length;
    const hasIssues = errorCount > 0;

    return [
      {
        label: 'API Status',
        value: hasIssues ? 'Degraded' : 'Operational',
        status: hasIssues ? 'warning' : 'success'
      },
      {
        label: 'Data Processing',
        value: isLoading ? 'Syncing' : hasIssues ? `Issues (${errorCount})` : 'Normal',
        status: hasIssues ? 'warning' : 'normal'
      },
      {
        label: 'Usage',
        value: usageLabel,
        status: 'normal'
      },
      {
        label: 'Plan',
        value: `${planLabel} · ${planExpiry}`,
        status: 'normal'
      },
      {
        label: 'Last refresh',
        value: refreshLabel,
        status: 'normal'
      }
    ];
  }, [chatStatsError, isLoading, lastUpdated, projectsError, reportsError, user?.subscription]);

  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'new-project':
        navigate('/projects', { state: { openCreate: true } });
        break;
      case 'generate-report':
        navigate('/chat');
        break;
      case 'refresh-dashboard':
        fetchDashboard(true);
        break;
      case 'explore-trends':
        navigate('/explore');
        break;
      default:
        break;
    }
  };

  // Layout and appearance
  return (
    <div className="syn-page dashboard-page">
      <Container className="syn-page-container">
        <Row className="mb-4">
          <Col>
            <div className="syn-page-hero">
              <PageHeader
                title={`Hi ${getFirstName(user?.fullName)}`}
                subtitle="Here is how your sentiment analysis is going"
                customActions={
                  <Button color="link" className="dashboard-refresh-btn" onClick={() => fetchDashboard(true)}>
                    Refresh
                  </Button>
                }
              />
            </div>
          </Col>
        </Row>

        {fetchError && !isLoading ? (
          <Row className="mb-4">
            <Col>
              <Alert color="danger" className="mb-0 d-flex justify-content-between align-items-center">
                <span>{fetchError}</span>
                <Button color="link" className="text-white" onClick={() => fetchDashboard(true)}>
                  Retry
                </Button>
              </Alert>
            </Col>
          </Row>
        ) : null}

        <Row className="mb-4">
          {stats.map((stat, idx) => (
            <Col key={idx} xs={12} sm={6} lg={3} className="mb-3">
              <StatsCard {...stat} isLoading={isLoading} />
            </Col>
          ))}
        </Row>

        <Row className="mb-4">
          <Col xs={12}>
            <RecentProjects
              projects={recentProjects}
              isLoading={isLoading}
              error={projectsError}
              onRetry={() => fetchDashboard(true)}
              onViewAll={() => navigate('/projects')}
              onOpen={(project) => {
                const projectId = project?._id || project?.id;
                if (projectId) navigate(`/projects/${projectId}`);
              }}
            />
          </Col>
        </Row>

        <Row className="mb-4">
          <Col xs={12} lg={8} className="mb-3 mb-lg-0">
            <QuickActions onAction={handleQuickAction} />
          </Col>
          <Col xs={12} lg={4} className="mb-3 mb-lg-0">
            <SystemStatus items={statusItems} isLoading={isLoading} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

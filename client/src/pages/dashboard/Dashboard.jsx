import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Container, Row } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { Folder, FileText, AlertCircle } from 'lucide-react';
import StatsCard from './components/StatsCard';
import RecentProjects from './components/RecentProjects';
import QuickActions from './components/QuickActions';
import SystemStatus from './components/SystemStatus';
import projectService from '../../api/services/projectService';
import reportService from '../../api/services/reportService';
import { getAnalysisHistory, getAnalysisStatistics } from '../../api/services/analysisService';
import { useApp } from '../../api/context/AppContext';
import { useAuth } from '../../api/context/AuthContext';

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
  const [analysisStats, setAnalysisStats] = useState({ positive: 0, neutral: 0, negative: 0 });
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [projectsError, setProjectsError] = useState(null);
  const [reportsError, setReportsError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async (showToast = false) => {
    setIsLoading(true);
    setFetchError(null);
    setProjectsError(null);
    setReportsError(null);
    setStatsError(null);
    setHistoryError(null);

    const results = await Promise.allSettled([
      projectService.getProjects(),
      reportService.getReports(),
      getAnalysisStatistics(),
      getAnalysisHistory()
    ]);

    const errors = [];

    const [projectsResult, reportsResult, statsResult, historyResult] = results;

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

    if (statsResult.status === 'fulfilled' && statsResult.value?.success) {
      setAnalysisStats(statsResult.value.data || { positive: 0, neutral: 0, negative: 0 });
    } else {
      const message = statsResult?.reason?.message || statsResult?.value?.message || 'Failed to load sentiment stats';
      setStatsError(message);
      setAnalysisStats({ positive: 0, neutral: 0, negative: 0 });
      errors.push(message);
    }

    if (historyResult.status === 'fulfilled' && historyResult.value?.success) {
      setAnalysisHistory(Array.isArray(historyResult.value.data) ? historyResult.value.data : []);
    } else {
      const message = historyResult?.reason?.message || historyResult?.value?.message || 'Failed to load analysis history';
      setHistoryError(message);
      setAnalysisHistory([]);
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

  const alertsCount = analysisStats?.negative || 0;

  const newProjectsCount = useMemo(
    () => projects.filter((project) => isWithinDays(project?.createdAt, 7)).length,
    [projects]
  );

  const newReportsCount = useMemo(
    () => reports.filter((report) => isWithinDays(report?.createdAt, 7)).length,
    [reports]
  );

  const newAlertsCount = useMemo(
    () => analysisHistory.filter((analysis) => {
      const createdAt = analysis?.createdAt;
      const sentiment = analysis?.sentiment?.overall;
      return isWithinDays(createdAt, 7) && String(sentiment || '').toLowerCase() === 'negative';
    }).length,
    [analysisHistory]
  );

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
      icon: AlertCircle,
      label: 'Alerts',
      value: alertsCount,
      change: `+${newAlertsCount}`,
      color: 'warning'
    }
  ]), [activeProjectsCount, alertsCount, newAlertsCount, newProjectsCount, newReportsCount, reportsCount]);

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
    const errorCount = [projectsError, reportsError, statsError, historyError].filter(Boolean).length;
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
  }, [historyError, isLoading, lastUpdated, projectsError, reportsError, statsError, user?.subscription]);

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

  return (
    <div className="dashboard-page">
      <Container className="mt-5">
        <Row className="mb-4">
          <Col className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h2 className="dashboard-title mb-1">Hi 👋 {getFirstName(user?.fullName)}</h2>
              <p className="text-muted">Here is how your sentiment analysis is going</p>
            </div>
            <Button color="link" className="dashboard-refresh-btn" onClick={() => fetchDashboard(true)}>
              Refresh
            </Button>
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

        <Row>
          <Col xs={12} lg={8} className="mb-3 mb-lg-0">
            <QuickActions onAction={handleQuickAction} />
          </Col>
          <Col xs={12} lg={4}>
            <SystemStatus items={statusItems} isLoading={isLoading} />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import {
  Star,
  Share2,
  Download,
  PencilLine,
  Eye,
  Trash2,
  Search,
  X,
  MessageCircle,
  ThumbsUp,
  Globe,
  TrendingUp,
  Hash,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../api/context/AppContext';
import * as chatService from '../../api/services/chatService';
import projectService from '../../api/services/projectService';
import * as analysisService from '../../api/services/analysisService';
import reportService from '../../api/services/reportService';
import ReportDetailPanel from './ReportDetail';
import AnalysisDetailPanel from './AnalysisDetail';
import ProjectBreadcrumbs from '../../components/projects/ProjectBreadcrumbs';
import HeaderComments from '../../components/projects/HeaderComments';
import BadgeSelect, { CATEGORY_OPTIONS, STATUS_OPTIONS, getCategoryBadgeClass, getStatusBadgeClass, toBadgeSlug } from '../../components/projects/BadgeSelect';

const formatDate = (value) => {
  if (!value) return 'Unknown date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown date';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatRelativeTime = (value) => {
  if (!value) return 'Recently';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return formatDate(value);
  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 60000) return 'Just now';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  return formatDate(value);
};

const getSentimentColor = (sentiment) => {
  if (sentiment === 'positive') return '#10b981';
  if (sentiment === 'neutral') return '#D08700';
  if (sentiment === 'negative') return '#ef4444';
  return '#6b7280';
};

const getSentimentTint = (sentiment) => {
  if (sentiment === 'positive') return 'rgba(16, 185, 129, 0.12)';
  if (sentiment === 'neutral') return 'rgba(208, 135, 0, 0.14)';
  if (sentiment === 'negative') return 'rgba(239, 68, 68, 0.12)';
  return 'rgba(107, 114, 128, 0.12)';
};

const normalizeSentiment = (value) => (value ? value.toLowerCase() : null);

const getDominantSentiment = (overall, distribution = {}, percentages = {}) => {
  const dist = {
    positive: Number(distribution?.positive) || 0,
    neutral: Number(distribution?.neutral) || 0,
    negative: Number(distribution?.negative) || 0
  };
  const hasDist = dist.positive || dist.neutral || dist.negative;
  if (hasDist) {
    if (dist.positive >= dist.neutral && dist.positive >= dist.negative) return 'positive';
    if (dist.negative >= dist.positive && dist.negative >= dist.neutral) return 'negative';
    return 'neutral';
  }
  const pct = {
    positive: Number(percentages?.positive) || 0,
    neutral: Number(percentages?.neutral) || 0,
    negative: Number(percentages?.negative) || 0
  };
  const hasPct = pct.positive || pct.neutral || pct.negative;
  if (hasPct) {
    if (pct.positive >= pct.neutral && pct.positive >= pct.negative) return 'positive';
    if (pct.negative >= pct.positive && pct.negative >= pct.neutral) return 'negative';
    return 'neutral';
  }
  return normalizeSentiment(overall);
};

const formatSourceLabel = (value) => {
  if (!value) return 'Unknown';
  return value
    .split('-')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
};

const formatStatusLabel = (value) => {
  if (!value) return '';
  return String(value)
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function ProjectDetail({ projectId, onClose }) {
  const { showError, showSuccess } = useApp();
  const navigate = useNavigate();
  const closeTimerRef = useRef(null);

  const [project, setProject] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('analyses');
  const [isLoading, setIsLoading] = useState(true);
  const [removingAnalysisId, setRemovingAnalysisId] = useState(null);
  const [removingReportId, setRemovingReportId] = useState(null);
  const [activeReportId, setActiveReportId] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAnalysisId, setActiveAnalysisId] = useState(null);
  const [redirectingAnalysisId, setRedirectingAnalysisId] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    category: '',
    status: 'Active',
    isStarred: false
  });

  const totalPosts = useMemo(
    () => analyses.reduce((sum, item) => sum + (Number(item.totalAnalyzed) || 0), 0),
    [analyses]
  );

  const platformCount = useMemo(() => {
    const sources = new Set(analyses.map((item) => item?.source).filter(Boolean));
    return sources.size;
  }, [analyses]);

  const avgSentimentScore = useMemo(() => {
    if (!analyses.length) return 0;
    let weightedTotal = 0;
    let totalPostsCount = 0;

    analyses.forEach((analysis) => {
      const total = Number(analysis?.totalAnalyzed) || 0;
      if (!total) return;
      const percentages = analysis?.sentiment?.percentages || {};
      const distribution = analysis?.sentiment?.distribution || {};
      let positivePct = Number(percentages?.positive);

      if (!Number.isFinite(positivePct)) {
        const distTotal = (distribution?.positive || 0) + (distribution?.neutral || 0) + (distribution?.negative || 0);
        positivePct = distTotal ? Math.round((distribution.positive / distTotal) * 100) : 0;
      }

      weightedTotal += positivePct * total;
      totalPostsCount += total;
    });

    if (!totalPostsCount) return 0;
    return Math.round(weightedTotal / totalPostsCount);
  }, [analyses]);

  const projectChips = useMemo(() => {
    if (!project) return [];
    return [
      project.category || 'General',
      `${platformCount} platforms`,
      `${totalPosts} posts`,
      `${reports.length} reports`
    ];
  }, [project, platformCount, totalPosts, reports.length]);

  const ownerLabel = useMemo(() => {
    if (!project) return 'Unknown owner';
    if (typeof project.owner === 'string') return project.owner || 'Unknown owner';
    return (
      project.owner?.name ||
      project.owner?.fullName ||
      project.owner?.email ||
      'Unknown owner'
    );
  }, [project]);

  const recentReports = useMemo(() => reports.slice(0, 3), [reports]);

  const sentimentProgress = analyses.length ? Math.min(100, Math.max(0, avgSentimentScore)) : 12;
  const sentimentLabel = analyses.length
    ? `${avgSentimentScore}% of analyzed posts are positive`
    : 'Run an analysis to surface sentiment insights.';

  useEffect(() => {
    const timer = setTimeout(() => setIsPanelOpen(true), 10);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  const loadProject = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [projectRes, analysesRes, reportsRes] = await Promise.all([
        projectService.getProjectById(projectId),
        projectService.getProjectAnalyses(projectId),
        projectService.getProjectReports(projectId)
      ]);

      if (!projectRes?.success) {
        throw new Error(projectRes?.message || 'Failed to load project');
      }

      setProject(projectRes.data);
      setAnalyses(Array.isArray(analysesRes?.data) ? analysesRes.data : []);
      setReports(Array.isArray(reportsRes?.data) ? reportsRes.data : []);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load project';
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);


  const handleClose = () => {
    if (closeTimerRef.current) return;
    setIsPanelOpen(false);
    closeTimerRef.current = setTimeout(() => {
      onClose?.();
    }, 220);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    setSearchQuery('');
  };

  const handleToggleStar = async () => {
    if (!project?._id) return;
    try {
      const response = await projectService.updateProject(project._id, {
        isStarred: !project.isStarred
      });
      if (response?.success) {
        setProject(response.data);
      } else {
        throw new Error(response?.message || 'Failed to update project');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update project';
      showError(message);
    }
  };

  const handleRemoveAnalysis = async (analysisId) => {
    if (!analysisId) return;
    setRemovingAnalysisId(analysisId);
    try {
      const response = await analysisService.updateAnalysisProject(analysisId, null);
      if (response?.success) {
        setAnalyses((prev) => prev.filter((item) => item._id !== analysisId));
        setProject((prev) => ({
          ...prev,
          analysisCount: Math.max(0, (prev?.analysisCount ?? analyses.length) - 1)
        }));
        showSuccess('Analysis removed from project');
      } else {
        throw new Error(response?.message || 'Failed to update analysis');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update analysis';
      showError(message);
    } finally {
      setRemovingAnalysisId(null);
    }
  };

  const handleRemoveReport = async (reportId) => {
    if (!reportId) return;
    setRemovingReportId(reportId);
    try {
      const response = await reportService.updateReportProject(reportId, null);
      if (response?.success) {
        setReports((prev) => prev.filter((item) => item._id !== reportId));
        setProject((prev) => ({
          ...prev,
          reportCount: Math.max(0, (prev?.reportCount ?? reports.length) - 1)
        }));
        showSuccess('Report removed from project');
      } else {
        throw new Error(response?.message || 'Failed to update report');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update report';
      showError(message);
    } finally {
      setRemovingReportId(null);
    }
  };

  const handleViewReport = (reportId) => {
    if (!reportId) return;
    setActiveAnalysisId(null);
    setActiveReportId(reportId);
    setActiveTab('reports');
  };

  const handleViewAnalysis = (analysisId) => {
    if (!analysisId) return;
    setActiveReportId(null);
    setActiveAnalysisId(analysisId);
  };

  const handleCloseReport = () => {
    setActiveReportId(null);
  };

  const handleGoToChat = async (analysisId) => {
    if (!analysisId) return;
    setRedirectingAnalysisId(analysisId);
    try {
      const response = await chatService.getChatByAnalysisId(analysisId);
      const chatId = response?.data?._id;
      if (!response?.success || !chatId) {
        throw new Error(response?.message || 'Chat not found for this analysis');
      }
      navigate(`/chat/${chatId}`);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to open chat';
      showError(message);
    } finally {
      setRedirectingAnalysisId(null);
    }
  };

  const handleCloseAnalysis = () => {
    setActiveAnalysisId(null);
  };

  const handleDownloadReport = async (report) => {
    if (!report?._id) return;
    try {
      const response = await reportService.downloadReportPdf(report._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentiment-report-${(report.query || 'analysis').replace(/\\s+/g, '-')}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Report downloaded');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to download report';
      showError(message);
    }
  };

  const filteredAnalyses = useMemo(() => {
    if (!searchQuery.trim()) return analyses;
    const query = searchQuery.toLowerCase();
    return analyses.filter((analysis) => {
      const name = (analysis?.query || '').toLowerCase();
      const source = (analysis?.source || '').toLowerCase();
      return name.includes(query) || source.includes(query);
    });
  }, [analyses, searchQuery]);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const query = searchQuery.toLowerCase();
    return reports.filter((report) => {
      const name = (report?.query || report?.title || '').toLowerCase();
      return name.includes(query);
    });
  }, [reports, searchQuery]);

  const isDetailView = Boolean(activeAnalysisId || activeReportId);
  const isStarred = Boolean(project?.isStarred);

  const openEditModal = () => {
    if (!project) return;
    const normalizedCategory = typeof project?.category === 'string' ? project.category.trim().toLowerCase() : '';
    const normalizedStatus = typeof project?.status === 'string' ? project.status.trim().toLowerCase() : '';
    const nextCategory = CATEGORY_OPTIONS.find((option) => option.toLowerCase() === normalizedCategory) || '';
    const nextStatus = STATUS_OPTIONS.find((option) => option.toLowerCase() === normalizedStatus) || STATUS_OPTIONS[0];
    setFormState({
      name: project?.name || '',
      description: project?.description || '',
      category: nextCategory,
      status: nextStatus,
      isStarred: Boolean(project?.isStarred)
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleSaveProject = async () => {
    if (!project?._id) return;
    const nextErrors = {};
    if (!formState.name.trim()) nextErrors.name = 'Project name is required.';
    if (!formState.category || !CATEGORY_OPTIONS.some((option) => option.toLowerCase() === formState.category.toLowerCase())) {
      nextErrors.category = 'Please select a valid category.';
    }
    if (!formState.status || !STATUS_OPTIONS.some((option) => option.toLowerCase() === formState.status.toLowerCase())) {
      nextErrors.status = 'Please select a valid status.';
    }
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      const response = await projectService.updateProject(project._id, formState);
      if (response?.success) {
        setProject(response.data);
        showSuccess('Project updated');
        setIsEditOpen(false);
      } else {
        throw new Error(response?.message || 'Failed to update project');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update project';
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareProject = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess('Project link copied');
    } catch (err) {
      showError('Unable to copy link');
    }
  };

  return (
    <div className={`project-detail-modal ${isPanelOpen ? 'is-open' : ''}`}>
      <div className="project-detail-backdrop" onClick={handleClose} />
      <div className={`project-detail-sheet ${isDetailView ? 'is-analysis' : ''}`}>
        {isLoading ? (
          <div className="project-detail-loading">
            <div className="skeleton-wrapper">
              <div className="skeleton-line" style={{ width: '40%' }} />
              <div className="skeleton-line" style={{ width: '80%' }} />
              <div className="skeleton-line" style={{ width: '60%' }} />
            </div>
          </div>
        ) : !project ? (
          <div className="project-detail-loading">
            <p className="text-muted">Project not found.</p>
            <Button color="primary" onClick={handleClose}>
              Back to Projects
            </Button>
          </div>
        ) : (
          <>
            {!activeAnalysisId && !activeReportId && (
              <>
                <ProjectBreadcrumbs
                  onBack={handleClose}
                  projectName={project?.name}
                  className="project-detail-breadcrumbs-wrap"
                />
                <div className="project-detail-hero">
                  <div className="project-detail-hero-inner">
                    <div className="project-detail-hero-top">
                      <div className="project-detail-hero-actions">
                        <button
                          type="button"
                          className={`project-detail-icon-btn project-detail-star-btn ${isStarred ? 'is-starred' : ''}`}
                          onClick={handleToggleStar}
                          aria-label={isStarred ? 'Remove from favourites' : 'Add to favourites'}
                          aria-pressed={isStarred}
                        >
                          <Star size={18} fill={isStarred ? '#f59e0b' : 'none'} color={isStarred ? '#f59e0b' : 'currentColor'} />
                          <span className="project-detail-star-label">
                            {isStarred ? 'Remove from favourite' : 'Add to favourite'}
                          </span>
                        </button>
                        <button type="button" className="project-detail-ghost-btn" onClick={openEditModal}>
                          <PencilLine size={16} />
                          Edit
                        </button>
                        <button type="button" className="project-detail-cta-btn" onClick={handleShareProject}>
                          <Share2 size={16} />
                          Share
                        </button>
                      </div>
                    </div>

                    <div className="project-detail-hero-title">
                      <h1>{project.name || 'Untitled project'}</h1>
                      {project.status ? (
                        <span className={`project-detail-status status-${toBadgeSlug(project.status)}`}>
                          {formatStatusLabel(project.status)}
                        </span>
                      ) : null}
                    </div>

                    <div className="project-detail-hero-stats">
                      <div className="project-detail-hero-card">
                        <div className="hero-card-top">
                          <BarChart3 size={24} color="#f97316" />
                          <TrendingUp size={18} className="hero-card-trend" />
                        </div>
                        <div className="stat-value">{project?.analysisCount ?? analyses.length}</div>
                        <div className="stat-label">Total Analyses</div>
                      </div>
                      <div className="project-detail-hero-card">
                        <div className="hero-card-top">
                          <MessageCircle size={20} />
                        </div>
                        <div className="stat-value">{totalPosts}</div>
                        <div className="stat-label">Total Posts</div>
                      </div>
                      <div className="project-detail-hero-card">
                        <div className="hero-card-top">
                          <ThumbsUp size={20} />
                          <TrendingUp size={18} className="hero-card-trend" />
                        </div>
                        <div className="stat-value">{avgSentimentScore}%</div>
                        <div className="stat-label">Avg Sentiment</div>
                      </div>
                      <div className="project-detail-hero-card">
                        <div className="hero-card-top">
                          <Globe size={20} />
                        </div>
                        <div className="stat-value">{platformCount}</div>
                        <div className="stat-label">Platforms</div>
                      </div>
                    </div>
                    <div className="header-comments-row project-detail-comments-row">
                      <HeaderComments
                        entityType="project"
                        entityId={project?._id}
                        initialComments={project?.comments}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className={`project-detail-body ${isDetailView ? 'is-analysis' : ''}`}>
              {activeAnalysisId ? (
                <AnalysisDetailPanel
                  analysisId={activeAnalysisId}
                  projectId={projectId}
                  onBack={handleCloseAnalysis}
                  onRequestCloseProjectDetail={handleClose}
                />
              ) : activeReportId ? (
                <ReportDetailPanel
                  reportId={activeReportId}
                  projectName={project?.name}
                  onBack={handleCloseReport}
                  onRequestCloseProjectDetail={handleClose}
                  onDownload={handleDownloadReport}
                />
              ) : (
                <div className="project-detail-panel-grid">
                  <aside className="project-detail-aside">
                    <div className="project-detail-aside-card">
                      <div className="project-detail-aside-header">
                        <span className="project-detail-aside-heading">Project snapshot</span>
                      </div>
                      <p className="project-detail-aside-description">
                        {project.description || 'No description provided yet.'}
                      </p>
                      <div className="project-detail-aside-meta">
                        <div className="project-detail-aside-meta-line">
                          <span>Created</span>
                          <strong>{formatDate(project.createdAt)}</strong>
                        </div>
                        <div className="project-detail-aside-meta-line">
                          <span>Last activity</span>
                          <strong>
                            {formatRelativeTime(project.lastActivityAt || project.updatedAt || project.createdAt)}
                          </strong>
                        </div>
                        <div className="project-detail-aside-meta-line">
                          <span>Owner</span>
                          <strong>{ownerLabel}</strong>
                        </div>
                      </div>
                      <div className="project-detail-aside-progress">
                        <div className="project-detail-progress-label">Community pulse</div>
                        <div className="project-detail-progress-track">
                          <div
                            className="project-detail-progress-fill"
                            style={{ width: `${sentimentProgress}%` }}
                          />
                        </div>
                        <p className="project-detail-progress-note">{sentimentLabel}</p>
                      </div>
                      <div className="project-detail-aside-chips">
                        {projectChips.map((chip, index) => (
                          <span key={`${chip}-${index}`} className="project-detail-chip">
                            {chip}
                          </span>
                        ))}
                      </div>
                      <div className="project-detail-aside-list">
                        <div className="project-detail-aside-list-title">Recent reports</div>
                        {recentReports.length ? (
                          recentReports.map((report) => (
                            <div key={report._id} className="project-detail-aside-list-item">
                              <span>{report.query || report.title || 'Unnamed report'}</span>
                              <small>{formatDate(report.createdAt)}</small>
                            </div>
                          ))
                        ) : (
                          <div className="project-detail-aside-list-item muted">
                            Export a report to keep this space updated.
                          </div>
                        )}
                      </div>
                    </div>
                  </aside>

                  <div className="project-detail-main-column">
                    <div className="project-detail-tab-row">
                      <div className="syn-pill-toggle">
                        <Nav className="syn-pill-toggle-nav">
                          <NavItem>
                            <NavLink
                              className={`syn-pill-toggle-btn ${activeTab === 'analyses' ? 'is-active' : ''}`}
                              onClick={() => setActiveTab('analyses')}
                            >
                              <span>Analyses</span>
                              <span className="syn-pill-toggle-count">{analyses.length}</span>
                            </NavLink>
                          </NavItem>
                          <NavItem>
                            <NavLink
                              className={`syn-pill-toggle-btn ${activeTab === 'reports' ? 'is-active' : ''}`}
                              onClick={() => setActiveTab('reports')}
                            >
                              <span>Reports</span>
                              <span className="syn-pill-toggle-count">{reports.length}</span>
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </div>

                      <div className="project-detail-search-inline-wrap">
                        <div className={`project-detail-search-inline ${isSearchOpen ? 'open' : ''}`}>
                          <Search size={16} className="project-detail-search-icon" />
                          <input
                            type="text"
                            placeholder={`Search ${activeTab === 'analyses' ? 'analyses' : 'reports'}...`}
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="project-detail-tab-search"
                          onClick={toggleSearch}
                          aria-label="Search"
                        >
                          {isSearchOpen ? (
                            <X size={18} className="project-detail-search-icon" />
                          ) : (
                            <Search size={18} className="project-detail-search-icon" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="project-detail-list mt-3">
                      {activeTab === 'analyses' && (
                        <Card className="project-detail-card">
                          <CardBody>
                            {filteredAnalyses.length === 0 ? (
                              <div className="text-center py-4 text-muted">
                                {searchQuery ? 'No matching analyses found.' : 'No analyses have been assigned yet.'}
                              </div>
                            ) : (
                              <div className="project-items">
                                {filteredAnalyses.map((analysis) => {
                                  const distribution = analysis?.sentiment?.distribution || {};
                                  const sentiment = getDominantSentiment(
                                    analysis?.sentiment?.overall,
                                    distribution,
                                    analysis?.sentiment?.percentages
                                  );
                                  const positiveCount = Number(distribution?.positive) || 0;
                                  const neutralCount = Number(distribution?.neutral) || 0;
                                  const negativeCount = Number(distribution?.negative) || 0;
                                  const sentimentColor = getSentimentColor(sentiment);
                                  return (
                                    <div
                                      key={analysis._id}
                                      className="analysis-card analysis-card-clickable"
                                      onClick={() => handleViewAnalysis(analysis._id)}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                          event.preventDefault();
                                          handleViewAnalysis(analysis._id);
                                        }
                                      }}
                                    >
                                      <div className="analysis-card-header">
                                        <div className="analysis-card-left">
                                          <div className="analysis-card-icon analysis-card-icon--amber">
                                            <BarChart3 size={22} color="#f97316" />
                                          </div>
                                          <div className="analysis-card-main">
                                            <div className="analysis-card-title">{analysis.query || 'Untitled analysis'}</div>
                                            <div className="analysis-card-meta">
                                              <span className="analysis-card-source">
                                                {formatSourceLabel(analysis.source)}
                                              </span>
                                              <span>•</span>
                                              <span>{analysis.totalAnalyzed || 0} posts</span>
                                              <span>•</span>
                                              <span>{formatDate(analysis.createdAt)}</span>
                                            </div>
                                            <div className="analysis-card-counts">
                                              <span className="analysis-card-count positive">+ {positiveCount}</span>
                                              <span className="analysis-card-count neutral">~ {neutralCount}</span>
                                              <span className="analysis-card-count negative">- {negativeCount}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="analysis-card-actions">
                                          <span
                                            className="analysis-card-sentiment"
                                            style={{
                                              color: sentimentColor,
                                              borderColor: sentimentColor,
                                              background: getSentimentTint(sentiment)
                                            }}
                                          >
                                            {sentiment ? sentiment[0].toUpperCase() + sentiment.slice(1) : 'Unknown'}
                                          </span>
                                          <Button
                                            color="primary"
                                            className="analysis-card-view-btn"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              handleGoToChat(analysis._id);
                                            }}
                                            disabled={redirectingAnalysisId === analysis._id}
                                          >
                                            {redirectingAnalysisId === analysis._id ? 'Opening...' : 'Go to chat'}
                                          </Button>
                                          <Button
                                            color="light"
                                            className="border analysis-card-icon-btn"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              handleRemoveAnalysis(analysis._id);
                                            }}
                                            disabled={removingAnalysisId === analysis._id}
                                          >
                                            {removingAnalysisId === analysis._id ? (
                                              <span className="skeleton-line skeleton-inline" style={{ width: '16px', height: '16px' }} />
                                            ) : (
                                              <Trash2 size={16} />
                                            )}
                                          </Button>
                                        </div>
                                      </div>

                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      )}

                      {activeTab === 'reports' && (
                        <Card className="project-detail-card">
                          <CardBody>
                            {filteredReports.length === 0 ? (
                              <div className="text-center py-4 text-muted">
                                {searchQuery ? 'No matching reports found.' : 'No reports have been assigned yet.'}
                              </div>
                            ) : (
                              <div className="project-items">
                                {filteredReports.map((report) => {
                                  const sentiment = normalizeSentiment(report?.sentiment?.overall);
                                  const sentimentColor = getSentimentColor(sentiment);
                                  return (
                                    <div key={report._id} className="project-item">
                                      <div className="project-item-main">
                                        <div className="project-item-title">{report.query || 'Untitled report'}</div>
                                        <div className="project-item-meta">
                                          <span>{report.totalAnalyzed || 0} posts</span>
                                          <span>•</span>
                                          <span>{formatDate(report.createdAt)}</span>
                                        </div>
                                      </div>
                                      <div className="project-item-actions">
                                        <span
                                          className="sentiment-pill"
                                          style={{
                                            color: sentimentColor,
                                            borderColor: sentimentColor,
                                            background: getSentimentTint(sentiment)
                                          }}
                                        >
                                          {sentiment ? sentiment[0].toUpperCase() + sentiment.slice(1) : 'Unknown'}
                                        </span>
                                        <Button color="light" className="border" onClick={() => handleViewReport(report._id)}>
                                          <Eye size={16} />
                                        </Button>
                                        <Button color="light" className="border" onClick={() => handleDownloadReport(report)}>
                                          <Download size={16} />
                                        </Button>
                                        <Button
                                          color="light"
                                          className="border"
                                          onClick={() => handleRemoveReport(report._id)}
                                          disabled={removingReportId === report._id}
                                        >
                                          {removingReportId === report._id ? (
                                            <span className="skeleton-line skeleton-inline" style={{ width: '16px', height: '16px' }} />
                                          ) : (
                                            <Trash2 size={16} />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </CardBody>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className={`project-form-modal ${isEditOpen ? 'is-open' : ''}`}>
        <div className="project-form-backdrop" onClick={() => setIsEditOpen(false)} />
        <div className="project-form-sheet">
          <div className="project-form-header">
            <h4 className="project-form-title">Edit Project</h4>
            <button
              type="button"
              className="project-form-close"
              onClick={() => setIsEditOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="project-form-body">
            <div className="project-form-grid project-form-grid-top">
              <FormGroup>
                <Label for="project-detail-name-input">Project name</Label>
                <Input
                  id="project-detail-name-input"
                  value={formState.name}
                  onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a project name"
                  invalid={Boolean(formErrors.name)}
                />
                {formErrors.name ? <div className="project-form-error">{formErrors.name}</div> : null}
              </FormGroup>
              <FormGroup>
                <Label for="project-detail-starred-input">Add to favourite</Label>
                <Input
                  id="project-detail-starred-input"
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
                  <Label for="project-detail-category-input">Category</Label>
                  <span
                    className={`project-form-badge ${formState.category ? getCategoryBadgeClass(formState.category) : 'is-empty'}`.trim()}
                  >
                    {formState.category || 'Uncategorized'}
                  </span>
                </div>
                <BadgeSelect
                  id="project-detail-category-input"
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
                  <Label for="project-detail-status-input">Status</Label>
                  <span
                    className={`project-form-badge ${formState.status ? getStatusBadgeClass(formState.status) : 'is-empty'}`.trim()}
                  >
                    {formState.status || 'Unset'}
                  </span>
                </div>
                <BadgeSelect
                  id="project-detail-status-input"
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
              <Label for="project-detail-description-input">Description</Label>
              <Input
                id="project-detail-description-input"
                type="textarea"
                rows="6"
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
              />
            </FormGroup>
          </div>
          <div className="project-form-footer">
            <Button color="light" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
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
    </div>
  );
}

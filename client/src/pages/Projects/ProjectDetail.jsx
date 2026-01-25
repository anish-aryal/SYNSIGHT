import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import {
  ArrowLeft,
  Star,
  Share2,
  Download,
  Eye,
  Trash2,
  MessageSquare,
  Search,
  X,
  BarChart2,
  MessageCircle,
  ThumbsUp,
  Globe,
  TrendingUp,
  Hash,
  Calendar,
  Clock
} from 'lucide-react';
import { useApp } from '../../api/context/AppContext';
import projectService from '../../api/services/projectService';
import * as analysisService from '../../api/services/analysisService';
import reportService from '../../api/services/reportService';
import ReportModal from '../Chat/components/ReportModal';
import AnalysisDetailPanel from './AnalysisDetail';

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

export default function ProjectDetail({ projectId, onClose }) {
  const { showError, showSuccess } = useApp();
  const closeTimerRef = useRef(null);

  const [project, setProject] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('analyses');
  const [isLoading, setIsLoading] = useState(true);
  const [removingAnalysisId, setRemovingAnalysisId] = useState(null);
  const [removingReportId, setRemovingReportId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAnalysisId, setActiveAnalysisId] = useState(null);

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

  const handleViewReport = async (reportId) => {
    if (!reportId) return;
    setIsReportModalOpen(true);
    setIsReportLoading(true);
    setActiveReport(null);
    setReportError(null);
    try {
      const response = await reportService.getReportById(reportId);
      if (response?.success) {
        setActiveReport(response.data);
      } else {
        throw new Error(response?.message || 'Failed to load report');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load report';
      setReportError(message);
      showError(message);
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleViewAnalysis = (analysisId) => {
    if (!analysisId) return;
    setActiveAnalysisId(analysisId);
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

  const closeReportModal = () => {
    if (isReportLoading) return;
    setIsReportModalOpen(false);
    setActiveReport(null);
    setReportError(null);
  };

  const handleShareProject = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess('Project link copied');
    } catch (err) {
      showError('Unable to copy link');
    }
  };

  const handleExportProject = () => {
    if (reports.length === 0) {
      showError('No report available to export');
      return;
    }
    handleDownloadReport(reports[0]);
  };

  return (
    <div className={`project-detail-modal ${isPanelOpen ? 'is-open' : ''}`}>
      <div className="project-detail-backdrop" onClick={handleClose} />
      <div className="project-detail-sheet">
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
            <div className="project-detail-hero">
              <div className="project-detail-hero-inner">
                <div className="project-detail-hero-top">
                  <button type="button" className="project-detail-back-link" onClick={handleClose}>
                    <ArrowLeft size={16} /> Back to Projects
                  </button>

                  <div className="project-detail-hero-actions">
                    <button type="button" className="project-detail-icon-btn" onClick={handleToggleStar} aria-label="Star project">
                      <Star size={18} />
                    </button>
                    <button type="button" className="project-detail-ghost-btn" onClick={handleShareProject}>
                      <Share2 size={16} />
                      Share
                    </button>
                    <button type="button" className="project-detail-cta-btn" onClick={handleExportProject}>
                      <Download size={16} />
                      Export
                    </button>
                  </div>
                </div>

                <div className="project-detail-hero-title">
                  <h1>{project.name || 'Untitled project'}</h1>
                  {project.status ? <span className="project-detail-status">{project.status}</span> : null}
                </div>
                <p className="project-detail-hero-subtitle">
                  {project.description || 'No description provided yet.'}
                </p>

                <div className="project-detail-hero-meta">
                  <div className="project-detail-hero-pill">
                    <span className="pill-icon">
                      <Hash size={16} />
                    </span>
                    <div>
                      <span className="label">Category</span>
                      <span className="value">{project.category || 'General'}</span>
                    </div>
                  </div>
                  <div className="project-detail-hero-pill">
                    <span className="pill-icon">
                      <Calendar size={16} />
                    </span>
                    <div>
                      <span className="label">Created</span>
                      <span className="value">{formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                  <div className="project-detail-hero-pill">
                    <span className="pill-icon">
                      <Clock size={16} />
                    </span>
                    <div>
                      <span className="label">Last activity</span>
                      <span className="value">
                        {formatRelativeTime(project.lastActivityAt || project.updatedAt || project.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="project-detail-hero-stats">
                  <div className="project-detail-hero-card">
                    <div className="hero-card-top">
                      <BarChart2 size={20} />
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
              </div>
            </div>

            <div className="project-detail-body">
              {activeAnalysisId ? (
                <AnalysisDetailPanel
                  analysisId={activeAnalysisId}
                  projectId={projectId}
                  onBack={handleCloseAnalysis}
                  backLabel="Back to Analyses"
                />
              ) : (
                <>
              <div className="project-detail-tab-row">
                <div className="project-detail-tabs">
                  <Nav pills>
                    <NavItem>
                      <NavLink
                        active={activeTab === 'analyses'}
                        className={activeTab === 'analyses' ? 'active' : ''}
                        onClick={() => setActiveTab('analyses')}
                      >
                        Analyses ({analyses.length})
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        active={activeTab === 'reports'}
                        className={activeTab === 'reports' ? 'active' : ''}
                        onClick={() => setActiveTab('reports')}
                      >
                        Reports ({reports.length})
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
                                    <div className="analysis-card-icon">
                                      <MessageSquare size={22} />
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
                                        handleViewAnalysis(analysis._id);
                                      }}
                                    >
                                      View Details
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
                                    style={{ color: getSentimentColor(sentiment) }}
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
                </>
              )}
            </div>
          </>
        )}
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        toggle={closeReportModal}
        isGenerating={isReportLoading}
        report={activeReport}
        error={reportError}
        onDownload={() => activeReport && handleDownloadReport(activeReport)}
        loadingTitle="Loading Report..."
        loadingDescription="Fetching the saved report content."
        successMessage="Report ready"
      />
    </div>
  );
}

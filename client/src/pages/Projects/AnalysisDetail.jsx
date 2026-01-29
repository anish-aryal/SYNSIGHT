import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input
} from 'reactstrap';
import {
  RefreshCw,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  ThumbsUp,
  ThumbsDown,
  MinusCircle
} from 'lucide-react';
import { useApp } from '../../api/context/AppContext';
import { useNavigate } from 'react-router-dom';
import projectService from '../../api/services/projectService';
import * as analysisService from '../../api/services/analysisService';
import SentimentOverTimeChart from '../Chat/components/SentimentOverTimeChart';
import TopKeywordsChart from '../Chat/components/TopKeywordsChart';
import SamplePostsList from '../Chat/components/SamplePostsList';
import KeyInsightsCard from '../Chat/components/KeyInsightsCard';
import SentimentTabs from '../Chat/components/SentimentTabs';
import ProjectBreadcrumbs from '../../components/projects/ProjectBreadcrumbs';
import HeaderComments from '../../components/projects/HeaderComments';

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

const formatNumber = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return `${num}`;
};

const formatSourceLabel = (value) => {
  if (!value) return 'Unknown';
  return value
    .split('-')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
};

const formatTimeframe = (value) => {
  switch (value) {
    case 'last24hours':
      return 'Last 24 hours';
    case 'last7days':
      return 'Last 7 days';
    case 'last30days':
      return 'Last 30 days';
    case 'last90days':
      return 'Last 90 days';
    default:
      return 'Last 7 days';
  }
};

const buildSentimentSeriesFromSamples = (posts = [], timeframeKey) => {
  if (!Array.isArray(posts) || posts.length === 0) return [];
  const useHourly = timeframeKey === 'last24hours';
  const buckets = new Map();

  posts.forEach((post) => {
    if (!post?.created_at) return;
    const date = new Date(post.created_at);
    if (Number.isNaN(date.getTime())) return;
    const key = useHourly
      ? date.toISOString().slice(0, 13)
      : date.toISOString().slice(0, 10);

    const sentiment = (post.sentiment || 'neutral').toLowerCase();
    const existing = buckets.get(key) || { date: key, positive: 0, neutral: 0, negative: 0, total: 0 };
    if (sentiment === 'positive') existing.positive += 1;
    else if (sentiment === 'negative') existing.negative += 1;
    else existing.neutral += 1;
    existing.total += 1;
    buckets.set(key, existing);
  });

  return Array.from(buckets.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)));
};

const EmptyStateCard = ({ title, description }) => (
  <Card className="analysis-detail-card">
    <CardBody>
      <div className="analysis-detail-card-title">{title}</div>
      <p className="analysis-detail-card-empty">{description}</p>
    </CardBody>
  </Card>
);

const EngagementBreakdown = ({ likes, shares, comments, total }) => {
  if (!total) {
    return (
      <EmptyStateCard
        title="Engagement Breakdown"
        description="Engagement metrics are not available for this analysis yet."
      />
    );
  }

  const max = Math.max(likes, shares, comments, 1);

  const rows = [
    { label: 'Likes', value: likes, color: 'pink' },
    { label: 'Shares', value: shares, color: 'purple' },
    { label: 'Comments', value: comments, color: 'blue' }
  ];

  return (
    <Card className="analysis-detail-card analysis-detail-engagement">
      <CardBody>
        <div className="analysis-detail-card-title">Engagement Breakdown</div>
        <div className="analysis-detail-card-subtitle">Total interactions</div>
        <div className="analysis-detail-engagement-rows">
          {rows.map((row) => (
            <div key={row.label} className="analysis-detail-engagement-row">
              <div className="analysis-detail-engagement-label">{row.label}</div>
              <div className="analysis-detail-engagement-track">
                <div
                  className={`analysis-detail-engagement-bar ${row.color}`}
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
              </div>
              <div className="analysis-detail-engagement-value">{formatNumber(row.value)}</div>
            </div>
          ))}
        </div>
        <div className="analysis-detail-engagement-total">
          <div className="analysis-detail-engagement-total-value">{formatNumber(total)}</div>
          <div className="analysis-detail-engagement-total-label">Total Engagements</div>
        </div>
      </CardBody>
    </Card>
  );
};

export default function AnalysisDetail({
  analysisId,
  projectId,
  onBack,
  onRequestCloseProjectDetail
}) {
  const navigate = useNavigate();
  const { showError, showSuccess } = useApp();
  const isEmbedded = Boolean(onRequestCloseProjectDetail);

  const [analysis, setAnalysis] = useState(null);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false);
  const [refreshTimeframe, setRefreshTimeframe] = useState('last7days');
  const [refreshPlatforms, setRefreshPlatforms] = useState({
    twitter: true,
    reddit: true,
    bluesky: true
  });

  const loadData = async () => {
    if (!analysisId) return;
    setIsLoading(true);
    try {
      const [analysisRes, projectRes] = await Promise.allSettled([
        analysisService.getAnalysisById(analysisId),
        projectId ? projectService.getProjectById(projectId) : Promise.resolve(null)
      ]);

      if (analysisRes.status !== 'fulfilled' || !analysisRes.value?.success) {
        throw new Error(analysisRes.value?.message || 'Failed to load analysis');
      }

      setAnalysis(analysisRes.value.data);
      if (projectRes.status === 'fulfilled' && projectRes.value?.success) {
        setProject(projectRes.value.data);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load analysis';
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [analysisId, projectId]);

  const sentiment = analysis?.sentiment || {};
  const percentages = sentiment?.percentages || analysis?.percentages || {};
  const distribution = sentiment?.distribution || analysis?.sentiment_distribution || {};
  const totalAnalyzed = Number(analysis?.totalAnalyzed ?? analysis?.total_analyzed) || 0;
  const positiveCount = Number(distribution?.positive) || Math.round((percentages?.positive || 0) * totalAnalyzed / 100);
  const neutralCount = Number(distribution?.neutral) || Math.round((percentages?.neutral || 0) * totalAnalyzed / 100);
  const negativeCount = Number(distribution?.negative) || Math.round((percentages?.negative || 0) * totalAnalyzed / 100);
  const sentimentScore = Math.round(percentages?.positive || 0);
  const overallSentiment = sentiment?.overall || analysis?.overall_sentiment || 'neutral';
  const timeframeKey = analysis?.metadata?.timeframe || analysis?.timeframe || analysis?.options?.timeframe;
  const timeframeLabel = formatTimeframe(timeframeKey);
  const rawSentimentSeries = analysis?.sentimentOverTime || analysis?.sentiment_over_time || [];
  const topKeywords = analysis?.topKeywords || analysis?.top_keywords || [];
  const samplePosts = analysis?.samplePosts || analysis?.sample_posts || [];
  const platformBreakdown = analysis?.platformBreakdown || analysis?.platform_breakdown || [];
  const queryLabel = analysis?.query || analysis?.searchQuery || 'Untitled analysis';
  const sentimentSeries = rawSentimentSeries.length
    ? rawSentimentSeries
    : buildSentimentSeriesFromSamples(samplePosts, timeframeKey);

  const availablePlatforms = [
    { id: 'twitter', label: 'Twitter / X' },
    { id: 'reddit', label: 'Reddit' },
    { id: 'bluesky', label: 'Bluesky' }
  ];

  const trendData = useMemo(() => {
    if (overallSentiment === 'positive') {
      return { label: 'Trending up', icon: TrendingUp, className: 'positive' };
    }
    if (overallSentiment === 'negative') {
      return { label: 'Trending down', icon: TrendingDown, className: 'negative' };
    }
    return { label: 'Stable', icon: Minus, className: 'neutral' };
  }, [overallSentiment]);

  const engagement = useMemo(() => {
    const posts = samplePosts || [];
    const totals = { likes: 0, shares: 0, comments: 0 };

    posts.forEach((post) => {
      const metrics = post?.metrics || {};
      totals.likes += Number(metrics.like_count ?? metrics.likes ?? metrics.score ?? 0) || 0;
      totals.shares += Number(
        metrics.retweet_count ??
        metrics.repost_count ??
        metrics.shares ??
        metrics.quote_count ??
        0
      ) || 0;
      totals.comments += Number(metrics.reply_count ?? metrics.comments ?? metrics.num_comments ?? 0) || 0;
    });

    const total = totals.likes + totals.shares + totals.comments;
    return { ...totals, total };
  }, [analysis]);

  const TrendIcon = trendData.icon;

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const goToProjects = () => {
    let handled = false;
    if (onBack) {
      onBack();
      handled = true;
    }
    if (!handled) {
      navigate('/projects');
    }
  };

  const goToProject = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (projectId) {
      navigate(`/projects/${projectId}`);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showSuccess('Analysis link copied');
    } catch (err) {
      showError('Unable to copy link');
    }
  };

  const buildDefaultPlatforms = () => {
    const metadataPlatforms = analysis?.metadata?.platforms;
    if (Array.isArray(metadataPlatforms) && metadataPlatforms.length > 0) {
      return {
        twitter: metadataPlatforms.includes('twitter'),
        reddit: metadataPlatforms.includes('reddit'),
        bluesky: metadataPlatforms.includes('bluesky')
      };
    }
    if (analysis?.source === 'twitter') {
      return { twitter: true, reddit: false, bluesky: false };
    }
    if (analysis?.source === 'reddit') {
      return { twitter: false, reddit: true, bluesky: false };
    }
    if (analysis?.source === 'bluesky') {
      return { twitter: false, reddit: false, bluesky: true };
    }
    return { twitter: true, reddit: true, bluesky: true };
  };

  const openRefreshModal = () => {
    setRefreshTimeframe(timeframeKey || 'last7days');
    setRefreshPlatforms(buildDefaultPlatforms());
    setIsRefreshModalOpen(true);
  };

  const togglePlatform = (platformId) => {
    setRefreshPlatforms((prev) => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
  };

  const handleRefresh = async () => {
    const hasPlatform = Object.values(refreshPlatforms).some(Boolean);
    if (!hasPlatform) {
      showError('Select at least one platform to refresh.');
      return;
    }

    setIsRefreshing(true);
    try {
      const response = await analysisService.refreshAnalysis(analysisId, {
        timeframe: refreshTimeframe,
        platforms: refreshPlatforms,
        language: analysis?.metadata?.language || analysis?.language || 'en'
      });

      if (response?.success && response.data) {
        setAnalysis(response.data);
        showSuccess('Analysis refreshed successfully');
        setIsRefreshModalOpen(false);
      } else {
        throw new Error(response?.message || 'Failed to refresh analysis');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to refresh analysis';
      showError(message);
    } finally {
      setIsRefreshing(false);
    }
  };


  if (isLoading) {
    return (
      <div className={`analysis-detail-page ${isEmbedded ? 'is-embedded' : ''}`}>
        <div className={`analysis-detail-shell ${isEmbedded ? 'is-embedded' : ''}`}>
          <ProjectBreadcrumbs
            onBack={goToProjects}
            projectName={project?.name}
            analysisLabel={queryLabel}
            onProjectClick={project?.name ? goToProject : undefined}
          />
          <div className="analysis-detail-loading">
            <div className="skeleton-wrapper">
              <div className="skeleton-line" style={{ width: '40%' }} />
              <div className="skeleton-line" style={{ width: '60%' }} />
              <div className="skeleton-line" style={{ width: '30%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`analysis-detail-page ${isEmbedded ? 'is-embedded' : ''}`}>
        <div className={`analysis-detail-shell ${isEmbedded ? 'is-embedded' : ''}`}>
          <ProjectBreadcrumbs
            onBack={goToProjects}
            projectName={project?.name}
            analysisLabel={queryLabel}
            onProjectClick={project?.name ? goToProject : undefined}
          />
          <div className="analysis-detail-loading">
            <p className="text-muted">Analysis not found.</p>
            <Button color="primary" onClick={handleBack}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`analysis-detail-page ${isEmbedded ? 'is-embedded' : ''}`}>
      <div className={`analysis-detail-shell ${isEmbedded ? 'is-embedded' : ''}`}>
        <ProjectBreadcrumbs
          onBack={goToProjects}
          projectName={project?.name}
          analysisLabel={queryLabel}
          onProjectClick={project?.name ? goToProject : undefined}
        />

        <div className="analysis-detail-hero">
          <div className="analysis-detail-hero-top">
            <div className="analysis-detail-hero-actions">
              <div className="analysis-detail-timeframe">
                <span className="label">Time Range:</span>
                <span className="value">{timeframeLabel}</span>
              </div>
              <button
                type="button"
                className="analysis-detail-action"
                onClick={openRefreshModal}
                disabled={isRefreshing}
              >
                <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
                Refresh
              </button>
              <button type="button" className="analysis-detail-action primary" onClick={handleShare}>
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>

          <div className="analysis-detail-hero-main">
            <div className="analysis-detail-title-group">
              <div className="analysis-detail-avatar">
                {(queryLabel || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1>{queryLabel}</h1>
                <div className="analysis-detail-meta">
                  <span className="analysis-detail-source">{formatSourceLabel(analysis.source)}</span>
                  <span>•</span>
                  <span>{formatNumber(totalAnalyzed)} posts analyzed</span>
                  <span>•</span>
                  <span>{formatDate(analysis.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="analysis-detail-meta-row">
              <span className="pill pill-positive">
                <ThumbsUp size={16} />
                {Math.round(percentages?.positive || 0)}% Positive
              </span>
              <span className="pill pill-neutral">
                <MinusCircle size={16} />
                {Math.round(percentages?.neutral || 0)}% Neutral
              </span>
              <span className="pill pill-negative">
                <ThumbsDown size={16} />
                {Math.round(percentages?.negative || 0)}% Negative
              </span>
            </div>
          </div>
          <div className="header-comments-row">
            <HeaderComments
              entityType="analysis"
              entityId={analysis?._id}
              initialComments={analysis?.comments}
            />
          </div>
        </div>

      <Modal isOpen={isRefreshModalOpen} toggle={() => setIsRefreshModalOpen(false)} centered>
        <ModalHeader toggle={() => setIsRefreshModalOpen(false)}>
          Refresh Analysis
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="refreshTimeframe">Time Range</Label>
            <Input
              id="refreshTimeframe"
              type="select"
              value={refreshTimeframe}
              onChange={(event) => setRefreshTimeframe(event.target.value)}
            >
              <option value="last24hours">Last 24 hours</option>
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="last90days">Last 90 days</option>
            </Input>
          </FormGroup>

          <FormGroup className="mt-3">
            <Label>Platforms</Label>
            <div className="d-flex flex-column gap-2">
              {availablePlatforms.map((platform) => (
                <Label key={platform.id} className="d-flex align-items-center gap-2 mb-0">
                  <Input
                    type="checkbox"
                    checked={!!refreshPlatforms[platform.id]}
                    onChange={() => togglePlatform(platform.id)}
                  />
                  <span>{platform.label}</span>
                </Label>
              ))}
            </div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setIsRefreshModalOpen(false)} disabled={isRefreshing}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? 'Refreshing...' : 'Run Refresh'}
          </Button>
        </ModalFooter>
      </Modal>

      <div className="analysis-detail-body">
        <div className="analysis-detail-grid">
          <aside className="analysis-detail-aside">
            <div className="analysis-detail-aside-card">
              <div className="analysis-detail-aside-title">Snapshot</div>
              <div className="analysis-detail-stats">
                <div className="analysis-detail-stat-card positive">
                  <div className="analysis-detail-stat-icon">
                    <ThumbsUp size={18} />
                  </div>
                  <div className="analysis-detail-stat-value">{formatNumber(positiveCount)}</div>
                  <div className="analysis-detail-stat-label">Positive Posts</div>
                </div>
                <div className="analysis-detail-stat-card neutral">
                  <div className="analysis-detail-stat-icon">
                    <MinusCircle size={18} />
                  </div>
                  <div className="analysis-detail-stat-value">{formatNumber(neutralCount)}</div>
                  <div className="analysis-detail-stat-label">Neutral Posts</div>
                </div>
                <div className="analysis-detail-stat-card negative">
                  <div className="analysis-detail-stat-icon">
                    <ThumbsDown size={18} />
                  </div>
                  <div className="analysis-detail-stat-value">{formatNumber(negativeCount)}</div>
                  <div className="analysis-detail-stat-label">Negative Posts</div>
                </div>
                <div className="analysis-detail-stat-card score">
                  <div className="analysis-detail-stat-icon">
                    <TrendingUp size={18} />
                  </div>
                  <div className="analysis-detail-stat-value">{sentimentScore}%</div>
                  <div className="analysis-detail-stat-label">Sentiment Score</div>
                </div>
              </div>
            </div>
          </aside>
          <div className="analysis-detail-main-column">
            <div className="analysis-detail-tabs syn-pill-toggle">
              <Nav className="syn-pill-toggle-nav">
                <NavItem>
                  <NavLink
                    className={`syn-pill-toggle-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </NavLink>
                </NavItem>
                <NavItem>
                <NavLink
                  className={`syn-pill-toggle-btn ${activeTab === 'posts' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  <span>Posts</span>
                </NavLink>
              </NavItem>
                <NavItem>
                  <NavLink
                    className={`syn-pill-toggle-btn ${activeTab === 'insights' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('insights')}
                  >
                    Insights
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={`syn-pill-toggle-btn ${activeTab === 'demographics' ? 'is-active' : ''}`}
                    onClick={() => setActiveTab('demographics')}
                  >
                    Demographics
                  </NavLink>
                </NavItem>
              </Nav>
            </div>

            <div className="analysis-detail-content">
              {activeTab === 'overview' && (
                <div className="analysis-detail-section">
                  <Row className="g-3">
                    <Col xs={12} lg={8}>
                      {sentimentSeries && sentimentSeries.length > 0 ? (
                        <SentimentOverTimeChart data={sentimentSeries} />
                      ) : (
                        <EmptyStateCard
                          title="Sentiment Over Time"
                          description="Sentiment trend data is not available for this analysis."
                        />
                      )}
                    </Col>
                    <Col xs={12} lg={4}>
                      <EngagementBreakdown
                        likes={engagement.likes}
                        shares={engagement.shares}
                        comments={engagement.comments}
                        total={engagement.total}
                      />
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    <Col xs={12}>
                      {topKeywords.length ? (
                        <Card className="analysis-detail-card">
                          <CardBody>
                            <div className="analysis-detail-card-title">Top Keywords & Topics</div>
                            <div className="analysis-detail-card-subtitle">
                              Most mentioned words in the conversation
                            </div>
                            <div className="analysis-detail-keywords">
                              {topKeywords.slice(0, 10).map((keyword, index) => (
                                <div
                                  key={`${keyword.keyword}-${index}`}
                                  className={`analysis-detail-chip ${keyword.sentiment || 'neutral'}`}
                                >
                                  <span>{keyword.keyword}</span>
                                  <span className="analysis-detail-chip-count">{keyword.count}</span>
                                </div>
                              ))}
                            </div>
                          </CardBody>
                        </Card>
                      ) : (
                        <EmptyStateCard
                          title="Top Keywords & Topics"
                          description="Keywords will appear once enough posts are analyzed."
                        />
                      )}
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="analysis-detail-section">
                  <Row className="g-3">
                    <Col xs={12}>
                      {samplePosts?.length ? (
                        <SamplePostsList posts={samplePosts} />
                      ) : (
                        <EmptyStateCard
                          title="Sample Posts"
                          description="No sample posts were saved for this analysis."
                        />
                      )}
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="analysis-detail-section">
                  <Row className="g-3">
                    <Col xs={12}>
                      <KeyInsightsCard insights={analysis.insights} />
                    </Col>
                    <Col xs={12}>
                      <SentimentTabs
                        percentages={percentages}
                        platformBreakdown={platformBreakdown}
                      />
                    </Col>
                    <Col xs={12}>
                      <TopKeywordsChart keywords={topKeywords} />
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'demographics' && (
                <div className="analysis-detail-section">
                  <Row className="g-3">
                    <Col xs={12}>
                      <EmptyStateCard
                        title="Demographics"
                        description="Demographic insights are not available for this analysis."
                      />
                    </Col>
                  </Row>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

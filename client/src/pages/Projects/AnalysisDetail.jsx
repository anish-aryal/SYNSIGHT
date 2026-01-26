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
  ArrowLeft,
  RefreshCw,
  Share2,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  ThumbsUp,
  ThumbsDown,
  MinusCircle
} from 'lucide-react';
import { useApp } from '../../api/context/AppContext';
import projectService from '../../api/services/projectService';
import * as analysisService from '../../api/services/analysisService';
import reportService from '../../api/services/reportService';
import SentimentOverTimeChart from '../Chat/components/SentimentOverTimeChart';
import TopKeywordsChart from '../Chat/components/TopKeywordsChart';
import SamplePostsList from '../Chat/components/SamplePostsList';
import KeyInsightsCard from '../Chat/components/KeyInsightsCard';
import SentimentTabs from '../Chat/components/SentimentTabs';

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

const buildReportPayload = (analysis) => {
  if (!analysis) return null;
  const percentages = analysis?.sentiment?.percentages || analysis?.percentages || {};
  const distribution = analysis?.sentiment?.distribution || analysis?.sentiment_distribution || {};
  const scores = analysis?.sentiment?.scores || analysis?.average_scores || {};

  return {
    ...analysis,
    analysisId: analysis._id,
    query: analysis.query || analysis.searchQuery,
    source: analysis.source,
    percentages,
    sentiment_distribution: distribution,
    overall_sentiment: analysis?.sentiment?.overall || analysis?.overall_sentiment,
    average_scores: scores,
    total_analyzed: analysis?.totalAnalyzed ?? analysis?.total_analyzed ?? 0,
    topKeywords: analysis?.topKeywords || analysis?.top_keywords || [],
    samplePosts: analysis?.samplePosts || analysis?.sample_posts || [],
    platformBreakdown: analysis?.platformBreakdown || analysis?.platform_breakdown || [],
    dateRange: analysis?.dateRange || {},
    insights: analysis?.insights || {}
  };
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
  backLabel = 'Back to Project'
}) {
  const { showError, showSuccess } = useApp();

  const [analysis, setAnalysis] = useState(null);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);
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

  const handleExport = async () => {
    if (!analysis?._id) return;
    setIsExporting(true);
    try {
      let reportData = null;
      const existing = await reportService.getReportByAnalysisId(analysis._id);
      if (existing?.success && existing.data) {
        reportData = existing.data;
      } else {
        const payload = buildReportPayload(analysis);
        const generated = await reportService.generateReport(payload);
        if (generated?.success && generated.data) {
          reportData = generated.data;
        }
      }

      if (!reportData?._id) {
        throw new Error('Report unavailable for export');
      }

      const response = await reportService.downloadReportPdf(reportData._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentiment-report-${(queryLabel || 'analysis').replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Report downloaded');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to export report';
      showError(message);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="analysis-detail-page">
        <div className="analysis-detail-loading">
          <div className="skeleton-wrapper">
            <div className="skeleton-line" style={{ width: '40%' }} />
            <div className="skeleton-line" style={{ width: '60%' }} />
            <div className="skeleton-line" style={{ width: '30%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="analysis-detail-page">
        <div className="analysis-detail-loading">
          <p className="text-muted">Analysis not found.</p>
          <Button color="primary" onClick={handleBack}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-detail-page">
      <div className="analysis-detail-hero">
        <div className="analysis-detail-top">
          <button type="button" className="analysis-detail-back" onClick={handleBack}>
            <ArrowLeft size={16} /> {backLabel}
          </button>
          <div className="analysis-detail-actions">
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
            <button type="button" className="analysis-detail-action" onClick={handleShare}>
              <Share2 size={16} />
              Share
            </button>
            <button
              type="button"
              className="analysis-detail-action primary"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        <div className="analysis-detail-header">
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
                {project?.name ? (
                  <>
                    <span>•</span>
                    <span>{project.name}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="analysis-detail-meta-row">
            <div className="analysis-detail-meta-item">
              <ThumbsUp size={16} />
              {Math.round(percentages?.positive || 0)}% Positive
            </div>
            <div className="analysis-detail-meta-item">
              <MinusCircle size={16} />
              {Math.round(percentages?.neutral || 0)}% Neutral
            </div>
            <div className="analysis-detail-meta-item">
              <ThumbsDown size={16} />
              {Math.round(percentages?.negative || 0)}% Negative
            </div>
            <div className={`analysis-detail-meta-item trend ${trendData.className}`}>
              <TrendIcon size={16} />
              {trendData.label}
            </div>
          </div>
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

      <div className="analysis-detail-tabs">
        <Nav pills>
          <NavItem>
            <NavLink
              active={activeTab === 'overview'}
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === 'posts'}
              className={activeTab === 'posts' ? 'active' : ''}
              onClick={() => setActiveTab('posts')}
            >
              Posts ({samplePosts?.length || 0})
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === 'insights'}
              className={activeTab === 'insights' ? 'active' : ''}
              onClick={() => setActiveTab('insights')}
            >
              Insights
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === 'demographics'}
              className={activeTab === 'demographics' ? 'active' : ''}
              onClick={() => setActiveTab('demographics')}
            >
              Demographics
            </NavLink>
          </NavItem>
        </Nav>
      </div>

      <div className="analysis-detail-content">
        {activeTab === 'overview' && (
          <>
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
                      <div className="analysis-detail-card-subtitle">Most mentioned words in the conversation</div>
                      <div className="analysis-detail-keywords">
                        {topKeywords.slice(0, 10).map((keyword, index) => (
                          <div key={`${keyword.keyword}-${index}`} className={`analysis-detail-chip ${keyword.sentiment || 'neutral'}`}>
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
          </>
        )}

        {activeTab === 'posts' && (
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
        )}

        {activeTab === 'insights' && (
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
        )}

        {activeTab === 'demographics' && (
          <Row className="g-3">
            <Col xs={12}>
              <EmptyStateCard
                title="Demographics"
                description="Demographic insights are not available for this analysis."
              />
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}

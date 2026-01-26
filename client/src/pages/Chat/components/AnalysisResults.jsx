import React from 'react';
import { Row, Col } from 'reactstrap';
import SummaryHeader from './SummaryHeader';
import KeyInsightsCard from './KeyInsightsCard';
import SentimentTabs from './SentimentTabs';
import SentimentOverTimeChart from './SentimentOverTimeChart';
import TopKeywordsChart from './TopKeywordsChart';
import SamplePostsList from './SamplePostsList';
import ActionBar from './ActionBar';

const normalizeResults = (results = {}) => {
  const normalized = { ...results };

  normalized.analysisId = results.analysisId || results._id;
  normalized.query = results.query || results.searchQuery;
  normalized.percentages = results.percentages || results.sentiment?.percentages || {};
  normalized.sentimentDistribution = results.sentiment_distribution || results.sentimentDistribution || results.sentiment?.distribution;
  normalized.overallSentiment = results.overall_sentiment || results.overallSentiment || results.sentiment?.overall;
  normalized.totalAnalyzed = results.totalAnalyzed ?? results.total_analyzed ?? results.total ?? 0;
  normalized.insights = results.insights || results.sentiment?.insights || {};
  normalized.average_scores = results.average_scores || results.averageScores || results.sentiment?.scores;
  normalized.topKeywords = results.topKeywords || results.top_keywords || [];
  normalized.sentimentOverTime = results.sentimentOverTime || results.sentiment_over_time || [];
  normalized.samplePosts = results.samplePosts || results.sample_posts || [];
  normalized.platformBreakdown = results.platformBreakdown || results.platform_breakdown || [];
  normalized.counts = results.counts || results.metadata?.counts;
  normalized.timeframe = results.timeframe || results.metadata?.options?.timeframe || results.options?.timeframe;
  normalized.language = results.language || results.metadata?.options?.language || results.options?.language;
  normalized.maxResults = results.maxResults || results.max_results || results.metadata?.options?.maxResults || results.options?.maxResults;
  normalized.processingTime = results.processingTime || results.metadata?.processingTime;
  normalized.dateRange = results.dateRange || results.metadata?.dateRange;
  if (!normalized.sentiment_distribution && normalized.sentimentDistribution) {
    normalized.sentiment_distribution = normalized.sentimentDistribution;
  }
  if (!normalized.total_analyzed && Number.isFinite(Number(normalized.totalAnalyzed))) {
    normalized.total_analyzed = Number(normalized.totalAnalyzed);
  }
  if (!normalized.overall_sentiment && normalized.overallSentiment) {
    normalized.overall_sentiment = normalized.overallSentiment;
  }

  return normalized;
};

const formatNumber = (num) => {
  const value = Number(num);
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value;
};

const buildInsightsList = (normalized) => {
  const list = [];
  const total = Number(normalized.totalAnalyzed) || 0;
  const percentages = normalized.percentages || {};
  const positive = Math.round(percentages.positive || 0);
  const negative = Math.round(percentages.negative || 0);
  const overall = normalized.overallSentiment ? normalized.overallSentiment.toLowerCase() : null;
  const fallbackInsights = normalized.insights || {};

  if (total > 0 && overall) {
    const sentimentLine = overall === 'neutral'
      ? `Sentiment is mostly neutral (${positive}% positive, ${negative}% negative) across ${formatNumber(total)} posts.`
      : `Sentiment leans ${overall} (${positive}% positive, ${negative}% negative) across ${formatNumber(total)} posts.`;
    list.push(sentimentLine);
  } else if (fallbackInsights.overall) {
    list.push(fallbackInsights.overall);
  } else if (total === 0) {
    list.push('Not enough data to draw a reliable sentiment summary.');
  }

  const keywords = (normalized.topKeywords || [])
    .slice(0, 3)
    .map(k => k?.keyword)
    .filter(Boolean);
  if (keywords.length > 0) {
    list.push(`Top discussion themes: ${keywords.join(', ')}.`);
  } else if (fallbackInsights.topDrivers) {
    const drivers = Array.isArray(fallbackInsights.topDrivers)
      ? fallbackInsights.topDrivers.join(', ')
      : fallbackInsights.topDrivers;
    if (drivers) list.push(`Top sentiment drivers: ${drivers}`);
  }

  const platformSummary = (normalized.platformBreakdown || [])
    .map((p) => {
      const dist = p?.sentimentDistribution || p?.sentiment_distribution || {};
      const totalPosts = (dist.positive || 0) + (dist.negative || 0) + (dist.neutral || 0);
      if (totalPosts === 0) return null;
      const positiveShare = Math.round((dist.positive / totalPosts) * 100);
      return `${p.platform}: ${positiveShare}% positive`;
    })
    .filter(Boolean);

  if (platformSummary.length > 1) {
    list.push(`Platform sentiment (positive share): ${platformSummary.join(' | ')}.`);
  } else if (fallbackInsights.platformComparison) {
    list.push(fallbackInsights.platformComparison);
  }

  if (fallbackInsights.platformsAnalyzed && list.length < 4) {
    const label = String(fallbackInsights.platformsAnalyzed);
    const formatted = label.toLowerCase().startsWith('platform')
      ? label
      : `Platforms analyzed: ${label}`;
    list.push(formatted);
  }

  return list.slice(0, 4);
};

const capitalize = (value = '') => (value ? value[0].toUpperCase() + value.slice(1) : value);

export default function AnalysisResults({ results, query }) {
  if (!results) {
    return (
      <Row>
        <Col xs={12} className="text-center py-4">
          <p className="text-muted mb-0">No results available</p>
        </Col>
      </Row>
    );
  }

  const normalized = normalizeResults(results);
  const displayQuery = query || normalized.query || 'this topic';
  const platformNames = normalized.platformBreakdown.length > 0
    ? normalized.platformBreakdown.map(p => p.platform)
    : normalized.source
      ? [capitalize(normalized.source)]
      : [];
  const insightsList = buildInsightsList(normalized);

  return (
    <div className="analysis-results">
      <Row>
        <Col xs={12}>
          <SummaryHeader
            query={displayQuery}
            percentages={normalized.percentages}
            totalAnalyzed={normalized.totalAnalyzed}
            dateRange={normalized.dateRange}
            platforms={platformNames}
            overallSentiment={normalized.overallSentiment}
            timeframe={normalized.timeframe}
            language={normalized.language}
            maxResults={normalized.maxResults}
            counts={normalized.counts}
            processingTime={normalized.processingTime}
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <KeyInsightsCard insights={insightsList.length ? insightsList : normalized.insights} />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <SentimentTabs
            percentages={normalized.percentages}
            platformBreakdown={normalized.platformBreakdown}
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <SentimentOverTimeChart data={normalized.sentimentOverTime} />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <TopKeywordsChart keywords={normalized.topKeywords} />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <SamplePostsList posts={normalized.samplePosts} />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <ActionBar
            query={displayQuery}
            results={normalized}
          />
        </Col>
      </Row>
    </div>
  );
}

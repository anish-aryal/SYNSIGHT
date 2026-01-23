import React, { useState } from 'react';
import { Collapse } from 'reactstrap';
import { TrendingUp, Minus, TrendingDown, FileText, Clock, ChevronDown, ChevronUp, Settings, CheckCircle } from 'lucide-react';

export default function SummaryHeader({
  query,
  percentages,
  totalAnalyzed,
  dateRange,
  platforms,
  overallSentiment,
  timeframe,
  language,
  maxResults,
  counts,
  processingTime
}) {
  const [configOpen, setConfigOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);

  const formatNumber = (num) => {
    const value = Number(num);
    if (!Number.isFinite(value)) return '0';
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value;
  };

  const formatTimeframe = (value) => {
    switch (value) {
      case 'last24hours':
        return 'last 24 hours';
      case 'last7days':
        return 'last 7 days';
      case 'last30days':
        return 'last 30 days';
      case 'last90days':
        return 'last 90 days';
      default:
        return 'last 7 days';
    }
  };

  const getPlatformNames = () => {
    if (!platforms || platforms.length === 0) return 'social media';
    return platforms.join(', ');
  };

  const getObservedRange = () => {
    if (!dateRange?.start || !dateRange?.end) return null;
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days <= 1) return 'last 24 hours';
    return `last ${days} days`;
  };

  const getLanguageLabel = () => {
    if (!language) return 'English';
    const key = String(language).toLowerCase();
    const map = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese'
    };
    return map[key] || String(language).toUpperCase();
  };

  const getOverallLabel = () => {
    if (overallSentiment) return String(overallSentiment).toLowerCase();
    const positive = Number(percentages?.positive || 0);
    const negative = Number(percentages?.negative || 0);
    const neutral = Number(percentages?.neutral || 0);
    if (positive >= negative && positive >= neutral) return 'positive';
    if (negative >= positive && negative >= neutral) return 'negative';
    return 'neutral';
  };

  const getProcessingLabel = () => {
    if (!Number.isFinite(Number(processingTime))) return null;
    const ms = Number(processingTime);
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.round(ms)} ms`;
  };

  const total = Number(totalAnalyzed) || 0;
  const overallLabel = getOverallLabel();
  const positivePct = Math.round(percentages?.positive || 0);
  const negativePct = Math.round(percentages?.negative || 0);
  const dateLabel = formatTimeframe(timeframe);
  const observedRange = getObservedRange();
  const topicLabel = query || 'this topic';
  const hasQuery = Boolean(query);
  const processingLabel = getProcessingLabel();
  const hasCounts = counts && Number.isFinite(Number(counts.fetched));
  const keptCount = counts?.afterBalancing ?? counts?.afterFilters ?? 0;
  const filterSummary = hasCounts
    ? `Kept ${keptCount} of ${counts.fetched} posts after filters`
    : 'Spam & promotional content removed';

  return (
    <div className="summary-header">
      <div className="summary-section">
        <p className="summary-text">
          {total > 0 ? 'I analyzed' : 'No posts were found for'} {hasQuery ? '"' : ''}
          <strong>{topicLabel}</strong>
          {hasQuery ? '"' : ''} across {getPlatformNames()} ({dateLabel}).
          {total > 0 && (
            <> Sentiment {overallLabel === 'neutral' ? 'is mostly neutral' : `leans ${overallLabel}`} ({positivePct}% positive, {negativePct}% negative).</>
          )}
        </p>
      </div>

      <div className="summary-section">
        <div className="summary-badges">
          <span className="pill pill-positive">
            <TrendingUp size={14} />
            {Math.round(percentages?.positive || 0)}% Positive
          </span>
          <span className="pill pill-neutral">
            <Minus size={14} />
            {Math.round(percentages?.neutral || 0)}% Neutral
          </span>
          <span className="pill pill-negative">
            <TrendingDown size={14} />
            {Math.round(percentages?.negative || 0)}% Negative
          </span>
          <span className="pill pill-default">
            <FileText size={14} />
            {formatNumber(totalAnalyzed)} posts
          </span>
          <span className="pill pill-info">
            <Clock size={14} />
            {dateLabel}
          </span>
        </div>
      </div>

      <div className="summary-section-small">
        <div className="config-section">
          <button
            type="button"
            className="config-toggle"
            onClick={() => setConfigOpen(!configOpen)}
          >
            <span className="config-toggle-text">
              <Settings size={14} />
              Analysis Configuration
            </span>
            {configOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <Collapse isOpen={configOpen}>
            <div className="config-content">
              <div className="config-details normal-regular">
                <div><strong>Platforms:</strong> {getPlatformNames()}</div>
                <div><strong>Timeframe:</strong> {formatTimeframe(timeframe)}</div>
                {observedRange && (
                  <div><strong>Observed range:</strong> {observedRange}</div>
                )}
                <div><strong>Max Results:</strong> {maxResults || 100} per platform</div>
                <div><strong>Language:</strong> {getLanguageLabel()}</div>
                <div><strong>Filter:</strong> {filterSummary}</div>
                {processingLabel && (
                  <div><strong>Processing:</strong> {processingLabel}</div>
                )}
              </div>
            </div>
          </Collapse>
        </div>
      </div>

      <div className="summary-section-small">
        <div className="config-section">
          <button
            type="button"
            className="config-toggle"
            onClick={() => setPipelineOpen(!pipelineOpen)}
          >
            <span className="config-toggle-text">
              <FileText size={14} />
              Pipeline Execution
              <span className="pipeline-status">
                <CheckCircle size={14} />
                Completed
              </span>
            </span>
            {pipelineOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <Collapse isOpen={pipelineOpen}>
            <div className="config-content">
              <div className="config-details normal-regular">
                <div className="pipeline-step">
                  <CheckCircle size={12} /> Data fetching completed
                </div>
                <div className="pipeline-step">
                  <CheckCircle size={12} /> Content filtering applied
                </div>
                <div className="pipeline-step">
                  <CheckCircle size={12} /> Sentiment analysis completed
                </div>
                <div className="pipeline-step">
                  <CheckCircle size={12} /> Insights generated
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      </div>
    </div>
  );
}

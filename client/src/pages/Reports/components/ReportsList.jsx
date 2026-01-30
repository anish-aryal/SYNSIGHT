import React from 'react';
import { Card, CardBody, Button, Input } from 'reactstrap';
import { Calendar, Eye, Download, Search, Trash2, FolderPlus } from 'lucide-react';

// Reports List UI block for Reports page.

export default function ReportsList({
  reports,
  searchQuery,
  setSearchQuery,
  onViewReport,
  onDownloadReport,
  onDeleteReport,
  onAssignProject,
  viewingReportId,
  downloadingReportId,
  deletingReportId
}) {
  const getDominantSentiment = (report) => {
    const overall = (report?.sentiment?.overall || '').toLowerCase();
    if (overall) return overall;

    const positive = Number(report?.sentiment?.positive ?? 0);
    const negative = Number(report?.sentiment?.negative ?? 0);
    const neutral = Number(report?.sentiment?.neutral ?? 0);
    const hasValues = positive > 0 || negative > 0 || neutral > 0;
    if (!hasValues) return null;

    if (positive >= negative && positive >= neutral) return 'positive';
    if (negative >= positive && negative >= neutral) return 'negative';
    return 'neutral';
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment === 'positive') return '#10b981';
    if (sentiment === 'neutral') return '#D08700';
    if (sentiment === 'negative') return '#ef4444';
    return '#6b7280';
  };

  const getSentimentPercent = (report, sentiment) => {
    if (!sentiment) return null;
    const sentimentMap = {
      positive: report?.sentiment?.positive,
      neutral: report?.sentiment?.neutral,
      negative: report?.sentiment?.negative
    };

    const value = Number(sentimentMap[sentiment]);
    if (!Number.isFinite(value)) return null;
    return Math.round(value);
  };

  const formatSentimentLabel = (sentiment) => {
    if (!sentiment) return 'Unknown';
    return sentiment[0].toUpperCase() + sentiment.slice(1);
  };

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

  // Layout and appearance
  return (
    <Card className="reports-panel">
      <CardBody>
        <div className="reports-header">
          <div>
            <h5 className="reports-title">Your Reports</h5>
            <p className="reports-subtitle">
              Collections of analyses you've saved for future reference
            </p>
          </div>
          <div className="reports-search">
            <Search size={16} className="reports-search-icon" />
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="reports-search-input"
            />
          </div>
        </div>

        <div className="reports-list">
          {reports.length > 0 ? (
            reports.map((report, index) => {
              const reportId = report?._id || report?.id;
              const reportKey = reportId || report?.query || report?.title || report?.createdAt || index;
              const dominantSentiment = getDominantSentiment(report);
              const sentimentColor = getSentimentColor(dominantSentiment);
              const sentimentPercent = getSentimentPercent(report, dominantSentiment);
              const isViewing = viewingReportId === reportId;
              const isDownloading = downloadingReportId === reportId;
              const isDeleting = deletingReportId === reportId;
              const canView = !!reportId && !isDeleting && !isDownloading && !isViewing;
              const projectName = report?.project?.name;
              
              return (
                <div
                  key={reportKey}
                  className={`report-item ${canView ? 'report-item-clickable' : ''} ${isDeleting ? 'report-item-deleting' : ''}`}
                  role={canView ? 'button' : undefined}
                  tabIndex={canView ? 0 : undefined}
                  onClick={() => {
                    if (!canView) return;
                    onViewReport?.(report);
                  }}
                  onKeyDown={(e) => {
                    if (!canView) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onViewReport?.(report);
                    }
                  }}
                >
                  <div className="report-main">
                    <div className="report-title-row">
                      <h6 className="report-title">{report?.query || report?.title || 'Untitled report'}</h6>
                      {projectName ? (
                        <span className="report-project-pill">Project: {projectName}</span>
                      ) : null}
                    </div>
                    <div className="report-meta">
                      <Calendar size={14} />
                      <span>{formatDate(report?.createdAt || report?.date)}</span>
                    </div>
                  </div>

                  <div className="report-side">
                    <div className="report-sentiment">
                      <span className="report-sentiment-label">Sentiment</span>
                      <span className="report-sentiment-score" style={{ color: sentimentColor }}>
                        {sentimentPercent !== null ? `${sentimentPercent}%` : 'N/A'}
                      </span>
                      <span className={`report-sentiment-chip ${dominantSentiment || 'neutral'}`}>
                        {formatSentimentLabel(dominantSentiment)}
                      </span>
                    </div>

                    <div className="report-actions">
                      <Button
                        color="light"
                        className="report-action-btn report-action-icon report-action-tooltip"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignProject?.(report);
                        }}
                        disabled={!reportId || isDeleting || isViewing || isDownloading}
                        data-tooltip="Add to project"
                        aria-label="Add to project"
                      >
                        <FolderPlus size={16} />
                      </Button>
                      <Button
                        color="light"
                        className="report-action-btn report-action-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadReport?.(report);
                        }}
                        disabled={!reportId || isDownloading || isViewing || isDeleting}
                      >
                        {isDownloading ? (
                          <span className="skeleton-line skeleton-inline" style={{ width: '16px', height: '16px' }} />
                        ) : (
                          <Download size={16} />
                        )}
                      </Button>
                      <Button
                        color="light"
                        className="report-action-btn report-action-icon report-action-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteReport?.(report);
                        }}
                        disabled={!reportId || isDeleting || isViewing || isDownloading}
                      >
                        {isDeleting ? (
                          <span className="skeleton-line skeleton-inline" style={{ width: '16px', height: '16px' }} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-5">
              <p className="text-muted fs-5">No reports found</p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

import React from 'react';
import { Card, CardBody, Button, InputGroup, Input } from 'reactstrap';
import { Calendar, Eye, Download, Search, Trash2, FolderPlus } from 'lucide-react';

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

  return (
    <Card className="border-1 shadow-sm">
      <CardBody>
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h5 className="fw-semibold mb-1">Your Reports</h5>
            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
              Collections of analyses you've saved for future reference
            </p>
          </div>
          <InputGroup style={{ width: '250px' }}>
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-end-0"
            />
            <Button color="light" className="border border-start-0">
              <Search size={18} />
            </Button>
          </InputGroup>
        </div>

        <div className="d-flex flex-column gap-3">
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
              const projectName = report?.project?.name;
              
              return (
                <div
                  key={reportKey}
                  className={`d-flex justify-content-between align-items-center p-3 border rounded-2 bg-white ${isDeleting ? 'report-item-deleting' : ''}`}
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <div className="flex-grow-1">
                    <h6 className="mb-2 fw-medium">{report?.query || report?.title || 'Untitled report'}</h6>
                    <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '13px' }}>
                      <Calendar size={14} />
                      <span>{formatDate(report?.createdAt || report?.date)}</span>
                    </div>
                    {projectName ? (
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        Project: {projectName}
                      </div>
                    ) : null}
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                      <p className="text-muted mb-0 fs-6" >
                        Sentiment
                      </p>
                      <p 
                        className="fw-normal mb-0 fs-5" 
                        style={{ 
                          color: sentimentColor
                        }}
                      >
                        {sentimentPercent !== null ? `${sentimentPercent}%` : 'N/A'}
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                        {formatSentimentLabel(dominantSentiment)}
                      </p>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        color="light"
                        className="border-1 px-3"
                        onClick={() => onAssignProject?.(report)}
                        disabled={!reportId || isDeleting || isViewing || isDownloading}
                      >
                        <FolderPlus size={16} />
                      </Button>
                      <Button
                        color="light"
                        className="border-1 d-flex align-items-center gap-2 px-3"
                        onClick={() => onViewReport?.(report)}
                        disabled={!reportId || isViewing || isDownloading || isDeleting}
                      >
                        {isViewing ? (
                          <span className="skeleton-line skeleton-inline" style={{ width: '16px', height: '16px' }} />
                        ) : (
                          <Eye size={16} />
                        )}
                        <span>{isViewing ? 'Loading' : 'View'}</span>
                      </Button>
                      <Button
                        color="light"
                        className="border-1 px-3"
                        onClick={() => onDownloadReport?.(report)}
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
                        className="border-1 px-3"
                        onClick={() => onDeleteReport?.(report)}
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

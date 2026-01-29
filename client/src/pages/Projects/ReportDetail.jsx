import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'reactstrap';
import {
  Download,
  PencilLine,
  Save,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code
} from 'lucide-react';
import { marked } from 'marked';
import TurndownService from 'turndown';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../api/context/AppContext';
import reportService from '../../api/services/reportService';
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

const formatSourceLabel = (value) => {
  if (!value) return 'Unknown';
  return value
    .split('-')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
};

const normalizeSentiment = (value) => (value ? value.toLowerCase() : null);

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

export default function ReportDetailPanel({
  reportId,
  projectName,
  onBack,
  onRequestCloseProjectDetail,
  onDownload,
  rootLabel = 'Projects',
  rootIcon,
  showProjectCrumb = true,
  backAriaLabel
}) {
  const { showError, showSuccess } = useApp();
  const isEmbedded = Boolean(onRequestCloseProjectDetail);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftHtml, setDraftHtml] = useState('');
  const [editorSeed, setEditorSeed] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef(null);

  const turndownService = useMemo(() => new TurndownService({ headingStyle: 'atx' }), []);

  const reportTitle = report?.title || report?.query || 'Report';
  const avatarLetter = (reportTitle || 'R').trim().charAt(0).toUpperCase();
  const sentiment = normalizeSentiment(report?.sentiment?.overall);
  const sentimentColor = getSentimentColor(sentiment);
  const resolvedBackAriaLabel = backAriaLabel || `Back to ${rootLabel.toLowerCase()}`;

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const loadReport = async () => {
    if (!reportId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await reportService.getReportById(reportId);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to load report');
      }
      setReport(response.data);
      const content = response.data?.content || '';
      setDraftHtml(marked.parse(content));
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load report';
      setError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportId]);

  useEffect(() => {
    if (!isEditing || !editorRef.current) return;
    editorRef.current.innerHTML = editorSeed || '';
  }, [isEditing, editorSeed]);

  const handleEdit = () => {
    const content = report?.content || '';
    const html = marked.parse(content);
    setDraftHtml(html);
    setEditorSeed(html);
    setIsEditing(true);
  };

  const handleCancel = () => {
    const content = report?.content || '';
    const html = marked.parse(content);
    setDraftHtml(html);
    setEditorSeed(html);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!report) return;
    setIsSaving(true);
    try {
      const markdown = turndownService.turndown(draftHtml || '');
      const response = await reportService.updateReportContent(report._id, markdown);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update report');
      }
      setReport(response.data);
      const updatedContent = response.data?.content || '';
      setDraftHtml(marked.parse(updatedContent));
      setIsEditing(false);
      showSuccess('Report updated');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update report';
      showError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (onDownload && report) {
      onDownload(report);
    }
  };

  const handleToolbarAction = (command) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === 'link') {
      const url = window.prompt('Enter a link URL');
      if (url) {
        document.execCommand('createLink', false, url);
      }
      requestAnimationFrame(() => {
        if (editorRef.current) {
          setDraftHtml(editorRef.current.innerHTML);
        }
      });
      return;
    }

    if (command === 'h1' || command === 'h2' || command === 'h3') {
      document.execCommand('formatBlock', false, command);
      requestAnimationFrame(() => {
        if (editorRef.current) {
          setDraftHtml(editorRef.current.innerHTML);
        }
      });
      return;
    }

    if (command === 'blockquote') {
      document.execCommand('formatBlock', false, 'blockquote');
      requestAnimationFrame(() => {
        if (editorRef.current) {
          setDraftHtml(editorRef.current.innerHTML);
        }
      });
      return;
    }

    if (command === 'codeblock') {
      document.execCommand('formatBlock', false, 'pre');
      requestAnimationFrame(() => {
        if (editorRef.current) {
          setDraftHtml(editorRef.current.innerHTML);
        }
      });
      return;
    }

    document.execCommand(command, false, undefined);
    requestAnimationFrame(() => {
      if (editorRef.current) {
        setDraftHtml(editorRef.current.innerHTML);
      }
    });
  };

  const handleEditorInput = (event) => {
    setDraftHtml(event.currentTarget.innerHTML);
  };

  if (isLoading) {
    return (
      <div className={`analysis-detail-page ${isEmbedded ? 'is-embedded' : ''}`}>
        <div className={`analysis-detail-shell ${isEmbedded ? 'is-embedded' : ''}`} data-color-mode="light">
          <ProjectBreadcrumbs
            onBack={handleBack}
            projectName={projectName}
            analysisLabel={reportTitle}
            onProjectClick={projectName ? handleBack : undefined}
            rootLabel={rootLabel}
            rootIcon={rootIcon}
            showProjectCrumb={showProjectCrumb}
            backAriaLabel={resolvedBackAriaLabel}
          />
          <div className="analysis-detail-loading">
            <div className="skeleton-wrapper">
              <div className="skeleton-line" style={{ width: '40%' }} />
              <div className="skeleton-line" style={{ width: '70%' }} />
              <div className="skeleton-line" style={{ width: '55%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report || error) {
    return (
      <div className={`analysis-detail-page ${isEmbedded ? 'is-embedded' : ''}`}>
        <div className={`analysis-detail-shell ${isEmbedded ? 'is-embedded' : ''}`} data-color-mode="light">
          <ProjectBreadcrumbs
            onBack={handleBack}
            projectName={projectName}
            analysisLabel="Report"
            onProjectClick={projectName ? handleBack : undefined}
            rootLabel={rootLabel}
            rootIcon={rootIcon}
            showProjectCrumb={showProjectCrumb}
            backAriaLabel={resolvedBackAriaLabel}
          />
          <div className="analysis-detail-loading">
            <p className="text-muted">{error || 'Report not found.'}</p>
            <Button color="primary" onClick={handleBack}>
              Back to Reports
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`analysis-detail-page ${isEmbedded ? 'is-embedded' : ''}`}>
      <div className={`analysis-detail-shell ${isEmbedded ? 'is-embedded' : ''}`} data-color-mode="light">
        <ProjectBreadcrumbs
          onBack={handleBack}
          projectName={projectName}
          analysisLabel={reportTitle}
          onProjectClick={projectName ? handleBack : undefined}
          rootLabel={rootLabel}
          rootIcon={rootIcon}
          showProjectCrumb={showProjectCrumb}
          backAriaLabel={resolvedBackAriaLabel}
        />
        <div className="analysis-detail-hero report-detail-hero">
          <div className="analysis-detail-hero-top">
            <div className="analysis-detail-hero-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="analysis-detail-action primary"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="analysis-detail-action"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" className="analysis-detail-action" onClick={handleEdit}>
                  <PencilLine size={16} />
                  Edit
                </button>
              )}
              <button
                type="button"
                className="analysis-detail-action"
                onClick={handleDownload}
                disabled={!report}
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>

          <div className="analysis-detail-hero-main">
            <div className="analysis-detail-title-group">
              <div className="analysis-detail-avatar">{avatarLetter}</div>
              <div>
                <div className="analysis-detail-source">{formatSourceLabel(report.source)}</div>
                <h1>{reportTitle}</h1>
              </div>
            </div>
            <div className="analysis-detail-meta-row">
              <div className="analysis-detail-meta">
                <span>{report.totalAnalyzed || 0} posts</span>
                <span>•</span>
                <span>{formatDate(report.createdAt)}</span>
              </div>
              <span
                className="analysis-card-sentiment report-detail-sentiment"
                style={{
                  color: sentimentColor,
                  borderColor: sentimentColor,
                  background: getSentimentTint(sentiment)
                }}
              >
                {sentiment ? sentiment[0].toUpperCase() + sentiment.slice(1) : 'Unknown'}
              </span>
            </div>
          </div>
          <div className="header-comments-row">
            <HeaderComments
              entityType="report"
              entityId={report?._id}
              initialComments={report?.comments}
            />
          </div>
        </div>

        <div className="analysis-detail-body">
          <div className="analysis-detail-content report-detail-content">
            {isEditing ? (
              <div className="report-detail-editor">
                <div className="report-editor-toolbar">
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('h1')}
                    aria-label="Heading 1"
                  >
                    <Heading1 size={16} />
                  </button>
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('h2')}
                    aria-label="Heading 2"
                  >
                    <Heading2 size={16} />
                  </button>
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('h3')}
                    aria-label="Heading 3"
                  >
                    <Heading3 size={16} />
                  </button>
                  <div className="report-editor-divider" />
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('bold')}
                    aria-label="Bold"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('italic')}
                    aria-label="Italic"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('underline')}
                    aria-label="Underline"
                  >
                    <Underline size={16} />
                  </button>
                  <div className="report-editor-divider" />
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('insertUnorderedList')}
                    aria-label="Bulleted list"
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('insertOrderedList')}
                    aria-label="Numbered list"
                  >
                    <ListOrdered size={16} />
                  </button>
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('blockquote')}
                    aria-label="Quote"
                  >
                    <Quote size={16} />
                  </button>
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('codeblock')}
                    aria-label="Code block"
                  >
                    <Code size={16} />
                  </button>
                  <button
                    type="button"
                    className="report-editor-btn"
                    onClick={() => handleToolbarAction('link')}
                    aria-label="Insert link"
                  >
                    <Link2 size={16} />
                  </button>
                </div>
                <div
                  ref={editorRef}
                  className="report-editor-surface"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  data-placeholder="Start editing the report..."
                />
              </div>
            ) : (
              <div className="analysis-detail-card report-detail-markdown">
                <ReactMarkdown>{report.content || ''}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

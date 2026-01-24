import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PageHeader from '../../components/PageHeader/PageHeader';
import ReportsList from './components/ReportsList';
import EmptyReports from './components/EmptyReports';
import ReportModal from '../Chat/components/ReportModal';
import reportService from '../../api/services/reportService';
import { useApp } from '../../api/context/AppContext';
import './Reports.css';

const PDF_PAGE = {
  width: 612,
  height: 792,
  margin: 72,
  fontSize: 12,
  lineHeight: 14,
  maxCharsPerLine: 80
};

const toPlainText = (content) => {
  if (!content) return '';
  let text = content;
  text = text.replace(/```([\s\S]*?)```/g, '$1');
  text = text.replace(/`([^`]+)`/g, '$1');
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  text = text.replace(/^\s*[-*+]\s+/gm, '- ');
  text = text.replace(/^\s*\d+\.\s+/gm, (match) => match.trimStart());
  text = text.replace(/^\s*>\s?/gm, '');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/~~([^~]+)~~/g, '$1');
  return text;
};

const wrapText = (text, maxChars) => {
  const lines = [];
  const sourceLines = text.split(/\r?\n/);
  sourceLines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    if (!line) {
      lines.push('');
      return;
    }
    const words = line.split(/\s+/);
    let current = '';
    words.forEach((word) => {
      if (!current) {
        current = word;
        return;
      }
      if (current.length + 1 + word.length <= maxChars) {
        current += ` ${word}`;
      } else {
        lines.push(current);
        current = word;
      }
    });
    if (current) lines.push(current);
  });
  return lines;
};

const escapePdfText = (text) =>
  text
    .replace(/[^\x00-\x7F]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const buildPdfBlob = (markdown) => {
  const plainText = toPlainText(markdown);
  const lines = wrapText(plainText, PDF_PAGE.maxCharsPerLine);
  const maxLinesPerPage = Math.floor((PDF_PAGE.height - PDF_PAGE.margin * 2) / PDF_PAGE.lineHeight);
  const pages = [];
  for (let i = 0; i < lines.length; i += maxLinesPerPage) {
    pages.push(lines.slice(i, i + maxLinesPerPage));
  }
  if (pages.length === 0) pages.push(['']);

  let nextId = 1;
  const catalogId = nextId++;
  const pagesId = nextId++;
  const fontId = nextId++;
  const pageIds = [];
  const contentIds = [];
  const objects = {};

  pages.forEach((pageLines) => {
    const pageId = nextId++;
    const contentId = nextId++;
    pageIds.push(pageId);
    contentIds.push(contentId);

    const textLines = pageLines.map((line, index) => {
      const prefix = index === 0
        ? `${PDF_PAGE.margin} ${PDF_PAGE.height - PDF_PAGE.margin} Td`
        : `0 -${PDF_PAGE.lineHeight} Td`;
      return `${prefix}\n(${escapePdfText(line)}) Tj`;
    });

    const stream = `BT\n/F1 ${PDF_PAGE.fontSize} Tf\n${textLines.join('\n')}\nET`;
    objects[contentId] = `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`;
    objects[pageId] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PDF_PAGE.width} ${PDF_PAGE.height}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
  });

  objects[catalogId] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  const encoder = new TextEncoder();

  for (let id = 1; id < nextId; id += 1) {
    offsets[id] = encoder.encode(pdf).length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }

  const xrefOffset = encoder.encode(pdf).length;
  pdf += 'xref\n';
  pdf += `0 ${nextId}\n`;
  pdf += '0000000000 65535 f \n';
  for (let id = 1; id < nextId; id += 1) {
    const offset = String(offsets[id]).padStart(10, '0');
    pdf += `${offset} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${nextId} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

export default function Reports() {
  const { showError, showSuccess } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [viewingReportId, setViewingReportId] = useState(null);
  const [downloadingReportId, setDownloadingReportId] = useState(null);
  const [deletingReportId, setDeletingReportId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const reportCacheRef = useRef({});

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setListError(null);

    try {
      const response = await reportService.getReports();
      if (response?.success) {
        const data = Array.isArray(response.data) ? response.data : [];
        setReports(data);
      } else {
        throw new Error(response?.message || 'Failed to load reports');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load reports';
      setListError(message);
      showError(message);
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = reports.filter((report) => {
    const query = report?.query || report?.title || '';
    return query.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getReportId = (report) => report?._id || report?.id;

  const fetchReportDetails = async (reportId) => {
    const cached = reportCacheRef.current[reportId];
    if (cached?.content) return cached;

    const response = await reportService.getReportById(reportId);
    if (response?.success && response.data) {
      reportCacheRef.current[reportId] = response.data;
      return response.data;
    }

    throw new Error(response?.message || 'Failed to load report');
  };

  const buildReportFilename = (report) => {
    const nameSource = report?.query || report?.title || 'analysis';
    const slug = nameSource.trim().toLowerCase().replace(/\s+/g, '-');
    return `sentiment-report-${slug || 'analysis'}-${Date.now()}.pdf`;
  };

  const downloadReportFile = (report) => {
    if (!report?.content) return false;

    const blob = buildPdfBlob(report.content);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = buildReportFilename(report);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  };

  const handleViewReport = async (report) => {
    const reportId = getReportId(report);
    if (!reportId) {
      showError('Report ID missing');
      return;
    }

    setIsModalOpen(true);
    setActiveReport(null);
    setModalError(null);
    setIsReportLoading(true);
    setViewingReportId(reportId);

    try {
      const fullReport = await fetchReportDetails(reportId);
      setActiveReport(fullReport);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load report';
      setModalError(message);
      showError(message);
    } finally {
      setIsReportLoading(false);
      setViewingReportId(null);
    }
  };

  const handleDownloadReport = async (report) => {
    const reportId = getReportId(report);
    if (!reportId) {
      showError('Report ID missing');
      return;
    }

    setDownloadingReportId(reportId);

    try {
      const fullReport = await fetchReportDetails(reportId);
      if (!downloadReportFile(fullReport)) {
        throw new Error('Report content is unavailable for download');
      }
      showSuccess('Report downloaded');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to download report';
      showError(message);
    } finally {
      setDownloadingReportId(null);
    }
  };

  const handleDownloadActiveReport = () => {
    if (!activeReport?.content) {
      showError('Report content is unavailable for download');
      return;
    }

    downloadReportFile(activeReport);
    showSuccess('Report downloaded');
  };

  const toggleModal = () => {
    if (isReportLoading) return;
    setIsModalOpen((prev) => !prev);
    if (isModalOpen) {
      setActiveReport(null);
      setModalError(null);
    }
  };

  const handleDeleteReport = async (report) => {
    setReportToDelete(report);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    const reportId = getReportId(reportToDelete);
    if (!reportId) {
      showError('Report ID missing');
      setIsDeleteModalOpen(false);
      setReportToDelete(null);
      return;
    }

    setDeletingReportId(reportId);

    // Close modal immediately for smoother UX
    setIsDeleteModalOpen(false);

    try {
      const response = await reportService.deleteReport(reportId);
      if (response?.success) {
        // Clear cache for deleted report
        delete reportCacheRef.current[reportId];

        // Update state to remove the deleted report without reloading
        setReports((prevReports) => prevReports.filter((r) => getReportId(r) !== reportId));

        showSuccess('Report deleted successfully');
      } else {
        throw new Error(response?.message || 'Failed to delete report');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to delete report';
      showError(message);
    } finally {
      setDeletingReportId(null);
      setReportToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setReportToDelete(null);
  };

  return (
    <div className="reports-page">
      <Container className="mt-5">
        <Row>
          <Col>
              <PageHeader 
                title="Reports"
                subtitle="Generate, schedule, and view sentiment analysis reports"
              />

            {isLoading ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
              </div>
            ) : listError ? (
              <div className="text-center py-5">
                <p className="text-danger mb-3">{listError}</p>
                <Button color="primary" onClick={fetchReports}>
                  Try Again
                </Button>
              </div>
            ) : reports.length === 0 ? (
              <EmptyReports />
            ) : (
              <ReportsList
                reports={filteredReports}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onViewReport={handleViewReport}
                onDownloadReport={handleDownloadReport}
                onDeleteReport={handleDeleteReport}
                viewingReportId={viewingReportId}
                downloadingReportId={downloadingReportId}
                deletingReportId={deletingReportId}
              />
            )}
          </Col>
        </Row>
      </Container>

      <ReportModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        isGenerating={isReportLoading}
        report={activeReport}
        error={modalError}
        onDownload={handleDownloadActiveReport}
        loadingTitle="Loading Report..."
        loadingDescription="Fetching the saved report content."
        successMessage="Report ready"
      />

      <Modal isOpen={isDeleteModalOpen} toggle={cancelDelete} centered>
        <ModalHeader toggle={cancelDelete}>Delete Report</ModalHeader>
        <ModalBody>
          <p className="mb-0">
            Are you sure you want to delete the report for{' '}
            <strong>{reportToDelete?.query || reportToDelete?.title || 'this analysis'}</strong>?
          </p>
          <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.875rem' }}>
            This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={cancelDelete} disabled={!!deletingReportId}>
            Cancel
          </Button>
          <Button color="danger" onClick={confirmDelete} disabled={!!deletingReportId}>
            {deletingReportId ? (
              <>
                <Spinner size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

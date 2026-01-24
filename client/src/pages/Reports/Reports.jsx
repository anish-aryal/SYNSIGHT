import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import PageHeader from '../../components/PageHeader/PageHeader';
import ReportsList from './components/ReportsList';
import EmptyReports from './components/EmptyReports';
import ReportModal from '../Chat/components/ReportModal';
import reportService from '../../api/services/reportService';
import { useApp } from '../../api/context/AppContext';
import './Reports.css';

const getFilenameFromHeaders = (headers) => {
  const disposition = headers?.['content-disposition'] || headers?.get?.('content-disposition');
  if (!disposition) return null;
  const match = disposition.match(/filename="([^"]+)"/i);
  return match?.[1] || null;
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

  const downloadReportFile = async (report) => {
    const reportId = getReportId(report);
    if (!reportId) return false;

    const response = await reportService.downloadReportPdf(reportId);
    const filename = getFilenameFromHeaders(response.headers) || buildReportFilename(report);
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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
      if (!(await downloadReportFile(report))) {
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

  const handleDownloadActiveReport = async () => {
    if (!activeReport) {
      showError('Report content is unavailable for download');
      return;
    }

    try {
      await downloadReportFile(activeReport);
      showSuccess('Report downloaded');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to download report';
      showError(message);
    }
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

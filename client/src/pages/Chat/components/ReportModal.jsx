import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Row,
  Col
} from 'reactstrap';
import { FileText, Download, X, CheckCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './ReportModal.css';

export default function ReportModal({
  isOpen,
  toggle,
  isGenerating,
  report,
  error,
  onDownload
}) {
  return (
    <Modal isOpen={isOpen} toggle={!isGenerating ? toggle : undefined} size="lg" className="report-modal">
      <ModalHeader toggle={!isGenerating ? toggle : undefined} className="report-modal-header">
        <div className="d-flex align-items-center gap-2">
          <FileText size={20} />
          <span>Sentiment Analysis Report</span>
        </div>
      </ModalHeader>

      <ModalBody className="report-modal-body">
        {isGenerating && (
          <Row>
            <Col xs={12}>
              <div className="report-loading">
                <Spinner color="primary" />
                <h5 className="mt-3 mb-2">Generating Report...</h5>
                <p className="text-muted">
                  AI is analyzing the data and creating insights. This may take 15-30 seconds.
                </p>
              </div>
            </Col>
          </Row>
        )}

        {error && !isGenerating && (
          <Row>
            <Col xs={12}>
              <div className="report-error">
                <AlertCircle size={48} className="text-danger mb-3" />
                <h5 className="mb-2">Failed to Generate Report</h5>
                <p className="text-muted">{error}</p>
                <Button color="primary" outline onClick={toggle}>
                  Close
                </Button>
              </div>
            </Col>
          </Row>
        )}

        {report && !isGenerating && !error && (
          <Row>
            <Col xs={12}>
              <div className="report-success-badge">
                <CheckCircle size={16} />
                <span>Report generated successfully</span>
              </div>
              <div className="report-content">
                <ReactMarkdown>{report.content}</ReactMarkdown>
              </div>
            </Col>
          </Row>
        )}
      </ModalBody>

      {report && !isGenerating && !error && (
        <ModalFooter className="report-modal-footer">
          <div className="report-meta">
            <span className="text-muted">
              {report.usage?.total_tokens || 0} tokens used
            </span>
          </div>
          <div className="d-flex gap-2">
            <Button color="secondary" outline onClick={toggle}>
              <X size={16} className="me-1" />
              Close
            </Button>
            <Button color="primary" onClick={onDownload}>
              <Download size={16} className="me-1" />
              Download
            </Button>
          </div>
        </ModalFooter>
      )}
    </Modal>
  );
}
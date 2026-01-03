import React, { useState } from 'react';
import { Row, Col, Badge, Collapse } from 'reactstrap';
import { TrendingUp, Minus, TrendingDown, FileText, Clock, ChevronDown, ChevronUp, Settings, CheckCircle } from 'lucide-react';

export default function SummaryHeader({ query, percentages, totalAnalyzed, dateRange, platforms }) {
  const [configOpen, setConfigOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  const getPlatformNames = () => {
    if (!platforms || platforms.length === 0) return 'social media';
    return platforms.join(', ');
  };

  const getDateRange = () => {
    if (!dateRange) return 'last 7 days';
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return `last ${days} days`;
  };

  return (
    <div>
      <Row className="mb-3">
        <Col xs={12}>
          <p className="summary-text">
            I've analyzed the sentiment for "<strong>{query}</strong>" across {getPlatformNames()} ({getDateRange()}). Here's what I found:
          </p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12}>
          <div className="summary-badges">
            <Badge className="sentiment-badge positive">
              <TrendingUp size={12} />
              {percentages?.positive || 0}% Positive
            </Badge>
            <Badge className="sentiment-badge neutral">
              <Minus size={12} />
              {percentages?.neutral || 0}% Neutral
            </Badge>
            <Badge className="sentiment-badge negative">
              <TrendingDown size={12} />
              {percentages?.negative || 0}% Negative
            </Badge>
            <Badge className="info-badge">
              <FileText size={12} />
              {formatNumber(totalAnalyzed)} posts
            </Badge>
            <Badge className="info-badge">
              <Clock size={12} />
              {getDateRange()}
            </Badge>
          </div>
        </Col>
      </Row>

      <Row className="mb-2">
        <Col xs={12}>
          <div className="config-section">
            <button 
              className="config-toggle"
              onClick={() => setConfigOpen(!configOpen)}
            >
              <span className="d-flex align-items-center gap-2">
                <Settings size={14} />
                Analysis Configuration
              </span>
              {configOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <Collapse isOpen={configOpen}>
              <div className="p-3 border-top bg-light">
                <Row>
                  <Col xs={12}>
                    <div className="d-flex flex-column gap-2 normal-regular">
                      <div><strong>Platforms:</strong> {getPlatformNames()}</div>
                      <div><strong>Max Results:</strong> 100 per platform</div>
                      <div><strong>Language:</strong> English</div>
                      <div><strong>Filter:</strong> Spam & promotional content removed</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <div className="config-section">
            <button 
              className="config-toggle"
              onClick={() => setPipelineOpen(!pipelineOpen)}
            >
              <span className="d-flex align-items-center gap-2">
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
              <div className="p-3 border-top bg-light">
                <Row>
                  <Col xs={12}>
                    <div className="d-flex flex-column gap-2 normal-regular">
                      <div className="d-flex align-items-center gap-2 text-success">
                        <CheckCircle size={12} /> Data fetching completed
                      </div>
                      <div className="d-flex align-items-center gap-2 text-success">
                        <CheckCircle size={12} /> Content filtering applied
                      </div>
                      <div className="d-flex align-items-center gap-2 text-success">
                        <CheckCircle size={12} /> Sentiment analysis completed
                      </div>
                      <div className="d-flex align-items-center gap-2 text-success">
                        <CheckCircle size={12} /> Insights generated
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Collapse>
          </div>
        </Col>
      </Row>
    </div>
  );
}
import React from 'react';
import { Row, Col } from 'reactstrap';
import SummaryHeader from './SummaryHeader';
import KeyInsightsCard from './KeyInsightsCard';
import SentimentTabs from './SentimentTabs';
import PostVolumeChart from './PostVolumeChart';
import TopKeywordsChart from './TopKeywordsChart';
import SamplePostsList from './SamplePostsList';
import ActionBar from './ActionBar';
import './AnalysisResults.css';

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

  const { 
    analysisId,
    percentages,
    topKeywords = [],      
    insights,              
    samplePosts = [],      
    totalAnalyzed = 0,
    source = 'multi-platform',
    platformBreakdown = [],
    processingTime,
    dateRange,
    platforms
  } = results;

  return (
    <div className="analysis-results">
      <Row>
        <Col xs={12}>
          <SummaryHeader 
            query={query}
            percentages={percentages}
            totalAnalyzed={totalAnalyzed}
            dateRange={dateRange}
            platforms={platformBreakdown.map(p => p.platform)}
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <KeyInsightsCard insights={insights} />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <SentimentTabs 
            percentages={percentages}
            platformBreakdown={platformBreakdown}
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <PostVolumeChart platforms={platforms} />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <TopKeywordsChart keywords={topKeywords} />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <SamplePostsList posts={samplePosts} />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <ActionBar 
            analysisId={analysisId} 
            query={query}
            results={results}
          />
        </Col>
      </Row>
    </div>
  );
}
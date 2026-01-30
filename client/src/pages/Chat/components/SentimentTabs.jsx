import React, { useState } from 'react';
import { Row, Col, Nav, NavItem, NavLink, TabContent, TabPane } from 'reactstrap';
import OverallSentiment from './OverallSentiment';
import PlatformBreakdown from './PlatformBreakdown';

// Sentiment Tabs UI block for Chat page.

export default function SentimentTabs({ percentages, platformBreakdown }) {
  const [activeTab, setActiveTab] = useState('overall');

  // Layout and appearance
  return (
    <div className="sentiment-tabs-container">
      <Nav tabs className="sentiment-tab-buttons border-0">
        <NavItem className="flex-fill">
          <NavLink
            className={`sentiment-tab-btn text-center ${activeTab === 'overall' ? 'active' : ''}`}
            onClick={() => setActiveTab('overall')}
          >
            Overall Sentiment
          </NavLink>
        </NavItem>
        <NavItem className="flex-fill">
          <NavLink
            className={`sentiment-tab-btn text-center ${activeTab === 'platform' ? 'active' : ''}`}
            onClick={() => setActiveTab('platform')}
          >
            By Platform
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab} className="sentiment-tab-content">
        <TabPane tabId="overall">
          <Row>
            <Col xs={12}>
              <OverallSentiment percentages={percentages} />
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="platform">
          <Row>
            <Col xs={12}>
              <PlatformBreakdown platformBreakdown={platformBreakdown} />
            </Col>
          </Row>
        </TabPane>
      </TabContent>
    </div>
  );
}
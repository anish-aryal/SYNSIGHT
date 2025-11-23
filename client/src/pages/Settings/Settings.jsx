import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PageHeader from '../../components/PageHeader/PageHeader';
import SettingsTabs from './components/SettingsTabs';
import ProfileSettings from './components/ProfileSettings';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="settings-page">
      <Container className="mt-5">
        <Row>
          <Col>
            <PageHeader 
              title="Settings"
              subtitle="Manage your account settings and preferences"
            />
            
            <SettingsTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <div className="mt-4">
              <ProfileSettings />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
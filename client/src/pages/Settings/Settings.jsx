import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PageHeader from '../../components/PageHeader/PageHeader';
import SettingsTabs from './components/SettingsTabs';
import ProfileSettings from './components/ProfileSettings';
import NotificationsSettings from './components/NotificationsSettings';
import PreferencesSettings from './components/PreferenceSettings';
import SecuritySettings from './components/SecuritySettings';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'preferences':
        return <PreferencesSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'billing':
        return <div className="text-center py-5 text-muted">Billing settings coming soon...</div>;
      default:
        return <ProfileSettings />;
    }
  };

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
              {renderTabContent()}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

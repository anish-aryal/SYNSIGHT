import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import PageHeader from '../../components/PageHeader/PageHeader';
import SettingsTabs from './components/SettingsTabs';
import ProfileSettings from './components/ProfileSettings';
import NotificationsSettings from './components/NotificationsSettings';
import PreferencesSettings from './components/PreferenceSettings';
import SecuritySettings from './components/SecuritySettings';

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
        return (
          <div className="settings-upgrade">
            <div className="settings-upgrade-card">
              <div className="settings-upgrade-header">
                <div>
                  <h3>Upgrade to Pro</h3>
                  <p>Unlock advanced analytics, exports, and priority processing for your team.</p>
                </div>
                <span className="settings-upgrade-badge">Coming soon</span>
              </div>
              <div className="settings-upgrade-body">
                <div className="settings-upgrade-grid">
                  <div className="settings-upgrade-item">Unlimited projects &amp; reports</div>
                  <div className="settings-upgrade-item">Priority analysis queue</div>
                  <div className="settings-upgrade-item">Premium exports and sharing</div>
                </div>
                <div className="settings-upgrade-note">
                  We’re putting the finishing touches on pricing and billing. You’ll be able to upgrade here soon.
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="syn-page settings-page">
      <Container className="syn-page-container">
        <Row>
          <Col>
            <div className="syn-page-hero">
              <PageHeader
                title="Settings"
                subtitle="Manage your account settings and preferences"
              />
            </div>

            <SettingsTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <div className="syn-page-content">
              {renderTabContent()}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

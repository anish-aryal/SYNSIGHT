import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Label, Input } from 'reactstrap';
import { useAuth } from '../../../api/context/AuthContext';
import { useApp } from '../../../api/context/AppContext';
import { updatePreferences } from '../../../api/services/profileService';

// Notifications Settings UI block for Settings page.

export default function NotificationsSettings() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError, showInfo } = useApp();

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    sentimentAlerts: true,
    weeklyDigest: false,
    productUpdates: true
  });

  const [originalNotifications, setOriginalNotifications] = useState({
    emailNotifications: true,
    sentimentAlerts: true,
    weeklyDigest: false,
    productUpdates: true
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with user preferences
  useEffect(() => {
    if (user?.preferences) {
      const prefs = {
        emailNotifications: user.preferences.emailNotifications ?? true,
        sentimentAlerts: user.preferences.sentimentAlerts ?? true,
        weeklyDigest: user.preferences.weeklyDigest ?? false,
        productUpdates: user.preferences.productUpdates ?? true
      };
      setNotifications(prefs);
      setOriginalNotifications(prefs);
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    const changed = 
      notifications.emailNotifications !== originalNotifications.emailNotifications ||
      notifications.sentimentAlerts !== originalNotifications.sentimentAlerts ||
      notifications.weeklyDigest !== originalNotifications.weeklyDigest ||
      notifications.productUpdates !== originalNotifications.productUpdates;
    
    setHasChanges(changed);
  }, [notifications, originalNotifications]);

  const handleToggle = (name) => {
    setNotifications({
      ...notifications,
      [name]: !notifications[name]
    });
  };

  const handleSave = async () => {
    // Check if there are any changes
    if (!hasChanges) {
      showInfo('No changes to save');
      return;
    }

    setLoading(true);

    try {
      const response = await updatePreferences(notifications);

      if (response.success) {
        updateUser(response.data);
        setOriginalNotifications(notifications);
        showSuccess('Notification preferences updated successfully!');
        setHasChanges(false);
      }
    } catch (error) {
      showError(error.message || 'Failed to update notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Check if there are any changes
    if (!hasChanges) {
      showInfo('No changes to cancel');
      return;
    }

    setNotifications(originalNotifications);
    showInfo('Changes discarded');
  };

  const notificationItems = [
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive email notifications for important updates',
      value: notifications.emailNotifications
    },
    {
      id: 'sentimentAlerts',
      title: 'Sentiment Alerts',
      description: 'Get notified of significant sentiment changes',
      value: notifications.sentimentAlerts
    },
    {
      id: 'weeklyDigest',
      title: 'Weekly Digest',
      description: 'Receive a weekly summary of your analytics',
      value: notifications.weeklyDigest
    },
    {
      id: 'productUpdates',
      title: 'Product Updates',
      description: 'Stay updated on new features and improvements',
      value: notifications.productUpdates
    }
  ];

  // Layout and appearance
  return (
    <Card className="p-3 border-1 shadow-sm">
      <CardHeader className="bg-white border-bottom py-3">
        <span className="fw-semibold mb-1" style={{ fontSize: '20px' }}>
          Notification Preferences
        </span>
        <p className="text-muted mb-0">
          Manage how you receive notifications
        </p>
      </CardHeader>

      <CardBody className="py-4">
        {notificationItems.map((item, index) => (
          <div 
            key={item.id}
            className={`d-flex justify-content-between align-items-start py-3 ${
              index !== notificationItems.length - 1 ? 'border-bottom' : ''
            }`}
          >
            <div className="flex-grow-1">
              <h6 className="fw-semibold mb-1">{item.title}</h6>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                {item.description}
              </p>
            </div>
            <div className="form-check form-switch ms-3">
              <Input
                type="switch"
                id={item.id}
                checked={item.value}
                onChange={() => handleToggle(item.id)}
                disabled={loading}
              />
            </div>
          </div>
        ))}
      </CardBody>

      <CardFooter className="bg-white border-top pt-4">
        <div className="d-flex justify-content-end gap-3">
          <Button 
            color="light" 
            className="border-1 border-secondary-subtle px-4"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            className="gradient-primary border-0 px-4"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="skeleton-line skeleton-inline me-2" style={{ width: '60px', height: '12px' }} />
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

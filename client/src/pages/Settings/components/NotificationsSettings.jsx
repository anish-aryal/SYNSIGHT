import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Label } from 'reactstrap';
import { Input } from 'reactstrap';

export default function NotificationsSettings() {
  const [notifications, setNotifications] = useState({
    emailReports: true,
    sentimentAlerts: true,
    weeklyDigest: false,
    productUpdates: true
  });

  const handleToggle = (name) => {
    setNotifications({
      ...notifications,
      [name]: !notifications[name]
    });
  };

  const handleSave = () => {
    console.log('Saving notifications:', notifications);
  };

  const handleCancel = () => {
    setNotifications({
      emailReports: true,
      sentimentAlerts: true,
      weeklyDigest: false,
      productUpdates: true
    });
  };

  const notificationItems = [
    {
      id: 'emailReports',
      title: 'Email Reports',
      description: 'Receive email reports when analysis is complete',
      value: notifications.emailReports
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
                style={{ 
                  width: '3rem', 
                  height: '1.5rem',
                  cursor: 'pointer',
                }}
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
          >
            Cancel
          </Button>
          <Button 
            className="gradient-primary border-0 px-4"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
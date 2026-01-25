import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, FormGroup, Label, Input, Button, Badge } from 'reactstrap';
import { useAuth } from '../../../api/context/AuthContext';
import { useApp } from '../../../api/context/AppContext';
import { updatePassword, toggleTwoFactor, getActiveSessions, terminateSession } from '../../../api/services/profileService';

export default function SecuritySettings() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useApp();

  // Password Section State
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Two-Factor Section State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Active Sessions State
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [terminating, setTerminating] = useState(null);

  // Initialize two-factor status
  useEffect(() => {
    if (user?.twoFactorEnabled !== undefined) {
      setTwoFactorEnabled(user.twoFactorEnabled);
    }
  }, [user]);

  // Fetch active sessions
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const response = await getActiveSessions();
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Password handlers
  const handlePasswordChange = (field, value) => {
    setPasswords({
      ...passwords,
      [field]: value
    });

    if (passwordErrors[field]) {
      setPasswordErrors({
        ...passwordErrors,
        [field]: ''
      });
    }
  };

  const validatePasswords = () => {
    const newErrors = {};

    if (!passwords.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwords.currentPassword && passwords.newPassword && 
        passwords.currentPassword === passwords.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validatePasswords()) {
      return;
    }

    setPasswordLoading(true);

    try {
      const payload = {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      };

      const response = await updatePassword(payload);

      if (response.success) {
        showSuccess('Password updated successfully!');
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
      }
    } catch (error) {
      showError(error.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Two-Factor handlers
  const handleToggleTwoFactor = async () => {
    setTwoFactorLoading(true);

    try {
      const response = await toggleTwoFactor(!twoFactorEnabled);

      if (response.success) {
        updateUser(response.data);
        setTwoFactorEnabled(!twoFactorEnabled);
        showSuccess(
          !twoFactorEnabled 
            ? 'Two-factor authentication enabled successfully!' 
            : 'Two-factor authentication disabled successfully!'
        );
      }
    } catch (error) {
      showError(error.message || 'Failed to update two-factor authentication');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Session handlers
  const handleTerminateSession = async (sessionId) => {
    setTerminating(sessionId);

    try {
      const response = await terminateSession(sessionId);

      if (response.success) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        showSuccess('Session terminated successfully');
      }
    } catch (error) {
      showError(error.message || 'Failed to terminate session');
    } finally {
      setTerminating(null);
    }
  };

  return (
    <Card className="p-3 border-1 shadow-sm">
      <CardHeader className="bg-white border-bottom py-3">
        <span className="fw-semibold mb-1" style={{ fontSize: '20px' }}>
          Security Settings
        </span>
        <p className="text-muted mb-0">
          Manage your account security
        </p>
      </CardHeader>

      <CardBody className="py-4">
        {/* Password Change Section */}
        <div className="pb-4 mb-4 border-bottom">
          <FormGroup>
            <Label for="currentPassword" className="fw-semibold mb-2">
              Current Password
            </Label>
            <Input
              type="password"
              id="currentPassword"
              value={passwords.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              disabled={passwordLoading}
              className="bg-light border-0"
              invalid={!!passwordErrors.currentPassword}
            />
            {passwordErrors.currentPassword && (
              <div className="text-danger mt-1 small">{passwordErrors.currentPassword}</div>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="newPassword" className="fw-semibold mb-2">
              New Password
            </Label>
            <Input
              type="password"
              id="newPassword"
              value={passwords.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              disabled={passwordLoading}
              className="bg-light border-0"
              invalid={!!passwordErrors.newPassword}
            />
            {passwordErrors.newPassword && (
              <div className="text-danger mt-1 small">{passwordErrors.newPassword}</div>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="confirmPassword" className="fw-semibold mb-2">
              Confirm New Password
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              value={passwords.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              disabled={passwordLoading}
              className="bg-light border-0"
              invalid={!!passwordErrors.confirmPassword}
            />
            {passwordErrors.confirmPassword && (
              <div className="text-danger mt-1 small">{passwordErrors.confirmPassword}</div>
            )}
          </FormGroup>

          <Button 
            className="gradient-primary border-0 px-4 mt-3"
            onClick={handleUpdatePassword}
            disabled={passwordLoading}
          >
            {passwordLoading ? (
              <>
                <span className="skeleton-line skeleton-inline me-2" style={{ width: '60px', height: '12px' }} />
                <span>Updating...</span>
              </>
            ) : (
              'Update Password'
            )}
          </Button>
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="pb-4 mb-4 border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <h3 className="fw-semibold mb-1" style={{ fontSize: '16px' }}>
                Two-Factor Authentication
              </h3>
              <p className="text-muted mb-0 small">
                Add an extra layer of security to your account
              </p>
            </div>

            <Button 
              color={twoFactorEnabled ? 'secondary' : 'light'}
              className="border-1 px-4"
              onClick={handleToggleTwoFactor}
              disabled={twoFactorLoading}
            >
              {twoFactorLoading ? (
                <span className="skeleton-line skeleton-inline" style={{ width: '40px', height: '12px' }} />
              ) : (
                twoFactorEnabled ? 'Disable' : 'Enable'
              )}
            </Button>
          </div>
        </div>

        {/* Active Sessions Section */}
        <div className="pt-0">
          <h3 className="fw-semibold mb-3" style={{ fontSize: '16px' }}>
            Active Sessions
          </h3>

          {sessionsLoading ? (
            <div className="text-center py-4">
              <div className="skeleton-wrapper">
                <div className="skeleton-line" style={{ width: '55%' }} />
                <div className="skeleton-line" style={{ width: '80%' }} />
                <div className="skeleton-line" style={{ width: '65%' }} />
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-muted">No active sessions found</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="d-flex justify-content-between align-items-center p-3 bg-light rounded border"
                >
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-semibold">
                        {session.isCurrent ? 'Current Session' : session.device || 'Unknown Device'}
                      </span>
                      {session.isCurrent && (
                        <Badge color="dark" className="px-2 py-1">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="small text-muted d-flex align-items-center gap-2">
                      <span>{session.browser || 'Chrome'} on {session.os || 'macOS'}</span>
                      <span className="text-secondary">•</span>
                      <span>Active {session.lastActive || 'now'}</span>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button 
                      color="danger"
                      outline
                      size="sm"
                      className="px-3"
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={terminating === session.id}
                    >
                      {terminating === session.id ? (
                        <span className="skeleton-line skeleton-inline" style={{ width: '50px', height: '12px' }} />
                      ) : (
                        'Terminate'
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

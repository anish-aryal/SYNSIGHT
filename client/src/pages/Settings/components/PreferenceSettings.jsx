import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Label, Input, Spinner, FormGroup } from 'reactstrap';
import { useAuth } from '../../../api/context/AuthContext';
import { useApp } from '../../../api/context/AppContext';
import { updatePreferences } from '../../../api/services/profileService';

export default function PreferencesSettings() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError, showInfo } = useApp();

  const [preferences, setPreferences] = useState({
    defaultTimeRange: 'last7days',
    defaultPlatform: 'all',
    theme: 'light',
    language: 'en'
  });

  const [originalPreferences, setOriginalPreferences] = useState({
    defaultTimeRange: 'last7days',
    defaultPlatform: 'all',
    theme: 'light',
    language: 'en'
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize with user preferences
  useEffect(() => {
    if (user?.preferences) {
      const prefs = {
        defaultTimeRange: user.preferences.defaultTimeRange ?? 'last7days',
        defaultPlatform: user.preferences.defaultPlatform ?? 'all',
        theme: user.preferences.darkMode ? 'dark' : 'light',
        language: user.preferences.language ?? 'en'
      };
      setPreferences(prefs);
      setOriginalPreferences(prefs);
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    const changed = 
      preferences.defaultTimeRange !== originalPreferences.defaultTimeRange ||
      preferences.defaultPlatform !== originalPreferences.defaultPlatform ||
      preferences.theme !== originalPreferences.theme ||
      preferences.language !== originalPreferences.language;
    
    setHasChanges(changed);
  }, [preferences, originalPreferences]);

  const handleChange = (field, value) => {
    setPreferences({
      ...preferences,
      [field]: value
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
      const payload = {
        defaultTimeRange: preferences.defaultTimeRange,
        defaultPlatform: preferences.defaultPlatform,
        darkMode: preferences.theme === 'dark',
        language: preferences.language
      };

      const response = await updatePreferences(payload);

      if (response.success) {
        updateUser(response.data);
        setOriginalPreferences(preferences);
        showSuccess('Application preferences updated successfully!');
        setHasChanges(false);
      }
    } catch (error) {
      showError(error.message || 'Failed to update application preferences');
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

    setPreferences(originalPreferences);
    showInfo('Changes discarded');
  };

  const timeRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'lastyear', label: 'Last Year' },
    { value: 'alltime', label: 'All Time' }
  ];

  const platformOptions = [
    { value: 'all', label: 'All Platforms' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'reddit', label: 'Reddit' }
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (System)' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'np', label: 'Nepali' }
  ];

  return (
    <Card className="p-3 border-1 shadow-sm">
      <CardHeader className="bg-white border-bottom py-3">
        <span className="fw-semibold mb-1" style={{ fontSize: '20px' }}>
          Application Preferences
        </span>
        <p className="text-muted mb-0">
          Customize your application experience
        </p>
      </CardHeader>

      <CardBody className="py-4">
        {/* Default Time Range */}
        <FormGroup>
          <Label for="defaultTimeRange" className="fw-semibold mb-2">
            Default Time Range
          </Label>
          <Input
            type="select"
            id="defaultTimeRange"
            value={preferences.defaultTimeRange}
            onChange={(e) => handleChange('defaultTimeRange', e.target.value)}
            disabled={loading}
            className="bg-light border-0"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Input>
        </FormGroup>

        {/* Default Platform */}
        <FormGroup>
          <Label for="defaultPlatform" className="fw-semibold mb-2">
            Default Platforms
          </Label>
          <Input
            type="select"
            id="defaultPlatform"
            value={preferences.defaultPlatform}
            onChange={(e) => handleChange('defaultPlatform', e.target.value)}
            disabled={loading}
            className="bg-light border-0"
          >
            {platformOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Input>
        </FormGroup>

        {/* Theme */}
        <FormGroup>
          <Label for="theme" className="fw-semibold mb-2">
            Theme
          </Label>
          <Input
            type="select"
            id="theme"
            value={preferences.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            disabled={loading}
            className="bg-light border-0"
          >
            {themeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Input>
        </FormGroup>

        {/* Language */}
        <FormGroup>
          <Label for="language" className="fw-semibold mb-2">
            Language
          </Label>
          <Input
            type="select"
            id="language"
            value={preferences.language}
            onChange={(e) => handleChange('language', e.target.value)}
            disabled={loading}
            className="bg-light border-0"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Input>
        </FormGroup>
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
                <Spinner size="sm" className="me-2" />
                Saving...
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
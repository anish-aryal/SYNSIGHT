import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Form, FormGroup, Label, Input, Button, Spinner } from 'reactstrap';
import { Camera } from 'lucide-react';
import { useAuth } from '../../../api/context/AuthContext';
import { useApp } from '../../../api/context/AppContext';
import { updateProfile } from '../../../api/services/profileService';

export default function ProfileSettings() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError, showInfo } = useApp();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    role: ''
  });

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        company: user.company || '',
        role: user.role || ''
      });
      setAvatarUrl(user.avatar || null);
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    if (user) {
      const fullNameChanged = formData.fullName !== (user.fullName || user.name || '');
      const companyChanged = formData.company !== (user.company || '');
      const roleChanged = formData.role !== (user.role || '');
      const avatarChanged = avatarUrl !== (user.avatar || null);

      setHasChanges(fullNameChanged || companyChanged || roleChanged || avatarChanged);
    }
  }, [formData, avatarUrl, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        showError('Please upload a JPG, PNG, or GIF image.');
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('File size must be less than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    // Validate full name (required)
    if (!formData.fullName || !formData.fullName.trim()) {
      showError('Full name is required');
      return false;
    }

    // Validate full name length
    if (formData.fullName.trim().length < 2) {
      showError('Full name must be at least 2 characters');
      return false;
    }

    if (formData.fullName.trim().length > 100) {
      showError('Full name must not exceed 100 characters');
      return false;
    }

    // Validate company length if provided
    if (formData.company && formData.company.trim().length > 100) {
      showError('Company name must not exceed 100 characters');
      return false;
    }

    // Validate role length if provided
    if (formData.role && formData.role.trim().length > 100) {
      showError('Role must not exceed 100 characters');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    // Check if there are any changes
    if (!hasChanges) {
      showInfo('No changes to save');
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        company: formData.company.trim(),
        role: formData.role.trim(),
        avatar: avatarUrl
      };

      const response = await updateProfile(payload);
      
      if (response.success) {
        updateUser(response.data);
        showSuccess(response.message || 'Profile updated successfully!');
        setHasChanges(false);
      }
    } catch (error) {
      // Display backend error message
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        company: user.company || '',
        role: user.role || ''
      });
      setAvatarUrl(user.avatar || null);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    showInfo('Changes discarded');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="p-3 border-1 shadow-sm">
      <CardHeader className="bg-white border-bottom py-3">
        <span className="fw-semibold mb-1" style={{ fontSize: '20px' }}>Profile Information</span>
        <p className="text-muted mb-0">
          Update your personal details
        </p>
      </CardHeader>

      <CardBody>
        <div className="d-flex align-items-center gap-3 mb-4 py-4">
          <div 
            className="position-relative"
            style={{ cursor: 'pointer' }}
            onClick={handleAvatarClick}
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile Avatar"
                className="rounded-circle"
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div 
                className="rounded-circle bg-light d-flex align-items-center justify-content-center text-muted"
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  fontSize: '24px', 
                  fontWeight: '600'
                }}
              >
                {getInitials(formData.fullName)}
              </div>
            )}
            
            <div 
              className="position-absolute bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={{ 
                width: '30px', 
                height: '30px', 
                bottom: '0', 
                right: '0',
                border: '2px solid white'
              }}
            >
              <Camera size={20} className="text-muted" />
            </div>
          </div>

          <div className="flex-grow-1">
            <Button 
              color="light" 
              className="border-1 px-3 py-2 mb-2"
              onClick={handleAvatarClick}
              disabled={loading}
            >
              Change Avatar
            </Button>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        <Form>
          <FormGroup>
            <Label for="fullName" className="fw-medium mb-2">
              Full Name <span className="text-danger">*</span>
            </Label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="bg-light border-0"
              disabled={loading}
              required
              maxLength={100}
            />
          </FormGroup>

          <FormGroup>
            <Label for="email" className="fw-medium mb-2">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-light border-0"
              disabled
            />
            <small className="text-muted">Email cannot be changed</small>
          </FormGroup>

          <FormGroup>
            <Label for="company" className="fw-medium mb-2">Company</Label>
            <Input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Your company name"
              className="bg-light border-0"
              disabled={loading}
              maxLength={100}
            />
          </FormGroup>

          <FormGroup>
            <Label for="role" className="fw-medium mb-2">Role</Label>
            <Input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="Your role"
              className="bg-light border-0"
              disabled={loading}
              maxLength={100}
            />
          </FormGroup>
        </Form>
      </CardBody>

      <CardFooter className="bg-white border-top pt-4">
        <div className="d-flex justify-content-end gap-3">
          {hasChanges && (
            <Button 
              color="light" 
              className="border-1 border-secondary-subtle px-4"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
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
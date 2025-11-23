import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { Camera } from 'lucide-react';

export default function ProfileSettings() {
  const [formData, setFormData] = useState({
    fullName: 'sfdsdf',
    email: 'sfdsdf@gmail.com',
    company: '',
    role: ''
  });

  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a JPG, PNG, or GIF image.');
        return;
      }

      // Validate file size (2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 2MB.');
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
  };

  const handleCancel = () => {
    setFormData({
      fullName: 'sfdsdf',
      email: 'sfdsdf@gmail.com',
      company: '',
      role: ''
    });
    setAvatarUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name) => {
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
        <p className="text-muted mb-0" >
          Update your personal details
        </p>
      </CardHeader>

      <CardBody>
        {/* Avatar Section */}
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
            
            {/* Camera Icon Overlay */}
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
            >
              Change Avatar
            </Button>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
              JPG, PNG or GIF. Max size 2MB.
            </p>
          </div>

          {/* Hidden File Input */}
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
            <Label for="fullName" className="fw-medium mb-2">Full Name</Label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="bg-light border-0"
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
            />
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
            />
          </FormGroup>
        </Form>
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
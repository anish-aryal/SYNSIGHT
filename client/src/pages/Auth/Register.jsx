import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import AuthLeftPanel from './components/AuthLeftPanel';
import SocialLoginButtons from './components/SocialLoginButtons';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Register:', formData);
  };

  const handleGoogleLogin = () => {
    console.log('Google signup');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook signup');
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 py-5">
          <Col lg={10} xl={10}>
            <div className="auth-wrapper">
              <AuthLeftPanel />

              <Card className="auth-right-card border-0 shadow-sm">
                <div className="auth-form-container">
                  <div className="mb-4">
                    <h2 className="fw-bold mb-2">Create account</h2>
                    <p className="text-muted mb-0">Get started with sentiment analysis</p>
                  </div>

                  <SocialLoginButtons 
                    onGoogleClick={handleGoogleLogin}
                    onFacebookClick={handleFacebookLogin}
                  />

                  <div className="auth-divider">
                    <span>OR CONTINUE WITH EMAIL</span>
                  </div>

                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label for="fullName" className="fw-medium mb-2">Full Name</Label>
                      <Input
                        type="text"
                        id="fullName"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="auth-input"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label for="email" className="fw-medium mb-2">Email address</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="auth-input"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label for="password" className="fw-medium mb-2">Password</Label>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        className="auth-input"
                      />
                      <small className="text-muted">Must be at least 8 characters</small>
                    </FormGroup>

                    <Button 
                      type="submit" 
                      className="auth-submit-btn gradient-primary border-0 w-100 mt-3"
                    >
                      Create Account
                    </Button>
                  </Form>

                  <div className="text-center mt-4">
                    <small className="text-muted">
                      By signing up, you agree to our{' '}
                      <Link to="/terms" className="auth-link">Terms</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                    </small>
                  </div>

                  <div className="text-center mt-3">
                    <span className="text-muted">Already have an account? </span>
                    <Link to="/login" className="auth-link">Sign in</Link>
                  </div>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
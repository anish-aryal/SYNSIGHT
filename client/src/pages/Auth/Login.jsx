import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, FormGroup, Label, Input, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import AuthLeftPanel from './components/AuthLeftPanel';
import SocialLoginButtons from './components/SocialLoginButtons';
import './Auth.css';

export default function Login() {
  const [formData, setFormData] = useState({
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
    console.log('Login:', formData);
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login');
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
                    <h2 className="fw-bold mb-2">Welcome back</h2>
                    <p className="text-muted mb-0">Sign in to continue your analysis</p>
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
                      <div className="d-flex justify-content-between mb-2">
                        <Label for="password" className="fw-medium mb-0">Password</Label>
                        <Link to="/forgot-password" className="auth-forgot-link">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className="auth-input"
                      />
                    </FormGroup>

                    <Button 
                      type="submit" 
                      className="auth-submit-btn gradient-primary border-0 w-100 mt-4"
                    >
                      Sign In
                    </Button>
                  </Form>

                  <div className="text-center mt-4">
                    <span className="text-muted">Don't have an account? </span>
                    <Link to="/register" className="auth-link">Sign up</Link>
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
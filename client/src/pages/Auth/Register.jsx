import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthLeftPanel from './components/AuthLeftPanel';
import SocialLoginButtons from './components/SocialLoginButtons';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        navigate('/verify-otp', { 
          state: { 
            email: formData.email,
            isLoginOtp: false 
          } 
        });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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

                  {error && <Alert color="danger" className="py-2 mb-3">{error}</Alert>}

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
                        required
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
                        required
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
                        required
                      />
                      <small className="text-muted">Must be at least 8 characters</small>
                    </FormGroup>

                    <FormGroup>
                      <Label for="confirmPassword" className="fw-medium mb-2">Confirm Password</Label>
                      <Input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="auth-input"
                        required
                      />
                    </FormGroup>

                    <Button 
                      type="submit" 
                      className="auth-submit-btn gradient-primary border-0 w-100 mt-3"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
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

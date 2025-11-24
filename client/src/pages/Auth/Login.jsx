import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthLeftPanel from './components/AuthLeftPanel';
import SocialLoginButtons from './components/SocialLoginButtons';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        if (data.requiresOtp) {
          // 2FA enabled, navigate to OTP verification
          navigate('/verify-otp', { 
            state: { 
              userId: data.userId, 
              email: data.email,
              isLoginOtp: true 
            } 
          });
        } else {
          // No 2FA, proceed to dashboard
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.data));
          navigate('/dashboard');
        }
      } else {
        if (data.requiresVerification) {
          // Email not verified, redirect to OTP verification
          navigate('/verify-otp', { 
            state: { 
              email: formData.email,
              isLoginOtp: false 
            } 
          });
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
                        required
                      />
                    </FormGroup>

                    <Button 
                      type="submit" 
                      className="auth-submit-btn gradient-primary border-0 w-100 mt-4"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </Form>

                  <div className="text-center mt-4">
                    <span className="text-muted">Don't have an account? </span>
                    <Link to="/signup" className="auth-link">Sign up</Link>
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
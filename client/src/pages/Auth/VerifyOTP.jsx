import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, FormGroup, Label } from 'reactstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, Zap, Lock } from 'lucide-react';
import './Auth.css';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract state values
  const { email = '', userId = '', isLoginOtp = false } = location.state || {};
  
  // State management
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no email or userId
  useEffect(() => {
    if (!email && !userId) {
      navigate(isLoginOtp ? '/login' : '/signup');
    }
  }, [email, userId, isLoginOtp, navigate]);

  // OTP input handlers
  const handleChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);
    
    const nextEmptyIndex = newOtp.findIndex(val => val === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  // API call helper
  const makeApiCall = async (endpoint, body) => {
    const response = await fetch(`http://localhost:8000/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return response.json();
  };

  // Handle OTP submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const requestBody = userId ? { userId, otp: otpCode } : { email, otp: otpCode };
      const data = await makeApiCall('verify-otp', requestBody);

      if (data.success) {
        const successMessage = isLoginOtp 
          ? 'Login successful! Redirecting...'
          : 'Email verified successfully! Redirecting...';
        
        setSuccess(successMessage);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const requestBody = userId ? { userId } : { email };
      const data = await makeApiCall('resend-otp', requestBody);

      if (data.success) {
        setSuccess('Verification code sent successfully!');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Dynamic content based on context
  const getFeatures = () => {
    if (isLoginOtp) {
      return [
        {
          icon: Lock,
          title: 'Two-Factor Authentication',
          description: 'Extra security layer to protect your account'
        },
        {
          icon: Shield,
          title: 'Secure Login',
          description: 'Your code expires in 10 minutes for security'
        },
        {
          icon: Zap,
          title: 'Quick Access',
          description: "You'll be back to your dashboard in seconds"
        }
      ];
    }

    return [
      {
        icon: Mail,
        title: 'Check Your Inbox',
        description: 'We sent a 6-digit code to your email address'
      },
      {
        icon: Shield,
        title: 'Secure Verification',
        description: 'Your code expires in 10 minutes for security'
      },
      {
        icon: Zap,
        title: 'Quick Setup',
        description: "You'll be analyzing sentiment in seconds"
      }
    ];
  };

  const getContent = () => ({
    backLink: isLoginOtp ? '/login' : '/signup',
    backText: isLoginOtp ? 'Back to Login' : 'Back to Sign Up',
    pageTitle: isLoginOtp ? 'Verify Login' : 'Verify Your Email',
    pageDescription: isLoginOtp 
      ? 'Enter the 6-digit verification code we sent to your email'
      : `Enter the 6-digit code we sent to ${email}`,
    tagline: isLoginOtp 
      ? 'Verify your identity to continue securely.'
      : 'Almost there! Verify your email to get started.',
    buttonText: isLoginOtp ? 'Verify & Login' : 'Verify Email'
  });

  const features = getFeatures();
  const content = getContent();

  return (
    <div className="auth-page">
      <Container className="d-flex align-items-center justify-content-center min-vh-100 position-relative py-5">
        <Row className="w-100 justify-content-center">
          <Col xl={10} xxl={9}>
            <div className="auth-wrapper">
              {/* Left Card */}
              <Card className="auth-left-card border-0">
                <div className="auth-left-content">
                  <Link to={content.backLink} className="auth-back-link text-decoration-none">
                    <ArrowLeft size={18} />
                    <span>{content.backText}</span>
                  </Link>

                  <div className="auth-branding">
                    <div className="auth-logo gradient-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 58 52" fill="none">
                        <path d="M3.422 24.6106L25.2981 47.3267C26.0234 48.0798 27.0181 48.5139 28.0634 48.5336C29.1087 48.5533 30.1191 48.157 30.8722 47.4317L53.5883 25.5556" stroke="white" strokeWidth="6.84402" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M38.6003 28.0698V12.3013" stroke="white" strokeWidth="6.84402" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M28.7445 28.0698V4.41702" stroke="white" strokeWidth="6.84402" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.8895 28.0698V22.1566" stroke="white" strokeWidth="6.84402" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="auth-brand-name">SYNSIGHT</div>
                    <h1 className="auth-tagline">{content.tagline}</h1>

                    <div className="auth-features">
                      {features.map((feature, index) => (
                        <div key={index} className="auth-feature-item">
                          <div className="auth-feature-icon">
                            <feature.icon size={20} className="text-primary" />
                          </div>
                          <div className="auth-feature-content">
                            <h6 className="mb-0 fw-semibold">{feature.title}</h6>
                            <p className="mb-0 text-muted">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Right Card */}
              <Card className="auth-right-card border-0">
                <div className="auth-form-container">
                  <h2 className="fw-bold mb-2">{content.pageTitle}</h2>
                  <p className="text-muted mb-4">{content.pageDescription}</p>

                  {error && <Alert color="danger" className="py-2 mb-3">{error}</Alert>}
                  {success && <Alert color="success" className="py-2 mb-3">{success}</Alert>}

                  <form onSubmit={handleSubmit}>
                    <FormGroup className="mb-4">
                      <Label className="form-label fw-medium mb-3">Verification Code</Label>
                      <div className="otp-input-group">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="otp-input"
                            disabled={loading}
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>
                    </FormGroup>

                    <Button
                      type="submit"
                      className="gradient-primary border-0 w-100 auth-submit-btn mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : content.buttonText}
                    </Button>

                    <div className="text-center">
                      <span className="text-muted small">Didn't receive the code?</span>{' '}
                      <Button
                        color="link"
                        className="p-0 auth-link"
                        onClick={handleResend}
                        disabled={resending}
                      >
                        {resending ? 'Sending...' : 'Resend Code'}
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
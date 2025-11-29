import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Alert } from 'reactstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../api/context/AuthContext';
import './Auth.css';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  const email = location.state?.email || '';
  const userId = location.state?.userId || '';
  const isLoginOtp = location.state?.isLoginOtp === true;
  const from = location.state?.from || '/dashboard';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email && !userId) {
      navigate('/login');
    }
    inputRefs.current[0]?.focus();
  }, [email, userId, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

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

    const nextEmptyIndex = newOtp.findIndex((val) => val === '');
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

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
      const payload = isLoginOtp
        ? { userId, otp: otpCode }
        : { email, otp: otpCode };

      const data = await verifyOtp(payload);

      if (data.success) {
        setSuccess(isLoginOtp ? 'Login successful!' : 'Email verified successfully!');
        setTimeout(() => navigate(from, { replace: true }), 1500);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);

    try {
      const payload = isLoginOtp ? { userId } : { email };
      const data = await resendOtp(payload);

      if (data.success) {
        setSuccess('Verification code sent successfully!');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 py-5">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="border-0 shadow rounded-4">
              <CardBody className="p-4 p-sm-5 text-center">
                <div className="otp-icon-box gradient-primary mx-auto mb-4">
                  {isLoginOtp ? (
                    <ShieldCheck size={32} color="white" strokeWidth={1.5} />
                  ) : (
                    <Mail size={32} color="white" strokeWidth={1.5} />
                  )}
                </div>

                <h2 className="fw-bold mb-2">
                  {isLoginOtp ? 'Two-Factor Authentication' : 'Verify Your Email'}
                </h2>

                <p className="text-muted mb-4">
                  {isLoginOtp
                    ? `Enter the 6-digit code sent to ${email}`
                    : `We've sent a verification code to ${email}`}
                </p>

                {!isLoginOtp && (
                  <Alert color="warning" className="d-flex align-items-start text-start mb-4">
                    <AlertTriangle size={20} className="me-2 flex-shrink-0 mt-1" />
                    <div>
                      <strong>Important!</strong>
                      <p className="mb-0 small">
                        Please verify your email within 24 hours or your account will be automatically deleted.
                      </p>
                    </div>
                  </Alert>
                )}

                {error && <Alert color="danger" className="py-2">{error}</Alert>}
                {success && <Alert color="success" className="py-2">{success}</Alert>}

                <form onSubmit={handleSubmit}>
                  <div className="otp-inputs mb-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="otp-single-input"
                        disabled={loading}
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="auth-submit-btn gradient-primary border-0 w-100 py-3 mb-4"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : isLoginOtp ? 'Verify & Login' : 'Verify Email'}
                  </Button>
                </form>

                <p className="text-muted mb-3">
                  Didn't receive the code?{' '}
                  <span
                    className={`otp-resend-link ${resending ? 'disabled' : ''}`}
                    onClick={!resending ? handleResend : undefined}
                  >
                    {resending ? 'Sending...' : 'Resend Code'}
                  </span>
                </p>

                <Link to={isLoginOtp ? '/login' : '/signup'} className="auth-link">
                  {isLoginOtp ? '← Back to Login' : '← Back to Sign Up'}
                </Link>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
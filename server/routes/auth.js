import express from 'express';
import { register, login, logout, getMe, verifyOTP, resendOTP } from '../controllers/auth.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;

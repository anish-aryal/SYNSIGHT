import express from 'express';
import {
  updateProfile,
  updatePreferences,
  changePassword,
  deleteAccount,
  toggleTwoFactor,
  getActiveSessions,
  terminateSession
} from '../controllers/Settings/profile.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .put(updateProfile)
  .delete(deleteAccount);

router.put('/preferences', updatePreferences);
router.put('/change-password', changePassword);
router.put('/two-factor', protect, toggleTwoFactor);
router.get('/sessions', protect, getActiveSessions);
router.delete('/sessions/:sessionId', protect, terminateSession);

export default router;
import express from 'express';
import {
  updateProfile,
  updateAvatar,
  updatePreferences,
  changePassword,
  deleteAccount,
  toggleTwoFactor,
  getActiveSessions,
  terminateSession
} from '../controllers/Settings/profile.js';
import { sendErrorResponse } from '../helpers/responseHelpers.js';
import { protect } from '../middlewares/auth.js';
import { AVATAR_UPLOAD_DIR } from '../config/uploads.js';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Profile route definitions.

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .put(updateProfile)
  .delete(deleteAccount);

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const random = crypto.randomBytes(8).toString('hex');
    cb(null, `${req.user._id}-${Date.now()}-${random}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Please upload a JPG, PNG, or GIF image.'));
    }
    return cb(null, true);
  }
}).single('avatar');

router.put('/avatar', (req, res, next) => {
  avatarUpload(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File size must be less than 2MB.'
        : err.message || 'Failed to upload avatar.';
      return sendErrorResponse(res, message, 400);
    }
    return next();
  });
}, updateAvatar);

router.put('/preferences', updatePreferences);
router.put('/change-password', changePassword);
router.put('/two-factor', protect, toggleTwoFactor);
router.get('/sessions', protect, getActiveSessions);
router.delete('/sessions/:sessionId', protect, terminateSession);

export default router;

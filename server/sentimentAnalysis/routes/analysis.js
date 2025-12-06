import express from 'express';
import {
  analyzeText,
  analyzeTwitter,
  analyzeReddit,
  analyzeMultiPlatform,
  getHistory,
  getAnalysisById,
  deleteAnalysis,
  getStatistics
} from '../controller/analysis.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Analyze endpoints
router.post('/text', analyzeText);
router.post('/twitter', analyzeTwitter);
router.post('/reddit', analyzeReddit);
router.post('/multi-platform', analyzeMultiPlatform);

// History and statistics
router.get('/history', getHistory);
router.get('/statistics', getStatistics);

// Single analysis operations
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);

export default router;
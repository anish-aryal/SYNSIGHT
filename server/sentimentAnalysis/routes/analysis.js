import express from 'express';
import {
  analyzeText,
  analyzeTwitter,
  analyzeReddit,
  analyzeBluesky,
  analyzeMultiPlatform,
  getHistory,
  getAnalysisById,
  deleteAnalysis,
  getStatistics,
  updateAnalysisProject,
  refreshAnalysis
} from '../controller/analysis.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/text', analyzeText);
router.post('/twitter', analyzeTwitter);
router.post('/reddit', analyzeReddit);
router.post('/bluesky', analyzeBluesky);
router.post('/multi-platform', analyzeMultiPlatform);

router.get('/history', getHistory);
router.get('/statistics', getStatistics);

router.get('/:id', getAnalysisById);
router.post('/:id/refresh', refreshAnalysis);
router.delete('/:id', deleteAnalysis);
router.patch('/:id/project', updateAnalysisProject);

export default router;

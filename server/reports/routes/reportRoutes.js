import express from 'express';
import {
  generateReport,
  getReports,
  getReportById,
  deleteReport,
  getReportByAnalysisId,
  downloadReportPdf
} from '../controllers/reportController.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/generate', protect, generateReport);
router.get('/', protect, getReports);
router.get('/analysis/:analysisId', protect, getReportByAnalysisId);
router.get('/:id/pdf', protect, downloadReportPdf);
router.get('/:id', protect, getReportById);
router.delete('/:id', protect, deleteReport);

export default router;

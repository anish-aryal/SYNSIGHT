import express from 'express';
import {
  generateReport,
  getReports,
  getReportById,
  deleteReport,
  getReportByAnalysisId,
  updateReportProject,
  updateReportContent,
  downloadReportPdf,
  addReportComment,
  updateReportComment,
  deleteReportComment
} from '../controllers/reportController.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/generate', protect, generateReport);
router.get('/', protect, getReports);
router.get('/analysis/:analysisId', protect, getReportByAnalysisId);
router.patch('/:id', protect, updateReportContent);
router.patch('/:id/project', protect, updateReportProject);
router.post('/:id/comments', protect, addReportComment);
router.patch('/:id/comments/:commentId', protect, updateReportComment);
router.delete('/:id/comments/:commentId', protect, deleteReportComment);
router.get('/:id/pdf', protect, downloadReportPdf);
router.get('/:id', protect, getReportById);
router.delete('/:id', protect, deleteReport);

export default router;

import express from 'express';
import { generateReport } from '../controllers/reportController.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/generate', protect, generateReport);

export default router;
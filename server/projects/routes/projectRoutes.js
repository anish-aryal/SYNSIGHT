import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectAnalyses,
  getProjectReports
} from '../controllers/projectController.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/analyses', getProjectAnalyses);
router.get('/:id/reports', getProjectReports);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;

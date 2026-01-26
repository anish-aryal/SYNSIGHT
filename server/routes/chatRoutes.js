import express from 'express';
import { protect } from '../middlewares/auth.js';
import {
  createChat,
  getChats,
  getChatStats,
  getChatByAnalysisId,
  getChatById,
  addMessage,
  updateChat,
  deleteChat,
  archiveChat,
  clearMessages
} from '../controllers/chatController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getChats)
  .post(createChat);

router.get('/stats', getChatStats);

router.get('/analysis/:analysisId', getChatByAnalysisId);

router.route('/:id')
  .get(getChatById)
  .put(updateChat)
  .delete(deleteChat);

router.route('/:id/messages')
  .post(addMessage)
  .delete(clearMessages);

router.put('/:id/archive', archiveChat);

export default router;

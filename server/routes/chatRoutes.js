import express from 'express';
import { protect } from '../middlewares/auth.js';
import {
  createChat,
  getChats,
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

router.route('/:id')
  .get(getChatById)
  .put(updateChat)
  .delete(deleteChat);

router.route('/:id/messages')
  .post(addMessage)
  .delete(clearMessages);

router.put('/:id/archive', archiveChat);

export default router;
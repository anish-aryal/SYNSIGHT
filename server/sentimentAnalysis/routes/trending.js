import express from 'express';
import { getTrendingTopics, searchTrendingTopic } from '../controller/trending.js';
import { protect } from '../../middlewares/auth.js';

// Trending route definitions.

const router = express.Router();

router.use(protect);

router.get('/topics', getTrendingTopics);
router.post('/search', searchTrendingTopic);

export default router;

import { searchPosts } from '../services/bluesky.js';
import { getTrendingRaw } from '../services/blueskyTrending.js';
import { sendSuccessResponse, sendErrorResponse } from '../../helpers/responseHelpers.js';

const calculateEngagement = (post) => {
  return (post.metrics?.like_count || 0) * 1 +
         (post.metrics?.repost_count || 0) * 2 +
         (post.metrics?.reply_count || 0) * 1.5;
};

const categorizeHashtag = (tag) => {
  const lowerTag = tag.toLowerCase().replace('#', '');

  const categories = {
    Technology: ['ai', 'tech', 'coding', 'programming', 'software', 'developer', 'ml', 'data', 'web3', 'blockchain', 'iphone', 'apple', 'google', 'meta', 'microsoft', 'openai', 'chatgpt'],
    Crypto: ['crypto', 'bitcoin', 'ethereum', 'nft', 'defi', 'web3', 'coin', 'btc', 'eth', 'blockchain'],
    Business: ['business', 'startup', 'entrepreneur', 'finance', 'economy', 'market', 'investing', 'stocks', 'money', 'fed', 'reserve'],
    Environment: ['climate', 'environment', 'green', 'sustainability', 'renewable', 'carbon', 'nature', 'weather'],
    Health: ['health', 'fitness', 'wellness', 'mental', 'medical', 'healthcare', 'covid', 'vaccine'],
    Entertainment: ['music', 'movie', 'film', 'tv', 'gaming', 'games', 'esports', 'sports', 'art', 'netflix', 'streaming'],
    Politics: ['politics', 'election', 'vote', 'government', 'trump', 'biden', 'congress', 'senate', 'parliament', 'melt', 'ice', 'act', 'confusion'],
    News: ['news', 'breaking', 'update', 'alert', 'happening', 'live', 'conflicts', 'global']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lowerTag.includes(k))) {
      return category;
    }
  }

  return 'General';
};

const calculateSentiment = (posts) => {
  if (!posts || posts.length === 0) return 'neutral';

  const avgLikes = posts.reduce((sum, p) => sum + (p.metrics?.like_count || 0), 0) / posts.length;
  const avgReplies = posts.reduce((sum, p) => sum + (p.metrics?.reply_count || 0), 0) / posts.length;

  if (avgLikes > avgReplies * 2) return 'positive';
  if (avgReplies > avgLikes * 1.5) return 'negative';
  return 'neutral';
};

export const getTrendingTopics = async (req, res) => {
  try {
    const { category = 'all' } = req.query;

    console.log('Fetching trending topics...');

    // Fetch trending topics from Bluesky API
    const trendingData = await getTrendingRaw();

    if (!trendingData || trendingData.length === 0) {
      return sendSuccessResponse(res, 'No trending topics found', {
        topics: [],
        total: 0,
        category: category || 'all',
        timestamp: new Date().toISOString()
      });
    }

    // Build response topics with categorization
    const topics = trendingData.map((trend) => {
      const topicCategory = categorizeHashtag(trend.title);

      // Filter by category if specified
      if (category && category.toLowerCase() !== 'all' &&
          topicCategory.toLowerCase() !== category.toLowerCase()) {
        return null;
      }

      const avgEngagement = trend.posts.length > 0
        ? trend.engagement / trend.posts.length
        : 0;

      const cleanTitle = trend.title.startsWith('#') ? trend.title : `#${trend.title}`;

      return {
        category: topicCategory,
        title: cleanTitle,
        mentions: trend.count > 1000 ? `${Math.round(trend.count / 1000)}K` : trend.count.toString(),
        trend: Math.min(Math.round(avgEngagement / 10), 100),
        keywords: [trend.rawTitle || trend.title.replace('#', '')],
        samplePosts: trend.posts.map(p => ({
          text: p.text,
          author: p.author,
          created_at: p.created_at,
          metrics: p.metrics
        }))
      };
    }).filter(Boolean);

    if (topics.length === 0) {
      return sendSuccessResponse(res, 'No trending topics found for this category', {
        topics: [],
        total: 0,
        category: category || 'all',
        timestamp: new Date().toISOString()
      });
    }

    return sendSuccessResponse(res, 'Trending topics fetched successfully', {
      topics,
      total: topics.length,
      category: category || 'all',
      source: 'bluesky-trending-bot',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getTrendingTopics:', error);
    return sendErrorResponse(
      res,
      error.message || 'Failed to fetch trending topics',
      500
    );
  }
};

export const searchTrendingTopic = async (req, res) => {
  try {
    const { query, maxResults = 50 } = req.body;

    if (!query || query.trim().length === 0) {
      return sendErrorResponse(res, 'Search query is required', 400);
    }

    const posts = await searchPosts(query, maxResults, { language: req.body.language });

    if (!posts || posts.length === 0) {
      return sendSuccessResponse(res, 'No posts found', {
        posts: [],
        total: 0
      });
    }

    const keywords = query.split(/\s+/).filter(w => w.length > 2);
    const sentiment = calculateSentiment(posts);

    return sendSuccessResponse(res, 'Search completed successfully', {
      query,
      posts,
      total: posts.length,
      keywords,
      sentiment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in searchTrendingTopic:', error);
    return sendErrorResponse(
      res,
      error.message || 'Failed to search trending topic',
      500
    );
  }
};

import axios from 'axios';
import * as SentimentOrchestrator from './orchestrator.js';

// Bluesky Trending service helpers.

// Cache for trending topics (5 minute cache)
let trendingCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch trending topics directly from Bluesky's API
 * Uses the public API endpoint that returns actual trending topics
 */
export const getBlueskTrendingAPI = async () => {
  try {
    console.log('Fetching trending topics from Bluesky API...');

    const apiResponse = await axios.get('https://public.api.bsky.app/xrpc/app.bsky.unspecced.getTrendingTopics', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const apiData = apiResponse.data;
    console.log('API response received, topics count:', apiData?.topics?.length || 0);

    if (apiData && apiData.topics && Array.isArray(apiData.topics)) {
      return apiData.topics.map(topic => ({
        title: topic.topic || topic.name || topic,
        count: topic.count || 0,
        rawText: (topic.topic || topic.name || topic).replace(/^#/, '')
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching trending from Bluesky API:', error.message);
    throw error;
  }
};

/**
 * Analyze a single trending topic using Bluesky sentiment analysis
 */
export const analyzeTrendingTopic = async (topic) => {
  try {
    const searchQuery = topic.rawText || topic.title.replace('#', '');

    console.log(`Analyzing trending topic: ${topic.title}`);

    // Use the Bluesky sentiment analysis orchestrator
    const analysisResult = await SentimentOrchestrator.analyzeBluesky(
      searchQuery,
      50, // Analyze 50 posts
      {
        timeframe: 'last24hours',
        language: 'en'
      }
    );

    return {
      title: topic.title,
      rawTitle: searchQuery,
      count: topic.count || analysisResult.total_analyzed,
      sentiment: analysisResult.overall_sentiment,
      percentages: analysisResult.percentages,
      distribution: analysisResult.sentiment_distribution,
      engagement: analysisResult.samplePosts?.reduce((sum, p) =>
        sum + (p.metrics?.like_count || 0) + (p.metrics?.repost_count || 0), 0
      ) || 0,
      posts: analysisResult.samplePosts?.slice(0, 3) || []
    };
  } catch (error) {
    console.error(`Error analyzing topic "${topic.title}":`, error.message);
    // Return partial data on error
    return {
      title: topic.title,
      rawTitle: topic.rawText || topic.title.replace('#', ''),
      count: topic.count || 0,
      sentiment: 'neutral',
      percentages: { positive: 0, neutral: 0, negative: 0 },
      distribution: {},
      engagement: 0,
      posts: []
    };
  }
};

/**
 * Get trending topics without sentiment analysis (fast path)
 */
export const getTrendingRaw = async () => {
  try {
    const now = Date.now();
    if (trendingCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached trending topics');
      return trendingCache;
    }

    const trendingTopics = await getBlueskTrendingAPI();

    if (!trendingTopics || trendingTopics.length === 0) {
      console.log('No trending topics found from API');
      return [];
    }

    const topics = trendingTopics.slice(0, 15).map((topic) => ({
      title: topic.title,
      rawTitle: topic.rawText || topic.title.replace('#', ''),
      count: topic.count || 0,
      sentiment: null,
      percentages: null,
      distribution: null,
      engagement: 0,
      posts: []
    }));

    trendingCache = topics;
    cacheTimestamp = Date.now();

    return topics;
  } catch (error) {
    console.error('Error in getTrendingRaw:', error);
    return [];
  }
};

/**
 * Get trending topics with complete data (sentiment analysis)
 * Optimized version with caching
 */
export const getTrendingWithData = async () => {
  try {
    // Check cache first
    const now = Date.now();
    if (trendingCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached trending topics');
      return trendingCache;
    }

    // Fetch trending topics from Bluesky API
    const trendingTopics = await getBlueskTrendingAPI();

    if (!trendingTopics || trendingTopics.length === 0) {
      console.log('No trending topics found from API');
      return [];
    }

    console.log(`Analyzing ${Math.min(trendingTopics.length, 15)} trending topics...`);

    // Analyze top 15 topics with sentiment analysis
    const topicsWithData = await Promise.allSettled(
      trendingTopics.slice(0, 15).map(topic => analyzeTrendingTopic(topic))
    );

    const topics = topicsWithData
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value);

    console.log(`Returning ${topics.length} analyzed trending topics`);

    // Cache the results
    trendingCache = topics;
    cacheTimestamp = Date.now();

    return topics;
  } catch (error) {
    console.error('Error in getTrendingWithData:', error);
    return [];
  }
};

/**
 * Get trending topics with progress updates (for streaming)
 * This version processes topics one by one and can emit progress
 */
export const getTrendingWithProgress = async (progressCallback) => {
  try {
    // Fetch trending topics from Bluesky API
    const trendingTopics = await getBlueskTrendingAPI();

    if (!trendingTopics || trendingTopics.length === 0) {
      return [];
    }

    const totalTopics = Math.min(trendingTopics.length, 15);
    const analyzedTopics = [];

    // Process topics one by one with progress updates
    for (let i = 0; i < totalTopics; i++) {
      const topic = trendingTopics[i];

      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: totalTopics,
          topic: topic.title,
          status: 'analyzing'
        });
      }

      const analyzedTopic = await analyzeTrendingTopic(topic);
      analyzedTopics.push(analyzedTopic);

      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: totalTopics,
          topic: topic.title,
          status: 'completed',
          result: analyzedTopic
        });
      }
    }

    return analyzedTopics;
  } catch (error) {
    console.error('Error in getTrendingWithProgress:', error);
    return [];
  }
};

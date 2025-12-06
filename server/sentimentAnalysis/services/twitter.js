import { TwitterApi } from 'twitter-api-v2';

let client = null;
let bearer = null;

const initializeTwitter = async () => {
  if (client && bearer) {
    return; // Already initialized
  }

  try {
    if (!process.env.TWITTER_API_KEY || 
        !process.env.TWITTER_API_SECRET || 
        !process.env.TWITTER_ACCESS_TOKEN || 
        !process.env.TWITTER_ACCESS_SECRET ||
        !process.env.TWITTER_BEARER_TOKEN) {
      throw new Error('Twitter API keys not configured');
    }

    client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    bearer = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    console.log('✅ Twitter API initialized successfully');
  } catch (error) {
    console.error('❌ Twitter API initialization failed:', error.message);
    throw error;
  }
};

export const searchTweets = async (query, maxResults = 100) => {
  await initializeTwitter();
  
  try {
    const tweets = await bearer.v2.search(query, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      expansions: ['author_id'],
    });

    const tweetTexts = tweets.data.data.map(tweet => ({
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics,
      id: tweet.id
    }));

    return tweetTexts;
  } catch (error) {
    throw new Error(`Twitter API Error: ${error.message}`);
  }
};

export const getUserTweets = async (username, maxResults = 100) => {
  await initializeTwitter();
  
  try {
    const user = await bearer.v2.userByUsername(username);
    
    const tweets = await bearer.v2.userTimeline(user.data.id, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': ['created_at', 'public_metrics'],
    });

    const tweetTexts = tweets.data.data.map(tweet => ({
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics,
      id: tweet.id
    }));

    return tweetTexts;
  } catch (error) {
    throw new Error(`Twitter API Error: ${error.message}`);
  }
};

export const getTweetReplies = async (tweetId, maxResults = 100) => {
  await initializeTwitter();
  
  try {
    const replies = await bearer.v2.search(`conversation_id:${tweetId}`, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': ['created_at', 'author_id', 'conversation_id'],
    });

    if (!replies.data.data) {
      return [];
    }

    const replyTexts = replies.data.data
      .filter(tweet => tweet.id !== tweetId)
      .map(tweet => ({
        text: tweet.text,
        created_at: tweet.created_at,
        id: tweet.id
      }));

    return replyTexts;
  } catch (error) {
    throw new Error(`Twitter API Error: ${error.message}`);
  }
};
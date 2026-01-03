import { BskyAgent } from '@atproto/api';

let agent = null;
let isAuthenticated = false;
let authenticationAttempted = false;

const authenticateBluesky = async () => {
  if (authenticationAttempted) {
    return isAuthenticated;
  }

  authenticationAttempted = true;

  if (!process.env.BLUESKY_IDENTIFIER || !process.env.BLUESKY_PASSWORD) {
    console.log('⚠️  Bluesky credentials not configured');
    throw new Error('Bluesky API credentials not configured. Please add BLUESKY_IDENTIFIER and BLUESKY_PASSWORD to your .env file.');
  }

  try {
    agent = new BskyAgent({ service: 'https://bsky.social' });
    await agent.login({
      identifier: process.env.BLUESKY_IDENTIFIER,
      password: process.env.BLUESKY_PASSWORD
    });
    isAuthenticated = true;
    console.log('✅ Bluesky authenticated successfully');
    return true;
  } catch (error) {
    console.error('❌ Bluesky authentication failed:', error.message);
    throw new Error(`Bluesky authentication failed: ${error.message}. Please check your credentials.`);
  }
};

export const searchPosts = async (query, limit = 100) => {
  // Authenticate if not already done
  if (!isAuthenticated && !authenticationAttempted) {
    await authenticateBluesky();
  }

  // If authentication was attempted but failed, throw error
  if (!isAuthenticated) {
    throw new Error('Bluesky API not authenticated. Please configure valid credentials.');
  }

  try {
    const response = await agent.app.bsky.feed.searchPosts({
      q: query,
      limit: Math.min(limit, 100),
      sort: 'latest'
    });

    if (!response.data.posts || response.data.posts.length === 0) {
      return [];
    }

    const posts = response.data.posts.map(post => ({
      text: post.record.text,
      created_at: post.record.createdAt,
      author: post.author.handle,
      metrics: {
        like_count: post.likeCount || 0,
        repost_count: post.repostCount || 0,
        reply_count: post.replyCount || 0
      },
      id: post.uri
    }));

    return posts;
  } catch (error) {
    console.error('Bluesky search error:', error);
    
    // Provide specific error messages
    if (error.status === 401) {
      throw new Error('Bluesky authentication expired. Please check your credentials.');
    } else if (error.status === 429) {
      throw new Error('Bluesky rate limit exceeded. Please try again later.');
    } else if (error.status === 403) {
      throw new Error('Bluesky access forbidden. Your account may not have search permissions.');
    } else {
      throw new Error(`Bluesky API error: ${error.message}`);
    }
  }
};

export const getAuthorPosts = async (handle, limit = 100) => {
  // Authenticate if not already done
  if (!isAuthenticated && !authenticationAttempted) {
    await authenticateBluesky();
  }

  if (!isAuthenticated) {
    throw new Error('Bluesky API not authenticated. Please configure valid credentials.');
  }

  try {
    const response = await agent.app.bsky.feed.getAuthorFeed({
      actor: handle,
      limit: Math.min(limit, 100)
    });

    if (!response.data.feed || response.data.feed.length === 0) {
      return [];
    }

    return response.data.feed.map(item => ({
      text: item.post.record.text,
      created_at: item.post.record.createdAt,
      author: item.post.author.handle,
      metrics: {
        like_count: item.post.likeCount || 0,
        repost_count: item.post.repostCount || 0,
        reply_count: item.post.replyCount || 0
      },
      id: item.post.uri
    }));
  } catch (error) {
    console.error('Bluesky getAuthorPosts error:', error);
    
    if (error.status === 401) {
      throw new Error('Bluesky authentication expired. Please check your credentials.');
    } else if (error.status === 429) {
      throw new Error('Bluesky rate limit exceeded. Please try again later.');
    } else if (error.status === 404) {
      throw new Error(`Bluesky user not found: ${handle}`);
    } else {
      throw new Error(`Bluesky API error: ${error.message}`);
    }
  }
};
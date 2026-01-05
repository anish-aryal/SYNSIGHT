import { BskyAgent } from '@atproto/api';

/**
 * Singleton agent instance and auth state
 */
let agent = null;
let isAuthenticated = false;
let authenticationAttempted = false;

/**
 * Lazily create and return the Bluesky agent
 */
const getAgent = () => {
  if (!agent) {
    agent = new BskyAgent({ service: 'https://bsky.social' });
  }
  return agent;
};

/**
 * Authenticate with Bluesky using environment credentials
 * This is only attempted once unless authentication fails
 */
const authenticateBluesky = async () => {
  if (authenticationAttempted && isAuthenticated) return true;
  if (authenticationAttempted && !isAuthenticated) return false;

  authenticationAttempted = true;

  const identifier = process.env.BLUESKY_IDENTIFIER;
  const password = process.env.BLUESKY_PASSWORD;

  if (!identifier || !password) {
    throw new Error(
      'Bluesky API credentials not configured. Please set BLUESKY_IDENTIFIER and BLUESKY_PASSWORD.'
    );
  }

  try {
    const a = getAgent();
    await a.login({ identifier, password });
    isAuthenticated = true;
    return true;
  } catch (error) {
    isAuthenticated = false;
    throw new Error(`Bluesky authentication failed: ${error.message}`);
  }
};

/**
 * Ensure authentication exists before making API calls
 */
const ensureAuthenticated = async () => {
  if (!isAuthenticated && !authenticationAttempted) {
    await authenticateBluesky();
  }

  if (!isAuthenticated) {
    throw new Error('Bluesky API not authenticated.');
  }
};

/**
 * Normalize Bluesky search post into internal format
 */
const mapSearchPost = (p) => {
  const post = p?.post || p;
  const record = post?.record || {};
  const author = post?.author || {};

  const rawDate = post?.indexedAt || record?.createdAt || post?.createdAt || null;

  return {
    id: post?.uri || post?.cid || post?.id,
    text: record?.text || post?.text || '',
    created_at: rawDate ? new Date(rawDate).toISOString() : null,
    author: author?.handle || author?.did || null,
    metrics: {
      like_count: post?.likeCount || 0,
      repost_count: post?.repostCount || 0,
      reply_count: post?.replyCount || 0,
      quote_count: post?.quoteCount || 0
    }
  };
};

/**
 * Convert UI language codes to Bluesky search language codes.
 * Bluesky uses ISO-639-1 codes (e.g., "en", "es", "fr", "de").
 */
const normalizeLang = (lang) => {
  if (!lang) return null;
  const l = String(lang).toLowerCase();
  if (l === 'all') return null;
  if (['en', 'es', 'fr', 'de'].includes(l)) return l;
  return null; // ignore unsupported languages safely
};

/**
 * Search public Bluesky posts by keyword.
 * Supports language-based search using the `lang` parameter.
 * Uses cursor pagination to fetch more than 100 results (API limit per request).
 */
export const searchPosts = async (query, maxResults = 100, options = {}) => {
  await ensureAuthenticated();

  const q = (query || '').trim();
  if (!q) return [];

  const target = Math.min(Math.max(Number(maxResults) || 100, 1), 1000); // safety cap
  const pageLimit = 100; // API max per request

  const lang = normalizeLang(options?.language);

  const a = getAgent();
  let cursor = undefined;
  const all = [];

  while (all.length < target) {
    const res = await a.app.bsky.feed.searchPosts({
      q,
      limit: Math.min(pageLimit, target - all.length),
      cursor,
      ...(lang ? { lang } : {})
    });

    const posts = res?.data?.posts || [];
    if (!posts.length) break;

    all.push(...posts.map(mapSearchPost));

    cursor = res?.data?.cursor;
    if (!cursor) break;
  }

  return all.slice(0, target);
};

/**
 * Fetch recent posts from a specific Bluesky author
 */
export const getAuthorPosts = async (handle, limit = 100) => {
  await ensureAuthenticated();

  const actor = (handle || '').trim();
  if (!actor) return [];

  try {
    const a = getAgent();

    const response = await a.app.bsky.feed.getAuthorFeed({
      actor,
      limit: Math.min(Math.max(Number(limit) || 50, 1), 100)
    });

    const feed = response?.data?.feed || [];
    if (!feed.length) return [];

    return feed.map((item) => ({
      id: item?.post?.uri,
      text: item?.post?.record?.text || '',
      created_at: item?.post?.record?.createdAt
        ? new Date(item.post.record.createdAt).toISOString()
        : null,
      author: item?.post?.author?.handle || null,
      metrics: {
        like_count: item?.post?.likeCount || 0,
        repost_count: item?.post?.repostCount || 0,
        reply_count: item?.post?.replyCount || 0,
        quote_count: item?.post?.quoteCount || 0
      }
    }));
  } catch (error) {
    if (error?.status === 401) {
      throw new Error('Bluesky authentication expired.');
    } else if (error?.status === 429) {
      throw new Error('Bluesky rate limit exceeded.');
    } else if (error?.status === 404) {
      throw new Error(`Bluesky user not found: ${handle}`);
    } else {
      throw new Error(`Bluesky API error: ${error.message}`);
    }
  }
};

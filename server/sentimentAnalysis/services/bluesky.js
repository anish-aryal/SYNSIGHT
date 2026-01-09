import { BskyAgent } from '@atproto/api';

let agent = null;

let isAuthenticated = false;
let authenticationAttempted = false;
let lastAuthTime = 0;
let authPromise = null;

const SESSION_MAX_AGE_MS = 90 * 60 * 1000;

const getAgent = () => {
  if (!agent) agent = new BskyAgent({ service: 'https://bsky.social' });
  return agent;
};

const isSessionExpired = () => !lastAuthTime || (Date.now() - lastAuthTime > SESSION_MAX_AGE_MS);

const resetAuth = () => {
  isAuthenticated = false;
  authenticationAttempted = false;
  lastAuthTime = 0;
  authPromise = null;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeLang = (lang) => {
  if (!lang) return null;
  const l = String(lang).trim().toLowerCase();
  if (!l || l === 'all') return null;

  // Accept "en", "en-GB", "en_US" -> "en"
  const two = l.split(/[-_]/)[0];

  // ISO-639-1 is 2 letters; keep it permissive to avoid maintaining a list
  if (/^[a-z]{2}$/.test(two)) return two;

  return null;
};

const authenticateBluesky = async (forceRefresh = false) => {
  if (forceRefresh || isSessionExpired()) resetAuth();

  if (authenticationAttempted && isAuthenticated && !forceRefresh) return true;
  if (authenticationAttempted && !isAuthenticated && !forceRefresh) return false;

  authenticationAttempted = true;

  const identifier = process.env.BLUESKY_IDENTIFIER;
  const password = process.env.BLUESKY_PASSWORD;

  if (!identifier || !password) {
    throw new Error('Bluesky API credentials not configured. Set BLUESKY_IDENTIFIER and BLUESKY_PASSWORD.');
  }

  const a = getAgent();
  await a.login({ identifier, password });

  isAuthenticated = true;
  lastAuthTime = Date.now();
  return true;
};

const ensureAuthenticated = async () => {
  if (isAuthenticated && !isSessionExpired()) return;

  // Serialize concurrent logins
  if (!authPromise) {
    authPromise = (async () => {
      try {
        await authenticateBluesky(true);
      } finally {
        authPromise = null;
      }
    })();
  }

  await authPromise;

  if (!isAuthenticated) throw new Error('Bluesky API not authenticated.');
};

const pickStatus = (err) => err?.status ?? err?.response?.status ?? null;

// Try to honor Retry-After header if present; otherwise use backoff
const pickRetryAfterMs = (err) => {
  const h = err?.headers?.['retry-after'] ?? err?.response?.headers?.['retry-after'];
  const n = Number(h);
  if (Number.isFinite(n) && n > 0) return n * 1000;
  return null;
};

const requestWithRetry = async (fn, { maxRetries = 3 } = {}) => {
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      const status = pickStatus(err);
      attempt += 1;

      if (status === 401) {
        if (attempt > maxRetries) throw new Error('Bluesky authentication keeps failing. Please try again later.');
        resetAuth();
        await ensureAuthenticated();
        continue;
      }

      if (status === 429) {
        if (attempt > maxRetries) throw new Error('Bluesky rate limit exceeded. Please try again in a few minutes.');
        const wait = pickRetryAfterMs(err) ?? (1500 * attempt);
        await sleep(wait);
        continue;
      }

      if (status === 400) {
        throw new Error('Invalid search query.');
      }

      if (status && status >= 500) {
        if (attempt > maxRetries) throw new Error('Bluesky server is temporarily unavailable. Please try again later.');
        const wait = Math.min(10_000, 1500 * attempt * attempt);
        await sleep(wait);
        continue;
      }

      const message = err?.message || 'Unknown error';
      throw new Error(`Bluesky API error: ${message}`);
    }
  }
};

const mapSearchPost = (p) => {
  const post = p?.post || p;
  const record = post?.record || {};
  const author = post?.author || {};
  const rawDate = post?.indexedAt || record?.createdAt || post?.createdAt || null;

  return {
    id: post?.uri || post?.cid || post?.id || null,
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

export const searchPosts = async (query, maxResults = 100, options = {}) => {
  await ensureAuthenticated();

  const q = String(query || '').trim();
  if (!q) return [];

  const target = Math.min(Math.max(Number(maxResults) || 100, 1), 1000);
  const pageLimit = 100;

  const lang = normalizeLang(options?.language);

  const a = getAgent();
  let cursor = undefined;
  const all = [];

  while (all.length < target) {
    const limit = Math.min(pageLimit, target - all.length);

    const res = await requestWithRetry(() =>
      a.app.bsky.feed.searchPosts({
        q,
        limit,
        cursor,
        ...(lang ? { lang } : {})
      })
    );

    const posts = res?.data?.posts || [];
    if (!posts.length) break;

    all.push(...posts.map(mapSearchPost));

    cursor = res?.data?.cursor;
    if (!cursor) break;
  }

  return all.slice(0, target);
};

export const getAuthorPosts = async (handle, limit = 100) => {
  await ensureAuthenticated();

  const actor = String(handle || '').trim();
  if (!actor) return [];

  const a = getAgent();
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

  try {
    const response = await requestWithRetry(() =>
      a.app.bsky.feed.getAuthorFeed({ actor, limit: safeLimit })
    );

    const feed = response?.data?.feed || [];
    if (!feed.length) return [];

    return feed.map((item) => {
      const post = item?.post || {};
      const record = post?.record || {};
      const author = post?.author || {};
      const created = record?.createdAt || post?.indexedAt || post?.createdAt || null;

      return {
        id: post?.uri || null,
        text: record?.text || '',
        created_at: created ? new Date(created).toISOString() : null,
        author: author?.handle || null,
        metrics: {
          like_count: post?.likeCount || 0,
          repost_count: post?.repostCount || 0,
          reply_count: post?.replyCount || 0,
          quote_count: post?.quoteCount || 0
        }
      };
    });
  } catch (error) {
    const status = pickStatus(error);

    if (status === 404) throw new Error(`Bluesky user not found: ${handle}`);
    if (status === 429) throw new Error('Bluesky rate limit exceeded. Please try again in a few minutes.');
    if (status === 401) {
      resetAuth();
      throw new Error('Bluesky authentication expired. Please try again.');
    }

    throw new Error(`Bluesky API error: ${error?.message || 'Unknown error'}`);
  }
};

import VaderService from './vader.js';
import * as twitterService from './twitter.js';
import * as redditService from './reddit.js';
import * as blueskyService from './bluesky.js';

import { filterPosts } from '../utils/contentFilter.js';
import { extractKeywords } from '../utils/keywordExtractor.js';
import { generateInsights } from '../utils/InsightsGenerator.js';

import { adjustForSarcasm } from '../utils/sarcasmDetector.js';

// Orchestrator service helpers.

const TIMEFRAME_MS = {
  last24hours: 24 * 60 * 60 * 1000,
  last7days: 7 * 24 * 60 * 60 * 1000,
  last30days: 30 * 24 * 60 * 60 * 1000,
  last90days: 90 * 24 * 60 * 60 * 1000
};

const toMs = (d) => {
  const t = new Date(d).getTime();
  return Number.isFinite(t) ? t : null;
};

// Strict timeframe filter: invalid dates are excluded
const applyTimeframe = (items, timeframe, getDate) => {
  const ms = TIMEFRAME_MS[timeframe];
  if (!ms) return items;

  const cutoff = Date.now() - ms;
  const out = [];

  for (let i = 0; i < items.length; i++) {
    const rawDate = getDate(items[i]);
    const t = toMs(rawDate);
    if (t === null) continue; // invalid timestamps -> exclude
    if (t >= cutoff) out.push(items[i]);
  }

  return out;
};

const calcPercentages = (dist, total) => ({
  positive: total > 0 ? Math.round((dist.positive / total) * 100) : 0,
  negative: total > 0 ? Math.round((dist.negative / total) * 100) : 0,
  neutral: total > 0 ? Math.round((dist.neutral / total) * 100) : 0
});

const getTimeframeDays = (timeframe) => {
  const ms = TIMEFRAME_MS[timeframe];
  if (!ms) return null;
  return Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)));
};

const toDayKey = (dateValue) => {
  const t = toMs(dateValue);
  if (t === null) return null;
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const normalizeUtcDay = (dateValue) => {
  const t = toMs(dateValue);
  if (t === null) return null;
  const d = new Date(t);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const toHourKey = (dateValue) => {
  const t = toMs(dateValue);
  if (t === null) return null;
  const d = new Date(t);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}T${String(d.getUTCHours()).padStart(2, '0')}`;
};

const balancePostsByDay = (posts, getDate) => {
  if (!Array.isArray(posts) || posts.length === 0) return { posts, counts: null };

  const buckets = new Map();
  for (const post of posts) {
    const key = toDayKey(getDate(post));
    if (!key) continue;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(post);
  }

  const dayKeys = Array.from(buckets.keys()).sort();
  if (dayKeys.length <= 1) return { posts, counts: null };

  for (const key of dayKeys) {
    buckets.get(key).sort((a, b) => {
      const ta = toMs(getDate(a)) ?? 0;
      const tb = toMs(getDate(b)) ?? 0;
      return ta - tb;
    });
  }

  const targetPerDay = Math.ceil(posts.length / dayKeys.length);
  const balanced = [];

  for (const key of dayKeys) {
    const bucket = buckets.get(key) || [];
    if (bucket.length === 0) continue;
    balanced.push(...bucket.slice(0, targetPerDay));
  }

  return {
    posts: balanced,
    counts: {
      afterBalancing: balanced.length,
      removedByBalancing: posts.length - balanced.length
    }
  };
};

const fillSentimentRange = (map, timeframe, referenceDate) => {
  const days = getTimeframeDays(timeframe);
  if (!days) return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

  const end = normalizeUtcDay(referenceDate || new Date());
  if (!end) return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));

  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const out = [];
  for (let d = new Date(start); d <= end; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1))) {
    const key = toDayKey(d);
    if (map.has(key)) out.push(map.get(key));
    else out.push({ date: key, positive: 0, neutral: 0, negative: 0, total: 0 });
  }

  return out;
};

const fillSentimentRangeHourly = (map, referenceDate) => {
  const endHour = new Date(referenceDate || new Date());
  const endUtc = new Date(Date.UTC(endHour.getUTCFullYear(), endHour.getUTCMonth(), endHour.getUTCDate(), endHour.getUTCHours()));
  const startUtc = new Date(endUtc);
  startUtc.setUTCHours(startUtc.getUTCHours() - 23);

  const out = [];
  for (let d = new Date(startUtc); d <= endUtc; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours() + 1))) {
    const key = toHourKey(d);
    if (map.has(key)) out.push(map.get(key));
    else out.push({ date: key, positive: 0, neutral: 0, negative: 0, total: 0 });
  }

  return out;
};

const buildSentimentOverTime = (posts, results, getDate, timeframe, referenceDate) => {
  if (!Array.isArray(posts) || posts.length === 0) return [];

  const map = new Map();

  for (let i = 0; i < posts.length; i++) {
    const key = timeframe === 'last24hours'
      ? toHourKey(getDate(posts[i]))
      : toDayKey(getDate(posts[i]));
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, { date: key, positive: 0, neutral: 0, negative: 0, total: 0 });
    }
    const entry = map.get(key);
    const sentiment = (results?.[i]?.sentiment || 'neutral').toLowerCase();
    if (sentiment === 'positive') entry.positive += 1;
    else if (sentiment === 'negative') entry.negative += 1;
    else entry.neutral += 1;
    entry.total += 1;
  }

  if (map.size === 0) return [];

  return timeframe === 'last24hours'
    ? fillSentimentRangeHourly(map, referenceDate)
    : fillSentimentRange(map, timeframe, referenceDate);
};

const mergeSentimentOverTime = (results = [], timeframe, referenceDate) => {
  const map = new Map();
  for (const r of results) {
    const series = Array.isArray(r?.sentimentOverTime) ? r.sentimentOverTime : [];
    for (const day of series) {
      if (!day?.date) continue;
      if (!map.has(day.date)) {
        map.set(day.date, { date: day.date, positive: 0, neutral: 0, negative: 0, total: 0 });
      }
      const entry = map.get(day.date);
      entry.positive += day.positive || 0;
      entry.neutral += day.neutral || 0;
      entry.negative += day.negative || 0;
      entry.total += day.total || 0;
    }
  }

  return timeframe === 'last24hours'
    ? fillSentimentRangeHourly(map, referenceDate)
    : fillSentimentRange(map, timeframe, referenceDate);
};

// Normalize score shapes so adjustForSarcasm can work regardless of python field naming
const normalizeScores = (r) => {
  if (!r || typeof r !== 'object') return { positive: 0, negative: 0, neutral: 0, compound: 0 };

  // Many possible shapes:
  // 1) r.scores = {positive, negative, neutral, compound}
  // 2) r.scores = {pos, neg, neu, compound}
  // 3) r = {positive, negative, neutral, compound}
  // 4) r = {pos, neg, neu, compound}
  const s = r.scores && typeof r.scores === 'object' ? r.scores : r;

  const positive = s.positive ?? s.pos ?? 0;
  const negative = s.negative ?? s.neg ?? 0;
  const neutral = s.neutral ?? s.neu ?? 0;
  const compound = s.compound ?? 0;

  return { positive, negative, neutral, compound };
};

const recomputeDistribution = (results) => {
  const dist = { positive: 0, negative: 0, neutral: 0 };
  for (const r of results) {
    const s = (r?.sentiment || 'neutral').toLowerCase();
    if (s === 'positive') dist.positive += 1;
    else if (s === 'negative') dist.negative += 1;
    else dist.neutral += 1;
  }
  return dist;
};

const recomputeAverages = (results) => {
  if (!Array.isArray(results) || results.length === 0) {
    return { positive: 0, negative: 0, neutral: 0, compound: 0 };
  }

  let sp = 0, sn = 0, sneu = 0, sc = 0;
  let n = 0;

  for (const r of results) {
    const scores = normalizeScores(r);
    // Skip rows that are completely empty/unusable
    if (
      typeof scores.positive !== 'number' ||
      typeof scores.negative !== 'number' ||
      typeof scores.neutral !== 'number' ||
      typeof scores.compound !== 'number'
    ) {
      continue;
    }

    sp += scores.positive;
    sn += scores.negative;
    sneu += scores.neutral;
    sc += scores.compound;
    n += 1;
  }

  if (n === 0) return { positive: 0, negative: 0, neutral: 0, compound: 0 };

  return {
    positive: +(sp / n).toFixed(3),
    negative: +(sn / n).toFixed(3),
    neutral: +(sneu / n).toFixed(3),
    compound: +(sc / n).toFixed(3)
  };
};

export const analyzeText = async (text) => VaderService.analyzeSingleText(text);
export const analyzeBulkTexts = async (texts) => VaderService.analyzeBulkTexts(texts);

const analyzePlatformCore = async ({
  platform,
  query,
  maxResults,
  options,
  fetchFn,
  getDate,
  getText,
  sampleMapper
}) => {
  const { timeframe = 'last7days' } = options || {};

  // Pass options as 3rd arg (Bluesky uses it for language-based search)
  const raw = await fetchFn(query, maxResults, options);

  if (!raw || raw.length === 0) {
    throw new Error(`No ${platform} posts found for the query`);
  }

  // Apply timeframe first
  const timeFiltered = applyTimeframe(raw, timeframe, getDate);

  // If timeframe eliminates everything, return a clear message
  if (timeFiltered.length === 0) {
    return {
      source: platform,
      query,
      timestamp: new Date().toISOString(),
      overall_sentiment: 'neutral',
      average_scores: { positive: 0, neutral: 0, negative: 0, compound: 0 },
      sentiment_distribution: { positive: 0, negative: 0, neutral: 0 },
      percentages: { positive: 0, negative: 0, neutral: 0 },
      total_analyzed: 0,
      counts: {
        fetched: raw.length,
        afterTimeframe: 0,
        afterFilters: 0,
        removedByTimeframe: raw.length,
        removedByFilters: 0
      },
      insights: {
        overall: `No ${platform} posts were found within the selected timeframe (${timeframe}).`,
        platformComparison: null,
        topDrivers: [],
        platformsAnalyzed: platform
      },
      topKeywords: [],
      samplePosts: [],
      sarcasm: { detected: 0, ratePercent: 0 },
      platformBreakdown: [{
        platform: platform[0].toUpperCase() + platform.slice(1),
        totalPosts: 0,
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }
      }]
    };
  }

  // Apply content/language filter next
  const filtered = filterPosts(timeFiltered, query, options);

  if (filtered.length === 0) {
    const lang = options?.language || 'en';

    return {
      source: platform,
      query,
      timestamp: new Date().toISOString(),
      overall_sentiment: 'neutral',
      average_scores: { positive: 0, neutral: 0, negative: 0, compound: 0 },
      sentiment_distribution: { positive: 0, negative: 0, neutral: 0 },
      percentages: { positive: 0, negative: 0, neutral: 0 },
      total_analyzed: 0,
      counts: {
        fetched: raw.length,
        afterTimeframe: timeFiltered.length,
        afterFilters: 0,
        removedByTimeframe: raw.length - timeFiltered.length,
        removedByFilters: timeFiltered.length
      },
      insights: {
        overall: `No ${platform} posts remained after filtering (language: ${lang}, timeframe: ${timeframe}).`,
        platformComparison: null,
        topDrivers: [],
        platformsAnalyzed: platform
      },
      topKeywords: [],
      samplePosts: [],
      sarcasm: { detected: 0, ratePercent: 0 },
      platformBreakdown: [{
        platform: platform[0].toUpperCase() + platform.slice(1),
        totalPosts: 0,
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }
      }]
    };
  }

  const shouldBalance = platform === 'bluesky' && timeframe !== 'last24hours';
  const balancing = shouldBalance ? balancePostsByDay(filtered, getDate) : { posts: filtered, counts: null };
  const postsForAnalysis = balancing.posts || filtered;

  const texts = new Array(postsForAnalysis.length);
  for (let i = 0; i < postsForAnalysis.length; i++) texts[i] = getText(postsForAnalysis[i]);

  const analysis = await VaderService.analyzeBulkTexts(texts);

  const individual = Array.isArray(analysis.individual_results) ? analysis.individual_results : [];
  const total = analysis.total_analyzed || postsForAnalysis.length || 0;

  // Apply sarcasm adjustment per post (aligned by index)
  const enrichedResults = new Array(postsForAnalysis.length);
  for (let i = 0; i < postsForAnalysis.length; i++) {
    const r = individual[i] || {};
    const baseSentiment = r?.sentiment ?? 'neutral';
    const baseScores = normalizeScores(r);

    const adj = adjustForSarcasm(baseSentiment, baseScores, texts[i]);

    enrichedResults[i] = {
      ...r,
      sentiment: adj.sentiment,
      scores: adj.scores,
      sarcasmDetected: adj.sarcasmDetected || false,
      sarcasmConfidence: adj.sarcasmConfidence || 0,
      sarcasmReasons: adj.sarcasmReasons || [],
      // keep original confidence if present
      confidence: r?.confidence ?? 0
    };
  }

  // Recompute distribution/percentages from adjusted sentiments for consistency
  const dist = recomputeDistribution(enrichedResults);
  const percentages = total > 0 ? calcPercentages(dist, total) : { positive: 0, negative: 0, neutral: 0 };

  // Determine overall sentiment from adjusted compound average
  const average_scores = recomputeAverages(enrichedResults);

  let overall_sentiment = 'neutral';
  if (average_scores.compound >= 0.05) overall_sentiment = 'positive';
  else if (average_scores.compound <= -0.05) overall_sentiment = 'negative';

  // Sarcasm stats
  const sarcasmDetectedCount = enrichedResults.filter(r => r?.sarcasmDetected).length;
  const sarcasmRatePercent = total > 0 ? Math.round((sarcasmDetectedCount / total) * 100) : 0;

  const topKeywords = extractKeywords(texts, enrichedResults);

  const sentimentOverTime = buildSentimentOverTime(
    postsForAnalysis,
    enrichedResults,
    getDate,
    timeframe,
    new Date().toISOString()
  );

  const samplePosts = postsForAnalysis.slice(0, 10).map((item, idx) =>
    sampleMapper(item, enrichedResults[idx], platform)
  );

  const insights = generateInsights(
    {
      sentiment_distribution: dist,
      total_analyzed: total,
      topKeywords,
      sarcasm: { detected: sarcasmDetectedCount, ratePercent: sarcasmRatePercent },
      timeframe,
      referenceDate: new Date().toISOString()
    },
    query
  );

  return {
    source: platform,
    query,
    timestamp: new Date().toISOString(),
    overall_sentiment,
    average_scores,
    sentiment_distribution: dist,
    percentages,
    total_analyzed: total,

    // More accurate counts for debugging
    counts: {
      fetched: raw.length,
      afterTimeframe: timeFiltered.length,
      afterFilters: filtered.length,
      removedByTimeframe: raw.length - timeFiltered.length,
      removedByFilters: timeFiltered.length - filtered.length,
      ...(balancing.counts ? balancing.counts : {})
    },

    sarcasm: { detected: sarcasmDetectedCount, ratePercent: sarcasmRatePercent },
    insights,
    topKeywords,
    sentimentOverTime,
    samplePosts,
    platformBreakdown: [{
      platform: platform[0].toUpperCase() + platform.slice(1),
      totalPosts: total,
      sentimentDistribution: dist
    }]
  };
};

export const analyzeTwitter = async (query, maxResults = 100, options = {}) => {
  try {
    return await analyzePlatformCore({
      platform: 'twitter',
      query,
      maxResults,
      options,
      fetchFn: twitterService.searchTweets,
      getDate: (t) => t.created_at,
      getText: (t) => t.text,
      sampleMapper: (tweet, r) => ({
        text: tweet.text,
        platform: 'twitter',
        sentiment: r?.sentiment ?? 'neutral',
        confidence: Math.round((r?.confidence ?? 0) * 100),
        sarcasmDetected: r?.sarcasmDetected || false,
        sarcasmConfidence: Math.round((r?.sarcasmConfidence ?? 0) * 100),
        sarcasmReasons: r?.sarcasmReasons || [],
        created_at: tweet.created_at,
        metrics: tweet.metrics
      })
    });
  } catch (e) {
    throw new Error(`Twitter Analysis Error: ${e.message}`);
  }
};

export const analyzeReddit = async (query, maxResults = 100, options = {}) => {
  try {
    return await analyzePlatformCore({
      platform: 'reddit',
      query,
      maxResults,
      options,
      fetchFn: redditService.searchPosts,
      getDate: (p) => p.created_at,
      getText: (p) => p.text,
      sampleMapper: (post, r) => ({
        text: post.title ?? post.text,
        platform: 'reddit',
        sentiment: r?.sentiment ?? 'neutral',
        confidence: Math.round((r?.confidence ?? 0) * 100),
        sarcasmDetected: r?.sarcasmDetected || false,
        sarcasmConfidence: Math.round((r?.sarcasmConfidence ?? 0) * 100),
        sarcasmReasons: r?.sarcasmReasons || [],
        created_at: post.created_at,
        metrics: { score: post.score, comments: post.num_comments }
      })
    });
  } catch (e) {
    throw new Error(`Reddit Analysis Error: ${e.message}`);
  }
};

export const analyzeBluesky = async (query, maxResults = 100, options = {}) => {
  try {
    const requestedMaxResults = maxResults;
    const boostedMaxResults = Math.max(requestedMaxResults, 1000);

    const result = await analyzePlatformCore({
      platform: 'bluesky',
      query,
      maxResults: boostedMaxResults,
      options,
      fetchFn: blueskyService.searchPosts, // now receives (query, maxResults, options)

      getDate: (p) => p.created_at,
      getText: (p) => p.text,
      sampleMapper: (post, r) => ({
        text: post.text,
        platform: 'bluesky',
        sentiment: r?.sentiment ?? 'neutral',
        confidence: Math.round((r?.confidence ?? 0) * 100),
        sarcasmDetected: r?.sarcasmDetected || false,
        sarcasmConfidence: Math.round((r?.sarcasmConfidence ?? 0) * 100),
        sarcasmReasons: r?.sarcasmReasons || [],
        created_at: post.created_at,
        author: post.author,
        metrics: post.metrics
      })
    });

    return {
      ...result,
      maxResults: boostedMaxResults,
      requestedMaxResults
    };
  } catch (e) {
    throw new Error(`Bluesky Analysis Error: ${e.message}`);
  }
};

export const analyzeMultiplePlatforms = async (query, maxResults = 100, options = {}) => {
  try {
    const platforms = options.platforms || { twitter: true, reddit: true, bluesky: true };

    const tasks = [];
    if (platforms.twitter) tasks.push(analyzeTwitter(query, maxResults, options).catch(err => ({ error: err.message, source: 'twitter' })));
    if (platforms.reddit) tasks.push(analyzeReddit(query, maxResults, options).catch(err => ({ error: err.message, source: 'reddit' })));
    if (platforms.bluesky) tasks.push(analyzeBluesky(query, maxResults, options).catch(err => ({ error: err.message, source: 'bluesky' })));

    const results = await Promise.all(tasks);
    const ok = results.filter(r => !r.error);
    const bad = results.filter(r => r.error);

    if (ok.length === 0) {
      throw new Error(`No data available from any platform. ${bad.map(b => `${b.source}: ${b.error}`).join('; ')}`);
    }

    const total = ok.reduce((s, r) => s + (r.total_analyzed || 0), 0);
    const formatPlatform = (name = '') => (name ? name[0].toUpperCase() + name.slice(1) : name);

    const combined = ok.reduce((acc, r) => {
      acc.positive += r.sentiment_distribution?.positive || 0;
      acc.negative += r.sentiment_distribution?.negative || 0;
      acc.neutral += r.sentiment_distribution?.neutral || 0;
      return acc;
    }, { positive: 0, negative: 0, neutral: 0 });

    const percentages = total > 0 ? calcPercentages(combined, total) : { positive: 0, negative: 0, neutral: 0 };

    const compounds = ok.map(r => r.average_scores?.compound).filter(v => typeof v === 'number');
    const avgCompound = compounds.length ? (compounds.reduce((a, b) => a + b, 0) / compounds.length) : 0;

    let overall = 'neutral';
    if (avgCompound >= 0.05) overall = 'positive';
    else if (avgCompound <= -0.05) overall = 'negative';

    const keywordMap = new Map();
    for (const r of ok) {
      for (const kw of (r.topKeywords || [])) {
        const prev = keywordMap.get(kw.keyword);
        if (prev) prev.count += kw.count;
        else keywordMap.set(kw.keyword, { ...kw });
      }
    }
    const topKeywords = Array.from(keywordMap.values()).sort((a, b) => b.count - a.count).slice(0, 10);

    const samplePosts = ok.flatMap(r => (r.samplePosts || []).slice(0, 5));
    const platformBreakdown = ok.flatMap(r => r.platformBreakdown || []);
    const timeframe = options?.timeframe || 'last7days';
    const sentimentOverTime = mergeSentimentOverTime(ok, timeframe, new Date().toISOString());

    const counts = ok.reduce((acc, r) => {
      const c = r.counts || {};
      acc.fetched += c.fetched || 0;
      acc.afterTimeframe += c.afterTimeframe || 0;
      acc.afterFilters += c.afterFilters || 0;
      acc.removedByTimeframe += c.removedByTimeframe || 0;
      acc.removedByFilters += c.removedByFilters || 0;
      return acc;
    }, {
      fetched: 0,
      afterTimeframe: 0,
      afterFilters: 0,
      removedByTimeframe: 0,
      removedByFilters: 0
    });

    // Combine sarcasm stats
    const sarcasmDetectedTotal = ok.reduce((s, r) => s + (r.sarcasm?.detected || 0), 0);
    const sarcasmRatePercent = total > 0 ? Math.round((sarcasmDetectedTotal / total) * 100) : 0;

    const baseInsights = generateInsights({
      sentiment_distribution: combined,
      total_analyzed: total,
      topKeywords,
      timeframe,
      referenceDate: new Date().toISOString()
    }, query);

    const platformComparison = ok.length >= 2
      ? ok.map(r => {
        const label = formatPlatform(r.source);
        const p = r.percentages || {};
        return `${label}: ${Math.round(p.positive || 0)}% positive, ${Math.round(p.negative || 0)}% negative`;
      }).join(' | ')
      : null;

    const platformsAnalyzed = ok.length
      ? `Platforms analyzed: ${ok.map(r => formatPlatform(r.source)).join(', ')}`
      : null;

    const insights = {
      ...baseInsights,
      platformComparison,
      platformsAnalyzed
    };

    return {
      query,
      timestamp: new Date().toISOString(),
      source: 'multi-platform',
      overall_sentiment: overall,
      percentages,
      sentiment_distribution: combined,
      total_analyzed: total,
      sarcasm: { detected: sarcasmDetectedTotal, ratePercent: sarcasmRatePercent },
      insights,
      platformBreakdown,
      topKeywords,
      counts,
      samplePosts,
      sentimentOverTime,
      platforms: ok.reduce((acc, r) => {
        acc[r.source] = r;
        return acc;
      }, {})
    };
  } catch (e) {
    throw new Error(`Multi-platform Analysis Error: ${e.message}`);
  }
};

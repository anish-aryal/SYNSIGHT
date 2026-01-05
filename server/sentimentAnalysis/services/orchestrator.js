import VaderService from './vader.js';
import * as twitterService from './twitter.js';
import * as redditService from './reddit.js';
import * as blueskyService from './bluesky.js';

import { filterPosts } from '../utils/contentFilter.js';
import { extractKeywords } from '../utils/keywordExtractor.js';
import { analyzeTimeDistribution } from '../utils/timeAnalyzer.js';
import { generateInsights } from '../utils/InsightsGenerator.js';

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
    if (t === null) continue;       // invalid timestamps -> exclude
    if (t >= cutoff) out.push(items[i]);
  }

  return out;
};

const calcPercentages = (dist, total) => ({
  positive: Math.round((dist.positive / total) * 100),
  negative: Math.round((dist.negative / total) * 100),
  neutral: Math.round((dist.neutral / total) * 100)
});

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
    average_scores: { pos: 0, neu: 0, neg: 0, compound: 0 },
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
    timeAnalysis: {
      byHour: {},
      byDay: {},
      peakPeriod: null
    },
    samplePosts: [],
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
    average_scores: { pos: 0, neu: 0, neg: 0, compound: 0 },
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
    timeAnalysis: {
      byHour: {},
      byDay: {},
      peakPeriod: null
    },
    samplePosts: [],
    platformBreakdown: [{
      platform: platform[0].toUpperCase() + platform.slice(1),
      totalPosts: 0,
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }
    }]
  };
}


  const texts = new Array(filtered.length);
  for (let i = 0; i < filtered.length; i++) texts[i] = getText(filtered[i]);

  const analysis = await VaderService.analyzeBulkTexts(texts);

  const total = analysis.total_analyzed || 0;
  const dist = analysis.sentiment_distribution || { positive: 0, negative: 0, neutral: 0 };
  const percentages =
    total > 0 ? calcPercentages(dist, total) : { positive: 0, negative: 0, neutral: 0 };

  const topKeywords = extractKeywords(texts, analysis.individual_results || []);
  const timeAnalysis = analyzeTimeDistribution(filtered);

  const samplePosts = filtered.slice(0, 10).map((item, idx) =>
    sampleMapper(item, analysis.individual_results?.[idx], platform)
  );

  const insights = generateInsights(
    { sentiment_distribution: dist, total_analyzed: total, topKeywords, timeAnalysis },
    query
  );

  return {
    source: platform,
    query,
    timestamp: new Date().toISOString(),
    overall_sentiment: analysis.overall_sentiment,
    average_scores: analysis.average_scores,
    sentiment_distribution: dist,
    percentages,
    total_analyzed: total,

    // More accurate counts for debugging
    counts: {
      fetched: raw.length,
      afterTimeframe: timeFiltered.length,
      afterFilters: filtered.length,
      removedByTimeframe: raw.length - timeFiltered.length,
      removedByFilters: timeFiltered.length - filtered.length
    },

    insights,
    topKeywords,
    timeAnalysis,
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
    return await analyzePlatformCore({
      platform: 'bluesky',
      query,
      maxResults,
      options,
      fetchFn: blueskyService.searchPosts, // now receives (query, maxResults, options)
      getDate: (p) => p.created_at,
      getText: (p) => p.text,
      sampleMapper: (post, r) => ({
        text: post.text,
        platform: 'bluesky',
        sentiment: r?.sentiment ?? 'neutral',
        confidence: Math.round((r?.confidence ?? 0) * 100),
        created_at: post.created_at,
        author: post.author,
        metrics: post.metrics
      })
    });
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

    const insights = {
      overall: `Overall ${overall} sentiment across ${total} posts indicates ${
        percentages.positive >= 60 ? 'strong positive reception'
        : percentages.negative >= 60 ? 'strong negative reception'
        : 'mixed public opinion'
      }`,
      platformComparison: ok.length >= 2
        ? ok.map(r => `${r.source}: ${r.percentages?.neutral ?? 0}% neutral`).join(' vs ')
        : null,
      topDrivers: topKeywords.slice(0, 3).map(k => `"${k.keyword}" (${k.sentiment})`),
      platformsAnalyzed: ok.map(r => r.source).join(', ')
    };

    return {
      query,
      timestamp: new Date().toISOString(),
      source: 'multi-platform',
      overall_sentiment: overall,
      percentages,
      sentiment_distribution: combined,
      total_analyzed: total,
      insights,
      platformBreakdown,
      topKeywords,
      samplePosts,
      platforms: ok.reduce((acc, r) => {
        acc[r.source] = r;
        return acc;
      }, {})
    };
  } catch (e) {
    throw new Error(`Multi-platform Analysis Error: ${e.message}`);
  }
};

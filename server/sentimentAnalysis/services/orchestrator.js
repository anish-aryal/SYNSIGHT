import VaderService from './vader.js';
import * as twitterService from './twitter.js';
import * as redditService from './reddit.js';
import * as blueskyService from './bluesky.js';
import { filterPosts } from '../utils/contentFilter.js';
import { extractKeywords } from '../utils/keywordExtractor.js';
import { analyzeTimeDistribution } from '../utils/timeAnalyzer.js';
import { generateInsights } from '../utils/InsightsGenerator.js';

// Analyze plain text directly
export const analyzeText = async (text) => {
  return await VaderService.analyzeSingleText(text);
};

// Analyze multiple texts
export const analyzeBulkTexts = async (texts) => {
  return await VaderService.analyzeBulkTexts(texts);
};

// Analyze sentiment from Twitter
export const analyzeTwitter = async (query, maxResults = 100) => {
  try {
    const tweets = await twitterService.searchTweets(query, maxResults);
    
    if (tweets.length === 0) {
      throw new Error('No tweets found for the query');
    }

    // Pass query for context-aware filtering
    const filteredTweets = filterPosts(tweets, query);

    if (filteredTweets.length === 0) {
      throw new Error('No valid English tweets found after filtering. Try a different query or increase maxResults.');
    }

    const texts = filteredTweets.map(tweet => tweet.text);
    const analysis = await VaderService.analyzeBulkTexts(texts);

    const total = analysis.total_analyzed;
    const percentages = {
      positive: Math.round((analysis.sentiment_distribution.positive / total) * 100),
      negative: Math.round((analysis.sentiment_distribution.negative / total) * 100),
      neutral: Math.round((analysis.sentiment_distribution.neutral / total) * 100)
    };

    const topKeywords = extractKeywords(texts, analysis.individual_results);
    const timeAnalysis = analyzeTimeDistribution(filteredTweets);

    const samplePosts = filteredTweets.slice(0, 10).map((tweet, index) => ({
      text: tweet.text,
      platform: 'twitter',
      sentiment: analysis.individual_results[index].sentiment,
      confidence: Math.round(analysis.individual_results[index].confidence * 100),
      created_at: tweet.created_at,
      metrics: tweet.metrics
    }));

    const insights = generateInsights({
      sentiment_distribution: analysis.sentiment_distribution,
      total_analyzed: analysis.total_analyzed,
      topKeywords,
      timeAnalysis
    }, query);

    return {
      source: 'twitter',
      query,
      timestamp: new Date().toISOString(),
      overall_sentiment: analysis.overall_sentiment,
      average_scores: analysis.average_scores,
      sentiment_distribution: analysis.sentiment_distribution,
      percentages,
      total_analyzed: analysis.total_analyzed,
      insights,
      topKeywords,
      timeAnalysis,
      samplePosts,
      platformBreakdown: [{
        platform: 'Twitter',
        totalPosts: analysis.total_analyzed,
        sentimentDistribution: analysis.sentiment_distribution
      }]
    };
  } catch (error) {
    throw new Error(`Twitter Analysis Error: ${error.message}`);
  }
};

// Analyze sentiment from Reddit
export const analyzeReddit = async (query, maxResults = 100) => {
  try {
    const posts = await redditService.searchPosts(query, maxResults);
    
    if (posts.length === 0) {
      throw new Error('No Reddit posts found for the query');
    }

    // Pass query for context-aware filtering
    const filteredPosts = filterPosts(posts, query);

    if (filteredPosts.length === 0) {
      throw new Error('No valid English posts found after filtering. Try a different query or increase maxResults.');
    }

    const texts = filteredPosts.map(post => post.text);
    const analysis = await VaderService.analyzeBulkTexts(texts);

    const total = analysis.total_analyzed;
    const percentages = {
      positive: Math.round((analysis.sentiment_distribution.positive / total) * 100),
      negative: Math.round((analysis.sentiment_distribution.negative / total) * 100),
      neutral: Math.round((analysis.sentiment_distribution.neutral / total) * 100)
    };

    const topKeywords = extractKeywords(texts, analysis.individual_results);
    const timeAnalysis = analyzeTimeDistribution(filteredPosts);

    const samplePosts = filteredPosts.slice(0, 10).map((post, index) => ({
      text: post.title,
      platform: 'reddit',
      sentiment: analysis.individual_results[index].sentiment,
      confidence: Math.round(analysis.individual_results[index].confidence * 100),
      created_at: post.created_at,
      metrics: { score: post.score, comments: post.num_comments }
    }));

    const insights = generateInsights({
      sentiment_distribution: analysis.sentiment_distribution,
      total_analyzed: analysis.total_analyzed,
      topKeywords,
      timeAnalysis
    }, query);

    return {
      source: 'reddit',
      query,
      timestamp: new Date().toISOString(),
      overall_sentiment: analysis.overall_sentiment,
      average_scores: analysis.average_scores,
      sentiment_distribution: analysis.sentiment_distribution,
      percentages,
      total_analyzed: analysis.total_analyzed,
      insights,
      topKeywords,
      timeAnalysis,
      samplePosts,
      platformBreakdown: [{
        platform: 'Reddit',
        totalPosts: analysis.total_analyzed,
        sentimentDistribution: analysis.sentiment_distribution
      }]
    };
  } catch (error) {
    throw new Error(`Reddit Analysis Error: ${error.message}`);
  }
};

// Analyze sentiment from Bluesky
export const analyzeBluesky = async (query, maxResults = 100) => {
  try {
    const posts = await blueskyService.searchPosts(query, maxResults);
    
    if (posts.length === 0) {
      throw new Error('No Bluesky posts found for the query');
    }

    // Pass query for context-aware filtering
    const filteredPosts = filterPosts(posts, query);

    if (filteredPosts.length === 0) {
      throw new Error('No valid English posts found after filtering. Try a different query or increase maxResults.');
    }

    const texts = filteredPosts.map(post => post.text);
    const analysis = await VaderService.analyzeBulkTexts(texts);

    const total = analysis.total_analyzed;
    const percentages = {
      positive: Math.round((analysis.sentiment_distribution.positive / total) * 100),
      negative: Math.round((analysis.sentiment_distribution.negative / total) * 100),
      neutral: Math.round((analysis.sentiment_distribution.neutral / total) * 100)
    };

    const topKeywords = extractKeywords(texts, analysis.individual_results);
    const timeAnalysis = analyzeTimeDistribution(filteredPosts);

    const samplePosts = filteredPosts.slice(0, 10).map((post, index) => ({
      text: post.text,
      platform: 'bluesky',
      sentiment: analysis.individual_results[index].sentiment,
      confidence: Math.round(analysis.individual_results[index].confidence * 100),
      created_at: post.created_at,
      author: post.author,
      metrics: post.metrics
    }));

    const insights = generateInsights({
      sentiment_distribution: analysis.sentiment_distribution,
      total_analyzed: analysis.total_analyzed,
      topKeywords,
      timeAnalysis
    }, query);

    return {
      source: 'bluesky',
      query,
      timestamp: new Date().toISOString(),
      overall_sentiment: analysis.overall_sentiment,
      average_scores: analysis.average_scores,
      sentiment_distribution: analysis.sentiment_distribution,
      percentages,
      total_analyzed: analysis.total_analyzed,
      insights,
      topKeywords,
      timeAnalysis,
      samplePosts,
      platformBreakdown: [{
        platform: 'Bluesky',
        totalPosts: analysis.total_analyzed,
        sentimentDistribution: analysis.sentiment_distribution
      }]
    };
  } catch (error) {
    // Pass through specific error messages from bluesky.js
    throw new Error(`Bluesky Analysis Error: ${error.message}`);
  }
};

// Analyze multiple platforms
export const analyzeMultiplePlatforms = async (query, maxResults = 100) => {
  try {
    const [blueskyData, redditData] = await Promise.all([
      analyzeBluesky(query, maxResults).catch(err => ({ error: err.message })),
      analyzeReddit(query, maxResults).catch(err => ({ error: err.message }))
    ]);

    const hasBlueskyData = !blueskyData.error;
    const hasRedditData = !redditData.error;

    if (!hasBlueskyData && !hasRedditData) {
      // Provide detailed error message
      const errors = [];
      if (blueskyData.error) errors.push(`Bluesky: ${blueskyData.error}`);
      if (redditData.error) errors.push(`Reddit: ${redditData.error}`);
      throw new Error(`No data found from any platform. ${errors.join('; ')}`);
    }

    const totalAnalyzed = (hasBlueskyData ? blueskyData.total_analyzed : 0) + 
                         (hasRedditData ? redditData.total_analyzed : 0);

    const combinedDistribution = {
      positive: (hasBlueskyData ? blueskyData.sentiment_distribution.positive : 0) + 
               (hasRedditData ? redditData.sentiment_distribution.positive : 0),
      negative: (hasBlueskyData ? blueskyData.sentiment_distribution.negative : 0) + 
               (hasRedditData ? redditData.sentiment_distribution.negative : 0),
      neutral: (hasBlueskyData ? blueskyData.sentiment_distribution.neutral : 0) + 
              (hasRedditData ? redditData.sentiment_distribution.neutral : 0)
    };

    const percentages = {
      positive: Math.round((combinedDistribution.positive / totalAnalyzed) * 100),
      negative: Math.round((combinedDistribution.negative / totalAnalyzed) * 100),
      neutral: Math.round((combinedDistribution.neutral / totalAnalyzed) * 100)
    };

    let combinedSentiment = 'neutral';
    const avgCompound = hasBlueskyData && hasRedditData
      ? (blueskyData.average_scores.compound + redditData.average_scores.compound) / 2
      : hasBlueskyData ? blueskyData.average_scores.compound : redditData.average_scores.compound;
    
    if (avgCompound >= 0.05) combinedSentiment = 'positive';
    else if (avgCompound <= -0.05) combinedSentiment = 'negative';

    const allKeywords = [
      ...(hasBlueskyData ? blueskyData.topKeywords : []),
      ...(hasRedditData ? redditData.topKeywords : [])
    ];
    const keywordMap = {};
    allKeywords.forEach(kw => {
      if (keywordMap[kw.keyword]) {
        keywordMap[kw.keyword].count += kw.count;
      } else {
        keywordMap[kw.keyword] = { ...kw };
      }
    });
    const topKeywords = Object.values(keywordMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const samplePosts = [
      ...(hasBlueskyData ? blueskyData.samplePosts.slice(0, 5) : []),
      ...(hasRedditData ? redditData.samplePosts.slice(0, 5) : [])
    ];

    const platformBreakdown = [];
    if (hasBlueskyData) {
      platformBreakdown.push({
        platform: 'Bluesky',
        totalPosts: blueskyData.total_analyzed,
        sentimentDistribution: blueskyData.sentiment_distribution
      });
    }
    if (hasRedditData) {
      platformBreakdown.push({
        platform: 'Reddit',
        totalPosts: redditData.total_analyzed,
        sentimentDistribution: redditData.sentiment_distribution
      });
    }

    const insights = {
      overall: `Overall ${combinedSentiment} sentiment (${percentages.positive}%) indicates ${percentages.positive >= 60 ? 'strong public reception' : 'mixed reception'}`,
      platformComparison: hasBlueskyData && hasRedditData
        ? `Reddit discussions more neutral (${redditData.percentages.neutral}%) compared to Bluesky (${blueskyData.percentages.neutral}%)`
        : null,
      topDrivers: topKeywords.slice(0, 3).map(k => `${k.keyword} (${k.sentiment})`),
      platformsAnalyzed: hasBlueskyData && hasRedditData 
        ? 'Both platforms analyzed successfully'
        : hasBlueskyData 
          ? `Only Bluesky analyzed. Reddit error: ${redditData.error}`
          : `Only Reddit analyzed. Bluesky error: ${blueskyData.error}`
    };

    return {
      query,
      timestamp: new Date().toISOString(),
      source: 'multi-platform',
      overall_sentiment: combinedSentiment,
      percentages,
      sentiment_distribution: combinedDistribution,
      total_analyzed: totalAnalyzed,
      insights,
      platformBreakdown,
      topKeywords,
      samplePosts,
      platforms: {
        bluesky: blueskyData,
        reddit: redditData
      }
    };
  } catch (error) {
    throw new Error(`Multi-platform Analysis Error: ${error.message}`);
  }
};
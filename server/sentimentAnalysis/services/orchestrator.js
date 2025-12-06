import VaderService from './vader.js';
import * as twitterService from './twitter.js';
import * as redditService from './reddit.js';

// Extract keywords from texts
export const extractKeywords = (texts, sentimentResults) => {
  const wordFrequency = {};
  const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it', 'from', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);

  texts.forEach((text, index) => {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    const sentiment = sentimentResults[index]?.sentiment || 'neutral';

    words.forEach(word => {
      if (!wordFrequency[word]) {
        wordFrequency[word] = {
          count: 0,
          sentiments: { positive: 0, negative: 0, neutral: 0 }
        };
      }
      wordFrequency[word].count++;
      wordFrequency[word].sentiments[sentiment]++;
    });
  });

  // Convert to array and sort by frequency
  const keywords = Object.entries(wordFrequency)
    .map(([keyword, data]) => {
      const maxSentiment = Object.keys(data.sentiments).reduce((a, b) => 
        data.sentiments[a] > data.sentiments[b] ? a : b
      );
      return {
        keyword,
        count: data.count,
        sentiment: maxSentiment
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return keywords;
};

// Analyze time distribution
export const analyzeTimeDistribution = (posts) => {
  const hourlyVolume = Array(24).fill(0);

  posts.forEach(post => {
    const date = new Date(post.created_at);
    const hour = date.getHours();
    hourlyVolume[hour]++;
  });

  return hourlyVolume.map((volume, hour) => ({ hour, volume }));
};

// Generate insights
export const generateInsights = (data, query) => {
  const insights = {};

  // Overall sentiment insight
  const positivePercent = Math.round((data.sentiment_distribution.positive / data.total_analyzed) * 100);
  if (positivePercent >= 60) {
    insights.overall = `Overall positive sentiment (${positivePercent}%) indicates strong public reception`;
  } else if (positivePercent <= 40) {
    insights.overall = `Mixed sentiment with concerns (${100 - positivePercent}% negative/neutral)`;
  } else {
    insights.overall = `Balanced sentiment with ${positivePercent}% positive reception`;
  }

  // Peak engagement
  if (data.timeAnalysis && data.timeAnalysis.length > 0) {
    const peakHour = data.timeAnalysis.reduce((max, curr) => 
      curr.volume > max.volume ? curr : max
    );
    const timeLabel = peakHour.hour < 12 ? 'AM' : 'PM';
    const displayHour = peakHour.hour % 12 || 12;
    insights.peakEngagement = `Peak engagement observed at ${displayHour} ${timeLabel}`;
  }

  // Top drivers (from keywords)
  if (data.topKeywords && data.topKeywords.length > 0) {
    const positiveKeywords = data.topKeywords
      .filter(k => k.sentiment === 'positive')
      .slice(0, 2)
      .map(k => k.keyword);
    
    const negativeKeywords = data.topKeywords
      .filter(k => k.sentiment === 'negative')
      .slice(0, 2)
      .map(k => k.keyword);

    const drivers = [];
    if (positiveKeywords.length > 0) {
      drivers.push(`${positiveKeywords.join(', ')} (positive aspects)`);
    }
    if (negativeKeywords.length > 0) {
      drivers.push(`${negativeKeywords.join(', ')} (concerns)`);
    }
    
    insights.topDrivers = drivers;
  }

  return insights;
};

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

    const texts = tweets.map(tweet => tweet.text);
    const analysis = await VaderService.analyzeBulkTexts(texts);

    // Calculate percentages
    const total = analysis.total_analyzed;
    const percentages = {
      positive: Math.round((analysis.sentiment_distribution.positive / total) * 100),
      negative: Math.round((analysis.sentiment_distribution.negative / total) * 100),
      neutral: Math.round((analysis.sentiment_distribution.neutral / total) * 100)
    };

    // Extract keywords
    const topKeywords = extractKeywords(texts, analysis.individual_results);

    // Analyze time distribution
    const timeAnalysis = analyzeTimeDistribution(tweets);

    // Prepare sample posts
    const samplePosts = tweets.slice(0, 10).map((tweet, index) => ({
      text: tweet.text,
      platform: 'twitter',
      sentiment: analysis.individual_results[index].sentiment,
      confidence: Math.round(analysis.individual_results[index].confidence * 100),
      created_at: tweet.created_at,
      metrics: tweet.metrics
    }));

    // Generate insights
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

    const texts = posts.map(post => post.text);
    const analysis = await VaderService.analyzeBulkTexts(texts);

    // Calculate percentages
    const total = analysis.total_analyzed;
    const percentages = {
      positive: Math.round((analysis.sentiment_distribution.positive / total) * 100),
      negative: Math.round((analysis.sentiment_distribution.negative / total) * 100),
      neutral: Math.round((analysis.sentiment_distribution.neutral / total) * 100)
    };

    // Extract keywords
    const topKeywords = extractKeywords(texts, analysis.individual_results);

    // Analyze time distribution
    const timeAnalysis = analyzeTimeDistribution(posts);

    // Prepare sample posts
    const samplePosts = posts.slice(0, 10).map((post, index) => ({
      text: post.title,
      platform: 'reddit',
      sentiment: analysis.individual_results[index].sentiment,
      confidence: Math.round(analysis.individual_results[index].confidence * 100),
      created_at: post.created_at,
      metrics: { score: post.score, comments: post.num_comments }
    }));

    // Generate insights
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

// Analyze both Twitter and Reddit
export const analyzeMultiplePlatforms = async (query, maxResults = 100) => {
  try {
    const [twitterData, redditData] = await Promise.all([
      analyzeTwitter(query, maxResults).catch(err => ({ error: err.message })),
      analyzeReddit(query, maxResults).catch(err => ({ error: err.message }))
    ]);

    const hasTwitterData = !twitterData.error;
    const hasRedditData = !redditData.error;

    if (!hasTwitterData && !hasRedditData) {
      throw new Error('No data found from any platform');
    }

    // Combine data
    const totalAnalyzed = (hasTwitterData ? twitterData.total_analyzed : 0) + 
                         (hasRedditData ? redditData.total_analyzed : 0);

    const combinedDistribution = {
      positive: (hasTwitterData ? twitterData.sentiment_distribution.positive : 0) + 
               (hasRedditData ? redditData.sentiment_distribution.positive : 0),
      negative: (hasTwitterData ? twitterData.sentiment_distribution.negative : 0) + 
               (hasRedditData ? redditData.sentiment_distribution.negative : 0),
      neutral: (hasTwitterData ? twitterData.sentiment_distribution.neutral : 0) + 
              (hasRedditData ? redditData.sentiment_distribution.neutral : 0)
    };

    const percentages = {
      positive: Math.round((combinedDistribution.positive / totalAnalyzed) * 100),
      negative: Math.round((combinedDistribution.negative / totalAnalyzed) * 100),
      neutral: Math.round((combinedDistribution.neutral / totalAnalyzed) * 100)
    };

    // Determine combined sentiment
    let combinedSentiment = 'neutral';
    const avgCompound = hasTwitterData && hasRedditData
      ? (twitterData.average_scores.compound + redditData.average_scores.compound) / 2
      : hasTwitterData ? twitterData.average_scores.compound : redditData.average_scores.compound;
    
    if (avgCompound >= 0.05) combinedSentiment = 'positive';
    else if (avgCompound <= -0.05) combinedSentiment = 'negative';

    // Combine keywords
    const allKeywords = [
      ...(hasTwitterData ? twitterData.topKeywords : []),
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

    // Combine sample posts
    const samplePosts = [
      ...(hasTwitterData ? twitterData.samplePosts.slice(0, 5) : []),
      ...(hasRedditData ? redditData.samplePosts.slice(0, 5) : [])
    ];

    // Platform breakdown
    const platformBreakdown = [];
    if (hasTwitterData) {
      platformBreakdown.push({
        platform: 'Twitter',
        totalPosts: twitterData.total_analyzed,
        sentimentDistribution: twitterData.sentiment_distribution
      });
    }
    if (hasRedditData) {
      platformBreakdown.push({
        platform: 'Reddit',
        totalPosts: redditData.total_analyzed,
        sentimentDistribution: redditData.sentiment_distribution
      });
    }

    // Generate combined insights
    const insights = {
      overall: `Overall ${combinedSentiment} sentiment (${percentages.positive}%) indicates ${percentages.positive >= 60 ? 'strong public reception' : 'mixed reception'}`,
      platformComparison: hasTwitterData && hasRedditData
        ? `Reddit discussions more neutral (${redditData.percentages.neutral}%) compared to Twitter (${twitterData.percentages.neutral}%)`
        : null,
      topDrivers: topKeywords.slice(0, 3).map(k => `${k.keyword} (${k.sentiment})`)
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
        twitter: twitterData,
        reddit: redditData
      }
    };
  } catch (error) {
    throw new Error(`Multi-platform Analysis Error: ${error.message}`);
  }
};
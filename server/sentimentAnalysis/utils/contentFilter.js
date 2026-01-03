import { isValidEnglishContent } from './languageDetector.js';

/**
 * Check if text contains promotional keywords
 */
export const isPromotional = (text) => {
  const lowercaseText = text.toLowerCase();
  
  const promotionalKeywords = [
    'shop now',
    'buy now',
    'check this out',
    'click here',
    'limited time',
    'discount',
    'sale',
    '% off',
    'coupon',
    'deal',
    'offer',
    'free shipping',
    'order now',
    'get yours',
    'claim now',
    'act fast',
    'don\'t miss',
    'limited stock'
  ];

  return promotionalKeywords.some(keyword => lowercaseText.includes(keyword));
};

/**
 * Check if query is sales/marketing related
 * If user is searching for sales topics, don't filter promotional content
 */
export const isSalesMarketingQuery = (query) => {
  const lowercaseQuery = query.toLowerCase();
  
  const salesKeywords = [
    'sale',
    'sales',
    'discount',
    'deal',
    'deals',
    'promotion',
    'marketing',
    'advertisement',
    'advertising',
    'campaign',
    'offer',
    'coupon',
    'black friday',
    'cyber monday',
    'clearance',
    'promo',
    'shopping',
    'buy',
    'purchase',
    'price',
    'pricing',
    'cost',
    'cheap',
    'affordable',
    'budget'
  ];

  return salesKeywords.some(keyword => lowercaseQuery.includes(keyword));
};

/**
 * Check if post has zero engagement (likely spam/bot)
 */
export const hasZeroEngagement = (metrics) => {
  return (
    (metrics.like_count === 0 || metrics.like_count === undefined) &&
    (metrics.retweet_count === 0 || metrics.repost_count === 0 || 
     metrics.retweet_count === undefined || metrics.repost_count === undefined) &&
    (metrics.reply_count === 0 || metrics.reply_count === undefined)
  );
};

/**
 * Check if text is a retweet
 */
export const isRetweet = (text) => {
  return text.toLowerCase().startsWith('rt @');
};

/**
 * Check if post is spam (promotional with zero engagement)
 */
export const isSpam = (text, metrics) => {
  // Promotional content with zero engagement is likely spam
  if (isPromotional(text) && hasZeroEngagement(metrics)) {
    return true;
  }

  // Posts with only URLs and no meaningful text
  const urlRegex = /https?:\/\/\S+/g;
  const urlCount = (text.match(urlRegex) || []).length;
  const textWithoutUrls = text.replace(urlRegex, '').trim();
  
  if (urlCount > 0 && textWithoutUrls.length < 20) {
    return true; // Likely link spam
  }

  return false;
};

/**
 * Main filter function with context awareness
 * @param {Object} post - Post object with text and metrics
 * @param {string} query - Search query (for context)
 * @returns {boolean} - True if post should be kept
 */
export const filterPost = (post, query = '') => {
  // Language check - always apply
  if (!isValidEnglishContent(post.text)) {
    return false;
  }

  // Retweet check - always filter
  if (isRetweet(post.text)) {
    return false;
  }

  // Spam check - always filter
  if (isSpam(post.text, post.metrics)) {
    return false;
  }

  // Context-aware promotional filtering
  // If user is searching for sales/marketing topics, keep promotional content
  if (!isSalesMarketingQuery(query)) {
    // Not a sales query, so filter promotional content with low engagement
    if (isPromotional(post.text) && hasZeroEngagement(post.metrics)) {
      return false;
    }
    
    // Also filter obvious ads even with some engagement
    const isObviousAd = (
      post.text.toLowerCase().includes('shop now') ||
      post.text.toLowerCase().includes('buy now') ||
      post.text.toLowerCase().includes('click here')
    );
    
    if (isObviousAd) {
      return false;
    }
  }

  return true;
};


export const filterPosts = (posts, query = '') => {
  return posts.filter(post => filterPost(post, query));
};
import { isValidEnglishContent, isValidLanguageContent } from './languageDetector.js';

const URL_RE = /https?:\/\/\S+/g;
const HASHTAG_RE = /#\w+/g;
const MENTION_RE = /@\w+/g;
const EMOJI_RE = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
const RT_RE = /^rt\s+@\w+:\s*/i;

const PROMO_KEYWORDS = [
  'shop now','buy now','check this out','click here',
  'limited time','discount','sale','% off','coupon',
  'deal','offer','free shipping','order now','get yours',
  'claim now','act fast',"don't miss",'limited stock'
];

const SALES_KEYWORDS = [
  'sale','sales','discount','deal','deals','promotion',
  'marketing','advertisement','advertising','campaign',
  'offer','coupon','black friday','cyber monday','clearance',
  'promo','shopping','buy','purchase','price','pricing',
  'cost','cheap','affordable','budget'
];

const SPAM_PHRASES = [
  'click here now','limited time offer','act now',
  'claim your free','congratulations you won',
  'earn money fast','work from home','make money online'
];

const toLower = (s) => (s ? s.toLowerCase() : '');

export const isPromotional = (text) => {
  const t = toLower(text);
  let hits = 0;
  for (let i = 0; i < PROMO_KEYWORDS.length; i++) {
    if (t.includes(PROMO_KEYWORDS[i])) {
      hits++;
      if (hits >= 2) return true;
    }
  }
  return false;
};

export const isSalesMarketingQuery = (query) => {
  const q = toLower(query);
  for (let i = 0; i < SALES_KEYWORDS.length; i++) {
    if (q.includes(SALES_KEYWORDS[i])) return true;
  }
  return false;
};

export const hasSuspiciousEngagement = (metrics = {}) => {
  const likeCount = metrics.like_count || 0;
  const repostCount = metrics.retweet_count || metrics.repost_count || 0;
  const replyCount = metrics.reply_count || 0;
  return likeCount === 0 && repostCount === 0 && replyCount === 0;
};

export const isSimpleRetweet = (text) => {
  if (!RT_RE.test(text || '')) return false;
  const withoutRT = (text || '').replace(RT_RE, '').trim();
  return withoutRT.length < 10;
};

export const isObviousSpam = (text, metrics = {}) => {
  const t = text || '';
  const lc = toLower(t);

  const urlCount = (t.match(URL_RE) || []).length;
  const textWithoutUrls = t.replace(URL_RE, '').trim();
  if (urlCount >= 3 && textWithoutUrls.length < 30) return true;

  for (let i = 0; i < SPAM_PHRASES.length; i++) {
    if (lc.includes(SPAM_PHRASES[i]) && hasSuspiciousEngagement(metrics)) return true;
  }

  const hashtagCount = (t.match(HASHTAG_RE) || []).length;
  if (hashtagCount > 8 && t.length < 100) return true;

  return false;
};

export const isTooShort = (text) => {
  const cleanText = (text || '')
    .replace(URL_RE, '')
    .replace(MENTION_RE, '')
    .replace(HASHTAG_RE, '')
    .trim();

  return cleanText.length < 10;
};

export const isLikelyBot = (text) => {
  const lc = toLower(text);
  const words = lc.split(/\s+/);
  const freq = Object.create(null);

  let maxRep = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.length <= 3) continue;
    const c = (freq[w] = (freq[w] || 0) + 1);
    if (c > maxRep) maxRep = c;
    if (maxRep > 5) return true;
  }

  const emojiCount = ((text || '').match(EMOJI_RE) || []).length;
  if (emojiCount > 10) return true;

  return false;
};

const passesLanguage = (post, language) => {
  if (!language || language === 'all') return true;

  // Twitter provides lang
  if (post.lang) return post.lang === language;

  if (language === 'en') return isValidEnglishContent(post.text);
  return isValidLanguageContent(post.text, language);
};

export const filterPost = (post, query = '', options = {}) => {
  const language = options.language || 'en';

  if (!passesLanguage(post, language)) return false;

  if (isSimpleRetweet(post.text)) return false;
  if (isTooShort(post.text)) return false;
  if (isObviousSpam(post.text, post.metrics)) return false;
  if (isLikelyBot(post.text)) return false;

  if (!isSalesMarketingQuery(query)) {
    if (isPromotional(post.text) && hasSuspiciousEngagement(post.metrics)) return false;
  }

  return true;
};

export const filterPosts = (posts, query = '', options = {}) => {
  if (!Array.isArray(posts) || posts.length === 0) return [];
  const out = [];
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    if (filterPost(p, query, options)) out.push(p);
  }
  return out;
};

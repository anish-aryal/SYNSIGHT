

import { isValidEnglishContent, isValidLanguageContent } from './languageDetector.js';

const URL_RE = /https?:\/\/\S+/gi;
const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
// supports @user, @user.name, @user-name, @wlborg.hachyderm.io
const MENTION_RE = /@[a-z0-9_][a-z0-9_.-]*/gi;

// broader emoji detection (Node supports Unicode property escapes)
const EMOJI_RE = /\p{Extended_Pictographic}/gu;

const RT_RE = /^rt\s+@[a-z0-9_][a-z0-9_.-]*:\s*/i;

// Keep these lists for query detection + light signals (not hard filters)
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

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_RE = /\b(\+?\d[\d\s().-]{7,}\d)\b/;
const MONEY_RE = /\b(\$|£|€)\s?\d+([.,]\d+)?\b/;
const PROMO_CODE_RE = /\b(code|promo|coupon)\s*[:\-]?\s*[A-Z0-9]{4,}\b/i;

const toLower = (s) => (s ? s.toLowerCase() : '');

const normalize = (text = '') =>
  String(text)
    .replace(/\u0000/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const stripUrls = (text = '') => String(text).replace(URL_RE, '').trim();

const cleanText = (text = '') =>
  String(text)
    .replace(URL_RE, '')
    .replace(MENTION_RE, '')
    .replace(HASHTAG_RE, '')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text = '') =>
  normalize(text)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(t => t.replace(/[^\p{L}\p{N}'-]/gu, ''));

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Existing export name kept.
 * Still useful to detect if the user's *query* is about sales/marketing.
 */
export const isSalesMarketingQuery = (query) => {
  const q = toLower(query);
  for (let i = 0; i < SALES_KEYWORDS.length; i++) {
    const kw = SALES_KEYWORDS[i];
    const re = new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i');
    if (re.test(q)) return true;
  }
  return false;
};

/**
 * Engagement normalized across platforms.
 * Existing export name kept.
 */
export const hasSuspiciousEngagement = (metrics = {}) => {
  const like = Number(metrics.like_count ?? metrics.likes ?? 0) || 0;
  const repost = Number(metrics.retweet_count ?? metrics.repost_count ?? metrics.shares ?? 0) || 0;
  const reply = Number(metrics.reply_count ?? metrics.replies ?? 0) || 0;
  const quote = Number(metrics.quote_count ?? 0) || 0;

  // reddit-style metrics
  const score = Number(metrics.score ?? 0) || 0;
  const comments = Number(metrics.comments ?? metrics.num_comments ?? 0) || 0;

  const engagement = like + repost + reply + quote + score + comments;

  // IMPORTANT: treat 0 engagement as weak signal; keep function semantics (boolean)
  return engagement === 0;
};

/**
 * Existing export name kept.
 * Heuristic promo detector (lightweight). We no longer use it as a hard filter by itself.
 */
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

/**
 * Existing export name kept.
 */
export const isSimpleRetweet = (text) => {
  if (!RT_RE.test(text || '')) return false;
  const withoutRT = String(text || '').replace(RT_RE, '').trim();
  return withoutRT.length < 12;
};

/**
 * Pattern-based CTA detection (generalizes; not an exhaustive keyword list)
 */
const hasCtaPattern = (text = '') => {
  const t = normalize(text).toLowerCase();

  return (
    /\b(click|tap|visit|check|watch|read|download|subscribe|sign\s?up|register|join|follow|share)\b.*\b(link|bio|here|now|today)\b/.test(t) ||
    /\b(buy|order|purchase|get|claim)\b.*\b(now|today|yours|deal|offer)\b/.test(t) ||
    /\b(dm|message)\s+me\b/.test(t) ||
    /\blink\s+in\s+bio\b/.test(t)
  );
};

const hasExcessiveFormattingScore = (text = '') => {
  const t = String(text);

  const allCapsWords = (t.match(/\b[A-Z]{5,}\b/g) || []).length;
  const repeatedChars = /(.)\1{4,}/.test(t); // loooool / !!!!!!
  const emojiCount = (t.match(EMOJI_RE) || []).length;

  let score = 0;
  if (allCapsWords >= 2) score += 1;
  if (repeatedChars) score += 1;
  if (emojiCount >= 12) score += 2;
  else if (emojiCount >= 8) score += 1;

  return score;
};

const ngramRepetitionScore = (tokens, n = 2) => {
  if (!Array.isArray(tokens) || tokens.length < n * 4) return 0;

  const seen = new Map();
  let max = 0;

  for (let i = 0; i <= tokens.length - n; i++) {
    const key = tokens.slice(i, i + n).join(' ');
    const c = (seen.get(key) || 0) + 1;
    seen.set(key, c);
    if (c > max) max = c;
  }

  if (max >= 4) return 3;
  if (max === 3) return 2;
  if (max === 2) return 1;
  return 0;
};

/**
 * Classify promo/spam using pattern scoring. No domain allowlists.
 * Returns { label: 'organic'|'promotional'|'spam', score, confidence, reasons }
 */
const classifyPromoSpam = (text, metrics = {}) => {
  const raw = String(text || '');
  const t = normalize(raw);

  const reasons = [];
  let score = 0;

  const urls = t.match(URL_RE) || [];
  const urlCount = urls.length;

  const noUrlText = stripUrls(t);
  const tokensNoUrl = tokenize(noUrlText);
  const tokenCount = tokensNoUrl.length;

  // 1) Link density + low content
  if (urlCount >= 3 && tokenCount <= 8) { score += 5; reasons.push('many_links_low_text'); }
  else if (urlCount === 2 && tokenCount <= 10) { score += 3; reasons.push('two_links_low_text'); }
  else if (urlCount >= 1 && tokenCount <= 3) { score += 2; reasons.push('link_with_very_low_text'); }

  // 2) High-signal spam phrases (kept from your list)
  const lc = t.toLowerCase();
  for (let i = 0; i < SPAM_PHRASES.length; i++) {
    if (lc.includes(SPAM_PHRASES[i])) {
      score += 5;
      reasons.push('spam_phrase');
      break;
    }
  }

  // 3) CTA patterns
  if (hasCtaPattern(t)) { score += 3; reasons.push('cta_pattern'); }

  // 4) Promo code / monetization / contact info
  if (PROMO_CODE_RE.test(t)) { score += 3; reasons.push('promo_code_pattern'); }
  if (EMAIL_RE.test(t) || PHONE_RE.test(t)) { score += 3; reasons.push('direct_contact_info'); }
  if (/\b(whatsapp|telegram|cashapp|venmo|paypal|crypto|wallet)\b/i.test(t)) { score += 2; reasons.push('payment_or_channel'); }
  if (MONEY_RE.test(t)) { score += 1; reasons.push('money_amount'); }

  // 5) Hashtag stuffing / ratio
  const hashtags = t.match(HASHTAG_RE) || [];
  if (hashtags.length >= 10) { score += 3; reasons.push('hashtag_stuffing'); }
  else if (hashtags.length >= 6 && tokenCount <= 20) { score += 2; reasons.push('high_hashtag_ratio'); }

  // 6) Bot-like repetition
  const rep = ngramRepetitionScore(tokensNoUrl, 2);
  if (rep > 0) { score += rep; reasons.push(`repetition_${rep}`); }

  // 7) Formatting spam
  const fmt = hasExcessiveFormattingScore(t);
  if (fmt > 0) { score += fmt; reasons.push(`formatting_${fmt}`); }

  // 8) Engagement (weak)
  if (hasSuspiciousEngagement(metrics)) { score += 1; reasons.push('zero_engagement'); }

  // Decide label (precision-focused thresholds)
  let label = 'organic';
  if (score >= 9) label = 'spam';
  else if (score >= 6) label = 'promotional';

  const confidence = Math.max(0, Math.min(score / 10, 1));

  return { label, score, confidence, reasons, urlCount, tokenCount };
};

/**
 * Existing export name kept.
 * Now uses score-based logic; only returns true for high-confidence spam.
 * This prevents filtering news/blog/update links.
 */
export const isObviousSpam = (text, metrics = {}) => {
  const cls = classifyPromoSpam(text, metrics);
  return cls.label === 'spam';
};

/**
 * Existing export name kept.
 * Slightly relaxed to avoid removing short but meaningful posts.
 */
export const isTooShort = (text) => {
  const ct = cleanText(text);
  const tokens = ct.split(/\s+/).filter(Boolean);

  // Accept if 2+ tokens OR 6+ chars
  if (tokens.length >= 2) return false;
  return ct.length < 6;
};

/**
 * Existing export name kept.
 * Tweaked: better mention/emoji handling and repetition threshold.
 */
export const isLikelyBot = (text) => {
  const lc = toLower(text);
  const words = lc.split(/\s+/).filter(Boolean);
  const freq = Object.create(null);

  let maxRep = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i].replace(/[^\p{L}\p{N}'-]/gu, '');
    if (w.length <= 3) continue;
    const c = (freq[w] = (freq[w] || 0) + 1);
    if (c > maxRep) maxRep = c;
    if (maxRep > 6) return true;
  }

  const emojiCount = ((text || '').match(EMOJI_RE) || []).length;
  if (emojiCount > 14) return true;

  return false;
};

const passesLanguage = (post, language) => {
  if (!language || language === 'all') return true;

  // Twitter provides lang
  if (post.lang) return post.lang === language;

  // Prefer post.text but fall back to title/text
  const text = post?.text ?? post?.title ?? '';

  if (language === 'en') return isValidEnglishContent(text);
  return isValidLanguageContent(text, language);
};

/**
 * Existing export name kept.
 * Updated logic:
 * - Always filters retweets/too-short/bot/high-confidence spam
 * - DOES NOT hard-block promotional content unless it's high confidence spam
 * - Keeps promo content if the query is marketing/sales (relevant)
 */
export const filterPost = (post, query = '', options = {}) => {
  const language = options.language || 'en';

  if (!passesLanguage(post, language)) return false;

  const text = post?.text ?? post?.title ?? '';
  const metrics = post?.metrics ?? {};

  if (isSimpleRetweet(text)) return false;
  if (isTooShort(text)) return false;

  // High-confidence spam
  if (isObviousSpam(text, metrics)) return false;

  // Bot signals
  if (isLikelyBot(text)) return false;

  // Promotional is not automatically spam.
  // Only suppress promotional content when query is not about sales/marketing AND it looks promo-ish AND engagement is zero.
  // (Still conservative: avoids deleting news/update posts.)
  if (!isSalesMarketingQuery(query)) {
    const cls = classifyPromoSpam(text, metrics);
    if (cls.label === 'promotional' && hasSuspiciousEngagement(metrics) && cls.score >= 7) {
      return false;
    }
  }

  return true;
};

/**
 * Existing export name kept.
 */
export const filterPosts = (posts, query = '', options = {}) => {
  if (!Array.isArray(posts) || posts.length === 0) return [];
  const out = [];
  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    if (filterPost(p, query, options)) out.push(p);
  }
  return out;
};

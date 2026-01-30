import { franc } from 'franc';

// Language Detector utility helpers.

const MAX_CACHE = 5000;
const langCache = new Map();

const ISO3_TO_ISO1 = {
  eng: 'en',
  spa: 'es',
  fra: 'fr',
  deu: 'de'
};

const URL_RE = /https?:\/\/\S+/g;
const MENTION_RE = /@\w+/g;
const HASHTAG_RE = /#\w+/g;
const NON_WORD_RE = /[^\w\s]/g;

export const getEnglishPercentage = (text) => {
  if (!text) return 0;
  const englishChars = text.match(/[a-zA-Z0-9\s.,!?'"]/g) || [];
  const totalChars = text.replace(/\s/g, '').length;
  if (totalChars === 0) return 0;
  return (englishChars.length / totalChars) * 100;
};

const normalizeForLangDetect = (text) => {
  return text
    .replace(URL_RE, '')
    .replace(MENTION_RE, '')
    .replace(HASHTAG_RE, '')
    .replace(NON_WORD_RE, ' ')
    .trim();
};

const cacheGet = (key) => {
  const v = langCache.get(key);
  if (v !== undefined) {
    langCache.delete(key);
    langCache.set(key, v);
  }
  return v;
};

const cacheSet = (key, val) => {
  langCache.set(key, val);
  if (langCache.size > MAX_CACHE) {
    const firstKey = langCache.keys().next().value;
    langCache.delete(firstKey);
  }
};

export const detectLanguageISO1 = (text) => {
  if (!text || text.trim().length < 10) return null;

  const cached = cacheGet(text);
  if (cached !== undefined) return cached;

  const cleaned = normalizeForLangDetect(text);
  if (cleaned.length < 10) {
    cacheSet(text, null);
    return null;
  }

  const latinPct = getEnglishPercentage(cleaned);
  if (latinPct < 40) {
    cacheSet(text, null);
    return null;
  }

  const iso3 = franc(cleaned);
  const iso1 = ISO3_TO_ISO1[iso3] || null;

  cacheSet(text, iso1);
  return iso1;
};

export const isEnglish = (text) => detectLanguageISO1(text) === 'en';

export const isValidEnglishContent = (text) => {
  if (!text || text.trim().length < 10) return false;
  if (!isEnglish(text)) return false;
  return getEnglishPercentage(text) >= 70;
};

export const isValidLanguageContent = (text, language) => {
  if (!text || text.trim().length < 10) return false;
  if (!language || language === 'all') return true;

  if (language === 'en') return isValidEnglishContent(text);

  const detected = detectLanguageISO1(text);
  return detected === language;
};

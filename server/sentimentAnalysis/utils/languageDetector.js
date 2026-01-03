import { franc } from 'franc';

export const isEnglish = (text) => {
  if (!text || text.trim().length < 10) {
    return false;
  }

  const cleanText = text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/@\w+/g, '')
    .replace(/#\w+/g, '')
    .replace(/[^\w\s]/g, ' ')
    .trim();

  if (cleanText.length < 10) {
    return false;
  }

  const detectedLanguage = franc(cleanText);
  return detectedLanguage === 'eng';
};

export const getEnglishPercentage = (text) => {
  if (!text) return 0;

  const englishChars = text.match(/[a-zA-Z0-9\s.,!?'"]/g) || [];
  const totalChars = text.replace(/\s/g, '').length;

  if (totalChars === 0) return 0;

  return (englishChars.length / totalChars) * 100;
};

export const isValidEnglishContent = (text) => {
  if (!text || text.trim().length < 10) {
    return false;
  }

  if (!isEnglish(text)) {
    return false;
  }

  const englishPercentage = getEnglishPercentage(text);
  if (englishPercentage < 70) {
    return false;
  }

  return true;
};
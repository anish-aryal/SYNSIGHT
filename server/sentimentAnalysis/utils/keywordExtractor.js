// Keyword Extractor utility helpers.

const STOP_WORDS = new Set([
  'the','is','at','which','on','a','an','and','or','but',
  'in','with','to','for','of','as','by','this','that','it',
  'from','are','was','were','been','be','have','has','had',
  'do','does','did','will','would','could','should','can',
  'just','so','about','up','out','if','who','get','make',
  'go','see','know','take','think','come','want','use'
]);

const CLEAN_RE = /[^\w\s]/g;

export const extractKeywords = (texts, sentimentResults) => {
  const freq = new Map();

  for (let i = 0; i < texts.length; i++) {
    const text = (texts[i] || '').toLowerCase().replace(CLEAN_RE, ' ');
    const sentiment = sentimentResults[i]?.sentiment || 'neutral';

    const parts = text.split(/\s+/);
    let tokensUsed = 0;

    for (let j = 0; j < parts.length; j++) {
      const w = parts[j];
      if (!w || w.length <= 3) continue;
      if (STOP_WORDS.has(w)) continue;

      tokensUsed++;
      if (tokensUsed > 80) break;

      let entry = freq.get(w);
      if (!entry) {
        entry = { count: 0, sentiments: { positive: 0, negative: 0, neutral: 0 } };
        freq.set(w, entry);
      }
      entry.count++;
      entry.sentiments[sentiment] = (entry.sentiments[sentiment] || 0) + 1;
    }
  }

  const keywords = [];
  for (const [keyword, data] of freq.entries()) {
    const s = data.sentiments;
    const maxSentiment =
      s.positive >= s.negative && s.positive >= s.neutral
        ? 'positive'
        : s.negative >= s.neutral
          ? 'negative'
          : 'neutral';

    keywords.push({ keyword, count: data.count, sentiment: maxSentiment });
  }

  keywords.sort((a, b) => b.count - a.count);
  return keywords.slice(0, 10);
};

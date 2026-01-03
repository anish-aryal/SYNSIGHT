export const extractKeywords = (texts, sentimentResults) => {
  const wordFrequency = {};
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 
    'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it', 
    'from', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 
    'just', 'so', 'about', 'up', 'out', 'if', 'who', 'get', 'make', 
    'go', 'see', 'know', 'take', 'think', 'come', 'want', 'use'
  ]);

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
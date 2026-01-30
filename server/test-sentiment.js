import VaderService from './sentimentAnalysis/services/vader.js';

// Local script to test sentiment analysis.

const testSentiment = async () => {
  console.log('Testing VADER Sentiment Analysis...\n');

  // Test single text
  const text1 = 'I love this product! It is amazing!';
  console.log(`Testing: "${text1}"`);
  const result1 = await VaderService.analyzeSingleText(text1);
  console.log('Result:', result1);
  console.log('\n---\n');

  // Test bulk
  const texts = [
    'This is great!',
    'This is terrible.',
    'It is okay.'
  ];
  console.log('Testing bulk analysis...');
  const result2 = await VaderService.analyzeBulkTexts(texts);
  console.log('Result:', result2);
};

testSentiment().catch(console.error);
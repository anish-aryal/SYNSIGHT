// Mock Reddit Service - Returns realistic fake data for development
console.log('Warning: Using mock Reddit service - no real API calls');

// Generate random date within last 7 days
const generateRandomDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString();
};

// Generate mock posts based on query
const generateMockPosts = (query, count) => {
  const sentiments = ['positive', 'negative', 'neutral'];
  const subreddits = ['technology', 'gadgets', 'apple', 'android', 'products'];
  
  const positiveTemplates = [
    `Just got the ${query} and I'm absolutely loving it! Best purchase ever.`,
    `The ${query} exceeded all my expectations. Highly recommend!`,
    `Can't believe how good the ${query} is. Worth every penny!`,
    `${query} is a game changer. Amazing features and great value.`,
    `Upgraded to ${query} and it's incredible. No regrets!`
  ];

  const negativeTemplates = [
    `Really disappointed with ${query}. Not worth the price at all.`,
    `${query} has too many issues. Would not recommend.`,
    `The ${query} battery life is terrible. Very frustrating.`,
    `Overhyped. The ${query} doesn't live up to expectations.`,
    `${query} broke after just a few weeks. Poor quality.`
  ];

  const neutralTemplates = [
    `The ${query} is okay. Nothing special but does the job.`,
    `${query} has some good features but also some drawbacks.`,
    `Not sure about ${query} yet. Need more time to decide.`,
    `${query} is decent for the price. Could be better.`,
    `The ${query} works fine. Average experience overall.`
  ];

  const posts = [];
  
  for (let i = 0; i < count; i++) {
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    let title;
    
    if (sentiment === 'positive') {
      title = positiveTemplates[Math.floor(Math.random() * positiveTemplates.length)];
    } else if (sentiment === 'negative') {
      title = negativeTemplates[Math.floor(Math.random() * negativeTemplates.length)];
    } else {
      title = neutralTemplates[Math.floor(Math.random() * neutralTemplates.length)];
    }

    posts.push({
      text: title,
      title: title,
      body: '',
      score: Math.floor(Math.random() * 1000),
      num_comments: Math.floor(Math.random() * 200),
      created_at: generateRandomDate(),
      subreddit: subreddits[Math.floor(Math.random() * subreddits.length)],
      id: `mock_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  return posts;
};

export const searchPosts = async (query, limit = 100) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const posts = generateMockPosts(query, Math.min(limit, 100));
    return posts;
  } catch (error) {
    throw new Error(`Reddit API Error: ${error.message}`);
  }
};

export const getSubredditPosts = async (subreddit, limit = 100) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const posts = generateMockPosts(subreddit, Math.min(limit, 100));
    return posts;
  } catch (error) {
    throw new Error(`Reddit API Error: ${error.message}`);
  }
};

export const getPostComments = async (postId, limit = 100) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const comments = [];
    const commentCount = Math.min(limit, 50);
    
    for (let i = 0; i < commentCount; i++) {
      comments.push({
        text: `This is a mock comment #${i + 1}. Great discussion!`,
        score: Math.floor(Math.random() * 100),
        created_at: generateRandomDate(),
        id: `comment_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    return comments;
  } catch (error) {
    throw new Error(`Reddit API Error: ${error.message}`);
  }
};

export const searchInSubreddit = async (subreddit, query, limit = 100) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const posts = generateMockPosts(query, Math.min(limit, 100));
    return posts;
  } catch (error) {
    throw new Error(`Reddit API Error: ${error.message}`);
  }
};

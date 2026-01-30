"""VADER sentiment analysis helper for server-side scoring."""

import sys
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

def analyze_sentiment(text):
    """
    Analyze sentiment of given text using VADER
    Returns compound score and sentiment label
    """
    analyzer = SentimentIntensityAnalyzer()
    
    # Get sentiment scores
    scores = analyzer.polarity_scores(text)
    
    # Determine sentiment label based on compound score
    compound = scores['compound']
    
    if compound >= 0.05:
        sentiment = 'positive'
    elif compound <= -0.05:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    
    return {
        'sentiment': sentiment,
        'scores': {
            'positive': scores['pos'],
            'negative': scores['neg'],
            'neutral': scores['neu'],
            'compound': scores['compound']
        },
        'confidence': abs(compound)
    }

def analyze_bulk(texts):
    """
    Analyze multiple texts and return aggregated results
    """
    results = []
    total_scores = {'positive': 0, 'negative': 0, 'neutral': 0, 'compound': 0}
    sentiment_counts = {'positive': 0, 'negative': 0, 'neutral': 0}
    
    for text in texts:
        result = analyze_sentiment(text)
        results.append(result)
        
        # Aggregate scores
        total_scores['positive'] += result['scores']['positive']
        total_scores['negative'] += result['scores']['negative']
        total_scores['neutral'] += result['scores']['neutral']
        total_scores['compound'] += result['scores']['compound']
        
        # Count sentiments
        sentiment_counts[result['sentiment']] += 1
    
    count = len(texts)
    
    # Calculate averages
    avg_scores = {
        'positive': round(total_scores['positive'] / count, 3),
        'negative': round(total_scores['negative'] / count, 3),
        'neutral': round(total_scores['neutral'] / count, 3),
        'compound': round(total_scores['compound'] / count, 3)
    }
    
    # Determine overall sentiment
    avg_compound = avg_scores['compound']
    if avg_compound >= 0.05:
        overall_sentiment = 'positive'
    elif avg_compound <= -0.05:
        overall_sentiment = 'negative'
    else:
        overall_sentiment = 'neutral'
    
    return {
        'overall_sentiment': overall_sentiment,
        'average_scores': avg_scores,
        'sentiment_distribution': sentiment_counts,
        'total_analyzed': count,
        'individual_results': results
    }

if __name__ == '__main__':
    # Read input from command line argument
    input_data = json.loads(sys.argv[1])
    
    if 'texts' in input_data:
        # Bulk analysis
        result = analyze_bulk(input_data['texts'])
    else:
        # Single text analysis
        result = analyze_sentiment(input_data['text'])
    
    # Output result as JSON
    print(json.dumps(result))

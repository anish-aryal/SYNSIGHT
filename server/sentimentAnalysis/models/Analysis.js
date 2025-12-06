import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    query: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      enum: ['text', 'twitter', 'reddit', 'multi-platform'],
      required: true
    },
    
    // Overall sentiment data
    sentiment: {
      overall: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
        required: true
      },
      percentages: {
        positive: Number,
        negative: Number,
        neutral: Number
      },
      scores: {
        positive: Number,
        negative: Number,
        neutral: Number,
        compound: Number
      },
      distribution: {
        positive: Number,
        negative: Number,
        neutral: Number
      }
    },
    
    // Key insights
    insights: {
      overall: String,
      peakEngagement: String,
      topDrivers: [String],
      platformComparison: String
    },
    
    // Platform breakdown
    platformBreakdown: [{
      platform: String,
      totalPosts: Number,
      sentimentDistribution: {
        positive: Number,
        negative: Number,
        neutral: Number
      }
    }],
    
    // Post volume by time
    timeAnalysis: [{
      hour: Number,
      volume: Number
    }],
    
    // Top keywords with sentiment
    topKeywords: [{
      keyword: String,
      count: Number,
      sentiment: String
    }],
    
    // Sample posts
    samplePosts: [{
      text: String,
      platform: String,
      sentiment: String,
      confidence: Number,
      created_at: Date,
      metrics: mongoose.Schema.Types.Mixed
    }],
    
    totalAnalyzed: {
      type: Number,
      required: true
    },
    
    dateRange: {
      start: Date,
      end: Date
    },
    
    metadata: {
      timestamp: {
        type: Date,
        default: Date.now
      },
      processingTime: Number,
      platforms: [String]
    }
  },
  {
    timestamps: true
  }
);

analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ query: 1 });
analysisSchema.index({ source: 1 });

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
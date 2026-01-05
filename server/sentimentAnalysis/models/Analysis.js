import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    query: { type: String, required: true, trim: true },
    source: {
      type: String,
      enum: ['text', 'twitter', 'reddit', 'bluesky', 'multi-platform'],
      required: true
    },

    sentiment: {
      overall: { type: String, enum: ['positive', 'negative', 'neutral'], required: true },
      percentages: { positive: Number, negative: Number, neutral: Number },
      scores: { positive: Number, negative: Number, neutral: Number, compound: Number },
      distribution: { positive: Number, negative: Number, neutral: Number }
    },

    insights: {
      overall: String,
      peakEngagement: String,
      topDrivers: [String],
      platformComparison: String
    },

    platformBreakdown: [{
      platform: String,
      totalPosts: Number,
      sentimentDistribution: { positive: Number, negative: Number, neutral: Number }
    }],

    timeAnalysis: [{ hour: Number, volume: Number }],

    topKeywords: [{ keyword: String, count: Number, sentiment: String }],

    samplePosts: [{
      text: String,
      platform: String,
      sentiment: String,
      confidence: Number,
      created_at: Date,
      metrics: mongoose.Schema.Types.Mixed
    }],

    totalAnalyzed: { type: Number, required: true },

    dateRange: { start: Date, end: Date },

    metadata: {
      timestamp: { type: Date, default: Date.now },
      processingTime: Number,
      platforms: [String],

      // ✅ store options used
      timeframe: { type: String },
      language: { type: String }
    }
  },
  { timestamps: true }
);

analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ query: 1 });
analysisSchema.index({ source: 1 });

export default mongoose.model('Analysis', analysisSchema);

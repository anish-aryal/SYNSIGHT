import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

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


    topKeywords: [{ keyword: String, count: Number, sentiment: String }],

    sentimentOverTime: [{
      date: String,
      positive: Number,
      neutral: Number,
      negative: Number,
      total: Number
    }],

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
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false
    },
    comments: { type: [commentSchema], default: [] }
  },
  { timestamps: true }
);

analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ query: 1 });
analysisSchema.index({ source: 1 });
analysisSchema.index({ user: 1, project: 1 });

export default mongoose.model('Analysis', analysisSchema);

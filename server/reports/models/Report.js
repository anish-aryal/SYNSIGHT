import mongoose from 'mongoose';

// Report data model schema.

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis',
    required: false
  },
  query: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['bluesky', 'twitter', 'reddit', 'multi-platform'],
    default: 'multi-platform'
  },
  sentiment: {
    overall: String,
    positive: Number,
    negative: Number,
    neutral: Number
  },
  totalAnalyzed: {
    type: Number,
    default: 0
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false
  },
  usage: {
    prompt_tokens: Number,
    completion_tokens: Number,
    total_tokens: Number
  },
  status: {
    type: String,
    enum: ['generated', 'archived', 'deleted'],
    default: 'generated'
  },
  comments: { type: [commentSchema], default: [] }
}, {
  timestamps: true
});

// Index for faster queries
reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ user: 1, query: 1 });
reportSchema.index({ user: 1, analysis: 1 }, { unique: true, sparse: true });
reportSchema.index({ user: 1, project: 1 });


export default mongoose.model('Report', reportSchema);

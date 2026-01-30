import mongoose from 'mongoose';

// Project data model schema.

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    category: {
      type: String,
      enum: [
        'General',
        'Marketing',
        'Product',
        'Research',
        'Operations',
        'Customer Success',
        'Sales',
        'Support',
        'Finance',
        'HR',
        'Engineering',
        'Other'
      ],
      default: 'General',
      trim: true,
      maxlength: 80
    },
    isStarred: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'archived', 'deleted', 'draft', 'paused', 'completed'], default: 'active' },
    lastActivityAt: { type: Date, default: Date.now },
    comments: { type: [commentSchema], default: [] }
  },
  { timestamps: true }
);

projectSchema.index({ user: 1, createdAt: -1 });
projectSchema.index({ user: 1, name: 1 });

export default mongoose.model('Project', projectSchema);

import mongoose from 'mongoose';

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
        'Sales',
        'Support',
        'Finance',
        'HR',
        'Engineering'
      ],
      default: 'General',
      trim: true,
      maxlength: 80
    },
    isStarred: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'archived', 'deleted'], default: 'active' },
    lastActivityAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

projectSchema.index({ user: 1, createdAt: -1 });
projectSchema.index({ user: 1, name: 1 });

export default mongoose.model('Project', projectSchema);

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  query: {
    type: String
  },
  analysisId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analysis'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Chat',
    trim: true
  },
  messages: [messageSchema],
  platform: {
    type: String,
    enum: ['all', 'twitter', 'reddit', 'bluesky'],
    default: 'all'
  },
  options: {
    timeframe: { type: String, default: 'last7days' },
    analysisDepth: { type: String, default: 'standard' },
    language: { type: String, default: 'en' }
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Auto-generate title from first user message
// Use function() not arrow function, and use next parameter correctly
// Async version - no next() needed
chatSchema.pre('save', async function() {
  if (this.isModified('messages') && this.messages.length > 0 && this.title === 'New Chat') {
    const firstUserMessage = this.messages.find(m => m.type === 'user');
    if (firstUserMessage && typeof firstUserMessage.content === 'string') {
      this.title = firstUserMessage.content.substring(0, 50) + 
        (firstUserMessage.content.length > 50 ? '...' : '');
    }
  }
  // No next() needed with async function
});
// Index for faster queries
chatSchema.index({ user: 1, updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
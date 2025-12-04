import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  device: {
    type: String
  },
  browser: {
    type: String
  },
  os: {
    type: String
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - MongoDB will auto-delete expired sessions
  }
}, {
  timestamps: true
});

// Update lastActive on each request
sessionSchema.methods.updateActivity = function() {
  this.lastActive = Date.now();
  return this.save();
};

const Session = mongoose.model('Session', sessionSchema);

export default Session;
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  company: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    default: '',
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: false
    },
    mentionAlerts: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'np']
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  subscription: {
    plan: {
      type: String,
      default: 'free',
      enum: ['free', 'pro', 'enterprise']
    },
    queriesUsed: {
      type: Number,
      default: 0
    },
    queriesLimit: {
      type: Number,
      default: 100
    },
    validUntil: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    company: this.company,
    role: this.role,
    avatar: this.avatar,
    preferences: this.preferences,
    subscription: this.subscription,
    createdAt: this.createdAt
  };
};

export default mongoose.model('User', userSchema);
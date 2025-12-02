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
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Only set expiry for unverified users
      if (!this.isVerified) {
        return new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      return undefined;
    }
  },
  otp: {
    code: String,
    expiresAt: Date
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
    // Notification Preferences
    emailNotifications: {
      type: Boolean,
      default: true
    },
    sentimentAlerts: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: false
    },
    productUpdates: {
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
    
    // Application Preferences
    defaultTimeRange: {
      type: String,
      default: 'last7days',
      enum: ['last7days', 'last30days', 'last90days', 'lastyear', 'alltime']
    },
    defaultPlatform: {
      type: String,
      default: 'all',
      enum: ['all', 'twitter', 'facebook', 'instagram', 'linkedin', 'reddit']
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
    },
    
    // Security Preferences
    twoFactorEnabled: {
      type: Boolean,
      default: true
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

// TTL Index - ONLY delete unverified users after expiresAt
// The partialFilterExpression ensures verified users are NEVER deleted
userSchema.index({ expiresAt: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { isVerified: false }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = {
    code: otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  };
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(enteredOTP) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }
  if (new Date() > this.otp.expiresAt) {
    return false;
  }
  return this.otp.code === enteredOTP;
};

// Clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = {
    code: undefined,
    expiresAt: undefined
  };
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    isVerified: this.isVerified,
    company: this.company,
    role: this.role,
    avatar: this.avatar,
    preferences: this.preferences,
    subscription: this.subscription,
    createdAt: this.createdAt
  };
};

export default mongoose.model('User', userSchema);
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  portfolio: {
    type: String,
    default: ''
  },
  subjects: [{
    type: String,
    trim: true
  }],
  goals: [{
    type: String,
    trim: true
  }],
  schedule: {
    type: Map,
    of: [String],
    default: new Map()
  },
  // Gamification fields
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    type: String
  }],
  // Activity tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  // Profile completion
  profileCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate profile completion
userSchema.methods.calculateProfileCompletion = function() {
  let score = 0;
  if (this.name) score += 20;
  if (this.subjects.length > 0) score += 30;
  if (this.goals.length > 0) score += 30;
  if (this.schedule && Object.keys(this.schedule).length > 0) score += 20;
  
  this.profileCompleted = score >= 80;
  return score;
};

// Update user level based on points
userSchema.methods.updateLevel = function() {
  const newLevel = Math.floor(this.points / 1000) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    // Award level up badge
    const levelBadge = `Level ${newLevel}`;
    if (!this.badges.includes(levelBadge)) {
      this.badges.push(levelBadge);
    }
    return true; // Level increased
  }
  return false;
};

// Add points and check for level up
userSchema.methods.addPoints = function(points) {
  this.points += points;
  const leveledUp = this.updateLevel();
  return leveledUp;
};

// Check for new badges
userSchema.methods.checkForBadges = function() {
  const newBadges = [];
  
  // First study session
  if (this.points >= 100 && !this.badges.includes('First Steps')) {
    this.badges.push('First Steps');
    newBadges.push('First Steps');
  }
  
  // Study streak badges
  if (this.points >= 500 && !this.badges.includes('Study Enthusiast')) {
    this.badges.push('Study Enthusiast');
    newBadges.push('Study Enthusiast');
  }
  
  if (this.points >= 2000 && !this.badges.includes('Study Master')) {
    this.badges.push('Study Master');
    newBadges.push('Study Master');
  }
  
  // Subject mastery (simplified - based on having many subjects)
  if (this.subjects.length >= 5 && !this.badges.includes('Multi-Subject Scholar')) {
    this.badges.push('Multi-Subject Scholar');
    newBadges.push('Multi-Subject Scholar');
  }
  
  return newBadges;
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Virtual for user's rank (to be populated by aggregation)
userSchema.virtual('rank');

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('User', userSchema);
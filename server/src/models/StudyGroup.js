import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    }
  }],
  maxMembers: {
    type: Number,
    default: 10,
    min: 2,
    max: 50
  },
  // Study schedule
  schedule: {
    type: Map,
    of: [String],
    default: new Map()
  },
  // Group settings
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // Associated chat
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
studyGroupSchema.index({ subject: 1 });
studyGroupSchema.index({ 'members.user': 1 });
studyGroupSchema.index({ lastActivity: -1 });
studyGroupSchema.index({ isPrivate: 1 });

// Virtual for member count
studyGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for available spots
studyGroupSchema.virtual('availableSpots').get(function() {
  return this.maxMembers - this.members.length;
});

// Check if user is a member
studyGroupSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Check if user is admin
studyGroupSchema.methods.isAdmin = function(userId) {
  return this.admin.toString() === userId.toString();
};

// Add member to group
studyGroupSchema.methods.addMember = function(userId, role = 'member') {
  if (this.isMember(userId)) {
    throw new Error('User is already a member of this group');
  }
  if (this.members.length >= this.maxMembers) {
    throw new Error('Group is full');
  }
  
  this.members.push({
    user: userId,
    role: role,
    joinedAt: new Date()
  });
  
  this.lastActivity = new Date();
  return this.save();
};

// Remove member from group
studyGroupSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.findIndex(member => 
    member.user.toString() === userId.toString()
  );
  
  if (memberIndex === -1) {
    throw new Error('User is not a member of this group');
  }
  
  if (this.admin.toString() === userId.toString()) {
    throw new Error('Cannot remove group admin');
  }
  
  this.members.splice(memberIndex, 1);
  this.lastActivity = new Date();
  return this.save();
};

// Update member role
studyGroupSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member of this group');
  }
  
  member.role = newRole;
  this.lastActivity = new Date();
  return this.save();
};

// Ensure virtual fields are serialized
studyGroupSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('StudyGroup', studyGroupSchema);
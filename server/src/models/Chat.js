import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  chatType: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  // For group chats
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Messages are stored separately for better performance
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Message model (separate for better scalability)
const Message = mongoose.model('Message', new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  chatType: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  // Read receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
}));

// Index for efficient querying
chatSchema.index({ participants: 1 });
chatSchema.index({ chatType: 1 });
chatSchema.index({ lastActivity: -1 });

// Ensure direct chats have exactly 2 participants
chatSchema.pre('save', function(next) {
  if (this.chatType === 'direct' && this.participants.length !== 2) {
    return next(new Error('Direct chats must have exactly 2 participants'));
  }
  if (this.chatType === 'group' && this.participants.length < 2) {
    return next(new Error('Group chats must have at least 2 participants'));
  }
  next();
});

// Update last activity when saving
chatSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

export { Chat, Message };
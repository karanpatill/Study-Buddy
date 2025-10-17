import express from 'express';
import { Chat, Message } from '../models/Chat.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadChatFile, getFileType } from '../utils/fileUpload.js';
import Notification from '../models/Notification.js';

const router = express.Router();

/**
 * @route GET /api/chats
 * @desc Get all chats for current user
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chats = await Chat.find({
      participants: userId
    })
    .populate('participants', 'name lastActive')
    .populate('lastMessage.sender', 'name')
    .sort({ lastActivity: -1 });
    
    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Error fetching chats' });
  }
});

/**
 * @route POST /api/chats/direct
 * @desc Create or get existing direct chat with another user
 */
router.post('/direct', requireAuth, async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user._id;
    
    if (!participantId) {
      return res.status(400).json({ message: 'Participant ID is required' });
    }
    
    if (participantId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }
    
    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    
    // Check if direct chat already exists
    let existingChat = await Chat.findOne({
      chatType: 'direct',
      participants: { 
        $all: [currentUserId, participantId],
        $size: 2
      }
    }).populate('participants', 'name lastActive');
    
    if (existingChat) {
      return res.json(existingChat);
    }
    
    // Create new direct chat
    const newChat = new Chat({
      participants: [currentUserId, participantId],
      chatType: 'direct'
    });
    
    await newChat.save();
    
    // Populate participants before sending response
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name lastActive');
    
    res.status(201).json(populatedChat);
    
  } catch (error) {
    console.error('Create direct chat error:', error);
    res.status(500).json({ message: 'Error creating chat' });
  }
});

/**
 * @route POST /api/chats/group
 * @desc Create a new group chat
 */
router.post('/group', requireAuth, async (req, res) => {
  try {
    const { name, description, participantIds } = req.body;
    const currentUserId = req.user._id;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }
    
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 1) {
      return res.status(400).json({ message: 'At least one other participant is required' });
    }
    
    // Validate all participants exist
    const participants = await User.find({
      _id: { $in: participantIds }
    });
    
    if (participants.length !== participantIds.length) {
      return res.status(400).json({ message: 'One or more participants not found' });
    }
    
    // Create group chat with current user as admin
    const allParticipants = [currentUserId, ...participantIds.filter(id => id !== currentUserId.toString())];
    
    const newChat = new Chat({
      participants: allParticipants,
      chatType: 'group',
      name: name.trim(),
      description: description?.trim() || '',
      admin: currentUserId
    });
    
    await newChat.save();
    
    // Populate participants before sending response
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name lastActive')
      .populate('admin', 'name');
    
    res.status(201).json(populatedChat);
    
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({ message: 'Error creating group chat' });
  }
});

/**
 * @route GET /api/chats/:chatId/messages
 * @desc Get messages for a specific chat
 */
router.get('/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;
    
    // Verify user is participant in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }
    
    // Get messages with pagination
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Reverse to show oldest first
    messages.reverse();
    
    res.json(messages);
    
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

/**
 * @route POST /api/chats/:chatId/messages
 * @desc Send a message to a chat
 */
router.post('/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Verify user is participant in chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }
    
    // Create message
    const message = new Message({
      chat: chatId,
      sender: userId,
      content: content.trim(),
      chatType: chat.chatType
    });
    
    await message.save();
    
    // Update chat's last message and activity
    chat.lastMessage = {
      content: content.trim(),
      sender: userId,
      timestamp: new Date()
    };
    chat.lastActivity = new Date();
    await chat.save();
    
    // Populate sender info
    await message.populate('sender', 'name');
    
    res.status(201).json(message);
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

/**
 * @route PUT /api/chats/:chatId
 * @desc Update chat details (name, description for group chats)
 */
router.put('/:chatId', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;
    
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }
    
    // Only group chat admins can update chat details
    if (chat.chatType === 'group' && chat.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only group admin can update chat details' });
    }
    
    if (chat.chatType === 'direct') {
      return res.status(400).json({ message: 'Cannot update direct chat details' });
    }
    
    // Update chat details
    if (name && name.trim()) {
      chat.name = name.trim();
    }
    
    if (description !== undefined) {
      chat.description = description.trim();
    }
    
    await chat.save();
    
    const updatedChat = await Chat.findById(chatId)
      .populate('participants', 'name lastActive')
      .populate('admin', 'name');
    
    res.json(updatedChat);
    
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({ message: 'Error updating chat' });
  }
});

/**
 * @route DELETE /api/chats/:chatId
 * @desc Delete a chat (admin only for groups, any participant for direct)
 */
router.delete('/:chatId', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;
    
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or access denied' });
    }
    
    // Check permissions
    if (chat.chatType === 'group' && chat.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only group admin can delete group chats' });
    }
    
    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });
    
    // Delete the chat
    await Chat.findByIdAndDelete(chatId);
    
    res.json({ message: 'Chat deleted successfully' });
    
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Error deleting chat' });
  }
});

export default router;
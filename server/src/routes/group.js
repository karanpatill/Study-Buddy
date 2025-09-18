import express from 'express';
import StudyGroup from '../models/StudyGroup.js';
import { Chat } from '../models/Chat.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/groups
 * @desc Get all public study groups or user's groups
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { type = 'public', page = 1, limit = 20, subject } = req.query;
    const userId = req.user._id;
    
    let query = {};
    
    if (type === 'my') {
      // Get groups where user is a member
      query['members.user'] = userId;
    } else {
      // Get public groups
      query.isPrivate = false;
    }
    
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }
    
    const groups = await StudyGroup.find(query)
      .populate('admin', 'name')
      .populate('members.user', 'name')
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Transform to include computed fields
    const transformedGroups = groups.map(group => ({
      ...group.toJSON(),
      memberCount: group.members.length,
      availableSpots: group.maxMembers - group.members.length,
      isUserMember: group.isMember(userId),
      isUserAdmin: group.isAdmin(userId)
    }));
    
    res.json(transformedGroups);
    
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Error fetching study groups' });
  }
});

/**
 * @route POST /api/groups
 * @desc Create a new study group
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      subject,
      maxMembers,
      schedule,
      isPrivate,
      tags
    } = req.body;
    const userId = req.user._id;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }
    
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Group description is required' });
    }
    
    if (!subject || !subject.trim()) {
      return res.status(400).json({ message: 'Subject is required' });
    }
    
    // Create study group
    const newGroup = new StudyGroup({
      name: name.trim(),
      description: description.trim(),
      subject: subject.trim(),
      admin: userId,
      members: [{
        user: userId,
        role: 'admin',
        joinedAt: new Date()
      }],
      maxMembers: maxMembers || 10,
      schedule: schedule ? new Map(Object.entries(schedule)) : new Map(),
      isPrivate: isPrivate || false,
      tags: tags || []
    });
    
    await newGroup.save();
    
    // Create associated group chat
    const groupChat = new Chat({
      participants: [userId],
      chatType: 'group',
      name: `${name.trim()} Chat`,
      description: `Chat for ${name.trim()} study group`,
      admin: userId
    });
    
    await groupChat.save();
    
    // Link chat to study group
    newGroup.chat = groupChat._id;
    await newGroup.save();
    
    // Populate and return
    const populatedGroup = await StudyGroup.findById(newGroup._id)
      .populate('admin', 'name')
      .populate('members.user', 'name')
      .populate('chat');
    
    res.status(201).json({
      ...populatedGroup.toJSON(),
      memberCount: populatedGroup.members.length,
      availableSpots: populatedGroup.maxMembers - populatedGroup.members.length,
      isUserMember: true,
      isUserAdmin: true
    });
    
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Error creating study group' });
  }
});

/**
 * @route GET /api/groups/:groupId
 * @desc Get specific study group details
 */
router.get('/:groupId', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await StudyGroup.findById(groupId)
      .populate('admin', 'name email')
      .populate('members.user', 'name email lastActive')
      .populate('chat');
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if user can view this group
    if (group.isPrivate && !group.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied to private group' });
    }
    
    res.json({
      ...group.toJSON(),
      memberCount: group.members.length,
      availableSpots: group.maxMembers - group.members.length,
      isUserMember: group.isMember(userId),
      isUserAdmin: group.isAdmin(userId)
    });
    
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Error fetching study group' });
  }
});

/**
 * @route POST /api/groups/:groupId/join
 * @desc Join a study group
 */
router.post('/:groupId/join', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if group is full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Study group is full' });
    }
    
    // Check if user is already a member
    if (group.isMember(userId)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }
    
    // Add user to group
    await group.addMember(userId);
    
    // Add user to group chat
    if (group.chat) {
      const groupChat = await Chat.findById(group.chat);
      if (groupChat && !groupChat.participants.includes(userId)) {
        groupChat.participants.push(userId);
        await groupChat.save();
      }
    }
    
    // Award points for joining a group
    const user = await User.findById(userId);
    if (user) {
      const leveledUp = user.addPoints(25);
      if (!user.badges.includes('Team Player')) {
        user.badges.push('Team Player');
      }
      await user.save();
    }
    
    // Return updated group
    const updatedGroup = await StudyGroup.findById(groupId)
      .populate('admin', 'name')
      .populate('members.user', 'name')
      .populate('chat');
    
    res.json({
      ...updatedGroup.toJSON(),
      memberCount: updatedGroup.members.length,
      availableSpots: updatedGroup.maxMembers - updatedGroup.members.length,
      isUserMember: true,
      isUserAdmin: updatedGroup.isAdmin(userId)
    });
    
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Error joining study group' });
  }
});

/**
 * @route POST /api/groups/:groupId/leave
 * @desc Leave a study group
 */
router.post('/:groupId/leave', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Check if user is a member
    if (!group.isMember(userId)) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }
    
    // Admin cannot leave (must transfer ownership first)
    if (group.isAdmin(userId)) {
      return res.status(400).json({ 
        message: 'Group admin cannot leave. Transfer ownership first or delete the group.' 
      });
    }
    
    // Remove user from group
    await group.removeMember(userId);
    
    // Remove user from group chat
    if (group.chat) {
      const groupChat = await Chat.findById(group.chat);
      if (groupChat) {
        groupChat.participants = groupChat.participants.filter(
          participant => participant.toString() !== userId.toString()
        );
        await groupChat.save();
      }
    }
    
    res.json({ message: 'Successfully left the study group' });
    
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ message: 'Error leaving study group' });
  }
});

/**
 * @route PUT /api/groups/:groupId
 * @desc Update study group (admin only)
 */
router.put('/:groupId', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;
    
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Only admin can update
    if (!group.isAdmin(userId)) {
      return res.status(403).json({ message: 'Only group admin can update group details' });
    }
    
    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'subject', 'maxMembers', 'schedule', 'isPrivate', 'tags'];
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'schedule' && updateData[field]) {
          group[field] = new Map(Object.entries(updateData[field]));
        } else {
          group[field] = updateData[field];
        }
      }
    });
    
    await group.save();
    
    // Return updated group
    const updatedGroup = await StudyGroup.findById(groupId)
      .populate('admin', 'name')
      .populate('members.user', 'name')
      .populate('chat');
    
    res.json({
      ...updatedGroup.toJSON(),
      memberCount: updatedGroup.members.length,
      availableSpots: updatedGroup.maxMembers - updatedGroup.members.length,
      isUserMember: updatedGroup.isMember(userId),
      isUserAdmin: true
    });
    
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Error updating study group' });
  }
});

/**
 * @route DELETE /api/groups/:groupId
 * @desc Delete study group (admin only)
 */
router.delete('/:groupId', requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Study group not found' });
    }
    
    // Only admin can delete
    if (!group.isAdmin(userId)) {
      return res.status(403).json({ message: 'Only group admin can delete the group' });
    }
    
    // Delete associated chat if exists
    if (group.chat) {
      await Chat.findByIdAndDelete(group.chat);
    }
    
    // Delete the group
    await StudyGroup.findByIdAndDelete(groupId);
    
    res.json({ message: 'Study group deleted successfully' });
    
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: 'Error deleting study group' });
  }
});

export default router;
import express from 'express';
import User from '../models/User.js';
import { requireAuth, requireCompleteProfile } from '../middleware/auth.js';

const router = express.Router();

/**
 * Calculate compatibility score between two users
 */
const calculateMatchScore = (user1, user2) => {
  let score = 0;
  let maxScore = 0;
  
  // Subject compatibility (40% of score)
  const subjectWeight = 40;
  maxScore += subjectWeight;
  
  if (user1.subjects && user2.subjects) {
    const commonSubjects = user1.subjects.filter(subject => 
      user2.subjects.includes(subject)
    );
    const subjectScore = (commonSubjects.length / Math.max(user1.subjects.length, user2.subjects.length)) * subjectWeight;
    score += subjectScore;
  }
  
  // Goal compatibility (30% of score)
  const goalWeight = 30;
  maxScore += goalWeight;
  
  if (user1.goals && user2.goals) {
    const commonGoals = user1.goals.filter(goal => 
      user2.goals.includes(goal)
    );
    if (commonGoals.length > 0) {
      const goalScore = (commonGoals.length / Math.max(user1.goals.length, user2.goals.length)) * goalWeight;
      score += goalScore;
    }
  }
  
  // Schedule compatibility (30% of score)
  const scheduleWeight = 30;
  maxScore += scheduleWeight;
  
  if (user1.schedule && user2.schedule) {
    let commonTimeSlots = 0;
    let totalTimeSlots = 0;
    
    // Convert Maps to Objects for easier processing
    const schedule1 = user1.schedule instanceof Map ? Object.fromEntries(user1.schedule) : user1.schedule;
    const schedule2 = user2.schedule instanceof Map ? Object.fromEntries(user2.schedule) : user2.schedule;
    
    const allDays = new Set([...Object.keys(schedule1 || {}), ...Object.keys(schedule2 || {})]);
    
    allDays.forEach(day => {
      const slots1 = schedule1[day] || [];
      const slots2 = schedule2[day] || [];
      
      if (slots1.length > 0 && slots2.length > 0) {
        const commonSlots = slots1.filter(slot => slots2.includes(slot));
        commonTimeSlots += commonSlots.length;
        totalTimeSlots += Math.max(slots1.length, slots2.length);
      }
    });
    
    if (totalTimeSlots > 0) {
      const scheduleScore = (commonTimeSlots / totalTimeSlots) * scheduleWeight;
      score += scheduleScore;
    }
  }
  
  return Math.round((score / maxScore) * 100) || 0;
};

/**
 * @route GET /api/matching/matches
 * @desc Get study buddy matches for current user
 */
router.get('/matches', requireAuth, requireCompleteProfile, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const { page = 1, limit = 20 } = req.query;
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find potential matches (exclude current user)
    const potentialMatches = await User.find({
      _id: { $ne: currentUser._id },
      profileCompleted: true,
      subjects: { $exists: true, $not: { $size: 0 } },
      goals: { $exists: true, $not: { $size: 0 } }
    })
    .select('name subjects goals schedule points level badges lastActive')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Calculate match scores
    const matches = potentialMatches.map(user => {
      const matchScore = calculateMatchScore(currentUser, user);
      
      return {
        _id: user._id,
        name: user.name,
        subjects: user.subjects,
        goals: user.goals,
        points: user.points,
        level: user.level,
        badges: user.badges,
        matchScore,
        isOnline: user.lastActive && (new Date() - user.lastActive) < 15 * 60 * 1000, // 15 minutes
        lastActive: user.lastActive
      };
    })
    .filter(match => match.matchScore > 20) // Only show matches with > 20% compatibility
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score descending
    
    res.json(matches);
    
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Error fetching matches' });
  }
});

/**
 * @route GET /api/matching/suggestions
 * @desc Get personalized study suggestions based on user's profile
 */
router.get('/suggestions', requireAuth, requireCompleteProfile, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find users with complementary skills/subjects
    const suggestions = [];
    
    // Users studying similar subjects but at different levels
    const similarSubjectUsers = await User.find({
      _id: { $ne: currentUser._id },
      subjects: { $in: currentUser.subjects },
      level: { $ne: currentUser.level },
      profileCompleted: true
    })
    .select('name subjects level points badges')
    .limit(5);
    
    suggestions.push({
      category: 'Level Exchange',
      description: 'Connect with users at different levels for peer teaching',
      users: similarSubjectUsers.map(user => ({
        ...user.toJSON(),
        suggestionReason: user.level > currentUser.level ? 'Can mentor you' : 'You can mentor them'
      }))
    });
    
    // Users with different but complementary subjects
    const complementaryUsers = await User.find({
      _id: { $ne: currentUser._id },
      subjects: { $not: { $in: currentUser.subjects } },
      profileCompleted: true
    })
    .select('name subjects goals points badges')
    .limit(5);
    
    suggestions.push({
      category: 'Subject Diversity',
      description: 'Expand your learning with users from different fields',
      users: complementaryUsers.map(user => ({
        ...user.toJSON(),
        suggestionReason: 'Different subject expertise'
      }))
    });
    
    res.json(suggestions);
    
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Error fetching suggestions' });
  }
});

/**
 * @route POST /api/matching/connect
 * @desc Send a study buddy connection request
 */
router.post('/connect', requireAuth, async (req, res) => {
  try {
    const { targetUserId, message } = req.body;
    const currentUserId = req.user._id;
    
    if (!targetUserId) {
      return res.status(400).json({ message: 'Target user ID is required' });
    }
    
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot connect to yourself' });
    }
    
    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }
    
    // For now, we'll just create a direct chat between users
    // In a full implementation, this would create a connection request
    
    res.json({ 
      message: 'Connection request sent successfully',
      targetUser: {
        _id: targetUser._id,
        name: targetUser.name
      }
    });
    
  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({ message: 'Error sending connection request' });
  }
});

/**
 * @route GET /api/matching/stats
 * @desc Get matching statistics for the user
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Count potential matches
    const totalPotentialMatches = await User.countDocuments({
      _id: { $ne: currentUser._id },
      profileCompleted: true,
      subjects: { $in: currentUser.subjects }
    });
    
    // Count users by subject
    const subjectStats = await Promise.all(
      currentUser.subjects.map(async subject => {
        const count = await User.countDocuments({
          subjects: subject,
          _id: { $ne: currentUser._id }
        });
        return { subject, userCount: count };
      })
    );
    
    res.json({
      totalPotentialMatches,
      subjectStats,
      profileCompletionScore: currentUser.calculateProfileCompletion()
    });
    
  } catch (error) {
    console.error('Get matching stats error:', error);
    res.status(500).json({ message: 'Error fetching matching statistics' });
  }
});

export default router;
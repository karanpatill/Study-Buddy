import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadProfilePicture } from '../utils/fileUpload.js';
import Notification from '../models/Notification.js';

const router = express.Router();

/**
 * @route GET /api/profile
 * @desc Get current user's profile
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate profile completion score
    const completionScore = user.calculateProfileCompletion();
    
    res.json({
      ...user.toJSON(),
      profileCompletionScore: completionScore
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

/**
 * @route PUT /api/profile
 * @desc Update user's profile
 */
router.put('/', requireAuth, async (req, res) => {
  try {
    const { name, subjects, goals, schedule, bio, skills, portfolio } = req.body;
    const userId = req.user._id;
    
    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    if (subjects && !Array.isArray(subjects)) {
      return res.status(400).json({ message: 'Subjects must be an array' });
    }
    
    if (goals && !Array.isArray(goals)) {
      return res.status(400).json({ message: 'Goals must be an array' });
    }
    
    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    user.name = name.trim();
    
    if (subjects) {
      user.subjects = subjects.filter(subject => 
        typeof subject === 'string' && subject.trim().length > 0
      );
    }
    
    if (goals) {
      user.goals = goals.filter(goal => 
        typeof goal === 'string' && goal.trim().length > 0
      );
    }
    
    if (schedule && typeof schedule === 'object') {
      // Convert schedule object to Map
      user.schedule = new Map(Object.entries(schedule));
    }
    
    // Update new profile fields
    if (bio !== undefined) {
      user.bio = bio.trim();
    }
    
    if (skills && Array.isArray(skills)) {
      user.skills = skills.filter(skill => 
        typeof skill === 'string' && skill.trim().length > 0
      );
    }
    
    if (portfolio !== undefined) {
      user.portfolio = portfolio.trim();
    }
    
    // Calculate profile completion and check for new achievements
    const completionScore = user.calculateProfileCompletion();
    
    // Award points for profile completion milestones
    let pointsAwarded = 0;
    let newBadges = [];
    
    if (completionScore >= 50 && !user.badges.includes('Profile Builder')) {
      user.badges.push('Profile Builder');
      user.addPoints(50);
      pointsAwarded += 50;
      newBadges.push('Profile Builder');
    }
    
    if (completionScore >= 100 && !user.badges.includes('Profile Master')) {
      user.badges.push('Profile Master');
      user.addPoints(100);
      pointsAwarded += 100;
      newBadges.push('Profile Master');
    }
    
    // Check for other new badges
    const additionalBadges = user.checkForBadges();
    newBadges = [...newBadges, ...additionalBadges];
    
    await user.save();
    
    // Prepare response
    const response = {
      ...user.toJSON(),
      profileCompletionScore: completionScore
    };
    
    if (pointsAwarded > 0 || newBadges.length > 0) {
      response.achievements = {
        pointsAwarded,
        newBadges,
        leveledUp: user.updateLevel()
      };
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

/**
 * @route GET /api/profile/:userId
 * @desc Get another user's public profile
 */
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user and only return public information
    const user = await User.findById(userId)
      .select('name subjects goals points level badges joinedAt lastActive')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

/**
 * @route POST /api/profile/picture
 * @desc Upload profile picture
 */
router.post('/picture', requireAuth, (req, res) => {
  uploadProfilePicture(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Save file path (relative to uploads directory)
      user.profilePicture = `/uploads/profiles/${req.file.filename}`;
      await user.save();

      // Create notification for achievement
      await Notification.createNotification({
        recipient: user._id,
        type: 'badge_earned',
        title: 'Profile Updated!',
        message: 'You\'ve added a profile picture!',
        data: { badge: 'profile_picture' }
      });

      res.json({
        message: 'Profile picture uploaded successfully',
        profilePicture: user.profilePicture
      });
    } catch (error) {
      console.error('Profile picture upload error:', error);
      res.status(500).json({ message: 'Failed to upload profile picture' });
    }
  });
});

/**
 * @route POST /api/profile/avatar
 * @desc Update user's avatar (legacy endpoint)
 */
router.post('/avatar', requireAuth, (req, res) => {
  // Redirect to new picture endpoint
  res.redirect(307, '/api/profile/picture');
});

export default router;
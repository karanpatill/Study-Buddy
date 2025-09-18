import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/gamification/leaderboard
 * @desc Get leaderboard with top users and current user rank
 */
router.get('/leaderboard', requireAuth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const userId = req.user._id;
    
    // Get top users sorted by points
    const topUsers = await User.find()
      .select('name points level badges')
      .sort({ points: -1, level: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Add rank to each user
    const leaderboard = topUsers.map((user, index) => ({
      ...user,
      rank: index + 1
    }));
    
    // Find current user's rank
    let userRank = null;
    const userInTopList = leaderboard.find(user => user._id.toString() === userId.toString());
    
    if (userInTopList) {
      userRank = userInTopList;
    } else {
      // User not in top list, calculate their actual rank
      const usersAbove = await User.countDocuments({
        $or: [
          { points: { $gt: req.user.points } },
          { 
            points: req.user.points, 
            level: { $gt: req.user.level } 
          }
        ]
      });
      
      userRank = {
        _id: req.user._id,
        name: req.user.name,
        points: req.user.points,
        level: req.user.level,
        badges: req.user.badges,
        rank: usersAbove + 1
      };
    }
    
    res.json({
      leaderboard,
      userRank,
      totalUsers: await User.countDocuments()
    });
    
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Error fetching leaderboard' });
  }
});

/**
 * @route POST /api/gamification/award-points
 * @desc Award points to user for completing activities
 */
router.post('/award-points', requireAuth, async (req, res) => {
  try {
    const { activity, points: customPoints } = req.body;
    const userId = req.user._id;
    
    // Define point values for different activities
    const activityPoints = {
      'profile_completion': 50,
      'first_message': 25,
      'join_group': 25,
      'create_group': 100,
      'help_peer': 75,
      'study_session': 50,
      'daily_login': 10,
      'weekly_goal': 200
    };
    
    const pointsToAward = customPoints || activityPoints[activity] || 10;
    
    if (!pointsToAward || pointsToAward <= 0) {
      return res.status(400).json({ message: 'Invalid points value' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Award points and check for level up
    const leveledUp = user.addPoints(pointsToAward);
    
    // Check for new badges based on activity
    const newBadges = user.checkForBadges();
    
    // Add activity-specific badges
    if (activity === 'first_message' && !user.badges.includes('Communicator')) {
      user.badges.push('Communicator');
      newBadges.push('Communicator');
    }
    
    if (activity === 'create_group' && !user.badges.includes('Leader')) {
      user.badges.push('Leader');
      newBadges.push('Leader');
    }
    
    await user.save();
    
    res.json({
      pointsAwarded: pointsToAward,
      totalPoints: user.points,
      level: user.level,
      leveledUp,
      newBadges,
      activity
    });
    
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({ message: 'Error awarding points' });
  }
});

/**
 * @route GET /api/gamification/achievements
 * @desc Get available achievements and user progress
 */
router.get('/achievements', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Define all available achievements
    const achievements = [
      {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Earn your first 100 points',
        icon: 'star',
        requirement: 100,
        type: 'points',
        unlocked: user.badges.includes('First Steps')
      },
      {
        id: 'study_enthusiast',
        name: 'Study Enthusiast',
        description: 'Reach 500 points',
        icon: 'trophy',
        requirement: 500,
        type: 'points',
        unlocked: user.badges.includes('Study Enthusiast')
      },
      {
        id: 'study_master',
        name: 'Study Master',
        description: 'Reach 2000 points',
        icon: 'crown',
        requirement: 2000,
        type: 'points',
        unlocked: user.badges.includes('Study Master')
      },
      {
        id: 'multi_subject',
        name: 'Multi-Subject Scholar',
        description: 'Study 5 different subjects',
        icon: 'book',
        requirement: 5,
        type: 'subjects',
        unlocked: user.badges.includes('Multi-Subject Scholar')
      },
      {
        id: 'team_player',
        name: 'Team Player',
        description: 'Join a study group',
        icon: 'users',
        requirement: 1,
        type: 'groups',
        unlocked: user.badges.includes('Team Player')
      },
      {
        id: 'leader',
        name: 'Leader',
        description: 'Create a study group',
        icon: 'flag',
        requirement: 1,
        type: 'leadership',
        unlocked: user.badges.includes('Leader')
      },
      {
        id: 'communicator',
        name: 'Communicator',
        description: 'Send your first message',
        icon: 'message',
        requirement: 1,
        type: 'social',
        unlocked: user.badges.includes('Communicator')
      },
      {
        id: 'profile_builder',
        name: 'Profile Builder',
        description: 'Complete 50% of your profile',
        icon: 'user',
        requirement: 50,
        type: 'profile',
        unlocked: user.badges.includes('Profile Builder')
      },
      {
        id: 'profile_master',
        name: 'Profile Master',
        description: 'Complete your entire profile',
        icon: 'check',
        requirement: 100,
        type: 'profile',
        unlocked: user.badges.includes('Profile Master')
      }
    ];
    
    // Calculate progress for each achievement
    const achievementsWithProgress = achievements.map(achievement => {
      let progress = 0;
      
      switch (achievement.type) {
        case 'points':
          progress = Math.min(user.points, achievement.requirement);
          break;
        case 'subjects':
          progress = user.subjects ? user.subjects.length : 0;
          break;
        case 'profile':
          progress = user.calculateProfileCompletion();
          break;
        case 'groups':
        case 'leadership':
        case 'social':
          progress = achievement.unlocked ? achievement.requirement : 0;
          break;
        default:
          progress = 0;
      }
      
      return {
        ...achievement,
        progress,
        progressPercent: Math.min((progress / achievement.requirement) * 100, 100)
      };
    });
    
    res.json({
      achievements: achievementsWithProgress,
      unlockedCount: user.badges.length,
      totalCount: achievements.length
    });
    
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Error fetching achievements' });
  }
});

/**
 * @route GET /api/gamification/stats
 * @desc Get user's gamification statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate rank
    const usersAbove = await User.countDocuments({
      $or: [
        { points: { $gt: user.points } },
        { 
          points: user.points, 
          level: { $gt: user.level } 
        }
      ]
    });
    const rank = usersAbove + 1;
    
    // Calculate next level progress
    const currentLevelPoints = (user.level - 1) * 1000;
    const nextLevelPoints = user.level * 1000;
    const levelProgress = user.points - currentLevelPoints;
    const levelProgressPercent = (levelProgress / (nextLevelPoints - currentLevelPoints)) * 100;
    
    // Get total users for context
    const totalUsers = await User.countDocuments();
    
    res.json({
      points: user.points,
      level: user.level,
      badges: user.badges,
      badgeCount: user.badges.length,
      rank,
      totalUsers,
      rankPercent: ((totalUsers - rank + 1) / totalUsers) * 100,
      levelProgress: {
        current: levelProgress,
        needed: nextLevelPoints - currentLevelPoints,
        percent: Math.min(levelProgressPercent, 100)
      },
      profileCompletion: user.calculateProfileCompletion()
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

/**
 * @route POST /api/gamification/daily-checkin
 * @desc Award points for daily check-in
 */
router.post('/daily-checkin', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = new Date(user.lastActive);
    lastActive.setHours(0, 0, 0, 0);
    
    if (lastActive.getTime() === today.getTime()) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    
    // Award daily check-in points
    const pointsAwarded = 10;
    const leveledUp = user.addPoints(pointsAwarded);
    
    // Check for streak badges (simplified implementation)
    if (!user.badges.includes('Daily Dedication')) {
      user.badges.push('Daily Dedication');
    }
    
    await user.save();
    
    res.json({
      pointsAwarded,
      totalPoints: user.points,
      level: user.level,
      leveledUp,
      message: 'Daily check-in complete!'
    });
    
  } catch (error) {
    console.error('Daily check-in error:', error);
    res.status(500).json({ message: 'Error processing daily check-in' });
  }
});

export default router;
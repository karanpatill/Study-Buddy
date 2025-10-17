import express from 'express';
import User from '../models/User.js';
import aiService from '../utils/aiService.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get AI-powered study partner recommendations
router.get('/partners', isAuthenticated, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Find potential matches based on shared subjects
    const potentialMatches = await User.find({
      _id: { $ne: currentUser._id },
      subjects: { $in: currentUser.subjects }
    })
      .select('name email subjects goals level points profilePicture')
      .limit(10);

    if (potentialMatches.length === 0) {
      return res.json({
        recommendations: [],
        message: 'No potential matches found. Try adding more subjects to your profile!'
      });
    }

    // Get AI-powered recommendations
    const aiRecommendations = await aiService.generatePartnerRecommendations(
      currentUser,
      potentialMatches
    );

    // Merge AI recommendations with user data
    const recommendations = aiRecommendations.map(rec => {
      const match = potentialMatches.find(m => m.name === rec.name);
      return {
        ...match?.toObject(),
        aiReason: rec.reason,
        compatibilityScore: aiService.calculateCompatibility(currentUser, match)
      };
    }).filter(r => r._id); // Filter out any that didn't match

    res.json({ recommendations });
  } catch (error) {
    console.error('AI partner recommendations error:', error);
    res.status(500).json({ message: 'Failed to generate recommendations' });
  }
});

// Get personalized study plan
router.get('/study-plan', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const studyPlan = await aiService.generateStudyPlan(user);

    res.json({ studyPlan });
  } catch (error) {
    console.error('AI study plan error:', error);
    res.status(500).json({ message: 'Failed to generate study plan' });
  }
});

// Get smart study suggestions
router.get('/suggestions', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Build recent activity summary
    const recentActivity = `Active for ${Math.floor(
      (Date.now() - user.lastActive) / (1000 * 60 * 60 * 24)
    )} days, Level ${user.level}, ${user.points} points`;

    const suggestions = await aiService.generateStudySuggestions(user, recentActivity);

    res.json({ suggestions });
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ message: 'Failed to generate suggestions' });
  }
});

export default router;

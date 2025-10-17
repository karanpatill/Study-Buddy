import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.EMERGENT_LLM_KEY,
  baseURL: 'https://integrations.emergentagent.com/v1'
});

class AIService {
  /**
   * Generate personalized study partner recommendations
   */
  async generatePartnerRecommendations(user, potentialMatches) {
    try {
      const userProfile = {
        subjects: user.subjects,
        goals: user.goals,
        level: user.level,
        points: user.points
      };

      const matchProfiles = potentialMatches.map(match => ({
        name: match.name,
        subjects: match.subjects,
        goals: match.goals,
        level: match.level,
        compatibilityScore: this.calculateCompatibility(user, match)
      }));

      const prompt = `You are an AI study buddy matching assistant. Based on the user's profile and potential matches, provide personalized recommendations.

User Profile:
- Subjects: ${userProfile.subjects.join(', ')}
- Goals: ${userProfile.goals.join(', ')}
- Level: ${userProfile.level}

Potential Matches:
${matchProfiles.map((m, i) => `${i + 1}. ${m.name} (Score: ${m.compatibilityScore}%)
   Subjects: ${m.subjects.join(', ')}
   Goals: ${m.goals.join(', ')}`).join('\n')}

Provide a brief, friendly recommendation (2-3 sentences) for the top 3 matches explaining why they would be good study partners. Format as JSON array: [{"name": "...", "reason": "..."}]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that provides personalized study partner recommendations. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const content = response.choices[0].message.content.trim();
      // Try to parse JSON response
      try {
        return JSON.parse(content);
      } catch {
        // If not valid JSON, return a fallback
        return matchProfiles.slice(0, 3).map(m => ({
          name: m.name,
          reason: `${m.name} shares ${m.subjects.filter(s => userProfile.subjects.includes(s)).length} subjects with you and has similar learning goals.`
        }));
      }
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      // Return fallback recommendations
      return potentialMatches.slice(0, 3).map(match => ({
        name: match.name,
        reason: `Strong match based on shared subjects and goals.`
      }));
    }
  }

  /**
   * Generate personalized study plan
   */
  async generateStudyPlan(user) {
    try {
      const prompt = `Create a personalized weekly study plan for a student with the following profile:

Subjects: ${user.subjects.join(', ')}
Goals: ${user.goals.join(', ')}
Current Level: ${user.level}

Provide a structured study plan with:
1. Daily study recommendations
2. Subject priorities
3. Time management tips
4. Motivation strategies

Keep it concise and actionable (max 300 words).`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert study coach. Provide practical, personalized study advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI Study Plan Error:', error);
      return 'Unable to generate study plan at this time. Focus on consistent daily study sessions for your priority subjects.';
    }
  }

  /**
   * Generate smart study suggestions based on activity
   */
  async generateStudySuggestions(user, recentActivity) {
    try {
      const prompt = `Based on this student's recent activity, provide 3 actionable study suggestions:

Profile:
- Subjects: ${user.subjects.join(', ')}
- Current Level: ${user.level}
- Recent Activity: ${recentActivity}

Format as JSON array: [{"title": "...", "description": "...", "priority": "high|medium|low"}]`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a study advisor. Provide specific, actionable suggestions. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      });

      const content = response.choices[0].message.content.trim();
      try {
        return JSON.parse(content);
      } catch {
        return [
          { title: 'Review Your Notes', description: 'Take time to consolidate what you\'ve learned', priority: 'medium' },
          { title: 'Practice Problems', description: 'Apply concepts through exercises', priority: 'high' },
          { title: 'Study Group Session', description: 'Collaborate with peers on challenging topics', priority: 'medium' }
        ];
      }
    } catch (error) {
      console.error('AI Suggestions Error:', error);
      return [];
    }
  }

  /**
   * Calculate compatibility between two users
   */
  calculateCompatibility(user1, user2) {
    let score = 0;

    // Shared subjects (40% weight)
    const sharedSubjects = user1.subjects.filter(s => 
      user2.subjects.includes(s)
    ).length;
    const subjectScore = (sharedSubjects / Math.max(user1.subjects.length, 1)) * 40;

    // Similar goals (30% weight)
    const sharedGoals = user1.goals.filter(g => 
      user2.goals.includes(g)
    ).length;
    const goalScore = (sharedGoals / Math.max(user1.goals.length, 1)) * 30;

    // Level proximity (30% weight)
    const levelDiff = Math.abs(user1.level - user2.level);
    const levelScore = Math.max(0, (5 - levelDiff) / 5) * 30;

    score = Math.round(subjectScore + goalScore + levelScore);
    return Math.min(100, Math.max(0, score));
  }
}

export default new AIService();

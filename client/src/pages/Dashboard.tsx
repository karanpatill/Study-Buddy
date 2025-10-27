import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  MessageCircle,
  Star,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StudyBuddy {
  _id: string;
  name: string;
  subjects: string[];
  goals: string[];
  matchScore: number;
  isOnline: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<StudyBuddy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const matchesRes = await axios.get('/api/matching/matches', { withCredentials: true });
      setMatches(matchesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (buddyId: string) => {
    try {
      const response = await axios.post(
        '/api/chats/direct',
        { participantId: buddyId },
        { withCredentials: true }
      );
      window.location.href = `/chat/${response.data._id}`;
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 md:px-8 py-10 relative overflow-hidden">
      {/* background glows */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-10 text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-yellow-400 mr-3 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name}</span>!
          </h1>
        </div>
        <p className="text-white/70 text-base md:text-lg">
          Ready to accelerate your learning journey today? ✨
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative z-10"
      >
        {[
          { label: 'Points Earned', icon: <Star className="h-7 w-7" />, value: user?.points || 0, color: 'from-yellow-500 to-amber-400' },
          { label: 'Level', icon: <Trophy className="h-7 w-7" />, value: user?.level || 1, color: 'from-purple-500 to-pink-500' },
          { label: 'Study Matches', icon: <Users className="h-7 w-7" />, value: matches.length, color: 'from-blue-500 to-cyan-500' },
          { label: 'Badges Earned', icon: <Award className="h-7 w-7" />, value: user?.badges?.length || 0, color: 'from-green-500 to-emerald-400' }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl p-6 text-center bg-white/10 backdrop-blur-lg border border-white/10 shadow-lg"
          >
            <div className={`mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>
              {stat.icon}
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-white/60 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* AI Study Matches */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-xl relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center justify-center md:justify-start">
            <Users className="h-6 w-6 text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold">AI Study Matches</h2>
          </div>
          <Link to="/profile" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition">
            Optimize Matching
          </Link>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Users className="h-10 w-10 text-white" />
            </div>
            <p className="text-white/70 mb-4 text-lg">No matches yet — complete your profile!</p>
            <Link to="/profile" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-semibold text-white hover:opacity-90 transition">
              <Target className="h-4 w-4 mr-2 inline" /> Complete Profile
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((buddy, index) => (
              <motion.div
                key={buddy._id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5 hover:bg-white/10 transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white text-lg">{buddy.name}</h3>
                      {buddy.isOnline && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                    </div>
                    <p className="text-sm text-white/60">
                      {buddy.subjects.slice(0, 2).join(', ')}
                      {buddy.subjects.length > 2 && ` +${buddy.subjects.length - 2} more`}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="w-32 bg-white/10 rounded-full h-1.5 mr-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full"
                          style={{ width: `${buddy.matchScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white/70">{buddy.matchScore}%</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleStartChat(buddy._id)}
                  className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-medium text-sm hover:opacity-90 transition"
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Chat
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 relative z-10"
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center md:justify-start">
          <Zap className="h-6 w-6 text-yellow-400 mr-3" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            {
              to: '/chat',
              icon: <MessageCircle className="h-10 w-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />,
              title: 'Start Chatting',
              desc: 'Connect with your study buddies instantly'
            },
            {
              to: '/profile',
              icon: <Target className="h-10 w-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />,
              title: 'Update Goals',
              desc: 'Refine your learning objectives'
            },
            {
              to: '/leaderboard',
              icon: <Trophy className="h-10 w-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />,
              title: 'View Leaderboard',
              desc: 'See how you rank among peers'
            }
          ].map((action, i) => (
            <Link
              key={i}
              to={action.to}
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/10 text-center hover:bg-white/20 transition-all duration-300 group"
            >
              <div className="flex flex-col items-center">
                {action.icon}
                <h3 className="font-semibold text-white mb-1 text-lg">{action.title}</h3>
                <p className="text-sm text-white/60">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

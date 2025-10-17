import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  MessageCircle, 
  Star, 
  Trophy, 
  BookOpen,
  Clock,
  Target,
  Plus,
  Zap,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';

interface StudyBuddy {
  _id: string;
  name: string;
  subjects: string[];
  goals: string[];
  matchScore: number;
  isOnline: boolean;
}

interface StudyGroup {
  _id: string;
  name: string;
  subject: string;
  memberCount: number;
  maxMembers: number;
  description: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<StudyBuddy[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [matchesRes, groupsRes] = await Promise.all([
        axios.get('/api/matching/matches', { withCredentials: true }),
        axios.get('/api/groups', { withCredentials: true })
      ]);
      setMatches(matchesRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (buddyId: string) => {
    try {
      const response = await axios.post('/api/chats/direct', 
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white/70">Loading your study universe<span className="loading-dots"></span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center mb-4">
          <Sparkles className="h-8 w-8 text-yellow-400 mr-3 animate-pulse" />
          <h1 className="text-4xl font-bold text-white">
            Welcome back, <span className="text-gradient">{user?.name}</span>! 
          </h1>
        </div>
        <p className="text-white/70 text-lg">Ready to accelerate your learning journey?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center animate-glow">
              <Star className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-white">{user?.points || 0}</p>
              <p className="text-sm text-white/60">Points Earned</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-400 mr-1" />
                <span className="text-xs text-green-400">+125 this week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center animate-pulse-glow">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-white">Level {user?.level || 1}</p>
              <p className="text-sm text-white/60">Current Level</p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((user?.points || 0) % 1000) / 10}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-white">{matches.length}</p>
              <p className="text-sm text-white/60">Study Matches</p>
              <div className="flex items-center mt-1">
                <Zap className="h-3 w-3 text-blue-400 mr-1" />
                <span className="text-xs text-blue-400">AI-powered</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center">
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-3xl font-bold text-white">{user?.badges?.length || 0}</p>
              <p className="text-sm text-white/60">Badges Earned</p>
              <div className="flex items-center mt-1">
                <Sparkles className="h-3 w-3 text-yellow-400 mr-1" />
                <span className="text-xs text-yellow-400">Keep going!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Study Matches */}
        <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">AI Study Matches</h2>
            </div>
            <Link 
              to="/profile" 
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Optimize Matching
            </Link>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Users className="h-8 w-8 text-white" />
              </div>
              <p className="text-white/70 mb-4">No study matches yet</p>
              <Link 
                to="/profile" 
                className="btn-primary"
              >
                <Target className="h-4 w-4 mr-2" />
                Complete Your Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((buddy, index) => (
                <div 
                  key={buddy._id} 
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-[1.02] animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-white">{buddy.name}</h3>
                          {buddy.isOnline && (
                            <div className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></div>
                          )}
                        </div>
                        <p className="text-sm text-white/60">
                          {buddy.subjects.slice(0, 2).join(', ')}
                          {buddy.subjects.length > 2 && ` +${buddy.subjects.length - 2} more`}
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-white/10 rounded-full h-1.5 mr-2">
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
                      className="btn-accent text-sm flex items-center"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Study Groups */}
        <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-purple-400 mr-3" />
              <h2 className="text-2xl font-bold text-white">Study Groups</h2>
            </div>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              Create Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <p className="text-white/70 mb-4">No study groups available</p>
              <button className="btn-secondary">
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group, index) => (
                <div 
                  key={group._id} 
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-[1.02] animate-slide-in-right"
                  style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-white">{group.name}</h3>
                        <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                          {group.subject}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 mb-3 line-clamp-2">{group.description}</p>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-white/50 mr-1" />
                        <span className="text-xs text-white/70">
                          {group.memberCount}/{group.maxMembers} members
                        </span>
                        <div className="ml-2 w-16 bg-white/10 rounded-full h-1">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
                            style={{ width: `${(group.memberCount / group.maxMembers) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <button className="btn-secondary text-sm ml-4">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Zap className="h-6 w-6 text-yellow-400 mr-3" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/chat" className="card-glass p-6 hover:bg-white/10 transition-all duration-300 group">
            <MessageCircle className="h-10 w-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2">Start Chatting</h3>
            <p className="text-sm text-white/60">Connect with your study buddies instantly</p>
          </Link>

          <Link to="/profile" className="card-glass p-6 hover:bg-white/10 transition-all duration-300 group">
            <Target className="h-10 w-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2">Update Goals</h3>
            <p className="text-sm text-white/60">Refine your learning objectives</p>
          </Link>

          <Link to="/leaderboard" className="card-glass p-6 hover:bg-white/10 transition-all duration-300 group">
            <Trophy className="h-10 w-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-white mb-2">View Leaderboard</h3>
            <p className="text-sm text-white/60">See how you rank among peers</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
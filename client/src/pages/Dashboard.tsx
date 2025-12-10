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
  TrendingUp,
  Award,
  ChevronRight,
  Settings
} from 'lucide-react';

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Here's your learning progress today
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Points',
              value: user?.points || 0,
              icon: Star,
              color: 'text-amber-600',
              bgColor: 'bg-amber-50',
              change: '+12%'
            },
            {
              label: 'Current Level',
              value: user?.level || 1,
              icon: Trophy,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50',
              change: 'Level up'
            },
            {
              label: 'Study Matches',
              value: matches.length,
              icon: Users,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50',
              change: `${matches.length} active`
            },
            {
              label: 'Badges Earned',
              value: user?.badges?.length || 0,
              icon: Award,
              color: 'text-green-600',
              bgColor: 'bg-green-50',
              change: 'View all'
            }
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Study Matches - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recommended Study Partners
                </h2>
                <Link
                  to="/profile"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Update preferences
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">No matches yet</p>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete your profile to find study partners
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Target className="h-4 w-4" />
                    Complete Profile
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((buddy) => (
                    <div
                      key={buddy._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
                            {getInitials(buddy.name)}
                          </div>
                          {buddy.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {buddy.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded">
                              {buddy.matchScore}% match
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {buddy.subjects.slice(0, 3).join(', ')}
                            {buddy.subjects.length > 3 && ` +${buddy.subjects.length - 3}`}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleStartChat(buddy._id)}
                        className="ml-4 flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                {[
                  {
                    to: '/chat',
                    icon: MessageCircle,
                    title: 'Messages',
                    desc: 'Chat with study partners',
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50'
                  },
                  {
                    to: '/profile',
                    icon: Target,
                    title: 'Update Goals',
                    desc: 'Manage learning objectives',
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50'
                  },
                  {
                    to: '/leaderboard',
                    icon: TrendingUp,
                    title: 'Leaderboard',
                    desc: 'Check your ranking',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50'
                  }
                ].map((action, i) => (
                  <Link
                    key={i}
                    to={action.to}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`p-2 rounded-lg ${action.bgColor}`}>
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {action.title}
                      </div>
                      <div className="text-xs text-gray-600">
                        {action.desc}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Activity Summary Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Earned 50 points
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      New study match found
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      5 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      Reached Level {user?.level || 1}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      1 day ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
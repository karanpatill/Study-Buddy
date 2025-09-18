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
  Plus
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
  members: number;
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
      // Navigate to chat with the returned chat ID
      window.location.href = `/chat/${response.data._id}`;
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">Ready to continue your learning journey?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{user?.points || 0}</p>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <Trophy className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">Level {user?.level || 1}</p>
              <p className="text-sm text-gray-600">Current Level</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
              <p className="text-sm text-gray-600">Study Matches</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{user?.badges?.length || 0}</p>
              <p className="text-sm text-gray-600">Badges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Study Matches */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Study Matches</h2>
            <Link 
              to="/profile" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Update Preferences
            </Link>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No study matches yet</p>
              <Link 
                to="/profile" 
                className="btn-primary"
              >
                Complete Your Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((buddy) => (
                <div key={buddy._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900">{buddy.name}</h3>
                          {buddy.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {buddy.subjects.slice(0, 2).join(', ')}
                          {buddy.subjects.length > 2 && ` +${buddy.subjects.length - 2} more`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {buddy.matchScore}% match
                        </p>
                        <p className="text-xs text-gray-500">compatibility</p>
                      </div>
                      <button
                        onClick={() => handleStartChat(buddy._id)}
                        className="btn-primary text-sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Study Groups */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Study Groups</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              <Plus className="h-4 w-4 inline mr-1" />
              Create Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No study groups available</p>
              <button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{group.subject}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{group.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {group.members}/{group.maxMembers}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">members</p>
                      <button className="btn-secondary text-sm">Join</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/chat" className="card p-6 hover:shadow-md transition-shadow">
            <MessageCircle className="h-8 w-8 text-primary-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Start Chatting</h3>
            <p className="text-sm text-gray-600">Connect with your study buddies</p>
          </Link>

          <Link to="/profile" className="card p-6 hover:shadow-md transition-shadow">
            <Target className="h-8 w-8 text-secondary-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Update Goals</h3>
            <p className="text-sm text-gray-600">Refine your learning objectives</p>
          </Link>

          <Link to="/leaderboard" className="card p-6 hover:shadow-md transition-shadow">
            <Trophy className="h-8 w-8 text-accent-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">View Leaderboard</h3>
            <p className="text-sm text-gray-600">See how you rank among peers</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
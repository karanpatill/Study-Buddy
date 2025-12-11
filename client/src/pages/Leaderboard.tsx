import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Trophy, Star, Award, TrendingUp, ChevronUp, Minus } from 'lucide-react';

interface LeaderboardUser {
  _id: string;
  name: string;
  points: number;
  level: number;
  badges: string[];
  rank: number;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/gamification/leaderboard', {
        withCredentials: true,
      });
      setLeaderboard(response.data.leaderboard);
      setUserRank(response.data.userRank);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
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

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-slate-900 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-lg mb-4">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Leaderboard</h1>
            <p className="text-gray-600">Track your progress and compete with fellow learners</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Your Rank Card */}
        {userRank && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${getRankBadgeColor(userRank.rank)}`}>
                  #{userRank.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">Your Ranking</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                      Level {userRank.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{userRank.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 mb-1">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-gray-900">{userRank.points.toLocaleString()}</span>
                  <span className="text-gray-600 text-sm">points</span>
                </div>
                <p className="text-sm text-gray-600">{userRank.badges.length} badges earned</p>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Performers */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((lbUser) => (
              <div
                key={lbUser._id}
                className={`bg-white rounded-lg border-2 p-6 ${
                  lbUser.rank === 1 
                    ? 'border-amber-200 bg-amber-50/30' 
                    : 'border-gray-200'
                }`}
              >
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 text-sm font-semibold border-2 ${getRankBadgeColor(lbUser.rank)}`}>
                    #{lbUser.rank}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{lbUser.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Level {lbUser.level}</p>
                  
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-gray-900">{lbUser.points.toLocaleString()}</span>
                      <span className="text-gray-600">points</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <Award className="h-4 w-4" />
                      <span>{lbUser.badges.length} badges</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Rankings Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Rankings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Badges
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.map((lbUser) => (
                  <tr
                    key={lbUser._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      lbUser._id === user?._id ? 'bg-slate-50' : ''
                    }`}
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold border ${getRankBadgeColor(lbUser.rank)}`}>
                          {lbUser.rank}
                        </span>
                        {lbUser.rank <= 3 && (
                          <Trophy className={`h-4 w-4 ${
                            lbUser.rank === 1 ? 'text-amber-500' :
                            lbUser.rank === 2 ? 'text-gray-400' :
                            'text-orange-500'
                          }`} />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center text-xs font-medium">
                          {getInitials(lbUser.name)}
                        </div>
                        <span className="font-medium text-gray-900">{lbUser.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                        Level {lbUser.level}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-gray-900">{lbUser.points.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Award className="h-4 w-4" />
                        <span>{lbUser.badges.length}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Star,
              title: 'Earn Points',
              description: 'Complete study sessions and help others to accumulate points',
              color: 'text-amber-600',
              bgColor: 'bg-amber-50'
            },
            {
              icon: Award,
              title: 'Unlock Badges',
              description: 'Achieve milestones to earn recognition badges',
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              icon: TrendingUp,
              title: 'Climb Ranks',
              description: 'Level up and rise through the leaderboard rankings',
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${item.bgColor} mb-4`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
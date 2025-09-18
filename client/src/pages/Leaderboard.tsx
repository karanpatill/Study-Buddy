import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Trophy, Star, Medal, Award, Crown } from 'lucide-react';

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
        withCredentials: true 
      });
      setLeaderboard(response.data.leaderboard);
      setUserRank(response.data.userRank);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <Trophy className="h-6 w-6 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gray-100';
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard 🏆</h1>
        <p className="text-gray-600">See how you rank among other study buddies</p>
      </div>

      {/* Your Rank Card */}
      {userRank && (
        <div className="card p-6 mb-8 bg-gradient-to-r from-primary-50 to-secondary-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Position</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                #{userRank.rank}
              </div>
              <div>
                <p className="font-medium text-gray-900">{userRank.name}</p>
                <p className="text-sm text-gray-600">Level {userRank.level}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-1">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-semibold text-gray-900">{userRank.points} points</span>
              </div>
              <p className="text-sm text-gray-600">{userRank.badges.length} badges</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaderboard.slice(0, 3).map((user, index) => (
            <div
              key={user._id}
              className={`card p-6 text-center transform transition-transform hover:scale-105 ${
                index === 0 ? 'md:order-2 ring-2 ring-yellow-400' : 
                index === 1 ? 'md:order-1' : 'md:order-3'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getRankColor(user.rank)}`}>
                {getRankIcon(user.rank)}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{user.name}</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-medium text-gray-900">{user.points} points</span>
                </div>
                <p className="text-sm text-gray-600">Level {user.level}</p>
                <p className="text-xs text-gray-500">{user.badges.length} badges</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Leaderboard */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Complete Rankings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Rank</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Name</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Level</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Points</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboard.map((leaderUser) => (
                <tr 
                  key={leaderUser._id}
                  className={`hover:bg-gray-50 transition-colors ${
                    leaderUser._id === user?._id ? 'bg-primary-50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900 mr-2">
                        #{leaderUser.rank}
                      </span>
                      {leaderUser.rank <= 3 && getRankIcon(leaderUser.rank)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        {leaderUser.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">
                        {leaderUser.name}
                        {leaderUser._id === user?._id && (
                          <span className="text-primary-600 text-sm ml-2">(You)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-800">
                      Level {leaderUser.level}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium text-gray-900">{leaderUser.points}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-accent-500 mr-1" />
                      <span className="text-gray-700">{leaderUser.badges.length}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievement Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Earn Points</h3>
          <p className="text-sm text-gray-600">Complete study sessions, help others, and achieve your goals</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-6 w-6 text-accent-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Unlock Badges</h3>
          <p className="text-sm text-gray-600">Achieve milestones and unlock special recognition badges</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Level Up</h3>
          <p className="text-sm text-gray-600">Gain levels and climb the leaderboard ranks</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
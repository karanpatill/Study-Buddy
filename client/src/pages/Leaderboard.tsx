import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Trophy, Star, Medal, Award, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-400" />;
      default:
        return <Trophy className="h-6 w-6 text-blue-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 py-10">
      {/* glowing background accents */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-6xl mx-auto space-y-12"
      >
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">Leaderboard 🏆</h1>
          <p className="text-white/60 text-lg">See how you rank among other study buddies</p>
        </div>

        {/* User Rank */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center"
          >
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-white mr-4">
                #{userRank.rank}
              </div>
              <div>
                <p className="font-semibold text-xl">{userRank.name}</p>
                <p className="text-white/60 text-sm">Level {userRank.level}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end mb-1">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-semibold">{userRank.points} pts</span>
              </div>
              <p className="text-white/60 text-sm">{userRank.badges.length} badges</p>
            </div>
          </motion.div>
        )}

        {/* Top Performers */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboard.slice(0, 3).map((lbUser, i) => (
              <motion.div
                key={lbUser._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center transform transition hover:scale-[1.03] ${
                  i === 0 ? 'md:order-2 ring-2 ring-yellow-400' : i === 1 ? 'md:order-1' : 'md:order-3'
                }`}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {getRankIcon(lbUser.rank)}
                </div>
                <h3 className="font-semibold text-lg mb-2">{lbUser.name}</h3>
                <div className="space-y-1 text-white/80">
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{lbUser.points} points</span>
                  </div>
                  <p className="text-sm">Level {lbUser.level}</p>
                  <p className="text-xs">{lbUser.badges.length} badges</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-semibold">Complete Rankings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-white/80">
              <thead className="bg-white/5">
                <tr>
                  <th className="py-3 px-6">Rank</th>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Level</th>
                  <th className="py-3 px-6">Points</th>
                  <th className="py-3 px-6">Badges</th>
                </tr>
              </thead>
             <tbody className="divide-y divide-white/10">
  {leaderboard.map((lbUser) => (
    <tr
      key={lbUser._id}
      className={`hover:bg-white/10 transition ${
        lbUser._id === user?._id ? 'bg-white/5' : ''
      }`}
    >
      {/* Rank */}
      <td className="py-3 px-6 font-semibold text-white whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <span>#{lbUser.rank}</span>
          {lbUser.rank <= 3 && getRankIcon(lbUser.rank)}
        </div>
      </td>

      {/* Name */}
      <td className="py-3 px-6 whitespace-nowrap">{lbUser.name}</td>

      {/* Level */}
      <td className="py-3 px-6 whitespace-nowrap">Level {lbUser.level}</td>

      {/* Points */}
      <td className="py-3 px-6 whitespace-nowrap">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-yellow-400" />
          <span>{lbUser.points}</span>
        </div>
      </td>

      {/* Badges */}
      <td className="py-3 px-6 whitespace-nowrap">
        <div className="flex items-center space-x-1">
          <Award className="h-4 w-4 text-blue-400" />
          <span>{lbUser.badges.length}</span>
        </div>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        </motion.div>

        {/* How to earn section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Star className="h-6 w-6 text-yellow-400" />,
              title: 'Earn Points',
              desc: 'Complete study sessions, help others, and achieve your goals.',
            },
            {
              icon: <Award className="h-6 w-6 text-blue-400" />,
              title: 'Unlock Badges',
              desc: 'Achieve milestones and unlock special recognition badges.',
            },
            {
              icon: <Trophy className="h-6 w-6 text-purple-400" />,
              title: 'Level Up',
              desc: 'Gain levels and climb the leaderboard ranks.',
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;

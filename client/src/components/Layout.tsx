import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  MessageCircle,
  User,
  Trophy,
  LogOut,
  BookOpen,
  Star,
  Zap,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white relative overflow-hidden">
      {/* Subtle background glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* Sidebar */}
      <div className="w-72 bg-white/10 backdrop-blur-xl border-r border-white/10 shadow-lg m-4 mr-0 rounded-2xl rounded-r-none flex flex-col">
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b border-white/10">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 animate-pulse">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Study Buddy</h1>
            <p className="text-xs text-white/70">AI-Powered Learning</p>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <div className="flex items-center mt-1 space-x-2">
                <div className="flex items-center">
                  <Star className="h-3 w-3 text-yellow-400 mr-1" />
                  <p className="text-xs text-white/70">{user?.points || 0} pts</p>
                </div>
                <div className="flex items-center">
                  <Zap className="h-3 w-3 text-purple-400 mr-1" />
                  <p className="text-xs text-white/70">Lv {user?.level || 1}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>Level {user?.level}</span>
              <span>Level {(user?.level || 1) + 1}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((user?.points || 0) % 1000) / 10}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 flex-1 overflow-y-auto">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium mb-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20 shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-300"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto bg-white/5 backdrop-blur-lg m-4 ml-0 rounded-2xl border border-white/10 shadow-xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

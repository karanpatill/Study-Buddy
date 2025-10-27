import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Eye, EyeOff, Zap, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login('demo@studybuddy.com', 'demo123');
    } catch {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden">
      {/* ✨ Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      </div>

      {/* 🌟 Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md md:max-w-lg lg:max-w-md p-8 md:p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 mb-4"
          >
            <BookOpen className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">Study Buddy</h1>
          <p className="text-white/70 text-sm md:text-base font-medium">
            {isLogin ? 'Welcome back to your study world ✨' : 'Create your learning journey 🚀'}
          </p>
        </div>

        {/* Demo Login */}
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl mb-8 font-semibold text-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center"
        >
          <Zap className="h-5 w-5 mr-2" />
          Try Demo Account
        </button>

        {/* Divider */}
        <div className="flex items-center mb-8">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="px-4 text-white/50 text-sm">or continue with email</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-white/80 text-sm mb-2 font-medium">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-white/80 text-sm mb-2 font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-white/80 text-sm mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 rounded-xl font-semibold text-lg text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                {isLogin ? 'Sign In' : 'Sign Up'}
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-8 text-white/70 text-sm">
          {isLogin ? "Don’t have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-400 hover:text-blue-300 font-semibold transition"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </motion.div>

    </div>
  );
};

export default Login;

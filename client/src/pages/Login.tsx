import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Study Buddy</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-gray-600">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Start your learning journey today'
              }
            </p>
          </div>

          {/* Demo Login Button */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 mb-6 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BookOpen className="h-4 w-4" />
            Try Demo Account
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-sm text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 mt-6 rounded-lg font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Between Login/Signup */}
          <p className="text-center mt-6 text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-slate-900 hover:text-slate-700 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Visual Pattern */}
      <div className="hidden lg:flex lg:flex-1 bg-slate-50 relative overflow-hidden">
        {/* Geometric pattern background */}
        <div className="absolute inset-0">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="16" cy="16" r="1" fill="#cbd5e1" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
          
          {/* Abstract shapes */}
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-slate-300 rounded-lg transform rotate-12"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-slate-200 rounded-full opacity-40"></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 border-2 border-slate-300 transform -rotate-6"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-slate-300 rounded-lg opacity-30 transform rotate-45"></div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex items-center justify-center p-12 w-full">
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <blockquote className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  "This platform will revolutionize the way students learn and collaborate. The intuitive design and engaging features make studying enjoyable and effective."
                </p>
                <footer className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    KP
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Karan Patil</div>
                    <div className="text-sm text-gray-600">Computer Science, DYP</div>
                  </div>
                </footer>
              </blockquote>
            </div>

        
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
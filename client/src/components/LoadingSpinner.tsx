import React from 'react';
import { BookOpen } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
      </div>

      <div className="text-center relative z-10">
        <div className="w-16 h-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full mx-auto mb-6 animate-spin"></div>

        <div className="flex items-center justify-center text-white/80 text-lg">
          <BookOpen className="h-6 w-6 mr-2 text-blue-400 animate-pulse" />
          <p>Loading <span className="text-gradient font-semibold">Study Buddy</span>...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

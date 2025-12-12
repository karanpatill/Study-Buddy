import React from 'react';
import { BookOpen } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-lg mb-4">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-900 mx-auto mb-3"></div>
        
        <p className="text-sm text-gray-600"></p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
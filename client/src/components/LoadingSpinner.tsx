import React from 'react';
import { BookOpen } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <div className="flex items-center justify-center text-gray-600">
          <BookOpen className="h-5 w-5 mr-2" />
          <p>Loading Study Buddy...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
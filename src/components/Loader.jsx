import React from 'react';
import { Globe } from 'lucide-react';

const Loader = ({ fullPage = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        {/* Pulsing outer ring */}
        <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse scale-150"></div>
        
        {/* Main spinning rings */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-t-purple-500 rounded-full animate-spin duration-700"></div>
          
          {/* Central Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe className="w-8 h-8 text-indigo-600 animate-bounce-subtle" />
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-black tracking-tighter text-indigo-900 uppercase">
          Incubator<span className="text-indigo-500">.</span>
        </h2>
        <p className="text-[10px] font-bold text-indigo-400 tracking-[0.3em] uppercase mt-1 animate-pulse">
          Initializing
        </p>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-20 flex items-center justify-center">
      {content}
    </div>
  );
};

export default Loader;

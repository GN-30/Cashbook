import React from 'react';

const CoinLoader = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full min-h-[200px] w-full gap-4">
      <div 
        className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 border-4 border-yellow-500 flex items-center justify-center shadow-[0_0_20px_rgba(250,204,21,0.5)]"
        style={{
          animation: 'coinFlip 1.5s infinite linear',
          transformStyle: 'preserve-3d'
        }}
      >
        <div 
          className="w-12 h-12 rounded-full border-2 border-yellow-200/50 flex items-center justify-center bg-yellow-400"
          style={{ transform: 'translateZ(1px)' }}
        >
          <span className="text-yellow-700 font-extrabold text-2xl drop-shadow-sm">
            ₹
          </span>
        </div>
      </div>
      <p className="text-brand-600 font-medium animate-pulse tracking-widest text-sm uppercase">Loading</p>
    </div>
  );
};

export default CoinLoader;

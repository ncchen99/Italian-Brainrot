import React from 'react';
import { Camera, Backpack, ClipboardList } from 'lucide-react';

export default function BottomNavigationBar({ activeTab = 'backpack', onTabChange, onScanClick }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div className="relative flex justify-between items-center bg-[#151A30]/85 backdrop-blur-md rounded-3xl p-2 shadow-2xl border border-white/10 pointer-events-auto">
        
        {/* Backpack Tab */}
        <button 
          onClick={() => onTabChange?.('backpack')}
          className={`flex-1 flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${activeTab === 'backpack' ? 'text-[#7C5CFC] bg-white/5' : 'text-gray-400 hover:text-[#FBBF24]'}`}
        >
          <Backpack size={24} />
          <span className="text-xs mt-1 font-bold">背包</span>
        </button>

        {/* Center Scan Button */}
        <div className="relative -top-6 flex-shrink-0 mx-2">
          <div className="absolute inset-0 bg-[#FBBF24] rounded-full blur-md opacity-55 animate-pulse"></div>
          <button 
            onClick={onScanClick}
            className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#7C5CFC] to-[#FBBF24] rounded-full shadow-[0_0_15px_rgba(124,92,252,0.5)] text-white transform transition-transform duration-200 hover:scale-105 active:scale-95 border-2 border-white/20 touch-manipulation"
          >
            <Camera size={28} />
          </button>
        </div>

        {/* Tasks Tab */}
        <button 
          onClick={() => onTabChange?.('tasks')}
          className={`flex-1 flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 ${activeTab === 'tasks' ? 'text-[#FBBF24] bg-white/5' : 'text-gray-400 hover:text-[#FBBF24]'}`}
        >
          <ClipboardList size={24} />
          <span className="text-xs mt-1 font-bold">任務</span>
        </button>
        
      </div>
    </div>
  );
}

import React from 'react';
import { Briefcase, Plus } from 'lucide-react';

interface HeaderProps {
  onAddSubject: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddSubject }) => {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
  const timeStr = today.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="pt-8 pb-4 px-1 bg-gray-50 sticky top-0 z-10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{dateStr}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Attendance</h1>
          <p className="text-gray-500 text-xs">
            Last Updated on {today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} at {timeStr}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
                {/* Black icons for light background */}
                <button className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-zinc-900 hover:bg-gray-50 transition">
                    <Briefcase size={20} />
                </button>
                <button 
                    onClick={onAddSubject}
                    className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-zinc-900 hover:bg-gray-50 transition"
                >
                    <Plus size={24} />
                </button>
            </div>
            <button className="text-zinc-900 text-sm font-medium pr-1 hover:text-zinc-700">History</button>
        </div>
      </div>
      
      {/* Gradient Line - Black/Gray shadow */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-300 to-transparent opacity-50 shadow-[0_0_10px_rgba(0,0,0,0.1)]"></div>
    </div>
  );
};

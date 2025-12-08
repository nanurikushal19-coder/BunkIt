import React from 'react';
import { GraduationCap, CalendarDays } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-6 pt-2 px-8 flex justify-between items-center z-50">
      {/* Active state: Black */}
      <button className="flex flex-col items-center gap-1 text-zinc-900">
        <GraduationCap size={24} fill="currentColor" className="opacity-20" />
        <span className="text-[10px] font-medium">Attendance</span>
      </button>
      
      <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-zinc-600 transition">
        <CalendarDays size={24} />
        <span className="text-[10px] font-medium">Timetable</span>
      </button>
    </div>
  );
};

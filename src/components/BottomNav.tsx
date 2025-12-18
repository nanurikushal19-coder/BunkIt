import React from 'react';
import { GraduationCap, CalendarDays } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'attendance' | 'timetable';
  onTabChange: (tab: 'attendance' | 'timetable') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  // Light theme colors for both tabs
  const bgColor = 'bg-white/90 border-gray-200';
  const inactiveColor = 'text-gray-400';
  const activeColor = 'text-zinc-900';

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${bgColor} backdrop-blur-lg border-t pb-6 pt-2 px-8 flex justify-between items-center z-50 transition-colors duration-300`}>
      <button 
        onClick={() => onTabChange('attendance')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'attendance' ? activeColor : inactiveColor}`}
      >
        <GraduationCap size={24} />
        <span className="text-[10px] font-medium">Attendance</span>
      </button>
      
      <button 
        onClick={() => onTabChange('timetable')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'timetable' ? activeColor : inactiveColor}`}
      >
        <CalendarDays size={24} />
        <span className="text-[10px] font-medium">Timetable</span>
      </button>
    </div>
  );
};

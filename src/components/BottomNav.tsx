import React from 'react';
import { GraduationCap, CalendarDays, Sparkles, Bell } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'attendance' | 'timetable' | 'notebook' | 'reminder';
  onTabChange: (tab: 'attendance' | 'timetable' | 'notebook' | 'reminder') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  // All themes are now light, so we use consistent colors
  const activeColor = 'text-zinc-900';
  const inactiveColor = 'text-gray-400';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-6 pt-2 px-6 flex justify-between items-center z-50">
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

      <button 
        onClick={() => onTabChange('notebook')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'notebook' ? activeColor : inactiveColor}`}
      >
        <Sparkles size={24} />
        <span className="text-[10px] font-medium">Notebook</span>
      </button>

      <button 
        onClick={() => onTabChange('reminder')}
        className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'reminder' ? activeColor : inactiveColor}`}
      >
        <Bell size={24} />
        <span className="text-[10px] font-medium">Reminders</span>
      </button>
    </div>
  );
};

import React from 'react';
import { GraduationCap, CalendarDays, Sparkles, Bell, Library } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  // All themes are now light, so we use consistent colors
  const activeColor = 'text-zinc-900';
  const inactiveColor = 'text-gray-400';

  const NavItem = ({ tab, icon: Icon, label }: { tab: TabType; icon: any; label: string }) => (
    <button 
      onClick={() => onTabChange(tab)}
      className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab ? activeColor : inactiveColor}`}
    >
      <Icon size={24} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 pb-6 pt-2 px-6 flex justify-between items-center z-50">
      <NavItem tab="attendance" icon={GraduationCap} label="Attendance" />
      <NavItem tab="timetable" icon={CalendarDays} label="Timetable" />
      <NavItem tab="material" icon={Library} label="Material" />
      <NavItem tab="notebook" icon={Sparkles} label="Notebook" />
      <NavItem tab="reminder" icon={Bell} label="Reminders" />
    </div>
  );
};

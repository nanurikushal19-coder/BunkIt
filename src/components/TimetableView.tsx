import React, { useState } from 'react';
import { Plus, HelpCircle, Clock, MoreVertical, ArrowUpDown, ChevronUp, ChevronDown, ListOrdered, ChevronLeft, ChevronRight } from 'lucide-react';
import { Lecture, DayOfWeek, Subject } from '../types';
import { AddLectureModal } from './AddLectureModal';

interface TimetableViewProps {
  lectures: Lecture[];
  subjects: Subject[];
  onAddLecture: (lecture: Lecture) => void;
  onDeleteLecture: (id: string) => void;
  onReorderLecture: (id: string, direction: 'up' | 'down') => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TimetableView: React.FC<TimetableViewProps> = ({ 
  lectures, 
  subjects, 
  onAddLecture, 
  onDeleteLecture,
  onReorderLecture 
}) => {
  const [currentDayIndex, setCurrentDayIndex] = useState(() => {
    const today = new Date().getDay(); // 0 is Sunday
    return today === 0 ? 6 : today - 1; // Convert to 0=Monday, 6=Sunday
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'name' | 'manual'>('time');

  const currentDay = DAYS[currentDayIndex];
  
  // Filter and sort lectures for the current day
  const todaysLectures = lectures
    .filter(l => l.day === currentDay)
    .sort((a, b) => {
      if (sortBy === 'time') {
        return a.startTime.localeCompare(b.startTime);
      } else if (sortBy === 'name') {
        return a.subjectName.localeCompare(b.subjectName);
      } else {
        // Manual sort
        return (a.order || 0) - (b.order || 0);
      }
    });

  const todayDate = new Date();
  const dateStr = todayDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();

  // Helper to format time to 12h format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const handleSortToggle = () => {
    if (sortBy === 'time') setSortBy('name');
    else if (sortBy === 'name') setSortBy('manual');
    else setSortBy('time');
  };

  const getSortIcon = () => {
    if (sortBy === 'time') return <ArrowUpDown size={20} />;
    if (sortBy === 'name') return <span className="font-bold text-xs">A-Z</span>;
    return <ListOrdered size={20} />;
  };

  const handlePrevDay = () => {
    setCurrentDayIndex(prev => (prev === 0 ? 6 : prev - 1));
  };

  const handleNextDay = () => {
    setCurrentDayIndex(prev => (prev === 6 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{dateStr}</p>
            <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleSortToggle}
              className={`w-10 h-10 rounded-2xl border shadow-sm flex items-center justify-center transition ${
                sortBy !== 'time' // Highlight if not default
                  ? 'bg-zinc-900 text-white border-zinc-900' 
                  : 'bg-white text-zinc-900 border-gray-200 hover:bg-gray-50'
              }`}
              title={`Sort by: ${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}`}
            >
              {getSortIcon()}
            </button>
            <button className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-zinc-900 hover:bg-gray-50 transition">
              <HelpCircle size={20} />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-zinc-900 hover:bg-gray-50 transition"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* Day Indicator with Navigation */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <button 
            onClick={handlePrevDay}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-zinc-900 transition shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="bg-white border border-gray-200 shadow-sm px-8 py-2 rounded-full min-w-[140px] text-center">
            <span className="text-zinc-900 font-bold tracking-widest text-sm uppercase">{currentDay}</span>
          </div>

          <button 
            onClick={handleNextDay}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-zinc-900 transition shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Timeline/Schedule */}
        <div className="space-y-4">
          {todaysLectures.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No classes scheduled for {currentDay}.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-zinc-900 font-medium hover:underline"
              >
                Add a class
              </button>
            </div>
          ) : (
            todaysLectures.map((lecture, index) => (
              <div key={lecture.id} className="relative pl-4 group">
                {/* Timeline Line */}
                <div 
                  className="absolute left-0 top-2 bottom-0 w-1 rounded-full" 
                  style={{ backgroundColor: lecture.color }}
                ></div>
                
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{lecture.subjectName}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Clock size={12} />
                        <span>{formatTime(lecture.startTime)} - {formatTime(lecture.endTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {sortBy === 'manual' && (
                        <div className="flex flex-col gap-1 mr-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onReorderLecture(lecture.id, 'up'); }}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onReorderLecture(lecture.id, 'down'); }}
                            disabled={index === todaysLectures.length - 1}
                            className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => {
                          if(confirm('Delete this lecture?')) onDeleteLecture(lecture.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Day Navigation Dots (Bottom) */}
        <div className="fixed bottom-24 left-0 right-0 flex justify-center gap-2 z-10">
          {DAYS.map((day, index) => (
            <button
              key={day}
              onClick={() => setCurrentDayIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentDayIndex ? 'bg-zinc-900 w-4' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      <AddLectureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={onAddLecture}
        subjects={subjects}
      />
    </div>
  );
};

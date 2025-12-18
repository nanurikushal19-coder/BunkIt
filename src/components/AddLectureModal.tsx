import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Subject, DayOfWeek, Lecture } from '../types';

interface AddLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (lecture: Lecture) => void;
  subjects: Subject[];
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];

export const AddLectureModal: React.FC<AddLectureModalProps> = ({ isOpen, onClose, onAdd, subjects }) => {
  const [subjectId, setSubjectId] = useState('');
  const [day, setDay] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      alert('Please select a subject');
      return;
    }
    
    const selectedSubject = subjects.find(s => s.id === subjectId);
    if (!selectedSubject) return;

    // Assign a random color since the option was removed
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const newLecture: Lecture = {
      id: Date.now().toString(),
      subjectId,
      subjectName: selectedSubject.name,
      day,
      startTime,
      endTime,
      color: randomColor
    };

    onAdd(newLecture);
    onClose();
    
    // Reset form
    setSubjectId('');
    setStartTime('09:00');
    setEndTime('10:00');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add a Lecture</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject Selection */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <label className="text-gray-600 text-sm font-medium">Select Subject</label>
            <select 
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="bg-transparent text-zinc-900 text-right font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" disabled>Select</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id} className="text-gray-900">
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Day Selection */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <label className="text-gray-600 text-sm font-medium">Day of the Week</label>
            <select 
              value={day}
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
              className="bg-transparent text-zinc-900 text-right font-semibold focus:outline-none cursor-pointer"
            >
              {DAYS.map(d => (
                <option key={d} value={d} className="text-gray-900">{d}</option>
              ))}
            </select>
          </div>

          {/* Time Selection */}
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <label className="text-gray-600 text-sm font-medium">Start Time</label>
            <input 
              type="time" 
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-gray-50 text-gray-900 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 border border-gray-200"
            />
          </div>

          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <label className="text-gray-600 text-sm font-medium">End Time</label>
            <input 
              type="time" 
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-gray-50 text-gray-900 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 border border-gray-200"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-xl mt-4 transition-colors active:scale-[0.98] shadow-lg shadow-zinc-900/10"
          >
            Add Class
          </button>
        </form>
      </div>
    </div>
  );
};

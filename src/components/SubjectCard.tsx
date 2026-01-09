import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Subject } from '../types';
import { calculateStatus } from '../utils/calculations';
import { CircularProgress } from './CircularProgress';
import { WARNING_IMAGE_DATA } from '../assets';

interface SubjectCardProps {
  subject: Subject;
  onUpdate: (id: string, field: 'attended' | 'missed', change: number) => void;
  onDelete: (id: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onUpdate, onDelete }) => {
  const { percentage, message, color } = calculateStatus(subject.attended, subject.missed, subject.requirement);
  const total = subject.attended + subject.missed;
  
  // Check if attendance is low (and at least one class has happened)
  const isLowAttendance = total > 0 && percentage < (subject.requirement * 100);

  return (
    // Dark theme card - Compact design
    <div className="bg-zinc-950 rounded-2xl p-2.5 mb-2 shadow-lg border border-zinc-900 transition-all duration-300">
      <div className="flex justify-between items-start mb-1">
        <div className="flex-1">
          {/* Reduced font size to text-base */}
          <h3 className="text-base font-semibold text-white mb-1">{subject.name}</h3>
          
          <div className="space-y-0.5 mb-1.5">
            <p className="text-zinc-400 text-[10px] flex items-center gap-2">
              <span className="text-white font-bold text-xs w-4">{subject.attended}</span> Attended
            </p>
            <p className="text-zinc-400 text-[10px] flex items-center gap-2">
              <span className="text-white font-bold text-xs w-4">{subject.missed}</span> Missed
            </p>
            <p className="text-zinc-400 text-[10px] flex items-center gap-2">
              <span className="text-white font-bold text-xs w-4">{total}</span> Total
            </p>
          </div>

          <div className="text-[10px]">
            <p className={`font-medium ${color}`}>{message}</p>
            
            {isLowAttendance && (
              <div className="mt-1.5 animate-in fade-in zoom-in duration-300">
                <img 
                  src={WARNING_IMAGE_DATA} 
                  alt="Low Attendance Warning" 
                  className="w-16 h-auto rounded-md border border-red-500/20 opacity-90 hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    // Fallback if the provided link is a viewer link or broken
                    e.currentTarget.src = 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/red/white?text=Warning';
                    e.currentTarget.onerror = null; // Prevent infinite loop
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pl-1 pt-0.5">
            {/* White Progress Ring - Reduced size to 60 */}
            <CircularProgress 
                percentage={percentage} 
                size={60} 
                strokeWidth={6} 
                fontSize="text-[10px]" 
                textColor="text-white"
                trackColor="#27272a"
                color="#ffffff" 
            />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-zinc-900">
        {/* Attended Controls */}
        <div className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-medium">Attended</span>
            <div className="flex gap-1.5">
                <button 
                    onClick={() => onUpdate(subject.id, 'attended', -1)}
                    className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 active:scale-95 transition"
                    disabled={subject.attended <= 0}
                >
                    <Minus size={10} />
                </button>
                <button 
                    onClick={() => onUpdate(subject.id, 'attended', 1)}
                    className="w-6 h-6 rounded-full bg-white text-black border border-white flex items-center justify-center hover:bg-zinc-200 active:scale-95 transition"
                >
                    <Plus size={10} />
                </button>
            </div>
        </div>

        {/* Delete Button */}
        <button 
            onClick={() => onDelete(subject.id)}
            className="text-zinc-600 px-3 py-0.5 rounded-md text-[9px] font-medium hover:text-red-400 hover:bg-red-500/10 transition active:scale-95 mt-2"
        >
            Delete
        </button>

        {/* Missed Controls */}
        <div className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-medium">Missed</span>
            <div className="flex gap-1.5">
                <button 
                    onClick={() => onUpdate(subject.id, 'missed', -1)}
                    className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 active:scale-95 transition"
                    disabled={subject.missed <= 0}
                >
                    <Minus size={10} />
                </button>
                <button 
                    onClick={() => onUpdate(subject.id, 'missed', 1)}
                    className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-700 active:scale-95 transition"
                >
                    <Plus size={10} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

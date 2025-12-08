import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Subject } from '../types';
import { calculateStatus } from '../utils/calculations';
import { CircularProgress } from './CircularProgress';

interface SubjectCardProps {
  subject: Subject;
  onUpdate: (id: string, field: 'attended' | 'missed', change: number) => void;
  onDelete: (id: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onUpdate, onDelete }) => {
  const { percentage, message, color } = calculateStatus(subject.attended, subject.missed, subject.requirement);
  const total = subject.attended + subject.missed;

  return (
    // Dark theme card
    <div className="bg-zinc-950 rounded-3xl p-4 mb-4 shadow-xl border border-zinc-900">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">{subject.name}</h3>
          
          <div className="space-y-0.5 mb-3">
            <p className="text-zinc-400 text-xs flex items-center gap-2">
              <span className="text-white font-bold text-base w-6">{subject.attended}</span> Attended
            </p>
            <p className="text-zinc-400 text-xs flex items-center gap-2">
              <span className="text-white font-bold text-base w-6">{subject.missed}</span> Missed
            </p>
            <p className="text-zinc-400 text-xs flex items-center gap-2">
              <span className="text-white font-bold text-base w-6">{total}</span> Total
            </p>
          </div>

          <div className="text-xs">
            <p className={`font-medium ${color}`}>{message}</p>
            <p className="text-zinc-500 text-[10px] mt-0.5">Requirement : {subject.requirement * 100}%</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pl-2 pt-1">
            {/* White Progress Ring */}
            <CircularProgress 
                percentage={percentage} 
                size={85} 
                strokeWidth={8} 
                fontSize="text-lg" 
                textColor="text-white"
                trackColor="#27272a"
                color="#ffffff" 
            />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-900">
        {/* Attended Controls */}
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Attended</span>
            <div className="flex gap-2">
                <button 
                    onClick={() => onUpdate(subject.id, 'attended', -1)}
                    className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 active:scale-95 transition"
                    disabled={subject.attended <= 0}
                >
                    <Minus size={14} />
                </button>
                <button 
                    onClick={() => onUpdate(subject.id, 'attended', 1)}
                    className="w-8 h-8 rounded-full bg-white text-black border border-white flex items-center justify-center hover:bg-zinc-200 active:scale-95 transition"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>

        {/* Delete Button */}
        <button 
            onClick={() => onDelete(subject.id)}
            className="text-zinc-600 px-5 py-1.5 rounded-lg text-xs font-medium hover:text-red-400 hover:bg-red-500/10 transition active:scale-95 mt-4"
        >
            Delete
        </button>

        {/* Missed Controls */}
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Missed</span>
            <div className="flex gap-2">
                <button 
                    onClick={() => onUpdate(subject.id, 'missed', -1)}
                    className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 active:scale-95 transition"
                    disabled={subject.missed <= 0}
                >
                    <Minus size={14} />
                </button>
                <button 
                    onClick={() => onUpdate(subject.id, 'missed', 1)}
                    className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-700 active:scale-95 transition"
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Header } from './Header';
import { SubjectCard } from './SubjectCard';
import { Subject } from '../types';

interface AttendanceViewProps {
  subjects: Subject[];
  onUpdate: (id: string, field: 'attended' | 'missed', change: number) => void;
  onDelete: (id: string) => void;
  onAddSubject: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({ 
  subjects, 
  onUpdate, 
  onDelete, 
  onAddSubject 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-primary-500/30 pb-24">
      <div className="max-w-md mx-auto px-4">
        <Header onAddSubject={onAddSubject} />
        
        <div className="mt-6">
          {subjects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No subjects added yet.</p>
              <button 
                onClick={onAddSubject}
                className="mt-4 text-primary-600 font-medium hover:underline"
              >
                Add your first subject
              </button>
            </div>
          ) : (
            subjects.map(subject => (
              <SubjectCard 
                key={subject.id} 
                subject={subject} 
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SubjectCard } from './components/SubjectCard';
import { BottomNav } from './components/BottomNav';
import { Subject } from './types';

// Mock Data
const INITIAL_SUBJECTS: Subject[] = [
  {
    id: '1',
    name: 'Chemistry',
    attended: 33,
    missed: 5,
    requirement: 0.80
  },
  {
    id: '2',
    name: 'Maths',
    attended: 17,
    missed: 3,
    requirement: 0.80
  }
];

function App() {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('attendance_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  useEffect(() => {
    localStorage.setItem('attendance_subjects', JSON.stringify(subjects));
  }, [subjects]);

  const handleUpdate = (id: string, field: 'attended' | 'missed', change: number) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id === id) {
        const newValue = Math.max(0, sub[field] + change);
        return { ...sub, [field]: newValue };
      }
      return sub;
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      setSubjects(prev => prev.filter(sub => sub.id !== id));
    }
  };

  const handleAddSubject = () => {
    const name = prompt('Enter subject name:');
    if (name) {
      const newSubject: Subject = {
        id: Date.now().toString(),
        name,
        attended: 0,
        missed: 0,
        requirement: 0.80 // Default requirement
      };
      setSubjects(prev => [...prev, newSubject]);
    }
  };

  return (
    // Changed bg-black to bg-gray-50 and text-white to text-gray-900
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-primary-500/30 pb-24">
      <div className="max-w-md mx-auto px-4">
        <Header onAddSubject={handleAddSubject} />
        
        <div className="mt-6">
          {subjects.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No subjects added yet.</p>
              <button 
                onClick={handleAddSubject}
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
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}

export default App;

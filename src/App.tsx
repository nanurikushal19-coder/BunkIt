import React, { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { Subject, Lecture } from './types';
import { AttendanceView } from './components/AttendanceView';
import { TimetableView } from './components/TimetableView';

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
  const [activeTab, setActiveTab] = useState<'attendance' | 'timetable'>('attendance');
  
  // Subjects State
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('attendance_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  // Lectures State
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    const saved = localStorage.getItem('timetable_lectures');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('attendance_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('timetable_lectures', JSON.stringify(lectures));
  }, [lectures]);

  // Attendance Handlers
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
      // Also remove associated lectures
      setLectures(prev => prev.filter(l => l.subjectId !== id));
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
        requirement: 0.80
      };
      setSubjects(prev => [...prev, newSubject]);
    }
  };

  // Timetable Handlers
  const handleAddLecture = (lecture: Lecture) => {
    setLectures(prev => {
      // Find max order for the specific day to append the new lecture at the end
      const dayLectures = prev.filter(l => l.day === lecture.day);
      const maxOrder = dayLectures.length > 0 
        ? Math.max(...dayLectures.map(l => l.order || 0)) 
        : -1;
      
      return [...prev, { ...lecture, order: maxOrder + 1 }];
    });
  };

  const handleDeleteLecture = (id: string) => {
    setLectures(prev => prev.filter(l => l.id !== id));
  };

  const handleReorderLecture = (id: string, direction: 'up' | 'down') => {
    setLectures(prev => {
      const targetLecture = prev.find(l => l.id === id);
      if (!targetLecture) return prev;

      // Get all lectures for this day
      const dayLectures = prev.filter(l => l.day === targetLecture.day);
      
      // Sort them by current order (or fallback to index/time if order is missing)
      dayLectures.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Normalize orders to ensure they are 0, 1, 2, 3...
      dayLectures.forEach((l, index) => { l.order = index; });

      const currentIndex = dayLectures.findIndex(l => l.id === id);
      if (currentIndex === -1) return prev;

      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      // Check bounds
      if (swapIndex < 0 || swapIndex >= dayLectures.length) return prev;

      // Swap orders
      const swapLecture = dayLectures[swapIndex];
      const tempOrder = targetLecture.order;
      targetLecture.order = swapLecture.order;
      swapLecture.order = tempOrder;

      // Return new state with updated lectures
      return prev.map(l => {
        const updated = dayLectures.find(dl => dl.id === l.id);
        return updated || l;
      });
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {activeTab === 'attendance' ? (
        <AttendanceView 
          subjects={subjects}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAddSubject={handleAddSubject}
        />
      ) : (
        <TimetableView 
          lectures={lectures}
          subjects={subjects}
          onAddLecture={handleAddLecture}
          onDeleteLecture={handleDeleteLecture}
          onReorderLecture={handleReorderLecture}
        />
      )}
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { Subject, Lecture, Reminder, Material, TabType } from './types';
import { AttendanceView } from './components/AttendanceView';
import { TimetableView } from './components/TimetableView';
import { NotebookView } from './components/notebook/NotebookView';
import { ReminderView } from './components/ReminderView';
import { MaterialView } from './components/MaterialView';

// Mock Data - Empty for fresh start
const INITIAL_SUBJECTS: Subject[] = [];

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  
  // Subjects State with Migration to 85%
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('attendance_subjects');
    let parsed = saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
    
    // FORCE UPDATE: Ensure all existing subjects are updated to 85% requirement
    if (parsed.length > 0) {
      parsed = parsed.map((s: Subject) => ({
        ...s,
        requirement: 0.85
      }));
    }
    
    return parsed;
  });

  // Lectures State
  const [lectures, setLectures] = useState<Lecture[]>(() => {
    const saved = localStorage.getItem('timetable_lectures');
    return saved ? JSON.parse(saved) : [];
  });

  // Reminders State
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : [];
  });

  // Materials State
  const [materials, setMaterials] = useState<Material[]>(() => {
    try {
        const saved = localStorage.getItem('materials');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to load materials", e);
        return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('attendance_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('timetable_lectures', JSON.stringify(lectures));
  }, [lectures]);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    try {
        localStorage.setItem('materials', JSON.stringify(materials));
    } catch (e) {
        alert("Storage quota exceeded! Some materials might not be saved.");
    }
  }, [materials]);

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
      setLectures(prev => prev.filter(l => l.subjectId !== id));
      // Also delete associated materials? Optional, but cleaner.
      // setMaterials(prev => prev.filter(m => m.subjectId !== id));
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
        // Enforce 85% requirement for new subjects
        requirement: 0.85
      };
      setSubjects(prev => [...prev, newSubject]);
    }
  };

  // Timetable Handlers
  const handleAddLecture = (lecture: Lecture) => {
    setLectures(prev => {
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

      const dayLectures = prev.filter(l => l.day === targetLecture.day);
      dayLectures.sort((a, b) => (a.order || 0) - (b.order || 0));
      dayLectures.forEach((l, index) => { l.order = index; });

      const currentIndex = dayLectures.findIndex(l => l.id === id);
      if (currentIndex === -1) return prev;

      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= dayLectures.length) return prev;

      const swapLecture = dayLectures[swapIndex];
      const tempOrder = targetLecture.order;
      targetLecture.order = swapLecture.order;
      swapLecture.order = tempOrder;

      return prev.map(l => {
        const updated = dayLectures.find(dl => dl.id === l.id);
        return updated || l;
      });
    });
  };

  // Reminder Handlers
  const handleAddReminder = (reminder: Reminder) => {
    setReminders(prev => [...prev, reminder]);
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  // Material Handlers
  const handleAddMaterial = (material: Material) => {
    setMaterials(prev => [...prev, material]);
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {activeTab === 'attendance' && (
        <AttendanceView 
          subjects={subjects}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAddSubject={handleAddSubject}
        />
      )}
      
      {activeTab === 'timetable' && (
        <TimetableView 
          lectures={lectures}
          subjects={subjects}
          onAddLecture={handleAddLecture}
          onDeleteLecture={handleDeleteLecture}
          onReorderLecture={handleReorderLecture}
        />
      )}

      {activeTab === 'material' && (
        <MaterialView 
            materials={materials}
            subjects={subjects}
            onAddMaterial={handleAddMaterial}
            onDeleteMaterial={handleDeleteMaterial}
        />
      )}

      {activeTab === 'notebook' && (
        <NotebookView />
      )}

      {activeTab === 'reminder' && (
        <ReminderView 
          reminders={reminders}
          onAddReminder={handleAddReminder}
          onToggleReminder={handleToggleReminder}
          onDeleteReminder={handleDeleteReminder}
        />
      )}
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;

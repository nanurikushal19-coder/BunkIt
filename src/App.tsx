import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { AuthView } from './components/AuthView';
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
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>('attendance');
  
  // Attendance subjects live in Supabase per authenticated user.
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsReady, setSubjectsReady] = useState(false);

  useEffect(() => {
    if (!session?.user.id) {
      setSubjects([]);
      setSubjectsReady(false);
      return;
    }

    supabase
      .from('subjects')
      .select('id,name,attended,total')
      .eq('user_id', session.user.id)
      .order('id')
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to load subjects', error);
        } else {
          setSubjects((data ?? []).map(row => ({
            id: String(row.id),
            name: row.name,
            attended: row.attended ?? 0,
            missed: Math.max(0, (row.total ?? 0) - (row.attended ?? 0)),
            requirement: 0.85
          })));
        }
        setSubjectsReady(true);
      });
  }, [session?.user.id]);

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
  const handleUpdate = async (id: string, field: 'attended' | 'missed', change: number) => {
    const current = subjects.find(sub => sub.id === id);
    if (!current || !session) return;

    const next = {
      ...current,
      [field]: Math.max(0, current[field] + change)
    };
    setSubjects(prev => prev.map(sub => sub.id === id ? next : sub));

    const { error } = await supabase
      .from('subjects')
      .update({ attended: next.attended, total: next.attended + next.missed, updated_at: new Date().toISOString() })
      .eq('id', Number(id))
      .eq('user_id', session.user.id);

    if (error) console.error('Failed to update attendance', error);
  };

  const handleDelete = async (id: string) => {
    if (!session || !window.confirm('Are you sure you want to delete this subject?')) return;
    const { error } = await supabase.from('subjects').delete().eq('id', Number(id)).eq('user_id', session.user.id);
    if (!error) {
      setSubjects(prev => prev.filter(sub => sub.id !== id));
      setLectures(prev => prev.filter(l => l.subjectId !== id));
    }
  };

  const handleAddSubject = async () => {
    const name = prompt('Enter subject name:')?.trim();
    if (!name || !session) return;

    const { data, error } = await supabase
      .from('subjects')
      .insert({ user_id: session.user.id, name, attended: 0, total: 0 })
      .select('id,name,attended,total')
      .single();

    if (error) return console.error('Failed to add subject', error);
    setSubjects(prev => [...prev, {
      id: String(data.id),
      name: data.name,
      attended: data.attended ?? 0,
      missed: Math.max(0, (data.total ?? 0) - (data.attended ?? 0)),
      requirement: 0.85
    }]);
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

  if (!authReady || (session && !subjectsReady)) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading BunkIt...</div>;
  }

  if (!session) return <AuthView />;

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

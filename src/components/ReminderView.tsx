import React, { useState, useEffect } from 'react';
import { Plus, Bell, Calendar, Clock, AlertCircle, CheckCircle2, Circle, Trash2, X } from 'lucide-react';
import { Reminder, ReminderIntensity } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ReminderViewProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Reminder) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

export const ReminderView: React.FC<ReminderViewProps> = ({ 
  reminders, 
  onAddReminder, 
  onToggleReminder, 
  onDeleteReminder 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [intensity, setIntensity] = useState<ReminderIntensity>('medium');

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    const deadline = new Date(`${date}T${time}`).toISOString();
    
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title,
      deadline,
      intensity,
      completed: false
    };

    onAddReminder(newReminder);
    
    // Schedule notification (Simulation)
    const timeUntil = new Date(deadline).getTime() - Date.now();
    if (timeUntil > 0) {
      setTimeout(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Reminder Due!', {
            body: `It's time for: ${title}`,
            icon: '/vite.svg'
          });
        } else {
          alert(`REMINDER: ${title}`);
        }
      }, timeUntil);
    }

    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setTime('');
    setIntensity('medium');
    setIsModalOpen(false);
  };

  const getIntensityColor = (level: ReminderIntensity) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-600 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'low': return 'bg-green-100 text-green-600 border-green-200';
    }
  };

  const sortedReminders = [...reminders].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reminders</h1>
            <p className="text-gray-500 text-sm mt-1">Don't forget your tasks</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-900/20 flex items-center justify-center hover:scale-105 transition"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {sortedReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Bell size={48} className="mb-4 opacity-20" />
              <p>No reminders set</p>
            </div>
          ) : (
            sortedReminders.map((reminder) => {
              const deadlineDate = new Date(reminder.deadline);
              const isOverdue = !reminder.completed && deadlineDate.getTime() < Date.now();

              return (
                <motion.div 
                  key={reminder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white p-4 rounded-2xl border shadow-sm transition-all ${
                    reminder.completed ? 'opacity-60 border-gray-100' : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => onToggleReminder(reminder.id)}
                      className={`mt-1 flex-shrink-0 transition-colors ${
                        reminder.completed ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      {reminder.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-base truncate ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {reminder.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                          <Clock size={12} />
                          <span>
                            {deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide ${getIntensityColor(reminder.intensity)}`}>
                          {reminder.intensity}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => onDeleteReminder(reminder.id)}
                      className="text-gray-300 hover:text-red-400 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">New Reminder</h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Task Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Submit Assignment"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-zinc-900 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="time" 
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-zinc-900 transition"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Intensity</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as ReminderIntensity[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setIntensity(level)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                          intensity === level 
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-zinc-900 text-white font-semibold py-3.5 rounded-xl mt-2 hover:bg-zinc-800 active:scale-[0.98] transition shadow-lg shadow-zinc-900/10"
                >
                  Set Reminder
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

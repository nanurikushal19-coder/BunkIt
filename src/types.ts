export interface Subject {
  id: string;
  name: string;
  attended: number;
  missed: number;
  requirement: number; // e.g., 0.75 for 75%
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface Lecture {
  id: string;
  subjectId: string;
  subjectName: string;
  day: DayOfWeek;
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
  color: string;
  order?: number;
}

export type ReminderIntensity = 'low' | 'medium' | 'high';

export interface Reminder {
  id: string;
  title: string;
  deadline: string; // ISO Date string
  intensity: ReminderIntensity;
  completed: boolean;
}

export interface Material {
  id: string;
  subjectId: string;
  title: string;
  fileName: string;
  fileType: string;
  fileData: string; // Base64 string for storage
  dateAdded: string;
  size: string;
}

export type TabType = 'attendance' | 'timetable' | 'notebook' | 'reminder' | 'material';

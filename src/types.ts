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
  order?: number; // Added for manual ordering
}

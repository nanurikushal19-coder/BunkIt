export interface Subject {
  id: string;
  name: string;
  attended: number;
  missed: number;
  requirement: number; // e.g., 0.75 for 75%
}

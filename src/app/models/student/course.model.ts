export interface Course {
  id: number;
  code: string;
  name: string;
  creditHours: number;
  level: number;
  capacity: number;
  prerequisites: string[];
  status: 'Available' | 'Full' | 'Closed';
  professor: string;
  isLocked: boolean;
  lockReason: string | null;
}

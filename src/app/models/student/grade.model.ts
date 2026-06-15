export interface Grade {
  id: number;
  courseName: string;
  semester: string;
  grade: number;
  recognition: string;
  level: number | null;
  term: number | null;
}

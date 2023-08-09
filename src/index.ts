export type Run = {
  id?: number;
  name: string;
  date: string;
  planned_miles: number;
  actual_miles: number;
  notes?: string;
};

export type RunWeek = Record<string, Run[]>;
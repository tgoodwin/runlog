export type Run = {
  id?: number;
  name: string;
  date: string;
  planned_miles: number;
  actual_miles: number;
  notes?: string;
};

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const dayEnum: Record<number, Day> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday"
};

export type RunWeek = Record<Day, Run[]>;
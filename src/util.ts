import dayjs from 'dayjs';

import { Run, RunWeek, dayEnum } from "./index";

const WEEK_START = 1; // 0-indexed day of week

export function getWeekStart(dateStr: string) {
  const d = dayjs(dateStr);
  const day = d.day(); // 0-indexed day of week
  if (day === WEEK_START) {
    return d;
  }
  const diff = d.date() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return d.date(diff); // returns new dayjs object
}

// returns 'Mon Jul 17 2023' type of thing
export function formatDateStr(dateStr: string) {
  return dayjs(dateStr).format("dddd MMM D YYYY");
}

export function dateStrToDate(dateStr: string) {
  return dayjs(dateStr);
}

export function groupByWeek(runs: Run[]) {
  const groups: Record<string, Run[]> = {};
  runs.forEach(r => {
    const weekStart = getWeekStart(r.date);
    const start = weekStart.format("YYYY-MM-DD");
    if (!groups[ start ]) {
      groups[ start ] = [];
    }
    groups[ start ].push(r);
  });
  return groups;
};

export function getDateRange(start: Date, endInclusive: Date): Date[] {
  const dates = [];
  let currentDate = new Date(start);
  while (currentDate <= endInclusive) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export function createRunWeek(runs: Run[]): RunWeek {
  const week: RunWeek = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };
  runs.forEach(r => {
    const day = dateStrToDate(r.date).day();
    week[dayEnum[day]].push(r);
  });
  return week;
};

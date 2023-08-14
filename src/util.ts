import dayjs, { Dayjs } from 'dayjs';

import { Run, RunWeek } from "./index";

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

export function getDateRange(start: Dayjs, endInclusive: Dayjs): Dayjs[] {
  const dates = [];
  let curr = start;
  while (curr <= endInclusive) {
    dates.push(dayjs(curr));
    curr = curr.date(curr.date() + 1);
  }
  return dates;
}

// they all fall within the same week
export function createWeek(runs: Run[], weekStartDateStr: string): RunWeek {
  const start = dayjs(weekStartDateStr);
  const weekDates = getDateRange(start, start.date(start.date() + 6));
  const m = weekDates.map(d => d.format("YYYY-MM-DD"));
  // todo use reduce
  let datemap: Record<string, Run[]> = {};
  m.forEach(d => datemap[d] = []);

  runs.forEach(r => {
    datemap[r.date].push(r)
  });
  return datemap;
}


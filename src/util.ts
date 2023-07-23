import { Run, RunWeek, dayEnum } from "./index";

const WEEK_START = 1; // 0-indexed day of week

export function getWeekStart(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0-indexed day of week
  if (day === WEEK_START) {
    return date;
  }
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

export function formatDateStr(dateStr: string) {
  return dateStrToDate(dateStr).toDateString().split('T')[0];
}

function dateStrToDate(dateStr: string) {
  var parts = dateStr.split('-');
  return new Date(+parts[0], +parts[1] - 1, +parts[2]);
}

export function groupByWeek(runs: Run[]) {
  const groups: Record<string, Run[]> = {};
  runs.forEach(r => {
    const startd = getWeekStart(dateStrToDate(r.date));
    const start = startd.toISOString().split('T')[0];
    if (!groups[ start ]) {
      groups[ start ] = [];
    }
    groups[ start ].push(r);
  });
  return groups;
};

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
    const day = dateStrToDate(r.date).getDay();
    week[dayEnum[day]].push(r);
  });
  return week;
};

import { Run, RunWeek, dayEnum } from "./index";

export function getWeekStart(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0-indexed day of week
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
}

export function formatDateStr(dateStr: string) {
  // literal madness: https://stackoverflow.com/a/34821566
  const dateArg = dateStr + " ";

  return new Date(dateArg).toDateString().split('T')[0];
}

export function groupByWeek(runs: Run[]) {
  const groups: Record<string, Run[]> = {};
  runs.forEach(r => {
    const startd = getWeekStart(new Date(r.date + " "));
    console.log(startd);
    const start = startd.toISOString().split('T')[0];
    if (!groups[ start ]) {
      groups[ start ] = [];
    }
    groups[ start ].push(r);
  });
  return groups;
};

export function createRunWeeks(runs: Run[]): RunWeek[] {
  const groups = groupByWeek(runs);
  const weeks = Object.keys(groups).map(k => {
    const week: RunWeek = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };
    groups[k].forEach(r => {
      const day = new Date(r.date).getDay();
      week[dayEnum[day]].push(r);
    });
    return week;
  });
  return weeks;
}

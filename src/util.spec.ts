import { Run } from "./index";
import { getWeekStart, groupByWeek, createRunWeeks } from "./util";

const testRuns: Run[] = [
  { id: 1, name: 'Test Run 1', date: '2021-01-01', planned_miles: 5, actual_miles: 5 }, // dec28 2020
  { id: 2, name: 'Test Run 2', date: '2021-01-02', planned_miles: 5, actual_miles: 5 }, //dec 28 2020
  { id: 3, name: 'Test Run 3', date: '2021-01-03', planned_miles: 5, actual_miles: 5 },
  { id: 4, name: 'Test Run 4', date: '2021-01-04', planned_miles: 5, actual_miles: 5 },
  { id: 5, name: 'Test Run 5', date: '2021-01-05', planned_miles: 5, actual_miles: 5 },
  { id: 6, name: 'Test Run 6', date: '2021-01-06', planned_miles: 5, actual_miles: 5 },
  { id: 7, name: 'Test Run 7', date: '2021-01-07', planned_miles: 5, actual_miles: 5 },
  { id: 8, name: 'Test Run 8', date: '2021-01-08', planned_miles: 5, actual_miles: 5 },
  { id: 9, name: 'Test Run 9', date: '2021-01-09', planned_miles: 5, actual_miles: 5 },
  { id: 10, name: 'Test Run 10', date: '2021-01-10', planned_miles: 5, actual_miles: 5 },
  { id: 11, name: 'Test Run 11', date: '2021-01-11', planned_miles: 5, actual_miles: 5 },
  { id: 12, name: 'Test Run 12', date: '2021-01-12', planned_miles: 5, actual_miles: 5 },
]

describe('getWeekStart', () => {
  it('returns the start of the week for a given date', () => {
    const d = new Date('2023-07-20');
    const expected = new Date('2023-07-18'); // n.b. logiaclly this is Monday
    expect(getWeekStart(d)).toEqual(expected);
    expect(getWeekStart(d).getDay()).toEqual(1);
  });
});

describe('testgroupbyweek', () => {
  it('groups runs by week', () => {
    const groups = groupByWeek(testRuns);
    console.log(Object.keys(groups));
    expect(Object.keys(groups).length).toEqual(3);
    expect(groups['2020-12-28'].length).toEqual(3);
    expect(groups['2021-01-04'].length).toEqual(7);
    expect(groups['2021-01-11'].length).toEqual(2);
  });
});

describe("createRunWeeks", () => {
  it("creates a list of weeks from a list of runs", () => {
    const runweeks = createRunWeeks(testRuns);
    expect(runweeks.length).toEqual(3);
  });
});
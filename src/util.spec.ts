import { runWithOwner } from "solid-js";
import { Run } from "./index";
import { getWeekStart, groupByWeek, createRunWeek } from "./util";

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
  it('should handle monday right', () => {
    const d = new Date('2023-07-17 ');
    const expected = new Date('2023-07-17 ');
    expect(getWeekStart(d)).toEqual(expected);
    expect(getWeekStart(d).getDay()).toEqual(1);
  })
  it("should handle sunday right", () => {
    const d = new Date('2023-07-16 ');
    const expected = new Date('2023-07-10 ');
    expect(getWeekStart(d)).toEqual(expected);
    expect(getWeekStart(d).getDay()).toEqual(1);
  })
});

describe('testgroupbyweek', () => {
  it('should get mondays right', () => {
    const testRuns = [{name: 'monday july 17 2023', date: '2023-07-17', planned_miles: 0, actual_miles: 0}];
    const groups = groupByWeek(testRuns);
    expect(Object.keys(groups).length).toEqual(1);
    expect(groups['2023-07-17'].length).toEqual(1);
    expect(groups['2023-07-17'][0].name).toEqual('monday july 17 2023');
  });
  it("should return these as being in the same week", () => {
    const test = [
      { name: 'run 1', planned_miles: 5, actual_miles: 5, date: '2023-07-17'},
      { name: 'run 1', planned_miles: 5, actual_miles: 5, date: '2023-07-18'},
    ];
    const groups = groupByWeek(test);
    expect(Object.keys(groups).length).toEqual(1);
    expect(groups['2023-07-17'].length).toEqual(2);
  });
  it("should return these across two weeks", () => {
    const test = [
      { date: '2023-07-15' },
      { date: '2023-07-16' },
      { date: '2023-07-17' },
      { date: '2023-07-18' },
    ];

    const groups = groupByWeek(test as Run[]);
    expect(Object.keys(groups).length).toEqual(2);
    expect(groups['2023-07-10'].length).toEqual(2);
    expect(groups['2023-07-17'].length).toEqual(2);
  });
});

describe("createRunWeek", () => {
  it("creates a runweek from a list of runs", () => {
    const testWeek: Run[] = [
      { id: 1, name: 'Test Run 1', date: '2023-07-21', planned_miles: 5, actual_miles: 5 },
      { id: 2, name: 'Test Run 2', date: '2023-07-22', planned_miles: 5, actual_miles: 5 },
    ]
    const runweeks = createRunWeek(testWeek);
    const expected = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [{ id: 1, name: 'Test Run 1', date: '2023-07-21', planned_miles: 5, actual_miles: 5 }],
      Saturday: [{ id: 2, name: 'Test Run 2', date: '2023-07-22', planned_miles: 5, actual_miles: 5 }],
      Sunday: []
    }
    expect(runweeks).toEqual(expected);
  });
});
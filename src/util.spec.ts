import { Run } from "./index";
import { getWeekStart, groupByWeek, createRunWeek, getDateRange } from "./util";

describe("getWeekStart", () => {
  it("returns the start of the week for a given date", () => {
    const d = "2023-07-20";
    const expected = "2023-07-17";
    expect(getWeekStart(d).format("YYYY-MM-DD")).toEqual(expected);
    expect(getWeekStart(d).day()).toEqual(1);
  });
  it("should handle monday right", () => {
    const d = "2023-07-17";
    const expected = "2023-07-17";
    expect(getWeekStart(d).format("YYYY-MM-DD")).toEqual(expected);
    expect(getWeekStart(d).day()).toEqual(1);
  });

  it("should handle sunday right", () => {
    const d = "2023-07-16";
    const expected = "2023-07-10";
    expect(getWeekStart(d).format("YYYY-MM-DD")).toEqual(expected);
    expect(getWeekStart(d).day()).toEqual(1);
  });
});

describe("testgroupbyweek", () => {
  it("should get mondays right", () => {
    const testRuns = [
      {
        name: "monday july 17 2023",
        date: "2023-07-17",
        planned_miles: 0,
        actual_miles: 0,
      },
    ];
    const groups = groupByWeek(testRuns);
    console.log(groups);
    expect(Object.keys(groups).length).toEqual(1);
    expect(groups["2023-07-17"].length).toEqual(1);
    expect(groups["2023-07-17"][0].name).toEqual("monday july 17 2023");
  });
  it("should return these as being in the same week", () => {
    const test = [
      { name: "run 1", planned_miles: 5, actual_miles: 5, date: "2023-07-17" },
      { name: "run 1", planned_miles: 5, actual_miles: 5, date: "2023-07-18" },
    ];
    const groups = groupByWeek(test);
    expect(Object.keys(groups).length).toEqual(1);
    expect(groups["2023-07-17"].length).toEqual(2);
  });
  it("should return these across two weeks", () => {
    const test = [
      { date: "2023-07-15" },
      { date: "2023-07-16" },
      { date: "2023-07-17" },
      { date: "2023-07-18" },
    ];

    const groups = groupByWeek(test as Run[]);
    expect(Object.keys(groups).length).toEqual(2);
    expect(groups["2023-07-10"].length).toEqual(2);
    expect(groups["2023-07-17"].length).toEqual(2);
  });
});

describe("createRunWeek", () => {
  it("creates a runweek from a list of runs", () => {
    const testWeek: Run[] = [
      {
        id: 1,
        name: "Test Run 1",
        date: "2023-07-21",
        planned_miles: 5,
        actual_miles: 5,
      },
      {
        id: 2,
        name: "Test Run 2",
        date: "2023-07-22",
        planned_miles: 5,
        actual_miles: 5,
      },
    ];
    const runweeks = createRunWeek(testWeek);
    const expected = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [
        {
          id: 1,
          name: "Test Run 1",
          date: "2023-07-21",
          planned_miles: 5,
          actual_miles: 5,
        },
      ],
      Saturday: [
        {
          id: 2,
          name: "Test Run 2",
          date: "2023-07-22",
          planned_miles: 5,
          actual_miles: 5,
        },
      ],
      Sunday: [],
    };
    expect(runweeks).toEqual(expected);
  });
});

describe("getDateRange", () => {
  it("should return a range of dates", () => {
    const start = new Date("2023-07-17");
    const end = new Date("2023-07-20");
    const dates = getDateRange(start, end);
    expect(dates.length).toEqual(4);
    expect(dates[0]).toEqual(start);
    expect(dates[3]).toEqual(end);
  });
});

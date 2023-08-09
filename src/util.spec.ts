import { Run } from "./index";
import { getWeekStart, groupByWeek, createWeek } from "./util";

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

describe("test createWeek", () => {
  it("should return a full week", () => {
    const testRuns = [
      { name: "", date: "2023-01-02", planned_miles: 0, actual_miles: 0 },
    ];
    const expected: Record<string, Run[]> = {
      "2023-01-02": [
        { name: "", date: "2023-01-02", planned_miles: 0, actual_miles: 0 },
      ],
      "2023-01-03": [],
      "2023-01-04": [],
      "2023-01-05": [],
      "2023-01-06": [],
      "2023-01-07": [],
      "2023-01-08": [],
    };
    const actual = createWeek(testRuns, "2023-01-02");
    Object.keys(expected).forEach((key) =>
      expect(expected[key]).toEqual(actual[key])
    );
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

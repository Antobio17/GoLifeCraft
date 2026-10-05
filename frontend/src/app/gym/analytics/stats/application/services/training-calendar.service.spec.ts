import { TestBed } from "@angular/core/testing";
import { TrainingDay } from "../../domain/models/gym-stats.model";
import { TrainingCalendarService } from "./training-calendar.service";

describe("TrainingCalendarService", () => {
  let service: TrainingCalendarService;

  const day = (date: string, volumeKg = 1000, workouts = 1): TrainingDay => ({
    date,
    workouts,
    volumeKg,
    minutes: 50,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingCalendarService);
  });

  it("returns the last days oldest first and flags today", () => {
    const days = service.lastDays([day("2026-10-03")], 7, new Date(2026, 9, 5));

    expect(days.map((d) => d.iso)).toEqual([
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
      "2026-10-05",
    ]);
    expect(days[4].workouts).toBe(1);
    expect(days[6].isToday).toBeTrue();
  });

  it("scales the level against the heaviest day", () => {
    const days = service.lastDays(
      [day("2026-10-01", 300), day("2026-10-02", 600), day("2026-10-03", 900)],
      3,
      new Date(2026, 9, 3),
    );

    expect(days.map((d) => d.level)).toEqual([1, 2, 3]);
  });

  it("pads the month grid so it starts on monday and fills whole weeks", () => {
    const cells = service.monthGrid([], 2026, 8, new Date(2026, 9, 5));

    expect(cells[0]).toBeNull();
    expect(cells[1]?.iso).toBe("2026-09-01");
    expect(cells.length % 7).toBe(0);
  });

  it("keeps the streak alive while the current week has no workout yet", () => {
    const streak = service.streakWeeks(
      [day("2026-09-22"), day("2026-09-29"), day("2026-10-03")],
      new Date(2026, 9, 5),
    );

    expect(streak).toBe(2);
  });

  it("breaks the streak on an empty week", () => {
    const streak = service.streakWeeks(
      [day("2026-09-15"), day("2026-10-05")],
      new Date(2026, 9, 5),
    );

    expect(streak).toBe(1);
  });

  it("adds up the totals of a closed range", () => {
    const totals = service.totals(
      [day("2026-09-30", 500), day("2026-10-01", 700), day("2026-10-06", 900)],
      new Date(2026, 8, 30),
      new Date(2026, 9, 5),
    );

    expect(totals).toEqual({ workouts: 2, volumeKg: 1200, minutes: 100 });
  });
});

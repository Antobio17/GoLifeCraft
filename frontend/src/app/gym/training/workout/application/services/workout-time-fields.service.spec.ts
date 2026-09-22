import { TestBed } from "@angular/core/testing";
import { WorkoutTimeFieldsService } from "./workout-time-fields.service";

describe("WorkoutTimeFieldsService", () => {
  let service: WorkoutTimeFieldsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutTimeFieldsService);
  });

  it("splits the start into local date and time and the duration into hours and minutes", () => {
    const start = new Date(2026, 8, 20, 18, 5, 40);

    const fields = service.fromWorkout(start.toISOString(), 4530);

    expect(fields).toEqual({
      date: "2026-09-20",
      time: "18:05",
      hours: 1,
      minutes: 15,
      seconds: 30,
    });
  });

  it("rebuilds the start as a local date", () => {
    const start = service.startedAt({
      date: "2026-09-20",
      time: "07:45",
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    expect(start?.getTime()).toBe(new Date(2026, 8, 20, 7, 45).getTime());
  });

  it("returns no start when the date or the time is missing", () => {
    expect(
      service.startedAt({
        date: "",
        time: "07:45",
        hours: 0,
        minutes: 0,
        seconds: 0,
      }),
    ).toBeNull();
    expect(
      service.startedAt({
        date: "2026-09-20",
        time: "",
        hours: 0,
        minutes: 0,
        seconds: 0,
      }),
    ).toBeNull();
  });

  it("adds hours, minutes and the kept seconds into the duration", () => {
    expect(
      service.durationSeconds({
        date: "",
        time: "",
        hours: 1,
        minutes: 15,
        seconds: 30,
      }),
    ).toBe(4530);
  });

  it("accepts durations up to one day", () => {
    expect(service.isValidDuration(0)).toBeTrue();
    expect(service.isValidDuration(86400)).toBeTrue();
    expect(service.isValidDuration(86401)).toBeFalse();
    expect(service.isValidDuration(-1)).toBeFalse();
  });
});

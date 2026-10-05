import { TestBed } from "@angular/core/testing";
import { Session } from "../../domain/models/session.model";
import { Workout } from "@gym/training/workout/domain/models/workout.model";
import { SessionRotationService } from "./session-rotation.service";

describe("SessionRotationService", () => {
  let service: SessionRotationService;

  const session = (id: string): Session => ({
    id,
    type: "Session",
    attributes: {
      name: id,
      estimatedDurationMinutes: 50,
      exerciseCount: 5,
      setCount: 18,
      muscleGroups: [],
    },
  });

  const workout = (sessionId: string | null, startedAt: string): Workout => ({
    id: `${sessionId}-${startedAt}`,
    type: "Workout",
    attributes: {
      sessionId,
      sessionName: sessionId ?? "free",
      status: "completed",
      startedAt,
      finishedAt: startedAt,
      durationSeconds: 3000,
      exerciseCount: 5,
      totalSets: 18,
      completedSets: 18,
      volumeKg: 8000,
      muscleGroups: [],
    },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionRotationService);
  });

  it("keeps the latest workout of each session and skips free ones", () => {
    const latest = service.lastWorkoutBySession([
      workout("a", "2026-09-20 10:00:00"),
      workout("a", "2026-10-01 10:00:00"),
      workout(null, "2026-10-02 10:00:00"),
    ]);

    expect(latest.size).toBe(1);
    expect(latest.get("a")?.attributes.startedAt).toBe("2026-10-01 10:00:00");
  });

  it("suggests the trained session that has waited the longest", () => {
    const latest = service.lastWorkoutBySession([
      workout("a", "2026-10-03 10:00:00"),
      workout("b", "2026-09-29 10:00:00"),
      workout("c", "2026-10-01 10:00:00"),
    ]);

    const next = service.nextSession(
      [session("a"), session("b"), session("c"), session("never")],
      latest,
    );

    expect(next?.id).toBe("b");
  });

  it("falls back to the first session when none has been trained", () => {
    const next = service.nextSession([session("a"), session("b")], new Map());

    expect(next?.id).toBe("a");
  });

  it("proposes the session usually trained on the same weekday", () => {
    const workouts = [
      workout("legs", "2026-10-03 10:00:00"),
      workout("monthly", "2026-09-28 10:00:00"),
      workout("push", "2026-09-21 10:00:00"),
      workout("push", "2026-09-14 10:00:00"),
      workout("pull", "2026-09-29 10:00:00"),
    ];

    const next = service.sessionForToday(
      [session("legs"), session("monthly"), session("push"), session("pull")],
      workouts,
      service.lastWorkoutBySession(workouts),
      new Date(2026, 9, 5),
    );

    expect(next?.id).toBe("push");
  });

  it("breaks a weekday tie with the most recent session", () => {
    const workouts = [
      workout("push", "2026-09-28 10:00:00"),
      workout("legs", "2026-09-21 10:00:00"),
    ];

    const next = service.sessionForToday(
      [session("legs"), session("push")],
      workouts,
      service.lastWorkoutBySession(workouts),
      new Date(2026, 9, 5),
    );

    expect(next?.id).toBe("push");
  });

  it("falls back to the rotation when that weekday was never trained", () => {
    const workouts = [
      workout("a", "2026-10-03 10:00:00"),
      workout("b", "2026-10-01 10:00:00"),
    ];

    const next = service.sessionForToday(
      [session("a"), session("b")],
      workouts,
      service.lastWorkoutBySession(workouts),
      new Date(2026, 9, 5),
    );

    expect(next?.id).toBe("b");
  });

  it("ignores workouts of sessions that no longer exist", () => {
    const workouts = [
      workout("deleted", "2026-09-28 10:00:00"),
      workout("a", "2026-09-21 10:00:00"),
    ];

    const next = service.sessionForToday(
      [session("a")],
      workouts,
      service.lastWorkoutBySession(workouts),
      new Date(2026, 9, 5),
    );

    expect(next?.id).toBe("a");
  });
});

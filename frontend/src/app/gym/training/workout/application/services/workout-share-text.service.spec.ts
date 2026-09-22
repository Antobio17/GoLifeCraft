import { TestBed } from "@angular/core/testing";
import { SetKind } from "@gym/training/session/domain/models/set-kind.model";
import { WorkoutShareTextService } from "./workout-share-text.service";
import { WorkoutDetailAttributes } from "../../domain/models/workout-detail.model";
import { WorkoutShareLabels } from "../../domain/models/workout-share-labels.model";

describe("WorkoutShareTextService", () => {
  let service: WorkoutShareTextService;

  const labels: WorkoutShareLabels = {
    sets: "series",
    reps: "reps",
    perSide: "por lado",
  };

  const workout: WorkoutDetailAttributes = {
    sessionId: "session-1",
    sessionName: "Push A",
    status: "finished",
    startedAt: "2026-03-02T18:30:00+00:00",
    finishedAt: "2026-03-02T19:34:00+00:00",
    durationSeconds: 3840,
    restStartedAt: null,
    exercises: [
      {
        id: "exercise-1",
        exerciseId: "library-1",
        exerciseName: "Press banca",
        muscleGroups: ["Pecho", "Tríceps"],
        type: "bilateral",
        weightMode: "total",
        position: 1,
        note: "Bajar despacio",
        sets: [
          {
            id: "set-1",
            position: 1,
            reps: 10,
            weight: 40,
            done: true,
            kind: SetKind.Warmup,
          },
          {
            id: "set-2",
            position: 2,
            reps: 10,
            weight: 60,
            done: true,
            kind: SetKind.Effective,
          },
          {
            id: "set-3",
            position: 3,
            reps: 8,
            weight: 65,
            done: false,
            kind: SetKind.Effective,
          },
        ],
      },
      {
        id: "exercise-2",
        exerciseId: null,
        exerciseName: "Curl con mancuerna",
        muscleGroups: ["Bíceps"],
        type: "unilateral",
        weightMode: "perSide",
        position: 2,
        note: null,
        sets: [
          {
            id: "set-4",
            position: 1,
            reps: 12,
            weight: null,
            done: true,
            kind: SetKind.Effective,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutShareTextService);
  });

  it("puts the workout name, duration and completed ratio in the header", () => {
    const lines = service.build(workout, labels).split("\n");

    expect(lines[0]).toBe("🏋️ Push A");
    expect(lines[2]).toBe("⏱️ 1h 4min · ✅ 3/4 series");
  });

  it("numbers exercises and lists their muscle groups", () => {
    const text = service.build(workout, labels);

    expect(text).toContain("1. Press banca (Pecho · Tríceps)");
    expect(text).toContain("2. Curl con mancuerna (Bíceps · por lado)");
  });

  it("marks warmup, completed and pending sets apart", () => {
    const text = service.build(workout, labels);

    expect(text).toContain("🔥 A1 · 10 × 40 kg");
    expect(text).toContain("✅ 1 · 10 × 60 kg");
    expect(text).toContain("⬜ 2 · 8 × 65 kg");
  });

  it("falls back to reps when the set carries no weight", () => {
    expect(service.build(workout, labels)).toContain("✅ 1 · 12 reps");
  });

  it("keeps the exercise note as the last line of its block", () => {
    const block = service.build(workout, labels).split("\n\n")[1];

    expect(block.split("\n").pop()).toBe("   📝 Bajar despacio");
  });

  it("separates every exercise block with a blank line", () => {
    expect(service.build(workout, labels).split("\n\n").length).toBe(3);
  });
});

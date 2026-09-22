import { TestBed } from "@angular/core/testing";
import { SetKind } from "@gym/training/session/domain/models/set-kind.model";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import { WorkoutEditDraftService } from "./workout-edit-draft.service";
import { WorkoutExerciseView } from "../../domain/models/workout-detail.model";

describe("WorkoutEditDraftService", () => {
  let service: WorkoutEditDraftService;

  const exercises: WorkoutExerciseView[] = [
    {
      id: "exercise-1",
      exerciseId: "library-1",
      exerciseName: "Press banca",
      muscleGroups: ["Pecho"],
      type: "bilateral",
      weightMode: "total",
      position: 1,
      note: null,
      sets: [
        {
          id: "set-1",
          position: 1,
          reps: 10,
          weight: 40,
          done: true,
          kind: SetKind.Effective,
        },
        {
          id: "set-2",
          position: 2,
          reps: 8,
          weight: 45,
          done: false,
          kind: SetKind.Effective,
        },
      ],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutEditDraftService);
  });

  it("changes the reps and weight of a single set", () => {
    const withReps = service.setReps(exercises, "exercise-1", "set-2", 12);
    const withWeight = service.setWeight(withReps, "exercise-1", "set-2", 47.5);

    expect(withWeight[0].sets[1].reps).toBe(12);
    expect(withWeight[0].sets[1].weight).toBe(47.5);
    expect(withWeight[0].sets[0]).toEqual(exercises[0].sets[0]);
    expect(exercises[0].sets[1].reps).toBe(8);
  });

  it("toggles whether a set was done and its kind", () => {
    const toggled = service.toggleKind(
      service.toggleDone(exercises, "exercise-1", "set-2"),
      "exercise-1",
      "set-2",
    );

    expect(toggled[0].sets[1].done).toBeTrue();
    expect(toggled[0].sets[1].kind).toBe(SetKind.Warmup);
  });

  it("adds a done set copying the last one and removes sets", () => {
    const added = service.addSet(exercises, "exercise-1");

    expect(added[0].sets.length).toBe(3);
    expect(added[0].sets[2]).toEqual(
      jasmine.objectContaining({ reps: 8, weight: 45, done: true }),
    );

    const removed = service.removeSet(added, "exercise-1", "set-1");
    expect(removed[0].sets.map((set) => set.id)).not.toContain("set-1");
  });

  it("adds an exercise from the library and removes exercises", () => {
    const libraryExercise: Exercise = {
      id: "library-2",
      type: "exercise",
      attributes: {
        name: "Remo",
        description: null,
        type: "unilateral",
        weightMode: "per_side",
        muscleGroups: ["Espalda"],
      },
    };

    const added = service.fromLibrary(exercises, libraryExercise);
    expect(added.length).toBe(2);
    expect(added[1].exerciseName).toBe("Remo");
    expect(added[1].sets.length).toBe(1);

    expect(service.removeExercise(added, "exercise-1").length).toBe(1);
  });

  it("builds the request renumbering positions and keeping the done flag", () => {
    const request = service.toRequest(
      service.removeSet(exercises, "exercise-1", "set-1"),
    );

    expect(request[0].position).toBe(1);
    expect(request[0].sets).toEqual([
      {
        position: 1,
        reps: 8,
        weight: 45,
        done: false,
        kind: SetKind.Effective,
      },
    ]);
  });
});

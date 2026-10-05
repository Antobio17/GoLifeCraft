import { TestBed } from "@angular/core/testing";
import { ExerciseWeightMode } from "@gym/library/exercise/domain/models/exercise-weight-mode.model";
import { SetKind } from "@gym/training/session/domain/models/set-kind.model";
import {
  WorkoutExerciseView,
  WorkoutSetView,
} from "../../domain/models/workout-detail.model";
import { WorkoutVolumeService } from "./workout-volume.service";

describe("WorkoutVolumeService", () => {
  let service: WorkoutVolumeService;

  const set = (
    reps: number,
    weight: number | null,
    done = true,
    kind = SetKind.Effective,
  ): WorkoutSetView => ({
    id: `${reps}-${weight}-${done}-${kind}`,
    position: 1,
    reps,
    weight,
    done,
    kind,
  });

  const exercise = (
    sets: WorkoutSetView[],
    weightMode: string = ExerciseWeightMode.Total,
  ): WorkoutExerciseView => ({
    id: "exercise",
    exerciseId: null,
    exerciseName: "Press",
    muscleGroups: [],
    type: "bilateral",
    weightMode,
    position: 1,
    note: null,
    sets,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutVolumeService);
  });

  it("counts only done effective sets", () => {
    const volume = service.exerciseVolumeKg(
      exercise([
        set(10, 40, true, SetKind.Warmup),
        set(8, 70),
        set(8, 70, false),
        set(6, null),
      ]),
    );

    expect(volume).toBe(560);
  });

  it("doubles the load of a per side exercise", () => {
    const volume = service.exerciseVolumeKg(
      exercise([set(10, 20)], ExerciseWeightMode.PerSide),
    );

    expect(volume).toBe(400);
  });

  it("adds every exercise of the workout", () => {
    const volume = service.workoutVolumeKg([
      exercise([set(10, 50)]),
      exercise([set(10, 20)], ExerciseWeightMode.PerSide),
    ]);

    expect(volume).toBe(900);
  });
});

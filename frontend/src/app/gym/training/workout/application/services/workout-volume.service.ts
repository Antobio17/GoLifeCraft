import { Injectable } from "@angular/core";
import { ExerciseWeightMode } from "@gym/library/exercise/domain/models/exercise-weight-mode.model";
import { SetKind } from "@gym/training/session/domain/models/set-kind.model";
import { WorkoutExerciseView } from "../../domain/models/workout-detail.model";

@Injectable({ providedIn: "root" })
export class WorkoutVolumeService {
  private static readonly PER_SIDE_FACTOR = 2;

  exerciseVolumeKg(exercise: WorkoutExerciseView): number {
    const factor =
      ExerciseWeightMode.PerSide === exercise.weightMode
        ? WorkoutVolumeService.PER_SIDE_FACTOR
        : 1;

    return exercise.sets
      .filter((set) => set.done && SetKind.Effective === set.kind)
      .reduce((total, set) => total + set.reps * (set.weight ?? 0) * factor, 0);
  }

  workoutVolumeKg(exercises: WorkoutExerciseView[]): number {
    return exercises.reduce(
      (total, exercise) => total + this.exerciseVolumeKg(exercise),
      0,
    );
  }
}

import { Injectable } from "@angular/core";
import { uuidV4 } from "@shared/uuid/uuid";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import { ExerciseWeightMode } from "@gym/library/exercise/domain/models/exercise-weight-mode.model";
import { SetKind } from "@gym/training/session/domain/models/set-kind.model";
import {
  WorkoutExerciseView,
  WorkoutSetView,
} from "../../domain/models/workout-detail.model";
import { WorkoutExerciseRequest } from "../../domain/models/workout-request.model";

@Injectable({ providedIn: "root" })
export class WorkoutEditDraftService {
  fromLibrary(
    list: WorkoutExerciseView[],
    exercise: Exercise,
  ): WorkoutExerciseView[] {
    const added: WorkoutExerciseView = {
      id: uuidV4(),
      exerciseId: exercise.id,
      exerciseName: exercise.attributes.name,
      muscleGroups: [...exercise.attributes.muscleGroups],
      type: exercise.attributes.type,
      weightMode: exercise.attributes.weightMode ?? ExerciseWeightMode.Total,
      position: list.length + 1,
      note: null,
      sets: [this.newSet(1, null)],
    };

    return [...list, added];
  }

  removeExercise(
    list: WorkoutExerciseView[],
    exerciseId: string,
  ): WorkoutExerciseView[] {
    return list.filter((exercise) => exercise.id !== exerciseId);
  }

  addSet(
    list: WorkoutExerciseView[],
    exerciseId: string,
  ): WorkoutExerciseView[] {
    return list.map((exercise) =>
      exercise.id === exerciseId
        ? {
            ...exercise,
            sets: [
              ...exercise.sets,
              this.newSet(
                exercise.sets.length + 1,
                exercise.sets[exercise.sets.length - 1] ?? null,
              ),
            ],
          }
        : exercise,
    );
  }

  removeSet(
    list: WorkoutExerciseView[],
    exerciseId: string,
    setId: string,
  ): WorkoutExerciseView[] {
    return list.map((exercise) =>
      exercise.id === exerciseId
        ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
        : exercise,
    );
  }

  setReps(
    list: WorkoutExerciseView[],
    exerciseId: string,
    setId: string,
    reps: number,
  ): WorkoutExerciseView[] {
    return this.mutateSet(list, exerciseId, setId, (set) => ({ ...set, reps }));
  }

  setWeight(
    list: WorkoutExerciseView[],
    exerciseId: string,
    setId: string,
    weight: number,
  ): WorkoutExerciseView[] {
    return this.mutateSet(list, exerciseId, setId, (set) => ({
      ...set,
      weight,
    }));
  }

  toggleDone(
    list: WorkoutExerciseView[],
    exerciseId: string,
    setId: string,
  ): WorkoutExerciseView[] {
    return this.mutateSet(list, exerciseId, setId, (set) => ({
      ...set,
      done: !set.done,
    }));
  }

  toggleKind(
    list: WorkoutExerciseView[],
    exerciseId: string,
    setId: string,
  ): WorkoutExerciseView[] {
    return this.mutateSet(list, exerciseId, setId, (set) => ({
      ...set,
      kind: set.kind === SetKind.Warmup ? SetKind.Effective : SetKind.Warmup,
    }));
  }

  setNote(
    list: WorkoutExerciseView[],
    exerciseId: string,
    note: string,
  ): WorkoutExerciseView[] {
    const normalized = note.trim();

    return list.map((exercise) =>
      exercise.id === exerciseId
        ? { ...exercise, note: normalized === "" ? null : normalized }
        : exercise,
    );
  }

  toRequest(list: WorkoutExerciseView[]): WorkoutExerciseRequest[] {
    return list.map((exercise, exerciseIndex) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      type: exercise.type,
      weightMode: exercise.weightMode,
      muscleGroups: [...exercise.muscleGroups],
      position: exerciseIndex + 1,
      note: exercise.note,
      sets: exercise.sets.map((set, setIndex) => ({
        position: setIndex + 1,
        reps: set.reps,
        weight: set.weight,
        done: set.done,
        kind: set.kind,
      })),
    }));
  }

  private newSet(
    position: number,
    previous: WorkoutSetView | null,
  ): WorkoutSetView {
    return {
      id: uuidV4(),
      position,
      reps: previous ? previous.reps : 10,
      weight: previous ? previous.weight : null,
      done: true,
      kind: previous ? previous.kind : SetKind.Effective,
    };
  }

  private mutateSet(
    list: WorkoutExerciseView[],
    exerciseId: string,
    setId: string,
    change: (set: WorkoutSetView) => WorkoutSetView,
  ): WorkoutExerciseView[] {
    return list.map((exercise) =>
      exercise.id !== exerciseId
        ? exercise
        : {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.id === setId ? change(set) : set,
            ),
          },
    );
  }
}

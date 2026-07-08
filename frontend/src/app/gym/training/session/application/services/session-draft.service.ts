import { Injectable } from "@angular/core";
import { ExerciseType } from "@gym/library/exercise/domain/models/exercise-type.model";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import {
  SessionExerciseView,
  ExerciseSetView,
} from "../../domain/models/session-detail.model";
import { CreateSessionRequest } from "../../domain/models/session-request.model";

@Injectable({ providedIn: "root" })
export class SessionDraftService {
  clone(list: SessionExerciseView[]): SessionExerciseView[] {
    return list.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
    }));
  }

  fromLibrary(
    list: SessionExerciseView[],
    exercise: Exercise,
  ): SessionExerciseView[] {
    const added: SessionExerciseView = {
      id: this.uid("x"),
      exerciseId: exercise.id,
      exerciseName: exercise.attributes.name,
      muscleGroups: [...exercise.attributes.muscleGroups],
      type: exercise.attributes.type,
      position: list.length + 1,
      sets: [{ id: this.uid("s"), position: 1, reps: 10, weight: null }],
    };
    return [...list, added];
  }

  removeExercise(
    list: SessionExerciseView[],
    exerciseId: string,
  ): SessionExerciseView[] {
    return list.filter((exercise) => exercise.id !== exerciseId);
  }

  toggleMode(
    list: SessionExerciseView[],
    exerciseId: string,
  ): SessionExerciseView[] {
    return list.map((exercise) =>
      exercise.id === exerciseId
        ? { ...exercise, type: this.nextMode(exercise.type) }
        : exercise,
    );
  }

  addSet(
    list: SessionExerciseView[],
    exerciseId: string,
  ): SessionExerciseView[] {
    return list.map((exercise) =>
      exercise.id === exerciseId ? this.withNewSet(exercise) : exercise,
    );
  }

  removeSet(
    list: SessionExerciseView[],
    exerciseId: string,
    setId: string,
  ): SessionExerciseView[] {
    return list.map((exercise) =>
      exercise.id === exerciseId
        ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
        : exercise,
    );
  }

  setReps(
    list: SessionExerciseView[],
    exerciseId: string,
    setId: string,
    reps: number,
  ): SessionExerciseView[] {
    return this.mutateSet(list, exerciseId, setId, (set) => ({ ...set, reps }));
  }

  setWeight(
    list: SessionExerciseView[],
    exerciseId: string,
    setId: string,
    weight: number,
  ): SessionExerciseView[] {
    return this.mutateSet(list, exerciseId, setId, (set) => ({
      ...set,
      weight,
    }));
  }

  toRequest(
    name: string,
    estimatedDurationMinutes: number,
    list: SessionExerciseView[],
  ): CreateSessionRequest {
    return {
      name,
      estimatedDurationMinutes,
      exercises: list.map((exercise, exerciseIndex) => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        muscleGroups: exercise.muscleGroups,
        type: exercise.type,
        position: exerciseIndex + 1,
        sets: exercise.sets.map((set, setIndex) => ({
          position: setIndex + 1,
          reps: set.reps,
          weight: set.weight,
        })),
      })),
    };
  }

  private nextMode(type: string): ExerciseType {
    return type === ExerciseType.Unilateral
      ? ExerciseType.Bilateral
      : ExerciseType.Unilateral;
  }

  private withNewSet(exercise: SessionExerciseView): SessionExerciseView {
    const last = exercise.sets[exercise.sets.length - 1];
    const set: ExerciseSetView = {
      id: this.uid("s"),
      position: exercise.sets.length + 1,
      reps: last ? last.reps : 10,
      weight: last ? last.weight : null,
    };
    return { ...exercise, sets: [...exercise.sets, set] };
  }

  private mutateSet(
    list: SessionExerciseView[],
    exerciseId: string,
    setId: string,
    change: (set: ExerciseSetView) => ExerciseSetView,
  ): SessionExerciseView[] {
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

  private uid(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

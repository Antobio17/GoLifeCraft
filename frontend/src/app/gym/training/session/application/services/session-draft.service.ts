import { Injectable } from "@angular/core";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import { ActiveExercise } from "@gym/training/workout/application/services/active-workout.service";
import {
  SessionExerciseView,
  ExerciseSetView,
} from "../../domain/models/session-detail.model";
import { CreateSessionRequest } from "../../domain/models/session-request.model";
import { SessionExerciseDiff } from "../../domain/models/session-exercise-diff.model";

@Injectable({ providedIn: "root" })
export class SessionDraftService {
  clone(list: SessionExerciseView[]): SessionExerciseView[] {
    return list.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
    }));
  }

  fromActive(list: ActiveExercise[]): SessionExerciseView[] {
    return list.map((exercise, index) => ({
      id: this.uid("x"),
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      muscleGroups: [...exercise.muscleGroups],
      type: exercise.type,
      position: index + 1,
      note: exercise.note,
      sets: exercise.sets.map((set, setIndex) => ({
        id: this.uid("s"),
        position: setIndex + 1,
        reps: set.reps,
        weight: set.weight,
      })),
    }));
  }

  fromLibrary(
    list: SessionExerciseView[],
    exercise: Exercise,
    sessionExerciseId: string = this.uid("x"),
  ): SessionExerciseView[] {
    const added: SessionExerciseView = {
      id: sessionExerciseId,
      exerciseId: exercise.id,
      exerciseName: exercise.attributes.name,
      muscleGroups: [...exercise.attributes.muscleGroups],
      type: exercise.attributes.type,
      position: list.length + 1,
      note: null,
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

  applyOrder(
    list: SessionExerciseView[],
    orderedIds: string[],
  ): SessionExerciseView[] {
    const ordered = orderedIds
      .map((exerciseId) => list.find((exercise) => exercise.id === exerciseId))
      .filter(
        (exercise): exercise is SessionExerciseView => exercise !== undefined,
      );

    if (ordered.length !== list.length) {
      return list;
    }

    return ordered.map((exercise, index) => ({
      ...exercise,
      position: index + 1,
    }));
  }

  originalIndexes(list: SessionExerciseView[], orderedIds: string[]): number[] {
    return orderedIds.map((exerciseId) =>
      list.findIndex((exercise) => exercise.id === exerciseId),
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

  setNote(
    list: SessionExerciseView[],
    exerciseId: string,
    note: string,
  ): SessionExerciseView[] {
    return list.map((exercise) =>
      exercise.id !== exerciseId
        ? exercise
        : {
            ...exercise,
            note: this.toNullableText(note),
          },
    );
  }

  exerciseDiff(
    template: SessionExerciseView[],
    current: SessionExerciseView[],
  ): SessionExerciseDiff {
    const templateIds = this.exerciseIdsOf(template);
    const currentIds = this.exerciseIdsOf(current);

    return {
      added: currentIds.filter((id) => !templateIds.includes(id)).length,
      removed: templateIds.filter((id) => !currentIds.includes(id)).length,
    };
  }

  toRequest(
    name: string,
    estimatedDurationMinutes: number,
    restSeconds: number,
    list: SessionExerciseView[],
  ): CreateSessionRequest {
    return {
      name,
      estimatedDurationMinutes,
      restSeconds,
      exercises: list.map((exercise, exerciseIndex) => ({
        exerciseId: exercise.exerciseId,
        position: exerciseIndex + 1,
        note: exercise.note,
        sets: exercise.sets.map((set, setIndex) => ({
          position: setIndex + 1,
          reps: set.reps,
          weight: set.weight,
        })),
      })),
    };
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

  private toNullableText(note: string): string | null {
    const normalized = note.trim();

    if (normalized === "") {
      return null;
    }

    return normalized;
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

  private exerciseIdsOf(list: SessionExerciseView[]): string[] {
    return list
      .map((exercise) => exercise.exerciseId)
      .filter((exerciseId): exerciseId is string => exerciseId !== null);
  }

  private uid(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

import { Injectable } from "@angular/core";
import { Exercise } from "@gym/library/exercise/domain/models/exercise.model";
import { ExerciseWeightMode } from "@gym/library/exercise/domain/models/exercise-weight-mode.model";
import { ActiveExercise } from "@gym/training/workout/application/services/active-workout.service";
import {
  SessionExerciseView,
  ExerciseSetView,
} from "../../domain/models/session-detail.model";
import { CreateSessionRequest } from "../../domain/models/session-request.model";
import { SessionExerciseDiff } from "../../domain/models/session-exercise-diff.model";
import { Progression } from "../../domain/models/progression.model";
import { ProgressionMode } from "../../domain/models/progression-mode.model";
import { SetKind } from "../../domain/models/set-kind.model";

@Injectable({ providedIn: "root" })
export class SessionDraftService {
  private readonly defaultRepTolerance = 2;

  clone(list: SessionExerciseView[]): SessionExerciseView[] {
    return list.map((exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set) => ({ ...set })),
      progression: this.cloneProgression(exercise.progression),
    }));
  }

  /**
   * El entreno no lleva configuración de progresión, así que se recupera del
   * ejercicio de plantilla que la tenía. Es el espejo de lo que hace el backend
   * al sincronizar.
   */
  fromActive(
    list: ActiveExercise[],
    template: SessionExerciseView[] = [],
  ): SessionExerciseView[] {
    return list.map((exercise, index) => ({
      id: this.uid("x"),
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      muscleGroups: [...exercise.muscleGroups],
      type: exercise.type,
      weightMode: exercise.weightMode,
      position: index + 1,
      note: exercise.note,
      sets: exercise.sets.map((set, setIndex) => ({
        id: this.uid("s"),
        position: setIndex + 1,
        reps: set.reps,
        weight: set.weight,
        kind: set.kind,
      })),
      progression: this.progressionOf(template, exercise.exerciseId),
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
      weightMode: exercise.attributes.weightMode ?? ExerciseWeightMode.Total,
      position: list.length + 1,
      note: null,
      sets: [
        {
          id: this.uid("s"),
          position: 1,
          reps: 10,
          weight: null,
          kind: SetKind.Effective,
        },
      ],
      progression: this.noProgression(),
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

  toggleSetKind(
    list: SessionExerciseView[],
    exerciseId: string,
    setId: string,
  ): SessionExerciseView[] {
    return this.mutateSet(list, exerciseId, setId, (set) => ({
      ...set,
      kind: this.oppositeKind(set.kind),
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

  setProgression(
    list: SessionExerciseView[],
    exerciseId: string,
    progression: Progression,
  ): SessionExerciseView[] {
    return list.map((exercise) =>
      exercise.id !== exerciseId
        ? exercise
        : { ...exercise, progression: this.cloneProgression(progression) },
    );
  }

  toRequest(
    name: string,
    estimatedDurationMinutes: number,
    restSeconds: number,
    progressionEnabled: boolean,
    list: SessionExerciseView[],
  ): CreateSessionRequest {
    return {
      name,
      estimatedDurationMinutes,
      restSeconds,
      progressionEnabled,
      exercises: list.map((exercise, exerciseIndex) => ({
        exerciseId: exercise.exerciseId,
        position: exerciseIndex + 1,
        note: exercise.note,
        sets: exercise.sets.map((set, setIndex) => ({
          position: setIndex + 1,
          reps: set.reps,
          weight: set.weight,
          kind: set.kind,
        })),
        progression: this.cloneProgression(exercise.progression),
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
      kind: last ? last.kind : SetKind.Effective,
    };
    return { ...exercise, sets: [...exercise.sets, set] };
  }

  private oppositeKind(kind: SetKind): SetKind {
    return kind === SetKind.Warmup ? SetKind.Effective : SetKind.Warmup;
  }

  private noProgression(): Progression {
    return {
      mode: ProgressionMode.None,
      repTargets: [],
      repTolerance: this.defaultRepTolerance,
      incrementKg: null,
    };
  }

  private cloneProgression(progression: Progression): Progression {
    return { ...progression, repTargets: [...progression.repTargets] };
  }

  private progressionOf(
    template: SessionExerciseView[],
    exerciseId: string | null,
  ): Progression {
    const match = template.find(
      (exercise) => exerciseId !== null && exercise.exerciseId === exerciseId,
    );

    if (!match) {
      return this.noProgression();
    }

    return this.cloneProgression(match.progression);
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

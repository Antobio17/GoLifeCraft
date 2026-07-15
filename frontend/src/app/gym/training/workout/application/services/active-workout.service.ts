import { Injectable, OnDestroy, computed, inject, signal } from "@angular/core";
import { Observable, Subject, Subscription, interval, of, tap } from "rxjs";
import { debounceTime, map, shareReplay, switchMap } from "rxjs/operators";
import { WorkoutSessionPort } from "../../domain/ports/workout-session.port";
import { WorkoutDetail } from "../../domain/models/workout-detail.model";
import {
  WorkoutExerciseRequest,
  WorkoutProgressRequest,
} from "../../domain/models/workout-request.model";

export interface ActiveExerciseSet {
  reps: number;
  weight: number | null;
}

export interface ActiveExercise {
  exerciseId: string | null;
  exerciseName: string;
  muscleGroups: string[];
  type: string;
  note: string | null;
  sets: ActiveExerciseSet[];
}

@Injectable()
export class ActiveWorkoutService implements OnDestroy {
  private port = inject(WorkoutSessionPort);

  readonly workoutId = signal<string | null>(null);
  readonly activeSessionId = signal<string | null>(null);
  readonly activeName = signal("");
  readonly paused = signal(false);

  private readonly baseSeconds = signal(0);
  private readonly startedAtMs = signal(0);
  private readonly nowMs = signal(Date.now());
  private readonly doneKeys = signal<Set<string>>(new Set());

  readonly liveExercises = signal<ActiveExercise[]>([]);

  private ticker?: Subscription;
  private readonly progress$ = new Subject<ActiveExercise[]>();
  private progressSub?: Subscription;
  private restore$?: Observable<void>;

  readonly isActive = computed(() => this.workoutId() !== null);

  readonly elapsedSeconds = computed(() => {
    if (this.paused()) {
      return this.baseSeconds();
    }
    const running = Math.floor((this.nowMs() - this.startedAtMs()) / 1000);
    return this.baseSeconds() + Math.max(0, running);
  });

  readonly elapsedLabel = computed(() =>
    this.formatElapsed(this.elapsedSeconds()),
  );

  isActiveFor(sessionId: string): boolean {
    return this.isActive() && this.activeSessionId() === sessionId;
  }

  private doneKey(exerciseIndex: number, setIndex: number): string {
    return `${exerciseIndex}:${setIndex}`;
  }

  isDone(exerciseIndex: number, setIndex: number): boolean {
    return this.doneKeys().has(this.doneKey(exerciseIndex, setIndex));
  }

  doneCount(exercises: ActiveExercise[]): number {
    let count = 0;
    exercises.forEach((exercise, i) =>
      exercise.sets.forEach((_, j) => {
        if (this.isDone(i, j)) {
          count += 1;
        }
      }),
    );
    return count;
  }

  totalSets(exercises: ActiveExercise[]): number {
    return exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
  }

  toggleDone(
    exerciseIndex: number,
    setIndex: number,
    exercises: ActiveExercise[],
  ): void {
    const key = this.doneKey(exerciseIndex, setIndex);
    const next = new Set(this.doneKeys());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this.doneKeys.set(next);
    this.queueProgress(exercises);
  }

  start(
    sessionId: string,
    sessionName: string,
    exercises: ActiveExercise[],
  ): Observable<void> {
    const workoutId = crypto.randomUUID();

    return this.port
      .start({
        workoutId,
        sessionId,
        sessionName,
        exercises: this.buildExercises(exercises),
      })
      .pipe(
        tap(() => {
          this.workoutId.set(workoutId);
          this.activeSessionId.set(sessionId);
          this.activeName.set(sessionName);
          this.liveExercises.set(exercises);
          this.doneKeys.set(new Set());
          this.baseSeconds.set(0);
          this.startedAtMs.set(Date.now());
          this.paused.set(false);
          this.restore$ = undefined;
          this.startTicker();
          this.startProgressPipe();
        }),
      );
  }

  pause(exercises: ActiveExercise[]): void {
    if (this.paused()) {
      this.startedAtMs.set(Date.now());
      this.paused.set(false);
      this.startTicker();
      this.queueProgress(exercises);
      return;
    }

    this.baseSeconds.set(this.elapsedSeconds());
    this.paused.set(true);
    this.stopTicker();
    this.queueProgress(exercises);
  }

  finish(exercises: ActiveExercise[]): Observable<void> {
    const workoutId = this.workoutId();
    if (!workoutId) {
      throw new Error("No active workout to finish.");
    }

    this.stopTicker();

    return this.port
      .finish(workoutId, this.buildProgress(exercises))
      .pipe(tap(() => this.reset()));
  }

  discard(): Observable<void> {
    const workoutId = this.workoutId();
    if (!workoutId) {
      throw new Error("No active workout to discard.");
    }

    this.stopTicker();

    return this.port.discard(workoutId).pipe(tap(() => this.reset()));
  }

  ensureRestored(): Observable<void> {
    if (this.isActive()) {
      return of(undefined);
    }

    if (!this.restore$) {
      this.restore$ = this.port.getActive().pipe(
        tap((active) => {
          if (active) {
            this.hydrate(active);
          }
        }),
        map(() => undefined),
        shareReplay(1),
      );
    }

    return this.restore$;
  }

  private hydrate(active: WorkoutDetail): void {
    const doneKeys = new Set<string>();
    active.attributes.exercises.forEach((exercise, i) =>
      exercise.sets.forEach((set, j) => {
        if (set.done) {
          doneKeys.add(this.doneKey(i, j));
        }
      }),
    );

    this.workoutId.set(active.id);
    this.activeSessionId.set(active.attributes.sessionId);
    this.activeName.set(active.attributes.sessionName);
    this.liveExercises.set(this.fromDetail(active));
    this.doneKeys.set(doneKeys);
    this.baseSeconds.set(0);
    this.startedAtMs.set(new Date(active.attributes.startedAt).getTime());
    this.paused.set(false);
    this.startTicker();
    this.startProgressPipe();
  }

  private fromDetail(active: WorkoutDetail): ActiveExercise[] {
    return active.attributes.exercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      muscleGroups: [...exercise.muscleGroups],
      type: exercise.type,
      note: exercise.note,
      sets: exercise.sets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
      })),
    }));
  }

  syncProgress(exercises: ActiveExercise[]): void {
    if (!this.isActive()) {
      return;
    }
    this.queueProgress(exercises);
  }

  private queueProgress(exercises: ActiveExercise[]): void {
    this.liveExercises.set(exercises);
    this.progress$.next(exercises);
  }

  private startProgressPipe(): void {
    if (this.progressSub) {
      return;
    }

    this.progressSub = this.progress$
      .pipe(
        debounceTime(600),
        switchMap((exercises) => {
          const workoutId = this.workoutId();
          if (!workoutId) {
            return [];
          }
          return this.port.updateProgress(
            workoutId,
            this.buildProgress(exercises),
          );
        }),
      )
      .subscribe();
  }

  private startTicker(): void {
    this.stopTicker();
    this.nowMs.set(Date.now());
    this.ticker = interval(1000).subscribe(() => this.nowMs.set(Date.now()));
  }

  private stopTicker(): void {
    this.ticker?.unsubscribe();
    this.ticker = undefined;
  }

  private reset(): void {
    this.stopTicker();
    this.progressSub?.unsubscribe();
    this.progressSub = undefined;
    this.workoutId.set(null);
    this.activeSessionId.set(null);
    this.activeName.set("");
    this.liveExercises.set([]);
    this.paused.set(false);
    this.baseSeconds.set(0);
    this.startedAtMs.set(0);
    this.doneKeys.set(new Set());
    this.restore$ = undefined;
  }

  private buildProgress(exercises: ActiveExercise[]): WorkoutProgressRequest {
    return {
      exercises: this.buildExercises(exercises),
      durationSeconds: this.elapsedSeconds(),
    };
  }

  private buildExercises(
    exercises: ActiveExercise[],
  ): WorkoutExerciseRequest[] {
    return exercises.map((exercise, i) => ({
      exerciseId: exercise.exerciseId,
      position: i + 1,
      note: exercise.note,
      sets: exercise.sets.map((set, j) => ({
        position: j + 1,
        reps: set.reps,
        weight: set.weight,
        done: this.isDone(i, j),
      })),
    }));
  }

  ngOnDestroy(): void {
    this.stopTicker();
    this.progressSub?.unsubscribe();
    this.progressSub = undefined;
  }

  private formatElapsed(totalSeconds: number): string {
    const seconds = Math.max(0, totalSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (value: number): string => String(value).padStart(2, "0");

    if (hours > 0) {
      return `${hours}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  }
}

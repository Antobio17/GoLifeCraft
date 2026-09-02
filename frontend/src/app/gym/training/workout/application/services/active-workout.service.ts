import { Injectable, OnDestroy, computed, inject, signal } from "@angular/core";
import {
  Observable,
  Subject,
  Subscription,
  interval,
  of,
  tap,
  throwError,
} from "rxjs";
import {
  catchError,
  debounceTime,
  map,
  shareReplay,
  switchMap,
} from "rxjs/operators";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ImpersonationService } from "@shared/auth/application/services/impersonation.service";
import { WorkoutSessionPort } from "../../domain/ports/workout-session.port";
import { WorkoutDetail } from "../../domain/models/workout-detail.model";
import {
  WorkoutExerciseRequest,
  WorkoutProgressRequest,
} from "../../domain/models/workout-request.model";
import { TemplateSyncMode } from "../../domain/models/template-sync-mode.model";
import { uuidV4 } from "@shared/uuid/uuid";

const DEFAULT_REST_SECONDS = 180;

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
  private authSessionService = inject(AuthSessionService);
  private impersonationService = inject(ImpersonationService);

  readonly workoutId = signal<string | null>(null);
  readonly activeSessionId = signal<string | null>(null);
  readonly activeName = signal("");
  readonly paused = signal(false);
  readonly restTargetSeconds = signal(DEFAULT_REST_SECONDS);

  private readonly baseSeconds = signal(0);
  private readonly startedAtMs = signal(0);
  private readonly nowMs = signal(Date.now());
  private readonly doneKeys = signal<Set<string>>(new Set());
  private readonly restStartedAtMs = signal<number | null>(null);
  private readonly restFrozenSeconds = signal(0);
  private readonly hydratedIdentity = signal<string | null>(null);

  readonly liveExercises = signal<ActiveExercise[]>([]);

  private ticker?: Subscription;
  private readonly progress$ = new Subject<ActiveExercise[]>();
  private progressSub?: Subscription;
  private restore$?: Observable<void>;

  private readonly identity = computed<string | null>(() => {
    const impersonated = this.impersonationService.impersonation();

    if (impersonated) {
      return `impersonation:${impersonated.userId}`;
    }

    const session = this.authSessionService.session();

    if (!session) {
      return null;
    }

    return `user:${session.email}`;
  });

  readonly isActive = computed(
    () =>
      this.workoutId() !== null && this.identity() === this.hydratedIdentity(),
  );

  readonly isFree = computed(
    () => this.isActive() && this.activeSessionId() === null,
  );

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

  readonly restSeconds = computed<number | null>(() => {
    const startedAtMs = this.restStartedAtMs();
    if (startedAtMs === null) {
      return null;
    }

    if (this.paused()) {
      return this.restFrozenSeconds();
    }

    return Math.max(0, Math.floor((this.nowMs() - startedAtMs) / 1000));
  });

  readonly restRunning = computed(() => this.restSeconds() !== null);

  readonly restLabel = computed(() =>
    this.formatElapsed(this.restSeconds() ?? 0),
  );

  readonly restOverTarget = computed(() => {
    const seconds = this.restSeconds();
    const target = this.restTargetSeconds();

    return seconds !== null && target > 0 && seconds >= target;
  });

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
      this.restartRest();
    }
    this.doneKeys.set(next);
    this.queueProgress(exercises);
  }

  reorderExercises(
    originalIndexes: number[],
    exercises: ActiveExercise[],
  ): void {
    if (!this.isActive()) {
      return;
    }

    this.remapDoneKeys(originalIndexes);
    this.queueProgress(exercises);
  }

  /**
   * Las series hechas se guardan por índice de ejercicio, así que al recolocar la lista
   * hay que moverlas con ella o los checks se quedan en el ejercicio equivocado.
   */
  private remapDoneKeys(originalIndexes: number[]): void {
    const movedTo = new Map<number, number>();
    originalIndexes.forEach((originalIndex, index) =>
      movedTo.set(originalIndex, index),
    );

    const next = new Set<string>();

    this.doneKeys().forEach((key) => {
      const [exerciseIndex, setIndex] = key.split(":").map(Number);
      const moved = movedTo.get(exerciseIndex);

      if (undefined === moved) {
        return;
      }

      next.add(this.doneKey(moved, setIndex));
    });

    this.doneKeys.set(next);
  }

  start(
    sessionId: string | null,
    sessionName: string,
    exercises: ActiveExercise[],
  ): Observable<void> {
    const workoutId = uuidV4();

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
          this.hydratedIdentity.set(this.identity());
          this.activeSessionId.set(sessionId);
          this.activeName.set(sessionName);
          this.liveExercises.set(exercises);
          this.doneKeys.set(new Set());
          this.stopRest();
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
      this.resumeRest();
      this.paused.set(false);
      this.startTicker();
      this.queueProgress(exercises);
      return;
    }

    this.baseSeconds.set(this.elapsedSeconds());
    this.freezeRest();
    this.paused.set(true);
    this.stopTicker();
    this.queueProgress(exercises);
  }

  rename(name: string, exercises: ActiveExercise[]): void {
    if (!this.isActive()) {
      return;
    }

    this.activeName.set(name);
    this.queueProgress(exercises);
  }

  finish(
    exercises: ActiveExercise[],
    templateSyncMode: TemplateSyncMode,
    sessionId: string | null = null,
  ): Observable<void> {
    const workoutId = this.workoutId();
    if (!workoutId) {
      throw new Error("No active workout to finish.");
    }

    this.stopTicker();

    return this.port
      .finish(workoutId, {
        ...this.buildProgress(exercises),
        templateSyncMode,
        sessionId,
      })
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
    this.dropForeignWorkout();

    if (this.isActive()) {
      return of(undefined);
    }

    if (this.restore$) {
      return this.restore$;
    }

    const request$: Observable<void> = this.port.getActive().pipe(
      tap((active) => {
        if (active) {
          this.hydrate(active);
        }
      }),
      map(() => undefined),
      catchError((error) => {
        this.invalidateRestore(request$);

        return throwError(() => error);
      }),
      shareReplay(1),
    );

    this.restore$ = request$;

    return request$;
  }

  private dropForeignWorkout(): void {
    if (this.identity() === this.hydratedIdentity()) {
      return;
    }

    this.reset();
    this.restore$ = undefined;
  }

  private invalidateRestore(request$: Observable<void>): void {
    if (this.restore$ !== request$) {
      return;
    }

    this.restore$ = undefined;
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
    this.hydratedIdentity.set(this.identity());
    this.activeSessionId.set(active.attributes.sessionId);
    this.activeName.set(active.attributes.sessionName);
    this.liveExercises.set(this.fromDetail(active));
    this.doneKeys.set(doneKeys);
    this.restoreRest(active.attributes.restStartedAt);
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
    this.hydratedIdentity.set(this.identity());
    this.activeSessionId.set(null);
    this.activeName.set("");
    this.liveExercises.set([]);
    this.paused.set(false);
    this.baseSeconds.set(0);
    this.startedAtMs.set(0);
    this.doneKeys.set(new Set());
    this.stopRest();
    this.restTargetSeconds.set(DEFAULT_REST_SECONDS);
    this.restore$ = of(undefined);
  }

  private restartRest(): void {
    this.restFrozenSeconds.set(0);
    this.restStartedAtMs.set(Date.now());
    this.nowMs.set(Date.now());
  }

  private restoreRest(restStartedAt: string | null): void {
    if (null === restStartedAt) {
      this.stopRest();
      return;
    }

    this.restFrozenSeconds.set(0);
    this.restStartedAtMs.set(new Date(restStartedAt).getTime());
  }

  private stopRest(): void {
    this.restStartedAtMs.set(null);
    this.restFrozenSeconds.set(0);
  }

  private freezeRest(): void {
    if (this.restStartedAtMs() === null) {
      return;
    }

    this.restFrozenSeconds.set(this.restSeconds() ?? 0);
  }

  private resumeRest(): void {
    if (this.restStartedAtMs() === null) {
      return;
    }

    this.restStartedAtMs.set(Date.now() - this.restFrozenSeconds() * 1000);
  }

  private buildProgress(exercises: ActiveExercise[]): WorkoutProgressRequest {
    return {
      exercises: this.buildExercises(exercises),
      durationSeconds: this.elapsedSeconds(),
      sessionName: this.activeName(),
      restStartedAt: this.restStartedAtIso(),
    };
  }

  private restStartedAtIso(): string | null {
    const startedAtMs = this.restStartedAtMs();

    if (null === startedAtMs) {
      return null;
    }

    return new Date(startedAtMs).toISOString();
  }

  private buildExercises(
    exercises: ActiveExercise[],
  ): WorkoutExerciseRequest[] {
    return exercises.map((exercise, i) => ({
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      type: exercise.type,
      muscleGroups: [...exercise.muscleGroups],
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

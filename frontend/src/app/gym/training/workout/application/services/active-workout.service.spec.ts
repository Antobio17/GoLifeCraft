import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Observable, of, throwError } from "rxjs";
import { AuthSession } from "@shared/auth/domain/models/auth-session.model";
import { Impersonation } from "@shared/auth/domain/models/impersonation.model";
import { AuthSessionService } from "@shared/auth/application/services/auth-session.service";
import { ImpersonationService } from "@shared/auth/application/services/impersonation.service";
import { WorkoutSessionPort } from "../../domain/ports/workout-session.port";
import { WorkoutDetail } from "../../domain/models/workout-detail.model";
import { WorkoutProgressRequest } from "../../domain/models/workout-request.model";
import { TemplateSyncMode } from "../../domain/models/template-sync-mode.model";
import { ActiveExercise, ActiveWorkoutService } from "./active-workout.service";

class StubWorkoutSessionPort extends WorkoutSessionPort {
  active: WorkoutDetail | null = null;
  failNextGetActive = false;
  getActiveCalls = 0;
  readonly savedProgress: WorkoutProgressRequest[] = [];

  start(): Observable<void> {
    return of(void 0);
  }

  updateProgress(
    workoutId: string,
    request: WorkoutProgressRequest,
  ): Observable<void> {
    this.savedProgress.push(request);
    return of(void 0);
  }

  finish(): Observable<void> {
    return of(void 0);
  }

  discard(): Observable<void> {
    return of(void 0);
  }

  getActive(): Observable<WorkoutDetail | null> {
    this.getActiveCalls += 1;

    if (this.failNextGetActive) {
      this.failNextGetActive = false;
      return throwError(() => new Error("network down"));
    }

    return of(this.active);
  }
}

function sessionOf(email: string): AuthSession {
  return {
    token: "token",
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    tokenType: "Bearer",
    user: { username: email, email },
    email,
  };
}

class StubAuthSessionService {
  readonly sessionSignal = signal<AuthSession | null>(
    sessionOf("owner@golifecraft.test"),
  );
  readonly session = this.sessionSignal.asReadonly();
}

class StubImpersonationService {
  readonly impersonationSignal = signal<Impersonation | null>(null);
  readonly impersonation = this.impersonationSignal.asReadonly();
}

function authProviders(
  authSession: StubAuthSessionService,
  impersonation: StubImpersonationService,
) {
  return [
    {
      provide: AuthSessionService,
      useValue: authSession as unknown as AuthSessionService,
    },
    {
      provide: ImpersonationService,
      useValue: impersonation as unknown as ImpersonationService,
    },
  ];
}

describe("ActiveWorkoutService rest timer", () => {
  let service: ActiveWorkoutService;
  let port: StubWorkoutSessionPort;

  const exercises: ActiveExercise[] = [
    {
      exerciseId: "exercise-1",
      exerciseName: "Press banca",
      muscleGroups: ["Pecho"],
      type: "bilateral",
      note: null,
      sets: [
        { reps: 10, weight: 40 },
        { reps: 8, weight: 45 },
      ],
    },
  ];

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 0, 1, 8, 0, 0));

    TestBed.configureTestingModule({
      providers: [
        ActiveWorkoutService,
        { provide: WorkoutSessionPort, useClass: StubWorkoutSessionPort },
        ...authProviders(
          new StubAuthSessionService(),
          new StubImpersonationService(),
        ),
      ],
    });

    service = TestBed.inject(ActiveWorkoutService);
    port = TestBed.inject(WorkoutSessionPort) as StubWorkoutSessionPort;
  });

  afterEach(() => {
    service.ngOnDestroy();
    jasmine.clock().uninstall();
  });

  function tick(milliseconds: number): void {
    jasmine.clock().tick(milliseconds);
  }

  function startWorkout(): void {
    service.start("session-1", "Empuje A", exercises).subscribe();
  }

  function activeWorkout(restStartedAt: string | null): WorkoutDetail {
    return {
      id: "workout-1",
      type: "Workout",
      attributes: {
        sessionId: "session-1",
        sessionName: "Empuje A",
        status: "in_progress",
        startedAt: new Date(Date.now() - 600000).toISOString(),
        finishedAt: null,
        durationSeconds: 600,
        restStartedAt,
        exercises: [],
      },
    };
  }

  it("stays hidden until a set is marked as done", () => {
    startWorkout();
    tick(1000);

    expect(service.restRunning()).toBeFalse();

    service.toggleDone(0, 0, exercises);
    tick(1000);

    expect(service.restRunning()).toBeTrue();
    expect(service.restLabel()).toBe("00:01");
  });

  it("restarts the count on every set marked as done", () => {
    startWorkout();
    service.toggleDone(0, 0, exercises);
    tick(5000);

    expect(service.restSeconds()).toBe(5);

    service.toggleDone(0, 1, exercises);
    tick(1000);

    expect(service.restSeconds()).toBe(1);
  });

  it("keeps counting when a set is unmarked", () => {
    startWorkout();
    service.toggleDone(0, 0, exercises);
    tick(3000);

    service.toggleDone(0, 0, exercises);
    tick(1000);

    expect(service.restSeconds()).toBe(4);
  });

  it("flags the rest as over the configured target", () => {
    service.restTargetSeconds.set(3);
    startWorkout();
    service.toggleDone(0, 0, exercises);
    tick(2000);

    expect(service.restOverTarget()).toBeFalse();

    tick(1000);

    expect(service.restOverTarget()).toBeTrue();
  });

  it("does not add the paused time to the rest", () => {
    startWorkout();
    service.toggleDone(0, 0, exercises);
    tick(2000);

    service.pause(exercises);
    tick(10000);

    expect(service.restSeconds()).toBe(2);

    service.pause(exercises);
    tick(1000);

    expect(service.restSeconds()).toBe(3);
  });

  it("saves the moment the rest started along with the progress", () => {
    startWorkout();
    const restStartedAt = new Date().toISOString();

    service.toggleDone(0, 0, exercises);
    tick(1000);

    expect(port.savedProgress.length).toBe(1);
    expect(port.savedProgress[0].restStartedAt).toBe(restStartedAt);
  });

  it("restores the rest already running when the workout is recovered", () => {
    port.active = activeWorkout(new Date(Date.now() - 30000).toISOString());

    service.ensureRestored().subscribe();

    expect(service.restRunning()).toBeTrue();
    expect(service.restSeconds()).toBe(30);
  });

  it("keeps the rest hidden when the recovered workout had none running", () => {
    port.active = activeWorkout(null);

    service.ensureRestored().subscribe();

    expect(service.restRunning()).toBeFalse();
  });
});

describe("ActiveWorkoutService restoration cache", () => {
  let service: ActiveWorkoutService;
  let port: StubWorkoutSessionPort;
  let impersonation: StubImpersonationService;
  let authSession: StubAuthSessionService;

  beforeEach(() => {
    authSession = new StubAuthSessionService();
    impersonation = new StubImpersonationService();

    TestBed.configureTestingModule({
      providers: [
        ActiveWorkoutService,
        { provide: WorkoutSessionPort, useClass: StubWorkoutSessionPort },
        ...authProviders(authSession, impersonation),
      ],
    });

    service = TestBed.inject(ActiveWorkoutService);
    port = TestBed.inject(WorkoutSessionPort) as StubWorkoutSessionPort;
  });

  afterEach(() => service.ngOnDestroy());

  function inProgressWorkout(id: string): WorkoutDetail {
    return {
      id,
      type: "Workout",
      attributes: {
        sessionId: "session-1",
        sessionName: "Empuje A",
        status: "in_progress",
        startedAt: new Date().toISOString(),
        finishedAt: null,
        durationSeconds: 0,
        restStartedAt: null,
        exercises: [],
      },
    };
  }

  it("asks the server only once no matter how many pages check it", () => {
    service.ensureRestored().subscribe();
    service.ensureRestored().subscribe();
    service.ensureRestored().subscribe();

    expect(port.getActiveCalls).toBe(1);
  });

  it("asks again after a failed check instead of caching the failure", () => {
    port.failNextGetActive = true;
    port.active = inProgressWorkout("workout-1");

    service.ensureRestored().subscribe({ error: () => undefined });

    expect(port.getActiveCalls).toBe(1);
    expect(service.isActive()).toBeFalse();

    service.ensureRestored().subscribe();

    expect(port.getActiveCalls).toBe(2);
    expect(service.isActive()).toBeTrue();
  });

  it("does not ask again after finishing the workout", () => {
    service.start("session-1", "Empuje A", []).subscribe();
    service.finish([], TemplateSyncMode.None).subscribe();

    service.ensureRestored().subscribe();

    expect(port.getActiveCalls).toBe(0);
    expect(service.isActive()).toBeFalse();
  });

  it("drops the restored workout when the identity changes", () => {
    port.active = inProgressWorkout("workout-1");
    service.ensureRestored().subscribe();

    expect(service.isActive()).toBeTrue();

    impersonation.impersonationSignal.set({
      userId: "other-user",
      email: "other@golifecraft.test",
      name: "Other",
      tenantId: "tenant-2",
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(service.isActive()).toBeFalse();

    port.active = null;
    service.ensureRestored().subscribe();

    expect(port.getActiveCalls).toBe(2);
    expect(service.isActive()).toBeFalse();
  });

  it("checks again for the next user after logging out", () => {
    service.ensureRestored().subscribe();
    authSession.sessionSignal.set(null);
    authSession.sessionSignal.set(sessionOf("next@golifecraft.test"));

    port.active = inProgressWorkout("workout-2");
    service.ensureRestored().subscribe();

    expect(port.getActiveCalls).toBe(2);
    expect(service.workoutId()).toBe("workout-2");
  });
});

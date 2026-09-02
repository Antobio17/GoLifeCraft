import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import { WorkoutSessionPort } from "../../domain/ports/workout-session.port";
import { WorkoutDetail } from "../../domain/models/workout-detail.model";
import { WorkoutProgressRequest } from "../../domain/models/workout-request.model";
import { ActiveExercise, ActiveWorkoutService } from "./active-workout.service";

class StubWorkoutSessionPort extends WorkoutSessionPort {
  active: WorkoutDetail | null = null;
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
    return of(this.active);
  }
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

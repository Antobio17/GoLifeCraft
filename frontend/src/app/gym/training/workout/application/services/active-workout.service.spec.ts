import { TestBed } from "@angular/core/testing";
import { Observable, of } from "rxjs";
import { WorkoutSessionPort } from "../../domain/ports/workout-session.port";
import { WorkoutDetail } from "../../domain/models/workout-detail.model";
import { ActiveExercise, ActiveWorkoutService } from "./active-workout.service";

class StubWorkoutSessionPort extends WorkoutSessionPort {
  start(): Observable<void> {
    return of(void 0);
  }

  updateProgress(): Observable<void> {
    return of(void 0);
  }

  finish(): Observable<void> {
    return of(void 0);
  }

  discard(): Observable<void> {
    return of(void 0);
  }

  getActive(): Observable<WorkoutDetail | null> {
    return of(null);
  }
}

describe("ActiveWorkoutService rest timer", () => {
  let service: ActiveWorkoutService;

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
});

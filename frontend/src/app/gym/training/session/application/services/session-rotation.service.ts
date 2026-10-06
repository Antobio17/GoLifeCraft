import { Injectable } from "@angular/core";
import { Session } from "../../domain/models/session.model";
import { Workout } from "@gym/training/workout/domain/models/workout.model";

@Injectable({ providedIn: "root" })
export class SessionRotationService {
  sessionForToday(
    sessions: Session[],
    workouts: Workout[],
    lastWorkouts: Map<string, Workout>,
    today: Date = new Date(),
  ): Session | null {
    return (
      this.lastSessionOnWeekday(sessions, workouts, today.getDay()) ??
      this.nextSession(sessions, lastWorkouts)
    );
  }

  lastWorkoutBySession(workouts: Workout[]): Map<string, Workout> {
    const latest = new Map<string, Workout>();

    for (const workout of workouts) {
      const sessionId = workout.attributes.sessionId;

      if (!sessionId) {
        continue;
      }

      const current = latest.get(sessionId);

      if (
        current &&
        current.attributes.startedAt >= workout.attributes.startedAt
      ) {
        continue;
      }

      latest.set(sessionId, workout);
    }

    return latest;
  }

  nextSession(
    sessions: Session[],
    lastWorkouts: Map<string, Workout>,
  ): Session | null {
    const trained = sessions.filter((session) => lastWorkouts.has(session.id));

    if (trained.length === 0) {
      return sessions[0] ?? null;
    }

    return trained.reduce((oldest, session) =>
      this.lastStartedAt(session, lastWorkouts) <
      this.lastStartedAt(oldest, lastWorkouts)
        ? session
        : oldest,
    );
  }

  private lastStartedAt(
    session: Session,
    lastWorkouts: Map<string, Workout>,
  ): string {
    return lastWorkouts.get(session.id)?.attributes.startedAt ?? "";
  }

  private lastSessionOnWeekday(
    sessions: Session[],
    workouts: Workout[],
    weekday: number,
  ): Session | null {
    const knownIds = new Set(sessions.map((session) => session.id));
    const latest = workouts
      .filter(
        (workout) =>
          workout.attributes.sessionId !== null &&
          knownIds.has(workout.attributes.sessionId) &&
          this.startedAt(workout).getDay() === weekday,
      )
      .reduce<Workout | null>(
        (best, workout) =>
          !best || workout.attributes.startedAt > best.attributes.startedAt
            ? workout
            : best,
        null,
      );

    if (!latest) {
      return null;
    }

    return (
      sessions.find((session) => session.id === latest.attributes.sessionId) ??
      null
    );
  }

  private startedAt(workout: Workout): Date {
    return new Date(workout.attributes.startedAt.replace(" ", "T"));
  }
}

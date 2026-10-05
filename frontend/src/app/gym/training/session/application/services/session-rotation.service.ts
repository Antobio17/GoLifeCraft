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
      this.usualSessionOnWeekday(sessions, workouts, today.getDay()) ??
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

  private usualSessionOnWeekday(
    sessions: Session[],
    workouts: Workout[],
    weekday: number,
  ): Session | null {
    const tally = new Map<string, { count: number; lastStartedAt: string }>();

    for (const workout of workouts) {
      const sessionId = workout.attributes.sessionId;

      if (!sessionId || this.startedAt(workout).getDay() !== weekday) {
        continue;
      }

      const entry = tally.get(sessionId) ?? { count: 0, lastStartedAt: "" };
      tally.set(sessionId, {
        count: entry.count + 1,
        lastStartedAt:
          workout.attributes.startedAt > entry.lastStartedAt
            ? workout.attributes.startedAt
            : entry.lastStartedAt,
      });
    }

    const candidates = sessions.filter((session) => tally.has(session.id));

    if (candidates.length === 0) {
      return null;
    }

    return candidates.reduce((best, session) =>
      this.beats(tally.get(session.id)!, tally.get(best.id)!) ? session : best,
    );
  }

  private beats(
    candidate: { count: number; lastStartedAt: string },
    current: { count: number; lastStartedAt: string },
  ): boolean {
    if (candidate.count !== current.count) {
      return candidate.count > current.count;
    }

    return candidate.lastStartedAt > current.lastStartedAt;
  }

  private startedAt(workout: Workout): Date {
    return new Date(workout.attributes.startedAt.replace(" ", "T"));
  }
}

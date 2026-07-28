import { Injectable } from "@angular/core";
import { SessionProgressMetric } from "../../domain/models/session-progress-metric.model";
import { SessionProgressRange } from "../../domain/models/session-progress-range.model";
import { SessionWorkoutStats } from "../../domain/models/session-stats.model";

@Injectable({ providedIn: "root" })
export class SessionProgressService {
  visibleWorkouts(
    workouts: SessionWorkoutStats[],
    range: SessionProgressRange,
  ): SessionWorkoutStats[] {
    return this.withinRange(workouts, range);
  }

  valuesOf(
    workouts: SessionWorkoutStats[],
    metric: SessionProgressMetric,
  ): number[] {
    return workouts.map((workout) => this.valueOf(workout, metric));
  }

  valueOf(workout: SessionWorkoutStats, metric: SessionProgressMetric): number {
    if (metric === SessionProgressMetric.Reps) {
      return workout.reps;
    }
    if (metric === SessionProgressMetric.Duration) {
      return workout.durationSeconds;
    }
    return workout.volumeKg;
  }

  formatValue(value: number, metric: SessionProgressMetric): string {
    if (metric === SessionProgressMetric.Reps) {
      return `${Math.round(value)} reps`;
    }
    if (metric === SessionProgressMetric.Duration) {
      return this.durationText(value);
    }
    return `${Math.round(value)} kg`;
  }

  formatPoint(value: number, metric: SessionProgressMetric): string {
    if (metric === SessionProgressMetric.Duration) {
      return `${Math.round(value / 60)}`;
    }
    return `${Math.round(value)}`;
  }

  deltaPercent(values: number[]): number | null {
    if (values.length < 2 || values[0] <= 0) {
      return null;
    }
    return Math.round(
      ((values[values.length - 1] - values[0]) / values[0]) * 100,
    );
  }

  formatDate(value: string): string {
    return new Date(value.replace(" ", "T")).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  }

  private withinRange(
    workouts: SessionWorkoutStats[],
    range: SessionProgressRange,
  ): SessionWorkoutStats[] {
    if (range === SessionProgressRange.All) {
      return workouts;
    }

    const limit = new Date();
    limit.setMonth(limit.getMonth() - Number(range));

    return workouts.filter(
      (workout) => new Date(workout.date.replace(" ", "T")) >= limit,
    );
  }

  private durationText(totalSeconds: number): string {
    const seconds = Math.max(0, Math.round(totalSeconds));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }
}

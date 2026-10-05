import { Injectable, inject } from "@angular/core";
import { TrainingCalendarService } from "@gym/analytics/stats/application/services/training-calendar.service";
import { Workout } from "../../domain/models/workout.model";
import { WorkoutWeekGroup } from "../../domain/models/workout-week-group.model";

@Injectable({ providedIn: "root" })
export class WorkoutWeekGroupingService {
  private calendar = inject(TrainingCalendarService);

  group(workouts: Workout[]): WorkoutWeekGroup[] {
    const groups = new Map<string, WorkoutWeekGroup>();

    for (const workout of workouts) {
      const weekStart = this.calendar.weekStart(
        this.startedAt(workout.attributes.startedAt),
      );
      const key = weekStart.toDateString();
      const group = groups.get(key) ?? { key, weekStart, workouts: [] };

      group.workouts.push(workout);
      groups.set(key, group);
    }

    return [...groups.values()];
  }

  weeksAgo(weekStart: Date, today: Date = new Date()): number {
    const currentWeek = this.calendar.weekStart(today);

    return Math.round(this.calendar.daysBetween(weekStart, currentWeek) / 7);
  }

  startedAt(value: string): Date {
    return new Date(value.replace(" ", "T"));
  }
}

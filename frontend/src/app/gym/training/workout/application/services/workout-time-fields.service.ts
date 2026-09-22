import { Injectable } from "@angular/core";
import { WorkoutTimeFields } from "../../domain/models/workout-time-fields.model";

@Injectable({ providedIn: "root" })
export class WorkoutTimeFieldsService {
  static readonly MAX_DURATION_SECONDS = 86400;

  fromWorkout(startedAt: string, durationSeconds: number): WorkoutTimeFields {
    const start = new Date(startedAt);
    const total = Math.max(0, Math.floor(durationSeconds));

    return {
      date: this.dateOf(start),
      time: `${this.pad(start.getHours())}:${this.pad(start.getMinutes())}`,
      hours: Math.floor(total / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
  }

  startedAt(fields: WorkoutTimeFields): Date | null {
    if (!fields.date || !fields.time) {
      return null;
    }

    const start = new Date(`${fields.date}T${fields.time}`);
    if (Number.isNaN(start.getTime())) {
      return null;
    }

    return start;
  }

  durationSeconds(fields: WorkoutTimeFields): number {
    return fields.hours * 3600 + fields.minutes * 60 + fields.seconds;
  }

  isValidDuration(seconds: number): boolean {
    return (
      seconds >= 0 && seconds <= WorkoutTimeFieldsService.MAX_DURATION_SECONDS
    );
  }

  today(now: Date = new Date()): string {
    return this.dateOf(now);
  }

  private dateOf(date: Date): string {
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
  }

  private pad(value: number): string {
    return String(value).padStart(2, "0");
  }
}

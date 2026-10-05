export interface CalendarDay {
  iso: string;
  date: Date;
  workouts: number;
  volumeKg: number;
  minutes: number;
  level: number;
  isToday: boolean;
}

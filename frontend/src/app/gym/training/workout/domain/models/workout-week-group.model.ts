import { Workout } from "./workout.model";

export interface WorkoutWeekGroup {
  key: string;
  weekStart: Date;
  workouts: Workout[];
}

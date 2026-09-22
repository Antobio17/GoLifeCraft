import { WorkoutExerciseRequest } from "./workout-request.model";

export interface EditWorkoutRequest {
  sessionName: string;
  startedAt: string;
  durationSeconds: number;
  exercises: WorkoutExerciseRequest[];
}

export interface WorkoutSetRequest {
  position: number;
  reps: number;
  weight: number | null;
  done: boolean;
}

export interface WorkoutExerciseRequest {
  exerciseId: string | null;
  exerciseName: string;
  type: string;
  muscleGroups: string[];
  position: number;
  note: string | null;
  sets: WorkoutSetRequest[];
}

export interface StartWorkoutRequest {
  workoutId: string;
  sessionId: string | null;
  sessionName: string;
  exercises: WorkoutExerciseRequest[];
}

export interface WorkoutProgressRequest {
  exercises: WorkoutExerciseRequest[];
  durationSeconds: number;
}

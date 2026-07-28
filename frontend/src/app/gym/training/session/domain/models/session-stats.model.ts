export interface SessionWorkoutStats {
  date: string;
  volumeKg: number;
  reps: number;
  sets: number;
  durationSeconds: number;
}

export interface SessionStats {
  sessionId: string;
  workouts: SessionWorkoutStats[];
}

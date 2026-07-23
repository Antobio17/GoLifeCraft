export interface ExerciseStatsSet {
  reps: number;
  weightKg: number;
}

export interface ExerciseStatsSession {
  date: string;
  maxWeightKg: number;
  estimatedOneRepMaxKg: number;
  volumeKg: number;
  sets: ExerciseStatsSet[];
}

export interface ExerciseStats {
  exerciseId: string;
  sessions: ExerciseStatsSession[];
}

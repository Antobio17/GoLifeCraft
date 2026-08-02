export interface TrainingDay {
  date: string;
  workouts: number;
  volumeKg: number;
  minutes: number;
}

export interface MuscleDistribution {
  muscleGroup: string;
  sets: number;
}

export interface VolumePoint {
  name: string;
  volumeKg: number;
}

export interface GymStats {
  totalSessions: number;
  totalExercises: number;
  totalSets: number;
  totalVolumeKg: number;
  totalPlannedMinutes: number;
  trainingDays: TrainingDay[];
  muscleDistribution: MuscleDistribution[];
  volumeProgression: VolumePoint[];
}

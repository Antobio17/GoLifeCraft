export interface SessionVolume {
  id: string;
  name: string;
  exerciseCount: number;
  volumeKg: number;
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
  sessionVolumes: SessionVolume[];
  muscleDistribution: MuscleDistribution[];
  volumeProgression: VolumePoint[];
}

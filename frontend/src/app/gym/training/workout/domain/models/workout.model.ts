export interface WorkoutListAttributes {
  sessionId: string | null;
  sessionName: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationSeconds: number;
  exerciseCount: number;
  totalSets: number;
  completedSets: number;
  muscleGroups: string[];
}

export interface Workout {
  id: string;
  type: string;
  attributes: WorkoutListAttributes;
}

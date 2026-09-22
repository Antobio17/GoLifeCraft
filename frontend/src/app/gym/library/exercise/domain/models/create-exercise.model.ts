export interface CreateExerciseRequest {
  name: string;
  type: string;
  weightMode: string;
  muscleGroups: string[];
  icon: string | null;
}

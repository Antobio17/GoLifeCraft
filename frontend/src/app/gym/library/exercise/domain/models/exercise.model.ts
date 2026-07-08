export interface ExerciseAttributes {
  name: string;
  description: string | null;
  type: string;
  muscleGroups: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Exercise {
  id: string;
  type: string;
  attributes: ExerciseAttributes;
}

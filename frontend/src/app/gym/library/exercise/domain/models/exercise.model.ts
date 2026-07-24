export interface ExerciseAttributes {
  name: string;
  description: string | null;
  type: string;
  muscleGroups: string[];
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exercise {
  id: string;
  type: string;
  attributes: ExerciseAttributes;
}

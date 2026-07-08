export interface SessionListAttributes {
  name: string;
  estimatedDurationMinutes: number;
  exerciseCount: number;
  muscleGroups: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Session {
  id: string;
  type: string;
  attributes: SessionListAttributes;
}

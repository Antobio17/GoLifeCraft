import { DsIconName } from "@shared/design-system/icon/domain/models/icon.model";
import { Exercise } from "./exercise.model";

export interface ExerciseRowView {
  id: string;
  name: string;
  muscleText: string;
  tags: string[];
  icon: DsIconName;
  editAriaLabel: string;
  deleteAriaLabel: string;
  exercise: Exercise;
}

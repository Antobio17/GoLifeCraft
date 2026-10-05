import { ExerciseRowView } from "./exercise-row-view.model";

export interface ExerciseGroupView {
  muscle: string;
  countLabel: string;
  rows: ExerciseRowView[];
}

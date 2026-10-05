import { SetRowView } from "@gym/training/session/domain/models/set-row-view.model";
import { WorkoutSetView } from "./workout-detail.model";

export interface WorkoutExercisePanelView {
  id: string;
  name: string;
  muscleLabel: string;
  summaryLabel: string;
  loadLabel: string;
  progressLabel: string;
  expanded: boolean;
  note: string | null;
  sets: SetRowView<WorkoutSetView>[];
}

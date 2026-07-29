export type MacroGoalTone = "protein" | "fat" | "carbs";

export interface MacroGoal {
  label: string;
  valueLabel: string;
  goalLabel: string;
  percent: number;
  overPercent: number;
  overLabel: string;
  tone: MacroGoalTone;
}

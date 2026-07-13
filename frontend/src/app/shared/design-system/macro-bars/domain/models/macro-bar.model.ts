export type MacroTone = "protein" | "fat" | "carbs";

export interface MacroBar {
  label: string;
  value: string | number;
  tone: MacroTone;
}

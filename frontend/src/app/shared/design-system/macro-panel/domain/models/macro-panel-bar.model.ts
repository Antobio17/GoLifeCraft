export type MacroPanelTone = "protein" | "fat" | "carbs";

export interface MacroPanelBar {
  label: string;
  value: string;
  percent: number;
  tone: MacroPanelTone;
}

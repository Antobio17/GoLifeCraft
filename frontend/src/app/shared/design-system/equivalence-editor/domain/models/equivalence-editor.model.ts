export interface EquivalenceLine {
  unit: string;
  quantity: number | null;
}

export interface EquivalenceEditorValue {
  baseUnit: string;
  recipeUnit: string;
  diaryUnit: string;
  packUnit: string | null;
  equivalences: EquivalenceLine[];
}

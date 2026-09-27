export interface EquivalenceLine {
  unit: string;
  quantity: number | null;
}

export interface EquivalenceEditorValue {
  baseUnit: string;
  recipeUnit: string;
  diaryUnit: string;
  storageUnit: string;
  packUnit: string | null;
  equivalences: EquivalenceLine[];
}

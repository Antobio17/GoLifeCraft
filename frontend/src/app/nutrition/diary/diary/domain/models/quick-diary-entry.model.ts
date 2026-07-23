export interface QuickDiaryEntryPayload {
  quantity: number;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface CreateQuickDiaryEntryRequest extends QuickDiaryEntryPayload {
  entryDate: string;
  meal: string;
}

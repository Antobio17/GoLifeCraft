export interface CreateDiaryEntryRequest {
  entryDate: string;
  meal: string;
  kind: "product" | "recipe";
  refId: string;
  quantity: number;
}

export interface ProductionIngredientInput {
  kind: "article" | "recipe";
  refId: string;
  quantity: number;
  unit: string | null;
}

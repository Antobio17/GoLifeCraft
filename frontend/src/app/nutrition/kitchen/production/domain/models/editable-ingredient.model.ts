export interface EditableIngredient {
  key: string;
  kind: "article" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  quantity: number;
  unit: string;
}

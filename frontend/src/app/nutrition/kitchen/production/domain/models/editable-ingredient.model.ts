export interface EditableIngredient {
  key: string;
  kind: "article" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  image: string | null;
  quantity: number;
  unit: string;
}

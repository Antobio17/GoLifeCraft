export interface IngredientChoice {
  kind: "article" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  detail: string;
}

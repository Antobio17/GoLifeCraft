export interface IngredientChoice {
  kind: "article" | "recipe";
  refId: string;
  name: string;
  emoji: string;
  image: string | null;
  detail: string;
}

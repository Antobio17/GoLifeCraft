export interface ProductionLotAttributes {
  productionId: string;
  recipeId: string;
  name: string;
  emoji: string;
  code: string | null;
  label: string;
  customized: boolean;
  cookedOn: string;
  servingsCooked: number;
  servingsAssigned: number;
  servingsLeft: number;
}

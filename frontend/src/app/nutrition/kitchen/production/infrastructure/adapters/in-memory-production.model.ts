import { ProductionStatus } from "../../domain/models/production-status.model";

export interface InMemoryProduction {
  id: string;
  recipeId: string;
  cookDate: string;
  status: ProductionStatus;
  servingsCooked: number;
  nameSnapshot: string;
  emojiSnapshot: string;
  cookedAt: string;
}

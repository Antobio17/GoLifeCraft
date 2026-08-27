import { Injectable, inject } from "@angular/core";
import { Observable, defer, delay, of } from "rxjs";
import { UpdateRecipeStockPort } from "../../domain/ports/update-recipe-stock.port";
import { UpdateRecipeStockRequest } from "../../domain/models/update-recipe-stock-request.model";
import { InMemoryKitchenStore } from "./in-memory-kitchen-store";

const LATENCY_MS = 220;

@Injectable()
export class InMemoryUpdateRecipeStockAdapter extends UpdateRecipeStockPort {
  private store = inject(InMemoryKitchenStore);

  updateRecipeStock(
    recipeId: string,
    request: UpdateRecipeStockRequest,
  ): Observable<void> {
    return defer(() => {
      this.store.setStock(recipeId, request.servings);

      return of(undefined);
    }).pipe(delay(LATENCY_MS));
  }
}

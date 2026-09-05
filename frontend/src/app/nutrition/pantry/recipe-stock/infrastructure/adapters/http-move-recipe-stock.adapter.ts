import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { MoveRecipeStockPort } from "../../domain/ports/move-recipe-stock.port";
import { MoveRecipeStockRequest } from "../../domain/models/move-recipe-stock-request.model";

@Injectable()
export class HttpMoveRecipeStockAdapter extends MoveRecipeStockPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/recipe-stock";

  moveRecipeStock(
    recipeId: string,
    request: MoveRecipeStockRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${recipeId}/location`, request);
  }
}

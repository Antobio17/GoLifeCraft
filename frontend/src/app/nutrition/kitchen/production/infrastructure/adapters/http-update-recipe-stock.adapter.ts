import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateRecipeStockPort } from "../../domain/ports/update-recipe-stock.port";
import { UpdateRecipeStockRequest } from "../../domain/models/update-recipe-stock-request.model";

@Injectable()
export class HttpUpdateRecipeStockAdapter extends UpdateRecipeStockPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/recipe-stock";

  updateRecipeStock(
    recipeId: string,
    request: UpdateRecipeStockRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${recipeId}`, request);
  }
}

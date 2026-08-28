import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UpdateRecipeStockPort } from "../../domain/ports/update-recipe-stock.port";

@Injectable()
export class HttpUpdateRecipeStockAdapter extends UpdateRecipeStockPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/pantry/recipe-stock";

  updateRecipeStock(recipeId: string, servings: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${recipeId}`, { servings });
  }
}

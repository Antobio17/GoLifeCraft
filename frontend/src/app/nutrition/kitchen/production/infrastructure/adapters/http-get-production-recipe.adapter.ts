import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { GetProductionRecipePort } from "../../domain/ports/get-production-recipe.port";
import { GetProductionRecipeResponse } from "../../domain/models/get-production-recipe-response.model";

@Injectable()
export class HttpGetProductionRecipeAdapter extends GetProductionRecipePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  getProductionRecipe(
    productionId: string,
    itemId: string,
  ): Observable<GetProductionRecipeResponse> {
    return this.http.get<GetProductionRecipeResponse>(
      `${this.apiUrl}/${productionId}/items/${itemId}`,
    );
  }
}

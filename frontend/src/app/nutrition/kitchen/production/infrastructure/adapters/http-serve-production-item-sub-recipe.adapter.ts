import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ServeProductionItemSubRecipePort } from "../../domain/ports/serve-production-item-sub-recipe.port";
import { ServeProductionItemSubRecipeRequest } from "../../domain/models/serve-production-item-sub-recipe-request.model";

@Injectable()
export class HttpServeProductionItemSubRecipeAdapter extends ServeProductionItemSubRecipePort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  serveProductionItemSubRecipe(
    productionId: string,
    itemId: string,
    subRecipeId: string,
    request: ServeProductionItemSubRecipeRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${productionId}/items/${itemId}/sub-recipes/${subRecipeId}/lot`,
      request,
    );
  }
}

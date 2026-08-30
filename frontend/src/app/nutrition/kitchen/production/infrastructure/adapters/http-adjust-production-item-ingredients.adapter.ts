import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AdjustProductionItemIngredientsPort } from "../../domain/ports/adjust-production-item-ingredients.port";
import { AdjustProductionItemIngredientsRequest } from "../../domain/models/adjust-production-item-ingredients-request.model";

@Injectable()
export class HttpAdjustProductionItemIngredientsAdapter extends AdjustProductionItemIngredientsPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  adjustProductionItemIngredients(
    productionId: string,
    itemId: string,
    request: AdjustProductionItemIngredientsRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${productionId}/items/${itemId}/ingredients`,
      request,
    );
  }

  restoreProductionItemIngredients(
    productionId: string,
    itemId: string,
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${productionId}/items/${itemId}/ingredients/restore`,
      {},
    );
  }
}

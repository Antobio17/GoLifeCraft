import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CookProductionItemPort } from "../../domain/ports/cook-production-item.port";
import { CookProductionItemRequest } from "../../domain/models/cook-production-item-request.model";

@Injectable()
export class HttpCookProductionItemAdapter extends CookProductionItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  cookProductionItem(
    productionId: string,
    itemId: string,
    request: CookProductionItemRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${productionId}/items/${itemId}/cook`,
      request,
    );
  }
}

import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { LabelProductionItemPort } from "../../domain/ports/label-production-item.port";
import { LabelProductionItemRequest } from "../../domain/models/label-production-item-request.model";

@Injectable()
export class HttpLabelProductionItemAdapter extends LabelProductionItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  labelProductionItem(
    productionId: string,
    itemId: string,
    request: LabelProductionItemRequest,
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${productionId}/items/${itemId}/label`,
      request,
    );
  }
}

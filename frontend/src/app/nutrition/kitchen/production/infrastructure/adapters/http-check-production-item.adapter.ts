import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CheckProductionItemPort } from "../../domain/ports/check-production-item.port";

@Injectable()
export class HttpCheckProductionItemAdapter extends CheckProductionItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  checkProductionItem(
    productionId: string,
    itemId: string,
    articleIds: string[],
  ): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${productionId}/items/${itemId}/checks`,
      { articleIds },
    );
  }
}

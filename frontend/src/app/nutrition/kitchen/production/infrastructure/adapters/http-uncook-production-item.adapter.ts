import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { UncookProductionItemPort } from "../../domain/ports/uncook-production-item.port";

@Injectable()
export class HttpUncookProductionItemAdapter extends UncookProductionItemPort {
  private http = inject(HttpClient);

  private readonly apiUrl = "/api/v1/nutrition/kitchen/productions";

  uncookProductionItem(productionId: string, itemId: string): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${productionId}/items/${itemId}/uncook`,
      {},
    );
  }
}

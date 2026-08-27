import { Injectable, inject } from "@angular/core";
import { Observable, defer, delay, of, throwError } from "rxjs";
import { GetProductionPort } from "../../domain/ports/get-production.port";
import { GetProductionResponse } from "../../domain/models/get-production-response.model";
import { InMemoryKitchenStore } from "./in-memory-kitchen-store";

const LATENCY_MS = 160;

@Injectable()
export class InMemoryGetProductionAdapter extends GetProductionPort {
  private store = inject(InMemoryKitchenStore);

  getProduction(id: string): Observable<GetProductionResponse> {
    return defer(() => {
      const production = this.store.production(id);

      if (!production) {
        return throwError(() => new Error("production.not.found"));
      }

      return of({ data: production });
    }).pipe(delay(LATENCY_MS));
  }
}

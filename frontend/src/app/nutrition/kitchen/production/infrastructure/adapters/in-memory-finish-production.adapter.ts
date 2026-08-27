import { Injectable, inject } from "@angular/core";
import { Observable, defer, delay, of } from "rxjs";
import { FinishProductionPort } from "../../domain/ports/finish-production.port";
import { FinishProductionRequest } from "../../domain/models/finish-production-request.model";
import { InMemoryKitchenStore } from "./in-memory-kitchen-store";

const LATENCY_MS = 220;

@Injectable()
export class InMemoryFinishProductionAdapter extends FinishProductionPort {
  private store = inject(InMemoryKitchenStore);

  finishProduction(
    id: string,
    request: FinishProductionRequest,
  ): Observable<void> {
    return defer(() => {
      this.store.finish(id, request.servingsCooked);

      return of(undefined);
    }).pipe(delay(LATENCY_MS));
  }
}

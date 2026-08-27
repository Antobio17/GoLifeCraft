import { Injectable, inject } from "@angular/core";
import { Observable, defer, delay, of } from "rxjs";
import { StartProductionPort } from "../../domain/ports/start-production.port";
import { StartProductionRequest } from "../../domain/models/start-production-request.model";
import { InMemoryKitchenStore } from "./in-memory-kitchen-store";

const LATENCY_MS = 220;

@Injectable()
export class InMemoryStartProductionAdapter extends StartProductionPort {
  private store = inject(InMemoryKitchenStore);

  startProduction(request: StartProductionRequest): Observable<void> {
    return defer(() => {
      this.store.start(request);

      return of(undefined);
    }).pipe(delay(LATENCY_MS));
  }
}

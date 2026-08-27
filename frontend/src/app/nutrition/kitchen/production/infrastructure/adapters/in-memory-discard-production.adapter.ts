import { Injectable, inject } from "@angular/core";
import { Observable, defer, delay, of } from "rxjs";
import { DiscardProductionPort } from "../../domain/ports/discard-production.port";
import { InMemoryKitchenStore } from "./in-memory-kitchen-store";

const LATENCY_MS = 220;

@Injectable()
export class InMemoryDiscardProductionAdapter extends DiscardProductionPort {
  private store = inject(InMemoryKitchenStore);

  discardProduction(id: string): Observable<void> {
    return defer(() => {
      this.store.discard(id);

      return of(undefined);
    }).pipe(delay(LATENCY_MS));
  }
}

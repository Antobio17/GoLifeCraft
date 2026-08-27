import { Injectable, inject } from "@angular/core";
import { Observable, defer, delay, of } from "rxjs";
import { GetKitchenDayPort } from "../../domain/ports/get-kitchen-day.port";
import { GetKitchenDayResponse } from "../../domain/models/get-kitchen-day-response.model";
import { InMemoryKitchenStore } from "./in-memory-kitchen-store";

const LATENCY_MS = 160;

@Injectable()
export class InMemoryGetKitchenDayAdapter extends GetKitchenDayPort {
  private store = inject(InMemoryKitchenStore);

  getKitchenDay(date: string): Observable<GetKitchenDayResponse> {
    return defer(() => of({ data: this.store.day(date) })).pipe(
      delay(LATENCY_MS),
    );
  }
}

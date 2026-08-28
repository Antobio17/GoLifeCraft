import { Observable } from "rxjs";

export abstract class DiscardProductionPort {
  abstract discardProduction(productionId: string): Observable<void>;
}

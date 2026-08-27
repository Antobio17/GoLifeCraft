import { Observable } from "rxjs";

export abstract class DiscardProductionPort {
  abstract discardProduction(id: string): Observable<void>;
}

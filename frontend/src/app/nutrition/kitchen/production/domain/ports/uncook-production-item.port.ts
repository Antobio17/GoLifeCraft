import { Observable } from "rxjs";

export abstract class UncookProductionItemPort {
  abstract uncookProductionItem(
    productionId: string,
    itemId: string,
  ): Observable<void>;
}

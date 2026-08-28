import { Observable } from "rxjs";
import { UncookProductionItemPort } from "../../domain/ports/uncook-production-item.port";

export class UncookProductionItemService {
  constructor(private uncookProductionItemPort: UncookProductionItemPort) {}

  uncookProductionItem(productionId: string, itemId: string): Observable<void> {
    return this.uncookProductionItemPort.uncookProductionItem(
      productionId,
      itemId,
    );
  }
}

import { Observable } from "rxjs";
import { CheckProductionItemPort } from "../../domain/ports/check-production-item.port";

export class CheckProductionItemService {
  constructor(private checkProductionItemPort: CheckProductionItemPort) {}

  checkProductionItem(
    productionId: string,
    itemId: string,
    articleIds: string[],
  ): Observable<void> {
    return this.checkProductionItemPort.checkProductionItem(
      productionId,
      itemId,
      articleIds,
    );
  }
}

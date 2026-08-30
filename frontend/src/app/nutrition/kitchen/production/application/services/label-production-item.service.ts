import { Observable } from "rxjs";
import { LabelProductionItemPort } from "../../domain/ports/label-production-item.port";

export class LabelProductionItemService {
  constructor(private port: LabelProductionItemPort) {}

  labelProductionItem(
    productionId: string,
    itemId: string,
    label: string,
  ): Observable<void> {
    return this.port.labelProductionItem(productionId, itemId, { label });
  }
}

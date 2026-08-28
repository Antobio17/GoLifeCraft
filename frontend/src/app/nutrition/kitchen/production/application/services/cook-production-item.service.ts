import { Observable } from "rxjs";
import { CookProductionItemPort } from "../../domain/ports/cook-production-item.port";
import { CookProductionItemRequest } from "../../domain/models/cook-production-item-request.model";

export class CookProductionItemService {
  constructor(private cookProductionItemPort: CookProductionItemPort) {}

  cookProductionItem(
    productionId: string,
    itemId: string,
    request: CookProductionItemRequest,
  ): Observable<void> {
    return this.cookProductionItemPort.cookProductionItem(
      productionId,
      itemId,
      request,
    );
  }
}

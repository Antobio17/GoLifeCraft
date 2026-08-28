import { Observable } from "rxjs";
import { CookProductionItemRequest } from "../models/cook-production-item-request.model";

export abstract class CookProductionItemPort {
  abstract cookProductionItem(
    productionId: string,
    itemId: string,
    request: CookProductionItemRequest,
  ): Observable<void>;
}

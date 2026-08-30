import { Observable } from "rxjs";
import { LabelProductionItemRequest } from "../models/label-production-item-request.model";

export abstract class LabelProductionItemPort {
  abstract labelProductionItem(
    productionId: string,
    itemId: string,
    request: LabelProductionItemRequest,
  ): Observable<void>;
}

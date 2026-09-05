import { Observable } from "rxjs";
import { CountInventoryLineRequest } from "../models/count-inventory-line-request.model";

export abstract class CountInventoryLinePort {
  abstract countInventoryLine(
    inventoryId: string,
    lineId: string,
    request: CountInventoryLineRequest,
  ): Observable<void>;
}

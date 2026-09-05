import { Observable } from "rxjs";
import { CountInventoryLinePort } from "../../domain/ports/count-inventory-line.port";
import { CountInventoryLineRequest } from "../../domain/models/count-inventory-line-request.model";

export class CountInventoryLineService {
  constructor(private countInventoryLinePort: CountInventoryLinePort) {}

  countInventoryLine(
    inventoryId: string,
    lineId: string,
    request: CountInventoryLineRequest,
  ): Observable<void> {
    return this.countInventoryLinePort.countInventoryLine(
      inventoryId,
      lineId,
      request,
    );
  }
}

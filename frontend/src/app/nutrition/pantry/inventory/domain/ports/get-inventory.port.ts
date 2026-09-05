import { Observable } from "rxjs";
import { GetInventoryResponse } from "../models/get-inventory-response.model";

export abstract class GetInventoryPort {
  abstract getInventory(inventoryId: string): Observable<GetInventoryResponse>;
}

import { Observable } from "rxjs";
import { StartInventoryRequest } from "../models/start-inventory-request.model";

export abstract class StartInventoryPort {
  abstract startInventory(request: StartInventoryRequest): Observable<void>;
}

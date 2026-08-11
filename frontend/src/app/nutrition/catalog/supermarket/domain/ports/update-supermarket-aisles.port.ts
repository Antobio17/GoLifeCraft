import { Observable } from "rxjs";
import { UpdateSupermarketAislesRequest } from "../models/update-supermarket-aisles.model";

export abstract class UpdateSupermarketAislesPort {
  abstract updateSupermarketAisles(
    supermarketId: string,
    request: UpdateSupermarketAislesRequest,
  ): Observable<void>;
}

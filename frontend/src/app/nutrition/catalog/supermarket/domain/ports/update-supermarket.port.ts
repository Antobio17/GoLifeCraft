import { Observable } from "rxjs";
import { UpdateSupermarketRequest } from "../models/update-supermarket.model";

export abstract class UpdateSupermarketPort {
  abstract updateSupermarket(
    id: string,
    request: UpdateSupermarketRequest,
  ): Observable<void>;
}

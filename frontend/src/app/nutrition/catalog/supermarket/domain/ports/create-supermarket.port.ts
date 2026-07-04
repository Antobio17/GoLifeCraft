import { Observable } from "rxjs";
import { CreateSupermarketRequest } from "../models/create-supermarket.model";

export abstract class CreateSupermarketPort {
  abstract createSupermarket(
    request: CreateSupermarketRequest,
  ): Observable<void>;
}

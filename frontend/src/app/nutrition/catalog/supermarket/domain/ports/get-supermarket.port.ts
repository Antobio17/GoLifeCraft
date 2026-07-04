import { Observable } from "rxjs";
import { GetSupermarketResponse } from "../models/get-supermarket-response.model";

export abstract class GetSupermarketPort {
  abstract getSupermarket(id: string): Observable<GetSupermarketResponse>;
}

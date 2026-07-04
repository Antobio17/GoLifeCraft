import { Observable } from "rxjs";
import { GetSupermarketPort } from "../../domain/ports/get-supermarket.port";
import { GetSupermarketResponse } from "../../domain/models/get-supermarket-response.model";

export class GetSupermarketService {
  constructor(private getSupermarketPort: GetSupermarketPort) {}

  getSupermarket(id: string): Observable<GetSupermarketResponse> {
    return this.getSupermarketPort.getSupermarket(id);
  }
}

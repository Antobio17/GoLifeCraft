import { Observable } from "rxjs";
import { UpdateSupermarketPort } from "../../domain/ports/update-supermarket.port";
import { UpdateSupermarketRequest } from "../../domain/models/update-supermarket.model";

export class UpdateSupermarketService {
  constructor(private updateSupermarketPort: UpdateSupermarketPort) {}

  updateSupermarket(
    id: string,
    request: UpdateSupermarketRequest,
  ): Observable<void> {
    return this.updateSupermarketPort.updateSupermarket(id, request);
  }
}

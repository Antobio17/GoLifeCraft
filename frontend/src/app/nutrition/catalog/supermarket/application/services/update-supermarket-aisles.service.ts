import { Observable } from "rxjs";
import { UpdateSupermarketAislesPort } from "../../domain/ports/update-supermarket-aisles.port";
import { UpdateSupermarketAislesRequest } from "../../domain/models/update-supermarket-aisles.model";

export class UpdateSupermarketAislesService {
  constructor(
    private updateSupermarketAislesPort: UpdateSupermarketAislesPort,
  ) {}

  updateSupermarketAisles(
    supermarketId: string,
    request: UpdateSupermarketAislesRequest,
  ): Observable<void> {
    return this.updateSupermarketAislesPort.updateSupermarketAisles(
      supermarketId,
      request,
    );
  }
}

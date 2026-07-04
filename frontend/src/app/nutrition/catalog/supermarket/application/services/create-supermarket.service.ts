import { Observable } from "rxjs";
import { CreateSupermarketPort } from "../../domain/ports/create-supermarket.port";
import { CreateSupermarketRequest } from "../../domain/models/create-supermarket.model";

export class CreateSupermarketService {
  constructor(private createSupermarketPort: CreateSupermarketPort) {}

  createSupermarket(request: CreateSupermarketRequest): Observable<void> {
    return this.createSupermarketPort.createSupermarket(request);
  }
}

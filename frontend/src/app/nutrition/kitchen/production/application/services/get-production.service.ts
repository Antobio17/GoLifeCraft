import { Observable } from "rxjs";
import { GetProductionPort } from "../../domain/ports/get-production.port";
import { GetProductionResponse } from "../../domain/models/get-production-response.model";

export class GetProductionService {
  constructor(private getProductionPort: GetProductionPort) {}

  getProduction(id: string): Observable<GetProductionResponse> {
    return this.getProductionPort.getProduction(id);
  }
}

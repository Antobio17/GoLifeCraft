import { Observable } from "rxjs";
import { FinishProductionPort } from "../../domain/ports/finish-production.port";
import { FinishProductionRequest } from "../../domain/models/finish-production-request.model";

export class FinishProductionService {
  constructor(private finishProductionPort: FinishProductionPort) {}

  finishProduction(
    id: string,
    request: FinishProductionRequest,
  ): Observable<void> {
    return this.finishProductionPort.finishProduction(id, request);
  }
}

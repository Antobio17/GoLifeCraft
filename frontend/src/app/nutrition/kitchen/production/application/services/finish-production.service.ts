import { Observable } from "rxjs";
import { FinishProductionPort } from "../../domain/ports/finish-production.port";

export class FinishProductionService {
  constructor(private finishProductionPort: FinishProductionPort) {}

  finishProduction(productionId: string): Observable<void> {
    return this.finishProductionPort.finishProduction(productionId);
  }
}

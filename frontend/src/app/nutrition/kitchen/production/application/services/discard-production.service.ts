import { Observable } from "rxjs";
import { DiscardProductionPort } from "../../domain/ports/discard-production.port";

export class DiscardProductionService {
  constructor(private discardProductionPort: DiscardProductionPort) {}

  discardProduction(productionId: string): Observable<void> {
    return this.discardProductionPort.discardProduction(productionId);
  }
}

import { Observable } from "rxjs";
import { ReopenProductionPort } from "../../domain/ports/reopen-production.port";

export class ReopenProductionService {
  constructor(private reopenProductionPort: ReopenProductionPort) {}

  reopenProduction(productionId: string): Observable<void> {
    return this.reopenProductionPort.reopenProduction(productionId);
  }
}

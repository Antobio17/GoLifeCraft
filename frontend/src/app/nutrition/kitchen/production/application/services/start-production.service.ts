import { Observable } from "rxjs";
import { StartProductionPort } from "../../domain/ports/start-production.port";
import { StartProductionRequest } from "../../domain/models/start-production-request.model";

export class StartProductionService {
  constructor(private startProductionPort: StartProductionPort) {}

  startProduction(request: StartProductionRequest): Observable<void> {
    return this.startProductionPort.startProduction(request);
  }
}

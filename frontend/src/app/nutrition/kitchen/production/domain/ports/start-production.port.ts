import { Observable } from "rxjs";
import { StartProductionRequest } from "../models/start-production-request.model";

export abstract class StartProductionPort {
  abstract startProduction(request: StartProductionRequest): Observable<void>;
}

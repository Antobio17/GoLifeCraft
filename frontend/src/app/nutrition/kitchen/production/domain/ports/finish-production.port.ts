import { Observable } from "rxjs";
import { FinishProductionRequest } from "../models/finish-production-request.model";

export abstract class FinishProductionPort {
  abstract finishProduction(
    id: string,
    request: FinishProductionRequest,
  ): Observable<void>;
}

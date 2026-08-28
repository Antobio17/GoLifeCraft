import { Observable } from "rxjs";

export abstract class FinishProductionPort {
  abstract finishProduction(productionId: string): Observable<void>;
}

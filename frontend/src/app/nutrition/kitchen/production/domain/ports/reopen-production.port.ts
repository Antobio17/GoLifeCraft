import { Observable } from "rxjs";

export abstract class ReopenProductionPort {
  abstract reopenProduction(productionId: string): Observable<void>;
}
